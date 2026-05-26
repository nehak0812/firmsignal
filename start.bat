@echo off
title FirmSignal Launcher
echo ==========================================
echo       FirmSignal Executive Launcher
echo ==========================================
echo.

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/ to run the FirmSignal server.
    echo.
    pause
    exit /b 1
)

echo [INFO] Node.js detected:
node -v
echo.

:: Check for node_modules
if not exist node_modules (
    echo [INFO] First-time setup: Installing required dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b 1
      )
) else (
    echo [INFO] Dependencies already installed.
)

echo.
echo [INFO] Booting Express intelligence backend...
echo [INFO] Opening dashboard in your default browser at http://localhost:3000...
echo.

:: Start browser after a brief delay
start "" "http://localhost:3000"

:: Launch the server
npm start
