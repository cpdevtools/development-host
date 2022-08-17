import { CommandModule } from "yargs";

export const InstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    console.log("install");
  },
};

module.exports = InstallCommand;
