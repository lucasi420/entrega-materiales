let materialesCargados = [];

window.onload = function() {
    // 1. Cargar Listas
    try {
        if (typeof TECNICOS !== 'undefined') {
            const sel = document.getElementById("tecnico");
            TECNICOS.sort().forEach(t => {
                let o = document.createElement("option");
                o.value = t; o.textContent = t;
                sel.appendChild(o);
            });
        }
        if (typeof MATERIALES !== 'undefined') {
            const dl = document.getElementById("listaSugerencias");
            MATERIALES.forEach(m => {
                let o = document.createElement("option");
                o.value = m.nombre;
                dl.appendChild(o);
            });
        }
    } catch (e) { console.warn("Error en listas:", e); }

    // 2. Mostrar App
    const app = document.getElementById("app");
    if(app) {
        app.style.display = "block";
        app.style.opacity = "1";
    }
    mostrarPantalla("pantallaPrincipal");
};

function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.style.display = 'none');
    const destino = document.getElementById(id);
    if (destino) destino.style.display = 'block';

    if (id === 'pantallaFirma') {
        setTimeout(() => {
            // Llamamos a la función de firma.js
            if (typeof inicializarFirma === "function") inicializarFirma();
        }, 300);
    }
}

function agregarMaterial() {
    const b = document.getElementById("buscador");
    const c = document.getElementById("cantidad");
    const mat = MATERIALES.find(m => m.nombre === b.value.trim());

    if (mat && parseInt(c.value) > 0) {
        materialesCargados.push({ codigo: mat.codigo, descripcion: mat.nombre, cantidad: c.value });
        renderLista();
        b.value = ""; c.value = ""; b.focus();
    } else { alert("Material o cantidad no válida"); }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    materialesCargados.forEach((m, i) => {
        ui.innerHTML += `<li>${m.cantidad}x ${m.descripcion} <button onclick="materialesCargados.splice(${i},1);renderLista()">X</button></li>`;
    });
    const btn = document.getElementById("btnSiguiente");
    if(btn) btn.style.display = materialesCargados.length > 0 ? "block" : "none";
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Seleccione técnico");
    mostrarPantalla("pantallaFirma");
}

async function finalizar() {
    const firmaData = obtenerFirmaBase64();
    if (firmaData.length < 2000) return alert("Firma obligatoria");

    const resp = document.getElementById("tecnico").value;
    const listaTexto = materialesCargados.map(m => `${m.cantidad}x ${m.descripcion} [${m.codigo}]`).join("\n");

    mostrarPantalla("pantallaComprobante");
    document.getElementById("resumenFinal").innerHTML = "⌛ Enviando...";

    const payload = {
        imagen: firmaData.split(',')[1],
        nombre: `Reporte_${Date.now()}.pdf`,
        tecnico: resp,
        detalles: listaTexto
    };

    try {
        await fetch("https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec", {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        document.getElementById("resumenFinal").innerHTML = "✅ ENVIADO CON ÉXITO";
    } catch (e) {
        document.getElementById("resumenFinal").innerHTML = "❌ Error al enviar.";
    }
}
