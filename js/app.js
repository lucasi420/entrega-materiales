let materialesCargados = [];
let tecnicoSeleccionado = "";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar datos iniciales
    if (typeof TECNICOS !== "undefined") {
        const st = document.getElementById("tecnico");
        TECNICOS.sort().forEach(t => {
            let o = document.createElement("option"); o.value = t; o.textContent = t;
            st.appendChild(o);
        });
    }

    if (typeof MATERIALES !== "undefined") {
        const dl = document.getElementById("listaSugerencias");
        MATERIALES.forEach(m => {
            let o = document.createElement("option"); o.value = m.nombre;
            dl.appendChild(o);
        });
    }

    // 2. Control del Splash
    setTimeout(() => {
        const splash = document.getElementById("splash");
        document.body.style.overflow = "auto";
        if (splash) {
            splash.style.opacity = "0";
            mostrarPantalla("pantallaDatos");
            setTimeout(() => { splash.style.display = "none"; }, 800);
        }
    }, 3300); 
});

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
    window.scrollTo(0,0);
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
            cantidad: ic.value
        });
        renderLista();
        ib.value = ""; ic.value = ""; ib.focus();
    } else {
        alert("Seleccione un material y cantidad válida.");
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    const btnSiguiente = document.getElementById("btnSiguienteFirma");
    ui.innerHTML = "";
    
    // El botón "Siguiente" solo aparece si hay materiales
    btnSiguiente.style.display = materialesCargados.length > 0 ? "block" : "none";

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div><strong>${m.descripcion}</strong><br><small>${m.codigo} - Cant: ${m.cantidad}</small></div>
            <button onclick="materialesCargados.splice(${i},1);renderLista();" style="width:auto; background:#dc3545; padding:5px 10px;">🗑️</button>
        `;
        ui.appendChild(li);
    });
}

function irFirma() {
    mostrarPantalla("pantallaFirma");
    // Inicializar canvas después de mostrar pantalla
    if (typeof ajustarCanvas === "function") {
        setTimeout(ajustarCanvas, 200);
    }
}

function finalizar() {
    const firma = obtenerFirmaBase64();
    if (firma.length < 2000) {
        alert("Por favor, firme antes de enviar.");
        return;
    }

    const comp = document.getElementById("comprobante");
    comp.innerHTML = `
        <div style="text-align:center;">
            <div style="font-size: 50px;">✅</div>
            <h2 style="color:#28a745;">CARGA EXITOSA</h2>
            <p>El registro de <strong>${tecnicoSeleccionado}</strong> ha sido guardado.</p>
            <hr style="margin:20px 0; border:0; border-top:1px solid #eee;">
            <img src="${firma}" style="width:100%; border:1px solid #ddd; border-radius:10px;">
            <button onclick="location.reload()" style="margin-top:20px; background:#0b3c5d;">Hacer otra carga</button>
            <button onclick="window.print()" style="background:#6c757d; margin-top:10px;">Imprimir Comprobante</button>
        </div>
    `;
    mostrarPantalla("pantallaComprobante");
}
