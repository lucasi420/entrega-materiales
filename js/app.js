let materialesCargados = [];
let tecnicoSeleccionado = "";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar Técnicos y Materiales desde sus archivos .js
    prepararListas();

    // 2. Control de Presentación
    // A los 2.8s (justo cuando el zoom está por terminar)
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.opacity = "0"; // Inicia desvanecimiento de luz
            
            // Mostramos la primera pantalla (Técnicos)
            mostrarPantalla("pantallaDatos");

            // Quitamos el splash del DOM después del fundido
            setTimeout(() => {
                splash.style.display = "none";
            }, 800);
        }
    }, 2800); 
});

function prepararListas() {
    const st = document.getElementById("tecnico");
    if (typeof TECNICOS !== "undefined" && st) {
        TECNICOS.sort().forEach(t => {
            let o = document.createElement("option");
            o.value = t; o.textContent = t;
            st.appendChild(o);
        });
    }

    const dl = document.getElementById("listaSugerencias");
    if (typeof MATERIALES !== "undefined" && dl) {
        MATERIALES.forEach(m => {
            let o = document.createElement("option");
            o.value = m.nombre;
            dl.appendChild(o);
        });
    }
}

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    const destino = document.getElementById(id);
    if (destino) {
        destino.classList.add("activa");
        if(id === "pantallaFirma" && typeof ajustarCanvas === "function") {
            setTimeout(ajustarCanvas, 100);
        }
    }
}

function irMateriales() {
    tecnicoSeleccionado = document.getElementById("tecnico").value;
    if (tecnicoSeleccionado) mostrarPantalla("pantallaMateriales");
}

function agregarMaterial() {
    const ib = document.getElementById("buscador");
    const ic = document.getElementById("cantidad");
    const mat = MATERIALES.find(m => m.nombre === ib.value.trim());

    if (mat && parseInt(ic.value) > 0) {
        materialesCargados.push({
            codigo: mat.codigo,
            descripcion: mat.nombre,
            cantidad: parseInt(ic.value)
        });
        renderLista();
        ib.value = ""; ic.value = ""; ib.focus();
    } else {
        alert("Selección inválida.");
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    const bf = document.getElementById("btnIrAFirma");
    ui.innerHTML = "";
    if(bf) bf.style.display = materialesCargados.length > 0 ? "block" : "none";

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div><small>${m.codigo}</small><br><strong>${m.descripcion}</strong><br>Cant: ${m.cantidad}</div>
            <div style="display:flex; gap:5px;">
                <button onclick="editarMaterial(${i})" style="width:40px; background:#ffc107; color:black; padding:5px;">✏️</button>
                <button onclick="eliminarMaterial(${i})" style="width:40px; background:#dc3545; color:white; padding:5px;">🗑️</button>
            </div>`;
        ui.appendChild(li);
    });
}

function eliminarMaterial(i) { materialesCargados.splice(i, 1); renderLista(); }

function editarMaterial(i) {
    const n = prompt("Cantidad:", materialesCargados[i].cantidad);
    if(n) { materialesCargados[i].cantidad = parseInt(n); renderLista(); }
}

function irFirma() { mostrarPantalla("pantallaFirma"); }

function finalizar() {
    const firma = obtenerFirmaBase64();
    if (firma.length < 2000) return alert("Firme para continuar");

    document.getElementById("comprobante").innerHTML = `
        <div style="text-align:center;">
            <h3 style="color:#0b3c5d;">REGISTRO COMPLETADO</h3>
            <p style="margin:10px 0;">Técnico: ${tecnicoSeleccionado}</p>
            <hr><ul style="text-align:left; padding:15px; list-style:none;">
                ${materialesCargados.map(m => `<li style="margin-bottom:5px;">• ${m.descripcion} (x${m.cantidad})</li>`).join('')}
            </ul><hr>
            <p>Firma:</p>
            <img src="${firma}" style="width:100%; border:1px solid #ddd; border-radius:10px;">
            <button onclick="window.print()" style="margin-top:20px; background:#666;">Guardar PDF</button>
            <button onclick="location.reload()" style="background:#28a745;">Nueva Carga</button>
        </div>`;
    mostrarPantalla("pantallaComprobante");
}
