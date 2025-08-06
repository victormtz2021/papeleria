// Importa Express y el Router
const express = require("express");
const router = express.Router();

// Importa el controlador de productos
const productosController = require("../controllers/productosController");

// ==========================
// 🔽 Rutas del catálogo POS
// ==========================

// 🧾 Mostrar el catálogo de productos
router.get("/", productosController.mostrarProductos);

// ➕ Agregar un nuevo producto (desde JS con fetch)
router.post("/agregar", productosController.agregarProducto);
router.put("/editar", productosController.editarProducto);

// Otras rutas...
router.get("/eliminados", productosController.obtenerEliminados);
router.post("/reactivar/:id", productosController.reactivarProducto);
// routes/productosRoutes.js
router.post("/eliminar/:id", productosController.eliminarProducto);


router.get("/buscar/:termino", productosController.buscarProducto);

module.exports = router;
