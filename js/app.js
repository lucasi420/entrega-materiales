let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();
    // Splash inicial de 3 segundos
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
    // 1. Ocultar todas las secciones
    document.querySelectorAll('.pantalla').forEach(p => {
        p.classList.remove('activa');
        p.style.display = 'none';
    });
    
    // 2. Mostrar la sección actual
    const destino = document.getElementById(id);
    if(destino) {
        destino.classList.add('activa');
        destino.style.display = 'block';
    }

    // 3. REPARAR EL CUADRO DE FIRMA (Evita que se aplaste)
    if (id === 'pantallaFirma') {
        setTimeout(() => {
            const canvas = document.getElementById('canvasFirma');
            if (canvas) {
                // Forzamos el tamaño interno al tamaño real que tiene en el celular
                canvas.width = canvas.clientWidth;
                canvas.height = 300; // Altura fija recomendada para celulares
                
                // Si tienes la función de inicialización en firma.js, la llamamos
                if (typeof iniciarFirma === "function") {
                    iniciarFirma();
                }
            }
        }, 150); // Pequeño delay para que el navegador termine de renderizar el display:block
    }
}

function agregarMaterial() {
    const b = document.getElementById("buscador");
    const c = document.getElementById("cantidad");
    const mat = MATERIALES.find(m => m.nombre === b.value.trim());

    if (mat && parseInt(c.value) > 0) {
        // Los materiales se guardan en el array global, no se borran al cambiar de pantalla
        materialesCargados.push({ codigo: mat.codigo, descripcion: mat.nombre, cantidad: c.value });
        renderLista();
        b.value = ""; c.value = ""; b.focus();
    } else {
        alert("Seleccione un material y cantidad válida");
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
                        <button onclick="materialesCargados.splice(${i},1);renderLista();" class="btn-borrar-item">🗑️</button>`;
        ui.appendChild(li);
    });
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Por favor, seleccione el técnico responsable");
    mostrarPantalla("pantallaFirma");
}

async function finalizar() {
    const firmaData = obtenerFirmaBase64();
    // Validamos que haya firmado (un base64 muy corto es un canvas vacío)
    if (firmaData.length < 2000) return alert("Debe firmar el comprobante para finalizar");

    const resp = document.getElementById("tecnico").value;
    const aux = document.getElementById("tecnicoAuxiliar").value || "Sin auxiliar";
    
    // Convertimos la lista de materiales acumulada en un texto para el Google Doc
    const textoMateriales = materialesCargados.map(m => `• ${m.cantidad}x ${m.descripcion} (${m.codigo})`).join("\n");

    // Cambiamos a la pantalla de éxito/carga
    mostrarPantalla("pantallaComprobante");
    document.getElementById("resumenFinal").innerHTML = `<p style="color:#0b3c5d;">⌛ Creando PDF y subiendo a Drive...</p>`;

    const urlScript = "https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1],
        nombre: `Ticket_${Date.now()}.pdf`,
        tecnico: resp,
        detalles: `AUXILIAR: ${aux}\n\nLISTA DE MATERIALES:\n${textoMateriales}`
    };

    try {
        await fetch(urlScript, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        document.getElementById("resumenFinal").innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.1); color: #333;">
                <h3 style="color: green;">✅ ENVÍO EXITOSO</h3>
                <p><strong>Responsable:</strong> ${resp}</p>
                <p><strong>Materiales:</strong> ${materialesCargados.length} ítems registrados.</p>
                <hr>
                <p><small>El comprobante PDF ya está disponible en tu Google Drive.</small></p>
            </div>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resumenFinal").innerHTML = `<p>❌ Error de red. Intente nuevamente.</p>`;
    }
}
