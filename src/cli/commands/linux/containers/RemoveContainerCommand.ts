import { CommandModule } from "yargs";
import { removeContainer } from "../../../../lib/devenv/containers";
import { dynamicImport } from "tsimportlib";
import type inquirer from "inquirer";
type Inquirer = typeof inquirer;

export const RemoveContainerCommand: CommandModule<{}, RemoveContainerCommandArgs> = {
  command: "remove <container-id>",
  describe: "Remove a container",
  builder: (yargs) =>
    yargs.positional("containerId", {
      type: "string",
      describe: "id of the container to remove",
      demandOption: true,
    }),
  handler: async (args): Promise<void> => {
    const inquirer = (await dynamicImport("inquirer", module)).default as Inquirer;

    const answers = await inquirer.prompt({
      type: "confirm",
      name: "remove",
      message: "Are you sure you want to delete this development container? Any Uncommitted data will be lost!",
      default: false,
    });
    if (answers.remove) {
      await removeContainer(args.containerId);
    }
  },
};
export interface RemoveContainerCommandArgs {
  containerId: string;
}
