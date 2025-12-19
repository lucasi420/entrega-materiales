let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    inicializarListas();

    // Orquestación del Splash Animado (3.5s)
    setTimeout(() => {
        const app = document.getElementById("app");
        app.style.display = "block";
        
        mostrarPantalla("pantallaPrincipal");

        setTimeout(() => {
            app.style.opacity = "1";
            document.body.style.overflow = "hidden"; // Reforzamos bloqueo de scroll
        }, 50);
    }, 3500); 
});

function inicializarListas() {
    if (typeof TECNICOS !== "undefined") {
        const selResponsable = document.getElementById("tecnico");
        const selAuxiliar = document.getElementById("tecnicoAuxiliar");
        
        TECNICOS.sort().forEach(t => {
            let opt1 = document.createElement("option");
            opt1.value = t; opt1.textContent = t;
            selResponsable.appendChild(opt1);

            let opt2 = document.createElement("option");
            opt2.value = t; opt2.textContent = t;
            selAuxiliar.appendChild(opt2);
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
    const destino = document.getElementById(id);
    if (destino) destino.classList.add('activa');

    if (id === 'pantallaFirma' && typeof ajustarCanvas === "function") {
        setTimeout(ajustarCanvas, 250);
    }
}

function agregarMaterial() {
    const inputBusca = document.getElementById("buscador");
    const inputCant = document.getElementById("cantidad");
    const nombre = inputBusca.value.trim();
    const cant = parseInt(inputCant.value);

    const mat = MATERIALES.find(m => m.nombre === nombre);

    if (mat && cant > 0) {
        materialesCargados.push({
            codigo: mat.codigo,
            descripcion: mat.nombre,
            cantidad: cant
        });
        renderLista();
        inputBusca.value = "";
        inputCant.value = "";
        inputBusca.focus();
    } else {
        alert("Selección o cantidad inválida");
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    
    const btnSig = document.getElementById("btnSiguiente");
    btnSig.style.display = materialesCargados.length > 0 ? "block" : "none";

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.background = "#fff";
        li.style.padding = "10px";
        li.style.marginBottom = "5px";
        li.style.borderRadius = "8px";
        li.style.borderLeft = "4px solid #0b3c5d";
        
        li.innerHTML = `
            <div><strong>${m.descripcion}</strong><br><small>${m.codigo} x${m.cantidad}</small></div>
            <button onclick="materialesCargados.splice(${i},1);renderLista();" 
                    style="background:#dc3545; color:white; border:none; border-radius:5px; padding:5px 10px;">🗑️</button>
        `;
        ui.appendChild(li);
    });
}

function irAFirma() {
    const resp = document.getElementById("tecnico").value;
    const aux = document.getElementById("tecnicoAuxiliar").value;

    if (!resp) return alert("Seleccione al responsable");
    if (resp === aux) return alert("El auxiliar no puede ser la misma persona");

    mostrarPantalla("pantallaFirma");
}

function finalizar() {
    const firmaData = obtenerFirmaBase64();
    if (firmaData.length < 2000) return alert("Firma obligatoria");

    const resp = document.getElementById("tecnico").value;
    const aux = document.getElementById("tecnicoAuxiliar").value;
    
    document.getElementById("resumenFinal").innerHTML = `
        <p>Responsable: <strong>${resp}</strong></p>
        ${aux ? `<p>Auxiliar: <strong>${aux}</strong></p>` : ''}
        <p>Items cargados: ${materialesCargados.length}</p>
    `;

    mostrarPantalla("pantallaComprobante");
}
