import {
  FileDownload,
  installWSL,
  isWslDistroInstalled,
  isWslInstalled,
  rebootWindows,
  removeRunOnceAfterRestart,
  runOnceAfterRestart,
  updateWSL,
} from "@cpdevtools/lib-node-utilities";
import { exit } from "process";

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
  await downloadUbuntuWsl();
}

async function downloadUbuntuWsl() {
  const dl = new FileDownload(
    "https://wslstorestorage.blob.core.windows.net/wslblob/Ubuntu2204-220620.AppxBundle",
    "%temp%Ubuntu2204-220620.AppxBundle.zip"
  );
  await dl.download(true);
}
