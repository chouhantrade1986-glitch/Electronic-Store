@echo off
cd /d "%~dp0"
start "ElectroMart Launcher" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0open-electromart.ps1"
