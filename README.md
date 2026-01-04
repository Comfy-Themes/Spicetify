<table>
  <tr>
    <td>
      <img align="right" src="./images/preview.png" alt="Preview" width="50%">
      <div align="center">
        <img align="center" src="https://i.imgur.com/gWx75QA.png" alt="Logo" width="70" height="90">
        <h3 align="center">Comfy Spicetify</h3>
        <p align="center">Stay comfy while listening to music</p>
        <a href="https://github.com/Comfy-Themes/Spicetify/issues">Report an issue</a> ・ <a href="https://discord.gg/comfy-camp-811203761619337259">Join the support server</a> ・
        <a href="Comfy/README.md">Preview images</a>
      </div>
      <hr>
      <h4> ⚠️ UNOFFICIAL BRANCH</h4>
        <p>This is an <strong>unofficial experimental branch</strong> targeting the latest Spicetify and Spotify versions. Use at your own risk!</p>
      <hr>
      <h4> 🎯 Target Versions</h4>
        <li>🔥 Spicetify: <code><a href="https://github.com/spicetify/spicetify-cli/releases/tag/v2.42.7">2.42.7</a></code> (and newer)</li>
        <li>🟢 Spotify: <code>1.2.14 - 1.2.80</code> (and newer)</li>
      <hr>
      <h4> 📝 Original Recommended Versions (Stable)</h4>
        <li>🔥 Spicetify: <code><a href="https://github.com/spicetify/spicetify-cli/releases/tag/v2.38.3">2.38.5</a></code></li>
        <li>🟢 Spotify: <code><a href="https://docs.google.com/spreadsheets/d/1wztO1L4zvNykBRw7X4jxP8pvo11oQjT0O5DvZ_-S4Ok/edit#gid=803394557&range=D2">1.2.51</a></code></li>
      <hr>
    </td>
  </tr>
</table>

### 📥 Automatic Installation

---

Windows -> **PowerShell**:

```powershell
iwr -useb https://raw.githubusercontent.com/NYRI4/Comfy-spicetify/main/install.ps1 | iex
```

macOS and Linux -> **Bash**:

```bash
curl -fsSL https://raw.githubusercontent.com/NYRI4/Comfy-spicetify/main/install.sh | sh
```

### 📥 Manual Installation

---

### Downloading Comfy.

CD into your `Themes` folder in `.spicetify` and run :

```sh
git clone https://github.com/Comfy-Themes/Spicetify
```

Rename the folder to `Comfy` and run these commands to apply :

```powershell
spicetify config current_theme Comfy
spicetify config color_scheme <option>
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
spicetify apply
```

#### For Unofficial/Latest Branch

To use the unofficial branch targeting latest Spicetify/Spotify versions:

```sh
git checkout unofficial
```

Then apply the same configuration commands above.

#### choosing color_scheme
To choose the perfect color for your setup you can look at images [here](https://github.com/Comfy-Themes/Spicetify/tree/main/images/color-schemes)!
The color schemes with folders like [here](https://github.com/Comfy-Themes/Spicetify/tree/main/images/color-schemes/rose-pine) ussually means you need to combine 

{folder_name}-{file_name}
you can find all available color_schemes in the [colot.ini](https://github.com/Comfy-Themes/Spicetify/blob/main/Comfy/color.ini) file.
```powershell
spicetify config color_scheme rose-pine-moon
```

### ⚠️️ Warning

---

**IMPORTANT:** This `unofficial` branch is experimental and targets the latest versions of Spicetify and Spotify. 

- ✅ **For stable experience:** Use the `main` branch with recommended versions above
- ⚡ **For bleeding edge:** Use this `unofficial` branch with latest versions
- 🐛 **Expect issues:** This branch may have bugs or compatibility issues
- 📝 **Report problems:** [Open an issue](https://github.com/Comfy-Themes/Spicetify/issues) if you encounter problems

The theme automatically updates for users using the version of Spicetify equals or greater than `2.8.2`, however, for the users that don't want to update Spicetify to the newest version:

1. Go [here](https://comfy-themes.github.io/Spicetify/Comfy/theme.script.js)
2. Copy the whole code (sorry for the flashbang)
3. Go into the Spicetify/themes/Comfy folder.
4. Open the `theme.js` file, paste the code and **save it**
5. Afterwards, in a terminal, run `spicetify apply`
6. Enjoy !

For the users that don't want to update Spicetify to the newest version, do the same with [this](https://comfy-themes.github.io/Spicetify/Comfy/app.css) and paste it in the `user.css` replacing the `@import`.

### 🖌️ Customization

---

Go into your theme folder and open either :

`color.ini` for the colors

`user.css` for styling

`theme.js` for settings

### ♥ Donation Guide

---

Thinking of donating? Please consider what you value most when deciding who to donate to:

- Theme & Extension Maintenance - [OhItsTom](https://ko-fi.com/ohitstom)
- Theme Design - [Nyria](https://ko-fi.com/nyria)
