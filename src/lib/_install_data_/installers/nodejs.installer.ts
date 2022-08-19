import { BashInstaller, Installer } from "@cpdevtools/lib-node-utilities";

const installOrUpdateScript = `
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm install 16

`;

const NodeJSInstaller: Installer = {
  id: "nodejs",
  name: "Node JS",
  categories: ["core"],
  platforms: class NodeJSBashInstaller extends BashInstaller {
    constructor() {
      super("nodejs", "Node JS", undefined, ["nvm"]);
    }
    protected installOrUpdateScript: string = installOrUpdateScript;
    protected updateScript: string = installOrUpdateScript;
    protected uninstallScript: string = ``;
  },
};

export default NodeJSInstaller;
