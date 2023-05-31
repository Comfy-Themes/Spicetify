(() => {
  const script = document.createElement("SCRIPT");
  script.setAttribute("type", "text/javascript");
  script.setAttribute(
    "src",
    "https://comfy-themes.github.io/Spicetify/Comfy/theme.functions.js"
  );
  document.head.appendChild(script);

  const themeScript = document.createElement("SCRIPT");
  themeScript.setAttribute("type", "text/javascript");
  themeScript.setAttribute(
    "src",
    "https://comfy-themes.github.io/Spicetify/Comfy/theme.script.js"
  );
  document.head.appendChild(themeScript);
})();
