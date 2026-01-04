# Unofficial Branch Notes

## Overview

This branch (`unofficial`) is an experimental effort to maintain compatibility with the latest versions of Spicetify CLI and Spotify, beyond the officially supported versions.

## Target Versions

- **Spicetify CLI**: 2.42.7 and newer
- **Spotify**: 1.2.14 - 1.2.80 and newer

## Status

⚠️ **Experimental** - This branch is maintained on a best-effort basis and may contain bugs or compatibility issues.

## Changes from Main Branch

### Updated
- README.md: Added warnings and version information for unofficial branch
- manifest.json: Added "Comfy (Unofficial - Latest)" theme entry with branch pointer

### Verified Compatible
- Spicetify API usage (React, ReactDOM, Config, Platform, Player)
- CSS class mappings based on latest css-map.json from Spicetify CLI
- Theme structure and file organization

### Known Compatible Features
- ✅ Color schemes and theme configuration
- ✅ Banner images and dynamic backgrounds
- ✅ Settings modal and customization options
- ✅ Layout variables and responsive design
- ✅ All theme snippets and features

## Installation

### Using Spicetify Marketplace (Recommended)
Select "Comfy (Unofficial - Latest)" from the themes list.

### Manual Installation
```bash
cd ~/.spicetify/Themes
git clone https://github.com/Comfy-Themes/Spicetify
cd Spicetify
git checkout unofficial
cd ..
mv Spicetify Comfy
spicetify config current_theme Comfy
spicetify config color_scheme <your-choice>
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
spicetify apply
```

## Testing Status

### Tested On
- [ ] Spicetify 2.42.7
- [ ] Spotify 1.2.80

### Feature Testing
- [ ] Theme loads without errors
- [ ] All color schemes work
- [ ] Banner images display correctly
- [ ] Settings modal functions properly
- [ ] All snippets work as expected
- [ ] No console errors

## Reporting Issues

If you encounter issues with this unofficial branch, please:

1. Verify you're using the latest Spicetify and Spotify versions
2. Check if the issue exists in the stable `main` branch
3. [Open an issue](https://github.com/Comfy-Themes/Spicetify/issues) with:
   - Your Spicetify version (`spicetify -v`)
   - Your Spotify version
   - Description of the issue
   - Console errors (if any)
   - Screenshots (if visual issue)

## Contributing

Contributions to keep this branch compatible with latest versions are welcome! Please:

1. Test your changes thoroughly
2. Update this document with any new findings
3. Submit a PR to the `unofficial` branch

## Disclaimer

This is an unofficial, community-maintained branch. The original Comfy theme authors may not actively maintain or support this branch. Use at your own risk.

## Credits

- Original Comfy Theme: [NYRI4](https://github.com/NYRI4)
- Current Maintainer: [OhItsTom](https://github.com/OhItsTom)
- Contributors: [kyrie25](https://github.com/kyrie25) and community

---

Last Updated: 2026-01-04
