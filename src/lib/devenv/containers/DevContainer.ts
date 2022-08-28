import { DevWorkspace } from "./DevWorkspace.js";

export interface DevContainer {
  id: string;
  name: string;
  owner: string;
  path: string;
  config: any;
  launchUrl?: string;
  hostLaunchUrl?: string;
  workspaces: DevWorkspace[];
}
