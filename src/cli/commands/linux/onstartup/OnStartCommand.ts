import { applicationHeader, taskFooter, taskHeader } from "../../../../lib/devenv/ui/headers";
import { CommandModule } from "yargs";
import chalk from "chalk";

export const OnStartCommand: CommandModule = {
  command: "onstart",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    taskHeader(`Installing WSL`);
    taskFooter(`Installed WSL`);
  },
};
