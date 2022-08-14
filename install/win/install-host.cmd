

@echo off
setlocal
  set "repo=https://raw.githubusercontent.com/cpdevtools/development-host/main"

  for /f "tokens=2*" %%a in ('HKEY_LOCAL_MACHINE\SOFTWARE\cpdevtools\development-host" /v Path') do set installPath=%%b

  if not defined installPath (
      set "installPath=%programdata%\development-host"
  )

  set /p "installPathPrompt=Install directory (%installPath%): "

  if defined installPathPrompt (
      set "installPath=%installPathPrompt%"
  )

  reg add "HKEY_LOCAL_MACHINE\SOFTWARE\cpdevtools\development-host" /v "Path" /d "%installPath%" /f

  echo %installPath%

  if exist %installPath% (
    if exist %installPath%/ext4.vhdx (
      goto :installed
    )
  )

  del /q /s %installPath%/tmp
  mkdir %installPath%/tmp

  echo [96mDownloading [93mUbuntu[96m...[0m

  cd %installPath%/tmp
  curl -L https://wslstorestorage.blob.core.windows.net/wslblob/CanonicalGroupLimited.Ubuntu20.04onWindows_2004.2021.825.0.AppxBundle > ubuntu2004Bundle.zip

  echo [96mExtracting [93mUbuntu[96m...[0m

  powershell.exe -noexit "Expand-Archive -Force -Path ubuntu2004Bundle.zip -DestinationPath ubuntu2004Bundle"
  cd ubuntu2004Bundle
  rename Ubuntu_2004.2021.825.0_x64.appx ubuntu.zip
  powershell.exe -noexit "Expand-Archive -Force -Path ubuntu.zip -DestinationPath ubuntu"

  echo [96mInstalling [93mUbuntu[96m...[0m
  cd ubuntu
  wsl --import DevlopmentContainerHost install.tar.gz %installPath%


:installed
  cd %installPath%
  del /q /s tmp

  for /f "tokens=* USEBACKQ" %%F in (`wsl -d DevlopmentContainerHost --cd ~ bash -ic whoami`) do (set ubuntuUser=%%F)

  if "%ubuntuUser%" == "root" (
    echo [96mCreate [93mUbuntu user[96m[0m

    :chooseUser
    set /p "uname=Username: "

    if not defined uname (
      echo Username is required.
      goto :chooseUser
    )

    wsl -d DevlopmentContainerHost --cd ~ bash -ic "adduser %uname% && usermod -aG sudo %uname%"
    wsl -d DevlopmentContainerHost --cd ~ bash -ic "echo "[user]" >> /etc/wsl.conf && echo "default=%uname%" >> /etc/wsl.conf"
    echo [96mCreated [93mUser[96m[0m

    echo [96mRestarting [93mUbuntu[96m...[0m
    wsl -t DevlopmentContainerHost

    echo [96mDownloading [93mDCH for Ubuntu[96m...[0m
    wsl -d DevlopmentContainerHost --cd ~ bash -ic "curl --ssl %repo%/install/linux/install.sh -o ~/dch-install.sh && chmod +x ~/dch-install.sh && ~/dch-install.sh"
  )
endlocal


