import { sleep } from "@cpdevtools/lib-node-utilities";
import { CommandModule } from "yargs";

export const PostInstallCommand: CommandModule = {
  command: "install",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    console.log("Windows Installer");
    await sleep(10000);
    console.log("Windows Installer2");
  },
};

module.exports = PostInstallCommand;
