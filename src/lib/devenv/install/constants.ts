import path from "path";

export const INSTALL_NAME = "DevelopmentContainerHost";
export const INSTALL_TEMP_DIR = ".temp";
export const INSTALL_DIR = "install";
export const INSTALL_ID = "Canonical.Ubuntu.2204";
export const INSTALL_UBUNTU_DOWNLOAD_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.bundle.zip");
export const INSTALL_UBUNTU_X86_DEST_FILE = path.join(INSTALL_TEMP_DIR, "ubuntu.x86.zip");
export const INSTALL_UBUNTU_X86_SOURCE_FILE = /Ubuntu_2204\..*?_x64\.appx/;
export const INSTALL_UBUNTU_INSTALL_FILE = path.join(INSTALL_DIR, "install.tar.gz");
