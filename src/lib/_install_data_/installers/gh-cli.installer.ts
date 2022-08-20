import { BashInstaller, Installer } from "@cpdevtools/lib-node-utilities";

const installOrUpdateScript = `
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
`;

const uninstallOrUpdateScript = `
  sudo apt uninstall gh
`;

const GitHubCliInstaller: Installer = {
  id: "gh-cli",
  name: "Github Cli",
  categories: ["core"],
  platforms: class GitHubCliInstaller extends BashInstaller {
    constructor() {
      super("gh-cli", "Github Cli");
    }
    protected installOrUpdateScript: string = installOrUpdateScript;
    protected updateScript: string = installOrUpdateScript;
    protected uninstallScript: string = ``;
  },
};

export default GitHubCliInstaller;
