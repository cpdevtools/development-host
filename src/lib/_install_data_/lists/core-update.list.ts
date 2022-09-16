import { InstallItem } from "@cpdevtools/lib-node-utilities";
import DockerInstaller from "../installers/docker.installer";
import VSCodeInstaller from "../installers/vscode.installer";
import GitHubCliInstaller from "../installers/gh-cli.installer";

export default [{ id: DockerInstaller.id }, { id: VSCodeInstaller.id }, { id: GitHubCliInstaller.id }] as InstallItem[];
