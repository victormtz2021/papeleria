const sql = require("mssql");
const dbConfig = require("../db/config"); // Configuración de la conexión a SQL Server

// ==============================
// 📌 Mostrar todos los productos activos
// ==============================
exports.mostrarProductos = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);
    const resultado = await pool
      .request()
      .query("SELECT * FROM productos WHERE estatus = 1 ORDER BY fecha_producto DESC");

    res.render("productos", { productos: resultado.recordset });
  } catch (err) {
    console.error("❌ Error al mostrar productos:", err);
    res.status(500).send("Error al obtener productos");
  }
};

// ==============================
// ➕ Agregar nuevo producto
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

  // 🔠 Capitaliza cada palabra del nombre del artículo
  const capitalizar = (texto) =>
    texto
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const nombreNormalizado = capitalizar(nombre_articulo);

  try {
    const pool = await sql.connect(dbConfig);

    // 🔍 Verifica si ya existe un artículo activo con el mismo nombre
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

    // ✅ Inserta el nuevo producto y devuelve el ID generado
    const resultInsert = await pool.request()
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
        OUTPUT INSERTED.id
        VALUES (
          @cantidad, @nombre_articulo, @clave_sat, @descripcion,
          @unidad_sat, @precio_unitario, @fecha_producto, @estatus, GETDATE()
        )
      `);

    const nuevoId = resultInsert.recordset[0].id;

    // 🔁 Devuelve el ID insertado para usarlo en el frontend
    res.status(200).json({ ok: true, id: nuevoId });
  } catch (error) {
    console.error("❌ Error al guardar producto:", error);
    res.status(500).json({ error: "Error al guardar el producto" });
  }
};

// ==============================
// ✏️ Editar producto existente
// ==============================
exports.editarProducto = async (req, res) => {
  const {
    id,
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

    res.json({ ok: true }); // ✅ El frontend espera { ok: true }
  } catch (error) {
    console.error("❌ Error al editar producto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
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

    res.status(200).json({ ok: true, mensaje: "Producto eliminado correctamente" });
  } catch (error) {
    console.error("❌ Error al eliminar producto:", error);
    res.status(500).json({ error: "No se pudo eliminar el producto" });
  }
};

// ==============================
// ♻️ Reactivar producto eliminado
// ==============================
exports.reactivarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await sql.connect(dbConfig);

    await pool
      .request()
      .input("id", sql.Int, id)
      .query("UPDATE productos SET estatus = 1 WHERE id = @id");

    res.status(200).json({ ok: true, mensaje: "Producto reactivado correctamente" });
  } catch (error) {
    console.error("❌ Error al reactivar producto:", error);
    res.status(500).json({ error: "No se pudo reactivar el producto" });
  }
};

// ==============================
// 📦 Obtener productos eliminados
// ==============================
exports.obtenerEliminados = async (req, res) => {
  try {
    const pool = await sql.connect(dbConfig);

    const result = await pool
      .request()
      .query("SELECT * FROM productos WHERE estatus = 0 ORDER BY fecha_producto DESC");

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error("❌ Error al obtener eliminados:", error);
    res.status(500).json({ error: "No se pudieron obtener los productos eliminados" });
  }
};
