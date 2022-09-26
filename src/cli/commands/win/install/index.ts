import { CommandModule } from "yargs";
import { installOnWindows } from "../../../../lib/devenv/install/installOnWindows";

export const PostInstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    try {
      await installOnWindows();
    } catch (e) {
      console.error(e);
      throw e;
    }
  },
};

module.exports = PostInstallCommand;
