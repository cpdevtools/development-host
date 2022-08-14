import { clone, getContainerLaunchUrl, readJsonFile } from "@cpdevtools/lib-node-utilities";
import glob from "fast-glob";
import { readdir, rm, rmdir } from "fs/promises";
import Path from "path/posix";
import { DEFAULT_CONTAINER_ROOT, loadConfig } from "../config";
import { DevContainer } from "./DevContainer";
import { DevEnvironment } from "./DevEnvironment";

async function loadEnvironmentData() {
  const config = await loadConfig();
  const root = config?.containerRoot ?? DEFAULT_CONTAINER_ROOT;

  const data: DevEnvironment = {
    path: root,
    config,
    containers: [],
  };

  const containerPaths = await glob(Path.join(root, "*/*/.devcontainer/devcontainer.json"), {
    dot: true,
  });
  for (const cPath of containerPaths) {
    const basePath = Path.dirname(Path.dirname(cPath));
    const id = basePath.slice(root.length + 1);
    const [owner, name] = id.split("/", 2);
    const def: DevContainer = {
      id,
      owner,
      name,
      path: basePath,
      launchUrl: await getContainerLaunchUrl(basePath),
      workspaces: [],
      config: await readJsonFile(cPath),
    };
    const workspacesRoot = Path.join(basePath, "workspaces");
    const workspaces = await glob("*.code-workspace", {
      cwd: workspacesRoot,
      dot: true,
    });

    for (const ws of workspaces) {
      const container = def.path.slice(root.length + 1);
      const name = ws.slice(0, -Path.extname(ws).length);
      const path = Path.join(workspacesRoot, ws);
      const internalPath = Path.join(def.config.workspaceFolder, ws);
      const launchUrl = await getContainerLaunchUrl(basePath, internalPath);

      def.workspaces.push({
        container,
        name,
        launchUrl,
        path,
        internalPath,
        config: await readJsonFile(path),
      });
    }

    data.containers.push(def);
  }

  return data;
}

export async function listContainers() {
  const env = await loadEnvironmentData();
  return env.containers;
}

export function githubUrlToContainerId(containerIdOrUrl: string): string {
  if (containerIdOrUrl.startsWith("https://github.com/")) {
    containerIdOrUrl = containerIdOrUrl.slice("https://github.com/".length);
    if (Path.extname(containerIdOrUrl)) {
      containerIdOrUrl = containerIdOrUrl.slice(0, -Path.extname(containerIdOrUrl).length);
    }
  }
  return containerIdOrUrl;
}

export async function cloneContainer(containerIdOrUrl: string) {
  const containerId = githubUrlToContainerId(containerIdOrUrl);
  const config = await loadConfig();
  const env = await loadEnvironmentData();
  let container = env.containers.find((c) => c.id === containerId);
  if (!container) {
    await clone(containerId, containerId, config?.containerRoot!);
  }
  return container;
}
export async function removeContainer(containerId: string) {
  const env = await loadEnvironmentData();
  let container = env.containers.find((c) => c.id === containerId);
  if (container) {
    await rm(container.path, { force: true, recursive: true });
    const ownerDir = Path.dirname(container.path);
    if (!(await readdir(ownerDir)).length) {
      await rmdir(ownerDir);
    }
  }
}
