import { Installer, Platform, WingetInstaller } from "@cpdevtools/lib-node-utilities";

const WindowsTerminalInstaller: Installer = {
  id: "Microsoft.WindowsTerminal",
  name: "Ubuntu 20.04",
  categories: ["host"],
  platforms: {
    [Platform.WSL]: class WindowsTerminalWslInstaller extends WingetInstaller {
      constructor() {
        super("Microsoft.WindowsTerminal", "Windows Terminal");
      }
    },
  },
};

export default WindowsTerminalInstaller;
