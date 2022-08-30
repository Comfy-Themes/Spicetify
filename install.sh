#!/bin/sh

set -e

echo "Downloading"
# Setup directories to download to
theme_dir="$(dirname "$(spicetify -c)")/Themes"
ext_dir="$(dirname "$(spicetify -c)")/Extensions"

# Make directories if needed
mkdir -p "${theme_dir}/Comfy"
mkdir -p "${ext_dir}"

# Download latest tagged files into correct directories
curl --progress-bar --output "${theme_dir}/Comfy/color.ini" "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/color.ini"
curl --progress-bar --output "${theme_dir}/Comfy/user.css" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy/user.css"
curl --progress-bar --output "${ext_dir}/comfy.js" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy/comfy.js"


# Apply theme
echo "Applying theme"
spicetify config extensions comfy.js
spicetify config current_theme Comfy
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
spicetify apply

echo "All done!"
