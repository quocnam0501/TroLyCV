@echo off
cd /d "%~dp0"
if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
)
call CHAY_NGAY.bat

