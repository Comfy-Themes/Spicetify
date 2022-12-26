(async function Comfy() {
  const { Player, Menu, LocalStorage, Platform } = Spicetify;
  const mainChild = document.createElement("div");
  const preloadChild = document.createElement("div");
  const main = document.querySelector(".Root__main-view");
  const topbar = document.querySelector("header.main-topBar-container");
  const LyricsBackground = document.querySelector(
    ".lyrics-lyricsContainer-LyricsBackground"
  );
  let activityquery = document.querySelector(
    "aside[aria-label='Friend Activity']"
  );
  const navAlt = document.querySelector(".nav-alt");
  const navPad1 = document.querySelector("#main > div > div.Root__top-container > nav > div.main-navBar-navBar > div.main-rootlist-rootlist > div > div.os-host.os-host-foreign.os-theme-spotify.os-host-resize-disabled.os-host-scrollbar-horizontal-hidden.main-rootlist-rootlistPlaylistsScrollNode.os-host-transition.os-host-scrollbar-vertical-hidden > div.os-padding > div > div")
  const navPad2 = document.querySelector("#main > div > div.Root__top-container > nav > div.main-navBar-navBar > div.main-rootlist-rootlist > div > div.os-host.os-host-foreign.os-theme-spotify.os-host-resize-disabled.os-host-scrollbar-horizontal-hidden.main-rootlist-rootlistPlaylistsScrollNode.os-host-transition.os-host-overflow.os-host-overflow-y > div.os-padding > div > div")
  
  if (
    !(
      Player?.data &&
      Menu &&
      LocalStorage &&
      Platform &&
      main &&
      topbar
    )
  ) {
    setTimeout(Comfy, 1000);
    return;
  }

  let content = document.createElement("div");
  let style = document.createElement("style");
  style.innerHTML = `
.setting-row::after {
  content: "";
  display: table;
  clear: both;
}
.setting-row {
  display: flex;
  padding: 10px 0;
  align-items: center;
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
  background-color: var(--spice-text);
  color: var(--spice-main);
  border-radius: 500px;
  font-size: inherit;
  padding-block: 12px;
  padding-inline: 32px;
}
button.reset:hover {
  transform: scale(1.04);
}`;
  content.appendChild(style);

  new Spicetify.Menu.Item("Comfy settings", false, () => {
    Spicetify.PopupModal.display({
      title: "Comfy Settings",
      content,
    });
  }).register();

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

  let snippetDetails = {};

  // Hover Panels
  snippetDetails = {
    url: "https://raw.githubusercontent.com/Comfy/Comfy/master/ComfyHoverPanels.css",
    class_name: "Hover-Panels-Snippet",
  };
  lsBool = getConfig(snippetDetails.class_name) ?? false;
  hotload(lsBool, snippetDetails.url, snippetDetails.class_name);
  content.appendChild(
    createSlider(
      snippetDetails.class_name,
      "Hover Panels",
      lsBool,
      snippetDetails.url
    )
  );

  // Nav transition padding
  (navPad1 || navPad2) && (navPad1 || navPad2).setAttribute(
    "style",
    "padding: 0 !important; height: 100%; width: 100%;"
  );

  // Spotify's New navUI
  snippetDetails = {
    url: `https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/new-ui-temp.css`,
    class_name: "New-navUI-Snippet",
  };
  if (navAlt) {
    lsBool = getConfig(snippetDetails.class_name) ?? true;
    hotload(lsBool, snippetDetails.url, snippetDetails.class_name);
    content.appendChild(
      createSlider(
        snippetDetails.class_name,
        "New navUI Snippet",
        lsBool,
        snippetDetails.url
      )
    );
  }

  // Remove PlayBack timers
  snippetDetails = {
    url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-timers.css",
    class_name: "Remove-timers-Snippet",
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

  // Function that checks [if activityquery.position == absolute (Hover Panels Enabled)] or [activityquery.position == default].
  // Once checked it will make the changes to topbar as needed.
  function ComputedStyleCondition() {
    if (
      !document
        .querySelector("html")
        .classList.contains("spotify__os--is-windows")
    )
      return;

    if (
      !activityquery ||
      getComputedStyle(activityquery).position == "absolute"
    ) {
      topbar.style.paddingInlineEnd = "162px";
    } else {
      topbar.style.paddingInlineEnd = "32px";
    }
  }

  // Setting of topbar
  ComputedStyleCondition(); // Startup Initialization

  // Hover Events - Adds lag might need a rework
  // Calls function until condition is met
  waitActivityPanel = setInterval(() => {
    // console.log("Activity Panel not found");

    // Reassign variable
    activityquery = document.querySelector(
      "aside[aria-label='Friend Activity']"
    );

    if (activityquery) {
      // console.log("Activity Panel found!");
      activityquery.addEventListener(
        "mouseover",
        () => {
          ComputedStyleCondition();
        },
        false
      );

      activityquery.addEventListener(
        "mouseout",
        () => {
          ComputedStyleCondition();
        },
        false
      );
      clearInterval(waitActivityPanel);
    }
  }, 1000);

  // Spotify launching on a playlist
  const channels = [
    "/playlist/",
    "/album/",
    "/collection/tracks",
    "/collection/episodes",
    "/episode/",
    "/lyrics-plus",
  ];
  main.appendChild(mainChild);
  mainChild.id = "mainImage";

  main.appendChild(preloadChild);
  preloadChild.id = "preloadImage";
  preloadChild.style.display = "none";

  for (var i = 0; i < channels.length; i++) {
    if (Platform.History.location.pathname.startsWith(channels[i])) {
      preloadChild.style.content =
        "url(" + Player.data.track.metadata.image_xlarge_url + ")";
      setTimeout(() => {
        mainChild.style.backgroundImage =
          "url(" + Player.data.track.metadata.image_xlarge_url + ")";
      }, 1000);
    }
  }

  // Waiting for a switch between channels
  Platform.History.listen(({ pathname }) => {
    // If the channel is a playlist
    for (var i = 0; i < channels.length; i++) {
      if (pathname.startsWith(channels[i])) {
        preloadChild.style.content =
          "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        setTimeout(() => {
          mainChild.style.backgroundImage =
            "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        }, 1000);
        return;
      } else {
        mainChild.style.backgroundImage = null;
      }
    }
  });
  // Change the song image on song change
  Player.addEventListener("songchange", () => {
    for (var i = 0; i < channels.length; i++) {
      if (Platform.History.location.pathname.startsWith(channels[i])) {
        preloadChild.style.content =
          "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        setTimeout(() => {
          mainChild.style.backgroundImage =
            "url(" + Player.data.track.metadata.image_xlarge_url + ")";
        }, 1000);
      }
    }
  });
})();
