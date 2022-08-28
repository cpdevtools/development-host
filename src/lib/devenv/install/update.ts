import { GlobalInstallerService } from "@cpdevtools/lib-node-utilities";

GlobalInstallerService.scanDir(new URL("../../_install_data_/installers", import.meta.url).toString());

export async function updateSelf() {
  await GlobalInstallerService.update((await import("../../_install_data_/lists/self-update.list.js")).default);
}

export async function updateHost() {
  // await exec(`npm i -g @cpdevtools/development-host@latest`);
}

export async function updateApplications() {
  // await exec(`npm i -g @cpdevtools/development-host@latest`);
}

export async function updateCore(): Promise<void> {
  await GlobalInstallerService.update((await import("../../_install_data_/lists/core-update.list.js")).default);
}

export async function installOrUpdateCore(): Promise<void> {
  await GlobalInstallerService.installOrUpdate((await import("../../_install_data_/lists/core-update.list.js")).default);
}
