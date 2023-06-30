<table>
  <tr>
    <td>
      <img align="right" src="https://comfy-themes.github.io/Spicetify/Comfy/preview/preview.png" alt="Preview" width="50%">
      <div align="center">
        <img align="center" src="https://i.imgur.com/gWx75QA.png" alt="Logo" width="70" height="90">
        <h3 align="center">Comfy Spicetify</h3>
        <p align="center">Stay comfy while listening to music</p>
        <a href="https://github.com/Comfy-Themes/Spicetify/issues">Report an issue</a> ・ <a href="https://discord.gg/comfy-camp-811203761619337259">Join the support server</a>
      </div>
      <hr>
      <h4> ✅ Supported</h4>
        <li>🔥 Spicetify : <code><=2.20.1</code></li>
        <li>🟢 Spotify : <code><=1.2.13</code></li>
      <hr>
    </td>
  </tr>
</table>

### Note

**This branch mainly exists for users who would like to use a version of spotify that still supports the use of the old sidebar**


### 📥 Manual Installation

---

### Downloading Comfy.

CD into your `Themes` folder in `spicetify` and run :

```sh
git clone -b legacy https://github.com/Comfy-Themes/Spicetify
```

Rename the folder to `Comfy` and run these commands to apply :

```powershell
spicetify config current_theme Comfy
spicetify config color_scheme <option>
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1 inject_theme_js 1
spicetify apply
```

### ⚠️️ Warning

---

This version of the theme only works with the old spotify sidebar, this branch will not receive updates or accept PRs.

### 🖌️ Customization

---

Go into your theme folder and open either :

`color.ini` for the colors

`user.css` to modify the code
