import { importChalk } from "@cpdevtools/lib-node-utilities";
import { CommandModule } from "yargs";
import { applicationHeader } from "../../../..//lib/devenv/ui/headers";
import { install } from "../../../../lib/devenv/install/install";

export const InstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    const chalk = await importChalk();
    console.info(applicationHeader(`Development Container Host\n${chalk.grey("Installer")}`));
    install();
  },
};
