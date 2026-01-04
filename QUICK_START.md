# 🚀 Quick Start - Unofficial Branch

Want to use Comfy theme with the **latest** Spicetify and Spotify? Follow this guide!

## ⚠️ Before You Start

This is an **UNOFFICIAL, EXPERIMENTAL** branch:
- ✅ Targets latest versions
- ⚠️ May have bugs
- 🐛 Community-maintained
- 📝 Report issues you find

**Stable version?** Use the `main` branch instead.

## 📋 Requirements

- **Spicetify CLI**: 2.42.7 or newer
- **Spotify Desktop**: 1.2.80 or newer
- **Git**: For cloning the repository

## 🔧 Installation

### Step 1: Install/Update Spicetify

#### Windows (PowerShell as Admin)
```powershell
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex
```

#### macOS/Linux (Terminal)
```bash
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh
```

#### Verify Version
```bash
spicetify -v
# Should show 2.42.7 or higher
```

### Step 2: Update Spotify

1. Open Spotify
2. Help → About Spotify
3. Update if version is below 1.2.80

### Step 3: Install Comfy Theme (Unofficial Branch)

#### Option A: Using Spicetify Marketplace (Easiest)

1. Install marketplace if not already:
   ```bash
   spicetify config-dir
   # Note the path shown
   
   # Download marketplace
   # Windows: Download from https://github.com/spicetify/marketplace
   # macOS/Linux: Follow marketplace installation guide
   ```

2. In Spotify with Marketplace installed:
   - Open Marketplace
   - Go to Themes tab
   - Search for "Comfy"
   - Select **"Comfy (Unofficial - Latest)"**
   - Click Install

#### Option B: Manual Installation (More Control)

##### Windows
```powershell
# Navigate to themes directory
cd $env:APPDATA\spicetify\Themes

# Clone repository
git clone https://github.com/Comfy-Themes/Spicetify
cd Spicetify

# Switch to unofficial branch
git checkout unofficial

# Go back and rename
cd ..
Rename-Item Spicetify Comfy
```

##### macOS/Linux
```bash
# Navigate to themes directory
cd ~/.spicetify/Themes

# Clone repository
git clone https://github.com/Comfy-Themes/Spicetify
cd Spicetify

# Switch to unofficial branch
git checkout unofficial

# Go back and rename
cd ..
mv Spicetify Comfy
```

### Step 4: Apply Theme

```bash
# Set theme
spicetify config current_theme Comfy

# Choose a color scheme (optional, default is "Comfy")
spicetify config color_scheme Comfy

# Enable required settings
spicetify config inject_css 1
spicetify config replace_colors 1
spicetify config overwrite_assets 1
spicetify config inject_theme_js 1

# Apply everything
spicetify apply
```

### Step 5: Restart Spotify

Close and reopen Spotify. Comfy theme should now be active! 🎨

## 🎨 Choosing a Color Scheme

Available schemes:
- `Comfy` (default purple theme)
- `Spotify` (green Spotify style)
- `Nord` (blue-grey Nordic palette)
- `Catppuccin-*` (Mocha, Macchiato, Frappe, Latte)
- `rose-pine-*` (Main, Moon, Dawn)
- `Dracula`
- `Gruvbox-*`
- `Tokyo-Night-*`
- And many more!

To change scheme:
```bash
spicetify config color_scheme <scheme-name>
spicetify apply
```

Preview schemes: [Color Scheme Images](https://github.com/Comfy-Themes/Spicetify/tree/main/images/color-schemes)

## ⚙️ Customization

### Settings Modal

Press `Ctrl+Shift+S` (or `Cmd+Shift+S` on Mac) to open settings.

Or add a button via Spicetify:
```bash
# In settings, enable the settings button
```

### Snippets

Enable/disable features in the settings modal:
- Banner Images
- Custom Playbar
- Topbar Inside Titlebar
- Compact Context Menu
- And more...

### User CSS

Create custom styles:
1. Edit `~/.spicetify/Themes/Comfy/user.css`
2. Add your CSS
3. Run `spicetify apply`

## 🔄 Updating

### Update Theme
```bash
cd ~/.spicetify/Themes/Comfy  # or %APPDATA%\spicetify\Themes\Comfy on Windows
git pull origin unofficial
spicetify apply
```

### Update Spicetify
```bash
# Windows
iwr -useb https://raw.githubusercontent.com/spicetify/cli/main/install.ps1 | iex

# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/spicetify/cli/main/install.sh | sh

# Then reapply
spicetify apply
```

## 🐛 Troubleshooting

### Theme Not Loading

```bash
# Backup and restore
spicetify backup apply
spicetify restore

# Reapply theme
spicetify apply
```

### Visual Glitches

1. Clear Spotify cache:
   - Windows: `%APPDATA%\Spotify\Cache`
   - macOS: `~/Library/Caches/Spotify`
   - Linux: `~/.cache/spotify`

2. Reinstall theme:
   ```bash
   spicetify config current_theme " "
   spicetify apply
   spicetify config current_theme Comfy
   spicetify apply
   ```

### Console Errors

1. Open Spotify
2. Press `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (Mac)
3. Check Console tab for errors
4. Report issues with error messages

### Still Not Working?

1. Verify versions:
   ```bash
   spicetify -v  # Should be 2.42.7+
   # Check Spotify version in app
   ```

2. Check [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for common issues

3. [Open an issue](https://github.com/Comfy-Themes/Spicetify/issues) with:
   - Spicetify version
   - Spotify version
   - OS
   - Error messages
   - Screenshots

## 📚 More Information

- **[UNOFFICIAL_BRANCH_NOTES.md](UNOFFICIAL_BRANCH_NOTES.md)** - Branch overview
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Full testing guide
- **[CONTRIBUTING_UNOFFICIAL.md](CONTRIBUTING_UNOFFICIAL.md)** - How to help
- **[COMPATIBILITY_ANALYSIS.md](COMPATIBILITY_ANALYSIS.md)** - Technical details

## 💬 Community

- **Discord**: [Comfy Camp Server](https://discord.gg/comfy-camp-811203761619337259)
- **Issues**: [GitHub Issues](https://github.com/Comfy-Themes/Spicetify/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Comfy-Themes/Spicetify/discussions)

## ⭐ Enjoying the Theme?

- Star the repository ⭐
- Share with friends 🎵
- Report bugs you find 🐛
- Contribute improvements 💪
- Support the creators ❤️
  - [OhItsTom](https://ko-fi.com/ohitstom)
  - [Nyria](https://ko-fi.com/nyria)

## 🎯 Quick Commands Reference

```bash
# Check versions
spicetify -v
spotify --version

# Apply theme
spicetify config current_theme Comfy
spicetify apply

# Change color scheme
spicetify config color_scheme <scheme>
spicetify apply

# Update theme
cd ~/.spicetify/Themes/Comfy
git pull origin unofficial
spicetify apply

# Backup/Restore
spicetify backup apply
spicetify restore

# Clear and reapply
spicetify clear
spicetify apply
```

---

**Ready?** Let's make your Spotify comfy! 🛋️✨

Need help? Check the docs above or ask in Discord!
