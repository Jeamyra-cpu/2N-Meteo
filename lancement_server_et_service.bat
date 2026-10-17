@echo off
title Lancement de 2N-Météo

echo Demarrage du service Python (Chronos)...
start "Service Python - Chronos" cmd /k "cd /d "%~dp0service_python" && py -m uvicorn service_chronos:app --reload --port 8000"

echo Demarrage du serveur Node.js (Express)...
start "Serveur Node.js - Express" cmd /k "cd /d "%~dp0server" && node index.js"

echo Les deux services sont en cours de lancement.