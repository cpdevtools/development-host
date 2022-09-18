import { CommandModule } from "yargs";
import { installOnWindows } from "../../../../lib/devenv/install/install";

export const PostInstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    try {
      console.log("installOnWindows");
      await installOnWindows();
      console.log("after installOnWindows");
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

module.exports = PostInstallCommand;
