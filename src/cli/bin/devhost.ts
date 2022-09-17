#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import os from "os";
import path from "path";

(async () => {
  /*let argv = yargs(hideBin(process.argv)).scriptName("devhost");
  console.log('rrrruuuuunnn', path.join("..", "commands", os.platform() === "win32" ? "win" : "linux"))
  argv = argv.commandDir(path.join("..", "commands", os.platform() === "win32" ? "win" : "linux"), { extensions: ["js"], recurse: true});
  await argv.parseAsync();*/

  await yargs(hideBin(process.argv))
    .scriptName("devhost")
    .commandDir(`../commands/${os.platform() === "win32" ? "win" : "linux"}`, { extensions: ["js"], recurse: true })
    .parse();
})();
