#!/bin/sh

set -e

cd "$(dirname "$(spicetify -c)")"

echo "Uninstalling"
cd "$(dirname "$(spicetify -c)")"
spicetify config current_theme "SpicetifyDefault" color_scheme "green-dark" extensions comfy.js-

echo "Deleting files"
while true; do
    read -p "Do you wish to delete theme files? [y/n] " yn </dev/tty
    case $yn in
    [Yy]*)
        ext_dir="$(dirname "$(spicetify -c)")/Extensions"

        rm -rf "$(dirname "$(spicetify -c)")/Themes/Comfy"
        # Use -f to ignore if missing
        rm -f "$ext_dir/comfy.js"
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
