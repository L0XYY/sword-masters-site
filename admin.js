const STORAGE_KEY = "swordMastersSiteConfig";

const defaults = window.DEFAULT_SITE_CONFIG || {
  playLink: "https://www.roblox.com",
  countdownDate: "2026-12-31T18:00",
  updateMessage: "No updates posted yet.",
  codes: [],
  homeDescription: ""
};

function getConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function showNotice(text) {
  const notice = document.getElementById("notice");
  notice.textContent = text;
  notice.classList.add("show");
  setTimeout(() => notice.classList.remove("show"), 2400);
}

function fillForm() {
  const config = getConfig();

  document.getElementById("playLink").value = config.playLink || "";
  document.getElementById("countdownDate").value = config.countdownDate || "";
  document.getElementById("homeDescription").value = config.homeDescription || "";
  document.getElementById("updateMessage").value = config.updateMessage || "";
  document.getElementById("codes").value = Array.isArray(config.codes) ? config.codes.join("\\n") : "";
}

function formToConfig() {
  return {
    playLink: document.getElementById("playLink").value.trim() || defaults.playLink,
    countdownDate: document.getElementById("countdownDate").value || defaults.countdownDate,
    homeDescription: document.getElementById("homeDescription").value.trim() || defaults.homeDescription,
    updateMessage: document.getElementById("updateMessage").value.trim() || defaults.updateMessage,
    codes: document.getElementById("codes").value
      .split("\\n")
      .map(code => code.trim())
      .filter(Boolean)
  };
}

function exportConfig() {
  const config = formToConfig();
  const output = `window.DEFAULT_SITE_CONFIG = ${JSON.stringify(config, null, 2)};`;
  document.getElementById("exportOutput").value = output;
  return output;
}

document.getElementById("adminForm").addEventListener("submit", event => {
  event.preventDefault();
  const config = formToConfig();
  saveConfig(config);
  exportConfig();
  showNotice("Saved. Open the site in this browser to see changes.");
});

document.getElementById("resetButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  fillForm();
  exportConfig();
  showNotice("Reset to defaults.");
});

document.getElementById("exportButton").addEventListener("click", async () => {
  const output = exportConfig();

  try {
    await navigator.clipboard.writeText(output);
    showNotice("Config copied.");
  } catch {
    showNotice("Config exported below.");
  }
});

fillForm();
exportConfig();
