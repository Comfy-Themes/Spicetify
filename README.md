![Banner](https://comfy-themes.github.io/Spicetify/banner.png)

---

![Preview](https://comfy-themes.github.io/Spicetify/Comfy/assets/preview.png)

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
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
spicetify apply
```

### Enabling the Comfy extension.

Windows -> **Powershell**:

```powershell
cd "$(spicetify -c | Split-Path)\Themes\Comfy"
Copy-Item Comfy.js ..\..\Extensions
spicetify config extensions Comfy.js
spicetify apply
```

macOS and Linux -> **Bash**:

```bash
cd "$(dirname "$(spicetify -c)")/Themes/Comfy"
mkdir -p ../../Extensions
cp Comfy.js ../../Extensions/.
spicetify config extensions Comfy.js
spicetify apply
```

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

### ⚠️️ Warning
---

The theme part is now updating itself for users using the version of Spicetify equals or greater than `2.8.2`, however, for the extesnion part if you have issues with it :

1. Go [here](https://comfy-themes.github.io/Spicetify/Comfy/Comfy.js)
2. Copy the whole code (sorry for the flashbang)
3. Go into the Spicetify extension folder
4. Open the `Comfy.js` file, paste the code and **save it**
5. Afterwards, in a terminal, run `spicetify apply`
6. Enjoy !

For the users that don't want to update Spicetify to the newest version, do the same with [this](https://comfy-themes.github.io/Spicetify/Comfy/Comfy.js) and paste it in the `user.css` replacing the `@import`.

### 🖌️ Customization

---

Go into your theme folder and open either :

`color.ini` for the colors

`user.css` to modify the code