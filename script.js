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
let gameState = "start"; // "start", "terminal", "hallway", "qte"
let player = { x: 50, y: 170, size: 30, speed: 5 };
let door = { x: 550, y: 100, width: 20, height: 200 };
// QTE Slider data: active, current position, target position, target width, speed
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
    qteSpeed: 14, // Faster!
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
    qteSpeed: 20, // Very Fast!
    walls: [
      {x: 100, y: 100, w: 400, h: 20},
      {x: 100, y: 200, w: 400, h: 20},
      {x: 100, y: 0, w: 20, h: 100},
      {x: 250, y: 120, w: 20, h: 80},
      {x: 400, y: 220, w: 20, h: 180}
    ]
  }
];

// --- Input Handling ---
let keys = {};
window.addEventListener("keydown", e => keys[e.key] = true);
window.addEventListener("keyup", e => keys[e.key] = false);

// Spacebar to trigger QTE
window.addEventListener("keydown", e => {
  if (gameState === "qte" && e.key === " ") checkQTE();
});

function updateHallway() {
  let nextX = player.x;
  let nextY = player.y;

  if (keys["w"] || keys["ArrowUp"]) nextY -= player.speed;
  if (keys["s"] || keys["ArrowDown"]) nextY += player.speed;
  if (keys["a"] || keys["ArrowLeft"]) nextX -= player.speed;
  if (keys["d"] || keys["ArrowRight"]) nextX += player.speed;

  // --- NEW BOUNDARY LOCK ---
  // If it's NOT the final level, don't let them go off-screen
  if (currentLevel < 3) {
      if (nextY < 50) nextY = 50; // Top edge
      if (nextY > 320) nextY = 320; // Bottom edge
      if (nextX < 0) nextX = 0; // Left edge
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
  
  // Draw the Maze Walls
  ctx.fillStyle = "#1a331a"; // Gritty Dark Green
  const currentWalls = levels[currentLevel - 1]?.walls || [];
  currentWalls.forEach(wall => {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
  });

  // Draw Door (Red) and Player (Green)
  ctx.fillStyle = "#ff4444";
  ctx.fillRect(door.x, door.y, door.width, door.height);
  ctx.fillStyle = "#4dfd4d";
  ctx.fillRect(player.x, player.y, player.size, player.size);
}

// --- QTE Logic ---
function startQTE() {
  gameState = "qte";
  qteData.active = true;
  qteData.sliderX = 0;
  // This line makes the game harder as you progress!
  qteData.speed = levels[currentLevel - 1].qteSpeed; 
}

function drawQTE() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the Background Bar
  ctx.strokeStyle = "#4dfd4d";
  ctx.lineWidth = 2;
  ctx.strokeRect(100, 180, 400, 40);

  // Draw the "Target Zone" (The Green Area you need to hit)
  ctx.fillStyle = "#4dfd4d"; // Change to green for target
  ctx.fillRect(100 + qteData.targetX, 180, qteData.targetWidth, 40);

  // Move the slider back and forth
  qteData.sliderX += qteData.speed;
  if (qteData.sliderX > 400 || qteData.sliderX < 0) {
    qteData.speed *= -1; // Reverse direction
  }

  // Draw the moving Slider (The white line)
  ctx.fillStyle = "#fff";
  ctx.fillRect(100 + qteData.sliderX, 175, 5, 50);

  // Text instructions
  ctx.fillStyle = "#4dfd4d";
  ctx.font = "10px 'Press Start 2P'";
  ctx.fillText("BREACHING... PRESS SPACE!", 120, 150);
}

function checkQTE() {
  // Check if slider is within target zone
  if (qteData.sliderX > qteData.targetX && qteData.sliderX < qteData.targetX + qteData.targetWidth) {
    // Success!
    gameState = "terminal";
    canvas.classList.add("hidden");
    puzzleArea.classList.remove("hidden");
    player.x = 50; // Reset player position for next hallway
    updateTerminal(); // Load next level word
  } else {
    // Fail - reset slider
    qteData.sliderX = 0;
  }
}

// --- Terminal & Level Management ---
function updateTerminal() {
  const current = levels[currentLevel];
  if (current) {
    scrambledEl.innerText = current.scramble;
    levelIndicator.innerText = `${current.indicator}: OFFLINE`;
    input.value = ""; 
  } else {
    // THIS IS THE NEW ENDING LOGIC
    gameState = "end";
    puzzleArea.classList.add("hidden");
    canvas.classList.add("hidden");
    document.getElementById("win-screen").classList.remove("hidden");
    
    // Stop the music or lower it for the ending
    bgMusic.volume = 0.2;
  }
}

// --- Event Listeners ---

// 1. Initial Start (Starts Music and hides Intro)
document.getElementById("start-btn").addEventListener("click", () => {
  // PLAY MUSIC HERE
  bgMusic.play().catch(error => {
    console.log("Music play blocked by browser. Click again or check file.");
  });

  document.getElementById("start-screen").classList.add("hidden");
  gameState = "terminal";
});

// Check the word
document.getElementById("button").addEventListener("click", () => {
  const userValue = input.value.toUpperCase();
  
  if (userValue === levels[currentLevel].word) {
    transitionScreen.classList.remove("hidden");
    currentLevel++; // Moves to the next level
    
    // Default text for the transition screen
    document.getElementById("note-title").innerText = `GENERATOR ${currentLevel} ONLINE`;
    document.getElementById("note-text").innerText = "Transferring power to the next sector...";
    document.querySelector(".quote").innerText = '"History does not give answers. It gives answers."';

    // --- THE LEVEL 3 "THINK OUTSIDE THE BOX" HINT ---
    if (currentLevel === 3) {
        // We change the title to look like a system error
        document.getElementById("note-title").innerText = "⚠️ SYSTEM CORRUPTION DETECTED";
        document.getElementById("note-title").style.color = "#ff4444";
        
        // The specific hint for the player
        document.getElementById("note-text").innerHTML = 
            "<strong>ERROR:</strong> Sector Labyrinth is physically impassable.<br>" +
            "<em>HINT: The boundaries of this world are thinner than they look. Step beyond the edges to find the truth.</em>";
            
        // Changing the quote to something more cryptic
        document.querySelector(".quote").innerText = '"When the path is blocked, the void is your only friend."';
    }
  } else {
    alert("ACCESS DENIED: INCORRECT SEQUENCE");
    input.value = "";
  }
});

// Proceed to Hallway
nextLvlBtn.addEventListener("click", () => {
  transitionScreen.classList.add("hidden");
  puzzleArea.classList.add("hidden"); 
  canvas.classList.remove("hidden"); 
  gameState = "hallway";
});

// Start loop
gameLoop();
function isColliding(rect1, rect2) {
  return rect1.x < rect2.x + rect2.w &&
         rect1.x + rect1.size > rect2.x &&
         rect1.y < rect2.y + rect2.h &&
         rect1.y + rect1.size > rect2.y;
}