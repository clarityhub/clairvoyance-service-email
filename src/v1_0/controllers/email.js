const queue = require('../queue');
const Handlebars = require('handlebars');
const mail = require('../../services/email');
const getTemplate = require('../../templates');
const { settings } = require('service-claire/helpers/config');
const logger = require('service-claire/helpers/logger');

const scheduleEmail = (data) => {
  // XXX add retry logic
  queue.create('email', {
    subject: data.subject,
    from: data.from || 'support@clarityhub.io',
    html: data.html,
    template: data.template,
    data: data.data,
    to: data.to,
  }).save((err) => {
    if (err) {
      // XXX we could not make the job to send the
      // email, what do we do?
      // Should we just attempt to send the
      // email ourselves?
      logger.error(err);
    }
  });
};

// TODO refactor
const sendEmail = (data, done) => {
  let { html } = data;
  if (data.template) {
    getTemplate(data.template).then((raw) => {
      const fullData = Object.assign({}, data.data, {
        appUrl: settings.appUrl,
      });

      html = Handlebars.compile(raw)(fullData);

      const options = {
        content: {
          from: data.from,
          subject: data.subject,
          html,
        },
        recipients: [
          { address: data.to },
        ],
      };

      mail.send(options).then(() => {
        done();
      }).catch((err) => {
        logger.error(err);
        // XXX re-queue with a delay
        done(err);
      });
    }).catch((err) => {
      logger.error(err);
      done(err);
    });
  } else {
    const options = {
      content: {
        from: data.from,
        subject: data.subject,
        html,
      },
      recipients: [
        { address: data.to },
      ],
    };

    // if (process.env.NODE_ENV !== 'production') {
    //   options.options = {
    //     sandbox: true,
    //   };
    // }

    mail.send(options).then(() => {
      done();
    }).catch((err) => {
      // XXX re-queue with a delay
      logger.error(err);
      done(err);
    });
  }
};

module.exports = {
  scheduleEmail,
  sendEmail,
};
