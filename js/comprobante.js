/**
 * LÓGICA DE FORMATEO DE COMPROBANTE
 */
const Comprobante = {
    // Función para crear el bloque de texto de materiales
    formatearMateriales: function(lista) {
        if (lista.length === 0) return "No se registraron materiales.";
        
        let texto = "LISTA DE MATERIALES:\n";
        texto += "----------------------------------\n";
        
        lista.forEach((item, index) => {
            texto += `${index + 1}. [Cód: ${item.codigo}] - ${item.descripcion} (Cant: ${item.cantidad})\n`;
        });
        
        texto += "----------------------------------";
        return texto;
    },

    // Generar un nombre de archivo profesional
    generarNombreArchivo: function(tecnico) {
        const ahora = new Date();
        const fecha = ahora.toLocaleDateString('es-AR').replace(/\//g, '-');
        const hora = ahora.getHours() + "hs" + ahora.getMinutes();
        return `Reporte_${tecnico}_${fecha}_${hora}.pdf`;
    }
};
