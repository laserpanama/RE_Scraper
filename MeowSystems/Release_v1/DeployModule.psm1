function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    "$((Get-Date).ToString('yyyy-MM-dd HH:mm:ss')) [$Level] $Message" | Out-File -Append "$PSScriptRoot\..\logs\deploy.log" -Encoding UTF8
}

function Prepare-Environment {
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\..\dist" | Out-Null
    New-Item -ItemType Directory -Force -Path "$PSScriptRoot\..\logs" | Out-Null
    Write-Log "Environment prepared"
}

function Verify-Checksum {
    param([string]$FilePath, [string]$ExpectedHash)
    $actualHash = (Get-FileHash $FilePath -Algorithm SHA256).Hash.ToUpper()
    if ($actualHash -eq $ExpectedHash.ToUpper()) {
        Write-Log "Checksum verified for $FilePath"
        return $true
    }
    Write-Log "Checksum mismatch" "ERROR"
    return $false
}

function Compress-Source {
    param([string]$SourcePath, [string]$OutputZip)
    if (Test-Path $OutputZip) { Remove-Item $OutputZip -Force }
    Compress-Archive -Path $SourcePath -DestinationPath $OutputZip -Force
    Write-Log "Compressed $SourcePath to $OutputZip"
}

function Sign-Artifact {
    param([string]$FilePath, [string]$CertThumbprint)
    if (-not $CertThumbprint) {
        Write-Log "Skipping signing (no cert)" "WARN"
        return
    }
    & signtool sign /fd SHA256 /a /sha1 $CertThumbprint /tr http://timestamp.digicert.com /td SHA256 $FilePath
    Write-Log "Signed $FilePath"
}

function Transfer-Remote {
    param([string]$LocalPath, [string]$RemotePath, [string]$Host, [string]$User, [int]$Port = 22, [switch]$DryRun)
    if ($DryRun) {
        Write-Log "DRYRUN: scp -P $Port `"$LocalPath`" $User@$Host:`"$RemotePath`""
        return
    }
    scp -P $Port $LocalPath "$User@$Host:`"$RemotePath`""
    Write-Log "Transfer complete"
}

function Finalize-Release {
    param(
        [string]$SourcePath,
        [string]$ExpectedHash,
        [string]$RemotePath,
        [string]$Host,
        [string]$User,
        [string]$CertThumbprint = "",
        [int]$Port = 22,
        [switch]$DryRun
    )
    Prepare-Environment
    $zipPath = "$PSScriptRoot\..\dist\MeowDeploy.zip"
    Compress-Source -SourcePath $SourcePath -OutputZip $zipPath
    if (-not (Verify-Checksum -FilePath $zipPath -ExpectedHash $ExpectedHash)) {
        throw "Checksum failed"
    }
    Sign-Artifact -FilePath $zipPath -CertThumbprint $CertThumbprint
    Transfer-Remote -LocalPath $zipPath -RemotePath $RemotePath -Host $Host -User $User -Port $Port -DryRun:$DryRun
    Write-Log "Release finalized"
}

Export-ModuleMember -Function * -Alias *