#!/usr/bin/env node

import { sleep } from "@cpdevtools/lib-node-utilities";
import { exit } from "process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

(async () => {
  try {
    await yargs(hideBin(process.argv))
      .scriptName("devhost")
      .commandDir("../commands/devhost", { extensions: ["js"], recurse: true })
      .parse();
  } catch (e) {
    console.error(e);
    await sleep(60 * 1000);
    exit(1);
  }
})();
