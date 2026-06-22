require('dotenv').config();
const app = require('./app');
const { connectDB } = require('./config/db');
const { startAlertJob } = require('./jobs/alert.job');
const alertService = require('./services/alert.service');
const logger = require('./config/logger');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET is not defined');
    process.exit(1);
  }

  await connectDB();
  startAlertJob();

  // Run alert generation immediately on startup so alerts are available right away
  alertService.runAlertGeneration().catch((err) => {
    logger.error('Initial alert generation failed', { message: err.message });
  });

  app.listen(PORT, () => {
    logger.info(`GFMS API running on port ${PORT}`);
    logger.info(`Swagger docs at http://localhost:${PORT}/api/docs`);
  });
};

startServer().catch((error) => {
  logger.error('Failed to start server', { message: error.message });
  process.exit(1);
});
