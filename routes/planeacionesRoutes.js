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



router.get("/proyectos/ramas", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
    SELECT ISNULL(rama, 'Sin asignar') AS rama, COUNT(*) AS total
    FROM Proyectos
    WHERE bandera = 'activo'
    GROUP BY ISNULL(rama, 'Sin asignar');

    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener proyectos por rama:", err);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});


router.get("/proyectos/ramas-indicadores", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT rama, estatus, COUNT(*) AS total
      FROM Proyectos
      WHERE bandera = 'activo'
      GROUP BY rama, estatus
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener estadísticas por rama/indicador:", err);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

router.get("/proyectos/integrantes-rama", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT 
        TRIM(value) AS integrante,
        rama,
        COUNT(*) AS total,
        STRING_AGG(nombre, ', ') AS proyectos
      FROM Proyectos
      CROSS APPLY STRING_SPLIT(integrantes, ';')
      WHERE bandera = 'activo'
      GROUP BY TRIM(value), rama
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error al obtener datos por integrante y rama:", err);
    res.status(500).json({ error: "Error al obtener datos" });
  }
});

// Esta se usa solo para llenar el <select>
router.get("/proyectos/ramasPdf", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query(`
      SELECT DISTINCT ISNULL(rama, 'Sin asignar') AS rama
      FROM Proyectos
      WHERE bandera = 'activo'
    `);

    const ramas = result.recordset.map(row => row.rama);
    res.json(ramas);
  } catch (err) {
    console.error("Error al obtener ramas:", err);
    res.status(500).json({ error: "Error al obtener las ramas" });
  }
});


router.get("/proyectos/resumen-rama-integrantes", async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    // Trae todos los campos necesarios
    const result = await pool.request().query(`
      SELECT nombre, rama, integrantes, porcentaje, estatus AS indicador
      FROM Proyectos
      WHERE bandera = 'activo'
    `);

    const registros = result.recordset;
    const resumen = {};

    for (const row of registros) {
      const rama = row.rama || "Sin asignar";
      const integrantes = (row.integrantes || "").split(";").map(i => i.trim()).filter(i => i);

      const proyecto = {
        nombre: row.nombre,
        porcentaje: row.porcentaje || 0,
        indicador: row.indicador || "Sin estado"
      };

      for (const integrante of integrantes) {
        if (!resumen[rama]) resumen[rama] = {};
        if (!resumen[rama][integrante]) resumen[rama][integrante] = [];

        resumen[rama][integrante].push(proyecto);
      }
    }

    // Reformatear para frontend
    const salida = [];
    for (const rama in resumen) {
      for (const integrante in resumen[rama]) {
        salida.push({
          rama,
          integrante,
          proyectos: resumen[rama][integrante]
        });
      }
    }

    res.json(salida);
  } catch (err) {
    console.error("Error generando resumen por rama:", err);
    res.status(500).json({ error: "Error generando resumen por rama" });
  }
});

module.exports = router;
