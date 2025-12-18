let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Carga de datos
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

    // 2. Transición del Splash (Cartel animado)
    setTimeout(() => {
        const splash = document.getElementById("splash");
        const app = document.getElementById("app");

        document.body.style.background = "#f2f4f7"; // Fondo gris app
        app.style.display = "block";
        mostrarPantalla("pantallaPrincipal");

        setTimeout(() => {
            splash.style.opacity = "0";
            app.style.opacity = "1";
            document.body.style.overflow = "auto";
            setTimeout(() => { splash.style.display = "none"; }, 800);
        }, 100);
    }, 3300); 
});

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
    window.scrollTo(0,0);
}

function agregarMaterial() {
    const ib = document.getElementById("buscador");
    const ic = document.getElementById("cantidad");
    const mat = MATERIALES.find(m => m.nombre === ib.value.trim());

    if (mat && parseInt(ic.value) > 0) {
        materialesCargados.push({ codigo: mat.codigo, descripcion: mat.nombre, cantidad: ic.value });
        renderLista();
        ib.value = ""; ic.value = "";
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    document.getElementById("btnSiguiente").style.display = materialesCargados.length > 0 ? "block" : "none";
    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${m.descripcion}</strong><br><small>${m.codigo} x${m.cantidad}</small></div>
                        <button onclick="materialesCargados.splice(${i},1);renderLista();" style="width:auto; background:red; padding:5px 10px; margin:0;">🗑️</button>`;
        ui.appendChild(li);
    });
}

function irAFirma() {
    if (!document.getElementById("tecnico").value) return alert("Seleccione un técnico primero");
    mostrarPantalla("pantallaFirma");
    if (typeof ajustarCanvas === "function") setTimeout(ajustarCanvas, 200);
}

function finalizar() {
    const firma = obtenerFirmaBase64();
    if (firma.length < 2000) return alert("La firma es obligatoria");
    
    // Aquí podrías enviar los datos a un servidor si fuera necesario
    mostrarPantalla("pantallaComprobante");
}
