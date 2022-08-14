export interface DevWorkspace {
  name: string;
  container: string;
  path: string;
  internalPath: string;
  config: any;
  launchUrl?: string;
  hostLaunchUrl?: string;
}
