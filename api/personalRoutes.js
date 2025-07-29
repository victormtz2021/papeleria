// api/personalRoutes.js
const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { royalDbConfig } = require("../db/royalDb");

// ✅ Ruta para obtener todos los integrantes de un área específica
router.get("/integrantes-por-area/:id", async (req, res) => {
  const idArea = req.params.id;
  try {
    const pool = await sql.connect(royalDbConfig);
    const result = await pool.request().input("idArea", sql.Int, idArea).query(`
      SELECT p.nombre, p.apellido_paterno, p.apellido_materno
  FROM personal_personal p
  INNER JOIN dbo.general_departamentos gd
    ON p.id_area = gd.id_area AND p.id_depto = gd.id_depto
  WHERE p.id_area = @idArea
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al obtener integrantes por área:", err);
    res.status(500).json({ error: "Error al obtener integrantes" });
  }
});

// ✅ Ruta adicional para obtener lista de áreas
router.get("/areas", async (req, res) => {
  try {
    const pool = await sql.connect(royalDbConfig);
    const result = await pool.request().query(`
      SELECT DISTINCT id_area, descripcion AS nombre
      FROM dbo.general_departamentos
      ORDER BY descripcion
    `);
    res.json(result.recordset);
  } catch (err) {
    console.error("❌ Error al obtener áreas:", err);
    res.status(500).json({ error: "Error al obtener áreas" });
  }
});

module.exports = router;
