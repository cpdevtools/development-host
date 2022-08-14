import { AfterInstall, AptInstaller, Installer, Platform, WingetInstaller } from "@cpdevtools/lib-node-utilities";

const DockerInstaller: Installer = {
  id: "docker",
  name: "Docker",
  categories: ["core"],
  platforms: {
    [Platform.WSL]: class DockerWslInstaller extends WingetInstaller implements AfterInstall {
      constructor() {
        super("Docker.DockerDesktop", "Docker Desktop");
      }
      async afterInstall(): Promise<void> {}
    },
    [Platform.LINUX]: class DockerLinuxInstaller extends AptInstaller {
      constructor() {
        super("docker", "Docker");
      }
    },
  },
};

export default DockerInstaller;
