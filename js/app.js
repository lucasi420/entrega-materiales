/*********
 * VARIABLES GLOBALES
 *********/
let materialesCargados = [];
let tecnicoSeleccionado = "";

/*********
 * SPLASH INICIAL
 *********/
document.addEventListener("DOMContentLoaded", () => {
    // Esperamos 2 segundos y ocultamos el splash
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.opacity = "0";
            setTimeout(() => {
                splash.style.display = "none";
                mostrarPantalla("pantallaDatos");
            }, 600); // Tiempo para que termine la transición de opacidad
        }
    }, 2000);

    // Inicializar el canvas de la firma al cargar
    if (typeof inicializarCanvas === "function") {
        inicializarCanvas();
    }
});

/*********
 * NAVEGACIÓN ENTRE PANTALLAS
 *********/
function mostrarPantalla(id) {
    // Quitamos la clase 'activa' de todas las pantallas
    document.querySelectorAll(".pantalla").forEach(p => {
        p.classList.remove("activa");
    });

    // Añadimos la clase 'activa' a la pantalla destino
    const pantalla = document.getElementById(id);
    if (pantalla) {
        pantalla.classList.add("activa");
    } else {
        console.error("No se encontró la pantalla con ID:", id);
    }
}

/*********
 * PASO 1 – TÉCNICO
 *********/
function irMateriales() {
    const select = document.getElementById("tecnico");
    tecnicoSeleccionado = select.value;

    if (!tecnicoSeleccionado) {
        alert("Por favor, seleccione un técnico");
        return;
    }

    mostrarPantalla("pantallaMateriales");
}

/*********
 * PASO 2 – MATERIALES
 *********/
function agregarMaterial() {
    const buscador = document.getElementById("buscador");
    const cantidad = document.getElementById("cantidad");

    if (!buscador.value.trim() || !cantidad.value || cantidad.value <= 0) {
        alert("Ingrese un material válido y una cantidad mayor a 0");
        return;
    }

    // Agregar al array
    materialesCargados.push({
        descripcion: buscador.value.trim(),
        cantidad: cantidad.value
    });

    // Actualizar la vista
    renderListaMateriales();

    // Limpiar campos
    buscador.value = "";
    cantidad.value = "";
    buscador.focus();
}

function renderListaMateriales() {
    const lista = document.getElementById("lista");
    if (!lista) return;

    lista.innerHTML = "";

    materialesCargados.forEach((m, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${m.descripcion}</span>
            <span>x ${m.cantidad}</span>
        `;
        // Opcional: eliminar al tocar
        li.onclick = () => eliminarMaterial(index);
        lista.appendChild(li);
    });
}

function eliminarMaterial(index) {
    materialesCargados.splice(index, 1);
    renderListaMateriales();
}

function irFirma() {
    if (materialesCargados.length === 0) {
        alert("Debe cargar al menos un material");
        return;
    }
    mostrarPantalla("pantallaFirma");
}

/*********
 * PASO 3 – FINALIZAR
 *********/
function finalizar() {
    // Verificamos si existe la función en firma.js
    if (typeof obtenerFirmaBase64 !== "function") {
        alert("Error: El sistema de firma no está cargado.");
        return;
    }

    const firma = obtenerFirmaBase64();

    // Verificamos si el canvas está vacío (un canvas vacío suele medir ~1300 caracteres en base64)
    if (!firma || firma.length < 2000) {
        alert("Por favor, el técnico debe firmar antes de finalizar.");
        return;
    }

    // Generar el contenido del comprobante
    const comprobanteDiv = document.getElementById("comprobante");
    if (comprobanteDiv) {
        let itemsHTML = materialesCargados.map(m => `
            <li><strong>${m.descripcion}</strong>: ${m.cantidad} unidades</li>
        `).join('');

        comprobanteDiv.innerHTML = `
            <div style="text-align:center">
                <h2 style="color: #28a745;">¡Carga Exitosa!</h2>
                <p><strong>Técnico:</strong> ${tecnicoSeleccionado}</p>
                <hr>
                <ul style="text-align:left; list-style:none; padding:0;">
                    ${itemsHTML}
                </ul>
                <hr>
                <p>Firma del técnico:</p>
                <img src="${firma}" style="border:1px solid #ccc; width:100%; max-width:300px; background:#fff;">
                <br><br>
                <button onclick="location.reload()" style="background:#28a745">Hacer otra carga</button>
            </div>
        `;
    }

    mostrarPantalla("pantallaComprobante");
    alert("Control de materiales registrado correctamente.");
}
