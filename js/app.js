let materialesCargados = [];
let tecnicoSeleccionado = "";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar bases de datos
    cargarDatosIniciales();

    // 2. Lógica del Splash cinematográfico
    // El tiempo debe ser exactamente el clímax de la animación CSS (3.3s)
    setTimeout(() => {
        const splash = document.getElementById("splash");
        
        // Habilitamos el scroll para la app
        document.body.style.overflow = "auto";
        
        if (splash) {
            splash.style.opacity = "0"; // Inicia desvanecimiento de luz
            
            // Revelamos la primera pantalla real
            mostrarPantalla("pantallaDatos");

            // Removemos el splash por completo después del fade
            setTimeout(() => { splash.style.display = "none"; }, 800);
        }
    }, 3300); 
});

function cargarDatosIniciales() {
    if (typeof TECNICOS !== "undefined") {
        const select = document.getElementById("tecnico");
        TECNICOS.sort().forEach(t => {
            let o = document.createElement("option"); o.value = t; o.textContent = t;
            select.appendChild(o);
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
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    const pantalla = document.getElementById(id);
    if(pantalla) pantalla.classList.add("activa");
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
        materialesCargados.push({ codigo: mat.codigo, descripcion: mat.nombre, cantidad: ic.value });
        renderLista();
        ib.value = ""; ic.value = ""; ib.focus();
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    document.getElementById("btnSiguienteFirma").style.display = materialesCargados.length > 0 ? "block" : "none";

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `<div><strong>${m.descripcion}</strong><br><small>${m.codigo}</small> - x${m.cantidad}</div>
                        <button onclick="materialesCargados.splice(${i},1);renderLista();" style="width:auto; background:red; padding:5px 10px;">🗑️</button>`;
        ui.appendChild(li);
    });
}

function irFirma() {
    mostrarPantalla("pantallaFirma");
    if (typeof ajustarCanvas === "function") setTimeout(ajustarCanvas, 200);
}

function finalizar() {
    const firma = obtenerFirmaBase64();
    if (firma.length < 2000) return alert("Firme el registro.");

    document.getElementById("comprobante").innerHTML = `
        <div style="text-align:center;">
            <h1 style="font-size: 50px;">✅</h1>
            <h2 style="color:#28a745;">CARGA REGISTRADA</h2>
            <p>Técnico: <strong>${tecnicoSeleccionado}</strong></p>
            <hr style="margin:20px 0;">
            <img src="${firma}" style="width:100%; border:1px solid #ddd; border-radius:10px;">
            <button onclick="location.reload()" style="margin-top:20px; background:#0b3c5d;">Nueva Carga</button>
            <button onclick="window.print()" style="margin-top:10px; background:#666;">Guardar PDF</button>
        </div>`;
    mostrarPantalla("pantallaComprobante");
}
