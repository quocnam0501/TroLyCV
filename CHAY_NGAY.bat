@echo off
cd /d "%~dp0"

REM Tu dong phat hien Node.js neu PATH he thong chua kip cap nhat
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

if exist "websuaCV-main\CHAY_NGAY.bat" (
    cd websuaCV-main
    call CHAY_NGAY.bat
) else (
    call npm run dev -- --host
)

