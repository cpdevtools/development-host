#!/usr/bin/env node

import os from "os";
import { exit } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
(async () => {
  await yargs(hideBin(process.argv))
    .scriptName("devhost")
    .commandDir(`../commands/${os.platform() === "win32" ? "win" : "linux"}`, { extensions: ["js"], recurse: true })
    .fail((msg, err) => {
      console.error(msg);
      console.error(err);
      exit(1);
    })
    .parse();
})();
