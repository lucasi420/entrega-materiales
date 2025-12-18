let materialesCargados = [];
let tecnicoSeleccionado = "";

document.addEventListener("DOMContentLoaded", () => {
    // Cargar datos
    const st = document.getElementById("tecnico");
    if (typeof TECNICOS !== "undefined") {
        TECNICOS.sort().forEach(t => {
            let o = document.createElement("option"); o.value = t; o.textContent = t;
            st.appendChild(o);
        });
    }

    const dl = document.getElementById("listaSugerencias");
    if (typeof MATERIALES !== "undefined") {
        MATERIALES.forEach(m => {
            let o = document.createElement("option"); o.value = m.nombre;
            dl.appendChild(o);
        });
    }

    // CONTROL DE LA PRESENTACIÓN
    setTimeout(() => {
        const splash = document.getElementById("splash");
        // Quitamos el bloqueo de scroll
        document.body.style.overflow = "auto";
        
        if (splash) {
            splash.style.opacity = "0";
            // Activamos la primera pantalla justo en el flash de luz
            mostrarPantalla("pantallaDatos");
            
            setTimeout(() => { splash.style.display = "none"; }, 1000);
        }
    }, 3200); // Espera el final de la explosión del texto
});

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
}

function irMateriales() {
    tecnicoSeleccionado = document.getElementById("tecnico").value;
    if (tecnicoSeleccionado) mostrarPantalla("pantallaMateriales");
}

function agregarMaterial() {
    const ib = document.getElementById("buscador");
    const ic = document.getElementById("cantidad");
    const mat = MATERIALES.find(m => m.nombre === ib.value.trim());

    if (mat && ic.value > 0) {
        materialesCargados.push({ codigo: mat.codigo, descripcion: mat.nombre, cantidad: ic.value });
        renderLista();
        ib.value = ""; ic.value = "";
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    document.getElementById("btnIrAFirma").style.display = materialesCargados.length > 0 ? "block" : "none";
    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<b>${m.descripcion}</b> (x${m.cantidad}) <button onclick="materialesCargados.splice(${i},1);renderLista();" style="width:auto; padding:5px; background:red; float:right;">X</button>`;
        li.style.background = "#eee"; li.style.padding = "10px"; li.style.marginBottom = "5px";
        ui.appendChild(li);
    });
}

function irFirma() { mostrarPantalla("pantallaFirma"); if(typeof ajustarCanvas === "function") ajustarCanvas(); }

function finalizar() {
    const firma = obtenerFirmaBase64();
    document.getElementById("comprobante").innerHTML = `<h3>Resumen</h3><p>Técnico: ${tecnicoSeleccionado}</p><img src="${firma}" style="width:100%"><button onclick="location.reload()">Nuevo</button>`;
    mostrarPantalla("pantallaComprobante");
}
