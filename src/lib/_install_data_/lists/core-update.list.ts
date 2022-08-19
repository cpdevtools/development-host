import { InstallItem } from "@cpdevtools/lib-node-utilities";
import DockerInstaller from "../installers/docker.installer";
import VSCodeInstaller from "../installers/vscode.installer";

export default [{ id: DockerInstaller.id }, { id: VSCodeInstaller.id }] as InstallItem[];
