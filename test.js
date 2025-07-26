const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'lis.2010',
  server: '10.0.0.12',
  port: 1433,
  database: 'royaldb2024',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function testConnection() {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT TOP 1 * FROM dbo.personal_personal');
    console.log('Conexión correcta. Resultado:', result.recordset);
  } catch (err) {
    console.error('Error de conexión:', err);
  }
}

testConnection();
