#!/bin/sh

set -e

echo "Downloading"
# Setup directories to download to
theme_dir="$(dirname "$(spicetify -c)")/Themes"
ext_dir="$(dirname "$(spicetify -c)")/Extensions"

# Make directories if needed
mkdir -p "${theme_dir}"
mkdir -p "${ext_dir}"

# Download latest tagged files into correct directories
curl --progress-bar --output "${theme_dir}/Comfy/color.ini" "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/color.ini"
curl --progress-bar --output "${theme_dir}/Comfy/user.css" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy/user.css"
curl --progress-bar --output "${ext_dir}/comfy.js" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy/comfy.js"

curl --progress-bar --output "${theme_dir}/Comfy-Mono/color.ini" "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Mono/color.ini"
curl --progress-bar --output "${theme_dir}/Comfy-Mono/user.css" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy-Mono/user.css"
curl --progress-bar --output "${ext_dir}/comfy-mono.js" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy-Mono/comfy-mono.js"

curl --progress-bar --output "${theme_dir}/Comfy-Chromatic/color.ini" "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy-Chromatic/color.ini"
curl --progress-bar --output "${theme_dir}/Comfy-Chromatic/user.css" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy-Chromatic/user.css"
curl --progress-bar --output "${ext_dir}/comfy-chromatic.js" "https://raw.githubusercontent.com/comfy-themes/Spicetify/main/Comfy-Chromatic/comfy-chromatic.js"

echo "Applying theme"
spicetify config extensions Comfy.js
spicetify config current_theme Comfy color_scheme Comfy
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
spicetify apply

echo "All done!"
