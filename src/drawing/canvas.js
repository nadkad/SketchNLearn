// canvas.js
import { strokesToImageData } from "./strokeProcessor.js";
import { loadModel, classifyDrawing } from "./recognizer.js";
import { getCurrentMode } from "../app.js";

let canvas, ctx;
let drawing = false;
let strokes = [];
let currentStroke = [];
// UI mode (future expansion)

canvas = document.getElementById("draw-canvas");
ctx = canvas.getContext("2d");

resizeCanvas();
await loadModel();

canvas.addEventListener("pointerdown", startStroke);
canvas.addEventListener("pointermove", drawStroke);
canvas.addEventListener("pointerup", endStroke);
canvas.addEventListener("pointerleave", endStroke);

document.getElementById("clear-btn").onclick = clearCanvas;
document.getElementById("check-btn").onclick = checkDrawing;

function resizeCanvas() {
  canvas.width = 400;
  canvas.height = 400;
}

function startStroke(e) {
  drawing = true;
  currentStroke = [];
  ctx.beginPath();
}

function drawStroke(e) {
  if (!drawing) return;

  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  currentStroke.push({ x, y });

  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.strokeStyle = "black";

  ctx.lineTo(x, y);
  ctx.stroke();
}

function endStroke() {
  if (!drawing) return;
  drawing = false;
  ctx.closePath();

  if (currentStroke.length > 1) {
    strokes.push(currentStroke);
  }
}

async function checkDrawing() {
  const currentMode = getCurrentMode();
  if (!strokes.length) return;

  const imageData = strokesToImageData(strokes);
  if (!imageData) return;

  // Optional debug preview (HIGHLY recommended)
  drawDebugImage(imageData);

  const result = await classifyDrawing(imageData, currentMode);
  if (!result) return;

  // Dispatch a custom event with the prediction
  const event = new CustomEvent("drawingChecked", { detail: result });
  document.dispatchEvent(event);

  console.log(result);
  return result;
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  strokes = [];
  currentStroke = [];
  document.getElementById("feedback").textContent = "";

  // Optional: clear debug preview canvas
  const debug = document.getElementById("debug-canvas");
  if (debug) {
    debug.getContext("2d").clearRect(0, 0, debug.width, debug.height);
  }
}

// DEBUG HELPER
function drawDebugImage(imageData) {
  const dbg = document.getElementById("debug-canvas");
  if (!dbg) return;

  dbg.width = 28;
  dbg.height = 28;
  dbg.getContext("2d").putImageData(imageData, 0, 0);
}
