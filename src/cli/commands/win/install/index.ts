import { CommandModule } from "yargs";
import { installOnWindows } from "../../../../lib/devenv/install/install";

export const PostInstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    await installOnWindows();
  },
};

export default PostInstallCommand;
