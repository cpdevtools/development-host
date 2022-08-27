import { DevContainer } from "./DevContainer.js";

export interface DevEnvironment {
  path: string;
  config: any;
  containers: DevContainer[];
}
