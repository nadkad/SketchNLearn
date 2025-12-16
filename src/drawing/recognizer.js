// recognizer.js
// EMNIST client-side recognizer (TensorFlow.js)

let model = null;

// EMNIST ByClass labels (62 classes: digita + letters)
const EMNIST_LABELS = [
  // Digits
  ..."0123456789",

  // Uppercase letters
  ...Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
  ),

  // Lowercase letters
  ...Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(97 + i)
  )
];

// -------------------------------
// Load EMNIST model
// -------------------------------
export async function loadModel() {
  if (!model) {
    model = await tf.loadLayersModel("/src/models/model.json");
    console.log("EMNIST model loaded");
  }
}

// -------------------------------
// Preprocess canvas image
// -------------------------------
function preprocessCanvas(canvas) {
  return tf.tidy(() => {
    let tensor = tf.browser.fromPixels(canvas, 1)
      .resizeNearestNeighbor([28, 28])
      .toFloat()
      .div(255.0)
      .expandDims(0);

    // invert colors if your canvas is black-on-white
    tensor = tf.sub(1, tensor);
    return tensor;
  });
}

// -------------------------------
// Check Drawing
// -------------------------------
export async function classifyDrawing(canvas, currentMode) {
  if (!model) await loadModel();
  if (!canvas) return null;
  console.log("[Recognizer] mode:", currentMode);

  const input = preprocessCanvas(canvas);
  const prediction = model.predict(input);
  const probs = prediction.dataSync(); // length 62

  // -------------------------------
  // Filter by mode
  // -------------------------------
  let startIdx, endIdx;
  if (currentMode === "letters") {
    startIdx = 10;  // uppercase letters start
    endIdx = 35;    // uppercase letters end
  } else if (currentMode === "numbers") {
    startIdx = 0;
    endIdx = 9;
  } else {
    startIdx = 0;
    endIdx = probs.length - 1; // fallback: all classes
  }

  const filteredProbs = probs.slice(startIdx, endIdx + 1);
  const maxIdx = filteredProbs.indexOf(Math.max(...filteredProbs));
  const classIndex = startIdx + maxIdx;
  const confidence = filteredProbs[maxIdx];

  input.dispose();
  prediction.dispose();

  const ranked = [];
    for (let i = startIdx; i <= endIdx; i++) {
    ranked.push({
        label: EMNIST_LABELS[i],
        confidence: probs[i]
    });
    }

    ranked.sort((a, b) => b.confidence - a.confidence);
    return {
    top1: ranked[0],
    top2: ranked[1]
    };
}
