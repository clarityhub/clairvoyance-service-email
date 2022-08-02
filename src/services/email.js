const { settings } = require('service-claire/helpers/config');
const SparkPost = require('sparkpost');

const client = new SparkPost(settings.mail.sparkpost.api_key);

module.exports = {
  send(...args) {
    // Support multiple email clients
    return client.transmissions.send(...args);
  },
};
