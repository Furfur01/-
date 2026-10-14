@echo off
cd /d "%~dp0"
node "scripts\launch-html.mjs"
if errorlevel 1 pause
