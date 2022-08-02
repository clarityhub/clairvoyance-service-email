const express = require('express');
const bodyParser = require('body-parser');

require('./v1_0/subscriptions');
require('./v1_0/job-runner');
const routes = require('./routes');
const { settings } = require('service-claire/helpers/config');
const helmet = require('service-claire/middleware/helmet');
const errorHandler = require('service-claire/middleware/errors');
const logger = require('service-claire/helpers/logger');

logger.register('18adf5b707e4d55a621ec070b67c2f9d');

const app = express();

app.enable('trust proxy');
app.use(helmet());
app.use(bodyParser.json());
app.use('/email', routes);
app.use(errorHandler);

const server = app.listen(
  settings.port,
  () => logger.log(`✅ 📬 service-email running on port ${settings.port}`)
);


module.exports = { app, server }; // For testing
