@echo off
wsl --status > nul 2>&1 || goto installWSL

wsl --update
echo wsl --shutdown
wsl --shutdown
wsl --set-default-version 2 > nul 2>&1
echo WSL ready.

set "repo=https://raw.githubusercontent.com/cpdevtools/development-host/main"
set "rng=%random%%random%%random%"
set "tmpPath=%temp%\cpdevtools\development-host\win11\%rng%"
mkdir %tmpPath% > nul 2>&1
curl --ssl --silent  %repo%/install/win/install-host.cmd > %tmpPath%\install.cmd
cd %tmpPath%
install.cmd

goto :eof


:installWSL
echo Installing Windows Subsystem for Linux. This can take a while...
wsl --install

reg add "HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\RunOnce" /v "devHostInstaller" /d "%tmpPath%\install.cmd" /f
echo.
echo.
echo.
echo Enabled Windows Subsystem for Linux. Please restart your computer and run this script again.
echo.
echo Press any key to restart, or press ctrl+c to exit.
echo.
pause
shutdown -r -t 0
