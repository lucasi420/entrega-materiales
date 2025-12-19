/*********
 * LÓGICA DE FIRMA
 *********/
let canvas, ctx, dibujando = false;

function inicializarFirma() {
    canvas = document.getElementById("canvasFirma");
    if (!canvas) return;
    ctx = canvas.getContext("2d");

    // Configuración inicial del trazo
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width || canvas.offsetWidth;
    canvas.height = 300; // Altura fija para evitar que se aplaste
    
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000000";

    // --- EVENTOS DE MOUSE ---
    canvas.onmousedown = (e) => {
        dibujando = true;
        ctx.beginPath();
        const pos = obtenerPosicion(e);
        ctx.moveTo(pos.x, pos.y);
    };

    canvas.onmousemove = (e) => {
        if (!dibujando) return;
        const pos = obtenerPosicion(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    canvas.onmouseup = () => dibujando = false;
    canvas.onmouseleave = () => dibujando = false;

    // --- EVENTOS TÁCTILES ---
    canvas.addEventListener("touchstart", (e) => {
        e.preventDefault();
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
}

function obtenerPosicion(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function limpiarFirma() {
    if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
    }
}

function obtenerFirmaBase64() {
    return canvas ? canvas.toDataURL("image/png") : "";
}
