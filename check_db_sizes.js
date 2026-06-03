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
    
    // Find products that likely have sizes
    const sample = await pool.request().query(`
      SELECT Codigo, Descripcion, CodAlterno FROM Productos 
      WHERE Descripcion LIKE '% T[0-9]%' OR Descripcion LIKE '% Talle %' OR Descripcion LIKE '% S' OR Descripcion LIKE '% M' OR Descripcion LIKE '% L' OR Descripcion LIKE '% XL'
    `);
    console.log("Products with sizes:");
    console.log(sample.recordset.slice(0, 20));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    sql.close();
  }
}

checkDb();
