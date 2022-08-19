import {
  AfterInstallOrUpdate,
  AptInstaller,
  Installer,
  installVSCodeExtension,
  Platform,
  WingetInstaller,
} from "@cpdevtools/lib-node-utilities";

const VsCodeInstaller: Installer = {
  id: "Microsoft.VisualStudioCode",
  name: "Microsoft Visual Studio Code",

  categories: ["core", "ide", "editor"],
  platforms: {
    [Platform.WSL]: class VsCodeWslInstaller extends WingetInstaller implements AfterInstallOrUpdate {
      constructor() {
        super("Microsoft.VisualStudioCode", "Microsoft Visual Studio Code", "--scope machine");
      }
      async afterInstallOrUpdate(): Promise<void> {
        await installVSCodeExtension("ms-vscode-remote.vscode-remote-extensionpack", {
          force: true,
        });
        await installVSCodeExtension("ms-azuretools.vscode-docker", { force: true });
        await installVSCodeExtension("redhat.vscode-yaml", { force: true });
        await installVSCodeExtension("heaths.vscode-guid", { force: true });
        await installVSCodeExtension("johnpapa.vscode-peacock", { force: true });
      }
    },
    [Platform.LINUX]: class VsCodeLinuxInstaller extends AptInstaller {
      constructor() {
        super("vscode", "Microsoft Visual Studio Code");
      }
    },
  },
};

export default VsCodeInstaller;
