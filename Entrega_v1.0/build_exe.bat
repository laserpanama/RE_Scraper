@echo off
setlocal
cd /d %~dp0
if not exist venv\Scripts\python.exe (
  py -m venv venv 2>nul || python -m venv venv
)
venv\Scripts\python -m pip install --upgrade pip >nul
venv\Scripts\pip install pyinstaller

if not exist logo_meow.ico (
  echo [Meow] No se encontr¢ logo_meow.ico. Se crear  el .exe sin icono personalizado.
  venv\Scripts\pyinstaller --noconsole --onefile --name MeowSystems_Encuentra24 launcher.py
) else (
  venv\Scripts\pyinstaller --noconsole --onefile --icon=logo_meow.ico --name MeowSystems_Encuentra24 launcher.py
)

echo [Meow] EXE listo en .\dist\MeowSystems_Encuentra24.exe
pause
endlocal
