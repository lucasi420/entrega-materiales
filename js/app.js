/*********
 * VARIABLES GLOBALES
 *********/
let materialesCargados = [];
let tecnicoSeleccionado = "";

/*********
 * SPLASH INICIAL
 *********/
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    mostrarPantalla("pantallaDatos");
  }, 2000);
});

/*********
 * NAVEGACIÓN ENTRE PANTALLAS
 *********/
function mostrarPantalla(id) {
  document.querySelectorAll(".pantalla").forEach(p => {
    p.classList.remove("activa");
  });
  document.getElementById(id).classList.add("activa");
}

/*********
 * PASO 1 – TÉCNICO
 *********/
function irMateriales() {
  const select = document.getElementById("tecnico");
  tecnicoSeleccionado = select.value;

  if (!tecnicoSeleccionado) {
    alert("Seleccione un técnico");
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

  if (!buscador.value || !cantidad.value || cantidad.value <= 0) {
    alert("Complete material y cantidad");
    return;
  }

  materialesCargados.push({
    codigo: "-",
    descripcion: buscador.value.trim(),
    cantidad: cantidad.value
  });

  renderListaMateriales();

  buscador.value = "";
  cantidad.value = "";
  buscador.focus();
}

function renderListaMateriales() {
  const lista = document.getElementById("lista");
  lista.innerHTML = "";

  materialesCargados.forEach((m, i) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>${m.descripcion}</span>
      <span>${m.cantidad}</span>
    `;
    lista.appendChild(li);
  });
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
  const firma = obtenerFirmaBase64();

  if (!firma || firma.length < 1000) {
    alert("Debe firmar antes de finalizar");
    return;
  }

  const comprobanteHTML = generarComprobante({
    tecnico: tecnicoSeleccionado,
    materiales: materialesCargados,
    firma: firma
  });

  document.getElementById("comprobante").innerHTML = comprobanteHTML;

  alert("Carga exitosa");

  // Reset opcional (comentado por si no querés)
  // resetearFormulario();
}

/*********
 * RESET GENERAL (OPCIONAL)
 *********/
function resetearFormulario() {
  materialesCargados = [];
  tecnicoSeleccionado = "";

  document.getElementById("tecnico").value = "";
  document.getElementById("lista").innerHTML = "";
  limpiarFirma();

  mostrarPantalla("pantallaDatos");
}
