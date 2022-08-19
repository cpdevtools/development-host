import { Installer, Platform, NodeInstaller } from "@cpdevtools/lib-node-utilities";

const DevHostCliInstaller: Installer = {
  id: "@cpdevtools/development-host",
  name: "Development Host Cli",
  categories: ["host"],
  platforms: {
    [Platform.WSL]: class DevHostCliInstaller extends NodeInstaller {
      constructor() {
        super("@cpdevtools/development-host", "Development Host Cli");
      }
    },
  },
};

export default DevHostCliInstaller;
