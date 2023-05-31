function hotload(bool, url, classname) {
  if (bool) {
    loadCSS(url, classname);
  } else {
    unloadCSS(classname);
  }
}

async function getCSS(url) {
  return await fetch(url)
    .then((res) => res.text())
    .catch((e) => console.error(e));
}

async function loadCSS(url, classname) {
  const css = await getCSS(url);
  const style = document.createElement("style");
  style.innerHTML = css;
  style.classList.add(classname);
  document.head.appendChild(style);
}

function unloadCSS(classname) {
  return document.querySelector(`.${classname}`)?.remove();
}

function getConfig(key) {
  try {
    return JSON.parse(Spicetify.LocalStorage.get(key));
  } catch (e) {
    console.error(e);
    return null;
  }
}

function createSlider(name, desc, defaultVal, url = null, returnFunc = null) {
  const container = document.createElement("div");
  container.classList.add("setting-row");
  container.id = name;
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
    returnFunc && returnFunc(state);
    console.log(name, getConfig(name));
  };

  return container;
}

function createTextInput(name, desc, defaultVal, tippyMessage = null, returnFunc = null) {
  const currentVal = getConfig(name);
  defaultVal = currentVal ? currentVal : defaultVal;
  const container = document.createElement("div");
  container.classList.add("setting-row");
  container.id = name;
  container.innerHTML = `
  <label class="col description">${desc}</label>
  <div class="qBZYab2T7Yc4O5Nh0mjA" aria-expanded="false"><svg role="img" height="16" width="16" aria-describedby="hover-or-focus-tooltip" aria-hidden="true" tabindex="0" class="Svg-sc-ytk21e-0 Svg-img-16-icon nW1RKQOkzcJcX6aDCZB4" viewBox="0 0 16 16" data-encore-id="icon"><path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path><path d="M7.25 12.026v-1.5h1.5v1.5h-1.5zm.884-7.096A1.125 1.125 0 0 0 7.06 6.39l-1.431.448a2.625 2.625 0 1 1 5.13-.784c0 .54-.156 1.015-.503 1.488-.3.408-.7.652-.973.818l-.112.068c-.185.116-.26.203-.302.283-.046.087-.097.245-.097.57h-1.5c0-.47.072-.898.274-1.277.206-.385.507-.645.827-.846l.147-.092c.285-.177.413-.257.526-.41.169-.23.213-.397.213-.602 0-.622-.503-1.125-1.125-1.125z"></path></svg></div>
  <div class="col action"><input type="text" class="input" placeholder="${defaultVal}"></div>`;
  const help = container.querySelector(".qBZYab2T7Yc4O5Nh0mjA");
  console.log(Spicetify.Tippy(help, {
    ...Spicetify.TippyProps,
    content: tippyMessage
  }))
  const input = container.querySelector("input");
  input.onchange = () => {
    Spicetify.LocalStorage.set(name, `"${input.value}"`);
    returnFunc && returnFunc(input.value);
    console.log(name, getConfig(name));
  };
  return container;
}
