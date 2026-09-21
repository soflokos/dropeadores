"use strict";

const HISTORY_KEY = "no-gnomo-hall-of-shame-v1";
const SOUND_KEY = "no-gnomo-roulette-sound-v1";

const raidConfigs = {
  10: { tanks: [2], healers: [2, 3] },
  20: { tanks: [2, 3], healers: [4] },
  40: { tanks: [3, 4], healers: [8] }
};

const tankSpecs = new Set(["Guardian", "Protection", "Protection1"]);
const healerSpecs = new Set(["Discipline", "Holy1", "Restoration", "Restoration1"]);

const reasons = [
  "lleva 4 días diciendo «mañana entro».",
  "ha decidido tocar césped.",
  "se le acabó el hype.",
  "dice que vuelve para el próximo parche.",
  "ha descubierto que existen otros videojuegos.",
  "asegura que solamente se toma un descanso.",
  "insiste en que no ha dropeado.",
  "volverá™.",
  "no pasó el filtro de las dos semanas.",
  "ha sido reclamado por la vida real."
];

const ui = {
  machine: document.querySelector("#machine"),
  playerName: document.querySelector("#playerName"),
  playerMeta: document.querySelector("#playerMeta"),
  spinButton: document.querySelector("#spinButton"),
  undoButton: document.querySelector("#undoButton"),
  resetButton: document.querySelector("#resetButton"),
  remainingCount: document.querySelector("#remainingCount"),
  fallenCount: document.querySelector("#fallenCount"),
  weekCount: document.querySelector("#weekCount"),
  totalIntro: document.querySelector("#totalIntro"),
  result: document.querySelector("#result"),
  resultName: document.querySelector("#resultName"),
  resultReason: document.querySelector("#resultReason"),
  hallList: document.querySelector("#hallList"),
  hallEmpty: document.querySelector("#hallEmpty"),
  survivorsList: document.querySelector("#survivorsList"),
  raidSizeButtons: [...document.querySelectorAll("[data-raid-size]")],
  generateRaidButton: document.querySelector("#generateRaidButton"),
  raidSummary: document.querySelector("#raidSummary"),
  raidComposition: document.querySelector("#raidComposition"),
  tankList: document.querySelector("#tankList"),
  healerList: document.querySelector("#healerList"),
  dpsList: document.querySelector("#dpsList"),
  tankCount: document.querySelector("#tankCount"),
  healerCount: document.querySelector("#healerCount"),
  dpsCount: document.querySelector("#dpsCount"),
  musicToggle: document.querySelector("#musicToggle"),
  musicLabel: document.querySelector("#musicLabel"),
  resetDialog: document.querySelector("#resetDialog"),
  confirmReset: document.querySelector("#confirmReset"),
  confettiLayer: document.querySelector("#confettiLayer"),
  toast: document.querySelector("#toast")
};

let players = [];
let history = loadHistory();
let spinning = false;
let soundEnabled = localStorage.getItem(SOUND_KEY) !== "off";
let audioContext = null;
let raidSize = 10;

init();

async function init() {
  bindEvents();
  syncSoundButton();

  try {
    const response = await fetch("players.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    players = (payload.players || []).filter(player => player && typeof player.name === "string" && player.name.length > 0);
    if (!players.length) throw new Error("Lista vacía");

    const validNames = new Set(players.map(player => player.name));
    history = history.filter(entry => validNames.has(entry.name));
    saveHistory();
    ui.totalIntro.textContent = players.length;
    setReel(players[0]);
    render();
  } catch (error) {
    console.error("No se pudo cargar players.json", error);
    ui.playerName.textContent = "ERROR";
    ui.playerMeta.textContent = "NO SE PUDO CARGAR LA LISTA";
    showToast("No se pudo cargar players.json");
  }
}

function bindEvents() {
  ui.spinButton.addEventListener("click", spin);
  ui.undoButton.addEventListener("click", undoLast);
  ui.resetButton.addEventListener("click", () => ui.resetDialog.showModal());
  ui.confirmReset.addEventListener("click", resetSeason);
  ui.musicToggle.addEventListener("click", toggleSound);
  ui.generateRaidButton.addEventListener("click", generateRaid);
  ui.raidSizeButtons.forEach(button => button.addEventListener("click", () => selectRaidSize(Number(button.dataset.raidSize))));
}

function loadHistory() {
  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory() {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function metaFor(player) {
  return `${player.category || "Sin rol"} · ${player.spec || "Sin especialización"}`;
}

function getSurvivors() {
  const fallen = new Set(history.map(entry => entry.name));
  return players.filter(player => !fallen.has(player.name));
}

function findPlayer(name) {
  return players.find(player => player.name === name) || { name, category: "Sin rol", spec: "Sin especialización" };
}

function roleFor(player) {
  if (player.category === "Tank" || tankSpecs.has(player.spec)) return "tank";
  if (player.category === "Healer" || healerSpecs.has(player.spec)) return "healer";
  return "dps";
}

function randomIndex(length) {
  if (length <= 1) return 0;
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return Math.floor((value[0] / 4294967296) * length);
}

function pick(list, excludedName = null) {
  const available = excludedName === null ? list : list.filter(player => player.name !== excludedName);
  const pool = available.length ? available : list;
  return pool[randomIndex(pool.length)];
}

function shuffled(list) {
  const copy = [...list];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function setReel(player) {
  ui.playerName.textContent = player.name;
  ui.playerMeta.textContent = metaFor(player);
}

async function spin() {
  if (spinning) return;
  const survivors = getSurvivors();
  if (!survivors.length) return;

  spinning = true;
  ui.spinButton.disabled = true;
  ui.undoButton.disabled = true;
  ui.resetButton.disabled = true;
  ui.result.hidden = true;
  ui.machine.classList.remove("winner");
  ui.machine.classList.add("spinning");
  ensureAudio();

  const winner = pick(survivors);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion) {
    for (let index = 0; index < 32; index += 1) {
      setReel(pick(survivors));
      playRouletteClick();
      await wait(43);
    }

    let delay = 65;
    for (let index = 0; index < 16; index += 1) {
      setReel(pick(survivors));
      playRouletteClick();
      await wait(delay);
      delay += 20;
    }

    const fake = pick(survivors, winner.name);
    setReel(fake);
    playRouletteClick(true);
    await wait(850);
    setReel(pick(survivors, winner.name));
    playRouletteClick(true);
    await wait(380);
  }

  setReel(winner);
  ui.machine.classList.remove("spinning");
  ui.machine.classList.add("winner");
  playWinnerSound();

  const entry = {
    name: winner.name,
    category: winner.category,
    spec: winner.spec,
    week: history.length + 1,
    reason: reasons[randomIndex(reasons.length)],
    date: new Date().toISOString()
  };
  history.push(entry);
  saveHistory();
  clearRaid();
  showResult(entry);
  launchConfetti();
  spinning = false;
  render();
}

function showResult(entry) {
  ui.resultName.textContent = entry.name;
  ui.resultReason.textContent = entry.reason;
  ui.result.hidden = false;
}

function undoLast() {
  if (spinning || !history.length) return;
  const restored = history.pop();
  saveHistory();
  clearRaid();
  ui.result.hidden = true;
  ui.machine.classList.remove("winner");
  setReel(findPlayer(restored.name));
  render();
  showToast(`${restored.name} vuelve a la ruleta`);
}

function resetSeason() {
  history = [];
  saveHistory();
  clearRaid();
  ui.result.hidden = true;
  ui.machine.classList.remove("winner", "spinning");
  if (players.length) setReel(players[0]);
  render();
  showToast("Temporada reiniciada");
}

function render() {
  const survivors = getSurvivors();
  ui.remainingCount.textContent = survivors.length;
  ui.fallenCount.textContent = history.length;
  ui.weekCount.textContent = history.length + 1;
  ui.spinButton.disabled = spinning || survivors.length === 0;
  ui.undoButton.disabled = spinning || history.length === 0;
  ui.resetButton.disabled = spinning || history.length === 0;
  ui.generateRaidButton.disabled = spinning || survivors.length < raidSize;
  renderHall();
  renderSurvivors(survivors);
}

function selectRaidSize(size) {
  if (!raidConfigs[size]) return;
  raidSize = size;
  ui.raidSizeButtons.forEach(button => {
    const selected = Number(button.dataset.raidSize) === size;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  clearRaid();
  render();
}

function generateRaid() {
  const survivors = getSurvivors();
  if (survivors.length < raidSize) {
    showToast(`Faltan jugadores: quedan ${survivors.length} supervivientes`);
    return;
  }

  const config = raidConfigs[raidSize];
  const pools = {
    tank: survivors.filter(player => roleFor(player) === "tank"),
    healer: survivors.filter(player => roleFor(player) === "healer"),
    dps: survivors.filter(player => roleFor(player) === "dps")
  };

  const possibleTankCounts = config.tanks.filter(count => count <= pools.tank.length);
  const possibleHealerCounts = config.healers.filter(count => count <= pools.healer.length);
  if (!possibleTankCounts.length || !possibleHealerCounts.length) {
    showToast("No quedan suficientes tanks o heals para esa raid");
    return;
  }

  const tankCount = possibleTankCounts[randomIndex(possibleTankCounts.length)];
  const healerCount = possibleHealerCounts[randomIndex(possibleHealerCounts.length)];
  const dpsCount = raidSize - tankCount - healerCount;
  if (pools.dps.length < dpsCount) {
    showToast(`No quedan ${dpsCount} DPS disponibles`);
    return;
  }

  const composition = {
    tanks: shuffled(pools.tank).slice(0, tankCount),
    healers: shuffled(pools.healer).slice(0, healerCount),
    dps: shuffled(pools.dps).slice(0, dpsCount)
  };

  renderRaidRole(ui.tankList, composition.tanks);
  renderRaidRole(ui.healerList, composition.healers);
  renderRaidRole(ui.dpsList, composition.dps);
  ui.tankCount.textContent = composition.tanks.length;
  ui.healerCount.textContent = composition.healers.length;
  ui.dpsCount.textContent = composition.dps.length;
  ui.raidSummary.textContent = `RAID DE ${raidSize}: ${tankCount} tanks · ${healerCount} heals · ${dpsCount} DPS`;
  ui.raidSummary.hidden = false;
  ui.raidComposition.hidden = false;
}

function renderRaidRole(list, members) {
  list.replaceChildren();
  members.forEach(player => {
    const item = document.createElement("li");
    item.className = "raid-player";
    const name = document.createElement("strong");
    name.textContent = player.name;
    const spec = document.createElement("span");
    spec.textContent = player.spec || player.category;
    item.append(name, spec);
    list.append(item);
  });
}

function clearRaid() {
  ui.raidSummary.hidden = true;
  ui.raidComposition.hidden = true;
}

function renderHall() {
  ui.hallList.replaceChildren();
  ui.hallEmpty.hidden = history.length > 0;

  [...history].reverse().forEach(entry => {
    const row = document.createElement("li");
    row.className = "hall-entry";
    const week = document.createElement("time");
    week.textContent = `Semana ${entry.week}`;
    const name = document.createElement("strong");
    name.textContent = `☠ ${entry.name}`;
    const meta = document.createElement("span");
    meta.textContent = metaFor(entry.category ? entry : findPlayer(entry.name));
    row.append(week, name, meta);
    ui.hallList.append(row);
  });
}

function renderSurvivors(survivors) {
  ui.survivorsList.replaceChildren();
  survivors.forEach(player => {
    const item = document.createElement("div");
    item.className = "survivor";
    item.textContent = player.name;
    item.title = metaFor(player);
    ui.survivorsList.append(item);
  });
}

function toggleSound() {
  soundEnabled = !soundEnabled;
  localStorage.setItem(SOUND_KEY, soundEnabled ? "on" : "off");
  if (soundEnabled) playRouletteClick(true);
  syncSoundButton();
}

function syncSoundButton() {
  ui.musicToggle.setAttribute("aria-pressed", String(soundEnabled));
  ui.musicToggle.setAttribute("aria-label", soundEnabled ? "Desactivar sonido de ruleta" : "Activar sonido de ruleta");
  ui.musicLabel.textContent = soundEnabled ? "SONIDO ON" : "SONIDO OFF";
}

function ensureAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return true;
}

function playTone(frequency, duration, type = "square", volume = .018, delay = 0) {
  if (!soundEnabled || !ensureAudio()) return;
  const start = audioContext.currentTime + delay;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + .008);
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + .02);
}

function playRouletteClick(strong = false) {
  playTone(
    strong ? 520 : 860,
    strong ? .07 : .025,
    "square",
    strong ? .035 : .016
  );
}

function playWinnerSound() {
  if (!soundEnabled) return;
  playTone(392, .12, "square", .025, 0);
  playTone(523.25, .14, "square", .025, .12);
  playTone(783.99, .4, "sawtooth", .03, .25);
}

function launchConfetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const colors = ["#ee3129", "#ff8b25", "#f3d45d", "#e7e5e3"];
  for (let index = 0; index < 70; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colors[randomIndex(colors.length)];
    piece.style.setProperty("--duration", `${2.5 + Math.random() * 2}s`);
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    piece.style.setProperty("--spin", `${360 + Math.random() * 900}deg`);
    piece.style.animationDelay = `${Math.random() * .4}s`;
    ui.confettiLayer.append(piece);
    window.setTimeout(() => piece.remove(), 5100);
  }
}

function showToast(message) {
  ui.toast.textContent = message;
  ui.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => ui.toast.classList.remove("show"), 2200);
}

function wait(milliseconds) {
  return new Promise(resolve => window.setTimeout(resolve, milliseconds));
}
