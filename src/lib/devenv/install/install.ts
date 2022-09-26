import {
  exec,
  FileDownload,
  importChalk,
  importInquirer,
  installWSL,
  isApplicationRunning,
  isDockerDesktopRunning,
  isValidInstallFile,
  isWslDistroInstalled,
  isWslInstalled,
  killDockerDesktop,
  rebootWindows,
  removeRunOnceAfterRestart,
  runOnceAfterRestart,
  startDockerDesktop,
  updateWSL,
  wingetInfo,
} from "@cpdevtools/lib-node-utilities";

import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import ini from "ini";
import Zip from "node-stream-zip";
import path from "path";
import { exit } from "process";

import { promptConfig } from "../config";
import { onStartup } from "../startup/startup";
import { applicationFooter, applicationHeader, subTaskFooter, subTaskHeader, taskFooter, taskHeader } from "../ui/headers";
import { installOrUpdateCore } from "./update";

export const INSTALL_NAME = "DevelopmentContainerHost";
const INSTALL_TEMP_DIR = ".temp";
const INSTALL_DIR = "install";
const INSTALL_ID = "Canonical.Ubuntu.2204";
const INSTALL_UBUNTU_DOWNLOAD_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.bundle.zip");
const INSTALL_UBUNTU_X86_DEST_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.x86.zip");
const INSTALL_UBUNTU_X86_SOURCE_FILE = /Ubuntu_2204\..*?_x64\.appx/;
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
  const chalk = await importChalk();
  const inquirer = await importInquirer();

  const tasks: Task[] = [
    async () => {
      const warnDD = await isDockerDesktopRunning();
      const warnWsl = await isWslInstalled();
      const warnVsCode = await isApplicationRunning("Code.exe");
      const warnAny = warnDD || warnWsl || warnVsCode;

      let msgs = [`Installing ${chalk.cyan(`Development Container Host`)}\n`];

      if (warnDD) {
        msgs.push(`${chalk.yellow(`Warning:`)} ${chalk.cyan(`WSL`)} will be restarted/updated during install.`);
      }
      if (warnWsl) {
        msgs.push(`${chalk.yellow(`Warning:`)} ${chalk.cyan(`Docker Desktop`)} will be restarted/updated during install.`);
      }
      if (warnVsCode) {
        msgs.push(`${chalk.yellow(`Warning:`)} ${chalk.cyan(`VS Code`)} will loose connections to docker, wsl & dev containers.`);
      }
      if (warnAny) {
        msgs.push(`Make sure you won't loose any work.`);
      }
      applicationHeader(msgs.join("\n"), warnAny ? "warn" : "");
      if (warnAny) {
        const answers = await inquirer.prompt({
          type: "confirm",
          name: "continue",
          message: "Continue?",
          default: true,
        });
        if (answers.continue !== true) {
          exit();
        }
      }
      await killDockerDesktop();

      if (!(await isWslInstalled())) {
        taskHeader(`Installing WSL...`);
        await installWSL();
        taskFooter(`Installed WSL`);
        return true;
      }
    },
    async () => {
      taskHeader(`Updating WSL`);
      await updateWSL();
      taskFooter(`Updated WSL`);
    },
    async () => {
      const isHostInstalled = await isContainerHostInstalled();
      if (!isHostInstalled) {
        taskHeader(`Installing Ubuntu`);
        await installUbuntuWsl();
        taskFooter(`Installed Ubuntu`);
      }
    },
    async () => {
      taskHeader(`Installing ${INSTALL_NAME} cli`);
      await installCliOnLinux();
      taskFooter(`Installed ${INSTALL_NAME} cli`);
      await startDockerDesktop();
    },
  ];

  await runTasks(tasks.slice(resumeOn));
  applicationFooter(`Finished Installing ${INSTALL_NAME} on Windows`);
}

async function installCliOnLinux() {
  await exec(
    `wsl.exe -d ${INSTALL_NAME} --cd ~ bash -ic "curl https://raw.githubusercontent.com/cpdevtools/development-host/main/install/linux/install.sh | bash"`
  );
}

async function isContainerHostInstalled() {
  return await isWslDistroInstalled(INSTALL_NAME);
}

async function installUbuntuWsl() {
  const inquirer = await importInquirer();

  let answers: any = await inquirer.prompt({
    type: "input",
    name: "dir",
    message: "Install Directory?",
    default: `C:\\ProgramData\\${INSTALL_NAME}`,
  });
  const dir = answers.dir || `C:\\ProgramData\\${INSTALL_NAME}`;
  await mkdir(dir, { recursive: true });

  subTaskHeader(`Downloading Ubuntu...`);
  await downloadUbuntuWsl(dir);
  subTaskFooter(`Downloaded Ubuntu.`);

  subTaskHeader(`Initializing Ubuntu...`);
  await exec(`wsl.exe --import ${INSTALL_NAME} ${dir} ${path.join(dir, "install", "install.tar.gz")} `);
  await setupUser();
  subTaskFooter(`Initialized Ubuntu.`);
}

async function setupUser() {
  const inquirer = await importInquirer();

  let username: string = "";
  while (!username) {
    const answers = await inquirer.prompt({
      type: "input",
      name: "username",
      message: "Username?",
    });
    username = answers.username;
  }

  subTaskHeader(`Adding user ${username}`);
  await exec(
    `wsl.exe -d ${INSTALL_NAME} --cd ~ bash -ic "adduser ${username} && usermod -aG sudo ${username} && usermod -aG docker ${username}"`
  );

  const confPath = `\\\\wsl.localhost\\${INSTALL_NAME}\\etc\\wsl.conf`;
  let conf: any = {
    user: {
      default: username,
    },
    boot: {
      command: "devhost onstart",
    },
  };
  if (existsSync(confPath)) {
    conf = ini.parse(await readFile(confPath, { encoding: "utf-8" }));
    conf.user ??= {};
    conf.user.default = username;

    conf.boot ??= {};
    conf.boot.command = "devhost onstart";
  }
  await writeFile(confPath, ini.stringify(conf).replace(/\r\n/g, "\n"), { encoding: "utf-8" });
  subTaskFooter(`Added user ${username}`);
  await exec(`wsl.exe -t ${INSTALL_NAME}`);
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

      if (!(await isValidInstallFile(ubuntuDownloadFile, INSTALL_ID))) {
        const info = await wingetInfo(INSTALL_ID);
        const dl = new FileDownload(info.installer.downloadUrl, ubuntuDownloadFile);
        await dl.download(true);
        if (!(await isValidInstallFile(ubuntuDownloadFile, INSTALL_ID))) {
          throw new Error(`'${ubuntuDownloadFile}' failed to match checksum '${info.installer.SHA256}'.`);
        }
      }
      await extractUbuntu(dir);
      console.info("Ubuntu extracted.");
    } finally {
      //await rm(tmpDir, { force: true, recursive: true });
    }
  }
}

async function extractUbuntu(dir: string) {
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
      if (INSTALL_UBUNTU_X86_SOURCE_FILE.test(entry.name)) {
        console.info(`Extracting '${entry.name}'...`);
        zip.extract(entry, extractPath, (err, r) => {
          if (!err) {
            console.info(`Extracted '${entry.name}'`);
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
              console.info(`Extracted '${entry.name}'`);
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

export async function install() {
  await installOrUpdateCore();
  await promptConfig(true);
  await onStartup();
}
