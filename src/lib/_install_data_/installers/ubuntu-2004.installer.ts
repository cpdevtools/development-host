import { Installer, Platform, WingetInstaller } from "@cpdevtools/lib-node-utilities";

const UbuntuInstaller: Installer = {
  id: "Ubuntu.2004",
  name: "Ubuntu 20.04",
  categories: ["host"],
  platforms: {
    [Platform.WSL]: class UbuntuWslInstaller extends WingetInstaller {
      constructor() {
        super("Canonical.Ubuntu.2004", "Ubuntu 20.04");
      }
    },
  },
};

export default UbuntuInstaller;
