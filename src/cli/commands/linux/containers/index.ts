import { CommandModule } from "yargs";
import { CloneContainerCommand } from "./CloneContainerCommand";
import { ContainerInspectCommand } from "./ContainerInspectCommand";
import { ContainerListCommand } from "./ContainerListCommand";
import { ContainerMenuCommand } from "./ContainerMenuCommand";
import { CreateContainerCommand } from "./CreateContainerCommand";
import { OpenContainerCommand } from "./OpenContainerCommand";
import { RemoveContainerCommand } from "./RemoveContainerCommand";

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

module.exports = ContainerCommand;
