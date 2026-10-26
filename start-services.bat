@echo off
title Political Project - Backends & Cloudflare Tunnels Starter
echo =========================================================
echo   Starting Political Project Backends & Cloudflare Tunnels
echo =========================================================

echo 1. Starting Main Admin API on http://127.0.0.1:8000 ...
start "1. Main Admin API (8000)" cmd /k "cd /d %~dp0field-management-api && php artisan serve --port=8000"

echo 2. Starting Main Cloudflare Tunnel (8000) ...
start "2. Main Tunnel (8000)" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --url http://127.0.0.1:8000"

echo 3. Starting Officer/Worker Backend on http://127.0.0.1:8001 ...
start "3. Officer Backend (8001)" cmd /k "cd /d %~dp0Officer-app\backend && php artisan serve --port=8001"

echo 4. Starting Officer Cloudflare Tunnel (8001) ...
start "4. Officer Tunnel (8001)" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --url http://127.0.0.1:8001"

echo.
echo =========================================================
echo   All 4 services are now running in separate windows!
echo   Keep windows open while testing on phone/web.
echo =========================================================
pause
