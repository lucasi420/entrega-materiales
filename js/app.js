let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();
});

function inicializarListas() {
    // Cargar Técnicos desde tecnicos.js
    if (typeof TECNICOS !== "undefined") {
        const select = document.getElementById("tecnico");
        TECNICOS.sort().forEach(t => {
            let opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            select.appendChild(opt);
        });
    }
    // Cargar Materiales desde materiales.js
    if (typeof MATERIALES !== "undefined") {
        const dl = document.getElementById("listaSugerencias");
        MATERIALES.forEach(m => {
            let opt = document.createElement("option");
            opt.value = m.nombre;
            dl.appendChild(opt);
        });
    }
}

function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.style.display = 'none');
    const destino = document.getElementById(id);
    destino.style.display = 'block';

    if (id === 'pantallaFirma') {
        setTimeout(() => {
            const canvas = document.getElementById('canvasFirma');
            // FIX DEFINITIVO PARA PC Y CELU:
            canvas.width = canvas.offsetWidth;
            canvas.height = 300; 
            if (typeof inicializarFirma === "function") inicializarFirma();
        }, 200);
    }
}

function agregarMaterial() {
    const b = document.getElementById("buscador");
    const c = document.getElementById("cantidad");
    if (b.value && c.value > 0) {
        materialesCargados.push({ nombre: b.value, cant: c.value });
        renderLista();
        b.value = ""; c.value = "";
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    materialesCargados.forEach((m, i) => {
        ui.innerHTML += `<li>${m.cant}x ${m.nombre} <button onclick="materialesCargados.splice(${i},1);renderLista()">X</button></li>`;
    });
    document.getElementById("btnSiguiente").style.display = materialesCargados.length > 0 ? "block" : "none";
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Seleccione técnico");
    mostrarPantalla("pantallaFirma");
}

async function finalizar() {
    const canvas = document.getElementById('canvasFirma');
    const firmaData = canvas.toDataURL('image/png');
    const tecnico = document.getElementById("tecnico").value;

    if (firmaData.length < 2000) return alert("Firme el comprobante");

    // UNIMOS LOS MATERIALES EN UN TEXTO
    const listaTexto = materialesCargados.map(m => m.cant + "x " + m.nombre).join("\n");

    mostrarPantalla('pantallaComprobante');
    document.getElementById("resumenFinal").innerHTML = "Generando PDF...";

    const urlScript = "https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1],
        nombre: `Reporte_${Date.now()}.pdf`,
        tecnico: tecnico,
        detalles: listaTexto
    };

    try {
        await fetch(urlScript, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
        document.getElementById("resumenFinal").innerHTML = "✅ PDF GUARDADO EN DRIVE";
    } catch (e) {
        document.getElementById("resumenFinal").innerHTML = "❌ Error al enviar";
    }
}
