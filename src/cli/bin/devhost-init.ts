//import { sleep } from "@cpdevtools/lib-node-utilities";
import glob from "fast-glob";
import { readdirSync } from "fs";
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

    let files: string[] = [];
    if (os.platform() === "win32") {
      files = [path.join("..", "commands", "win", "install", "index.js")];
    } else {
      const jsFiles = path.join("..", "commands", "linux", "**/*.js");
      files = await glob(jsFiles, { cwd: __dirname });
    }

    console.log(readdirSync(path.join(__dirname, "..", "commands", "win", "install")));
    console.log("files", files);

    for (const file of files) {
      const modulePath = new URL(file, import.meta.url).toString();
      console.log("modulePath", modulePath);
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
