import { CommandModule } from "yargs";

export const PostInstallCommand: CommandModule = {
  command: "postinstall",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    console.log("Windows Installer");
  },
};

module.exports = PostInstallCommand;
