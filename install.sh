#!/bin/sh

set -e

echo "Downloading"
# Setup directories to download to
spice_dir="$(dirname "$(spicetify -c)")"
theme_dir="${spice_dir}/Themes"
ext_dir="${spice_dir}/Extensions"

# Make directories if needed
mkdir -p "${theme_dir}/Comfy"
mkdir -p "${ext_dir}"

# Download latest tagged files into correct directories
theme_url="https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy"
curl --progress-bar --output "${theme_dir}/Comfy/color.ini" "${theme_url}/color.ini" &
curl --progress-bar --output "${theme_dir}/Comfy/user.css" "${theme_url}/user.css" &
curl --progress-bar --output "${ext_dir}/comfy.js" "${theme_url}/comfy.js"

# Apply theme
echo "Applying theme"
spicetify config current_theme Comfy color_scheme Comfy extensions comfy.js
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
spicetify apply

echo "All done!"
