@echo off
title Vive Plante - Iniciando Sistema

echo =========================================
echo   VIVE PLANTE - Iniciando Backend...
echo =========================================
start "Backend - Vive Plante" cmd /k "cd /d c:\src\Vive_plante\backend && python -m uvicorn main:app --reload"

echo Aguardando backend iniciar...
timeout /t 4 /nobreak > nul

echo =========================================
echo   VIVE PLANTE - Iniciando Frontend...
echo =========================================
start "Frontend - Vive Plante" cmd /k "cd /d c:\src\Vive_plante\frontend && npm run dev"

echo Aguardando frontend iniciar...
timeout /t 5 /nobreak > nul

echo =========================================
echo   Abrindo no navegador...
echo =========================================
start "" "http://localhost:5173"
start "" "http://localhost:5173/admin/dashboard"

echo.
echo Sistema iniciado! Feche esta janela se quiser.
echo  - Site publico: http://localhost:5173
echo  - Painel admin: http://localhost:5173/admin/dashboard
echo  - API backend:  http://localhost:8000/docs
pause
