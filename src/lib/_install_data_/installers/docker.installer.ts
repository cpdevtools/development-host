import {
  AfterInstall,
  AptInstaller,
  BeforeInstall,
  getDockerDesktopConfigPath,
  Installer,
  killDockerDesktop,
  Platform,
  readJsonFile,
  restartDockerDesktop,
  startDockerDesktop,
  WingetInstaller,
  writeJsonFile,
} from "@cpdevtools/lib-node-utilities";
import { INSTALL_NAME } from "../../devenv/install/install";
const DockerInstaller: Installer = {
  id: "docker",
  name: "Docker",
  categories: ["core"],
  platforms: {
    [Platform.WSL]: class DockerWslInstaller extends WingetInstaller implements BeforeInstall, AfterInstall {
      constructor() {
        super("Docker.DockerDesktop", "Docker Desktop");
      }
      async beforeInstall(): Promise<void> {
        await killDockerDesktop();
      }

      async afterInstall(): Promise<void> {
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
    },
    [Platform.LINUX]: class DockerLinuxInstaller extends AptInstaller {
      constructor() {
        super("docker", "Docker");
      }
    },
  },
};

export default DockerInstaller;
