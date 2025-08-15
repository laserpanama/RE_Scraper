# Finalizador Maestro - UTF-8 con BOM
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 🔧 Variables
$ReleasePath   = "C:\MeowSystems\Release_v1"
$ModuleSource  = "C:\YOUTUBE\DeployModule.psm1"
$ModuleTarget  = Join-Path $ReleasePath "DeployModule.psm1"
$ChecksumFile  = Join-Path $ReleasePath "Source\checksum.sha256"
$FinalizeScript = Join-Path $ReleasePath "Run-MeowFinalize.ps1"

# 🔍 Validaciones y Creación
New-Item -Path "$ReleasePath\Source" -ItemType Directory -Force | Out-Null
Copy-Item $ModuleSource -Destination $ModuleTarget -Force
if (!(Test-Path $ChecksumFile)) {
    Get-FileHash $ModuleTarget -Algorithm SHA256 |
        Select-Object -ExpandProperty Hash |
        Out-File $ChecksumFile -Encoding ascii
}

# 🧼 Parche en caliente de comillas rotas
(Get-Content $ModuleTarget -Raw) `
    -replace '("\$User@)\$Host:', '${1}${Host}:' |
    Set-Content $ModuleTarget -Encoding UTF8 -Force

# 🚀 Lanzamiento
Write-Host "`n🔁 Ejecutando Run-MeowFinalize.ps1..." -ForegroundColor Cyan
powershell -ExecutionPolicy Bypass -File $FinalizeScript