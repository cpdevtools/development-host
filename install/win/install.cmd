@echo off
setlocal
  : if there is no winget display error
  winget --version > nul 2>&1 || goto :missingWinget
  : if there is no nodejs install it
  node --version > nul 2>&1 || goto :nodeInstall

  : parse node version
  for /F "tokens=1,2,3 delims=.v" %%a in ('node --version') do (
    set major=%%a
    set minor=%%b
    set revision=%%c
  )

  : if nodejs is below 16 update it
  if %major% LSS 16 goto :nodeUpdate

 : INSTALL THE CLI
  goto :nodeReady

:missingWinget
  echo [94m
  echo ************************************************************
  echo.
  echo                Error: Could not find winget.
  echo           Please make sure it is install propertly
  echo                 from the microsoft store
  echo.
  echo ************************************************************
  echo [0m
  goto :eof


:nodeInstall
  call winget install -e --id OpenJS.NodeJS.LTS
  goto :nodeReady

:nodeUpdate
  call winget upgrade -he --id OpenJS.NodeJS.LTS
  goto :nodeReady

:nodeReady
  call set PATH=%PATH%;C:\Program Files\nodejs;%appdata%s\npm
  call npm install --location=global typescript ts-node @cpdevtools/development-host@latest
  call devhost install
endlocal
