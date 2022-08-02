const fs = require('fs');
const path = require('path');

/**
 This map exists so that we don't have to use
 any folder grepping which might accidentally
 pose a security risk.
 */
const map = {
  invite: 'invite.html',
  onboarding: 'onboarding.html',
  forgot: 'forgot.html',
  'new-user': 'new-user.html',
  'billing-change': 'billing-change.html',
  'new-chat': 'new-chat.html',
};

const getTemplate = (requested) => {
  const template = map[requested];

  return new Promise((resolve, reject) => {
    if (template) {
      fs.readFile(path.join(__dirname, template), { encoding: 'utf8' }, (err, data) => {
        resolve(data);
      });
    } else {
      reject(new Error({
        reason: 'Template not found',
      }));
    }
  });
};

module.exports = getTemplate;
