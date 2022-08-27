import { InstallItem } from "@cpdevtools/lib-node-utilities";
import DockerInstaller from "../installers/docker.installer.js";
import VSCodeInstaller from "../installers/vscode.installer.js";

export default [{ id: DockerInstaller.id }, { id: VSCodeInstaller.id }] as InstallItem[];
