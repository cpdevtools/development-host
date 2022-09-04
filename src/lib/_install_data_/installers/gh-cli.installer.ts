import { Installer, AptInstaller, AfterInstallOrUpdate, exec } from "@cpdevtools/lib-node-utilities";

const GitHubCliInstaller: Installer = {
  id: "gh-cli",
  name: "Github Cli",
  categories: ["core"],
  platforms: class GitHubCliInstaller extends AptInstaller implements AfterInstallOrUpdate {
    constructor() {
      super("gh", "Github Cli");
    }
    async afterInstallOrUpdate(): Promise<void> {
      await exec(`gh auth setup-git`);
    }
  },
};

export default GitHubCliInstaller;

//git config --global init.defaultBranch
