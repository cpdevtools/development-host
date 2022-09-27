import { Installer, AptInstaller, AfterInstallOrUpdate, exec, BeforeInstall } from "@cpdevtools/lib-node-utilities";

const GitHubCliInstaller: Installer = {
  id: "gh-cli",
  name: "Github Cli",
  categories: ["core"],
  platforms: class GitHubCliInstaller extends AptInstaller implements BeforeInstall, AfterInstallOrUpdate {
    constructor() {
      super("gh", "Github Cli");
    }
    async beforeInstall(): Promise<boolean | void> {
      await exec(
        `curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \\
&& sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \\
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \\
&& sudo apt update`
      );
    }
    async afterInstallOrUpdate(): Promise<void> {
      await exec(`gh auth setup-git`);
    }
  },
};

export default GitHubCliInstaller;

//git config --global init.defaultBranch
