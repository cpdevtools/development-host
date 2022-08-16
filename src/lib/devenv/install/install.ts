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

import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import ini from "ini";
import inquirer from "inquirer";
import Zip from "node-stream-zip";
import path from "path";
import { exit } from "process";

const INSTALL_TEMP_DIR = ".temp";
const INSTALL_DIR = "install";
const INSTALL_UBUNTU_URL = "https://wslstorestorage.blob.core.windows.net/wslblob/Ubuntu2204-220620.AppxBundle";
const INSTALL_UBUNTU_DOWNLOAD_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.bundle.zip");
const INSTALL_UBUNTU_X86_DEST_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.x86.zip");
const INSTALL_UBUNTU_X86_SOURCE_FILE = "Ubuntu_2204.0.10.0_x64.appx";
const INSTALL_UBUNTU_INSTALL_FILE = path.join(INSTALL_DIR, "install.tar.gz");

type Task = () => void | boolean | Promise<void | boolean>;

async function runTasks(tasks: Task[]) {
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    const restart = await task();
    await runOnceAfterRestart("DevelopmentHostInstaller", `devhost install -r ${i + 1}`);
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
  await removeRunOnceAfterRestart("DevelopmentHostInstaller");
}

export async function installOnWindows(resumeOn: number = 0) {
  const tasks: Task[] = [
    async () => {
      if (!(await isWslInstalled())) {
        await installWSL();
        return true;
      }
    },
    async () => {
      await updateWSL();
    },
    async () => {
      console.log("Install Ubuntu");
      if (!(await isContainerHostInstalled())) {
        await installUbuntuWsl();
      }
    },
  ];

  await runTasks(tasks.slice(resumeOn));
}

async function isContainerHostInstalled() {
  return await isWslDistroInstalled("DevelopmentContainerHost");
}

async function installUbuntuWsl() {
  let answers: any = await inquirer.prompt({
    type: "input",
    name: "dir",
    message: "Install Directory?",
    default: "C:\\ProgramData\\DevelopmentContainerHost",
  });
  const dir = answers.dir || "C:\\ProgramData\\DevelopmentContainerHost";
  await mkdir(dir, { recursive: true });
  await downloadUbuntuWsl(dir);
  await exec(`wsl.exe --import DevelopmentContainerHost ${path.join(dir, "install", "install.tar.gz")} ${dir}`);

  answers = {};
  while (!answers.username) {
    answers = await inquirer.prompt({
      type: "input",
      name: "username",
      message: "username?",
    });
  }

  await setupUsername(answers.username);
}

async function setupUsername(username: string) {
  await exec(`wsl.exe -d DevlopmentContainerHost --cd ~ bash -ic "adduser ${username} && usermod -aG sudo ${username}"`);

  const confPath = "\\\\wsl.localhost\\DevlopmentContainerHost\\etc\\wsl.conf";
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
      if (!existsSync(ubuntuDownloadFile)) {
        // TEMP or checksum needed
        const dl = new FileDownload(INSTALL_UBUNTU_URL, ubuntuDownloadFile);
        await dl.download(true);
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
