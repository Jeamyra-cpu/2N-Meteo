@echo off
title Lancement et verification - 2N-Meteo
chcp 65001 > nul

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
echo   VERIFICATION DU SERVEUR NODE.JS
echo ====================================================
if not exist "%~dp0server\node_modules" (
    echo Le dossier node_modules est absent. Installation des paquets Node.js...
    cd /d "%~dp0server"
    call npm install
) else (
    echo Dépendances Node.js déjà installées.
)

echo.
echo ====================================================
echo   DEMARRAGE DES SERVICES
echo ====================================================

echo Démarrage du service Python (Chronos)...
start "Service Python - Chronos" cmd /k "cd /d "%~dp0service_python" && py -m uvicorn service_chronos:app --reload --port 8000"

echo Démarrage du serveur Node.js (Express)...
start "Serveur Node.js - Express" cmd /k "cd /d "%~dp0server" && node index.js"

echo.
echo Tous les services sont opérationnels.