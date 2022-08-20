import chalk from "chalk";
import { CommandModule } from "yargs";
import { installOnWindows } from "../../../../lib/devenv/install/install";
import { applicationHeader } from "../../../../lib/devenv/ui/headers";

export const PostInstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    console.info(applicationHeader(`Development Container Host\n${chalk.grey("Windows Installer")}`));
    await installOnWindows();
  },
};

export default PostInstallCommand;
