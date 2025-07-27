@echo off
cd %~dp0
git remote set-url origin https://github.com/BCRL-tylu/swipes.git >nul 2>&1 || git remote add origin https://github.com/BCRL-tylu/swipes.git
git push -u origin master
