@echo off
chcp 65001 >nul
cd /d "%~dp0"
title TroLyCV - Tro Ly Tao va Toi Uu CV Sinh Vien

echo ======================================================================
echo           CHUONG TRINH KHOI CHAY TROLYCV (AUTO RUNNER)
echo ======================================================================
echo.

REM 1. Kiem tra Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    if exist "C:\Program Files\nodejs\node.exe" (
        set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"
    ) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
        set "PATH=C:\Program Files (x86)\nodejs;%APPDATA%\npm;%PATH%"
    ) else if exist "%LOCALAPPDATA%\Programs\node\node.exe" (
        set "PATH=%LOCALAPPDATA%\Programs\node;%APPDATA%\npm;%PATH%"
    )
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] May tinh cua ban chua cai dat Node.js!
    echo Vui long tai va cai dat Node.js LTS tai: https://nodejs.org/
    echo Sau khi cai dat xong, hay mo lai file nay.
    echo.
    pause
    exit /b 1
)

echo [1/3] Da phat hien Node.js:
node -v
call npm -v
echo.

REM 2. Kiem tra thu muc node_modules
if not exist "node_modules\" (
    echo [2/3] Chua co thu vien dependencies. Dang tu dong cai dat [npm install]...
    echo Qua trinh nay co the mat 1-2 phut trong lan dau tien...
    call npm install
    if %errorlevel% neq 0 (
        echo [LOI] Cai dat dependencies that bai! Vui long kiem tra ket noi mang.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Thu vien dependencies da san sang.
)

echo.
echo [3/3] Dang khoi chay may chu TroLyCV tai http://localhost:5180/ ...
echo.

REM Mo trinh duyet sau 1 giay
start "" http://localhost:5180/

REM Khoi chay Vite dev server
call npm run dev -- --host

if %errorlevel% neq 0 (
    echo.
    echo [LOI] May chu gap loi khi khoi chay.
    pause
)
