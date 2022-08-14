import { installOrUpdateCore, uninstallCore } from "../../../../lib/devenv/install/update";
import { CommandModule } from "yargs";

export const UpdateCommand: CommandModule = {
  command: "update",
  describe: "update",
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    await installOrUpdateCore();
  },
};

module.exports = UpdateCommand;
