const express = require("express");
const router = express.Router();
const sql = require("mssql");
const dbConfig = require("../db/config");
const { getPersonal, getAreas } = require('../db/royalDb');



// Ruta única y correcta

router.get('/proyectos', async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query('SELECT * FROM Proyectos');

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

module.exports = router;
