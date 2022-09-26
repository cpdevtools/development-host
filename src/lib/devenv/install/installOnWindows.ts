import { installWSL, isWslInstalled, rebootWindows, runOnceAfterRestart } from "@cpdevtools/lib-node-utilities";

export async function installOnWindows() {
  await _installWsl();
}

async function _installWsl() {
  const isInstalled = await isWslInstalled();
  if (!isInstalled) {
    console.log("Installing wsl");
    if (await installWSL()) {
      await runOnceAfterRestart("CpDevToolDCHInstall", "devhost install");
      await rebootWindows(true);
    }
  } else {
    console.log("wsl installed");
  }
}
