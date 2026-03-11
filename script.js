const bgMusic = new Audio('music.mp3'); 
bgMusic.loop = true;
bgMusic.volume = 0.7;

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
let gameState = "start"; 
let player = { x: 50, y: 170, size: 30, speed: 5 };
let door = { x: 550, y: 100, width: 20, height: 200 };
let qteData = { active: false, sliderX: 0, targetX: 250, targetWidth: 50, speed: 8 };

const levels = [
  { 
    word: "EMPOWERED", 
    scramble: "EMDPWREOE", 
    indicator: "GENERATOR_01",
    qteSpeed: 9, 
    walls: [
      {x: 150, y: 0, w: 30, h: 300}, 
      {x: 350, y: 100, w: 30, h: 300}
    ]
  },
  { 
    word: "COLLABORATIVE", 
    scramble: "CBRAOLLOTAEIV", 
    indicator: "GENERATOR_02",
    qteSpeed: 14, 
    walls: [
      {x: 100, y: 0, w: 20, h: 320},
      {x: 200, y: 80, w: 20, h: 320},
      {x: 300, y: 0, w: 20, h: 320},
      {x: 400, y: 80, w: 20, h: 320}
    ]
  },
  { 
    word: "INCLUSIVE", 
    scramble: "IULCSINVE", 
    indicator: "CENTRAL_MAINFRAME",
    qteSpeed: 20, 
    walls: [
      {x: 100, y: 60, w: 400, h: 20}, 
      {x: 100, y: 260, w: 400, h: 20},
      {x: 100, y: 80, w: 20, h: 100},
      {x: 250, y: 140, w: 20, h: 80},
      {x: 400, y: 240, w: 20, h: 160}
    ]
  }
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
  } else if (gameState === "qte") {
    drawQTE();
  }
  requestAnimationFrame(gameLoop);
}

// --- Hallway Logic ---
function updateHallway() {
  let nextX = player.x;
  let nextY = player.y;

  if (keys["w"] || keys["ArrowUp"]) nextY -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) nextY += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) nextX -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) nextX += player.speed;

  // BOUNDARY LOCK: Levels 1 & 2 only
  if (currentLevel < 3) {
      if (nextY < 50) nextY = 50; 
      if (nextY > 320) nextY = 320; 
      if (nextX < 0) nextX = 0; 
  }

  let hitWall = false;
  const currentWalls = levels[currentLevel - 1]?.walls || [];
  
  currentWalls.forEach(wall => {
    if (isColliding({x: nextX, y: nextY, size: player.size}, wall)) {
      hitWall = true;
    }
  });

  if (!hitWall) {
    player.x = nextX;
    player.y = nextY;
  }

  if (player.x + player.size > door.x) {
    player.x = door.x - player.size;
    startQTE();
  }
}

function drawHallway() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = "#1a331a"; 
  const currentWalls = levels[currentLevel - 1]?.walls || [];
  currentWalls.forEach(wall => {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  });

  ctx.fillStyle = "#ff4444";
  ctx.fillRect(door.x, door.y, door.width, door.height);
  
  // Player Color logic (Glitch for Level 3)
  ctx.fillStyle = (currentLevel === 3 && Math.random() > 0.8) ? "#ffffff" : "#4dfd4d";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

// --- QTE Logic ---
function startQTE() {
  gameState = "qte";
  qteData.active = true;
  qteData.sliderX = 0;
  qteData.speed = levels[currentLevel - 1].qteSpeed; 
}

function drawQTE() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "#4dfd4d";
  ctx.lineWidth = 2;
  ctx.strokeRect(100, 180, 400, 40);
  ctx.fillStyle = "#4dfd4d"; 
  ctx.fillRect(100 + qteData.targetX, 180, qteData.targetWidth, 40);

  qteData.sliderX += qteData.speed;
  if (qteData.sliderX > 400 || qteData.sliderX < 0) qteData.speed *= -1;

  ctx.fillStyle = "#fff";
  ctx.fillRect(100 + qteData.sliderX, 175, 5, 50);
  ctx.fillStyle = "#4dfd4d";
  ctx.font = "10px 'Press Start 2P'";
  ctx.fillText("BREACHING... PRESS SPACE!", 120, 150);
}

function checkQTE() {
  if (qteData.sliderX > qteData.targetX && qteData.sliderX < qteData.targetX + qteData.targetWidth) {
    gameState = "terminal";
    canvas.classList.add("hidden");
    puzzleArea.classList.remove("hidden");
    player.x = 50; 
    updateTerminal(); 
  } else {
    qteData.sliderX = 0;
  }
}

function updateTerminal() {
  const current = levels[currentLevel];
  if (current) {
    scrambledEl.innerText = current.scramble;
    levelIndicator.innerText = `${current.indicator}: OFFLINE`;
    input.value = ""; 
  } else {
    gameState = "end";
    puzzleArea.classList.add("hidden");
    canvas.classList.add("hidden");
    document.getElementById("win-screen").classList.remove("hidden");
    bgMusic.volume = 0.2;
  }
}

// --- Event Listeners ---
document.getElementById("start-btn").addEventListener("click", () => {
  bgMusic.play().catch(e => console.log("Music blocked"));
  document.getElementById("start-screen").classList.add("hidden");
  gameState = "terminal";
});

document.getElementById("button").addEventListener("click", () => {
  const userValue = input.value.toUpperCase();
  if (userValue === levels[currentLevel].word) {
    transitionScreen.classList.remove("hidden");
    currentLevel++; 
    
    document.getElementById("note-title").innerText = `GENERATOR ${currentLevel} ONLINE`;
    if (currentLevel === 3) {
        document.getElementById("note-title").innerText = "⚠️ SYSTEM CORRUPTION DETECTED";
        document.getElementById("note-title").style.color = "#ff4444";
        document.getElementById("note-text").innerHTML = 
            "<strong>ERROR:</strong> Sector Labyrinth is physically impassable.<br>" +
            "<em>HINT: Room 406 is merging with the void. To reach Room 403, you must leave the mapped reality. Step beyond the edges.</em>";
        document.querySelector(".quote").innerText = '"When the path is blocked, the void is your only friend."';
    }
  } else {
    alert("ACCESS DENIED: INCORRECT SEQUENCE");
    input.value = "";
  }
});

nextLvlBtn.addEventListener("click", () => {
  transitionScreen.classList.add("hidden");
  puzzleArea.classList.add("hidden"); 
  canvas.classList.remove("hidden"); 
  gameState = "hallway";
});

function isColliding(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w &&
         rect1.x + rect1.size > rect2.x &&
         rect1.y < rect2.y + rect2.h &&
         rect1.y + rect1.size > rect2.y;
}

gameLoop();