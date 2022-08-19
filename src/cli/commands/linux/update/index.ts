import { exec } from "@cpdevtools/lib-node-utilities";
import { exit } from "process";
import { asapScheduler } from "rxjs";
import { boolean, CommandModule } from "yargs";
import { installOrUpdateCore, updateSelf } from "../../../../lib/devenv/install/update";

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
      await updateSelf();
      await exec(`devhost update --after-self-update`, { cwd: process.cwd() });
      exit();
    } else {
      await installOrUpdateCore();
    }
  },
};

module.exports = UpdateCommand;
