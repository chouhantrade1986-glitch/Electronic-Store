@echo off
cd /d "%~dp0"
title ElectroMart 1-Click Online Live Demo
start "ElectroMart Online Launcher" powershell -NoExit -ExecutionPolicy Bypass -File "%~dp0open-electromart-online.ps1"
