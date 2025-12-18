/*********
 * VARIABLES GLOBALES
 *********/
let materialesCargados = [];
let tecnicoSeleccionado = "";

/*********
 * INICIALIZACIÓN Y ANIMACIÓN SPLASH
 *********/
document.addEventListener("DOMContentLoaded", () => {
    // 1. Cargar lista de técnicos desde tecnicos.js
    const selectTecnicos = document.getElementById("tecnico");
    if (typeof TECNICOS !== "undefined" && selectTecnicos) {
        TECNICOS.sort().forEach(t => {
            let option = document.createElement("option");
            option.value = t;
            option.textContent = t;
            selectTecnicos.appendChild(option);
        });
    }

    // 2. Cargar sugerencias de materiales desde materiales.js
    const datalist = document.getElementById("listaSugerencias");
    if (typeof MATERIALES !== "undefined" && datalist) {
        MATERIALES.forEach(item => {
            let option = document.createElement("option");
            option.value = item.nombre;
            datalist.appendChild(option);
        });
    }

    // 3. Sincronización de Splash con el efecto Zoom del CSS
    // La animación en CSS dura 2.5s. Ocultamos el div justo antes del final.
    setTimeout(() => {
        const splash = document.getElementById("splash");
        if (splash) {
            splash.style.opacity = "0"; // Inicia desvanecimiento de luz
            setTimeout(() => {
                splash.style.display = "none";
                mostrarPantalla("pantallaDatos");
            }, 600); 
        }
    }, 2400); 
});

/*********
 * SISTEMA DE NAVEGACIÓN
 *********/
function mostrarPantalla(id) {
    document.querySelectorAll(".pantalla").forEach(p => p.classList.remove("activa"));
    const destino = document.getElementById(id);
    if (destino) {
        destino.classList.add("activa");
        // Ajustar canvas si entramos a la firma
        if(id === "pantallaFirma" && typeof ajustarCanvas === "function") {
            setTimeout(ajustarCanvas, 100);
        }
    }
}

function irMateriales() {
    const select = document.getElementById("tecnico");
    tecnicoSeleccionado = select.value;
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

    // Validación contra el archivo materiales.js
    const materialEncontrado = MATERIALES.find(m => m.nombre === nombreMaterial);

    if (!materialEncontrado) {
        alert("Por favor, seleccione un material de la lista desplegable.");
        return;
    }

    if (isNaN(cantVal) || cantVal <= 0) {
        alert("Ingrese una cantidad válida.");
        return;
    }

    // Guardar objeto con código y descripción
    materialesCargados.push({
        codigo: materialEncontrado.codigo,
        descripcion: materialEncontrado.nombre,
        cantidad: cantVal
    });

    renderLista();
    
    // Reset de inputs
    inputBusca.value = "";
    inputCant.value = "";
    inputBusca.focus();
}

function renderLista() {
    const listaUI = document.getElementById("lista");
    const btnFirma = document.getElementById("btnIrAFirma");
    listaUI.innerHTML = "";

    // El botón "Firmar" solo aparece si hay materiales
    if (btnFirma) {
        btnFirma.style.display = materialesCargados.length > 0 ? "block" : "none";
    }

    materialesCargados.forEach((m, index) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <div style="flex-grow: 1;">
                <small style="color: #888; font-size: 10px;">${m.codigo}</small><br>
                <strong>${m.descripcion}</strong><br>
                <span>Cant: ${m.cantidad}</span>
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
    materialesCargados.splice(index, 1);
    renderLista();
}

function editarMaterial(index) {
    const m = materialesCargados[index];
    const nuevaCant = prompt(`Nueva cantidad para:\n${m.descripcion}`, m.cantidad);
    
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
 * FINALIZACIÓN Y COMPROBANTE
 *********/
function finalizar() {
    const firma = obtenerFirmaBase64();
    if (!firma || firma.length < 2000) {
        alert("Se requiere la firma del técnico.");
        return;
    }

    const compDiv = document.getElementById("comprobante");
    let itemsHTML = materialesCargados.map(m => `
        <li style="margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 5px; font-size: 0.9rem;">
            <small style="color: #999;">${m.codigo}</small><br>
            ${m.descripcion} - <strong>x${m.cantidad}</strong>
        </li>
    `).join('');

    compDiv.innerHTML = `
        <div style="padding: 10px; border: 2px solid #eee; border-radius: 10px;">
            <h3 style="color: #0b3c5d; text-align:center; margin-top: 0;">CARGA REGISTRADA</h3>
            <p style="font-size: 0.9rem;"><strong>Técnico:</strong> ${tecnicoSeleccionado}</p>
            <p style="font-size: 0.9rem;"><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            <hr>
            <ul style="list-style: none; padding: 0;">${itemsHTML}</ul>
            <hr>
            <p style="font-size: 0.8rem; color: #666;">Firma de conformidad:</p>
            <img src="${firma}" style="width: 100%; border: 1px solid #ccc; background: #fff; border-radius: 5px;">
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                <button onclick="window.print()" style="background: #6c757d; margin: 0; flex: 1;">PDF</button>
                <button onclick="location.reload()" style="background: #28a745; margin: 0; flex: 1;">Nueva</button>
            </div>
        </div>
    `;

    mostrarPantalla("pantallaComprobante");
}
