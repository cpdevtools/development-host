import { exec } from "@cpdevtools/lib-node-utilities";
import chalk from "chalk";
import { exit } from "process";
import { CommandModule } from "yargs";
import { installOrUpdateCore, updateSelf } from "../../../../lib/devenv/install/update";
import { applicationHeader } from "../../../../lib/devenv/ui/headers";

interface UpdateCommandOptions {
  afterSelfUpdate: boolean;
}
export const UpdateCommand: CommandModule<{}, UpdateCommandOptions> = {
  command: "update",
  describe: "update",
  builder: (yargs) =>
    yargs.option("afterSelfUpdate", {
      type: "boolean",
      hidden: true,
      default: false,
    }),
  handler: async (args): Promise<void> => {
    if (!args.afterSelfUpdate) {
      console.info(applicationHeader(`Development Container Host\n${chalk.grey("Updater")}`));
      await updateSelf();
      await exec(`devhost update --after-self-update`, { cwd: process.cwd() });
      exit();
    } else {
      await installOrUpdateCore();
    }
  },
};

module.exports = UpdateCommand;
