// --- Elements ---
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const puzzleArea = document.getElementById("terminal-area");
const startScreen = document.getElementById("start-screen");
const transitionScreen = document.getElementById("transition-screen");
const nextLvlBtn = document.getElementById("next-lvl-btn");
const scrambledEl = document.getElementById("scrambled-word");
const levelIndicator = document.getElementById("level-indicator");
const input = document.getElementById("user-input");

// --- Game Data ---
let currentLevel = 0;
let gameState = "start"; // "start", "terminal", "hallway", "qte"
let player = { x: 50, y: 170, size: 30, speed: 5 };
let door = { x: 550, y: 100, width: 20, height: 200 };
let qteData = { active: false, sliderX: 0, targetX: 450, targetWidth: 50, speed: 10 };

const levels = [
  { word: "EMPOWERED", scramble: "EMDPWREOE", indicator: "GENERATOR_01" },
  { word: "COLLABORATIVE", scramble: "CBRAOLLOTAEIV", indicator: "GENERATOR_02" },
  { word: "INCLUSIVE", scramble: "IULCSINVE", indicator: "CENTRAL_MAINFRAME" }
];

// --- Input Handling ---
let keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);
window.addEventListener("keydown", e => {
  if (gameState === "qte" && e.key === " ") checkQTE();
});

// --- Game Loop ---
function gameLoop() {
  if (gameState === "hallway") {
    updateHallway();
    drawHallway();
  }
  requestAnimationFrame(gameLoop);
}

// --- Hallway Logic ---
function updateHallway() {
  if (keys["w"]) player.y -= player.speed;
  if (keys["s"]) player.y += player.speed;
  if (keys["a"]) player.x -= player.speed;
  if (keys["d"]) player.x += player.speed;

  // Collision with door
  if (player.x + player.size > door.x) {
    player.x = door.x - player.size;
    startQTE();
  }
}

function drawHallway() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Draw floor/walls
  ctx.strokeStyle = "#222";
  ctx.strokeRect(0, 50, canvas.width, 300);

  // Draw Door
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(door.x, door.y, door.width, door.height);
  
  // Draw Player
  ctx.fillStyle = "#4dfd4d";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

// --- QTE Logic ---
function startQTE() {
  gameState = "qte";
  qteData.active = true;
  qteData.sliderX = 0;
}

function checkQTE() {
  if (qteData.sliderX > qteData.targetX && qteData.sliderX < qteData.targetX + qteData.targetWidth) {
    // Success!
    gameState = "terminal";
    canvas.classList.add("hidden");
    puzzleArea.classList.remove("hidden");
    player.x = 50; // Reset player position
  } else {
    // Fail - reset QTE
    qteData.sliderX = 0;
  }
}

// --- Transition Logic ---
nextLvlBtn.addEventListener("click", () => {
  transitionScreen.classList.add("hidden");
  gameState = "hallway";
  canvas.classList.remove("hidden");
  puzzleArea.classList.add("hidden");
});

// Start loop
gameLoop();