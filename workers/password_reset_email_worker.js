const queue = require('../config/kue');
const resetPasswordMailer = require('../mailers/reset-password-mailer');

queue.process('resetPasswordEmails', function(job, done){
    console.log("Email worker is processing a job", job.data);

    resetPasswordMailer.resetPassword(job.data);
    
    done();
});