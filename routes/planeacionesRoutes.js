const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../db/config");
const { getPersonal, getAreas } = require('../db/royalDb');


// 👇 Importa el controlador de proyectos
const { guardarProyecto,editarProyecto} = require("../controllers/proyectosController");
// Ruta única y correcta

router.get('/proyectos', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM Proyectos WHERE bandera = 'activo'");

    const integrantes = await getPersonal();
    const areas = await getAreas(); // <- nuevo nombre

    res.render('proyectos', {
      title: 'Catálogo de Proyectos',
      proyectos: result.recordset,
      integrantes,
      areas // <- pasar a EJS
    });
  } catch (err) {
    console.error('Error al obtener proyectos o integrantes:', err);
    res.status(500).send('Error al cargar proyectos');
  }
});

// ✅ Ruta para guardar proyecto desde el frontend
router.post("/proyectos/agregar", guardarProyecto);

// ✅ Ruta para editar proyecto desde el frontend
router.put("/proyectos/editar", editarProyecto);


// Otras rutas siguen igual
router.get("/tareas", (req, res) => {
  res.render("tareas", {
    title: "Tareas",
    usuario: req.session.usuario,
  });
});

router.get("/actividades", (req, res) => {
  res.render("actividades", {
    title: "Actividades",
    usuario: req.session.usuario,
  });
});


router.put("/proyectos/eliminar/:id", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, req.params.id)
      .query("UPDATE Proyectos SET bandera = 'eliminado' WHERE id = @id");

    res.json({ success: true });
  } catch (error) {
    console.error("Error eliminando proyecto:", error);
    res.status(500).json({ error: "No se pudo eliminar el proyecto" });
  }
});

router.get("/proyectos/eliminados", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query(`SELECT id, nombre, rama, descripcion, tipo_proyecto FROM Proyectos WHERE bandera = 'eliminado'`);
    res.json(result.recordset);
  } catch (error) {
    console.error("Error obteniendo eliminados:", error);
    res.status(500).json({ error: "Error al obtener proyectos eliminados" });
  }
});


router.put("/proyectos/restaurar/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input("id", sql.Int, id)
      .query(`UPDATE Proyectos SET bandera = 'activo' WHERE id = @id;

              SELECT * FROM Proyectos WHERE id = @id;`);

    res.json(result.recordset[0]); // ← Esto es clave
  } catch (err) {
    console.error("Error al restaurar proyecto:", err);
    res.status(500).json({ error: "Error al restaurar proyecto" });
  }
});



module.exports = router;
