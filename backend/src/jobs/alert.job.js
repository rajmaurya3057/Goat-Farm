const cron = require('node-cron');
const alertService = require('../services/alert.service');
const logger = require('../config/logger');

const startAlertJob = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      await alertService.runAlertGeneration();
    } catch (error) {
      logger.error('Alert cron job failed', { message: error.message });
    }
  });

  logger.info('Alert cron job scheduled (daily at midnight)');
};

module.exports = { startAlertJob };
