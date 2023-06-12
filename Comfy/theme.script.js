(async function comfy() {
  if (
    !(
      Spicetify.Player?.data &&
      Spicetify.Menu &&
      Spicetify.LocalStorage &&
      Spicetify.Platform &&
	    Spicetify.AppTitle &&
      document.querySelector(".Root__main-view")
    )
  ) {
    setTimeout(comfy, 300);
    return;
  }
  await initComfy();
})();

async function initComfy() {
  const { Player, Platform } = Spicetify;
  const main = document.querySelector(".Root__main-view");
  const libX = document.querySelector(".nav-ylx");

  // SETTINGS MENU
  let svg = `<svg viewBox="0 0 262.394 262.394" style="scale: 0.5; fill: var(--spice-text)"><path d="M245.63,103.39h-9.91c-2.486-9.371-6.197-18.242-10.955-26.432l7.015-7.015c6.546-6.546,6.546-17.159,0-23.705 l-15.621-15.621c-6.546-6.546-17.159-6.546-23.705,0l-7.015,7.015c-8.19-4.758-17.061-8.468-26.432-10.955v-9.914 C159.007,7.505,151.502,0,142.244,0h-22.091c-9.258,0-16.763,7.505-16.763,16.763v9.914c-9.37,2.486-18.242,6.197-26.431,10.954 l-7.016-7.015c-6.546-6.546-17.159-6.546-23.705,0.001L30.618,46.238c-6.546,6.546-6.546,17.159,0,23.705l7.014,7.014 c-4.758,8.19-8.469,17.062-10.955,26.433h-9.914c-9.257,0-16.762,7.505-16.762,16.763v22.09c0,9.258,7.505,16.763,16.762,16.763 h9.914c2.487,9.371,6.198,18.243,10.956,26.433l-7.015,7.015c-6.546,6.546-6.546,17.159,0,23.705l15.621,15.621 c6.546,6.546,17.159,6.546,23.705,0l7.016-7.016c8.189,4.758,17.061,8.469,26.431,10.955v9.913c0,9.258,7.505,16.763,16.763,16.763 h22.091c9.258,0,16.763-7.505,16.763-16.763v-9.913c9.371-2.487,18.242-6.198,26.432-10.956l7.016,7.017 c6.546,6.546,17.159,6.546,23.705,0l15.621-15.621c3.145-3.144,4.91-7.407,4.91-11.853s-1.766-8.709-4.91-11.853l-7.016-7.016 c4.758-8.189,8.468-17.062,10.955-26.432h9.91c9.258,0,16.763-7.505,16.763-16.763v-22.09 C262.393,110.895,254.888,103.39,245.63,103.39z M131.198,191.194c-33.083,0-59.998-26.915-59.998-59.997 c0-33.083,26.915-59.998,59.998-59.998s59.998,26.915,59.998,59.998C191.196,164.279,164.281,191.194,131.198,191.194z"/><path d="M131.198,101.199c-16.541,0-29.998,13.457-29.998,29.998c0,16.54,13.457,29.997,29.998,29.997s29.998-13.457,29.998-29.997 C161.196,114.656,147.739,101.199,131.198,101.199z"/></svg>`;
  let content = document.createElement("div");
  let style = document.createElement("style");
  style.innerHTML = await getCSS(
    "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/settings.css"
  );
  content.appendChild(style);

  new Spicetify.Topbar.Button("Comfy Settings", svg, () => {
    Spicetify.PopupModal.display({
      title: "Comfy Settings",
      content,
      isLarge: true,
    });

    const header = document.querySelector(".main-trackCreditsModal-header");
    const container = document.createElement("div");
    const extraText = document.createElement("a");
    extraText.textContent = "Need support? Click here!";
    extraText.href = "https://discord.gg/rtBQX5D3bD";
    extraText.style.color = "var(--spice-tab-active)";

    container.appendChild(document.querySelector("h1.main-type-alto"));
    container.appendChild(extraText);
    header.prepend(container);
  });

  // SETTINGS MENU CONTENT

  content.append(createDivider("Support Modules"));
  
  // Library X
  if (libX) {
    content.append(
      createSlider(
        "LibX-Snippet",
        "Library X Support",
        true,
        "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/libx.css"
      ),
      createSlider(
        "Topbar-Inside-Titlebar-Snippet",
        "Move Topbar Inside Titlebar",
        false,
        "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/topbar-in-titlebar.css"
      )
    );
  }

  content.append(createDivider("Interface"));

  // App Title
  content.appendChild(
    createInput(
      "text",
      "App-Title",
      "Application Title",
      await Spicetify.AppTitle.get(),
	    "leave blank to reset to default<br>note: default value can be lost",
      true,
      async (value, name, container) => {
        if (!value) {
          await Spicetify.AppTitle.reset()
          inputBox = container.querySelector('.input')
          inputBox.value = await Spicetify.AppTitle.get()
          return
        }
        await Spicetify.AppTitle.set(value)
      }      
    )
  )

  // Button Radius
  content.appendChild(
    createInput(
      "number",
      "Button-Radius",
      "Button Radius",
      "8",
      `
      <h4> Change how circular buttons are: </h4>
      <li> Comfy default: 8px </li>
      <li> Spotify default: 50px </li>
      `,
      true,
      (value) => {
        document.documentElement.style.setProperty("--button-radius", value + "px");
      }      
    )
  )

  // Remove Device Picker Notification
  content.appendChild(
    createSlider(
      "Remove-Device-Picker-Notification-Snippet",
      "Remove Device Picker Notification",
      false,
      "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-device-picker.css"
    )
  );  

  // Remove Progress Bar Gradient
  content.appendChild(
    createSlider(
      "Remove-Progress-Bar-Gradient-Snippet",
      "Remove Progress Bar Gradient",
      false,
      "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/no-progressBar-gradient.css"
    )
  );

  // Enable Home Header
  content.appendChild(
    createSlider(
      "Home-Header-Snippet",
      "Colorful Home Header",
      true,
      "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/home-header.css"
    )
  );

  // Remove PlayBack timers
  content.appendChild(
    createSlider(
      "Remove-Timers-Snippet",
      "Remove Playback Timers",
      false,
      "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-timers.css"
    )
  );

  // Remove Lyrics Button
  content.appendChild(
    createSlider(
      "Remove-Lyrics-Button-Snippet",
      "Remove Lyrics Button",
      false,
      "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-lyrics-button.css"
    )
  );

  content.append(createDivider("Cover Art"));
  
  // Oblong Now Playing Cover Art
  content.appendChild(
    createSlider(
      "Oblong-nowPlaying-Art-Snippet",
      "Oblong Now Playing Cover Art",
      false,
      "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/oblong-nowPlayingArt.css"
    )
  );

  // ColorScheme Snippets
  const colorScheme = Spicetify.Config?.color_scheme.toLowerCase();
  const addonUrl = `https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/${colorScheme}.css`;
  if ((await fetch(addonUrl)).ok) {
    content.appendChild(
      createSlider(
        `Comfy-${colorScheme}-Snippet`,
        `Comfy-${
          colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)
        } additional features`,
        true,
        addonUrl
      )
    );
  }

  // Revert Right Side Cover Art
  content.appendChild(
    createSlider(
      "Revert-Right-Art-Snippet",
      "Disable Right Side Cover Art",
      false,
      "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/revert-right-art.css"
    )
  );

  content.append(createDivider("Banner Image"));

  // Custom Image
  textInput = createInput(
    "text",
    "Custom-Image-URL",
    "Custom Image URL",
    "Paste URL Here!",
    `
    <h4> Local Images: </h4>
	  <li>Place desired image in 'spotify/Apps/xpui/images'.</li>	
	  <li>Enter 'images/image.png into text box.</li>
	  `,
    updateImageDisplay
  );
  content.append(
    createSlider(
      "Custom-Image",
      "Custom Image Enabled",
      false,
      null,
      (state) => {
        state ? content.appendChild(textInput) : content.removeChild(textInput);
        updateImageDisplay();
      }
    ),
    getConfig("Custom-Image") ? textInput : ""
  );
  
  // HEADER IMAGE

  // Valid Channels
  const channels = [
    /^\/playlist\//,
    /^\/station\/playlist\//,
    /^\/artist\/(?!artists\b)\w+$/,
    /^\/album\//,
    /^\/collection\/tracks$/,
    /^\/collection\/episodes$/,
    /^\/collection\/local$/,
    /^\/episode\//,
    /^\/lyrics-plus$/,
    /^\/folder\//,
    /^\/user\/(?!users\b)\w+$/,
    /^\/genre\//
  ];

  // Create image container + preload image
  const imageContainer = document.createElement("div");
  imageContainer.id = "mainImage";
  main.appendChild(imageContainer);

  const preloadImage = new Image();
  preloadImage.onload = () => {
    imageContainer.style.backgroundImage = `url("${preloadImage.src}")`;
  };

  // Source Checks + Image Updater
  const sourceCheck = () => getConfig("Custom-Image");
  const source = () => getConfig("Custom-Image-URL").replace(/"/g, "");
  function updateImageDisplay() {
    const { pathname } = Platform.History.location;
    imageContainer.style.display = channels.some((channel) =>
      channel.test(pathname)
    )
      ? "block"
      : "none";
    preloadImage.src = sourceCheck()
      ? source()
      : Player.data.track.metadata.image_xlarge_url;
  }

  // Initialize
  updateImageDisplay();

  // Listen for channel switches
  Platform.History.listen(updateImageDisplay);

  // Change the song image on song change
  Player.addEventListener("songchange", updateImageDisplay);

  // FUNCTIONS

  function hotload(bool, url, classname) {
    if (!url) return;
    if (bool) {
      loadCSS(url, false, classname);
    } else {
      unloadCSS(classname);
    }
  }
  
  async function getCSS(url) {
    return await fetch(url)
      .then((res) => res.text())
      .catch((e) => console.error(e));
  }
  
  async function loadCSS(url, text=false, classname) {
    const css = url ? await getCSS(url) : text;
    const style = document.createElement("style");
    style.innerHTML = css;
    style.classList.add(classname);
    document.head.appendChild(style);
  }
  
  function unloadCSS(classname) {
    return document.getElementsByClassName(classname)[0]?.remove();
  }
  
  function getConfig(key) {
    try {
      return JSON.parse(Spicetify.LocalStorage.get(key));
    } catch (e) {
      console.error(e);
      return null;
    }
  }
  
  function createDivider(name) {
    const container = document.createElement("div");
    container.classList.add("divider-row");
    container.id = name;
    container.innerHTML = `
    <div class="space"></div>
    <h3 class="title">${name}</h3>
    <hr class="divider"></hr>
    `;
    return container;
  }
  
  function createSlider(name, desc, defaultVal, url, returnFunc) {
    defaultVal = getConfig(name) ?? defaultVal;
  
    const container = document.createElement("div");
    container.classList.add("setting-row");
    container.id = name;
    container.innerHTML = `
    <label class="col description">${desc}</label>
    <div class="col action">
      <button class="switch">
        <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
          ${Spicetify.SVGIcons.check}
        </svg>
      </button>
    </div>`;
  
    const slider = container.querySelector("button.switch");
    slider.classList.toggle("disabled", !defaultVal);
  
    slider.onclick = () => {
      const state = slider.classList.contains("disabled");
      slider.classList.toggle("disabled");
      Spicetify.LocalStorage.set(name, state);
      hotload(state, url, name);
      returnFunc?.(state);
      console.log(name, getConfig(name));
    };
  
    hotload(defaultVal, url, name);
    return container;
  }
  
  function createInput(type, name, desc, defaultVal, tippyMessage, allowHTML, returnFunc) {
    defaultVal = getConfig(name) ?? defaultVal;
  
    const container = document.createElement("div");
    container.classList.add("setting-row");
    container.id = name;
    container.innerHTML = `
    <label class="col description">
    ${desc}
    <div class="GuwMf98GUBSpCDgf8KRA">
       <div class="qBZYab2T7Yc4O5Nh0mjA" aria-expanded="false">
          <svg role="img" height="16" width="16" aria-describedby="hover-or-focus-tooltip" aria-hidden="true" tabindex="0" class="Svg-sc-ytk21e-0 Svg-img-16-icon nW1RKQOkzcJcX6aDCZB4" viewBox="0 0 16 16" data-encore-id="icon">
             <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
             <path d="M7.25 12.026v-1.5h1.5v1.5h-1.5zm.884-7.096A1.125 1.125 0 0 0 7.06 6.39l-1.431.448a2.625 2.625 0 1 1 5.13-.784c0 .54-.156 1.015-.503 1.488-.3.408-.7.652-.973.818l-.112.068c-.185.116-.26.203-.302.283-.046.087-.097.245-.097.57h-1.5c0-.47.072-.898.274-1.277.206-.385.507-.645.827-.846l.147-.092c.285-.177.413-.257.526-.41.169-.23.213-.397.213-.602 0-.622-.503-1.125-1.125-1.125z"></path>
          </svg>
       </div>
    </div>
    </label>
    <div class="col action">
      <input type="${type}" class="input" value="${defaultVal}">
    </div>`;
    const help = container.querySelector(".GuwMf98GUBSpCDgf8KRA");
    console.log(
      Spicetify.Tippy(help, {
        ...Spicetify.TippyProps,
        content: tippyMessage,
        allowHTML: allowHTML,
      })
    );
    const input = container.querySelector("input");
    input.onchange = () => {
      Spicetify.LocalStorage.set(name, `"${input.value}"`);
      returnFunc?.(input.value, name, container);
      console.log(name, getConfig(name));
    };
  
    returnFunc?.(defaultVal, name, container);
    return container;
  }
  

}