"use strict";

const HISTORY_KEY = "no-gnomo-hall-of-shame-v1";
const SOUND_KEY = "no-gnomo-roulette-sound-v1";

const raidConfigs = {
  10: { tanks: [2], healers: [2, 3] },
  20: { tanks: [2, 3], healers: [4] },
  40: { tanks: [3, 4], healers: [8] }
};

const classBySpec = {
  Affliction: "Warlock",
  Destruction: "Warlock",
  Assassination: "Rogue",
  Combat: "Rogue",
  Balance: "Druid",
  Feral: "Druid",
  Guardian: "Druid",
  Restoration: "Druid",
  Beastmastery: "Hunter",
  Survival: "Hunter",
  Discipline: "Priest",
  Shadow: "Priest",
  Holy1: "Paladin",
  Retribution: "Paladin",
  Protection1: "Paladin",
  Elemental: "Shaman",
  Enhancement: "Shaman",
  Restoration1: "Shaman",
  Fire: "Mage",
  Fury: "Warrior",
  Protection: "Warrior"
};

const tankSpecs = new Set(["Guardian", "Protection", "Protection1"]);
const healerSpecs = new Set(["Discipline", "Holy1", "Restoration", "Restoration1"]);

const wowClassColors = {
  Warrior: "#c69b6d",
  Paladin: "#f48cba",
  Hunter: "#aad372",
  Rogue: "#fff468",
  Priest: "#ffffff",
  Shaman: "#0070dd",
  Mage: "#3fc7eb",
  Warlock: "#8788ee",
  Druid: "#ff7c0a"
};

const metaSpecs = [
  { name: "Arms", className: "Warrior", role: "dps" },
  { name: "Fury", className: "Warrior", role: "dps" },
  { name: "Retribution", className: "Paladin", role: "dps" },
  { name: "Beast Mastery", className: "Hunter", role: "dps" },
  { name: "Marksmanship", className: "Hunter", role: "dps" },
  { name: "Survival", className: "Hunter", role: "dps" },
  { name: "Combat", className: "Rogue", role: "dps" },
  { name: "Assassination", className: "Rogue", role: "dps" },
  { name: "Shadow", className: "Priest", role: "dps" },
  { name: "Elemental", className: "Shaman", role: "dps" },
  { name: "Enhancement", className: "Shaman", role: "dps" },
  { name: "Fire", className: "Mage", role: "dps" },
  { name: "Frost", className: "Mage", role: "dps" },
  { name: "Arcane", className: "Mage", role: "dps" },
  { name: "Affliction", className: "Warlock", role: "dps" },
  { name: "Demonology", className: "Warlock", role: "dps" },
  { name: "Destruction", className: "Warlock", role: "dps" },
  { name: "Balance", className: "Druid", role: "dps" },
  { name: "Feral", className: "Druid", role: "dps" },
  { name: "Protection", className: "Warrior", role: "tank" },
  { name: "Protection", className: "Paladin", role: "tank" },
  { name: "Guardian", className: "Druid", role: "tank" },
  { name: "🛡️ Fuwar", className: "Warrior", role: "dps", special: true },
  { name: "Holy", className: "Paladin", role: "healer" },
  { name: "Discipline", className: "Priest", role: "healer" },
  { name: "Holy", className: "Priest", role: "healer" },
  { name: "Restoration", className: "Shaman", role: "healer" },
  { name: "Restoration", className: "Druid", role: "healer" }
];

const metaTierNames = ["S", "A", "B", "C", "D"];
const metaHeadlines = [
  "Fire sube a S porque alguien enseñó un crítico sin contexto.",
  "Fuwar confirma que la clase más rota es la que está jugando.",
  "Tres wipes bastan para declarar una especialización injugable.",
  "El 87% de los datos procede de alguien diciendo «créeme».",
  "Protection cae dos tiers tras una discusión en #general.",
  "La build secreta deja de funcionar en cuanto se publica.",
  "Fuwar ha bloqueado otro nerf levantando el escudo."
];

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
  openRaidComp: document.querySelector("#openRaidComp"),
  closeRaidComp: document.querySelector("#closeRaidComp"),
  switchToRaidComp: document.querySelector("#switchToRaidComp"),
  raidCompSheet: document.querySelector("#raidCompSheet"),
  raidSheetBackdrop: document.querySelector("#raidSheetBackdrop"),
  raidSizeButtons: [...document.querySelectorAll("[data-raid-size]")],
  generateRaidButton: document.querySelector("#generateRaidButton"),
  raidSizeSummary: document.querySelector("#raidSizeSummary"),
  raidRoleSummary: document.querySelector("#raidRoleSummary"),
  raidGroupSummary: document.querySelector("#raidGroupSummary"),
  raidGroups: document.querySelector("#raidGroups"),
  raidCompMessage: document.querySelector("#raidCompMessage"),
  openMetaLab: document.querySelector("#openMetaLab"),
  closeMetaLab: document.querySelector("#closeMetaLab"),
  switchToMetaLab: document.querySelector("#switchToMetaLab"),
  metaLabSheet: document.querySelector("#metaLabSheet"),
  metaSheetBackdrop: document.querySelector("#metaSheetBackdrop"),
  regenerateMeta: document.querySelector("#regenerateMeta"),
  metaTierTab: document.querySelector("#metaTierTab"),
  metaChartsTab: document.querySelector("#metaChartsTab"),
  metaTierPanel: document.querySelector("#metaTierPanel"),
  metaChartsPanel: document.querySelector("#metaChartsPanel"),
  metaRoleTabs: [...document.querySelectorAll("[data-meta-role]")],
  metaTierList: document.querySelector("#metaTierList"),
  metaHeadline: document.querySelector("#metaHeadline"),
  metaReportSeed: document.querySelector("#metaReportSeed"),
  metaBarChart: document.querySelector("#metaBarChart"),
  metaScatterChart: document.querySelector("#metaScatterChart"),
  metaLineChart: document.querySelector("#metaLineChart"),
  metaPuddleLegend: document.querySelector("#metaPuddleLegend"),
  metaPuddleChart: document.querySelector("#metaPuddleChart"),
  metaBarrierChart: document.querySelector("#metaBarrierChart"),
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
let raidSize = 40;
let activeSheet = null;
let activeMetaRole = "dps";
let metaTierData = {};
let metaChartData = {};
const sheetCloseTimers = new Map();

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
  ui.openRaidComp.addEventListener("click", openRaidComp);
  ui.closeRaidComp.addEventListener("click", closeRaidComp);
  ui.raidSheetBackdrop.addEventListener("click", closeRaidComp);
  ui.switchToMetaLab.addEventListener("click", openMetaLab);
  ui.openMetaLab.addEventListener("click", openMetaLab);
  ui.closeMetaLab.addEventListener("click", closeMetaLab);
  ui.metaSheetBackdrop.addEventListener("click", closeMetaLab);
  ui.switchToRaidComp.addEventListener("click", openRaidComp);
  ui.regenerateMeta.addEventListener("click", generateMetaLab);
  ui.metaTierTab.addEventListener("click", () => selectMetaPanel("tier"));
  ui.metaChartsTab.addEventListener("click", () => selectMetaPanel("charts"));
  ui.metaRoleTabs.forEach(button => button.addEventListener("click", () => selectMetaRole(button.dataset.metaRole)));
  ui.generateRaidButton.addEventListener("click", generateRaidComp);
  ui.raidSizeButtons.forEach(button => button.addEventListener("click", () => selectRaidSize(Number(button.dataset.raidSize))));
  document.addEventListener("keydown", event => {
    if (event.key !== "Escape" || !activeSheet) return;
    if (activeSheet === ui.raidCompSheet) closeRaidComp();
    if (activeSheet === ui.metaLabSheet) closeMetaLab();
  });
  window.addEventListener("resize", redrawMetaCharts);
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

function classFor(player) {
  return classBySpec[player.spec] || "Warrior";
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
  clearRaidComp();
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
  clearRaidComp();
  ui.result.hidden = true;
  ui.machine.classList.remove("winner");
  setReel(findPlayer(restored.name));
  render();
  showToast(`${restored.name} vuelve a la ruleta`);
}

function resetSeason() {
  history = [];
  saveHistory();
  clearRaidComp();
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

function openRaidComp() {
  openSideSheet(ui.raidCompSheet, ui.closeRaidComp);
  generateRaidComp();
}

function closeRaidComp() {
  closeSideSheet(ui.raidCompSheet, ui.openRaidComp);
}

function openMetaLab() {
  openSideSheet(ui.metaLabSheet, ui.closeMetaLab);
  generateMetaLab();
}

function closeMetaLab() {
  closeSideSheet(ui.metaLabSheet, ui.openMetaLab);
}

function openSideSheet(sheet, closeButton) {
  if (activeSheet && activeSheet !== sheet) closeSideSheet(activeSheet, null, true);

  window.clearTimeout(sheetCloseTimers.get(sheet));
  sheet.hidden = false;
  activeSheet = sheet;
  document.body.classList.add("side-sheet-open");
  window.requestAnimationFrame(() => {
    sheet.classList.add("open");
    closeButton.focus();
  });
}

function closeSideSheet(sheet, opener, immediate = false) {
  window.clearTimeout(sheetCloseTimers.get(sheet));
  sheet.classList.remove("open");

  if (activeSheet === sheet) {
    activeSheet = null;
    document.body.classList.remove("side-sheet-open");
  }

  const finish = () => {
    sheet.hidden = true;
    if (opener && activeSheet === null) opener.focus();
  };

  if (immediate) {
    finish();
  } else {
    sheetCloseTimers.set(sheet, window.setTimeout(finish, 240));
  }
}

function selectMetaPanel(panel) {
  const showCharts = panel === "charts";
  ui.metaTierTab.classList.toggle("active", !showCharts);
  ui.metaChartsTab.classList.toggle("active", showCharts);
  ui.metaTierTab.setAttribute("aria-selected", String(!showCharts));
  ui.metaChartsTab.setAttribute("aria-selected", String(showCharts));
  ui.metaTierPanel.hidden = showCharts;
  ui.metaChartsPanel.hidden = !showCharts;
  if (showCharts) window.requestAnimationFrame(drawMetaCharts);
}

function selectMetaRole(role) {
  if (!metaTierData[role]) return;
  activeMetaRole = role;
  ui.metaRoleTabs.forEach(button => {
    const selected = button.dataset.metaRole === role;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  renderMetaTierList();
}

function generateMetaLab() {
  ["dps", "tank", "healer"].forEach(role => {
    const pool = shuffled(metaSpecs.filter(spec => spec.role === role));
    metaTierData[role] = Object.fromEntries(metaTierNames.map(tier => [tier, []]));
    pool.forEach((spec, index) => {
      const position = index / pool.length;
      const tier = position < .14 ? "S" : position < .37 ? "A" : position < .64 ? "B" : position < .86 ? "C" : "D";
      metaTierData[role][tier].push(spec);
    });
  });

  const dpsPool = shuffled(metaSpecs.filter(spec => spec.role === "dps"));
  const fuwar = metaSpecs.find(spec => spec.special);
  const randomDps = dpsPool.find(spec => !spec.special) || dpsPool[0];
  const ourDps = dpsPool.find(spec => spec !== randomDps && !spec.special) || dpsPool[1];
  metaChartData.bars = [
    { name: "Random sin bis", className: randomDps.className, value: randomWhole(1050, 1350) },
    { name: "Nuestro DPS con bis", className: ourDps.className, value: randomWhole(480, 790) }
  ];

  const excusePlayers = getMetaPlayerSample(5);
  metaChartData.scatter = excusePlayers.map(player => {
    const mechanics = randomWhole(5, 92);
    return {
      ...player,
      x: mechanics,
      y: Math.max(4, Math.min(100, 105 - mechanics + randomWhole(-16, 18)))
    };
  });

  metaChartData.lines = [fuwar, ...dpsPool.filter(spec => !spec.special).slice(5, 7)].map(spec => {
    let value = randomWhole(86, 100);
    return {
      ...spec,
      values: Array.from({ length: 8 }, () => {
        value = Math.max(8, value - randomWhole(2, 17) + randomWhole(-4, 5));
        return Math.round(value);
      })
    };
  });

  const usedNames = new Set(excusePlayers.map(player => player.name));
  metaChartData.puddle = getMetaPlayerSample(5, usedNames).map((player, playerIndex) => {
    let value = randomWhole(760, 1280);
    const crashPoint = randomWhole(2, 4);
    const floor = 18 + playerIndex * 22;
    return {
      ...player,
      values: Array.from({ length: 7 }, (_, index) => {
        if (index < crashPoint) value = Math.max(650, value + randomWhole(-80, 70));
        if (index === crashPoint) value = randomWhole(120, 330);
        if (index > crashPoint) value = Math.max(floor, value - randomWhole(55, 160));
        return Math.round(value);
      })
    };
  });
  metaChartData.barriers = Array.from({ length: randomWhole(30, 42) }, (_, index) => ({
    attempt: index + 1,
    distance: randomWhole(24, 40),
    lateral: randomWhole(-18, 18)
  }));
  renderMetaPuddleLegend();

  ui.metaHeadline.textContent = metaHeadlines[randomIndex(metaHeadlines.length)];
  ui.metaReportSeed.textContent = `Informe #${randomWhole(1000, 9999)} · parche 0.bar.${randomWhole(1, 9)} · generado al entrar`;
  renderMetaTierList();
  drawMetaCharts();
}

function randomWhole(minimum, maximum) {
  return Math.floor(minimum + Math.random() * (maximum - minimum + 1));
}

function getMetaPlayerSample(count, excludedNames = new Set()) {
  const fromJson = players
    .filter(player => !excludedNames.has(player.name))
    .map(player => ({ name: player.name, className: classFor(player) }));

  if (fromJson.length >= count) return shuffled(fromJson).slice(0, count);

  const fallback = metaSpecs
    .filter(spec => !spec.special && !excludedNames.has(spec.name))
    .map(spec => ({ name: spec.name, className: spec.className }));
  return shuffled([...fromJson, ...fallback]).slice(0, count);
}

function renderMetaPuddleLegend() {
  ui.metaPuddleLegend.replaceChildren();
  metaChartData.puddle.forEach(player => {
    const item = document.createElement("span");
    item.dataset.wowClass = player.className;
    const dot = document.createElement("i");
    const name = document.createElement("strong");
    name.textContent = player.name;
    item.append(dot, name);
    ui.metaPuddleLegend.append(item);
  });
}

function renderMetaTierList() {
  ui.metaTierList.replaceChildren();
  metaTierNames.forEach(tier => {
    const row = document.createElement("section");
    row.className = `meta-tier-row tier-${tier.toLowerCase()}`;

    const letter = document.createElement("div");
    letter.className = "meta-tier-letter";
    letter.textContent = tier;

    const specs = document.createElement("div");
    specs.className = "meta-tier-specs";
    metaTierData[activeMetaRole][tier].forEach(spec => {
      const chip = document.createElement("div");
      chip.className = "meta-spec";
      chip.dataset.wowClass = spec.className;

      const name = document.createElement("strong");
      name.textContent = spec.name;
      const wowClass = document.createElement("span");
      wowClass.textContent = spec.special ? "Warrior · Escudo" : spec.className;
      chip.append(name, wowClass);
      specs.append(chip);
    });

    row.append(letter, specs);
    ui.metaTierList.append(row);
  });
}

function createSvgElement(name, attributes = {}, text = "") {
  const element = document.createElementNS("http://www.w3.org/2000/svg", name);
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
  if (text) element.textContent = text;
  return element;
}

function addSvgTitle(element, text) {
  element.append(createSvgElement("title", {}, text));
  return element;
}

function prepareMetaChart(svg, height) {
  const width = Math.max(300, Math.floor(svg.getBoundingClientRect().width || 440));
  svg.replaceChildren();
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  return { width, height };
}

function drawMetaBarChart() {
  const svg = ui.metaBarChart;
  const { width, height } = prepareMetaChart(svg, 235);
  const margin = { top: 12, right: 52, bottom: 38, left: width < 500 ? 118 : 145 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  [0, .25, .5, .75, 1].forEach(tick => {
    const x = margin.left + plotWidth * tick;
    svg.append(createSvgElement("line", { x1: x, y1: margin.top, x2: x, y2: margin.top + plotHeight, class: "grid" }));
    svg.append(createSvgElement("text", { x, y: height - 20, "text-anchor": "middle", class: "tick-label" }, Math.round(1400 * tick)));
  });

  const rowHeight = plotHeight / metaChartData.bars.length;
  metaChartData.bars.forEach((item, index) => {
    const y = margin.top + index * rowHeight + 5;
    const barWidth = plotWidth * (item.value / 1400);
    const label = item.name;
    svg.append(createSvgElement("text", { x: margin.left - 8, y: y + rowHeight * .45, "text-anchor": "end", class: "tick-label", fill: wowClassColors[item.className] }, label));
    const bar = createSvgElement("rect", { x: margin.left, y, width: barWidth, height: Math.max(12, rowHeight - 10), rx: 3, fill: wowClassColors[item.className] });
    svg.append(addSvgTitle(bar, `${label}: ${item.value} DPS inventado`));
    svg.append(createSvgElement("text", { x: margin.left + barWidth + 6, y: y + rowHeight * .45, class: "tick-label" }, item.value));
  });
  svg.append(createSvgElement("text", { x: margin.left + plotWidth / 2, y: height - 3, "text-anchor": "middle", class: "axis-title" }, "DPS según fuentes interesadas"));
}

function drawMetaScatterChart() {
  const svg = ui.metaScatterChart;
  const { width, height } = prepareMetaChart(svg, 235);
  const margin = { top: 15, right: 26, bottom: 34, left: 55 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  [0, .25, .5, .75, 1].forEach(tick => {
    const x = margin.left + plotWidth * tick;
    const y = margin.top + plotHeight * (1 - tick);
    svg.append(createSvgElement("line", { x1: x, y1: margin.top, x2: x, y2: margin.top + plotHeight, class: "grid" }));
    svg.append(createSvgElement("line", { x1: margin.left, y1: y, x2: margin.left + plotWidth, y2: y, class: "grid" }));
    svg.append(createSvgElement("text", { x, y: height - 18, "text-anchor": "middle", class: "tick-label" }, Math.round(100 * tick)));
    svg.append(createSvgElement("text", { x: margin.left - 7, y: y + 4, "text-anchor": "end", class: "tick-label" }, Math.round(100 * tick)));
  });

  metaChartData.scatter.forEach(item => {
    const x = margin.left + plotWidth * (item.x / 100);
    const y = margin.top + plotHeight * (1 - item.y / 100);
    const label = item.name;
    const point = createSvgElement("circle", { cx: x, cy: y, r: 7, fill: wowClassColors[item.className], stroke: "#111214", "stroke-width": 2 });
    svg.append(addSvgTitle(point, `${label}: mecánicas correctas ${item.x}% · experiencia poniendo excusas ${item.y}%`));
    svg.append(createSvgElement("text", { x: x + 9, y: y - 8, class: "tick-label", fill: wowClassColors[item.className] }, label));
  });
  svg.append(createSvgElement("text", { x: margin.left + plotWidth / 2, y: height - 2, "text-anchor": "middle", class: "axis-title" }, "Mecánicas realizadas correctamente (%)"));
  svg.append(createSvgElement("text", { x: 13, y: margin.top + plotHeight / 2, "text-anchor": "middle", class: "axis-title", transform: `rotate(-90 13 ${margin.top + plotHeight / 2})` }, "Experiencia poniendo excusas (%)"));
}

function drawMetaLineChart() {
  const svg = ui.metaLineChart;
  const { width, height } = prepareMetaChart(svg, 245);
  const margin = { top: 15, right: width < 500 ? 72 : 115, bottom: 36, left: 48 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  [0, .25, .5, .75, 1].forEach(tick => {
    const y = margin.top + plotHeight * (1 - tick);
    svg.append(createSvgElement("line", { x1: margin.left, y1: y, x2: margin.left + plotWidth, y2: y, class: "grid" }));
    svg.append(createSvgElement("text", { x: margin.left - 7, y: y + 4, "text-anchor": "end", class: "tick-label" }, Math.round(100 * tick)));
  });
  for (let week = 1; week <= 8; week += 1) {
    const x = margin.left + plotWidth * ((week - 1) / 7);
    svg.append(createSvgElement("text", { x, y: height - 19, "text-anchor": "middle", class: "tick-label" }, week));
  }

  metaChartData.lines.forEach(item => {
    const points = item.values.map((value, index) => ({
      value,
      x: margin.left + plotWidth * (index / 7),
      y: margin.top + plotHeight * (1 - value / 100)
    }));
    const label = item.special ? "🛡️ Fuwar" : item.name;
    svg.append(createSvgElement("polyline", { points: points.map(point => `${point.x},${point.y}`).join(" "), fill: "none", stroke: wowClassColors[item.className], "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    points.forEach(point => {
      const marker = createSvgElement("circle", { cx: point.x, cy: point.y, r: item.special ? 5 : 4, fill: wowClassColors[item.className] });
      svg.append(addSvgTitle(marker, `${label}: ${point.value}% de hype`));
    });
    const last = points[points.length - 1];
    svg.append(createSvgElement("text", { x: last.x + 8, y: last.y + 4, class: "tick-label", fill: wowClassColors[item.className] }, label));
  });
  svg.append(createSvgElement("text", { x: margin.left + plotWidth / 2, y: height - 2, "text-anchor": "middle", class: "axis-title" }, "Semana desde el lanzamiento"));
  svg.append(createSvgElement("text", { x: 13, y: margin.top + plotHeight / 2, "text-anchor": "middle", class: "axis-title", transform: `rotate(-90 13 ${margin.top + plotHeight / 2})` }, "Hype restante (%)"));
}

function drawMetaPuddleChart() {
  const svg = ui.metaPuddleChart;
  const { width, height } = prepareMetaChart(svg, 275);
  const margin = { top: 17, right: 22, bottom: 40, left: 58 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;

  [0, .25, .5, .75, 1].forEach(tick => {
    const y = margin.top + plotHeight * (1 - tick);
    svg.append(createSvgElement("line", { x1: margin.left, y1: y, x2: margin.left + plotWidth, y2: y, class: "grid" }));
    svg.append(createSvgElement("text", { x: margin.left - 8, y: y + 4, "text-anchor": "end", class: "tick-label" }, Math.round(1400 * tick)));
  });

  for (let second = 0; second <= 12; second += 2) {
    const x = margin.left + plotWidth * (second / 12);
    svg.append(createSvgElement("text", { x, y: height - 21, "text-anchor": "middle", class: "tick-label" }, second));
  }

  metaChartData.puddle.forEach(item => {
    const points = item.values.map((value, index) => ({
      value,
      x: margin.left + plotWidth * (index / 6),
      y: margin.top + plotHeight * (1 - value / 1400)
    }));
    svg.append(createSvgElement("polyline", { points: points.map(point => `${point.x},${point.y}`).join(" "), fill: "none", stroke: wowClassColors[item.className], "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    points.forEach((point, index) => {
      const marker = createSvgElement("circle", { cx: point.x, cy: point.y, r: 4, fill: wowClassColors[item.className] });
      svg.append(addSvgTitle(marker, `${item.name}: ${point.value} DPS a los ${index * 2} segundos`));
    });
  });

  svg.append(createSvgElement("text", { x: margin.left + plotWidth / 2, y: height - 3, "text-anchor": "middle", class: "axis-title" }, "Segundos desde que aparece el charco"));
  svg.append(createSvgElement("text", { x: 14, y: margin.top + plotHeight / 2, "text-anchor": "middle", class: "axis-title", transform: `rotate(-90 14 ${margin.top + plotHeight / 2})` }, "DPS"));
}

function drawMetaBarrierChart() {
  const svg = ui.metaBarrierChart;
  const { width, height } = prepareMetaChart(svg, 300);
  const margin = { top: 42, right: 28, bottom: 44, left: 58 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const xFor = distance => margin.left + plotWidth * (distance / 40);
  const yFor = lateral => margin.top + plotHeight * (1 - (lateral + 20) / 40);

  svg.append(createSvgElement("text", { x: margin.left, y: 21, class: "barrier-summary" }, `${metaChartData.barriers.length} BARRIERS · 0 EN MELEE`));
  svg.append(createSvgElement("text", { x: width - margin.right, y: 21, "text-anchor": "end", class: "barrier-parla" }, "PARLA →"));

  [0, 10, 20, 30, 40].forEach(distance => {
    const x = xFor(distance);
    svg.append(createSvgElement("line", { x1: x, y1: margin.top, x2: x, y2: margin.top + plotHeight, class: "grid" }));
    svg.append(createSvgElement("text", { x, y: height - 23, "text-anchor": "middle", class: "tick-label" }, distance));
  });
  [-20, -10, 0, 10, 20].forEach(lateral => {
    const y = yFor(lateral);
    svg.append(createSvgElement("line", { x1: margin.left, y1: y, x2: margin.left + plotWidth, y2: y, class: "grid" }));
    svg.append(createSvgElement("text", { x: margin.left - 8, y: y + 4, "text-anchor": "end", class: "tick-label" }, lateral));
  });

  const meleeZone = createSvgElement("rect", {
    x: xFor(0),
    y: yFor(5),
    width: xFor(5) - xFor(0),
    height: yFor(-5) - yFor(5),
    rx: 8,
    class: "barrier-melee-zone"
  });
  svg.append(meleeZone);
  svg.append(createSvgElement("circle", { cx: xFor(1.5), cy: yFor(0), r: 7, class: "barrier-raid-dot" }));
  svg.append(createSvgElement("text", { x: xFor(1.5) + 11, y: yFor(0) - 10, class: "barrier-raid-label" }, "RAID + BOSS"));

  metaChartData.barriers.forEach(barrier => {
    const ring = createSvgElement("circle", {
      cx: xFor(barrier.distance),
      cy: yFor(barrier.lateral),
      r: randomWhole(6, 10),
      class: "barrier-ring"
    });
    svg.append(addSvgTitle(ring, `Barrier #${barrier.attempt}: ${barrier.distance} m de la raid`));
  });

  svg.append(createSvgElement("text", { x: margin.left + plotWidth / 2, y: height - 3, "text-anchor": "middle", class: "axis-title" }, "Distancia respecto a la raid (m)"));
  svg.append(createSvgElement("text", { x: 14, y: margin.top + plotHeight / 2, "text-anchor": "middle", class: "axis-title", transform: `rotate(-90 14 ${margin.top + plotHeight / 2})` }, "Desvío lateral (m)"));
}

function drawMetaCharts() {
  if (!metaChartData.bars) return;
  drawMetaBarChart();
  drawMetaScatterChart();
  drawMetaLineChart();
  drawMetaPuddleChart();
  drawMetaBarrierChart();
}

function redrawMetaCharts() {
  if (activeSheet === ui.metaLabSheet && !ui.metaChartsPanel.hidden) drawMetaCharts();
}

function selectRaidSize(size) {
  if (!raidConfigs[size]) return;
  raidSize = size;
  ui.raidSizeButtons.forEach(button => {
    const selected = Number(button.dataset.raidSize) === size;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  generateRaidComp();
}

function generateRaidComp() {
  const survivors = getSurvivors();
  const config = raidConfigs[raidSize];
  const pools = {
    tank: survivors.filter(player => roleFor(player) === "tank"),
    healer: survivors.filter(player => roleFor(player) === "healer"),
    dps: survivors.filter(player => roleFor(player) === "dps")
  };

  ui.raidSizeSummary.textContent = `RAID ${raidSize}`;
  ui.raidGroupSummary.textContent = `${raidSize / 5} grupos`;
  ui.generateRaidButton.disabled = survivors.length < raidSize;

  if (survivors.length < raidSize) {
    showRaidCompError(`Solo quedan ${survivors.length} supervivientes para una raid de ${raidSize}.`);
    return;
  }

  const possibleTankCounts = config.tanks.filter(count => count <= pools.tank.length);
  const possibleHealerCounts = config.healers.filter(count => count <= pools.healer.length);
  if (!possibleTankCounts.length || !possibleHealerCounts.length) {
    showRaidCompError("No quedan suficientes tanks o heals para generar esta composición.");
    return;
  }

  const tankCount = possibleTankCounts[randomIndex(possibleTankCounts.length)];
  const healerCount = possibleHealerCounts[randomIndex(possibleHealerCounts.length)];
  const dpsCount = raidSize - tankCount - healerCount;
  if (pools.dps.length < dpsCount) {
    showRaidCompError(`No quedan ${dpsCount} DPS disponibles.`);
    return;
  }

  const groups = Array.from({ length: raidSize / 5 }, () => []);
  distributeAcrossGroups(shuffled(pools.tank).slice(0, tankCount), groups);
  distributeAcrossGroups(shuffled(pools.healer).slice(0, healerCount), groups);

  const dps = shuffled(pools.dps).slice(0, dpsCount);
  let dpsIndex = 0;
  while (dpsIndex < dps.length) {
    for (const group of groups) {
      if (group.length < 5 && dpsIndex < dps.length) {
        group.push(dps[dpsIndex]);
        dpsIndex += 1;
      }
    }
  }

  groups.forEach(group => group.sort((a, b) => roleOrder(roleFor(a)) - roleOrder(roleFor(b))));
  renderRaidGroups(groups);
  ui.raidRoleSummary.textContent = `${tankCount} tanks · ${healerCount} heals · ${dpsCount} DPS`;
  ui.raidCompMessage.hidden = true;
  ui.raidGroups.hidden = false;
}

function distributeAcrossGroups(members, groups) {
  members.forEach((member, index) => groups[index % groups.length].push(member));
}

function roleOrder(role) {
  return role === "tank" ? 0 : role === "healer" ? 1 : 2;
}

function roleLabel(role) {
  return role === "tank" ? "T" : role === "healer" ? "H" : "D";
}

function renderRaidGroups(groups) {
  ui.raidGroups.replaceChildren();
  groups.forEach((members, groupIndex) => {
    const group = document.createElement("section");
    group.className = "raid-group";
    const title = document.createElement("h3");
    title.textContent = `GRUPO ${groupIndex + 1}`;
    const list = document.createElement("ul");
    list.className = "raid-group-list";

    members.forEach(player => {
      const item = document.createElement("li");
      item.className = "raid-member";
      const wowClass = classFor(player);
      item.dataset.wowClass = wowClass;
      item.title = `${wowClass} · ${player.spec}`;

      const name = document.createElement("strong");
      name.className = "raid-member-name";
      name.textContent = player.name;
      const role = document.createElement("span");
      role.className = "raid-member-role";
      role.textContent = roleLabel(roleFor(player));
      const meta = document.createElement("span");
      meta.className = "raid-member-meta";
      meta.textContent = `${wowClass} · ${player.spec}`;
      item.append(name, role, meta);
      list.append(item);
    });

    group.append(title, list);
    ui.raidGroups.append(group);
  });
}

function showRaidCompError(message) {
  ui.raidGroups.hidden = true;
  ui.raidCompMessage.textContent = message;
  ui.raidCompMessage.hidden = false;
  ui.raidRoleSummary.textContent = "Composición no disponible";
}

function clearRaidComp() {
  ui.raidGroups.replaceChildren();
  ui.raidGroups.hidden = true;
  ui.raidCompMessage.textContent = "El roster ha cambiado. Pulsa «Generar composición» para actualizarlo.";
  ui.raidCompMessage.hidden = false;
  ui.raidRoleSummary.textContent = "Pendiente de regenerar";
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
