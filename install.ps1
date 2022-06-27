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
  $sp_dot_dir = "$spicePath\Themes"
  Write-Part "MAKING FOLDER  "; Write-Emphasized "$sp_dot_dir\Comfy"
  Remove-Item -Recurse -Force "$sp_dot_dir\Comfy" -ErrorAction Ignore
  New-Item -Path "$sp_dot_dir\Comfy" -ItemType Directory | Out-Null
  Write-Done

  Write-Part "MAKING FOLDER  "; Write-Emphasized "$sp_dot_dir\Comfy-Chromatic"
  Remove-Item -Recurse -Force "$sp_dot_dir\Comfy-Chromatic" -ErrorAction Ignore
  New-Item -Path "$sp_dot_dir\Comfy-Chromatic" -ItemType Directory | Out-Null
  Write-Done

  Write-Part "MAKING FOLDER  "; Write-Emphasized "$sp_dot_dir\Comfy-Mono"
  Remove-Item -Recurse -Force "$sp_dot_dir\Comfy-Mono" -ErrorAction Ignore
  New-Item -Path "$sp_dot_dir\Comfy-Mono" -ItemType Directory | Out-Null
  Write-Done

  # Clone to .spicetify.
  Write-Part "DOWNLOADING    "; Write-Emphasized $sp_dot_dir
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/color.ini" -UseBasicParsing -OutFile "$sp_dot_dir\Comfy\color.ini"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/user.css" -UseBasicParsing -OutFile "$sp_dot_dir\Comfy\user.css"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/comfy.js" -UseBasicParsing -OutFile "$spicePath\Extensions\comfy.js"
  Write-Done

  Write-Part "DOWNLOADING    "; Write-Emphasized "$sp_dot_dir\Comfy-Chromatic"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Chromatic/color.ini" -UseBasicParsing -OutFile "$sp_dot_dir\Comfy-Chromatic\color.ini"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Chromatic/user.css" -UseBasicParsing -OutFile "$sp_dot_dir\Comfy-Chromatic\user.css"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Chromatic/comfy-chromatic.js" -UseBasicParsing -OutFile "$spicePath\Extensions\comfy-chromatic.js"
  Write-Done

  Write-Part "DOWNLOADING    "; Write-Emphasized "$sp_dot_dir\Comfy-Mono"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Mono/color.ini" -UseBasicParsing -OutFile "$sp_dot_dir\Comfy-Mono\color.ini"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Mono/user.css" -UseBasicParsing -OutFile "$sp_dot_dir\Comfy-Mono\user.css"
  Invoke-WebRequest -Uri "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Mono/comfy-mono.js" -UseBasicParsing -OutFile "$spicePath\Extensions\comfy-mono.js"
  Write-Done

  # Installing.
  Write-Part "INSTALLING `r`n"
  spicetify config extensions comfy.js
  # Pause execution and let user choose which theme they want
  Add-Type -AssemblyName System.Windows.Forms
  Add-Type -AssemblyName System.Drawing

  $form = New-Object System.Windows.Forms.Form
  $form.Text = 'Choose a theme'
  $form.Size = New-Object System.Drawing.Size(300,200)
  $form.StartPosition = 'CenterScreen'

  $okButton = New-Object System.Windows.Forms.Button
  $okButton.Location = New-Object System.Drawing.Point(75,120)
  $okButton.Size = New-Object System.Drawing.Size(75,23)
  $okButton.Text = 'OK'
  $okButton.DialogResult = [System.Windows.Forms.DialogResult]::OK
  $form.AcceptButton = $okButton
  $form.Controls.Add($okButton)

  $cancelButton = New-Object System.Windows.Forms.Button
  $cancelButton.Location = New-Object System.Drawing.Point(150,120)
  $cancelButton.Size = New-Object System.Drawing.Size(75,23)
  $cancelButton.Text = 'Cancel'
  $cancelButton.DialogResult = [System.Windows.Forms.DialogResult]::Cancel
  $form.CancelButton = $cancelButton
  $form.Controls.Add($cancelButton)

  $label = New-Object System.Windows.Forms.Label
  $label.Location = New-Object System.Drawing.Point(10,20)
  $label.Size = New-Object System.Drawing.Size(280,20)
  $label.Text = 'Please choose the theme you wish to apply:'
  $form.Controls.Add($label)

  $listBox = New-Object System.Windows.Forms.ListBox
  $listBox.Location = New-Object System.Drawing.Point(10,40)
  $listBox.Size = New-Object System.Drawing.Size(260,20)
  $listBox.Height = 80

  [void] $listBox.Items.Add('Comfy')
  [void] $listBox.Items.Add('Comfy-Mono')
  [void] $listBox.Items.Add('Comfy-Chromatic')

  $form.Controls.Add($listBox)

  $form.Topmost = $true

  $result = $form.ShowDialog()

  if ($result -eq [System.Windows.Forms.DialogResult]::OK)
  {
    $x = $listBox.SelectedItem
    if ($x -eq 'Comfy')
    {
      spicetify config current_theme Comfy color_scheme Comfy
    }
    elseif ($x -eq 'Comfy-Mono')
    {
      spicetify config current_theme Comfy-Mono color_scheme Mono
    }
    elseif ($x -eq 'Comfy-Chromatic')
    {
      spicetify config current_theme Comfy-Chromatic color_scheme Sunset
    }
    else
    {
      $theme = 'Comfy'
    }
    spicetify config current_theme $theme color_scheme $theme
    spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
    Write-Done
  }
  elseif ($result -eq [System.Windows.Forms.DialogResult]::Cancel)
  {
    Write-Part "CANCELLED `r`n"
    Write-Done
    Exit
  }

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
