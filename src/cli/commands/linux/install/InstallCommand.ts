import { CommandModule } from "yargs";
import { install } from "../../../../lib/devenv/install/install";

export const InstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    install();
  },
};
