import chalk from "chalk";
import { CommandModule } from "yargs";
import { applicationHeader } from "../../../..//lib/devenv/ui/headers.js";
import { install } from "../../../../lib/devenv/install/install.js";

export const InstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    console.info(applicationHeader(`Development Container Host\n${chalk.grey("Installer")}`));
    install();
  },
};
