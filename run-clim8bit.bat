@echo off
REM CLIM8BIT launcher - runs Laravel backend (PHP server) and Vite dev server

REM Change to this script's directory (C:\IT110\CLIM8BIT)
cd /d "%~dp0"

REM Go into the Laravel backend folder
cd clim8bit-backend

echo Starting Laravel PHP server on http://127.0.0.1:8000 ...
start "CLIM8BIT PHP" cmd /k "php artisan serve"

echo Starting Vite dev server ...
start "CLIM8BIT Vite" cmd /k "npm run dev"

echo.
echo Both servers are starting. Open your browser to: http://127.0.0.1:8000
echo You can close this window; the two server windows will stay open.
pause


