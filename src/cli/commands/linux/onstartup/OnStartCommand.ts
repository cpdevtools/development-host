import { applicationHeader, taskFooter, taskHeader } from "../../../../lib/devenv/ui/headers";
import { CommandModule } from "yargs";
import chalk from "chalk";

export const OnStartCommand: CommandModule = {
  command: "onstart",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    applicationHeader(
      `Installing ${chalk.cyan(`Development Container Host`)}

${chalk.yellow(`Warning:`)} ${chalk.cyan(`WSL`)} will be restarted/updated during install.
${chalk.yellow(`Warning:`)} ${chalk.cyan(`Docker Desktop`)} will be restarted/updated during install.
${chalk.yellow(`Warning:`)} ${chalk.cyan(`VS Code`)} will loose connections to docker, wsl & dev containers.

Make sure you wont loose any works
`.trim(),
      "warn"
    );
    const inquirer = (await import("inquirer")).default;
    const answers = await inquirer.prompt({
      type: "confirm",
      name: "continue",
      message: "Continue?",
      default: true,
    });
  },
};
