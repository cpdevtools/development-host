import {
  getWslVersion,
  installWSL,
  installWSLKernelUpdate,
  isWslInstalled,
  rebootWindows,
  runOnceAfterRestart,
  updateWSL,
} from "@cpdevtools/lib-node-utilities";
import { writeFile } from "fs/promises";
import path from "path";

export async function installOnWindows() {
  await _installWsl();
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
  }
}
