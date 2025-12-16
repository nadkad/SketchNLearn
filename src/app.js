// app.js
// Application-level UI and mode control

import { clearCanvas } from "./drawing/canvas.js";

window.currentMode = null;
console.log("app.js loaded");

export let targetIndex = 0;

// -----------------------------------------
// MODE CONTROL
// -----------------------------------------
function startMode(mode) {
  document.getElementById("home-btn").classList.remove("hidden");
  window.currentMode = mode;
  targetIndex = 0;

  if (mode === "letters" || mode === "numbers") {
    clearCanvas();
    updatePrompt();
    showScreen("draw-screen"); // ML canvas
  } else if (mode === "animals" || mode === "shapes") {
    // Non-ML modes: multiple-choice image quiz
    showImageQuizScreen();
  }
}

// -----------------------------------------
// SCREEN SWITCHING
// -----------------------------------------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => {
    s.classList.remove("visible");
    s.classList.add("hidden");
  });

  const screen = document.getElementById(id);
  if (screen) {
    screen.classList.remove("hidden");
    screen.classList.add("visible");
  }
}

// -----------------------------------------
// LEARNING MODE PROMPTS
// -----------------------------------------
const LETTER_TARGETS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const NUMBER_TARGETS = ["0","1","2","3","4","5","6","7","8","9"];
const ANIMAL_TARGETS = ["cow", "dog", "cat", "sheep", "horse", "pig", "lion", "elephant"];
const SHAPE_TARGETS  = ["circle", "square", "triangle", "star"];
const soundCorrect = new Audio("assets/sounds/yay.mp3");
const soundWrong = new Audio("assets/sounds/error.mp3");

function updatePrompt() {
  const promptEl = document.getElementById("prompt");
  if (!promptEl) return;

  if (window.currentMode === "letters") {
    promptEl.textContent = "Try drawing " + LETTER_TARGETS[targetIndex];
  } else if (window.currentMode === "numbers") {
    promptEl.textContent = "Try drawing " + NUMBER_TARGETS[targetIndex];
  } else {
    promptEl.textContent = "";
  }
}

// Advance target (used later by ML-based feedback if needed)
export function nextTarget() {
    if (isLastTarget()) {
        showCompletionScreen();
        return;
    }
  if (window.currentMode === "letters") {
    if (targetIndex < LETTER_TARGETS.length - 1) targetIndex++;
  } else if (window.currentMode === "numbers") {
    if (targetIndex < NUMBER_TARGETS.length - 1) targetIndex++;
  }
  updatePrompt();
  clearCanvas();
}

// -------------------------------
// Event Listener for Canvas
// -------------------------------
document.addEventListener("drawingChecked", (e) => {
  const result = e.detail;
  showFeedback(result);
});

// Show feedback
function showFeedback(result) {
  if (!result || !result.top1) return;

  const { top1, top2 } = result;
  const HIGH_CONFIDENCE = 0.6;
  const MIN_MARGIN = 0.08; // difference between top1 and top2
  const target = getCurrentTarget();
  const feedbackEl = document.getElementById("feedback");

  // Perfect match
  if (top1.label === target &&   
    (top1.confidence >= HIGH_CONFIDENCE ||
    (top1.confidence - top2.confidence) >= MIN_MARGIN)) {
    feedbackEl.textContent =
      `Great job! You drew ${target}`;
    feedbackEl.style.color = "green";
    soundCorrect.play();  // play Ding

    setTimeout(() => {
      nextTarget();
      clearCanvas();
      feedbackEl.textContent = "";
    }, 1500);
    return;
  }

  // Forgiving match
  if (top2 && top2.label === target) {
    feedbackEl.textContent = `Nice! That looks like ${target}`;
    feedbackEl.style.color = "green";
    soundCorrect.play();  // play Ding

    setTimeout(() => {
      nextTarget();
      clearCanvas();
      feedbackEl.textContent = "";
    }, 1500);
    return;
  }

  // Drew another valid character
  if (top1.confidence > 0.5) {
    feedbackEl.textContent =
      `You drew ${top1.label}. Try drawing ${target}!`;
    feedbackEl.style.color = "orange";
    soundWrong.play();  // play Ding

    setTimeout(() => {
      clearCanvas();
      feedbackEl.textContent = "";
    }, 1200);
    return;
  }

  // Scribble / unclear
  feedbackEl.textContent = "Try again!";
  feedbackEl.style.color = "red";
  soundWrong.play();

  setTimeout(() => {
    clearCanvas();
    feedbackEl.textContent = "";
  }, 800);
}

function getCurrentTarget() {
  if (window.currentMode === "letters") {
    return LETTER_TARGETS[targetIndex];
  }

  if (window.currentMode === "numbers") {
    return NUMBER_TARGETS[targetIndex];
  }

  return null;
}

export function getCurrentMode() {
  return window.currentMode;
}

function isLastTarget() {
  if (window.currentMode === "letters") {
    return targetIndex >= LETTER_TARGETS.length - 1;
  }
  if (window.currentMode === "numbers") {
    return targetIndex >= NUMBER_TARGETS.length - 1;
  }
  return false;
}
// Show completion screen
function showCompletionScreen() {
    const title = document.getElementById("complete-title");
    const message = document.getElementById("complete-message");

    const modeLabel = window.currentMode;

    title.textContent = `You're done with ${modeLabel}!`;
    message.textContent = '100% Complete! 🎉'
    showScreen("complete-screen");
}

// Show quiz screen with dynamic options
function showImageQuizScreen() {
  showScreen("image-quiz-screen");

  const targets = window.currentMode === "animals" ? ANIMAL_TARGETS : SHAPE_TARGETS;
  const currentTarget = targets[targetIndex];

  document.getElementById("question").textContent = `Which one is a ${currentTarget}?`;

  renderImageQuizOptions(targets, currentTarget); // dynamically populate buttons
}

function renderImageQuizOptions(targets, currentTarget, containerId = "quiz-options") {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Clear previous options
  
  // Animal quiz targets with emojis
    const ANIMAL_EMOJIS = {
    cow: "🐄",
    dog: "🐶",
    cat: "🐱",
    sheep: "🐑",
    horse: "🐴",
    pig: "🐷",
    lion: "🦁",
    elephant: "🐘",
    };
    const fallbackIcons = {
    triangle: "▲",
    // add more fallbacks if needed
    };

    // Make a pool excluding the current target
  const otherOptions = targets.filter(t => t !== currentTarget);

  // Pick 3 random other options
  const randomOthers = [];
  while (randomOthers.length < 3 && otherOptions.length > 0) {
    const idx = Math.floor(Math.random() * otherOptions.length);
    randomOthers.push(otherOptions.splice(idx, 1)[0]);
  }

  // Combine current target + 3 random others
  const quizOptions = [currentTarget, ...randomOthers];

  // Shuffle the targets so the correct answer isn’t always first
  quizOptions.sort(() => Math.random() - 0.5);

  quizOptions.forEach(target => {
    const btn = document.createElement("button");
    btn.classList.add("quiz-option");
    btn.dataset.target = target;

    // Use emoji for animals
    if (ANIMAL_EMOJIS[target]) {
      btn.textContent = ANIMAL_EMOJIS[target];
      btn.style.fontSize = "3rem";  // scale nicely
    }
    else if (fallbackIcons[target]) {
      btn.textContent = fallbackIcons[target]; // use emoji
      btn.style.fontSize = "5rem";           // scale emoji nicely
    } else {
      const icon = document.createElement("i");
      icon.className = `fa-solid fa-${target} fa-3x`;
      btn.appendChild(icon);
    }

    container.appendChild(btn);
  });
}

// Option click handling (event delegation)
document.getElementById("quiz-options").addEventListener("click", (e) => {
  const btn = e.target.closest("button.quiz-option");
  if (!btn) return;

  const selected = btn.dataset.target;
  const targets = window.currentMode === "animals" ? ANIMAL_TARGETS : SHAPE_TARGETS;
  const currentTarget = targets[targetIndex];
  const feedbackEl = document.getElementById("answer");

  if (selected === currentTarget) {
    feedbackEl.textContent = "Correct! 🎉";
    feedbackEl.style.color = "green";
    soundCorrect.play();  // play Ding

    setTimeout(() => {
      feedbackEl.textContent = "";
      if (targetIndex < targets.length - 1) {
        targetIndex++;
        showImageQuizScreen();
      } else {
        showCompletionScreen();
      }
    }, 1000);
  } else {
    feedbackEl.textContent = "Try again!";
    feedbackEl.style.color = "red";
    soundWrong.play();  // play Ding
  }
});


// -----------------------------------------
// INITIALIZATION
// -----------------------------------------
  document.getElementById("play-btn").onclick = () => {
    showScreen("menu-screen");
  };

  document.getElementById("btn-letters").onclick = () => startMode("letters");
  document.getElementById("btn-numbers").onclick = () => startMode("numbers");
  document.getElementById("btn-animals").onclick = () => startMode("animals");
  document.getElementById("btn-shapes").onclick = () => startMode("shapes");

  document.getElementById("mic-btn").onclick = () => {
    showScreen("ai-screen");
  };

  document.getElementById("home-btn").onclick = resetApp;
  document.getElementById("ai-back-btn").onclick = resetApp;
// -----------------------------------------
// RESET
// -----------------------------------------
function resetApp() {
  document.getElementById("home-btn").classList.add("hidden");
  showScreen("start-screen");
  clearCanvas();
  targetIndex = 0;
  window.currentMode = null;

  const feedback = document.getElementById("feedback");
  if (feedback) feedback.textContent = "";
}
