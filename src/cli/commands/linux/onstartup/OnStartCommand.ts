import { CommandModule } from "yargs";
import { install } from "../../../../lib/devenv/install/install";

export const OnStartCommand: CommandModule = {
  command: "onstart",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {},
};
