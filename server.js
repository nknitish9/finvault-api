const env = require('./src/config/environment');
const { initializeDatabase } = require('./src/config/database');
const app = require('./src/app');

// Initialize database tables
initializeDatabase();

// Start server
const PORT = env.PORT;

app.listen(PORT, () => {
  console.log(`
  ╔═══════════════════════════════════════════╗
  ║         FinVault API Server               ║
  ║─────────────────────────────────────────  ║
  ║  Environment : ${env.NODE_ENV.padEnd(25)} ║
  ║  Port        : ${String(PORT).padEnd(25)} ║
  ║  API Docs    : http://localhost:${PORT}/api-docs  ║
  ╚═══════════════════════════════════════════╝
  `);
});

module.exports = app;
