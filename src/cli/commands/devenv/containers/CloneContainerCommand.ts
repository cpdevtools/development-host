import { CommandModule } from "yargs";
import { cloneContainer } from "../../../../lib/devenv/containers";

export const CloneContainerCommand: CommandModule<{}, CloneContainerCommandArgs> = {
  command: "clone <id | url>",
  describe: "Clone a container",
  builder: (yargs) =>
    yargs.positional("url", {
      type: "string",
      describe: "url of the container to clone",
      demandOption: true,
    }),
  handler: async (args): Promise<void> => {
    await cloneContainer(args.url);
  },
};

interface CloneContainerCommandArgs {
  url: string;
}
