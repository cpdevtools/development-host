#!/usr/bin/env node

import { exec } from "@cpdevtools/lib-node-utilities";
import path from "path";
import { exit } from "process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const initPath = path.join(__dirname, "devhost-init.js");

(async () => {
  const initCmd = `ts-node --esm "${initPath}" ${process.argv.slice(2).join(" ")}`;
  const code = await exec(initCmd);
  exit(code);
})();
