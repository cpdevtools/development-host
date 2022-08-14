import { CommandModule } from "yargs";

export const ContainerMenuCommand: CommandModule<{}, {}> = {
  command: "$0",
  describe: false,
  builder: (yargs) =>
    yargs.positional("path", {
      type: "string",
      describe: "url of the container to clone",
      demandOption: true,
    }),
  handler: async (args): Promise<void> => {
    throw new Error("NYI");
  },
};
