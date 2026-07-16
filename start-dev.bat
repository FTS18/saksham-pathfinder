@echo off
REM Run development server for UpSkillers-pathfinder
cd /d C:\Web\UpSkillers-pathfinder
echo.
echo ========================================
echo Starting Development Server...
echo ========================================
echo.
echo Using Bun (faster package manager)
bun run dev
pause
