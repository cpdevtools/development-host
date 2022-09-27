import { promptConfig } from "../config";
import { onStartup } from "../startup/startup";
import { installOrUpdateCore } from "./update";
import isWsl from "is-wsl";
import {
  exec,
  getDockerDesktopConfigPath,
  isInstalledWsl,
  killDockerDesktop,
  readJsonFile,
  rebootWindows,
  restartDockerDesktop,
  runOnceAfterRestart,
  startDockerDesktop,
  writeJsonFile,
} from "@cpdevtools/lib-node-utilities";
import { writeFile } from "fs/promises";
import path from "path";
import { INSTALL_NAME } from "./constants";

export async function installOnLinux() {
  await _instalWsl();
  await installOrUpdateCore();
  // await promptConfig(true);
  // await onStartup();
}

async function _instalWsl() {
  if (isWsl) {
    if (!(await isInstalledWsl("Docker.DockerDesktop"))) {
      await exec("winget.exe install -e --id Docker.DockerDesktop");

      const p = path.join(process.env["temp"] ?? "", "resumeInstall.cmd");
      const cmd = `wsl -d ${INSTALL_NAME} --cd ~ bash -ic "devhost install"`;
      await writeFile(p, cmd, { encoding: "utf-8" });
      await runOnceAfterRestart("CpDevToolDCHInstall", p);
      await rebootWindows(true);
    }

    await killDockerDesktop();
    await startDockerDesktop();
    const dockerConfigPath = await getDockerDesktopConfigPath();
    const dockerConfig = await readJsonFile(dockerConfigPath);
    const integratedWslDistros = (dockerConfig.integratedWslDistros ?? []) as string[];

    if (integratedWslDistros.indexOf(INSTALL_NAME) === -1) {
      integratedWslDistros.push(INSTALL_NAME);
    }

    dockerConfig.integratedWslDistros = integratedWslDistros;
    await writeJsonFile(dockerConfigPath, dockerConfig);
    await restartDockerDesktop();
  }
}
