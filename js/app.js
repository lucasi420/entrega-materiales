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

    // 1. CAPTURAR DATOS DEL HTML
    const tecnico = document.getElementById("tecnico").value;
    const auxiliar = document.getElementById("tecnicoAuxiliar").value; // ID correcto según tu HTML
    
    if (!tecnico) return alert("Por favor, seleccione un técnico responsable.");

    // 2. FORMATEO DE FECHA Y NOMBRE DE ARCHIVO
    const ahora = new Date();
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    
    const nombreArchivo = `Reporte_${tecnico.replace(/ /g, "_")}_${dia}-${mes}_${horas}-${minutos}hs.pdf`;

    // 3. ARMADO DEL CONTENIDO DEL TEXTO (Detalles)
    let detallesTexto = "REPORTE DE ENTREGA\n";
    detallesTexto += "--------------------------------\n";
    detallesTexto += `RESPONSABLE: ${tecnico}\n`;
    
    // Si hay auxiliar seleccionado, lo incluimos
    if (auxiliar && auxiliar !== "") {
        detallesTexto += `AUXILIAR: ${auxiliar}\n`;
    }
    
    detallesTexto += "--------------------------------\n";
    detallesTexto += "MATERIALES ENTREGADOS:\n";
    
    materialesCargados.forEach((m, index) => {
        detallesTexto += `${index + 1}. [${m.codigo}] ${m.descripcion} (Cant: ${m.cantidad})\n`;
    });
    detallesTexto += "--------------------------------\n";

    // 4. CAMBIAR PANTALLA Y MOSTRAR ESTADO
    mostrarPantalla("pantallaComprobante");
    document.getElementById("resumenFinal").innerHTML = `<p style="color: #0b3c5d;">⌛ Subiendo reporte a Drive...</p>`;

    // 5. ENVÍO A GOOGLE
    const urlScript = "https://script.google.com/macros/s/AKfycbwNblPaOvLCEOGySjwm4SJZjU4rfjWbCG1xHGgCnpo2CjcVsIIF8R_P-O0fzYLuWPQObA/exec"; 

    const payload = {
        imagen: firmaData.split(',')[1], 
        nombre: nombreArchivo,
        tecnico: tecnico,
        detalles: detallesTexto
    };

    try {
        await fetch(urlScript, {
            method: 'POST',
            mode: 'no-cors', 
            body: JSON.stringify(payload)
        });
        
        // RESULTADO FINAL (Sin el botón repetido, ya que usas el del HTML)
        document.getElementById("resumenFinal").innerHTML = `
            <div style="background: white; padding: 20px; border-radius: 10px; border: 1px solid #ddd; text-align: left; margin-bottom: 20px;">
                <h3 style="color: green; margin-top: 0; display: flex; align-items: center; gap: 8px;">
                    ✅ ¡ENVIADO CON ÉXITO!
                </h3>
                <p><strong>Responsable:</strong> ${tecnico}</p>
                ${auxiliar ? `<p><strong>Auxiliar:</strong> ${auxiliar}</p>` : ''}
                <p style="font-size: 0.85rem; color: #666; border-top: 1px solid #eee; padding-top: 10px; margin-top: 10px;">
                    Archivo: ${nombreArchivo}
                </p>
            </div>
        `;
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("resumenFinal").innerHTML = `<p style="color:red;">❌ Error de conexión al subir el PDF.</p>`;
    }
}
