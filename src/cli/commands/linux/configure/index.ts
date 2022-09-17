import { toFormattedYaml } from "@cpdevtools/lib-node-utilities";
import chalk from "chalk";
import { exit } from "process";

import { Argv, CommandModule } from "yargs";
import {
  // checkConfig,
  getConfigProperty,
  printConfig,
  promptConfig,
  setConfigProperties,
  setConfigProperty,
  USER_CONFIG_PATH,
} from "../../../../lib/devenv/config/index.js";

export interface GetConfigPropCommandArgs {
  property: string;
}
export interface SetConfigPropCommandArgs {
  property: string;
  value: string;
}
export interface ConfigCommandArgs {
  set?: string[];
}
export interface CheckConfigCommandArgs {
  interactive?: boolean;
}

export const GetConfigPropCommand: CommandModule<{}, GetConfigPropCommandArgs> = {
  command: "get <property>",
  describe: "get the value of the specified config",
  builder: (yargs) =>
    yargs.positional("property", {
      type: "string",
      describe: "The name of the property",
      required: true,
    }) as Argv<GetConfigPropCommandArgs>,
  handler: async (args): Promise<void> => {
    const value = await getConfigProperty(args.property);
    console.info(toFormattedYaml(value, { cliColor: true }));
  },
};
export const CheckConfigCommand: CommandModule<{}, CheckConfigCommandArgs> = {
  command: "check",
  describe: "check the config",
  builder: (yargs) =>
    yargs.option("interactive", {
      type: "boolean",
      alias: "i",
      describe: "Prompt for missing values",
      default: false,
    }) as Argv<CheckConfigCommandArgs>,
  handler: async (args): Promise<void> => {
    if (!args.interactive) {
      /*const result = await checkConfig();
      if (result.failed) {
        result.errors.forEach((f) => console.error(chalk.red(`Error: ${f.message}`)));
        exit(1);
      }*/
    } else {
      await promptConfig();
    }
  },
};

export const SetConfigPropCommand: CommandModule<{}, SetConfigPropCommandArgs> = {
  command: "set <property> <value>",
  describe: "set the value of the specified config",
  builder: (yargs) =>
    yargs
      .positional("property", {
        type: "string",
        describe: "The name of the property",
        required: true,
      })
      .positional("value", {
        type: "string",
        describe: "The value of the property",
        required: true,
      }) as Argv<SetConfigPropCommandArgs>,
  handler: async (args): Promise<void> => {
    await setConfigProperty(args.property, args.value);
    await printConfig();
  },
};

export const ConfigCommand: CommandModule<{}, ConfigCommandArgs> = {
  command: "$0",
  describe: false,
  builder: (yargs) =>
    yargs.option("set", {
      type: "string",
      array: true,
    }) as Argv<ConfigCommandArgs>,
  handler: async (args): Promise<void> => {
    if (args.set?.length) {
      const pairs = args.set!.map((s) => s.split("=")).map((p) => [p.shift(), p.join("=")] as [string, string]);
      await setConfigProperties(pairs);
    }
    if (!(await printConfig())) {
      console.error(chalk.red(`Error: Config file '${USER_CONFIG_PATH}' does not exist.`));
      exit(1);
    }
  },
};

export const ConfigCommandGroup: CommandModule = {
  command: "config",
  describe: "list the config",
  builder: (yargs: Argv) =>
    yargs.command(GetConfigPropCommand).command(SetConfigPropCommand).command(ConfigCommand).command(CheckConfigCommand),
  handler: (args): void | Promise<void> => {},
};

export default ConfigCommandGroup;
module.exports = ConfigCommandGroup;
