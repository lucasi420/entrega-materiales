/**
 * APP CONTROLER - Control Materiales Ushuaia
 */

let materialesCargados = [];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Poblado de datos iniciales
    inicializarDatos();

    // 2. Orquestación del Splash (3.5 segundos de cine)
    setTimeout(() => {
        // Hacemos que la app sea visible en el DOM antes de mostrar la pantalla
        document.getElementById("app").style.display = "block";
        
        // Cambiamos de instancia
        mostrarPantalla("pantallaPrincipal");

        // Pequeño delay para que la opacidad de la app suba suavemente si lo configuraste en main.css
        setTimeout(() => {
            document.getElementById("app").style.opacity = "1";
        }, 50);

    }, 3500); 
});

// FUNCIÓN MAESTRA DE NAVEGACIÓN
function mostrarPantalla(id) {
    // Ocultamos todas las pantallas quitando la clase 'activa'
    document.querySelectorAll('.pantalla').forEach(p => {
        p.classList.remove('activa');
    });

    // Activamos la instancia deseada
    const pantallaDestino = document.getElementById(id);
    if (pantallaDestino) {
        pantallaDestino.classList.add('activa');
    }

    // Si entramos a la firma, ajustamos el canvas para que detecte su nuevo tamaño
    if (id === 'pantallaFirma' && typeof ajustarCanvas === "function") {
        setTimeout(ajustarCanvas, 250);
    }
}

function inicializarDatos() {
    // Técnicos
    if (typeof TECNICOS !== "undefined") {
        const sel = document.getElementById("tecnico");
        TECNICOS.sort().forEach(t => {
            let o = document.createElement("option"); o.value = t; o.textContent = t;
            sel.appendChild(o);
        });
    }
    // Materiales
    if (typeof MATERIALES !== "undefined") {
        const dl = document.getElementById("listaSugerencias");
        MATERIALES.forEach(m => {
            let o = document.createElement("option"); o.value = m.nombre;
            dl.appendChild(o);
        });
    }
}

function agregarMaterial() {
    const inputBusca = document.getElementById("buscador");
    const inputCant = document.getElementById("cantidad");
    const nombre = inputBusca.value.trim();
    const cant = parseInt(inputCant.value);

    const matEncontrado = MATERIALES.find(m => m.nombre === nombre);

    if (matEncontrado && cant > 0) {
        materialesCargados.push({
            codigo: matEncontrado.codigo,
            descripcion: matEncontrado.nombre,
            cantidad: cant
        });
        renderLista();
        // Reset
        inputBusca.value = "";
        inputCant.value = "";
        inputBusca.focus();
    } else {
        alert("Selección o cantidad no válida");
    }
}

function renderLista() {
    const ui = document.getElementById("lista");
    ui.innerHTML = "";
    
    // Mostramos botón siguiente solo si hay materiales
    const btnSig = document.getElementById("btnSiguiente");
    btnSig.style.display = materialesCargados.length > 0 ? "block" : "none";

    materialesCargados.forEach((m, i) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div><strong>${m.descripcion}</strong><br><small>${m.codigo} x${m.cantidad}</small></div>
            <button onclick="materialesCargados.splice(${i},1);renderLista();" 
                    style="background:red; color:white; border:none; border-radius:5px; padding:5px 10px;">X</button>
        `;
        ui.appendChild(li);
    });
}

function irAFirma() {
    const tecnico = document.getElementById("tecnico").value;
    if (!tecnico) {
        alert("Por favor, selecciona un técnico.");
        return;
    }
    mostrarPantalla("pantallaFirma");
}

function finalizar() {
    const firmaData = obtenerFirmaBase64();
    
    // Validación de firma (si está vacía suele devolver un string corto)
    if (firmaData.length < 2000) {
        alert("La firma es obligatoria para finalizar el registro.");
        return;
    }

    // Aquí ya estamos en la instancia final
    mostrarPantalla("pantallaComprobante");
}
