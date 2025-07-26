const sql = require("mssql");

const royalDbConfig = {
   user: 'sa',
  password: 'lis.2010',
  server: '10.0.0.12',
  database: 'royaldb2024',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function getPersonal() {
  try {
    const pool = await new sql.ConnectionPool(royalDbConfig).connect();
    const result = await pool.request().query(`
      SELECT nombre_sin_apellidos, apellido_paterno, apellido_materno
      FROM dbo.personal_personal
    `);
    await pool.close();
    return result.recordset;
  } catch (err) {
    console.error("❌ Error consultando royaldb2024:", err);
    return [];
  }
}

module.exports = { getPersonal };
