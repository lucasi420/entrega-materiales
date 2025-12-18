let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    cargarListas();

    // Sincronización del cartel de inicio
    setTimeout(() => {
        const splash = document.getElementById("splash");
        const app = document.getElementById("app");

        app.style.display = "block";
        mostrarPantalla("pantallaPrincipal");

        setTimeout(() => {
            splash.style.opacity = "0";
            app.style.opacity = "1";
            setTimeout(() => { splash.style.display = "none"; }, 800);
        }, 100);
    }, 3300); 
});

function cargarListas() {
    if (typeof TECNICOS !== "undefined") {
        const sel = document.getElementById("tecnico");
        TECNICOS.sort().forEach(t => {
            let o = document.createElement("option"); o.value = t; o.textContent = t;
            sel.appendChild(o);
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
    // Primero ocultamos todas de forma absoluta
    document.querySelectorAll(".pantalla").forEach(p => {
        p.classList.remove("activa");
    });
    // Activamos solo la que corresponde
    const pantallaActual = document.getElementById(id);
    pantallaActual.classList.add("activa");
}

function agregarMaterial() {
    const ib = document.getElementById("buscador");
    const ic = document.getElementById("cantidad");
    const mat = MATERIALES.find(m => m.nombre === ib.value.trim());

    if (mat && parseInt(ic.value) > 0) {
        materialesCargados.push({ codigo: mat.codigo, descripcion: mat.nombre, cantidad: ic.value });
        renderLista();
        ib.value = ""; ic.value = "";
    } else {
        alert("Seleccione material y cantidad");
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    document.getElementById("btnSiguiente").style.display = materialesCargados.length > 0 ? "block" : "none";
    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${m.descripcion}</strong><br><small>${m.codigo} x${m.cantidad}</small></div>
                        <button onclick="materialesCargados.splice(${i},1);renderLista();" style="width:auto; background:#dc3545; padding:5px 12px; margin:0;">🗑️</button>`;
        ui.appendChild(li);
    });
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Seleccione el técnico");
    mostrarPantalla("pantallaFirma");
    // El canvas necesita un pequeño tiempo para calcular su tamaño una vez la pantalla es visible
    if (typeof ajustarCanvas === "function") setTimeout(ajustarCanvas, 200);
}

function finalizar() {
    const firma = obtenerFirmaBase64();
    if (firma.length < 2000) return alert("Firme el registro");
    mostrarPantalla("pantallaComprobante");
}
