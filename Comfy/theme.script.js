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
}