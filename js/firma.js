/*********
 * LÓGICA DE FIRMA
 *********/
const canvas = document.getElementById("canvasFirma"); // ID corregido para coincidir con el HTML
const ctx = canvas.getContext("2d");

let dibujando = false;

// Configuración inicial
function ajustarCanvas() {
    // Obtenemos el tamaño que le da el CSS
    const rect = canvas.getBoundingClientRect();
    
    // Sincronizamos el ancho interno del canvas con su tamaño real en pantalla
    canvas.width = rect.width;
    canvas.height = rect.height;
    
    // Estilos de la línea
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";
}

// Llamar al cargar y al cambiar tamaño de pantalla
window.addEventListener("resize", ajustarCanvas);
// Un pequeño delay asegura que el CSS ya se aplicó
setTimeout(ajustarCanvas, 100);

// --- EVENTOS DE MOUSE ---
canvas.addEventListener("mousedown", (e) => {
    dibujando = true;
    ctx.beginPath(); // Iniciar nuevo trazo
    const pos = obtenerPosicion(e);
    ctx.moveTo(pos.x, pos.y);
});

canvas.addEventListener("mousemove", (e) => {
    if (!dibujando) return;
    const pos = obtenerPosicion(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
});

canvas.addEventListener("mouseup", () => dibujando = false);
canvas.addEventListener("mouseleave", () => dibujando = false);

// --- EVENTOS TÁCTILES (Móviles) ---
canvas.addEventListener("touchstart", (e) => {
    e.preventDefault(); // Evita que la pantalla se mueva al firmar
    dibujando = true;
    ctx.beginPath();
    const pos = obtenerPosicion(e.touches[0]);
    ctx.moveTo(pos.x, pos.y);
}, { passive: false });

canvas.addEventListener("touchmove", (e) => {
    e.preventDefault();
    if (!dibujando) return;
    const pos = obtenerPosicion(e.touches[0]);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
}, { passive: false });

canvas.addEventListener("touchend", () => dibujando = false);

// Función auxiliar para calcular coordenadas exactas
function obtenerPosicion(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

// --- FUNCIONES QUE LLAMA APP.JS ---
function limpiarFirma() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
}

function obtenerFirmaBase64() {
    // Verificamos si el canvas está vacío antes de exportar
    // (Opcional: podrías retornar null si el usuario no dibujó nada)
    return canvas.toDataURL("image/png");
}

// Función para inicializar desde app.js si fuera necesario
function inicializarCanvas() {
    ajustarCanvas();
}
