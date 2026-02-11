const startBtn = document.getElementById("start-btn");
const startScreen = document.getElementById("start-screen");
const btn = document.getElementById("button");
const input = document.getElementById("user-input");
const output = document.getElementById("output");
const hint = document.getElementById("hint");

let attempts = 0;
const correctAnswer = "EMPOWERED";

// Function to hide instructions and start game
startBtn.addEventListener("click", function() {
  startScreen.classList.add("hidden");
});

// Function to check the answer
btn.addEventListener("click", function() {
  const guess = input.value.toUpperCase().trim();

  if (guess === correctAnswer) {
    output.innerText = "> SUCCESS: CORE VALUE RESTORED.";
    output.style.color = "#4dfd4d";
  } else {
    attempts++;
    output.innerText = "> ERROR: INVALID SEQUENCE.";
    output.style.color = "#ff4444";

    if (attempts >= 5) {
      hint.innerText = "HINT: ONE OF THE ISL VALUES (I, C, OR E...)";
      hint.style.display = "block";
    }
  }
});