/*********
 * VARIABLES GLOBALES
 *********/
let materialesCargados = [];
let tecnicoSeleccionado = "";

/*********
 * INICIALIZACIÓN
 *********/
document.addEventListener("DOMContentLoaded", () => {
    // 1. Llenar Técnicos
    const selectTecnicos = document.getElementById("tecnico");
    if (typeof TECNICOS !== "undefined" && selectTecnicos) {
        TECNICOS.sort().forEach(t => {
            let option = document.createElement("option");
            option.value = t;
            option.textContent = t;
            selectTecnicos.appendChild(option);
        });
    }

    // 2. Llenar Materiales (Datalist)
    const datalist = document.getElementById("listaSugerencias");
    if (typeof MATERIALES !== "undefined" && datalist) {
        MATERIALES.forEach(item => {
            let option = document.createElement("option");
            option.value = item.nombre;
            datalist.appendChild(option);
        });
    }

    // 3. Splash
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
    if (destino) {
        destino.classList.add("activa");
        // Si vamos a la firma, asegurar que el canvas se ajuste al tamaño actual
        if(id === "pantallaFirma" && typeof ajustarCanvas === "function") {
            setTimeout(ajustarCanvas, 100);
        }
    }
}

function irMateriales() {
    tecnicoSeleccionado = document.getElementById("tecnico").value;
    if (tecnicoSeleccionado !== "") {
        mostrarPantalla("pantallaMateriales");
    }
}

/*********
 * GESTIÓN DE MATERIALES
 *********/
function agregarMaterial() {
    const inputBusca = document.getElementById("buscador");
    const inputCant = document.getElementById("cantidad");
    
    const nombreMaterial = inputBusca.value.trim();
    const cantVal = parseInt(inputCant.value);

    const materialEncontrado = MATERIALES.find(m => m.nombre === nombreMaterial);

    if (!materialEncontrado) {
        alert("Seleccione un material válido de la lista.");
        return;
    }

    if (isNaN(cantVal) || cantVal <= 0) {
        alert("Ingrese una cantidad válida.");
        return;
    }

    materialesCargados.push({
        codigo: materialEncontrado.codigo,
        descripcion: materialEncontrado.nombre,
        cantidad: cantVal
    });

    renderLista();
    
    inputBusca.value = "";
    inputCant.value = "";
    inputBusca.focus();
}

function renderLista() {
    const listaUI = document.getElementById("lista");
    const contenedorFirma = document.getElementById("contenedorIrFirma");
    listaUI.innerHTML = "";

    // Mostrar botón de firma solo si hay items
    contenedorFirma.style.display = materialesCargados.length > 0 ? "block" : "none";

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
    materialesCargados.splice(index, 1);
    renderLista();
}

function editarMaterial(index) {
    const m = materialesCargados[index];
    const nuevaCant = prompt(`Editar cantidad para:\n${m.descripcion}`, m.cantidad);
    
    if (nuevaCant !== null) {
        const num = parseInt(nuevaCant);
        if (!isNaN(num) && num > 0) {
            materialesCargados[index].cantidad = num;
            renderLista();
        }
    }
}

function irFirma() {
    mostrarPantalla("pantallaFirma");
}

/*********
 * FINALIZAR
 *********/
function finalizar() {
    const firma = obtenerFirmaBase64();
    if (!firma || firma.length < 2000) {
        alert("El técnico debe firmar.");
        return;
    }

    const compDiv = document.getElementById("comprobante");
    let itemsHTML = materialesCargados.map(m => `
        <li style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
            <small style="color: #777;">${m.codigo}</small><br>
            ${m.descripcion} - <strong>x${m.cantidad}</strong>
        </li>
    `).join('');

    compDiv.innerHTML = `
        <div style="padding: 10px;">
            <h3 style="color: #1d70b8; text-align:center;">CARGA REGISTRADA</h3>
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
