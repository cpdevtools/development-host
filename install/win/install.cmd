@echo off
setlocal
  echo [95m
  echo ************************************************************
  echo.
  echo              Devlopment Environment Installer
  echo.
  echo ************************************************************
  echo [0m

  winget install -e --id OpenJS.NodeJS.LTS
  npm i -g @cpdevools/development-host
endlocal
