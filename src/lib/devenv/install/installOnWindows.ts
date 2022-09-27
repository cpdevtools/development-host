import {
  exec,
  FileDownload,
  getWslVersion,
  importInquirer,
  installWSL,
  installWSLKernelUpdate,
  isInstalledWsl,
  isValidInstallFile,
  isWslDistroInstalled,
  isWslInstalled,
  rebootWindows,
  runOnceAfterRestart,
  updateWSL,
  wingetInfo,
} from "@cpdevtools/lib-node-utilities";
import { existsSync } from "fs";
import { mkdir, readFile, writeFile } from "fs/promises";
import ini from "ini";
import Zip from "node-stream-zip";
import path from "path";
import { subTaskFooter, subTaskHeader } from "../ui/headers";
import {
  INSTALL_DIR,
  INSTALL_ID,
  INSTALL_NAME,
  INSTALL_TEMP_DIR,
  INSTALL_UBUNTU_DOWNLOAD_FILE,
  INSTALL_UBUNTU_INSTALL_FILE,
  INSTALL_UBUNTU_X86_DEST_FILE,
  INSTALL_UBUNTU_X86_SOURCE_FILE,
} from "./constants";

export async function installOnWindows() {
  await _installVsCode();
  await _installWsl();
}

async function _installVsCode() {
  if (!(await isInstalledWsl("Microsoft.VisualStudioCode"))) {
    await exec("winget.exe install -e  --scope machine --id Microsoft.VisualStudioCode");
  }
}

async function _installWsl() {
  const isInstalled = await isWslInstalled();
  if (!isInstalled) {
    if (await installWSL()) {
      const p = path.join(process.env["temp"] ?? "", "resumeInstall.cmd");
      await writeFile(p, "devhost install", { encoding: "utf-8" });
      await runOnceAfterRestart("CpDevToolDCHInstall", p);
      await rebootWindows(true);
    }
  } else {
    const ver = await getWslVersion();
    if (ver!.major === 1) {
      // update kernel
      await installWSLKernelUpdate();
    } else if (ver!.compare("5.10.102") < 0) {
      // update
      await updateWSL();
    }

    if (!(await _isContainerHostInstalled())) {
      await _installUbuntuWsl();
    }
    await _installCliOnLinux();
  }
}

async function _isContainerHostInstalled() {
  return await isWslDistroInstalled(INSTALL_NAME);
}

async function _installUbuntuWsl() {
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
  await _downloadUbuntuWsl(dir);
  subTaskFooter(`Downloaded Ubuntu.`);

  subTaskHeader(`Initializing Ubuntu...`);
  await exec(`wsl.exe --import ${INSTALL_NAME} ${dir} ${path.join(dir, "install", "install.tar.gz")} `);
  await _setupUser();
  subTaskFooter(`Initialized Ubuntu.`);
}

async function _installCliOnLinux() {
  await exec(
    `wsl.exe -d ${INSTALL_NAME} --cd ~ bash -ic "curl https://raw.githubusercontent.com/cpdevtools/development-host/main/install/linux/install.sh | bash"`
  );
}

async function _setupUser() {
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

async function _downloadUbuntuWsl(dir: string) {
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
  return new Promise<void>(async (res, rej) => {
    const zip = new Zip({
      file: ubuntuZipPath,
      storeEntries: true,
    });
    zip.on("error", function (err) {
      console.error("[ERROR]", err);
      rej(err);
    });

    const p: Promise<any>[] = [];
    zip.on("entry", async function (entry) {
      console.info(`Extracting '${entry.name}'...`);
      const ePath = path.normalize(path.join(installDir, entry.name));
      if (ePath.startsWith(installDir)) {
        if (entry.isFile) {
          await mkdir(path.dirname(ePath), { recursive: true });
          p.push(
            new Promise<void>((resolve, reject) => {
              zip.extract(entry, ePath, (err, r) => {
                if (err) {
                  reject(err);
                } else {
                  console.info(`Extracted '${entry.name}'`);
                  resolve();
                }
              });
            })
          );
        }
      }
    });
    await Promise.all(p);
    console.info(`Done`);
    res();
  });
}
