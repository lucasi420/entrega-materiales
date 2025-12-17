// SPLASH
window.addEventListener("load", () => {
  setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
  }, 2000);
});

// ====== PASO 1 - TÉCNICO ======
const inputTecnico = document.getElementById("inputTecnico");
const listaTecnicos = document.getElementById("listaTecnicos");
const btnTecnico = document.getElementById("btnTecnico");

let tecnicoSeleccionado = "";
let materialesCargados = [];

inputTecnico.addEventListener("input", () => {
  listaTecnicos.innerHTML = "";
  const texto = inputTecnico.value.toLowerCase();

  if (!texto) return;

  TECNICOS.filter(t => t.toLowerCase().includes(texto))
    .forEach(t => {
      const li = document.createElement("li");
      li.textContent = t;
      li.onclick = () => {
        tecnicoSeleccionado = t;
        inputTecnico.value = t;
        listaTecnicos.innerHTML = "";
        btnTecnico.disabled = false;
      };
      listaTecnicos.appendChild(li);
    });
});

btnTecnico.onclick = () => {
  document.getElementById("paso-tecnico").classList.add("hidden");
  document.getElementById("paso-materiales").classList.remove("hidden");
};

// ====== PASO 2 - MATERIALES ======
const inputMaterial = document.getElementById("inputMaterial");
const listaMateriales = document.getElementById("listaMateriales");
const resumen = document.getElementById("resumen");

inputMaterial.addEventListener("input", () => {
  listaMateriales.innerHTML = "";
  const texto = inputMaterial.value.toLowerCase();
  if (!texto) return;

  MATERIALES.filter(m =>
    m.codigo.includes(texto) ||
    m.nombre.toLowerCase().includes(texto)
  ).slice(0, 20).forEach(m => {
    const li = document.createElement("li");
    li.textContent = ${m.codigo} - ${m.nombre};
    li.onclick = () => agregarMaterial(m);
    listaMateriales.appendChild(li);
  });
});

function agregarMaterial(material) {
  const cantidad = prompt("Cantidad a cargar:");
  if (!cantidad || cantidad <= 0) return;

  materialesCargados.push({
    ...material,
    cantidad: Number(cantidad)
  });

  actualizarResumen();
  inputMaterial.value = "";
  listaMateriales.innerHTML = "";
}

function actualizarResumen() {
  resumen.innerHTML = "";
  materialesCargados.forEach((m, i) => {
    const li = document.createElement("li");
    li.textContent = ${m.codigo} - ${m.nombre} → ${m.cantidad};
    li.onclick = () => {
      if (confirm("¿Eliminar este material?")) {
        materialesCargados.splice(i, 1);
        actualizarResumen();
      }
    };
    resumen.appendChild(li);
  });
}

document.getElementById("btnFirma").onclick = () => {
  if (materialesCargados.length === 0) {
    alert("No hay materiales cargados");
    return;
  }
  document.getElementById("paso-materiales").classList.add("hidden");
  document.getElementById("paso-firma").classList.remove("hidden");
};

// ====== PASO 3 - FIRMA ======
const canvas = document.getElementById("canvasFirma");
const ctx = canvas.getContext("2d");
let firmando = false;

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

canvas.addEventListener("touchstart", e => {
  firmando = true;
  ctx.moveTo(e.touches[0].clientX - canvas.offsetLeft,
             e.touches[0].clientY - canvas.offsetTop);
});

canvas.addEventListener("touchmove", e => {
  if (!firmando) return;
  ctx.lineTo(e.touches[0].clientX - canvas.offsetLeft,
             e.touches[0].clientY - canvas.offsetTop);
  ctx.stroke();
});

canvas.addEventListener("touchend", () => firmando = false);

document.getElementById("btnFinalizar").onclick = () => {
  alert("Carga exitosa ✔️\n\nComprobante listo para generar.");
  // Próximo paso: generar imagen + enviar a Drive
};
