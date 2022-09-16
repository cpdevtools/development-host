#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import os from "os";
import path from "path";

(async () => {
  let argv = yargs(hideBin(process.argv)).scriptName("devhost");
  argv = argv.commandDir(path.join("..", "commands", os.platform() === "win32" ? "win" : "linux"));
  await argv.parseAsync();
})();
