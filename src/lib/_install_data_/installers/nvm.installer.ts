import { BashInstaller, Installer } from "@cpdevtools/lib-node-utilities";

const installOrUpdateScript = `
curl https://raw.githubusercontent.com/creationix/nvm/master/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
nvm --version
`;

const NvmInstaller: Installer = {
  id: "nvm",
  name: "Node Version Manager",
  categories: ["core"],
  platforms: class NvmAptInstaller extends BashInstaller {
    constructor() {
      super("nvm", "Node Version Manager");
    }
    protected installOrUpdateScript: string = installOrUpdateScript;
    protected updateScript: string = installOrUpdateScript;
    protected uninstallScript: string = ``;
  },
};

export default NvmInstaller;
