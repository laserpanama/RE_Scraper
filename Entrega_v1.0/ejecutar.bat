@echo off
setlocal
cd /d %~dp0

REM Crear venv si no existe
if not exist venv\Scripts\python.exe (
  echo [Meow] Creando entorno virtual...
  py -m venv venv 2>nul || python -m venv venv
)

echo [Meow] Instalando dependencias...
venv\Scripts\python -m pip install --upgrade pip >nul
venv\Scripts\pip install -r requirements.txt

echo [Meow] Ejecutando lanzador...
venv\Scripts\python launcher.py
endlocal
