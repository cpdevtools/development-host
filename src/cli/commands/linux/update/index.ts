import { CommandModule } from "yargs";
import { installOrUpdateCore } from "../../../../lib/devenv/install/update";

export const UpdateCommand: CommandModule = {
  command: "update",
  describe: "update",
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    await installOrUpdateCore();
  },
};

module.exports = UpdateCommand;
