import {
  dockerLogin,
  envVars,
  printYamlFile,
  readYamlFile,
  setWindowsEnv,
  ValidationError,
  ValidationResult,
  writeYamlFile,
} from "@cpdevtools/lib-node-utilities";
import { existsSync } from "fs";
import fs from "fs/promises";
import inquirer, { InputQuestion } from "inquirer";
import lodash from "lodash";

import { homedir } from "os";
import path from "path";

import { createTokenAuth } from "@octokit/auth-token";
import { Octokit } from "@octokit/rest";

export const USER_DIRECTORY = path.join(homedir(), ".dch");
export const USER_CONFIG_PATH = path.join(USER_DIRECTORY, "config.yml");
export const DEFAULT_CONTAINER_ROOT = path.join(USER_DIRECTORY, "containers");

export interface DevEnvironmentConfig {
  containerRoot: string | null;
  author: DevEnvironmentAuthorConfig;
  github: DevEnvironmentGithubConfig;
}
export interface DevEnvironmentAuthorConfig {
  name: string | null;
  email: string | null;
}

export interface DevEnvironmentGithubConfig {
  username: string | null;
  token: string | null;
}

function configFileExists() {
  return existsSync(USER_CONFIG_PATH);
}

async function saveConfig(data: DevEnvironmentConfig) {
  data = copyConfig(data);
  const validation = validateConfig(data);
  if (validation.failed) {
    throw new ValidationError(validation.errors);
  }
  await fs.mkdir(path.dirname(USER_CONFIG_PATH), { recursive: true });
  await writeYamlFile(USER_CONFIG_PATH, data, 2);
}

export async function loadConfig(): Promise<DevEnvironmentConfig> {
  let cfg: any;
  if (configFileExists()) {
    cfg = await readYamlFile(USER_CONFIG_PATH);
  }

  const config: DevEnvironmentConfig = {
    author: {
      name: cfg?.author?.name ?? "",
      email: cfg?.author?.email ?? "",
    },
    containerRoot: cfg?.containerRoot ?? "",
    github: {
      token: cfg?.github?.token ?? "",
      username: cfg?.github?.token ?? "",
    },
  };

  return config;
}

export async function printConfig() {
  if (configFileExists()) {
    await printYamlFile(USER_CONFIG_PATH, { cliColor: true });
    return true;
  }
  return false;
}

export async function getConfigProperty<T = unknown>(property: string): Promise<T | undefined> {
  const config = await loadConfig();
  return lodash.get(config, property, null);
}

export async function setConfigProperty(property: string, value: any): Promise<void> {
  await setConfigProperties([[property, value]]);
}

export async function setConfigProperties(pairs: [string, string][]): Promise<void> {
  const config = ((await loadConfig()) ?? {}) as DevEnvironmentConfig;
  for (let [key, val] of pairs) {
    if (val === "undefined") {
      lodash.unset(config, key);
    } else {
      try {
        val = JSON.parse(val);
      } catch {}
      lodash.set(config, key, val);
    }
  }
  await saveConfig(config);
}

function isEmpty(v: any) {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

function copyConfig(v?: DevEnvironmentConfig | null): DevEnvironmentConfig {
  return {
    containerRoot: v?.containerRoot || DEFAULT_CONTAINER_ROOT,
    author: {
      name: v?.author?.name ?? null,
      email: v?.author?.email ?? null,
    },
    github: {
      username: v?.github?.username ?? null,
      token: v?.github?.token ?? null,
    },
  };
}

async function githubLogin() {
  const config = await loadConfig();
  if (config.github.token) {
    try {
      const auth = createTokenAuth(config.github.token);
      const { token } = await auth();
      const octokit = new Octokit({ auth: token });
      await octokit.users.getAuthenticated();
      return octokit;
    } catch (e) {
      console.error(e);
    }
  }
}

export async function checkConfig(): Promise<ValidationResult> {
  return validateConfig(await loadConfig(), false);
}

function validateConfig(data: any, allowPartial: boolean = true): ValidationResult {
  const config = copyConfig(data);
  const result: ValidationResult = {
    failed: false,
    errors: [],
  };

  if (isEmpty(config.containerRoot)) {
    result.failed = true;
    result.errors.push({ field: "containerRoot", rule: "required", message: "containerRoot is required." });
  } else if (typeof config.containerRoot !== "string") {
    result.failed = true;
    result.errors.push({
      field: "containerRoot",
      rule: "type",
      message: `containerRoot must be a string but is a ${typeof config.containerRoot}`,
    });
  }

  if (isEmpty(config.author.name)) {
    if (!allowPartial) {
      result.failed = true;
      result.errors.push({ field: "author.name", rule: "required", message: "author.name is required." });
    }
  } else if (typeof config.author.name !== "string") {
    result.failed = true;
    result.errors.push({
      field: "author.name",
      rule: "type",
      message: `author.name must be a string but is a ${typeof config.author.name}`,
    });
  }

  if (isEmpty(config.author.email)) {
    if (!allowPartial) {
      result.failed = true;
      result.errors.push({ field: "author.email", rule: "required", message: "author.email is required." });
    }
  } else if (typeof config.author.email !== "string") {
    result.failed = true;
    result.errors.push({
      field: "author.email",
      rule: "type",
      message: `author.email must be a string but is a ${typeof config.author.email}`,
    });
  }
  if (isEmpty(config.github.username)) {
    if (!allowPartial) {
      result.failed = true;
      result.errors.push({ field: "github.username", rule: "required", message: "github.username is required." });
    }
  } else if (typeof config.github.username !== "string") {
    result.failed = true;
    result.errors.push({
      field: "github.username",
      rule: "type",
      message: `github.username must be a string but is a ${typeof config.github.username}`,
    });
  }
  if (isEmpty(config.github.token)) {
    if (!allowPartial) {
      result.failed = true;
      result.errors.push({ field: "github.token", rule: "required", message: "github.token is required." });
    }
  } else if (typeof config.github.token !== "string") {
    result.failed = true;
    result.errors.push({
      field: "github.token",
      rule: "type",
      message: `github.token must be a string but is a ${typeof config.github.token}`,
    });
  }

  return result;
}

export async function promptConfig(confirm: boolean = true) {
  const config = await loadConfig();
  let octokit = await githubLogin();
  while (!octokit) {
    const q = {
      name: "github.token",
      type: "input",
      askAnswered: confirm,
      message: "Your github personal access token(PAT):",
      default: config?.github.token ?? undefined,
    };
    const a = await inquirer.prompt([q], {
      "github.token": config?.github.token ?? undefined,
    });
    if (!isEmpty(a["github.token"])) {
      await setConfigProperty("github.token", a["github.token"]);
      octokit = await githubLogin();
    }
  }

  const user = await octokit.users.getAuthenticated();

  config.author.name = user.data.name ?? config.author.name;
  config.author.email = user.data.email ?? config.author.email;
  config.github.username = user.data.login;

  await setConfigProperties([
    ["author.name", isEmpty(config.author.name) ? "" : config.author.name!],
    ["author.email", isEmpty(config.author.email) ? "" : config.author.email!],
    ["github.username", isEmpty(config.github.username) ? "" : config.github.username!],
  ]);

  const questions: InputQuestion[] = [];
  if (confirm || isEmpty(config?.author.name)) {
    questions.push({
      name: "author.name",
      type: "input",
      askAnswered: confirm,
      message: "Your full name:",
      default: config?.author.name ?? undefined,
    });
  }

  if (confirm || isEmpty(config?.author.email)) {
    questions.push({
      name: "author.email",
      type: "input",
      askAnswered: confirm,
      message: "Your email address:",
      default: config?.author.email ?? undefined,
    });
  }

  const answers = await inquirer.prompt(questions, {
    "author.name": config?.author.name ?? undefined,
    "author.email": config?.author.email ?? undefined,
  });

  await setConfigProperties([
    ["author.name", isEmpty(answers["author.name"]) ? null : answers["author.name"]],
    ["author.email", isEmpty(answers["author.email"]) ? null : answers["author.email"]],
  ]);

  await applyConfig();
}

export async function applyConfig() {
  const config = await loadConfig();

  if (!config) {
    throw Error("Config not found");
  }

  await envVars("GITHUB_TOKEN", config.github.token!);
  await dockerLogin("ghcr.io", config.github.username!, config.github.token!);
}
