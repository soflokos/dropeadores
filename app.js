"use strict";

const HISTORY_KEY = "no-gnomo-hall-of-shame-v1";
const MUSIC_KEY = "no-gnomo-circus-music-v1";

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
let musicEnabled = localStorage.getItem(MUSIC_KEY) !== "off";
let audioContext = null;
let circusTimer = null;
let circusStep = 0;

const circusMelody = [
  523.25, 659.25, 783.99, 659.25, 698.46, 880.00, 783.99, 659.25,
  587.33, 698.46, 880.00, 698.46, 659.25, 783.99, 987.77, 783.99,
  523.25, 659.25, 783.99, 1046.50, 987.77, 880.00, 783.99, 659.25,
  698.46, 783.99, 880.00, 783.99, 659.25, 587.33, 523.25, 392.00
];

init();

async function init() {
  bindEvents();
  syncMusicButton();

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
  ui.musicToggle.addEventListener("click", toggleMusic);
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
  startCircusMusic();

  const winner = pick(survivors);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion) {
    for (let index = 0; index < 32; index += 1) {
      setReel(pick(survivors));
      await wait(43);
    }

    let delay = 65;
    for (let index = 0; index < 16; index += 1) {
      setReel(pick(survivors));
      await wait(delay);
      delay += 20;
    }

    const fake = pick(survivors, winner.name);
    setReel(fake);
    await wait(850);
    setReel(pick(survivors, winner.name));
    await wait(380);
  }

  stopCircusMusic();
  setReel(winner);
  ui.machine.classList.remove("spinning");
  ui.machine.classList.add("winner");
  playFinalFlourish();

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
  ui.result.hidden = true;
  ui.machine.classList.remove("winner");
  setReel(findPlayer(restored.name));
  render();
  showToast(`${restored.name} vuelve a la ruleta`);
}

function resetSeason() {
  stopCircusMusic();
  history = [];
  saveHistory();
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
  renderHall();
  renderSurvivors(survivors);
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

function toggleMusic() {
  musicEnabled = !musicEnabled;
  localStorage.setItem(MUSIC_KEY, musicEnabled ? "on" : "off");
  if (!musicEnabled) stopCircusMusic();
  else if (spinning) startCircusMusic();
  else playTone(523.25, .1, "square", .018);
  syncMusicButton();
}

function syncMusicButton() {
  ui.musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  ui.musicToggle.setAttribute("aria-label", musicEnabled ? "Desactivar música de circo" : "Activar música de circo");
  ui.musicLabel.textContent = musicEnabled ? "MÚSICA ON" : "MÚSICA OFF";
}

function ensureAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return false;
  audioContext ||= new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();
  return true;
}

function playTone(frequency, duration, type = "square", volume = .018, delay = 0) {
  if (!musicEnabled || !ensureAudio()) return;
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

function startCircusMusic() {
  if (!musicEnabled || circusTimer) return;
  circusStep = 0;
  const playStep = () => {
    const note = circusMelody[circusStep % circusMelody.length];
    playTone(note, .13, circusStep % 4 === 0 ? "sawtooth" : "square", .014);
    if (circusStep % 4 === 0) playTone(note / 4, .23, "triangle", .025);
    circusStep += 1;
  };
  playStep();
  circusTimer = window.setInterval(playStep, 150);
}

function stopCircusMusic() {
  if (circusTimer) window.clearInterval(circusTimer);
  circusTimer = null;
}

function playFinalFlourish() {
  if (!musicEnabled) return;
  playTone(523.25, .22, "square", .018, 0);
  playTone(659.25, .22, "square", .018, .11);
  playTone(783.99, .42, "sawtooth", .022, .22);
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
