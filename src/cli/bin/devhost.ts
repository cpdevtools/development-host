#!/usr/bin/env node

import os from "os";
import { exit } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

(async () => {
  try {
    await yargs(hideBin(process.argv))
      .scriptName("devhost")
      .commandDir(`../commands/${os.platform() === "win32" ? "win" : "linux"}`, { extensions: ["js"], recurse: true })
      .parse();
  } catch (e) {
    console.error(e);
    exit(1);
  }
})();
