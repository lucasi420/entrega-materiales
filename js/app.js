let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();
    // Splash inicial
    setTimeout(() => {
        const app = document.getElementById("app");
        app.style.display = "block";
        mostrarPantalla("pantallaPrincipal");
        setTimeout(() => { app.style.opacity = "1"; }, 50);
    }, 3000); 
});

function inicializarListas() {
    if (typeof TECNICOS !== "undefined") {
        const r = document.getElementById("tecnico");
        const a = document.getElementById("tecnicoAuxiliar");
        TECNICOS.sort().forEach(t => {
            let o1 = document.createElement("option"); o1.value = t; o1.textContent = t;
            let o2 = document.createElement("option"); o2.value = t; o2.textContent = t;
            r.appendChild(o1); a.appendChild(o2);
        });
    }
    if (typeof MATERIALES !== "undefined") {
        const dl = document.getElementById("listaSugerencias");
        MATERIALES.forEach(m => {
            let o = document.createElement("option"); o.value = m.nombre;
            dl.appendChild(o);
        });
    }
}

function mostrarPantalla(id) {
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    
    // Control visual del botón Siguiente
    const btnSig = document.getElementById("btnSiguiente");
    if (id !== 'pantallaPrincipal') {
        if(btnSig) btnSig.style.display = "none";
    } else if (materialesCargados.length > 0) {
        if(btnSig) btnSig.style.display = "block";
    }

    const destino = document.getElementById(id);
    if(destino) destino.classList.add('activa');

    if (id === 'pantallaFirma' && typeof ajustarCanvas === "function") {
        setTimeout(ajustarCanvas, 250);
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
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    const btnSig = document.getElementById("btnSiguiente");
    
    if (materialesCargados.length > 0) {
        btnSig.style.display = "block";
    } else {
        btnSig.style.display = "none";
    }

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${m.descripcion}</strong><br><small>${m.codigo} x${m.cantidad}</small></div>
                        <button onclick="materialesCargados.splice(${i},1);renderLista();" style="background:#dc3545; color:white; border:none; padding:8px; border-radius:5px;">🗑️</button>`;
        ui.appendChild(li);
    });
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Seleccione el técnico responsable");
    mostrarPantalla("pantallaFirma");
}

async function finalizar() {
    const firmaData = obtenerFirmaBase64();
    if (firmaData.length < 2000) return alert("La firma es obligatoria");

    const resp = document.getElementById("tecnico").value;
    const aux = document.getElementById("tecnicoAuxiliar").value || "Ninguno";
    
    // 1. GENERAR NOMBRE PARA EL PDF
    const ahora = new Date();
    const nombreArchivo = `Reporte_${ahora.getDate()}-${ahora.getMonth()+1}_${ahora.getHours()}${ahora.getMinutes()}.pdf`;

    // 2. CAMBIAR A PANTALLA DE ÉXITO Y MOSTRAR CARGA
    mostrarPantalla("pantallaComprobante");
    document.getElementById("resumenFinal").innerHTML = `
        <div style="text-align:center;">
            <p id="statusTxt" style="color:#0b3c5d; font-weight:bold;">⏳ Generando PDF y enviando...</p>
        </div>`;

    // 3. PREPARAR LISTA DE MATERIALES PARA EL DOC
    // Formato: "2x Cable (COD123), 5x Conector (COD456)..."
    const detallesTexto = materialesCargados.map(m => `${m.cantidad}x ${m.descripcion} (${m.codigo})`).join("\n");

    const urlScript = "https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1],
        nombre: nombreArchivo,
        tecnico: resp,
        detalles: detallesTexto
    };

    try {
        await fetch(urlScript, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        document.getElementById("resumenFinal").innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                <p>Técnico: <strong>${resp}</strong></p>
                <p>Auxiliar: <strong>${aux}</strong></p>
                <p>Materiales registrados: <strong>${materialesCargados.length}</strong></p>
                <hr style="margin:15px 0;">
                <p style="color: green; font-weight: bold;">✅ ARCHIVO PDF GUARDADO EN DRIVE</p>
                <p style="font-size: 0.8rem; color: #666; margin-top:5px;">${nombreArchivo}</p>
            </div>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resumenFinal").innerHTML = `<p>❌ Error al subir. Verifique su conexión.</p>`;
    }
}
