import { DevContainer } from "./DevContainer";

export interface DevEnvironment {
  path: string;
  config: any;
  containers: DevContainer[];
}
