/*********
 * VARIABLES GLOBALES
 *********/
let materialesCargados = [];
let tecnicoSeleccionado = "";

/*********
 * INICIALIZACIÓN
 *********/
document.addEventListener("DOMContentLoaded", () => {
    // Llenar el datalist con los nombres de tu archivo materiales.js
    const datalist = document.getElementById("listaSugerencias");
    if (typeof MATERIALES !== "undefined") {
        MATERIALES.forEach(item => {
            let option = document.createElement("option");
            option.value = item.nombre; // El técnico busca por nombre
            option.dataset.codigo = item.codigo; // Guardamos el código oculto
            datalist.appendChild(option);
        });
    }

    // Splash
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.display = "none";
            mostrarPantalla("pantallaDatos");
        }
    }, 2000);
});

function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    document.getElementById(id).classList.add("activa");
}

/*********
 * PASO 1 – TÉCNICO (SALTO AUTOMÁTICO)
 *********/
function irMateriales() {
    const select = document.getElementById("tecnico");
    tecnicoSeleccionado = select.value;

    if (tecnicoSeleccionado !== "") {
        mostrarPantalla("pantallaMateriales");
    }
}

/*********
 * PASO 2 – MATERIALES (BUSCADOR Y EDICIÓN)
 *********/
function agregarMaterial() {
    const inputBusca = document.getElementById("buscador");
    const inputCant = document.getElementById("cantidad");
    
    const nombreMaterial = inputBusca.value.trim();
    const cantVal = parseInt(inputCant.value);

    // Validar que el material exista en tu lista de materiales.js
    const materialEncontrado = MATERIALES.find(m => m.nombre === nombreMaterial);

    if (!materialEncontrado) {
        alert("Seleccione un material válido de la lista desplegable.");
        return;
    }

    if (isNaN(cantVal) || cantVal <= 0) {
        alert("Ingrese una cantidad válida");
        return;
    }

    // Agregar al array con su código
    materialesCargados.push({
        codigo: materialEncontrado.codigo,
        descripcion: materialEncontrado.nombre,
        cantidad: cantVal
    });

    renderLista();
    
    // Limpiar y enfocar
    inputBusca.value = "";
    inputCant.value = "";
    inputBusca.focus();
}

function renderLista() {
    const listaUI = document.getElementById("lista");
    listaUI.innerHTML = "";

    materialesCargados.forEach((m, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="flex-grow: 1;">
                <small style="color: #666; font-size: 10px;">${m.codigo}</small><br>
                <strong>${m.descripcion}</strong><br>
                <span>Cantidad: ${m.cantidad}</span>
            </div>
            <div class="acciones-item">
                <button class="btn-edit" onclick="editarMaterial(${index})" title="Editar">✏️</button>
                <button class="btn-del" onclick="eliminarMaterial(${index})" title="Eliminar">🗑️</button>
            </div>
        `;
        listaUI.appendChild(li);
    });
}

function eliminarMaterial(index) {
    if(confirm("¿Eliminar este material?")) {
        materialesCargados.splice(index, 1);
        renderLista();
    }
}

function editarMaterial(index) {
    const m = materialesCargados[index];
    const nuevaCant = prompt(`Editar cantidad para:\n${m.descripcion}`, m.cantidad);
    
    if (nuevaCant !== null) {
        const num = parseInt(nuevaCant);
        if (!isNaN(num) && num > 0) {
            materialesCargados[index].cantidad = num;
            renderLista();
        } else {
            alert("Cantidad no válida");
        }
    }
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
    if (typeof obtenerFirmaBase64 !== "function") return;
    const firma = obtenerFirmaBase64();

    if (!firma || firma.length < 2000) {
        alert("El técnico debe firmar.");
        return;
    }

    const compDiv = document.getElementById("comprobante");
    let itemsHTML = materialesCargados.map(m => `
        <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
            <small>${m.codigo}</small><br>
            ${m.descripcion} - <strong>x${m.cantidad}</strong>
        </li>
    `).join('');

    compDiv.innerHTML = `
        <div style="padding: 10px;">
            <h3 style="color: #1d70b8; text-align:center;">RESUMEN DE CARGA</h3>
            <p><strong>Técnico:</strong> ${tecnicoSeleccionado}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <hr>
            <ul style="list-style: none; padding: 0;">${itemsHTML}</ul>
            <hr>
            <p>Firma:</p>
            <img src="${firma}" style="width: 100%; border: 1px solid #ccc; background: #fff;">
            <button onclick="window.print()" style="background: #6c757d;">Imprimir o Guardar PDF</button>
            <button onclick="location.reload()" style="background: #28a745;">Nueva Carga</button>
        </div>
    `;

    mostrarPantalla("pantallaComprobante");
}
