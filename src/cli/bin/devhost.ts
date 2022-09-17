#!/usr/bin/env node

import os from "os";
import { exit } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
try {
  (async () => {
    try {
      await yargs(hideBin(process.argv))
        .scriptName("devhost")
        .commandDir(`../commands/${os.platform() === "win32" ? "win" : "linux"}`, { extensions: ["js"], recurse: true })
        .fail(false)
        .parse();
    } catch (e) {
      console.error(e);
      exit(1);
    }
  })();
} catch (e) {
  console.error(e);
  exit(1);
}
