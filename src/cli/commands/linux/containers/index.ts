import { CommandModule } from "yargs";
import { CloneContainerCommand } from "./CloneContainerCommand.js";
import { ContainerInspectCommand } from "./ContainerInspectCommand.js";
import { ContainerListCommand } from "./ContainerListCommand.js";
import { ContainerMenuCommand } from "./ContainerMenuCommand.js";
import { CreateContainerCommand } from "./CreateContainerCommand.js";
import { OpenContainerCommand } from "./OpenContainerCommand.js";
import { RemoveContainerCommand } from "./RemoveContainerCommand.js";

export const ContainerCommand: CommandModule = {
  command: "container",
  describe: "Container Menu",
  builder: (yargs) =>
    yargs
      .command(ContainerMenuCommand)
      .command(ContainerListCommand)
      .command(ContainerInspectCommand)
      .command(OpenContainerCommand)
      .command(CloneContainerCommand)
      .command(CreateContainerCommand)
      .command(RemoveContainerCommand),
  handler: (_): void => {},
};

export default ContainerCommand;
