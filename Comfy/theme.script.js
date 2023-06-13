(async function comfy() {
  if (
    !(
      Spicetify.Player?.data &&
      Spicetify.Menu &&
      Spicetify.LocalStorage &&
      Spicetify.Platform &&
      Spicetify.AppTitle &&
      Spicetify.Panel &&
      Spicetify.React &&
      Spicetify.ReactDOM &&
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
    /^\/genre\//,
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
  const source = () => getConfig("Custom-Image-URL")?.replace(/"/g, "");
  function updateImageDisplay() {
    const { pathname } = Platform.History.location;
    imageContainer.style.display = channels.some((channel) => channel.test(pathname)) ? "block" : "none";
    preloadImage.src = sourceCheck() ? source() : Player.data.track.metadata.image_xlarge_url;
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
      .then((res) => {
        if (!res.ok) return;
        return res.text();
      })
      .catch((e) => console.error(e));
  }

  async function loadCSS(url, text = false, classname) {
    if (document.getElementsByClassName(classname)[0]) return;
    const css = url ? await getCSS(url) : text;
    if (!css) return;
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

  function isPromise(p) {
    if (typeof p === "object" && typeof p.then === "function") {
      return true;
    }

    return false;
  }

  const Divider = Spicetify.React.memo(({ name }) => {
    return Spicetify.React.createElement(
      "div",
      { className: "divider-row", id: name },
      Spicetify.React.createElement("div", { className: "space" }),
      Spicetify.React.createElement("h3", { className: "title" }, name),
      Spicetify.React.createElement("hr", { className: "divider" })
    );
  });

  const Slider = Spicetify.React.memo(
    ({ name, desc, defaultVal, url, condition = true, returnFunc = (...args) => {} }) => {
      const [state, setState] = Spicetify.React.useState(getConfig(name) ?? defaultVal);
      const [conditionState, setConditionState] = Spicetify.React.useState(condition);

      Spicetify.React.useEffect(() => {
        if (isPromise(condition)) {
          condition
            .then((val) => {
              setConditionState(val);
            })
            .catch((e) => setConditionState(false));
        } else setConditionState(condition);
      }, [condition]);

      Spicetify.React.useEffect(() => {
        Spicetify.LocalStorage.set(name, state);
        hotload(state, url, name);
        returnFunc(state);
        console.log(name, getConfig(name));
      }, [state]);

      if (conditionState === false) return null;

      return Spicetify.React.createElement(
        "div",
        { className: "setting-row", id: name },
        Spicetify.React.createElement("label", { className: "col description" }, desc),
        Spicetify.React.createElement(
          "div",
          { className: "col action" },
          Spicetify.React.createElement(
            "button",
            {
              className: `switch ${state ? "" : "disabled"}`,
              onClick: () => {
                setState(!state);
              },
            },
            Spicetify.React.createElement("svg", {
              height: "16",
              width: "16",
              viewBox: "0 0 16 16",
              fill: "currentColor",
              dangerouslySetInnerHTML: {
                __html: Spicetify.SVGIcons.check,
              },
            })
          )
        )
      );
    }
  );

  const Input = Spicetify.React.memo(
    ({ inputType, name, desc, defaultVal, tippyMessage, condition = true, returnFunc = (...args) => {} }) => {
      const [value, setValue] = Spicetify.React.useState(getConfig(name) ?? defaultVal);
      const [defaultState, setDefaultState] = Spicetify.React.useState(defaultVal);
      const [conditionState, setConditionState] = Spicetify.React.useState(condition);

      Spicetify.React.useEffect(() => {
        if (isPromise(defaultVal)) {
          defaultVal.then((val) => {
            if (getConfig(name) === null) setValue(val);
            setDefaultState(val);
          });
        } else if (getConfig(name) === null) setValue(defaultVal);
      }, [defaultVal]);

      Spicetify.React.useEffect(() => {
        if (isPromise(condition)) {
          condition
            .then((val) => {
              setConditionState(val);
            })
            .catch((e) => setConditionState(false));
        } else setConditionState(condition);
      }, [condition]);

      Spicetify.React.useEffect(() => {
        Spicetify.LocalStorage.set(name, `"${value}"`);
        returnFunc(value, name);
        console.log(name, getConfig(name));
      }, [value]);

      if (conditionState === false) return null;

      return Spicetify.React.createElement(
        "div",
        { className: "setting-row", id: name },
        Spicetify.React.createElement(
          "label",
          { className: "col description" },
          desc,
          Spicetify.React.createElement(
            Spicetify.ReactComponent.TooltipWrapper,
            {
              label: tippyMessage,
              showDelay: 0,
            },
            Spicetify.React.createElement(
              "div",
              { className: "GuwMf98GUBSpCDgf8KRA" },
              Spicetify.React.createElement(
                "div",
                {
                  className: "qBZYab2T7Yc4O5Nh0mjA",
                },
                Spicetify.React.createElement(
                  "svg",
                  {
                    role: "img",
                    height: "16",
                    width: "16",
                    tabindex: "0",
                    className: "Svg-sc-ytk21e-0 Svg-img-16-icon nW1RKQOkzcJcX6aDCZB4",
                    viewBox: "0 0 16 16",
                  },
                  Spicetify.React.createElement("path", {
                    d: "M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z",
                  }),
                  Spicetify.React.createElement("path", {
                    d: "M7.25 12.026v-1.5h1.5v1.5h-1.5zm.884-7.096A1.125 1.125 0 0 0 7.06 6.39l-1.431.448a2.625 2.625 0 1 1 5.13-.784c0 .54-.156 1.015-.503 1.488-.3.408-.7.652-.973.818l-.112.068c-.185.116-.26.203-.302.283-.046.087-.097.245-.097.57h-1.5c0-.47.072-.898.274-1.277.206-.385.507-.645.827-.846l.147-.092c.285-.177.413-.257.526-.41.169-.23.213-.397.213-.602 0-.622-.503-1.125-1.125-1.125z",
                  })
                )
              )
            )
          )
        ),
        Spicetify.React.createElement(
          "div",
          { className: "col action" },
          Spicetify.React.createElement("input", {
            type: inputType,
            className: "input",
            value: value,
            placeholder: defaultState,
            onChange: (e) => setValue(e.target.value),
          })
        )
      );
    }
  );

  const Section = ({ name, children, condition = true }) => {
    if (condition === false) return null;
    return Spicetify.React.createElement(
      Spicetify.React.Fragment,
      null,
      Spicetify.React.createElement(Divider, { name }),
      children.map((child) => {
        switch (child.type) {
          case "slider":
            return Spicetify.React.createElement(Slider, child);
          case "input":
            return Spicetify.React.createElement(Input, child);
          default:
            return children;
        }
      })
    );
  };

  const Content = () => {
    const [style, setStyle] = Spicetify.React.useState("");
    const [additionalFeatures, setAdditionalFeatures] = Spicetify.React.useState(false);
    const [customImage, setCustomImage] = Spicetify.React.useState(getConfig("Custom-Image") ?? false);

    const libX = document.querySelector(".nav-ylx");

    Spicetify.React.useEffect(() => {
      fetch("https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/settings.css").then((res) => {
        res.text().then((text) => {
          setStyle(text);
        });
      });

      fetch(
        `https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/${Spicetify.Config?.color_scheme.toLowerCase()}.css`
      )
        .then((res) => {
          if (!res.ok) return setAdditionalFeatures(false);
          setAdditionalFeatures(true);
        })
        .catch((e) => {
          setAdditionalFeatures(false);
        });
    }, []);

    return Spicetify.React.createElement(
      "div",
      { className: "comfy-settings" },
      Spicetify.React.createElement("style", {
        dangerouslySetInnerHTML: { __html: style },
      }),
      Spicetify.React.createElement(Section, { name: "Support Modules", condition: !!libX }, [
        {
          type: "slider",
          name: "LibX-Snippet",
          desc: "Library X Support",
          defaultVal: true,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/libx.css",
        },
        {
          type: "slider",
          name: "Topbar-Inside-Titlebar-Snippet",
          desc: "Move Topbar Inside Titlebar",
          defaultVal: false,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/topbar-in-titlebar.css",
        },
      ]),
      Spicetify.React.createElement(Section, { name: "Interface" }, [
        {
          type: "input",
          inputType: "text",
          name: "App-Title",
          desc: "Application Title",
          defaultVal: Spicetify.AppTitle.get(),
          tippyMessage: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            "Leave blank to reset to default",
            Spicetify.React.createElement("br", null),
            "Note: default value can be lost"
          ),
          returnFunc: async (value) => {
            if (!value) await Spicetify.Platform.UserAPI._product_state.delOverridesValues({ keys: ["name"] });
            else await Spicetify.Platform.UserAPI._product_state.putOverridesValues({ pairs: { name: value } });
          },
        },
        {
          type: "input",
          inputType: "number",
          name: "Button-Radius",
          desc: "Button Radius",
          defaultVal: "8",
          tippyMessage: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            Spicetify.React.createElement("h4", null, "Change how circular buttons are:"),
            Spicetify.React.createElement("li", null, "Comfy default: 8px"),
            Spicetify.React.createElement("li", null, "Spotify default: 50px")
          ),
          returnFunc: (value) => document.documentElement.style.setProperty("--button-radius", value + "px"),
        },
        {
          type: "slider",
          name: "Remove-Device-Picker-Notification-Snippet",
          desc: "Remove Device Picker Notification",
          defaultVal: false,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-device-picker.css",
        },
        {
          type: "slider",
          name: "Remove-Progress-Bar-Gradient-Snippet",
          desc: "Remove Progress Bar Gradient",
          defaultVal: false,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/no-progressBar-gradient.css",
        },
        {
          type: "slider",
          name: "Home-Header-Snippet",
          desc: "Colorful Home Header",
          defaultVal: true,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/home-header.css",
        },
        {
          type: "slider",
          name: "Remove-Timers-Snippet",
          desc: "Remove Playback Timers",
          defaultVal: false,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-timers.css",
        },
        {
          type: "slider",
          name: "Remove-Lyrics-Button-Snippet",
          desc: "Remove Lyrics Button",
          defaultVal: false,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/remove-lyrics-button.css",
        },
      ]),
      Spicetify.React.createElement(Section, { name: "Cover Art" }, [
        {
          type: "slider",
          name: "Oblong-nowPlaying-Art-Snippet",
          desc: "Oblong Now Playing Cover Art",
          defaultVal: false,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/oblong-nowPlayingArt.css",
        },
        {
          type: "slider",
          name: `Comfy-${Spicetify.Config?.color_scheme.toLowerCase()}-Snippet`,
          desc: `Comfy-${
            Spicetify.Config?.color_scheme.toLowerCase().charAt(0).toUpperCase() +
            Spicetify.Config?.color_scheme.toLowerCase().slice(1)
          } additional features`,
          defaultVal: true,
          condition: !!additionalFeatures,
          url: `https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/${Spicetify.Config?.color_scheme.toLowerCase()}.css`,
        },
        {
          type: "slider",
          name: "Revert-Right-Art-Snippet",
          desc: "Disable Right Side Cover Art",
          defaultVal: false,
          url: "https://raw.githubusercontent.com/Comfy-Themes/Spicetify/main/Comfy/snippets/revert-right-art.css",
        },
      ]),
      Spicetify.React.createElement(Section, { name: "Banner Image" }, [
        {
          type: "slider",
          name: "Custom-Image",
          desc: "Custom Image Enabled",
          defaultVal: false,
          url: null,
          returnFunc: (value) => {
            setCustomImage(value);
            updateImageDisplay();
          },
        },
        {
          type: "input",
          inputType: "text",
          name: "Custom-Image-URL",
          desc: "Custom Image URL",
          defaultVal: "Paste URL here!",
          tippyMessage: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            Spicetify.React.createElement("h4", null, "Local Images:"),
            Spicetify.React.createElement("li", null, "Place desired image in 'spotify/Apps/xpui/images'."),
            Spicetify.React.createElement("li", null, "Enter 'images/image.png into text box.")
          ),
          condition: customImage,
          returnFunc: updateImageDisplay,
        },
      ])
    );
  };

  const { toggle } = Spicetify.Panel.registerPanel({
    label: "Comfy Settings",
    children: Spicetify.React.createElement(Content),
    style: { minWidth: "370px" },
  });

  // SETTINGS MENU
  const svg = `<svg viewBox="0 0 262.394 262.394" style="scale: 0.5; fill: var(--spice-text)"><path d="M245.63,103.39h-9.91c-2.486-9.371-6.197-18.242-10.955-26.432l7.015-7.015c6.546-6.546,6.546-17.159,0-23.705 l-15.621-15.621c-6.546-6.546-17.159-6.546-23.705,0l-7.015,7.015c-8.19-4.758-17.061-8.468-26.432-10.955v-9.914 C159.007,7.505,151.502,0,142.244,0h-22.091c-9.258,0-16.763,7.505-16.763,16.763v9.914c-9.37,2.486-18.242,6.197-26.431,10.954 l-7.016-7.015c-6.546-6.546-17.159-6.546-23.705,0.001L30.618,46.238c-6.546,6.546-6.546,17.159,0,23.705l7.014,7.014 c-4.758,8.19-8.469,17.062-10.955,26.433h-9.914c-9.257,0-16.762,7.505-16.762,16.763v22.09c0,9.258,7.505,16.763,16.762,16.763 h9.914c2.487,9.371,6.198,18.243,10.956,26.433l-7.015,7.015c-6.546,6.546-6.546,17.159,0,23.705l15.621,15.621 c6.546,6.546,17.159,6.546,23.705,0l7.016-7.016c8.189,4.758,17.061,8.469,26.431,10.955v9.913c0,9.258,7.505,16.763,16.763,16.763 h22.091c9.258,0,16.763-7.505,16.763-16.763v-9.913c9.371-2.487,18.242-6.198,26.432-10.956l7.016,7.017 c6.546,6.546,17.159,6.546,23.705,0l15.621-15.621c3.145-3.144,4.91-7.407,4.91-11.853s-1.766-8.709-4.91-11.853l-7.016-7.016 c4.758-8.189,8.468-17.062,10.955-26.432h9.91c9.258,0,16.763-7.505,16.763-16.763v-22.09 C262.393,110.895,254.888,103.39,245.63,103.39z M131.198,191.194c-33.083,0-59.998-26.915-59.998-59.997 c0-33.083,26.915-59.998,59.998-59.998s59.998,26.915,59.998,59.998C191.196,164.279,164.281,191.194,131.198,191.194z"/><path d="M131.198,101.199c-16.541,0-29.998,13.457-29.998,29.998c0,16.54,13.457,29.997,29.998,29.997s29.998-13.457,29.998-29.997 C161.196,114.656,147.739,101.199,131.198,101.199z"/></svg>`;
  new Spicetify.Topbar.Button("Comfy Settings", svg, toggle);

  // Workaround for hotloading assets
  Spicetify.ReactDOM.render(Spicetify.React.createElement(Content), document.createElement("div"));
}
