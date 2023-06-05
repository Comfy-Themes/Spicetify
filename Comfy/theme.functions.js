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
  <label class="col description">${desc}</label>
  <div class="qBZYab2T7Yc4O5Nh0mjA" aria-expanded="false">
    <svg role="img" height="16" width="16" aria-describedby="hover-or-focus-tooltip" aria-hidden="true" tabindex="0" class="Svg-sc-ytk21e-0 Svg-img-16-icon nW1RKQOkzcJcX6aDCZB4" viewBox="0 0 16 16" data-encore-id="icon">
      <path d="M8 1.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8z"></path>
      <path d="M7.25 12.026v-1.5h1.5v1.5h-1.5zm.884-7.096A1.125 1.125 0 0 0 7.06 6.39l-1.431.448a2.625 2.625 0 1 1 5.13-.784c0 .54-.156 1.015-.503 1.488-.3.408-.7.652-.973.818l-.112.068c-.185.116-.26.203-.302.283-.046.087-.097.245-.097.57h-1.5c0-.47.072-.898.274-1.277.206-.385.507-.645.827-.846l.147-.092c.285-.177.413-.257.526-.41.169-.23.213-.397.213-.602 0-.622-.503-1.125-1.125-1.125z"></path>
    </svg>
  </div>
  <div class="col action">
    <input type="${type}" class="input" value="${defaultVal}">
  </div>`;
  const help = container.querySelector(".qBZYab2T7Yc4O5Nh0mjA");
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
    returnFunc?.(input.value, name);
    console.log(name, getConfig(name));
  };

  returnFunc?.(defaultVal, name);
  return container;
}
