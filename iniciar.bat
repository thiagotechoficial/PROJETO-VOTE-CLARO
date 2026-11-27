@echo off
cd /d "%~dp0"
echo Iniciando Voto Claro (API Fastify + Front-end Vite) em http://localhost:5173 ...
call npm.cmd run dev
pause
