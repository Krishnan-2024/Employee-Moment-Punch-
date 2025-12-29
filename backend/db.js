/**
 * SQL Server connection using SQL Authentication
 * Stable with Node.js v22
 * Database: AttendanceDB
 */

const sql = require("mssql");

const config = {
  user: "attendance_app",          // Dedicated application user
  password: "Attend@2025!",
  server: "SSTLCHDES-107",
  database: "AttendanceDB",
  port: 1433,

  options: {
    encrypt: false,                // On-prem SQL Server
    trustServerCertificate: true
  },

  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Create and export connection pool
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log("✅ SQL Server connected successfully");
    return pool;
  })
  .catch(err => {
    console.error("❌ SQL Server connection failed:", err.message);
    process.exit(1);
  });

module.exports = {
  sql,
  pool: poolPromise
};
