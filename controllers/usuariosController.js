const sql = require("mssql");
const dbConfig = require("../db/config");

const bcrypt = require("bcrypt");

exports.mostrarUsuarios = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request().query("SELECT * FROM login where estatus=1");
    res.render("usuarios", { usuarios: result.recordset });
  } catch (error) {
    console.error("Error al mostrar usuarios:", error);
    res.status(500).send("Error al obtener usuarios");
  }
};

exports.agregarUsuario = async (req, res) => {
  const { nombre_completo, correo, usuario, contrasena, rol } = req.body;
  const hash = await bcrypt.hash(contrasena, 10);

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("nombre_completo", sql.NVarChar, nombre_completo)
      .input("correo", sql.NVarChar, correo)
      .input("usuario", sql.NVarChar, usuario)
      .input("contrasena", sql.NVarChar, hash)
      .input("rol", sql.NVarChar, rol)
      .input("estatus", sql.Bit, 1)
      .query(`
        INSERT INTO login (nombre_completo, correo, usuario, contrasena, rol, estatus, fecha_registro)
        VALUES (@nombre_completo, @correo, @usuario, @contrasena, @rol, @estatus, GETDATE())
      `);

    res.status(200).json({ mensaje: "Usuario guardado correctamente" });
  } catch (error) {
    if (error.number === 2627) {
      // Código SQL Server para clave duplicada
      res.status(400).json({ error: "Ya existe un usuario con ese correo o nombre de usuario" });
    } else {
      console.error("Error al agregar usuario:", error);
      res.status(500).json({ error: "Error interno al agregar usuario" });
    }
  }
};


exports.editarUsuario = async (req, res) => {
  const { id, nombre_completo, correo, rol } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, id)
      .input("nombre_completo", sql.NVarChar, nombre_completo)
      .input("correo", sql.NVarChar, correo)
      .input("rol", sql.NVarChar, rol)
      .query(`
        UPDATE login SET nombre_completo=@nombre_completo, correo=@correo, rol=@rol
        WHERE id=@id
      `);
    res.redirect("/usuarios");
  } catch (error) {
    console.error("Error al editar usuario:", error);
    res.status(500).send("Error al editar usuario");
  }
};

exports.eliminarUsuario = async (req, res) => {
  const { id } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    await pool.request()
      .input("id", sql.Int, id)
      .query("UPDATE login SET estatus = 0 WHERE id = @id");
    res.redirect("/usuarios");
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).send("Error al eliminar usuario");
  }
};

exports.mostrarUsuariosEliminados = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .query("SELECT nombre_completo, usuario, correo, rol, fecha_baja FROM login WHERE estatus = 0 ORDER BY fecha_baja DESC");

    res.json(result.recordset); // devolvemos como JSON para el modal
  } catch (error) {
    console.error("Error al obtener usuarios eliminados:", error);
    res.status(500).json({ error: "Error al cargar usuarios eliminados" });
  }
};
