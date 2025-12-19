let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();
    // Tiempo de splash (3.5 segundos) antes de mostrar la app
    setTimeout(() => {
        const app = document.getElementById("app");
        app.style.display = "block";
        mostrarPantalla("pantallaPrincipal");
        setTimeout(() => { app.style.opacity = "1"; }, 50);
    }, 3500); 
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
    
    const btnSig = document.getElementById("btnSiguiente");
    if (id !== 'pantallaPrincipal') {
        if(btnSig) {
            btnSig.style.visibility = "hidden";
            btnSig.style.display = "none";
        }
    } else if (materialesCargados.length > 0) {
        if(btnSig) {
            btnSig.style.visibility = "visible";
            btnSig.style.display = "block";
        }
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
    } else {
        alert("Seleccione un material válido y cantidad mayor a 0");
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    const btnSig = document.getElementById("btnSiguiente");
    
    if (materialesCargados.length > 0) {
        btnSig.style.display = "block";
        btnSig.style.visibility = "visible";
    } else {
        btnSig.style.display = "none";
    }

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${m.descripcion}</strong><br><small>${m.codigo} x${m.cantidad}</small></div>
                        <button onclick="materialesCargados.splice(${i},1);renderLista();">🗑️</button>`;
        ui.appendChild(li);
    });
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Seleccione el responsable");
    mostrarPantalla("pantallaFirma");
}

async function finalizar() {
    const firmaData = obtenerFirmaBase64();
    if (firmaData.length < 2000) return alert("Firma obligatoria para finalizar");

    const resp = document.getElementById("tecnico").value;

    // 1. GENERAR NOMBRE: Fecha y Hora (DD-MM-YYYY_HH-mm)
    const ahora = new Date();
    const nombreArchivo = `${ahora.getDate()}-${ahora.getMonth()+1}-${ahora.getFullYear()}_${ahora.getHours()}-${ahora.getMinutes()}.png`;

    // 2. MOSTRAR PANTALLA DE ÉXITO Y ESTADO
    mostrarPantalla("pantallaComprobante");
    document.getElementById("resumenFinal").innerHTML = `<p style="color: #0b3c5d;">⌛ Subiendo a Drive...</p>`;


    // 3. ENVÍO AL SCRIPT (Asegúrate de que la URL sea la tuya)
    const urlScript = "https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1],
        nombre: nombreArchivo,
        tecnico: resp,
        detalles: listaMateriales // <--- ESTO ES LO QUE TU SCRIPT ESCRIBE EN EL PDF
    };

    try {
        await fetch(urlScript, {
            method: 'POST',
            mode: 'no-cors',
            body: JSON.stringify(payload)
        });
        
        document.getElementById("resumenFinal").innerHTML = `
            <div style="background: white; padding: 15px; border-radius: 10px; color: #333; text-align: left;">
                <p>✅ <strong>GUARDADO EN DRIVE</strong></p>
                <p>Responsable: ${resp}</p>
                <p>Archivo: ${nombreArchivo}</p>
            </div>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resumenFinal").innerHTML = `<p>❌ Error de conexión</p>`;
    }
}

    // 3. TU URL DE GOOGLE APPS SCRIPT
    const urlScript = "https://script.google.com/macros/s/AKfycbw0VPIibIlODwOoTuQGo7tnXQH--u_6jRQmPnVQg2pufJCjf0cPb9CauY5lU7OQ-2XJcw/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1], 
        nombre: nombreArchivo,
        tecnico: resp
    };

    try {
        await fetch(urlScript, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(payload)
        });
        
        document.getElementById("resumenFinal").innerHTML = `
            <div style="background: white; padding: 15px; border-radius: 10px; border: 1px solid #ddd;">
                <p>Responsable: <strong>${resp}</strong></p>
                <p>Archivo: <strong>${nombreArchivo}</strong></p>
                <p style="margin-top: 10px; color: green; font-weight: bold;">✅ GUARDADO EN DRIVE</p>
            </div>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resumenFinal").innerHTML = `<p>❌ Error de conexión con Drive, pero el registro se procesó.</p>`;
    }
}
