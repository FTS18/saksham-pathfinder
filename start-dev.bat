@echo off
REM Run development server for saksham-pathfinder
cd /d C:\Web\saksham-pathfinder
echo.
echo ========================================
echo Starting Development Server...
echo ========================================
echo.
echo Using Bun (faster package manager)
bun run dev
pause
