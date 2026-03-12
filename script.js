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
      {x: 150, y: 0, w: 40, h: 320}, 
      {x: 350, y: 80, w: 40, h: 320}
    ]
  },
  { 
    word: "COLLABORATIVE", 
    scramble: "CBRAOLLOTAEIV", 
    indicator: "GENERATOR_02",
    qteSpeed: 14, 
    walls: [
      {x: 100, y: 0, w: 25, h: 350},  
      {x: 200, y: 50, w: 25, h: 350}, 
      {x: 300, y: 0, w: 25, h: 350},  
      {x: 400, y: 50, w: 25, h: 350}  
    ]
  },
  { 
    word: "INCLUSIVE", 
    scramble: "IULCSINVE", 
    indicator: "CENTRAL_MAINFRAME",
    qteSpeed: 20, 
    walls: [
      {x: 300, y: 0, w: 60, h: 400} 
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

  if (currentLevel < 3) {
      if (nextY < 0) nextY = 0; 
      if (nextY > 370) nextY = 370; 
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
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)"; 
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1a331a"; 
  const currentWalls = levels[currentLevel - 1]?.walls || [];
  currentWalls.forEach(wall => {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  });

  ctx.fillStyle = "#ff4444";
  ctx.fillRect(door.x, door.y, door.width, door.height);
  
  ctx.fillStyle = (currentLevel === 3 && Math.random() > 0.8) ? "#ffffff" : "#4dfd4d";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

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
    document.querySelector(".terminal-frame").classList.add("shake");
    setTimeout(() => {
      document.querySelector(".terminal-frame").classList.remove("shake");
    }, 400);
    qteData.sliderX = 0;
  }
}

function updateTerminal() {
  const current = levels[currentLevel];
  if (current) {
    scrambledEl.style.color = "#ff4444";
    let count = 0;
    const interval = setInterval(() => {
      scrambledEl.innerText = Math.random().toString(36).substring(2, 10).toUpperCase();
      count++;
      if (count > 10) {
        clearInterval(interval);
        scrambledEl.innerText = current.scramble;
        scrambledEl.style.color = "#4dfd4d";
      }
    }, 50);
    
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
  
  if (userValue === "HELP") {
    document.getElementById("output").innerText = "SYSTEM_LOG: Room 403 contains the stabilizer. 406 is just the warning.";
    return; 
  }

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
    document.querySelector(".terminal-frame").classList.add("shake");
    setTimeout(() => {
      document.querySelector(".terminal-frame").classList.remove("shake");
    }, 400);
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