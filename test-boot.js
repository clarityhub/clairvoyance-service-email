/* eslint-disable */

const chai = require('chai');
const chaiHttp =  require('chai-http');

const { server } = require('./');
const queue = require('./src/v1_0/queue');

chai.use(chaiHttp);

const SparkPostMockData = {
  lastData: undefined,
};

/*
 * Manually close the server down so that
 * when we run the tests in watch mode, the
 * port doesn't appear to be used
 */
after(done => {
  queue.shutdown(5000, (err) => {
    console.log('Kue shutdown: ', err || '');
    console.log('Closing server...');
    server.close();
    done();
  });

});
