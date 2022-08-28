import { InstallItem } from "@cpdevtools/lib-node-utilities";
import DevHostCliInstaller from "../installers/devhost-cli.installer.js";
import NodeJSInstaller from "../installers/nodejs.installer.js";
import NvmInstaller from "../installers/nvm.installer.js";

export default [{ id: NvmInstaller.id }, { id: NodeJSInstaller.id }, { id: DevHostCliInstaller.id }] as InstallItem[];
