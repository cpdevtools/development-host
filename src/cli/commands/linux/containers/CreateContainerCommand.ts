import { CommandModule } from "yargs";

export const CreateContainerCommand: CommandModule<{}, CreateContainerCommandArgs> = {
  command: "create <template> <path>",
  describe: "Create a container",
  builder: (yargs) =>
    yargs
      .positional("template", {
        type: "string",
        describe: "url of the container template to use",
        demandOption: true,
      })
      .positional("path", {
        type: "string",
        describe: "url of the container template to use",
        demandOption: true,
      }),
  handler: async (args): Promise<void> => {
    throw new Error("NYI");
  },
};

interface CreateContainerCommandArgs {
  path: string;
  template: string;
}
