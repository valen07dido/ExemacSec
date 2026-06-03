const { loadEnvConfig } = require('@next/env');
const sql = require('mssql');

const { combinedEnv } = loadEnvConfig(__dirname);

console.log('Next.js DB_USER:', combinedEnv.DB_USER);
console.log('Next.js DB_PASSWORD length:', combinedEnv.DB_PASSWORD ? combinedEnv.DB_PASSWORD.length : 0);

const config = {
  user: combinedEnv.DB_USER,
  password: combinedEnv.DB_PASSWORD,
  server: combinedEnv.DB_SERVER,
  port: parseInt(combinedEnv.DB_PORT || '1433'),
  database: combinedEnv.DB_DATABASE,
  options: {
    encrypt: combinedEnv.DB_ENCRYPT === 'true',
    trustServerCertificate: combinedEnv.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
  }
};

sql.connect(config)
  .then(() => {
    console.log('SUCCESS: Connected using Next.js env loader!');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILED: Connection error:', err.message);
    process.exit(1);
  });
