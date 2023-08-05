(async function comfy() {
  if (
    !(
      Spicetify.Player?.data &&
      Spicetify.Platform &&
      Spicetify.Panel &&
      Spicetify.React &&
      Spicetify.ReactDOM &&
      Spicetify.AppTitle &&
      document.querySelector(".Root__main-view")
    )
  ) {
    setTimeout(comfy, 300);
    return;
  }

  const { Player, Platform } = Spicetify;
  const main = document.querySelector(".Root__main-view");

  const additionalFeatureSchemes = ["mono", "velvet"];

  // Valid Channels
  const channels = [
    /^\/playlist\//,
    /^\/station\/playlist\//,
    /^\/artist\/(?!artists\b)\w+$/,
    /^\/album\//,
    /^\/collection\/tracks$/,
    /^\/collection\/your-episodes$/,
    /^\/collection\/local-files$/,
    /^\/show\//,
    /^\/episode\//,
    /^\/lyrics-plus$/,
    /^\/user\/(?!users\b)\w+$/,
    /^\/genre\//,
  ];

  // Create image container + preload image
  const frame = document.createElement("div");
  const mainImage = document.createElement("img");
  const secondaryImage = document.createElement("img");

  frame.className = "frame";
  mainImage.className = "mainImage";
  secondaryImage.className = "secondaryImage";

  frame.append(mainImage, secondaryImage);
  main.appendChild(frame);

  // Source Checks + Image Updater
  const sourceCheck = () => getConfig("Custom-Image");
  const source = () => getConfig("Custom-Image-URL")?.replace(/"/g, "");
  function updateImageDisplay() {
    const { pathname } = Platform.History.location;
    frame.style.display = channels.some((channel) => channel.test(pathname)) ? "" : "none";
    mainImage.src = secondaryImage.src = sourceCheck() ? source() : Player.data.track.metadata.image_xlarge_url;
  }

  // Initialize
  updateImageDisplay();

  // Listen for channel switches
  Platform.History.listen(updateImageDisplay);

  // Change the song image on song change
  Player.addEventListener("songchange", updateImageDisplay);

  // FUNCTIONS
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

  const Tippy = ({ label }) => {
    if (!label) return null;
    return Spicetify.React.createElement(
      Spicetify.ReactComponent.TooltipWrapper,
      {
        label,
        showDelay: 0,
        placement: "left",
        trigger: "mouseenter",
      },
      Spicetify.React.createElement(
        "div",
        { className: "x-settings-tooltip" },
        Spicetify.React.createElement(
          "div",
          {
            className: "x-settings-tooltipIconWrapper",
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
    );
  };

  const Divider = Spicetify.React.memo(({ name }) => {
    return Spicetify.React.createElement(
      "div",
      { className: "divider-row", id: name },
      Spicetify.React.createElement("div", { className: "space" }),
      name &&
        Spicetify.React.createElement(
          Spicetify.React.Fragment,
          null,
          Spicetify.React.createElement("h4", { className: "title" }, name),
          Spicetify.React.createElement("hr", { className: "divider" })
        )
    );
  });

  const Slider = Spicetify.React.memo(({ name, desc, tippy, defaultVal, condition = true, callback }) => {
    const [state, setState] = Spicetify.React.useState(getConfig(name) ?? defaultVal);

    Spicetify.React.useEffect(() => {
      Spicetify.LocalStorage.set(name, state);
      document.getElementById("main")?.classList.toggle(name, state);
      callback?.(state);
      console.log(name, getConfig(name));
    }, [state]);

    if (condition === false) return null;

    return Spicetify.React.createElement(
      "div",
      { className: "setting-row", id: name },
      Spicetify.React.createElement("label", { className: "col description" }, desc, tippy),
      Spicetify.React.createElement(
        "div",
        { className: "col action" },
        Spicetify.React.createElement(
          "button",
          {
            className: `switch ${state ? "" : "disabled"}`,
            onClick: () => setState(!state),
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
  });

  const Input = Spicetify.React.memo(
    ({ inputType, name, desc, min, max, step, tippy, defaultVal, condition = true, callback }) => {
      const [value, setValue] = Spicetify.React.useState(getConfig(name) ?? "");
      const [defaultState, setDefaultState] = Spicetify.React.useState(defaultVal);

      Spicetify.React.useEffect(() => {
        if (isPromise(defaultVal)) defaultVal.then((val) => setDefaultState(val));
      }, [defaultVal]);

      Spicetify.React.useEffect(() => {
        Spicetify.LocalStorage.set(name, `"${value}"`);
        callback?.(value, name);
        console.log(name, getConfig(name));
      }, [value]);

      if (condition === false) return null;

      return Spicetify.React.createElement(
        "div",
        { className: "setting-row", id: name },
        Spicetify.React.createElement("label", { className: "col description" }, desc, tippy),
        Spicetify.React.createElement(
          "div",
          { className: "col action" },
          Spicetify.React.createElement("input", {
            type: inputType,
            className: "input",
            value,
            min,
            max,
            step,
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
      children.map((child) =>
        Spicetify.React.createElement(child.type, {
          ...child,
          tippy: Spicetify.React.createElement(Tippy, { label: child.tippy }),
        })
      )
    );
  };

  const SubSection = ({ name, condition = true, items, callback, ...props }) => {
    const [state, setState] = Spicetify.React.useState(getConfig(name) ?? true);
    if (condition === false) return null;

    return Spicetify.React.createElement(
      Spicetify.React.Fragment,
      null,
      Spicetify.React.createElement(Slider, {
        name,
        callback: (value) => {
          setState(value);
          callback?.(value);
        },
        ...props,
      }),
      state &&
        Spicetify.React.createElement(
          "ul",
          { className: "sub-section", style: { listStyle: "auto", listStyleType: "disc" } },
          items.map((item) =>
            Spicetify.React.createElement(
              "li",
              { className: "sub-section-item", style: { marginLeft: "1rem" } },
              Spicetify.React.createElement(item.type, {
                ...item,
                tippy: Spicetify.React.createElement(Tippy, { label: item.tippy }),
              })
            )
          )
        )
    );
  };

  const Content = () => {
    return Spicetify.React.createElement(
      "div",
      { className: "comfy-settings" },
      Spicetify.React.createElement(Divider),
      Spicetify.React.createElement(Section, { name: "Interface" }, [
        {
          type: Input,
          inputType: "text",
          name: "App-Title",
          desc: "Application Title",
          defaultVal: Spicetify.AppTitle.get(),
          tippy: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            "Leave blank to reset to default",
            Spicetify.React.createElement("br", null),
            "Note: default value can be lost"
          ),
          callback: async (value) => {
            if (!value) await Spicetify.Platform.UserAPI._product_state.delOverridesValues({ keys: ["name"] });
            else await Spicetify.Platform.UserAPI._product_state.putOverridesValues({ pairs: { name: value } });
          },
        },
        {
          type: Input,
          inputType: "number",
          name: "Button-Radius",
          desc: "Button Radius",
          defaultVal: "8",
          tippy: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            Spicetify.React.createElement("h4", null, "Change how circular buttons are:"),
            Spicetify.React.createElement("li", null, "Comfy default: 8px"),
            Spicetify.React.createElement("li", null, "Spotify default: 50px")
          ),
          callback: (value) => document.documentElement.style.setProperty("--button-radius", (value || "8") + "px"),
        },
        {
          type: Slider,
          name: "Flatten-Colors-Snippet",
          desc: "Flatten Theme Colors",
          defaultVal: false,
          tippy: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            Spicetify.React.createElement("h4", null, "Sets main color to the same color as sidebar"),
          ),
        },
        {
          type: Slider,
          name: "Home-Header-Snippet",
          desc: "Colorful Home Header",
          defaultVal: true,
        },
        {
          type: Slider,
          name: "Topbar-Inside-Titlebar-Snippet",
          desc: "Move Topbar Inside Titlebar",
          defaultVal: false,
        },
        {
          type: Slider,
          name: "Horizontal-pageLinks-Snippet",
          desc: "Horizontal Page Links",
          defaultVal: false,
        },
      ]),
      Spicetify.React.createElement(Section, { name: "Playbar" }, [
        {
          type: Slider,
          name: "Remove-Device-Picker-Notification-Snippet",
          desc: "Remove Device Picker Notification",
          defaultVal: false,
        },
        {
          type: Slider,
          name: "Remove-Progress-Bar-Gradient-Snippet",
          desc: "Remove Progress Bar Gradient",
          defaultVal: false,
        },
        {
          type: Slider,
          name: "Remove-Timers-Snippet",
          desc: "Remove Playback Timers",
          defaultVal: false,
        },
        {
          type: Slider,
          name: "Remove-Lyrics-Button-Snippet",
          desc: "Remove Lyrics Button",
          defaultVal: false,
        },
      ]),
      Spicetify.React.createElement(Section, { name: "Cover Art" }, [
        {
          type: Slider,
          name: "Oblong-nowPlaying-Art-Snippet",
          desc: "Oblong Now Playing Cover Art",
          defaultVal: false,
        },
        {
          type: Slider,
          name: `Comfy-${Spicetify.Config?.color_scheme.toLowerCase()}-Snippet`,
          desc: `Comfy-${
            Spicetify.Config?.color_scheme.toLowerCase().charAt(0).toUpperCase() +
            Spicetify.Config?.color_scheme.toLowerCase().slice(1)
          } additional features`,
          defaultVal: true,
          condition: additionalFeatureSchemes.includes(Spicetify.Config?.color_scheme.toLowerCase()),
        },
        {
          type: Slider,
          name: "Revert-Right-Art-Snippet",
          desc: "Disable Right Side Cover Art",
          defaultVal: false,
        },
      ]),
      Spicetify.React.createElement(Section, { name: "Banner Image" }, [
        {
          type: Input,
          inputType: "number",
          name: "Image-Blur",
          desc: "Image Blur",
          defaultVal: "4",
          min: "0",
          tippy: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            Spicetify.React.createElement("h4", null, "Amount of banner blur in pixels:"),
            Spicetify.React.createElement("li", null, "Comfy default: 4px")
          ),
          callback: (value) => document.documentElement.style.setProperty("--image-blur", (value || "4") + "px"),
        },
        {
          type: SubSection,
          name: "Apple-Music-Gradient-Snippet",
          desc: "Apple Music Gradient",
          defaultVal: false,
          tippy: Spicetify.React.createElement(
            Spicetify.React.Fragment,
            null,
            Spicetify.React.createElement(
              "div",
              {
                style: {
                  // tippy doesnt like loading images
                  height: "315px",
                },
              },
              Spicetify.React.createElement("img", {
                src: "https://github.com/Comfy-Themes/Spicetify/blob/main/images/settings/am-blur.gif?raw=true",
                alt: "preview",
                style: {
                  width: "100%",
                },
              }),
              Spicetify.React.createElement("h4", null, "Blur (10x Value):"),
              Spicetify.React.createElement("li", null, "Recommended: 4px")
            )
          ),
          items: [
            {
              type: Input,
              inputType: "number",
              name: "Gradient-Speed",
              desc: "Gradient Speed - Advanced",
              defaultVal: "50",
              min: "0",
              tippy: Spicetify.React.createElement(
                Spicetify.React.Fragment,
                null,
                Spicetify.React.createElement("h4", null, "Seconds per full rotation (360°):"),
                Spicetify.React.createElement("li", null, "Comfy default: 50")
              ),
              callback: (value) =>
                document.documentElement.style.setProperty("--gradient-speed", (value || "50") + "s"),
            },
            {
              type: Input,
              inputType: "number",
              name: "Gradient-Size",
              desc: "Gradient Size - Advanced",
              defaultVal: "150",
              min: "0",
              tippy: Spicetify.React.createElement(
                Spicetify.React.Fragment,
                null,
                Spicetify.React.createElement("h4", null, "Width of circles in relation to viewport (in %):"),
                Spicetify.React.createElement("li", null, "Comfy default: 150")
              ),
              callback: (value) =>
                document.documentElement.style.setProperty("--gradient-width", (value || "150") + "%"),
            },
          ],
        },
        {
          type: SubSection,
          name: "Custom-Image",
          desc: "Custom Image Enabled",
          defaultVal: false,
          callback: updateImageDisplay,
          items: [
            {
              type: Input,
              inputType: "text",
              name: "Custom-Image-URL",
              desc: "Custom Image URL",
              defaultVal: "Paste URL here!",
              tippy: Spicetify.React.createElement(
                Spicetify.React.Fragment,
                null,
                Spicetify.React.createElement("h4", null, "Local Images:"),
                Spicetify.React.createElement("li", null, "Place desired image in 'spotify/Apps/xpui/images'."),
                Spicetify.React.createElement("li", null, "Enter 'images/image.png' into text box.")
              ),
              callback: updateImageDisplay,
            },
          ],
        },
      ])
    );
  };

  const DiscordButton = () => {
    return Spicetify.React.createElement(
      Spicetify.ReactComponent.TooltipWrapper,
      {
        label: "Join our Discord!",
        showDelay: 200,
      },
      Spicetify.React.createElement(
        "button",
        {
          className:
            "main-buddyFeed-closeButton Button-sm-16-buttonTertiary-iconOnly-isUsingKeyboard-useBrowserDefaultFocusStyle Button-sm-16-buttonTertiary-iconOnly-useBrowserDefaultFocusStyle",
          onClick: () => window.open("https://discord.gg/rtBQX5D3bD"),
        },
        Spicetify.React.createElement("svg", {
          width: "16",
          height: "16",
          viewBox: "0 -28.5 256 256",
          fill: "currentColor",
          dangerouslySetInnerHTML: {
            __html: `<g xmlns="http://www.w3.org/2000/svg"><path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="currentColor" fill-rule="nonzero"></path></g>`,
          },
        })
      )
    );
  };

  const { toggle } = Spicetify.Panel.registerPanel({
    label: "Comfy Settings",
    children: Spicetify.React.createElement(Content),
    style: { minWidth: "calc(350px - var(--panel-gap))" },
    headerActions: Spicetify.React.createElement(DiscordButton),
  });

  // SETTINGS MENU
  const svg = `<svg viewBox="0 0 262.394 262.394" style="scale: 0.5; fill: var(--spice-text)"><path d="M245.63,103.39h-9.91c-2.486-9.371-6.197-18.242-10.955-26.432l7.015-7.015c6.546-6.546,6.546-17.159,0-23.705 l-15.621-15.621c-6.546-6.546-17.159-6.546-23.705,0l-7.015,7.015c-8.19-4.758-17.061-8.468-26.432-10.955v-9.914 C159.007,7.505,151.502,0,142.244,0h-22.091c-9.258,0-16.763,7.505-16.763,16.763v9.914c-9.37,2.486-18.242,6.197-26.431,10.954 l-7.016-7.015c-6.546-6.546-17.159-6.546-23.705,0.001L30.618,46.238c-6.546,6.546-6.546,17.159,0,23.705l7.014,7.014 c-4.758,8.19-8.469,17.062-10.955,26.433h-9.914c-9.257,0-16.762,7.505-16.762,16.763v22.09c0,9.258,7.505,16.763,16.762,16.763 h9.914c2.487,9.371,6.198,18.243,10.956,26.433l-7.015,7.015c-6.546,6.546-6.546,17.159,0,23.705l15.621,15.621 c6.546,6.546,17.159,6.546,23.705,0l7.016-7.016c8.189,4.758,17.061,8.469,26.431,10.955v9.913c0,9.258,7.505,16.763,16.763,16.763 h22.091c9.258,0,16.763-7.505,16.763-16.763v-9.913c9.371-2.487,18.242-6.198,26.432-10.956l7.016,7.017 c6.546,6.546,17.159,6.546,23.705,0l15.621-15.621c3.145-3.144,4.91-7.407,4.91-11.853s-1.766-8.709-4.91-11.853l-7.016-7.016 c4.758-8.189,8.468-17.062,10.955-26.432h9.91c9.258,0,16.763-7.505,16.763-16.763v-22.09 C262.393,110.895,254.888,103.39,245.63,103.39z M131.198,191.194c-33.083,0-59.998-26.915-59.998-59.997 c0-33.083,26.915-59.998,59.998-59.998s59.998,26.915,59.998,59.998C191.196,164.279,164.281,191.194,131.198,191.194z"/><path d="M131.198,101.199c-16.541,0-29.998,13.457-29.998,29.998c0,16.54,13.457,29.997,29.998,29.997s29.998-13.457,29.998-29.997 C161.196,114.656,147.739,101.199,131.198,101.199z"/></svg>`;
  new Spicetify.Topbar.Button("Comfy Settings", svg, toggle, false, true);

  // Workaround for hotloading assets
  Spicetify.ReactDOM.render(Spicetify.React.createElement(Content), document.createElement("div"));
})();
