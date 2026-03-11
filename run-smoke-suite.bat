@echo off
setlocal
npm.cmd run smoke -- %*
exit /b %errorlevel%
