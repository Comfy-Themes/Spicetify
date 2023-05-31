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

function createTextInput(name, desc, defaultVal, returnFunc = null) {
  const currentVal = getConfig(name);
  defaultVal = currentVal ? currentVal : defaultVal;
  const container = document.createElement("div");
  container.classList.add("setting-row");
  container.id = name;
  container.innerHTML = `
  <label class="col description">${desc}</label>
  <div class="col action"><input type="text" class="input" placeholder="${defaultVal}"></div>`;
  const input = container.querySelector("input");
  input.onchange = () => {
    Spicetify.LocalStorage.set(name, `"${input.value}"`);
    returnFunc && returnFunc(input.value);
    console.log(name, getConfig(name));
  };
  return container;
}
