const express = require("express");
const router = express.Router();
const usuariosController = require("../controllers/usuariosController");

router.get("/", usuariosController.mostrarUsuarios);
router.post("/agregar", usuariosController.agregarUsuario);
router.post("/editar", usuariosController.editarUsuario);
router.post("/eliminar", usuariosController.eliminarUsuario);
router.get("/eliminados", usuariosController.mostrarUsuariosEliminados);

module.exports = router;
