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

  # Check ~\.spicetify\Themes directory already exists
  $spicePath = spicetify -c | Split-Path
  $sp_dot_dir = "$spicePath\Themes"
  Write-Part "REMOVING FOLDER  "; Write-Emphasized "$sp_dot_dir\Comfy"
  Remove-Item -Recurse -Force "$sp_dot_dir\Comfy" -ErrorAction Ignore
  Write-Done

  Write-Part "REMOVING FOLDER  "; Write-Emphasized "$sp_dot_dir\Comfy-Chromatic"
  Remove-Item -Recurse -Force "$sp_dot_dir\Comfy-Chromatic" -ErrorAction Ignore
  Write-Done

  Write-Part "REMOVING FOLDER  "; Write-Emphasized "$sp_dot_dir\Comfy-Mono"
  Remove-Item -Recurse -Force "$sp_dot_dir\Comfy-Mono" -ErrorAction Ignore
  Write-Done

  Write-Part "REMOVING  "; Write-Emphasized "$spicePath\Extensions\comfy.js"
  Remove-Item -Force "$spicePath\Extensions\comfy.js" -ErrorAction Ignore
  Write-Done

  Write-Part "REMOVING  "; Write-Emphasized "$spicePath\Extensions\comfy-mono.js"
  Remove-Item -Force "$spicePath\Extensions\comfy-mono.js" -ErrorAction Ignore
  Write-Done

  Write-Part "REMOVING  "; Write-Emphasized "$spicePath\Extensions\comfy-chromatic.js"
  Remove-Item -Force "$spicePath\Extensions\comfy-chromatic.js" -ErrorAction Ignore
  Write-Done

  spicetify config current_theme " "
  spicetify config color_scheme " "
  spicetify config extensions comfy.js-
  spicetify config extensions comfy-mono.js-
  spicetify config extensions comfy-chromatic.js-

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
