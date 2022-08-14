import { AfterInstall, AptInstaller, Installer, Platform, WingetInstaller } from "@cpdevtools/lib-node-utilities";

const VsCodeInstaller: Installer = {
  id: "Microsoft.VisualStudioCode",
  name: "Microsoft Visual Studio Code",

  categories: ["core", "ide", "editor"],
  platforms: {
    [Platform.WSL]: class VsCodeWslInstaller extends WingetInstaller implements AfterInstall {
      constructor() {
        super("Microsoft.VisualStudioCode", "Microsoft Visual Studio Code", "--scope machine");
      }
      async afterInstall(): Promise<void> {}
    },
    [Platform.LINUX]: class VsCodeLinuxInstaller extends AptInstaller {
      constructor() {
        super("vscode", "Microsoft Visual Studio Code");
      }
    },
  },
};

export default VsCodeInstaller;
