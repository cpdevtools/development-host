import { GlobalInstallerService } from "@cpdevtools/lib-node-utilities";
import path from "path";

GlobalInstallerService.scanDir(path.join(__dirname, "../../_install_data_/installers"));

export async function updateSelf() {
  await GlobalInstallerService.update(require("../../_install_data_/lists/self-update.list").default);
}

export async function updateHost() {
  // await exec(`npm i -g @cpdevtools/development-host@latest`);
}

export async function updateApplications() {
  // await exec(`npm i -g @cpdevtools/development-host@latest`);
}

export async function updateCore(): Promise<void> {
  await GlobalInstallerService.update(require("../../_install_data_/lists/core-update.list.js").default);
}

export async function installOrUpdateCore(): Promise<void> {
  await GlobalInstallerService.installOrUpdate(require("../../_install_data_/lists/core-update.list.js").default);
}
