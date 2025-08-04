const sql = require("mssql");
const dbConfig = require("../db/config"); // Asegúrate de tener este archivo con tus credenciales

// ==============================
// 📌 Mostrar todos los productos
// ==============================
exports.mostrarProductos = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const resultado = await pool
      .request()
      .query(
        "SELECT * FROM productos WHERE estatus = 1 ORDER BY fecha_producto DESC"
      );

    res.render("productos", { productos: resultado.recordset });
  } catch (err) {
    console.error("❌ Error al mostrar productos:", err);
    res.status(500).send("Error al obtener productos");
  }
};

// ==============================
// 📌 Agregar nuevo producto
// ==============================
exports.agregarProducto = async (req, res) => {
  const {
    cantidad,
    nombre_articulo,
    clave_sat,
    descripcion,
    unidad_sat,
    precio_unitario,
    fecha_producto,
  } = req.body;

  // 🔠 Función para capitalizar cada palabra
  const capitalizar = (texto) =>
    texto
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ") // elimina espacios dobles
      .replace(/\b\w/g, (l) => l.toUpperCase());

  // 🧼 Normaliza y capitaliza el artículo
  const nombreNormalizado = capitalizar(nombre_articulo);

  try {
    const pool = await sql.connect(dbConfig);

    // 🔎 Verificar si ya existe un artículo con ese nombre exacto
    const resultado = await pool.request()
      .input("nombre_articulo", sql.NVarChar, nombreNormalizado)
      .query(`
        SELECT COUNT(*) AS total
        FROM productos
        WHERE LOWER(nombre_articulo) = LOWER(@nombre_articulo) AND estatus = 1
      `);

    if (resultado.recordset[0].total > 0) {
      return res.status(400).json({
        error: `Ya existe un artículo con el nombre "${nombreNormalizado}"`
      });
    }

    // ✅ Insertar nuevo producto si no hay duplicado
    await pool.request()
      .input("cantidad", sql.Int, cantidad)
      .input("nombre_articulo", sql.NVarChar, nombreNormalizado)
      .input("clave_sat", sql.NVarChar, clave_sat)
      .input("descripcion", sql.NVarChar, descripcion)
      .input("unidad_sat", sql.NVarChar, unidad_sat)
      .input("precio_unitario", sql.Decimal(10, 2), precio_unitario)
      .input("fecha_producto", sql.Date, fecha_producto)
      .input("estatus", sql.Bit, 1)
      .query(`
        INSERT INTO productos (
          cantidad, nombre_articulo, clave_sat, descripcion,
          unidad_sat, precio_unitario, fecha_producto, estatus, fecha_registro
        )
        VALUES (
          @cantidad, @nombre_articulo, @clave_sat, @descripcion,
          @unidad_sat, @precio_unitario, @fecha_producto, @estatus, GETDATE()
        )
      `);2222

    res.status(200).json({ mensaje: "Producto guardado correctamente" });
  } catch (error) {
    console.error("❌ Error al guardar producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
};


exports.editarProducto = async (req, res) => {
  const {
    id, // Asegúrate de que venga desde el frontend
    cantidad,
    nombre_articulo,
    clave_sat,
    descripcion,
    unidad_sat,
    precio_unitario,
    fecha_producto
  } = req.body;

  try {
    const pool = await sql.connect(dbConfig);

    await pool.request()
      .input("id", sql.Int, id)
      .input("cantidad", sql.Int, cantidad)
      .input("nombre_articulo", sql.NVarChar, nombre_articulo)
      .input("clave_sat", sql.NVarChar, clave_sat)
      .input("descripcion", sql.NVarChar, descripcion)
      .input("unidad_sat", sql.NVarChar, unidad_sat)
      .input("precio_unitario", sql.Decimal(10, 2), precio_unitario)
      .input("fecha_producto", sql.Date, fecha_producto)
      .query(`
        UPDATE productos
        SET
          cantidad = @cantidad,
          nombre_articulo = @nombre_articulo,
          clave_sat = @clave_sat,
          descripcion = @descripcion,
          unidad_sat = @unidad_sat,
          precio_unitario = @precio_unitario,
          fecha_producto = @fecha_producto
        WHERE id = @id
      `);

    res.json({ mensaje: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("❌ Error al editar producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

// controllers/productosController.js
exports.obtenerEliminados = async (req, res) => {
  const sql = require("mssql");
  const dbConfig = require("../db/config");

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool
      .request()
      .query("SELECT * FROM productos WHERE estatus = 0 ORDER BY fecha_producto DESC");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("Error al obtener eliminados:", error);
    res.status(500).json({ error: "No se pudieron obtener los productos eliminados" });
  }
};

// controllers/productosController.js
exports.reactivarProducto = async (req, res) => {
  const { id } = req.params;
  const sql = require("mssql");
  const dbConfig = require("../db/config");

  try {
    const pool = await sql.connect(dbConfig);
    await pool
      .request()
      .input("id", sql.Int, id)
      .query("UPDATE productos SET estatus = 1 WHERE id = @id");

    res.status(200).json({ mensaje: "Producto reactivado correctamente" });
  } catch (error) {
    console.error("Error al reactivar producto:", error);
    res.status(500).json({ error: "No se pudo reactivar el producto" });
  }
};


// ==============================
// 🗑️ Eliminar (desactivar) producto
// ==============================
exports.eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    await pool
      .request()
      .input("id", sql.Int, id)
      .query("UPDATE productos SET estatus = 0 WHERE id = @id");

    res.status(200).json({ mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ error: "No se pudo eliminar el producto" });
  }
};
