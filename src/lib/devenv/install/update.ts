import { exec, GlobalInstallerService } from "@cpdevtools/lib-node-utilities";
import path from "path";

GlobalInstallerService.scanDir(path.join(__dirname, "../../_install_data_/installers"));

export async function updateSelf() {
  await exec(`npm i -g @cpdevtools/development-host@latest`);
}

export async function updateHost() {
  // await exec(`npm i -g @cpdevtools/development-host@latest`);
}

export async function updateApplications() {
  // await exec(`npm i -g @cpdevtools/development-host@latest`);
}

export async function updateCore(): Promise<void> {
  await GlobalInstallerService.update((await import("../../_install_data_/lists/core.list")).default);
}

export async function installOrUpdateCore(): Promise<void> {
  await GlobalInstallerService.installOrUpdate((await import("../../_install_data_/lists/core.list")).default);
}

export async function uninstallCore(): Promise<void> {
  await GlobalInstallerService.uninstall((await import("../../_install_data_/lists/core.list")).default);
}
