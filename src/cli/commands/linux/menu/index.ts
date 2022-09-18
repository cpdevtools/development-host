import { Argv, CommandModule } from "yargs";

const Command: CommandModule = {
  command: "$0",
  describe: "menu",
  builder: (yargs: Argv) => yargs,
  handler: (args): void | Promise<void> => {},
};

module.exports = Command;
