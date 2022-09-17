import { CommandModule } from "yargs";
import { installOnWindows } from "../../../../lib/devenv/install/install";

console.log("win install");

export const PostInstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    await installOnWindows();
  },
};

module.exports = PostInstallCommand;
