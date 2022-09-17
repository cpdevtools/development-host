import { InstallItem } from "@cpdevtools/lib-node-utilities";
import DevHostCliInstaller from "../installers/devhost-cli.installer";
import NodeJSInstaller from "../installers/nodejs.installer";
import NvmInstaller from "../installers/nvm.installer";

export default [{ id: NvmInstaller.id }, { id: NodeJSInstaller.id }, { id: DevHostCliInstaller.id }] as InstallItem[];
