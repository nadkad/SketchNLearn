// strokeProcessor.js
// Converts strokes into a 28×28 ImageData object

export function strokesToImageData(strokes, size = 28) {
  if (!strokes.length) return null;

  // Flatten points
  const points = strokes.flat();
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const boxSize = Math.max(maxX - minX, maxY - minY);

  // Temporary canvas
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = size;
  tempCanvas.height = size;
  const ctx = tempCanvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";

  ctx.beginPath();
  strokes.forEach(stroke => {
    stroke.forEach((p, i) => {
      const x = ((p.x - minX) / boxSize) * (size - 4) + 2;
      const y = ((p.y - minY) / boxSize) * (size - 4) + 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
  });
  ctx.stroke();

  return ctx.getImageData(0, 0, size, size);
}
