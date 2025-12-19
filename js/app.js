// Variable global para mantener los datos entre pantallas
let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();
});

// 1. CARGA DE DATOS INICIALES
function inicializarListas() {
    // Cargar Técnicos
    if (typeof TECNICOS !== "undefined") {
        const select = document.getElementById("tecnico");
        TECNICOS.sort().forEach(t => {
            let opt = document.createElement("option");
            opt.value = t; opt.textContent = t;
            select.appendChild(opt);
        });
    }
    // Cargar Sugerencias de Materiales
    if (typeof MATERIALES !== "undefined") {
        const dl = document.getElementById("listaSugerencias");
        MATERIALES.forEach(m => {
            let opt = document.createElement("option");
            opt.value = m.nombre;
            dl.appendChild(opt);
        });
    }
}

// 2. LÓGICA DE NAVEGACIÓN (PANTALLAS)
function mostrarPantalla(id) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.pantalla').forEach(p => {
        p.style.display = 'none';
        p.classList.remove('activa');
    });
    
    // Mostrar la pantalla elegida
    const destino = document.getElementById(id);
    if (destino) {
        destino.style.display = 'block';
        destino.classList.add('activa');
    }

    // Si entramos a la firma, ajustamos el canvas para que no se aplaste
    if (id === 'pantallaFirma') {
        setTimeout(() => {
            const canvas = document.getElementById('canvasFirma');
            if (canvas) {
                canvas.width = canvas.offsetWidth;
                canvas.height = 300; 
                // Inicializar funciones de dibujo del archivo firma.js
                if (typeof inicializarFirma === "function") inicializarFirma();
            }
        }, 250);
    }
}

// 3. GESTIÓN DE MATERIALES
function agregarMaterial() {
    const b = document.getElementById("buscador");
    const c = document.getElementById("cantidad");
    const mat = MATERIALES.find(m => m.nombre === b.value.trim());

    if (mat && parseInt(c.value) > 0) {
        // Guardamos los datos con los nombres que espera la función de envío
        materialesCargados.push({ 
            codigo: mat.codigo, 
            descripcion: mat.nombre, 
            cantidad: c.value 
        });
        renderLista();
        b.value = ""; 
        c.value = ""; 
        b.focus();
    } else {
        alert("Seleccione un material válido de la lista y cantidad mayor a 0");
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    
    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:#f9f9f9; margin-bottom:5px; padding:10px; border-radius:5px; border-left:4px solid #0b3c5d;";
        li.innerHTML = `
            <div>
                <strong>${m.cantidad}x</strong> ${m.descripcion} <br>
                <small style="color:gray;">Cód: ${m.codigo}</small>
            </div>
            <button onclick="materialesCargados.splice(${i},1);renderLista();" style="background:#ff4444; color:white; border:none; border-radius:3px; padding:5px 10px; cursor:pointer;">X</button>
        `;
        ui.appendChild(li);
    });

    // Mostrar botón "Siguiente" solo si hay materiales
    const btnSig = document.getElementById("btnSiguiente");
    if (btnSig) {
        btnSig.style.display = materialesCargados.length > 0 ? "block" : "none";
    }
}

// 4. PASO A LA FIRMA
function irAFirma() {
    const tecnico = document.getElementById("tecnico").value;
    if (!tecnico) return alert("Por favor, seleccione el técnico responsable");
    mostrarPantalla("pantallaFirma");
}

// 5. FINALIZAR Y ENVIAR A GOOGLE DRIVE
async function finalizar() {
    const firmaData = obtenerFirmaBase64();
    if (firmaData.length < 2000) return alert("Debe firmar el comprobante para finalizar");

    const resp = document.getElementById("tecnico").value;

    // Preparamos el texto de materiales para el PDF
    const listaMateriales = materialesCargados.map(m => 
        `${m.cantidad}x ${m.descripcion} [Cód: ${m.codigo}]`
    ).join("\n");

    // Nombre del archivo con fecha y hora
    const ahora = new Date();
    const nombreArchivo = `Reporte_${ahora.getDate()}-${ahora.getMonth()+1}_${ahora.getHours()}-${ahora.getMinutes()}.pdf`;

    // Cambiar a pantalla de carga
    mostrarPantalla("pantallaComprobante");
    document.getElementById("resumenFinal").innerHTML = `<p style="color: #0b3c5d;">⌛ Generando PDF y subiendo a Drive...</p>`;

    const urlScript = "https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1],
        nombre: nombreArchivo,
        tecnico: resp,
        detalles: listaMateriales
    };

    try {
        await fetch(urlScript, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        document.getElementById("resumenFinal").innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; color: #333; text-align: left; border: 1px solid #ddd; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <p style="color:green; font-weight:bold; font-size:1.2rem; margin-bottom:10px;">✅ ¡ENVIADO CON ÉXITO!</p>
                <p><strong>Responsable:</strong> ${resp}</p>
                <p><strong>Materiales:</strong> ${materialesCargados.length} ítems cargados.</p>
                <hr style="margin:10px 0;">
                <p style="font-size: 0.8rem; color: #666;">El PDF se guardó en la carpeta de Drive como: <br> ${nombreArchivo}</p>
                <button onclick="location.reload()" style="width:100%; margin-top:15px; padding:10px; background:#0b3c5d; color:white; border:none; border-radius:5px; cursor:pointer;">Hacer otra carga</button>
            </div>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resumenFinal").innerHTML = `<p>❌ Error de conexión. El reporte no pudo subirse.</p>
        <button onclick="mostrarPantalla('pantallaFirma')" style="padding:10px;">Reintentar</button>`;
    }
}
