const { getPersonal } = require("../db/royalDb");
const sql = require("mssql");
const dbConfig = require("../db/config");

const mostrarProyectos = async (req, res) => {
  try {
    const integrantes = await getPersonal();

    res.render("proyectos", {
      title: "Catálogo Proyectos",
      integrantes,
    });
  } catch (error) {
    console.error("Error cargando proyectos:", error);
    res.status(500).send("Error interno");
  }
};

const guardarProyecto = async (req, res) => {
  const {
    nombre,
    descripcion,
    tipo_proyecto,
    departamento,
    area,
    integrantes,
    fecha_inicio,
    fecha_fin,
    porcentaje,
    estatus,
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    if (
      !nombre ||
      !tipo_proyecto ||
      !fecha_inicio ||
      !fecha_fin ||
      isNaN(porcentaje)
    ) {
      return res.status(400).send("Campos obligatorios inválidos");
    }

    if (Number(porcentaje) < 0 || Number(porcentaje) > 100) {
      return res.status(400).send("El porcentaje debe estar entre 0 y 100");
    }

    const inicioDate = new Date(fecha_inicio);
    const finDate = new Date(fecha_fin);
    if (inicioDate > finDate) {
      return res.status(400).send("Fecha de inicio mayor que fecha de fin");
    }

    await pool
      .request()
      .input("nombre", sql.NVarChar(150), nombre)
      .input("descripcion", sql.NVarChar(sql.MAX), descripcion)
      .input("tipo_proyecto", sql.VarChar(20), tipo_proyecto)
      .input("departamento", sql.NVarChar(100), departamento)
      .input("area", sql.NVarChar(sql.MAX), area)
      .input("integrantes", sql.NVarChar(sql.MAX), integrantes)
      .input("fecha_inicio", sql.Date, fecha_inicio || null)
      .input("fecha_fin", sql.Date, fecha_fin || null)
      .input("porcentaje", sql.Int, porcentaje || 0)
      .input("estatus", sql.VarChar(20), estatus) // Asegura que el campo sea "estatus"
      .query(`
        INSERT INTO Proyectos (
          nombre, descripcion, tipo_proyecto, departamento,
          area, integrantes, fecha_inicio, fecha_fin, porcentaje, estatus
        )
        VALUES (
          @nombre, @descripcion, @tipo_proyecto, @departamento,
          @area, @integrantes, @fecha_inicio, @fecha_fin, @porcentaje, @estatus
        )
      `);

    res.status(200).json({ mensaje: "Proyecto guardado correctamente", nombre });
  } catch (err) {
    console.error("❌ Error al guardar proyecto:", err);
    res.status(500).json({ error: "Error al guardar el proyecto" });
  }
};

module.exports = {
  mostrarProyectos,
  guardarProyecto,
};
