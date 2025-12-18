/*********
 * VARIABLES GLOBALES
 *********/
let materialesCargados = [];
let tecnicoSeleccionado = "";

/*********
 * INICIALIZACIÓN Y CONTROL DEL SPLASH (PRESENTACIÓN)
 *********/
document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar Técnicos desde tecnicos.js
    const selectTecnicos = document.getElementById("tecnico");
    if (typeof TECNICOS !== "undefined" && selectTecnicos) {
        TECNICOS.sort().forEach(t => {
            let option = document.createElement("option");
            option.value = t;
            option.textContent = t;
            selectTecnicos.appendChild(option);
        });
    }

    // 2. Cargar Materiales desde materiales.js
    const datalist = document.getElementById("listaSugerencias");
    if (typeof MATERIALES !== "undefined" && datalist) {
        MATERIALES.forEach(item => {
            let option = document.createElement("option");
            option.value = item.nombre;
            datalist.appendChild(option);
        });
    }

    // 3. Temporizador para ocultar el Splash sincronizado con la animación CSS (3s)
    // A los 2.8s iniciamos el fundido para que el zoom "atraviese" la pantalla suavemente
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.opacity = "0";
            setTimeout(() => {
                splash.style.display = "none";
                mostrarPantalla("pantallaDatos");
            }, 800); 
        }
    }, 2800); 
});

/*********
 * NAVEGACIÓN ENTRE PANTALLAS
 *********/
function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    const destino = document.getElementById(id);
    if (destino) {
        destino.classList.add("activa");
        // Ajuste automático del canvas si entramos a la firma
        if(id === "pantallaFirma" && typeof ajustarCanvas === "function") {
            setTimeout(ajustarCanvas, 100);
        }
    }
}

// Salto automático al elegir técnico
function irMateriales() {
    tecnicoSeleccionado = document.getElementById("tecnico").value;
    if (tecnicoSeleccionado !== "") {
        mostrarPantalla("pantallaMateriales");
    }
}

/*********
 * CARGA DE MATERIALES
 *********/
function agregarMaterial() {
    const inputBusca = document.getElementById("buscador");
    const inputCant = document.getElementById("cantidad");
    const nombreMaterial = inputBusca.value.trim();
    const cantVal = parseInt(inputCant.value);

    // Buscamos el material en el archivo materiales.js
    const materialEncontrado = MATERIALES.find(m => m.nombre === nombreMaterial);

    if (!materialEncontrado) {
        alert("Por favor, seleccione un material válido de la lista.");
        return;
    }

    if (isNaN(cantVal) || cantVal <= 0) {
        alert("Ingrese una cantidad válida.");
        return;
    }

    // Guardamos con código incluido
    materialesCargados.push({
        codigo: materialEncontrado.codigo,
        descripcion: materialEncontrado.nombre,
        cantidad: cantVal
    });

    renderLista();
    
    // Reset e foco
    inputBusca.value = "";
    inputCant.value = "";
    inputBusca.focus();
}

function renderLista() {
    const listaUI = document.getElementById("lista");
    const btnFirma = document.getElementById("btnIrAFirma");
    listaUI.innerHTML = "";

    // Mostramos el botón "Firmar" solo si hay algo en la lista
    if (btnFirma) {
        btnFirma.style.display = materialesCargados.length > 0 ? "block" : "none";
    }

    materialesCargados.forEach((m, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="flex-grow: 1;">
                <small style="color: #666; font-size: 10px;">${m.codigo}</small><br>
                <strong>${m.descripcion}</strong><br>
                <span>Cant: ${m.cantidad}</span>
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
        }
    }
}

function irFirma() {
    mostrarPantalla("pantallaFirma");
}

/*********
 * COMPROBANTE FINAL
 *********/
function finalizar() {
    const firma = obtenerFirmaBase64();
    if (!firma || firma.length < 2000) {
        alert("El técnico debe firmar antes de finalizar.");
        return;
    }

    const compDiv = document.getElementById("comprobante");
    let itemsHTML = materialesCargados.map(m => `
        <li style="margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px;">
            <small>${m.codigo}</small><br>
            ${m.descripcion} - <strong>x${m.cantidad}</strong>
        </li>
    `).join('');

    compDiv.innerHTML = `
        <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="color: #0b3c5d; text-align:center;">CARGA REGISTRADA</h3>
            <p><strong>Técnico:</strong> ${tecnicoSeleccionado}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
            <hr>
            <ul style="list-style: none; padding: 0;">${itemsHTML}</ul>
            <hr>
            <p>Firma del técnico:</p>
            <img src="${firma}" style="width: 100%; border: 1px solid #ccc; background: #fff;">
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="window.print()" style="background: #6c757d; margin: 0; flex: 1;">PDF</button>
                <button onclick="location.reload()" style="background: #28a745; margin: 0; flex: 1;">NUEVO</button>
            </div>
        </div>
    `;

    mostrarPantalla("pantallaComprobante");
}
