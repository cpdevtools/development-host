import {
  exec,
  FileDownload,
  installWSL,
  isWslDistroInstalled,
  isWslInstalled,
  rebootWindows,
  removeRunOnceAfterRestart,
  runOnceAfterRestart,
  updateWSL,
} from "@cpdevtools/lib-node-utilities";
import chalk from "chalk";

import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import ini from "ini";
import inquirer from "inquirer";
import Zip from "node-stream-zip";
import path from "path";
import { exit } from "process";

import sha256File from "sha256-file";

const INSTALL_NAME = "DevelopmentContainerHost";
const INSTALL_TEMP_DIR = ".temp";
const INSTALL_DIR = "install";
const INSTALL_UBUNTU_URL = "https://wslstorestorage.blob.core.windows.net/wslblob/Ubuntu2204-220620.AppxBundle";
const INSTALL_UBUNTU_SHA = "dd60bd853d15fbd14480e5d4e3c53d8b14710a43eb45f82558201a3dcdfe51b1";
const INSTALL_UBUNTU_DOWNLOAD_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.bundle.zip");
const INSTALL_UBUNTU_X86_DEST_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.x86.zip");
const INSTALL_UBUNTU_X86_SOURCE_FILE = "Ubuntu_2204.0.10.0_x64.appx";
const INSTALL_UBUNTU_INSTALL_FILE = path.join(INSTALL_DIR, "install.tar.gz");

type Task = () => void | boolean | Promise<void | boolean>;

async function runTasks(tasks: Task[]) {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const restart = await task();
    await runOnceAfterRestart(INSTALL_NAME, `devhost install -r ${i + 1}`);
    // tasks optionally return a boolean that determines restart behavior
    // if true then prompt to reboot, on Y reboot, on N exit process
    // if false then reboot without prompt
    // otherwise continue to next task
    if (typeof restart === "boolean") {
      // strangeness with return type
      await (restart === true ? rebootWindows(restart) : rebootWindows(restart));
      exit(0);
    }
  }
  await removeRunOnceAfterRestart(INSTALL_NAME);
}

export async function installOnWindows(resumeOn: number = 0) {
  const tasks: Task[] = [
    async () => {
      if (!(await isWslInstalled())) {
        console.info(chalk.cyan(`Installing WSL...`));
        await installWSL();
        console.info(chalk.cyan(`Installed WSL.`));
        return true;
      }
    },
    async () => {
      console.info(chalk.cyan(`Updating WSL...`));
      await updateWSL();
      console.info(chalk.cyan(`Updated WSL.`));
    },
    async () => {
      if (!(await isContainerHostInstalled())) {
        console.info(chalk.cyan(`Installing Ubuntu...`));
        await installUbuntuWsl();
        console.info(chalk.cyan(`Installed Ubuntu.`));
      }
    },
  ];

  console.info(chalk.cyan(`Installing ${INSTALL_NAME} on Windows...`));
  await runTasks(tasks.slice(resumeOn));
  console.info(chalk.green(`Installed ${INSTALL_NAME} on Windows.`));
}

async function isContainerHostInstalled() {
  return await isWslDistroInstalled(INSTALL_NAME);
}

async function installUbuntuWsl() {
  let answers: any = await inquirer.prompt({
    type: "input",
    name: "dir",
    message: "Install Directory?",
    default: `C:\\ProgramData\\${INSTALL_NAME}`,
  });
  const dir = answers.dir || `C:\\ProgramData\\${INSTALL_NAME}`;
  await mkdir(dir, { recursive: true });

  console.info(chalk.bgBlueBright(`Downloading Ubuntu...`));
  await downloadUbuntuWsl(dir);
  console.info(chalk.bgBlueBright(`Downloaded Ubuntu.`));

  console.info(chalk.bgBlueBright(`Initializing Ubuntu...`));
  await exec(`wsl.exe --import ${INSTALL_NAME} ${dir} ${path.join(dir, "install", "install.tar.gz")} `);
  await setupUsername();
  console.info(chalk.bgBlueBright(`Initialized Ubuntu.`));
}

async function setupUsername() {
  console.info(chalk.bgBlueBright(`Create ubuntu user:`));
  let username: string = "";
  while (!username) {
    const answers = await inquirer.prompt({
      type: "input",
      name: "username",
      message: "Username?",
    });
    username = answers.username;
  }

  console.info(chalk.bgBlueBright(`Adding user ${username}...`));
  await exec(`wsl.exe -d ${INSTALL_NAME} --cd ~ bash -ic "adduser ${username} && usermod -aG sudo ${username}"`);

  const confPath = `\\\\wsl.localhost\\${INSTALL_NAME}\\etc\\wsl.conf`;
  let conf: any = {
    user: {
      default: username,
    },
  };
  if (existsSync(confPath)) {
    conf = ini.parse(await readFile(confPath, { encoding: "utf-8" }));
    conf.user ??= {};
    conf.user.default = username;
  }
  await writeFile(confPath, ini.stringify(conf), { encoding: "utf-8" });
  console.info(chalk.bgBlueBright(`Added user ${username}.`));
}

async function downloadUbuntuWsl(dir: string) {
  const installDir = path.join(dir, INSTALL_DIR);
  const ubuntuInstallFile = path.join(dir, INSTALL_UBUNTU_INSTALL_FILE);

  if (!existsSync(ubuntuInstallFile)) {
    const tmpDir = path.join(dir, INSTALL_TEMP_DIR);
    try {
      await mkdir(tmpDir, { recursive: true });
      await mkdir(installDir, { recursive: true });

      const ubuntuDownloadFile = path.join(dir, INSTALL_UBUNTU_DOWNLOAD_FILE);

      let download = true;

      if (existsSync(ubuntuDownloadFile)) {
        download = false;
        const check = await new Promise<string>((res, rej) =>
          sha256File(ubuntuDownloadFile, (error, check) => (error ? rej(error) : res(check!)))
        );
        if (check !== INSTALL_UBUNTU_SHA) {
          download = true;
        }
      }

      if (download) {
        const dl = new FileDownload(INSTALL_UBUNTU_URL, ubuntuDownloadFile);
        await dl.download(true);

        const check = await new Promise<string>((res, rej) =>
          sha256File(ubuntuDownloadFile, (error, check) => (error ? rej(error) : res(check!)))
        );
        if (check !== INSTALL_UBUNTU_SHA) {
          throw new Error(`'${ubuntuDownloadFile}' failed to match checksum '${INSTALL_UBUNTU_SHA}'. Was '${check}'`);
        }
      }

      await extractUbuntu(dir);
    } finally {
      //await rm(tmpDir, { force: true, recursive: true });
    }
  }
}

async function extractUbuntu(dir: string) {
  const tmpDir = path.join(dir, INSTALL_TEMP_DIR);
  const installDir = path.join(dir, INSTALL_DIR);

  const ubuntuDownloadFile = path.join(dir, INSTALL_UBUNTU_DOWNLOAD_FILE);

  const extractPath = path.join(dir, INSTALL_UBUNTU_X86_DEST_FILE);

  await extractUbuntuOuter(ubuntuDownloadFile, extractPath);

  await extractUbuntuInner(extractPath, installDir);
}

function extractUbuntuOuter(ubuntuDownloadFile: string, extractPath: string) {
  return new Promise<void>((res, rej) => {
    const zip = new Zip({
      file: ubuntuDownloadFile,
      storeEntries: true,
    });
    zip.on("error", function (err) {
      console.error("[ERROR]", err);
      rej(err);
    });
    zip.on("entry", function (entry) {
      if (entry.name === INSTALL_UBUNTU_X86_SOURCE_FILE) {
        console.info(`Extracting '${INSTALL_UBUNTU_X86_SOURCE_FILE}'...`);
        zip.extract(entry, extractPath, (err, r) => {
          if (!err) {
            console.info(`Extracted '${INSTALL_UBUNTU_X86_SOURCE_FILE}'.`);
            res();
          } else {
            rej(err);
          }
        });
      }
    });
  });
}
function extractUbuntuInner(ubuntuZipPath: string, installDir: string) {
  return new Promise<void>((res, rej) => {
    const zip = new Zip({
      file: ubuntuZipPath,
      storeEntries: true,
    });
    zip.on("error", function (err) {
      console.error("[ERROR]", err);
      rej(err);
    });
    let count = zip.entriesCount;

    zip.on("entry", async function (entry) {
      console.info(`Extracting '${entry.name}'...`);
      const ePath = path.normalize(path.join(installDir, entry.name));
      if (ePath.startsWith(installDir)) {
        if (entry.isFile) {
          await mkdir(path.dirname(ePath), { recursive: true });
          zip.extract(entry, ePath, (err, r) => {
            count--;
            if (!err) {
              console.info(`Extracted '${ePath}'.`);
            } else {
              console.error(err);
            }
            if (count === 0) {
              res();
            }
          });
        }
      }
    });
  });
}
