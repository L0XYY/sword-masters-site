const STORAGE_KEY = "swordMastersSiteConfig";

const defaults = window.DEFAULT_SITE_CONFIG || {
  playLink: "https://www.roblox.com",
  countdownDate: "2026-12-31T18:00",
  updateMessage: "No updates posted yet.",
  codes: [],
  homeDescription: "Train your power, unlock rare swords, battle in arenas, collect rewards, and become the strongest blade master."
};

const fields = {
  playLink: document.getElementById("playLink"),
  countdownDate: document.getElementById("countdownDate"),
  homeDescription: document.getElementById("homeDescription"),
  updateMessage: document.getElementById("updateMessage"),
  codes: document.getElementById("codes")
};

function getSavedConfig() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function formToConfig() {
  return {
    playLink: fields.playLink.value.trim() || defaults.playLink,
    countdownDate: fields.countdownDate.value || defaults.countdownDate,
    homeDescription: fields.homeDescription.value.trim() || defaults.homeDescription,
    updateMessage: fields.updateMessage.value.trim() || defaults.updateMessage,
    codes: fields.codes.value
      .split("\n")
      .map(code => code.trim())
      .filter(Boolean)
  };
}

function fillForm(config = getSavedConfig()) {
  fields.playLink.value = config.playLink || "";
  fields.countdownDate.value = config.countdownDate || "";
  fields.homeDescription.value = config.homeDescription || "";
  fields.updateMessage.value = config.updateMessage || "";
  fields.codes.value = Array.isArray(config.codes) ? config.codes.join("\n") : "";
}

function renderPreview() {
  const config = formToConfig();

  document.getElementById("previewPlayLink").textContent = config.playLink;
  document.getElementById("previewCountdown").textContent = config.countdownDate
    ? new Date(config.countdownDate).toLocaleString()
    : "Not set";
  document.getElementById("previewCodes").textContent = config.codes.length
    ? config.codes.join(", ")
    : "No active codes";

  document.getElementById("exportOutput").value =
    "window.DEFAULT_SITE_CONFIG = " + JSON.stringify(config, null, 2) + ";";
}

function showNotice(message) {
  const notice = document.getElementById("notice");
  notice.textContent = message;
  notice.classList.add("show");
  setTimeout(() => notice.classList.remove("show"), 2600);
}

Object.values(fields).forEach(field => {
  field.addEventListener("input", renderPreview);
});

document.getElementById("adminForm").addEventListener("submit", event => {
  event.preventDefault();
  const config = formToConfig();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  renderPreview();
  showNotice("Saved preview. Open index.html in this browser to see it.");
});

document.getElementById("resetButton").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  fillForm(defaults);
  renderPreview();
  showNotice("Reset to defaults.");
});

document.getElementById("exportButton").addEventListener("click", async () => {
  renderPreview();
  const output = document.getElementById("exportOutput").value;

  try {
    await navigator.clipboard.writeText(output);
    showNotice("Export copied. Paste it into config.js.");
  } catch {
    showNotice("Export ready below. Copy it into config.js.");
  }
});

fillForm();
renderPreview();
