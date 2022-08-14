import { CommandModule } from "yargs";
import { sleep } from "@cpdevtools/lib-node-utilities";

export const PostInstallCommand: CommandModule = {
  command: "postinstall",
  describe: false,
  builder: (yargs) => yargs,
  handler: async (args): Promise<void> => {
    console.log("Windows Installer");
    await sleep(10000);
    console.log("Windows Installer2");
  },
};

module.exports = PostInstallCommand;
