function generarComprobante(datos) {
  const fecha = new Date().toLocaleString("es-AR");

  let materialesHTML = datos.materiales.map(m =>
    `<tr>
      <td>${m.codigo}</td>
      <td>${m.descripcion}</td>
      <td style="text-align:center">${m.cantidad}</td>
    </tr>`
  ).join("");

  return `
  <div style="
    max-width:420px;
    margin:auto;
    border:1px solid #000;
    padding:16px;
    font-family:Arial;
    font-size:12px;
  ">
    <h3 style="text-align:center;margin:0">COMPROBANTE DE ENTREGA</h3>
    <hr>

    <p><strong>Fecha:</strong> ${fecha}</p>
    <p><strong>Técnico:</strong> ${datos.tecnico}</p>

    <table width="100%" border="1" cellspacing="0" cellpadding="4">
      <thead>
        <tr>
          <th>Código</th>
          <th>Material</th>
          <th>Cant.</th>
        </tr>
      </thead>
      <tbody>
        ${materialesHTML}
      </tbody>
    </table>

    <p style="margin-top:16px">Firma del técnico:</p>
    <img src="${datos.firma}" style="width:100%;border-top:1px solid #000">

    <p style="text-align:center;margin-top:10px;font-size:10px">
      Documento generado automáticamente
    </p>
  </div>
  `;
}
