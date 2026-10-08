import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.log(`===============================================`);
  console.log(`🏋️  FITNESS GOLD API SERVER RUNNING            `);
  console.log(`🚀  Port: ${config.port}                        `);
  console.log(`🌍  Environment: ${config.nodeEnv}             `);
  console.log(`📡  Health check: http://localhost:${config.port}/api/health`);
  console.log(`===============================================`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
