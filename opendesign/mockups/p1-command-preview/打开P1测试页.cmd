@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-preview.ps1"
if errorlevel 1 pause
if errorlevel 1 exit /b 1
start "" "http://127.0.0.1:8390/opendesign/mockups/p1-command-preview/index.html"
