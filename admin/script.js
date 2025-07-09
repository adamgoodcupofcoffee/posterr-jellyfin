async function loadConfig() {
  const res = await fetch("/api/config");
  const cfg = await res.json();
  document.getElementById("server").value = cfg.server || "";
  document.getElementById("userId").value = cfg.userId || "";
  document.getElementById("dimStart").value = cfg.dimStart || "01:00";
  document.getElementById("dimEnd").value = cfg.dimEnd || "10:00";
  document.getElementById("enableGrain").checked = cfg.enableGrain || false;
  loadThemes(cfg.theme);
}

async function saveConfig() {
  const body = {
    server: document.getElementById("server").value,
    apiKey: document.getElementById("apiKey").value,
    userId: document.getElementById("userId").value,
    dimStart: document.getElementById("dimStart").value,
    dimEnd: document.getElementById("dimEnd").value,
    enableGrain: document.getElementById("enableGrain").checked,
    theme: document.getElementById("themeSelector").value
  };
  await fetch("/api/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  alert("Config saved!");
}

async function testConnection() {
  const res = await fetch("/api/test-connection");
  const status = await res.json();
  const msg = document.getElementById("connectionResult");
  msg.textContent = status.success ? "✅ Connected to Jellyfin!" : "❌ Failed to connect.";
  msg.style.color = status.success ? "lime" : "red";
}

async function loadThemes(selected) {
  const res = await fetch("/themes/");
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const options = [...doc.links]
    .map(link => link.href.split("/").pop())
    .filter(name => name.endsWith(".css"));
  const sel = document.getElementById("themeSelector");
  sel.innerHTML = "";
  for (const opt of options) {
    const el = document.createElement("option");
    el.value = opt;
    el.textContent = opt;
    if (opt === selected) el.selected = true;
    sel.appendChild(el);
  }
}

async function loadTheme() {
  const theme = document.getElementById("themeSelector").value;
  const res = await fetch(`/themes/${theme}`);
  const css = await res.text();
  document.getElementById("cssEditor").value = css;
  document.getElementById("themePreview").src += ""; // refresh
}

async function applyTheme() {
  await saveConfig();
  alert("Theme applied!");
}

async function saveTheme() {
  const name = document.getElementById("themeSelector").value;
  const css = document.getElementById("cssEditor").value;
  await fetch(`/themes/${name}`, {
    method: "POST",
    headers: { "Content-Type": "text/css" },
    body: css
  });
  alert("Theme saved!");
}

function createTheme() {
  const name = prompt("Enter new theme filename (no spaces, must end in .css):");
  if (name) {
    document.getElementById("themeSelector").innerHTML += `<option value="${name}" selected>${name}</option>`;
    document.getElementById("cssEditor").value = "";
  }
}

function deleteTheme() {
  const name = document.getElementById("themeSelector").value;
  if (confirm(`Delete theme ${name}?`)) {
    fetch(`/themes/${name}`, { method: "DELETE" }).then(() => location.reload());
  }
}

loadConfig();
