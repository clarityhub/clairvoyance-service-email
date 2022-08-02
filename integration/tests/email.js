const chai = require('chai');
const sinon = require('sinon');
const { createConnection } = require('service-claire/services/pubsub');
const redis = require('service-claire/services/redis');
const { COMMAND_EMAIL_SEND } = require('service-claire/events');

const Email = require('../../src/services/email');
require('../../src/index');

const { expect } = chai;

describe('Email 1.0', () => {
  const exchange = `${process.env.NODE_ENV || 'development'}.email`;
  let connection;
  let channel;
  let stub;

  beforeEach((done) => {
    createConnection().then((c) => {
      connection = c;
      return c.createChannel();
    }).then((ch) => {
      return ch.assertExchange(exchange, 'fanout', { durable: false }).then(() => {
        channel = ch;

        // The real subscription might not have finished yet
        redis.flushdb(() => {
          setTimeout(done, 1000);
        });
      });
    }).catch(console.log);
  });

  afterEach((done) => {
    if (stub) {
      stub.restore();
    }
    connection.close().then(done);
  });

  it('sends an email when it receives an event', (done) => {
    const obj = {
      event: COMMAND_EMAIL_SEND,
      ts: new Date(),
      meta: {
        from: 'support@clarityhub.io',
        to: 'ivan@clarityhub.io',
        html: '<html>Test</html>',
        subject: 'test',
      },
    };

    stub = sinon.stub(Email, 'send').callsFake((data) => {
      expect(data.content.from).to.be.equal('support@clarityhub.io');
      expect(data.recipients[0].address).to.be.equal('ivan@clarityhub.io');

      done();
      return Promise.resolve({});
    });

    channel.publish(exchange, '', Buffer.from(JSON.stringify(obj)));
  });

  it('sends an onboarding email', (done) => {
    const obj = {
      event: COMMAND_EMAIL_SEND,
      ts: new Date(),
      meta: {
        to: 'ivan@clarityhub.io',
        subject: 'Welcome to clarityhub!',
        template: 'onboarding',
        data: {
          name: 'Ivan Montiel',
          accountName: 'Shrimp Pimp',
        },
      },
    };

    stub = sinon.stub(Email, 'send').callsFake((data) => {
      try {
        expect(data.content.from).to.be.equal('support@clarityhub.io');
        expect(data.recipients[0].address).to.be.equal('ivan@clarityhub.io');
        expect(data.content.html).to.be.contain('Ivan Montiel');
        expect(data.content.html).to.be.contain('Shrimp Pimp');

        done();
      } catch (e) {
        done(e);
      }
      return Promise.resolve({});
    });

    channel.publish(exchange, '', Buffer.from(JSON.stringify(obj)));
  });

  it('sends an invite email', (done) => {
    const obj = {
      event: COMMAND_EMAIL_SEND,
      ts: new Date(),
      meta: {
        to: 'aloukianova@clarityhub.io',
        subject: 'You\'ve been invited to Clarity Hub!',
        template: 'invite',
        data: {
          name: 'Anna',
          accountName: 'Shrimp Pimp',
          inviterEmail: 'ivan@clarityhub.com',
          inviterName: 'Ivan Montiel',
        },
      },
    };

    sinon.stub(Email, 'send').callsFake((data) => {
      try {
        expect(data.content.from).to.be.equal('support@clarityhub.io');
        expect(data.recipients[0].address).to.be.equal('aloukianova@clarityhub.io');
        expect(data.content.html).to.be.contain('Ivan Montiel');
        expect(data.content.html).to.be.contain('Shrimp Pimp');
        expect(data.content.html).to.be.contain('Anna');

        done();
      } catch (e) {
        done(e);
      }
      return Promise.resolve({});
    });

    channel.publish(exchange, '', Buffer.from(JSON.stringify(obj)));
  });

  it.skip('sends a billing receipt', (done) => {
    done({ error: 'Not implemented' });
  });
});
