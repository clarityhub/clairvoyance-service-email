const { fanoutQueue } = require('service-claire/services/pubsub');
const { COMMAND_EMAIL_SEND } = require('service-claire/events');
const { scheduleEmail } = require('./controllers/email');

const exchange = `${process.env.NODE_ENV || 'development'}.email`;

fanoutQueue(exchange, 'service-email', (message) => {
  switch (message.event) {
    case COMMAND_EMAIL_SEND:
      scheduleEmail(message.meta);
      break;
    default:
    // Do nothing
  }
});
