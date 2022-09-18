import {
  createRepo,
  dockerLogin,
  gitClone,
  gitIsRepo,
  gitSync,
  printYamlFile,
  readYamlFile,
  setConfig,
  writeYamlFile,
} from "@cpdevtools/lib-node-utilities";

import type inquirer from "inquirer";
type Inquirer = typeof inquirer;

import { existsSync } from "fs";
import fs, { mkdir, readdir } from "fs/promises";

import lodash from "lodash";

import { homedir } from "os";
import path, { dirname } from "path";

import { createTokenAuth } from "@octokit/auth-token";
import { RequestError } from "@octokit/request-error";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import { dynamicImport } from "tsimportlib";
import { applicationHeader, taskHeader } from "../ui/headers";
export const USER_DIRECTORY = path.join(homedir(), ".dch");
export const USER_CONFIG_DIRECTORY = path.join(USER_DIRECTORY, "config");
export const USER_CONFIG_PATH = path.join(USER_CONFIG_DIRECTORY, "config.yml");
export const DEFAULT_CONTAINER_ROOT = path.join(USER_DIRECTORY, "containers");

export interface DCHConfig {
  containerRoot: string | null;
  repo: string;
  username: string;
  token: string;
  profile?: string;
}

export interface DCHProfileConfig {
  name: string;
  author?: DCHProfileAuthorConfig;
}

export interface DCHProfileAuthorConfig {
  name?: string;
  email?: string;
}

function configFileExists() {
  return existsSync(USER_CONFIG_PATH);
}

async function saveConfig(data: DCHConfig) {
  // data = copyConfig(data);
  //const validation = validateConfig(data);
  //if (validation.failed) {
  // throw new ValidationError(validation.errors);
  //}
  await fs.mkdir(path.dirname(USER_CONFIG_PATH), { recursive: true });
  await writeYamlFile(USER_CONFIG_PATH, data, 2);
}

export async function loadConfig(): Promise<DCHConfig> {
  let cfg: Partial<DCHConfig> = configFileExists() ? await readYamlFile(USER_CONFIG_PATH) : {};

  const config: DCHConfig = {
    containerRoot: cfg?.containerRoot ?? "",
    repo: cfg?.repo ?? "",
    token: cfg?.token ?? "",
    username: cfg?.username ?? "",
    profile: cfg?.profile,
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
  const config = ((await loadConfig()) ?? {}) as DCHConfig;
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

function copyConfig(v?: DCHConfig | null): DCHConfig {
  return {
    containerRoot: v?.containerRoot || DEFAULT_CONTAINER_ROOT,
    repo: v?.repo || "",
    token: v?.repo || "",
    username: v?.repo || "",
    profile: v?.profile,
  };
}

async function githubLogin(withToken?: string) {
  withToken ??= (await loadConfig()).token;
  if (withToken) {
    try {
      const auth = createTokenAuth(withToken);
      const { token } = await auth();
      const octokit = new Octokit({ auth: token });
      await octokit.users.getAuthenticated();
      return octokit;
    } catch (e: any) {
      if (e.status !== 401) {
        throw e;
      }
    }
  }
}

async function getProfileRepoPath(): Promise<string> {
  const config = await loadConfig();
  return path.join(USER_CONFIG_DIRECTORY, `${config.username}/cpdevtools-dch-settings`);
}

async function getProfilesPath(): Promise<string> {
  return path.join(await getProfileRepoPath(), `profiles`);
}

async function getProfilePath(name: string): Promise<string> {
  return path.join(await getProfilesPath(), name);
}

async function getProfileConfigFile(name: string): Promise<string> {
  return path.join(await getProfilePath(name), "profile.yml");
}

async function loadProfileConfig(name?: string) {
  name ??= (await loadConfig()).profile;
  if (!name) {
    throw new Error("Cannot load profile. No name provided and no default is set.");
  }

  let cfg: Partial<DCHProfileConfig> = {};

  if (await profileConfigFileExists(name)) {
    cfg = await readYamlFile(await getProfileConfigFile(name));
  }

  const config: DCHProfileConfig = {
    ...cfg,
    name: cfg.name ?? name,
    author: {
      name: cfg.author?.name ?? "",
      email: cfg.author?.email ?? "",
    },
  };
  return config;
}

async function saveProfile(data: DCHProfileConfig) {
  const config = await loadConfig();
  const name = data.name;
  if (!name) {
    throw new Error("Cannot save profile. No name provided and no default is set.");
  }

  const profileFile = await getProfileConfigFile(name);
  await fs.mkdir(dirname(profileFile), { recursive: true });
  await writeYamlFile(profileFile, data);

  await setConfig("user.name", data.author?.name ?? "");
  await setConfig("user.email", data.author?.email ?? "");

  const repoDir = path.join(USER_CONFIG_DIRECTORY, `${config.username}/cpdevtools-dch-settings`);
  await gitSync(repoDir);
}

async function profileConfigFileExists(name: string) {
  const profileFile = await getProfileConfigFile(name);
  return existsSync(profileFile);
}

/*
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
*/

export async function promptPAT(confirm: boolean = true) {
  const config = await loadConfig();
  let octokit = await githubLogin();
  let configToken: string = config.token;

  const inquirer = (await dynamicImport("inquirer", module)).default as Inquirer;

  if (!octokit) {
    const { token } = await inquirer.prompt({
      name: "token",
      type: "input",
      askAnswered: confirm,
      message: "Your github personal access token(PAT):",
      default: configToken ?? undefined,
      validate: async (v) => !!(await githubLogin(v)),
    });
    configToken = token;
    await setConfigProperty("token", token);
  }

  return configToken;
}

export async function promptConfig(confirm: boolean = true) {
  const config = await loadConfig();
  applicationHeader(`Development Container Host\n${chalk.gray("Configuration")}`);

  const token = await promptPAT(confirm);
  let octokit = await githubLogin();
  if (octokit) {
    const user = await octokit.users.getAuthenticated();
    await setupUserProfilesRepo(user.data.login, token, octokit);
    await setupProfile();
  }
}

async function setupProfile(name?: string) {
  const profile = await loadProfileConfig(name);
  profile.author ??= {};

  taskHeader(`Setup profile ${chalk.cyan(profile.name)}`);
  const inquirer = (await dynamicImport("inquirer", module)).default as Inquirer;
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Your full name?",
      validate: (v) => !!v?.length,
      default: profile.author.name,
    },
    {
      type: "input",
      name: "email",
      message: "Your public email address?",
      validate: (v) => !!v?.length,
      default: profile.author.email,
    },
  ]);

  profile.author.name = answers.name;
  profile.author.email = answers.email;

  await saveProfile(profile);
  await applyConfigs(name);
}

async function applyConfigs(profileName?: string) {
  const config = await loadConfig();
  const profile = await loadProfileConfig(profileName);

  const gh = await githubLogin();
  if (gh) {
    await setConfig("user.name", profile.author?.name ?? "");
    await setConfig("user.email", profile.author?.email ?? "");
    await dockerLogin("ghcr.io", config.username, config.token);
    await dockerLogin("docker.pkg.github.com", config.username, config.token);
  }
}

async function setupUserProfilesRepo(username: string, token: string, octokit: Octokit) {
  const inquirer = (await dynamicImport("inquirer", module)).default as Inquirer;
  const repo = `${username}/cpdevtools-dch-settings`;
  const repoDir = path.join(USER_CONFIG_DIRECTORY, `${username}/cpdevtools-dch-settings`);
  const currentUserDir = path.join(USER_CONFIG_DIRECTORY, username);
  await mkdir(currentUserDir, { recursive: true });

  try {
    await octokit.repos.get({
      owner: username,
      repo: "cpdevtools-dch-settings",
    });
    if (!(await gitIsRepo(repoDir))) {
      await gitClone(currentUserDir, `https://github.com/${repo}`);
    } else {
      await gitSync(repoDir);
    }
  } catch (e) {
    if (e instanceof RequestError) {
      const q = {
        name: "create",
        type: "confirm",
        message: `Allow creation of settings repository at 'github.com/${repo}'?`,
        default: true,
      };

      const a = await inquirer.prompt([q]);
      if (a.create) {
        await createRepo(repo, {
          description: "Setting for CP DevTools Development Container",
          private: true,
          clone: true,
          cwd: currentUserDir,
        });
      }
    }
  }
  await initializeProfileConfig(repo, username, token);
}

async function initializeProfileConfig(repo: string, username: string, token: string) {
  await setConfigProperties([
    ["repo", repo],
    ["username", username],
    ["token", token],
  ]);

  const config = await loadConfig();

  const userConfigDir = path.join(USER_CONFIG_DIRECTORY, username, "cpdevtools-dch-settings");
  const profilesDir = path.join(userConfigDir, "profiles");
  await mkdir(profilesDir, { recursive: true });

  let selectedProfile = config.profile;

  if (!selectedProfile) {
    const profileDirs = await readdir(profilesDir);
    const profileDirsLower = profileDirs.map((d) => d.toLocaleLowerCase());

    const select = (await dynamicImport("@inquirer/select/dist/index.js", module)).default;

    selectedProfile = await select({
      message: "Choose or create a profile for this computer",
      choices: [
        {
          name: "- New Profile -",
          value: "-new-",
          description: "Create a new profile.",
        },
        ...profileDirs.map((name) => ({
          name,
          value: name,
          description: `Use profile '${name}'.`,
        })),
      ],
    });

    if (selectedProfile === "-new-") {
      config.profile = await createNewProfile(username, profileDirsLower);
      selectedProfile = config.profile!;
    }

    await setConfigProperties([["profile", selectedProfile!]]);
  }
}

async function createNewProfile(username: string, profiles: string[]) {
  const inquirer = (await import("inquirer")).default;
  const alphaNumericCheck = /^[a-z0-9_-]+$/;
  let profileName: string = "";
  while (!profileName) {
    const answers = await inquirer.prompt({
      type: "input",
      name: "profileName",
      message: "What is the name of the new profile?",
      validate: (v: string) => v.length > 2 && alphaNumericCheck.test(v) && !profiles.includes(v.toLowerCase()),
    });
    profileName = answers.profileName;
  }
  const userConfigDir = path.join(USER_CONFIG_DIRECTORY, username, "cpdevtools-dch-settings");

  await saveProfile({
    name: profileName,
  });
  await gitSync(userConfigDir);

  return profileName;
}
