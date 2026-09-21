"use strict";

const nameElement = document.querySelector("#name");
const button = document.querySelector("#spinButton");
const result = document.querySelector("#result");
const machine = document.querySelector("#machine");
const playerCount = document.querySelector("#playerCount");

const messages = [
  "ha decidido tocar césped.",
  "se le acabó el hype.",
  "dice que vuelve para el próximo parche.",
  "ha descubierto que existen otros videojuegos.",
  "lleva cuatro días offline. DEP.",
  "dice que solamente se toma un descanso.",
  "asegura que no ha dropeado.",
  "volverá™.",
  "no pasó el filtro de las dos semanas.",
  "ha sido reclamado por la vida real."
];

let players = [];
let spinning = false;

loadPlayers();
button.addEventListener("click", spin);

async function loadPlayers() {
  try {
    const response = await fetch("players.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();

    players = (payload.players || [])
      .filter(name => typeof name === "string")
      .map(name => name.trim())
      .filter(name => name.length > 0);

    if (!players.length) throw new Error("La lista está vacía");

    playerCount.textContent = players.length;
    nameElement.textContent = "???";
    button.disabled = false;
  } catch (error) {
    console.error("No se pudo cargar players.json", error);
    nameElement.textContent = "ERROR";
    result.innerHTML = '<div class="drop-message">No se pudo cargar la lista de jugadores.</div>';
  }
}

function randomPlayer(excluded = null) {
  const available = excluded === null ? players : players.filter(player => player !== excluded);
  const pool = available.length ? available : players;
  const randomValue = new Uint32Array(1);
  crypto.getRandomValues(randomValue);
  return pool[Math.floor((randomValue[0] / 4294967296) * pool.length)];
}

async function spin() {
  if (spinning || !players.length) return;

  spinning = true;
  button.disabled = true;
  result.replaceChildren();
  machine.classList.remove("winner");
  machine.classList.add("spinning");

  const winner = randomPlayer();
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!reducedMotion) {
    for (let index = 0; index < 35; index += 1) {
      nameElement.textContent = randomPlayer();
      await sleep(45);
    }

    let delay = 70;
    for (let index = 0; index < 18; index += 1) {
      nameElement.textContent = randomPlayer();
      await sleep(delay);
      delay += 18;
    }

    const fakeWinner = randomPlayer(winner);
    nameElement.textContent = fakeWinner;
    await sleep(900);
    nameElement.textContent = randomPlayer(winner);
    await sleep(450);
  }

  nameElement.textContent = winner;
  machine.classList.remove("spinning");
  machine.classList.add("winner");
  showResult(winner);
  confetti();

  button.disabled = false;
  spinning = false;
}

function showResult(player) {
  const title = document.createElement("div");
  title.className = "drop-title";
  title.textContent = "ESTA SEMANA HEMOS PERDIDO A";

  const name = document.createElement("div");
  name.className = "drop-name";
  name.textContent = `☠ ${player} ☠`;

  const message = document.createElement("div");
  message.className = "drop-message";
  message.textContent = messages[Math.floor(Math.random() * messages.length)];

  result.append(title, name, message);
}

function confetti() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  for (let index = 0; index < 70; index += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = `hsl(${Math.random() * 55 + 5} 100% 50%)`;
    piece.style.animationDuration = `${Math.random() * 2 + 2}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4500);
  }
}

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}
