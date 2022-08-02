const kue = require('kue');
const { settings } = require('service-claire/helpers/config');

const prefix = process.env.NODE_ENV || 'development';

const queue = kue.createQueue({
  prefix: `${prefix}_q`,
  redis: {
    port: settings.redis.port,
    host: settings.redis.host,
    // XXX auth
  },
});

module.exports = queue;
