# GPL license.
# Edited from project Denoland install script (https://github.com/denoland/deno_install)
param (
  [string] $version
)

$PSMinVersion = 3

if ($v) {
  $version = $v
}

# Helper functions for pretty terminal output.
function Write-Part ([string] $Text) {
  Write-Host $Text -NoNewline
}

function Write-Emphasized ([string] $Text) {
  Write-Host $Text -NoNewLine -ForegroundColor "Cyan"
}

function Write-Done {
  Write-Host " > " -NoNewline
  Write-Host "OK" -ForegroundColor "Green"
}

if ($PSVersionTable.PSVersion.Major -gt $PSMinVersion) {
  $ErrorActionPreference = "Stop"

  # Enable TLS 1.2 since it is required for connections to GitHub.
  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

  $checkSpice = Get-Command spicetify -ErrorAction Silent
  if ($null -eq $checkSpice) {
    Write-Host -ForegroundColor Red "Spicetify not found"
    Invoke-WebRequest -UseBasicParsing "https://raw.githubusercontent.com/khanhas/spicetify-cli/master/install.ps1" | Invoke-Expression
  }

  # Check ~\.spicetify\Themes directory already exists
  $spicePath = spicetify -c | Split-Path
  $sp_dot_dir = "$spicePath\Themes\Comfy"
  if (-not (Test-Path $sp_dot_dir)) {
    Write-Part "MAKING FOLDER  "; Write-Emphasized $sp_dot_dir
    New-Item -Path $sp_dot_dir -ItemType Directory | Out-Null
    Write-Done
  }

  # Clone to .spicetify.
  Write-Part "DOWNLOADING    "; Write-Emphasized $sp_dot_dir
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/color.ini" -UseBasicParsing -OutFile "$sp_dot_dir\color.ini"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy/user.css" -UseBasicParsing -OutFile "$sp_dot_dir\user.css"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy/comfy.js" -UseBasicParsing -OutFile "$spicePath\Extensions\comfy.js"
  Write-Done

  # Installing.
  Write-Part "INSTALLING";
  spicetify config extensions comfy.js
  spicetify config current_theme Comfy color_scheme Comfy
  spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
  Write-Done

  Write-Part "APPLYING";
  $configFile = Get-Content "$spicePath\config-xpui.ini"
  $backupVer = $configFile -match "^version"
  if ($backupVer.Length -gt 0) {
    spicetify apply
  } else {
    spicetify backup apply
  }
  Write-Done
}
else {
  Write-Part "`nYour Powershell version is less than "; Write-Emphasized "$PSMinVersion";
  Write-Part "`nPlease, update your Powershell downloading the "; Write-Emphasized "'Windows Management Framework'"; Write-Part " greater than "; Write-Emphasized "$PSMinVersion"
}