// controllers/proyectosController.js
const sql = require("mssql");
const dbConfig = require("../db/config");
const { getPersonal, getAreas } = require("../db/royalDb");

const mostrarProyectos = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM Proyectos");

    const integrantes = await getPersonal();
    const areas = await getAreas();

    res.render("proyectos", {
      title: "Catálogo de Proyectos",
      proyectos: result.recordset,
      integrantes,
      areas,
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
    rama, // 👈 nuevo campo
  } = req.body;
  try {
    if (new Date(fecha_fin) < new Date(fecha_inicio)) {
      return res
        .status(400)
        .json({
          error: "La fecha de fin no puede ser menor que la fecha de inicio.",
        });
    }

    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("nombre", sql.NVarChar, nombre)
      .input("descripcion", sql.NVarChar, descripcion)
      .input("tipo_proyecto", sql.VarChar, tipo_proyecto)
      .input("departamento", sql.NVarChar, departamento)
      .input("area", sql.NVarChar, area)
      .input("integrantes", sql.NVarChar, integrantes)
      .input("fecha_inicio", sql.Date, fecha_inicio)
      .input("fecha_fin", sql.Date, fecha_fin)
      .input("porcentaje", sql.Int, porcentaje)
      .input("estatus", sql.VarChar, estatus)
      .input("rama", sql.NVarChar, rama).query(`INSERT INTO Proyectos
             (nombre, descripcion, tipo_proyecto, departamento, area, integrantes, fecha_inicio, fecha_fin, porcentaje, estatus, rama, fecha_creacion)
              VALUES (@nombre, @descripcion, @tipo_proyecto, @departamento, @area, @integrantes, @fecha_inicio, @fecha_fin, @porcentaje, @estatus, @rama, GETDATE())`);

    res.json({ nombre });
  } catch (error) {
    console.error("Error guardando proyecto:", error);
    res.status(500).json({ error: "Error interno al guardar proyecto" });
  }
};

const editarProyecto = async (req, res) => {
  const {
    id,
    nombre,
    descripcion,
    tipo_proyecto,
    departamento,
    area,
    integrantes,
    rama, // 👈 nuevo
    fecha_fin,
    porcentaje,
    estatus,
  } = req.body;

  try {
    // Obtener la fecha_inicio desde la base de datos para validación
    const pool = await sql.connect(dbConfig);
    const consulta = await pool
      .request()
      .input("id", sql.Int, id)
      .query("SELECT fecha_inicio FROM Proyectos WHERE id = @id");

    const fechaInicioBD = consulta.recordset[0]?.fecha_inicio;
    if (fechaInicioBD && new Date(fecha_fin) < new Date(fechaInicioBD)) {
      return res
        .status(400)
        .json({
          error: "La fecha de fin no puede ser menor que la fecha de inicio.",
        });
    }

    await pool
      .request()
      .input("id", sql.Int, id)
      .input("nombre", sql.NVarChar, nombre)
      .input("descripcion", sql.NVarChar, descripcion)
      .input("tipo_proyecto", sql.VarChar, tipo_proyecto)
      .input("departamento", sql.NVarChar, departamento)
      .input("area", sql.NVarChar, area)
      .input("integrantes", sql.NVarChar, integrantes)
      .input("fecha_fin", sql.Date, fecha_fin)
      .input("porcentaje", sql.Int, porcentaje)
      .input("estatus", sql.VarChar, estatus)
      .input("rama", sql.VarChar, rama).query(`UPDATE Proyectos SET
              nombre = @nombre,
              descripcion = @descripcion,
              tipo_proyecto = @tipo_proyecto,
              departamento = @departamento,
              area = @area,
              integrantes = @integrantes,
              rama = @rama, -- 👈 nuevo campo
              fecha_fin = @fecha_fin,
              porcentaje = @porcentaje,
              estatus = @estatus
            WHERE id = @id`);

    res.json({ success: true });
  } catch (error) {
    console.error("Error actualizando proyecto:", error);
    res.status(500).json({ error: "Error interno al actualizar proyecto" });
  }
};

module.exports = {
  mostrarProyectos,
  guardarProyecto,
  editarProyecto,
};
