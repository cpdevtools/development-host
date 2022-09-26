import { installWSL, isWslInstalled, rebootWindows, runOnceAfterRestart } from "@cpdevtools/lib-node-utilities";
import { writeFile } from "fs/promises";
import path from "path";

export async function installOnWindows() {
  await _installWsl();
}

async function _installWsl() {
  const isInstalled = await isWslInstalled();
  if (!isInstalled) {
    console.log("Installing wsl");
    if (await installWSL()) {
      const p = path.join(process.env["temp"] ?? "", "resumeInstall.cmd");
      await writeFile(p, "devhost install", { encoding: "utf-8" });
      await runOnceAfterRestart("CpDevToolDCHInstall", p);
      await rebootWindows(true);
    }
  } else {
    console.log("wsl installed");
  }
}
