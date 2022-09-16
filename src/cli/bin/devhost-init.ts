//import { sleep } from "@cpdevtools/lib-node-utilities";
import glob from "glob";
import os from "os";
import path from "path";
import { exit } from "process";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

(async () => {
  try {
    console.log("running dch cli in ts...");
    let argv = yargs(hideBin(process.argv)).scriptName("devhost");
    const __dirname = fileURLToPath(new URL(".", import.meta.url));
    const jsFiles = path.join("..", "commands", os.platform() === "win32" ? "win" : "linux", "**/*.js");

    const files = glob.sync(jsFiles, { cwd: __dirname });

    console.log("found cmd files", files, path.join(__dirname, jsFiles));

    for (const file of files) {
      const modulePath = new URL(file, import.meta.url).toString();
      const module = await import(modulePath);
      if (module.default) {
        const toImport = Array.isArray(module.default) ? module.default : [module.default];
        for (const imp of toImport) {
          argv = argv.command(imp);
        }
      }
    }
    argv.parse();
  } catch (e) {
    console.error(e);
    exit(1);
  }
})();
