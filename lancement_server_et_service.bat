@echo off
setlocal
title Lancement et verification - 2N-Meteo
chcp 65001 > nul

cd /d "%~dp0"

echo ====================================================
echo   VERIFICATION DES DEPENDANCES PYTHON (CHRONOS)
echo ====================================================

:: Verification et installation automatique des paquets Python
py -m pip install torch fastapi uvicorn pydantic chronos-forecasting

echo.
echo ====================================================
echo   VERIFICATION DE CHRONOS
echo ====================================================
py -m pip show chronos-forecasting | findstr /C:"Version:"

echo.
echo ====================================================
echo   VERIFICATION DES DEPENDANCES FRONTEND / NODE.JS
echo ====================================================
if not exist "%~dp0node_modules" (
    echo Le dossier node_modules du frontend est absent. Installation des paquets du projet...
    call npm install
) else (
    echo Dépendances frontend déjà installées.
)

if not exist "%~dp0server\node_modules" (
    echo Le dossier node_modules du serveur est absent. Installation des paquets Node.js...
    cd /d "%~dp0server"
    call npm install
) else (
    echo Dépendances serveur Node.js déjà installées.
)

echo.
echo ====================================================
echo   DEMARRAGE DES SERVICES
echo ====================================================

echo Démarrage du service Python (Chronos)...
start "Service Python - Chronos" cmd /k "cd /d ""%~dp0service_python"" && py -m uvicorn service_chronos:app --reload --port 8000"

echo Démarrage du serveur Node.js (Express)...
start "Serveur Node.js - Express" cmd /k "cd /d ""%~dp0server"" && npm run dev"

echo Démarrage du frontend Vite (React)...
start "Frontend React - Vite" cmd /k "cd /d ""%~dp0"" && npm run dev"

echo.
echo Tous les services sont en cours de démarrage.
echo.
echo Appuyez sur une touche pour fermer cette fenêtre ou laissez les fenêtres de services ouvertes.
pause > nul
endlocal