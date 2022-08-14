import { CommandModule } from "yargs";

export const InstallCommand: CommandModule = {
  command: "install",
  describe: "install",
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    console.log("Windows Installer");
  },
};

module.exports = InstallCommand;
