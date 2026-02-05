console.log("Script loaded");

// below is basic example code for using a button
// you can use it, expand on it, or delete it
// that all depends on your team's plan.

const button = document.getElementById("button");
const output = document.getElementById("output");

button.addEventListener("click", function () {
  output.textContent = "JavaScript is working.";
});
