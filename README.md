![Banner](https://nyri4.github.io/Comfy-spicetify/assets/banner.png)
--- 

![Preview](https://nyri4.github.io/Comfy-spicetify/assets/preview.png)

### 📥 Installation

Go into your `Themes` folder in `.spicetify` then do :
```sh
git clone https://github.com/NYRI4/Comfy-spicetify
```

#### Windows
In **Powershell**:
```powershell
spicetify config current_theme Comfy-spicetify
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
spicetify apply
```

#### macOS and Linux
In **Bash**:
```bash
spicetify config current_theme Comfy-spicetify
spicetify config inject_css 1 replace_colors 1 overwrite_assets 1
spicetify apply
```

If you want to have the image header on a playlist, move the `Comfy.js` file to the `Extensions` folder and do :

#### Windows
In **Powershell**:
```powershell
cd "$(spicetify -c | Split-Path)\Themes\Comfy-spicetify"
Copy-Item Comfy.js ..\..\Extensions
spicetify config extensions Comfy.js
spicetify apply
```

#### macOS and Linux
In **Bash**:
```bash
cd "$(dirname "$(spicetify -c)")/Themes/Comfy-spicetify"
mkdir -p ../../Extensions
cp Comfy.js ../../Extensions/.
spicetify config extensions Comfy.js
spicetify apply
```

### ⚠️️ Warning
I don't think I can import an external stylesheet from the `user.css`, means that if I do an update, you'll need to `git pull` to stay up-to-date.

### 🖌️ Customization
Go into your theme folder and open either :

`color.ini` for the colors

`user.css` to modify the code

## 🖼️ More preview
| Home | Friend list
| :---------: | :---------: |
| ![Preview](https://nyri4.github.io/Comfy-spicetify/assets/home.png)  | ![Preview](https://nyri4.github.io/Comfy-spicetify/assets/friend-list.png)  |
