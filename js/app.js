let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();
});

function inicializarListas() {
    if (typeof TECNICOS !== "undefined") {
        const select = document.getElementById("tecnico");
        TECNICOS.sort().forEach(t => {
            let opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            select.appendChild(opt);
        });
    }
    if (typeof MATERIALES !== "undefined") {
        const dl = document.getElementById("listaSugerencias");
        MATERIALES.forEach(m => {
            let opt = document.createElement("option");
            opt.value = m.nombre;
            dl.appendChild(opt);
        });
    }
}

function agregarMaterial() {
    const b = document.getElementById("buscador");
    const c = document.getElementById("cantidad");
    
    if (b.value.trim() !== "" && parseInt(c.value) > 0) {
        materialesCargados.push({ nombre: b.value.trim(), cant: c.value });
        b.value = ""; c.value = "";
        actualizarVista();
    }
}

function actualizarVista() {
    const listaUI = document.getElementById("lista");
    const firmaUI = document.getElementById("seccionFirma");
    listaUI.innerHTML = "";

    materialesCargados.forEach((m, i) => {
        listaUI.innerHTML += `<li>
            <span><strong>${m.cant}x</strong> ${m.nombre}</span>
            <button class="btn-borrar-item" onclick="eliminarMaterial(${i})">X</button>
        </li>`;
    });

    if (materialesCargados.length > 0) {
        firmaUI.style.display = "block";
        // Ajustamos el tamaño del canvas al mostrarlo
        setTimeout(() => {
            const canvas = document.getElementById('canvasFirma');
            canvas.width = canvas.offsetWidth;
            canvas.height = 300;
            if (typeof inicializarFirma === "function") inicializarFirma();
        }, 100);
    } else {
        firmaUI.style.display = "none";
    }
}

function eliminarMaterial(index) {
    materialesCargados.splice(index, 1);
    actualizarVista();
}

async function finalizar() {
    const canvas = document.getElementById('canvasFirma');
    const firmaData = canvas.toDataURL('image/png');
    const tecnico = document.getElementById("tecnico").value;
    const btn = document.getElementById("btnFinalizar");

    if (!tecnico) return alert("Seleccione el técnico responsable");
    if (firmaData.length < 2000) return alert("Firma obligatoria");

    // 1. Armamos el texto de materiales para el Google Doc
    const textoMateriales = materialesCargados.map(m => m.cant + "x " + m.nombre).join("\n");

    // 2. Estado de carga
    btn.disabled = true;
    btn.innerText = "⌛ ENVIANDO A DRIVE...";
    btn.style.background = "#888";

    // 3. Tu URL de Google Apps Script
    const urlScript = "https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1],
        nombre: `Reporte_${Date.now()}.pdf`,
        tecnico: tecnico,
        detalles: textoMateriales
    };

    try {
        await fetch(urlScript, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        alert("✅ REPORTE GENERADO CON ÉXITO");
        location.reload(); // Recarga para nueva carga
    } catch (e) {
        alert("❌ Error de conexión. Reintente.");
        btn.disabled = false;
        btn.innerText = "ENVIAR REPORTE PDF";
        btn.style.background = "#28a745";
    }
}
