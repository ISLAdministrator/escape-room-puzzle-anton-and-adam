// --- Elements ---
const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const transitionScreen = document.getElementById("transition-screen");
const nextLvlBtn = document.getElementById("next-lvl-btn");

const btn = document.getElementById("button");
const input = document.getElementById("user-input");
const output = document.getElementById("output");
const hint = document.getElementById("hint");
const scrambledEl = document.getElementById("scrambled-word");
const levelIndicator = document.getElementById("level-indicator");

// --- Game Data ---
let currentLevel = 0;
let attempts = 0;

const levels = [
  {
    word: "EMPOWERED",
    scramble: "EMDPWREOE",
    note: "Generator 1 is pulsing. Power is flowing to the Science Wing. We need to reach the second generator in the gym to restore more systems.",
    indicator: "GENERATOR_01",
    hint: "HINT: It starts with 'E'..."
  },
  {
    word: "COLLABORATIVE",
    scramble: "CBRAOLLOTAEIV",
    note: "Generator 2 hums to life. 'History does not give answers. It gives answers.' Only one system remains: The Central Mainframe.",
    indicator: "GENERATOR_02",
    hint: "HINT: It starts with 'C'..."
  },
  {
    word: "INCLUSIVE",
    scramble: "IULCSINVE",
    note: "All systems humming. Unity restored. The school perimeter is secure. You have saved ISL.",
    indicator: "CENTRAL_MAINFRAME",
    hint: "HINT: It starts with 'I'..."
  }
];

// --- Functions ---

// Start Game
startBtn.addEventListener("click", () => startScreen.classList.add("hidden"));

// Check Answer
btn.addEventListener("click", function () {
  const guess = input.value.toUpperCase().trim();
  const current = levels[currentLevel];

  if (guess === current.word) {
    // Show the Transition Note
    document.getElementById("note-text").innerText = current.note;
    document.getElementById("note-title").innerText = current.indicator;
    transitionScreen.classList.remove("hidden");
    output.innerText = "";
    input.value = "";
    attempts = 0;
    hint.style.display = "none";
  } else {
    attempts++;
    output.innerText = "> ERROR: CORRUPTED DATA.";
    output.style.color = "#ff4444";
    if (attempts >= 5) {
      hint.innerText = "HINT: AN ISL VALUE";
      hint.style.display = "block";
    }
  }
});

// Move to next level
nextLvlBtn.addEventListener("click", () => {
  currentLevel++;

  if (currentLevel < levels.length) {
    // Load next puzzle
    scrambledEl.innerText = levels[currentLevel].scramble;
    levelIndicator.innerText = "GENERATOR_02: OFFLINE";
    transitionScreen.classList.add("hidden");
  } else {
    // Game Over / Win
    document.getElementById("note-title").innerText = "SYSTEM RECOVERED";
    document.getElementById("note-text").innerText = "You have escaped the darkness.";
    nextLvlBtn.style.display = "none";
  }
});