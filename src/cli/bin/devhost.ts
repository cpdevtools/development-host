#!/usr/bin/env node --experimental-specifier-resolution=node

import { sleep } from "@cpdevtools/lib-node-utilities";
import fastGlob from "fast-glob";
import os from "os";
import path from "path";
import { exit } from "process";
import { fileURLToPath } from "url";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

(async () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const jsFiles = path.join(__dirname, "..", "commands", os.platform() === "win32" ? "win" : "linux", "**/*.js");
    const files = await fastGlob(jsFiles);

    let argv = yargs(hideBin(process.argv)).scriptName("devhost");

    for (const file of files) {
      const m = await import(file);
      if (m.default) {
        const toImport = Array.isArray(m.default) ? m.default : [m.default];
        for (const i of toImport) {
          argv = argv.command(i);
        }
      }
    }

    argv.parse();
  } catch (e) {
    console.error(e);
    await sleep(60 * 1000);
    exit(1);
  }
})();
