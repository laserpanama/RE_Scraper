# =========================
# Crear estructura MeowSystems lista
# =========================
$BasePath = "C:\MeowSystems\AuditLauncher"
$ExtraLogsPath = Join-Path $BasePath "ExtraLogs"
$AuditPath = Join-Path $BasePath "Audit"
$LogsPath = Join-Path $AuditPath "Logs"

# Crear carpetas
$paths = @($BasePath, $ExtraLogsPath, $AuditPath, $LogsPath)
foreach ($p in $paths) {
    if (-not (Test-Path $p)) {
        New-Item -ItemType Directory -Path $p -Force | Out-Null
    }
}

# Guardar script principal
$MainScript = @"
PASTE_AQUI_EL_CONTENIDO_DEL_MeowAudit_OneShot.ps1
"@
Set-Content -Path (Join-Path $BasePath "MeowAudit-OneShot.ps1") -Value $MainScript -Encoding UTF8

# Guardar lanzador .bat
$BatScript = @"
@echo off
:: MeowAudit-Run.bat
setlocal enableextensions enabledelayedexpansion
set SCRIPT_PATH=C:\MeowSystems\AuditLauncher\MeowAudit-OneShot.ps1
set LOG_DIR=C:\MeowSystems\AuditLauncher\ExtraLogs
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"
for /f "tokens=1-4 delims=/ " %%a in ("%date%") do (
    set YYYY=%%d
    set MM=%%b
    set DD=%%c
)
for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
    set HH=%%a
    set MIN=%%b
)
set TIMESTAMP=%YYYY%%MM%%DD%_%HH%%MIN%
set LOG_FILE=%LOG_DIR%\Run_%TIMESTAMP%.log
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Elevando privilegios de administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)
echo [INFO] Ejecutando MeowAudit-OneShot.ps1...
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_PATH%" ^> "%LOG_FILE%" 2^>^&1
echo.
echo [OK] Ejecución finalizada. Log extra en: %LOG_FILE%
pause
"@
Set-Content -Path (Join-Path $BasePath "MeowAudit-Run.bat") -Value $BatScript -Encoding OEM

# Crear ZIP con todo
$ZipDest = "C:\MeowSystems_Package.zip"
if (Test-Path $ZipDest) { Remove-Item $ZipDest -Force }
Compress-Archive -Path "C:\MeowSystems" -DestinationPath $ZipDest -Force

Write-Host "`n✅ Paquete creado en: $ZipDest" -ForegroundColor Green
