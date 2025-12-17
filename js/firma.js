const canvas = document.getElementById("firmaCanvas");
const ctx = canvas.getContext("2d");

let dibujando = false;

function ajustarCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width;
  canvas.height = rect.height;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";
}

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();

canvas.addEventListener("mousedown", () => dibujando = true);
canvas.addEventListener("mouseup", () => dibujando = false);
canvas.addEventListener("mouseleave", () => dibujando = false);

canvas.addEventListener("mousemove", dibujar);

canvas.addEventListener("touchstart", e => {
  e.preventDefault();
  dibujando = true;
});

canvas.addEventListener("touchend", () => dibujando = false);
canvas.addEventListener("touchcancel", () => dibujando = false);

canvas.addEventListener("touchmove", dibujar);

function dibujar(e) {
  if (!dibujando) return;

  const rect = canvas.getBoundingClientRect();
  const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
  const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function limpiarFirma() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

function obtenerFirmaBase64() {
  return canvas.toDataURL("image/png");
}
