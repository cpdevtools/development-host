import { importChalk } from "@cpdevtools/lib-node-utilities";
import { CommandModule } from "yargs";
import { listContainers } from "../../../../lib/devenv/containers";

export const ContainerListCommand: CommandModule<{}, ContainerListCommandArgs> = {
  command: "ls",
  describe: "List containers",
  builder: (yargs) =>
    yargs
      .option("long", {
        type: "boolean",
        alias: "l",
        default: false,
      })
      .option("workspaces", {
        type: "boolean",
        alias: "w",
        default: false,
      }),
  handler: async (args): Promise<void> => {
    const chalk = await importChalk();
    const containers = await listContainers();
    console.group();
    containers.forEach((c: any) => {
      console.info(`${chalk.yellow(args.long ? c.path : c.id)}`);
      if (args.workspaces) {
        for (const ws of c.workspaces) {
          console.group();
          console.info(`${chalk.cyanBright(args.long ? ws.path : ws.name)}`);
          console.groupEnd();
        }
      }
    });
    console.groupEnd();
    console.info();
  },
};
interface ContainerListCommandArgs {
  long?: boolean;
  workspaces?: boolean;
}
