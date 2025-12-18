/*********
 * VARIABLES GLOBALES
 *********/
let materialesCargados = [];
let tecnicoSeleccionado = "";

/*********
 * INICIALIZACIÓN AL CARGAR LA PÁGINA
 *********/
document.addEventListener("DOMContentLoaded", () => {
    // 1. Llenar Select de Técnicos desde tecnicos.js
    const selectTecnicos = document.getElementById("tecnico");
    if (typeof TECNICOS !== "undefined" && selectTecnicos) {
        // Opcional: .sort() para ordenarlos alfabéticamente
        TECNICOS.sort().forEach(t => {
            let option = document.createElement("option");
            option.value = t;
            option.textContent = t;
            selectTecnicos.appendChild(option);
        });
    }

    // 2. Llenar Datalist de Materiales desde materiales.js
    const datalist = document.getElementById("listaSugerencias");
    if (typeof MATERIALES !== "undefined" && datalist) {
        MATERIALES.forEach(item => {
            let option = document.createElement("option");
            option.value = item.nombre;
            datalist.appendChild(option);
        });
    }

    // 3. Manejo del Splash
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.display = "none";
            mostrarPantalla("pantallaDatos");
        }
    }, 2000);
});

/*********
 * NAVEGACIÓN
 *********/
function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    const destino = document.getElementById(id);
    if (destino) destino.classList.add("activa");
}

function irMateriales() {
    tecnicoSeleccionado = document.getElementById("tecnico").value;
    if (tecnicoSeleccionado !== "") {
        mostrarPantalla("pantallaMateriales");
    }
}

/*********
 * LOGICA DE MATERIALES
 *********/
function agregarMaterial() {
    const inputBusca = document.getElementById("buscador");
    const inputCant = document.getElementById("cantidad");
    
    const nombreMaterial = inputBusca.value.trim();
    const cantVal = parseInt(inputCant.value);

    // Validar que el material exista en la lista de materiales.js
    const materialEncontrado = MATERIALES.find(m => m.nombre === nombreMaterial);

    if (!materialEncontrado) {
        alert("Por favor, seleccione un material válido de la lista.");
        return;
    }

    if (isNaN(cantVal) || cantVal <= 0) {
        alert("Ingrese una cantidad válida mayor a cero.");
        return;
    }

    // Agregar al array
    materialesCargados.push({
        codigo: materialEncontrado.codigo,
        descripcion: materialEncontrado.nombre,
        cantidad: cantVal
    });

    renderLista();
    
    // Resetear campos
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
                <button class="btn-edit" onclick="editarMaterial(${index})">✏️</button>
                <button class="btn-del" onclick="eliminarMaterial(${index})">🗑️</button>
            </div>
        `;
        listaUI.appendChild(li);
    });
}

function eliminarMaterial(index) {
    if(confirm("¿Desea eliminar este material de la lista?")) {
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
            alert("Cantidad no válida.");
        }
    }
}

function irFirma() {
    if (materialesCargados.length === 0) {
        alert("Cargue al menos un material antes de continuar.");
        return;
    }
    mostrarPantalla("pantallaFirma");
}

/*********
 * FINALIZAR
 *********/
function finalizar() {
    if (typeof obtenerFirmaBase64 !== "function") return;
    const firma = obtenerFirmaBase64();

    // Validar que no sea una firma vacía
    if (!firma || firma.length < 2000) {
        alert("El técnico debe firmar para finalizar.");
        return;
    }

    const compDiv = document.getElementById("comprobante");
    let itemsHTML = materialesCargados.map(m => `
        <li style="margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
            <small style="color: #777;">${m.codigo}</small><br>
            ${m.descripcion} - <strong>x${m.cantidad}</strong>
        </li>
    `).join('');

    compDiv.innerHTML = `
        <div style="padding: 10px;">
            <h3 style="color: #1d70b8; text-align:center;">CARGA FINALIZADA</h3>
            <p><strong>Técnico:</strong> ${tecnicoSeleccionado}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
            <hr>
            <ul style="list-style: none; padding: 0;">${itemsHTML}</ul>
            <hr>
            <p>Firma:</p>
            <img src="${firma}" style="width: 100%; border: 1px solid #ccc; background: #fff; border-radius: 8px;">
            <button onclick="window.print()" style="background: #6c757d; margin-top:20px;">Imprimir / PDF</button>
            <button onclick="location.reload()" style="background: #28a745;">Nueva Carga</button>
        </div>
    `;

    mostrarPantalla("pantallaComprobante");
}
