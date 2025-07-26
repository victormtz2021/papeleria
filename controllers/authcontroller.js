// controllers/authController.js
const bcrypt = require('bcryptjs');
const sql = require('mssql'); // ✅ Importación corregida
const dbConfig = require('../db/config');

const login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const pool = await sql.connect(dbConfig);
    const result = await pool.request()
      .input('usuario', sql.NVarChar, usuario)
      .query('SELECT * FROM login WHERE usuario = @usuario AND estatus = 1');

    if (result.recordset.length === 0) {
      return res.render('login', { error: 'Usuario no encontrado o inactivo' });
    }

    const user = result.recordset[0];
    const match = await bcrypt.compare(contrasena, user.contrasena);

    if (!match) {
      return res.render('login', { error: 'Contraseña incorrecta' });
    }

    req.session.usuario = user.usuario;
    req.session.rol = user.rol;

    res.redirect('/dashboard');
  } catch (err) {
    console.error('Error en login:', err);
    res.render('login', { error: 'Error interno del servidor' });
  }
};

const logout = (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
};

module.exports = { login, logout };
