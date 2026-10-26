@echo off
title Political Project - Backend & Cloudflare Tunnel Starter
echo =========================================================
echo   Starting Political Project Backend & Cloudflare Tunnel
echo =========================================================

echo 1. Starting Laravel Backend on http://127.0.0.1:8000 ...
start "Laravel Backend API" cmd /k "cd /d %~dp0field-management-api && php artisan serve --port=8000"

echo 2. Starting Cloudflare Tunnel ...
start "Cloudflare Tunnel" cmd /k "cd /d %~dp0 && cloudflared.exe tunnel --url http://127.0.0.1:8000"

echo.
echo =========================================================
echo   Both services are now running in separate windows!
echo   Keep those windows open while testing.
echo   Copy the https://xxxx.trycloudflare.com URL from the tunnel window.
echo =========================================================
pause
