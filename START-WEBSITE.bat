@echo off
title SmartNTech website
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-website.ps1"
pause
