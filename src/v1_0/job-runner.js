const queue = require('./queue');
const { sendEmail } = require('./controllers/email');
const logger = require('service-claire/helpers/logger');

const batchAmount = 10;

// XXX add retry logic

// XXX pause processing between jobs
// ctx.pause( 5000, function(err){
//     console.log("Worker is paused... ");
//     setTimeout( function(){ ctx.resume(); }, 10000 );
//   });
queue.process('email', batchAmount, (job, done) => {
  sendEmail(job.data, done);
});

queue.watchStuckJobs(1000);

process.once('SIGTERM', () => {
  queue.shutdown(5000, (err) => {
    logger.error('Kue shutdown: ', err || '');
    process.exit(0);
  });
});

module.exports = queue;
