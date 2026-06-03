require('dotenv').config({ path: '.env.local' });
const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
  },
};

async function checkDb() {
  try {
    const pool = await sql.connect(config);
    
    // Check Columns of Usuarios
    const result = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'Usuarios'
    `);
    console.log("Usuarios columns:");
    console.log(result.recordset.map(r => r.COLUMN_NAME).join(', '));

    // Get a sample user
    const sample = await pool.request().query(`
      SELECT TOP 5 * FROM Usuarios
    `);
    console.log("\nSample users:");
    console.log(sample.recordset);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    sql.close();
  }
}

checkDb();
