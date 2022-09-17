import { launchContainerUrl } from "@cpdevtools/lib-node-utilities";
import { CommandModule } from "yargs";
import { listContainers } from "../../../../lib/devenv/containers";

export const OpenContainerCommand: CommandModule<{}, OpenContainerCommandArgs> = {
  command: "open <containerId> [workspace]",
  describe: "Open a container in vscode",
  builder: (yargs) =>
    yargs
      .positional("containerId", {
        type: "string",
        describe: "owner/name",
        demandOption: true,
      })
      .positional("workspace", {
        type: "string",
        describe: "name of the workspace to open",
      }),
  handler: async (args): Promise<void> => {
    const containers = await listContainers();
    const container = containers.find((c: any) => c.id === args.containerId);
    if (container) {
      const workspace = container.workspaces.find((w: any) => w.name === args.workspace);
      const launchUrl = workspace?.launchUrl ?? container.launchUrl;
      if (launchUrl) {
        launchContainerUrl(launchUrl);
      }
    }
  },
};

interface OpenContainerCommandArgs {
  containerId: string;
  workspace?: string;
}
