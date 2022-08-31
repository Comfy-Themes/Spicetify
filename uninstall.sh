#!/bin/sh

set -e

echo "Uninstalling"
spicetify config current_theme "SpicetifyDefault" color_scheme "green-dark" extensions comfy.js-

echo "Deleting files"
while true; do
    read -p "Do you wish to delete theme files? [y/n] " yn </dev/tty
    case $yn in
    [Yy]*)
        spice_dir="$(dirname "$(spicetify -c)")"
        theme_dir="${spice_dir}/Themes"
        ext_dir="${spice_dir}/Extensions"

        rm -rf "${theme_dir}/Comfy"
        # Use -f to ignore if missing
        rm -f "${ext_dir}/comfy.js"
        break
        ;;
    [Nn]*)
        echo "Skipping deletion."
        break
        ;;
    *) echo "Please answer yes or no." ;;
    esac
done

spicetify apply
