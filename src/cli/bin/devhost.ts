#!/usr/bin/env -S ts-node --esm --experimentalSpecifierResolution node

import { sleep } from "@cpdevtools/lib-node-utilities";
import glob from "glob";
import os from "os";
import path from "path";
import { exit } from "process";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

(async () => {
  try {
    let argv = yargs(hideBin(process.argv)).scriptName("devhost");
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const cmdDir = path.join(__dirname, "..", "commands", os.platform() === "win32" ? "win" : "linux");
    const jsFiles = "**/*.js";

    const files = glob.sync(jsFiles, { cwd: cmdDir });
    for (const file of files) {
      let mPath = "file://" + path.normalize(path.join(cmdDir, file));
      const m = await import(mPath);
      if (m.default) {
        const toImport = Array.isArray(m.default) ? m.default : [m.default];
        for (const imp of toImport) {
          argv = argv.command(imp);
        }
      }
    }
    argv.parse();
  } catch (e) {
    console.error(e);
    await sleep(5 * 1000);
    exit(1);
  }
})();
