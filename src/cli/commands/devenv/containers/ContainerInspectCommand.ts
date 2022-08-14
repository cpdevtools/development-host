import { printAsYaml } from "@cpdevtools/lib-node-utilities";
import { CommandModule } from "yargs";
import { listContainers } from "../../../../lib/devenv/containers";

export const ContainerInspectCommand: CommandModule<{}, ContainerInspectCommandArgs> = {
  command: "inspect <container-id>",
  //aliases: [],
  describe: "Show Details about a container",
  builder: (yargs) =>
    yargs.positional("containerId", {
      type: "string",
      required: true,
      default: undefined,
    }),
  handler: async (args): Promise<void> => {
    const containers = await listContainers();
    const container = containers.find((c) => c.id === args.containerId);
    if (container) {
      printAsYaml(
        {
          [container.id]: {
            owner: container.owner,
            name: container.name,
            launchUrl: container.launchUrl,
            workspaces: container.workspaces.map((ws) => ({
              name: ws.name,
              path: ws.path.slice(container.path.length + 1),
              launchUrl: ws.launchUrl,
            })),
          },
        },
        { cliColor: true }
      );
    }
  },
};
interface ContainerInspectCommandArgs {
  containerId?: string;
}
