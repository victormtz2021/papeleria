// controllers/ventasController.js

const path = require("path");

// Renderiza la vista de ventas (ventas.ejs)
exports.renderVistaVentas = (req, res) => {
  try {
    // Puedes pasar datos opcionales si deseas (ej. lista de productos)
    res.render("ventas", {
      titulo: "Punto de Venta",
      usuario: req.session?.usuario || null // si usas sesiones
    });
  } catch (error) {
    console.error("❌ Error al cargar vista de ventas:", error);
    res.status(500).send("Error al mostrar la vista de ventas");
  }
};

// Aquí después se agregará la lógica para guardar la venta
exports.agregarVenta = async (req, res) => {
  // Aquí irá la lógica para guardar en ventas y detalle_venta
  res.json({ ok: true, mensaje: "Venta registrada (prototipo)" });
};
