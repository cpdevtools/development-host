import { prompt } from "inquirer";
import { CommandModule } from "yargs";
import { removeContainer } from "../../../../lib/devenv/containers";
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
    const answers = await prompt({
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
