@echo off
setlocal
  echo [95m
  echo ************************************************************
  echo.
  echo              Devlopment Environment Installer
  echo.
  echo ************************************************************
  echo [0m

  call winget install -e --id OpenJS.NodeJS.LTS
  call npm i --location=global @cpdevtools/development-host@latest
endlocal
