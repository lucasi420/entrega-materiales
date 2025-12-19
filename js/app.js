let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();
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
    // 1. Ocultar todas las pantallas
    document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
    
    // 2. Controlar la visibilidad del botón Siguiente para que no flote en otras instancias
    const btnSig = document.getElementById("btnSiguiente");
    if (id !== 'pantallaPrincipal') {
        btnSig.style.visibility = "hidden"; // Desaparece visualmente
        btnSig.style.display = "none";      // Se quita del flujo
    } else if (materialesCargados.length > 0) {
        btnSig.style.visibility = "visible";
        btnSig.style.display = "block";
    }

    // 3. Activar destino
    document.getElementById(id).classList.add('activa');

    // 4. Ajustar Canvas
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
        btnSig.style.visibility = "visible";
    }

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${m.descripcion}</strong><br><small>${m.codigo} x${m.cantidad}</small></div>
                        <button onclick="materialesCargados.splice(${i},1);renderLista();" style="background:#dc3545; color:white; border:none; padding:8px; border-radius:5px;">🗑️</button>`;
        ui.appendChild(li);
    });
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Seleccione el responsable");
    if (document.getElementById("tecnico").value === document.getElementById("tecnicoAuxiliar").value) return alert("Auxiliar no puede ser el mismo");
    mostrarPantalla("pantallaFirma");
}

function finalizar() {
    const firma = obtenerFirmaBase64();
    if (firma.length < 2000) return alert("Firma obligatoria");
    
    document.getElementById("resumenFinal").innerHTML = `
        <p>Responsable: ${document.getElementById("tecnico").value}</p>
        <p>Items: ${materialesCargados.length}</p>
    `;
    mostrarPantalla("pantallaComprobante");
}
