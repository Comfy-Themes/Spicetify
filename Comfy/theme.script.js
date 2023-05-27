(async function comfy() {
  if (
    !(
      Spicetify.Player?.data &&
      Spicetify.Menu &&
      Spicetify.LocalStorage &&
      Spicetify.Platform &&
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
    let content = document.createElement("div");
    let style = document.createElement("style");

    style.innerHTML = `
    .main-trackCreditsModal-container {
      background-color: var(--spice-player) !important;
    }
    .setting-row::after {
      content: "";
      display: table;
      clear: both;
    }
    .setting-row {
      display: flex;
      padding: 10px 0;
      align-items: center;
      justify-content: space-between;
    }
    .setting-row .col.description {
      float: left;
      padding-right: 15px;
      width: 100%;
    }
    .setting-row .col.action {
      float: right;
      text-align: right;
    }
    button.switch {
      align-items: center;
      border: 0px;
      border-radius: 50%;
      background-color: rgba(var(--spice-rgb-shadow), .7);
      color: var(--spice-text);
      cursor: pointer;
      display: flex;
      margin-inline-start: 12px;
      padding: 8px;
    }
    button.switch.disabled,
    button.switch[disabled] {
      color: rgba(var(--spice-rgb-text), .3);
    }
    button.reset {
      font-weight: 700;
      font-size: medium;
      background-color: transparent;
      border-radius: 500px;
      transition-duration: 33ms;
      transition-property: background-color, border-color, color, box-shadow, filter, transform;
      padding-inline: 15px;
      border: 1px solid #727272;
      color: var(--spice-text);
      min-block-size: 32px;
      cursor: pointer;
    }
    button.reset:hover {
      transform: scale(1.04);
      border-color: var(--spice-text);
    }`;
    content.appendChild(style);

    let svg = `<svg viewBox="0 0 262.394 262.394" style="scale: 0.5; fill: var(--spice-text)"><path d="M245.63,103.39h-9.91c-2.486-9.371-6.197-18.242-10.955-26.432l7.015-7.015c6.546-6.546,6.546-17.159,0-23.705 l-15.621-15.621c-6.546-6.546-17.159-6.546-23.705,0l-7.015,7.015c-8.19-4.758-17.061-8.468-26.432-10.955v-9.914 C159.007,7.505,151.502,0,142.244,0h-22.091c-9.258,0-16.763,7.505-16.763,16.763v9.914c-9.37,2.486-18.242,6.197-26.431,10.954 l-7.016-7.015c-6.546-6.546-17.159-6.546-23.705,0.001L30.618,46.238c-6.546,6.546-6.546,17.159,0,23.705l7.014,7.014 c-4.758,8.19-8.469,17.062-10.955,26.433h-9.914c-9.257,0-16.762,7.505-16.762,16.763v22.09c0,9.258,7.505,16.763,16.762,16.763 h9.914c2.487,9.371,6.198,18.243,10.956,26.433l-7.015,7.015c-6.546,6.546-6.546,17.159,0,23.705l15.621,15.621 c6.546,6.546,17.159,6.546,23.705,0l7.016-7.016c8.189,4.758,17.061,8.469,26.431,10.955v9.913c0,9.258,7.505,16.763,16.763,16.763 h22.091c9.258,0,16.763-7.505,16.763-16.763v-9.913c9.371-2.487,18.242-6.198,26.432-10.956l7.016,7.017 c6.546,6.546,17.159,6.546,23.705,0l15.621-15.621c3.145-3.144,4.91-7.407,4.91-11.853s-1.766-8.709-4.91-11.853l-7.016-7.016 c4.758-8.189,8.468-17.062,10.955-26.432h9.91c9.258,0,16.763-7.505,16.763-16.763v-22.09 C262.393,110.895,254.888,103.39,245.63,103.39z M131.198,191.194c-33.083,0-59.998-26.915-59.998-59.997 c0-33.083,26.915-59.998,59.998-59.998s59.998,26.915,59.998,59.998C191.196,164.279,164.281,191.194,131.198,191.194z"/><path d="M131.198,101.199c-16.541,0-29.998,13.457-29.998,29.998c0,16.54,13.457,29.997,29.998,29.997s29.998-13.457,29.998-29.997 C161.196,114.656,147.739,101.199,131.198,101.199z"/></svg>`;
    new Spicetify.Topbar.Button("Comfy Settings", svg, () => {
      Spicetify.PopupModal.display({
        title: "Comfy Settings",
        content,
      });
    });

    function hotload(bool, url, classname) {
      if (bool) {
        loadCSS(url, classname);
      } else {
        unloadCSS(classname);
      }
    }

    function getConfig(key) {
      try {
        return JSON.parse(Spicetify.LocalStorage.get(key));
      } catch (e) {
        console.error(e);
        return null;
      }
    }

    async function loadCSS(url, classname) {
      await fetch(url)
        .then((res) => res.text())
        .then((css) => {
          const style = document.createElement("style");
          style.innerHTML = css;
          style.classList.add(classname);
          document.head.appendChild(style);
        })
        .catch((e) => console.error(e));
    }

    function unloadCSS(classname) {
      return document.querySelector(`.${classname}`)?.remove();
    }

    function createSlider(name, desc, defaultVal, url = null) {
      const container = document.createElement("div");
      container.classList.add("setting-row");
      container.innerHTML = `
  <label class="col description">${desc}</label>
  <div class="col action"><button class="switch">
  <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor">
  ${Spicetify.SVGIcons.check}
  </svg>
  </button></div>`;

      const slider = container.querySelector("button.switch");
      slider.classList.toggle("disabled", !defaultVal);

      slider.onclick = () => {
        const state = slider.classList.contains("disabled");
        slider.classList.toggle("disabled");
        Spicetify.LocalStorage.set(name, state);
        url && hotload(state, url, name);
        console.log(name, getConfig(name));
      };

      return container;
    }

  // SNIPPETS

    // Library X
    uiUrl = `https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/libx.css`;
    uiClassName = "LibX-Snippet";
    if (libX) {
      lsBool = getConfig(uiClassName) ?? true;
      hotload(lsBool, uiUrl, uiClassName);
      content.appendChild(
        createSlider(uiClassName, "Library X Support", lsBool, uiUrl)
      );
    }

    // Remove PlayBack timers
    snippetDetails = {
      url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-timers.css",
      class_name: "Remove-Timers-Snippet",
    };
    lsBool = getConfig(snippetDetails.class_name) ?? false;
    hotload(lsBool, snippetDetails.url, snippetDetails.class_name);
    content.appendChild(
      createSlider(
        snippetDetails.class_name,
        "Remove Playback Timers",
        lsBool,
        snippetDetails.url
      )
    );

    // Remove Lyrics Button
    snippetDetails = {
      url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-lyrics-button.css",
      class_name: "Remove-Lyrics-Button-Snippet",
    };
    lsBool = getConfig(snippetDetails.class_name) ?? false;
    hotload(lsBool, snippetDetails.url, snippetDetails.class_name);
    content.appendChild(
      createSlider(
        snippetDetails.class_name,
        "Remove Lyrics Button",
        lsBool,
        snippetDetails.url
      )
    );

    // Oblong Now Playing Cover Art
    snippetDetails = {
      url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/oblong-nowPlayingArt.css",
      class_name: "Oblong-nowPlaying-Art-Snippet",
    };
    lsBool = getConfig(snippetDetails.class_name) ?? false;
    hotload(lsBool, snippetDetails.url, snippetDetails.class_name);
    content.appendChild(
      createSlider(
        snippetDetails.class_name,
        "Oblong Now Playing Cover Art",
        lsBool || Spicetify.Config?.color_scheme?.toLowerCase() === "mono",
        snippetDetails.url
      )
    );

    // ColorScheme Snippets
    const colorScheme = Spicetify.Config?.color_scheme.toLowerCase();
    const addonUrl = `https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/${colorScheme}.css`;
    const addonClassname = `Comfy-${colorScheme}-Snippet`;
    if ((await fetch(addonUrl)).ok) {
      let lsBool = getConfig(`Comfy-${colorScheme}-Snippet`) ?? true;
      hotload(lsBool, addonUrl, addonClassname);
      content.appendChild(
        createSlider(
          addonClassname,
          `Comfy-${
            colorScheme.charAt(0).toUpperCase() + colorScheme.slice(1)
          } additional features`,
          lsBool,
          addonUrl
        )
      );
    }

// HEADER IMAGE

  // Valid Channels
  const channels = [
    "/playlist/",
    "/album/",
    "/collection/tracks",
    "/collection/episodes",
    "/collection/local",
    "/episode/",
    "/lyrics-plus",
    "/folder/",
    "/user/",
  ];

  // Create image container + preload image
  const imageContainer = document.createElement("div");
  imageContainer.id = "mainImage";
  main.appendChild(imageContainer);

  const preloadImage = new Image();
  preloadImage.onload = () => {
    imageContainer.style.backgroundImage = `url("${Player.data.track.metadata.image_xlarge_url}")`;
  };

  // Function that updates the image
  function updateImageDisplay() {
    const { pathname } = Platform.History.location;
    imageContainer.style.display = channels.some((channel) => pathname.startsWith(channel))
      ? "block"
      : "none";
    preloadImage.src = Player.data.track.metadata.image_xlarge_url;
  };

  // Initialize
  updateImageDisplay();

  // Listen for channel switches
  Platform.History.listen(updateImageDisplay);

  // Change the song image on song change
  Player.addEventListener("songchange", updateImageDisplay);
}
