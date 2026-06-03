const fs = require('fs');
const path = require('path');
const sql = require('mssql');

// Simple parser for .env.local to see what we are loading
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let value = match[2] || '';
    // remove quotes if any
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[match[1]] = value;
  }
});

console.log('Parsed DB_USER:', env.DB_USER);
console.log('Parsed DB_PASSWORD length:', env.DB_PASSWORD ? env.DB_PASSWORD.length : 0);

// Let's test expanding it like Next.js might
function expand(val) {
  // If there's no expansion logic in Next.js, it is literal.
  // Next.js uses dotenv and dotenv-expand under the hood.
  // dotenv-expand treats $VAR and ${VAR} as variables.
  // In dotenv-expand, to escape a dollar sign, we use \$ (i.e. \$) or \\$.
  return val;
}

const password = env.DB_PASSWORD;
console.log('Password character at index 6 (expecting $):', password[6]);

const config = {
  user: env.DB_USER,
  password: password,
  server: env.DB_SERVER,
  port: parseInt(env.DB_PORT || '1433'),
  database: env.DB_DATABASE,
  options: {
    encrypt: env.DB_ENCRYPT === 'true',
    trustServerCertificate: env.DB_TRUST_CERT === 'true',
    enableArithAbort: true,
  }
};

sql.connect(config)
  .then(() => {
    console.log('SUCCESS: Connected to database using .env.local config!');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILED: Connection error:', err.message);
    process.exit(1);
  });
