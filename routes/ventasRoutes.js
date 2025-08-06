// routes/ventasRoutes.js

const express = require("express");
const router = express.Router();
const ventasController = require("../controllers/ventasController");

// Ruta principal (interfaz de ventas)
router.get("/", ventasController.renderVistaVentas);

// Ruta para agregar una venta completa
router.post("/agregar", ventasController.agregarVenta);

// Futuras rutas opcionales:
// router.get("/listar", ventasController.listarVentas);
// router.get("/:id", ventasController.detalleVenta);
// router.post("/cancelar/:id", ventasController.cancelarVenta);

module.exports = router;
