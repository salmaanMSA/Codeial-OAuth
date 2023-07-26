const nodemailer = require('../config/nodemailer');


exports.resetPassword = (user) => {
    let htmlString = nodemailer.renderTemplate({user: user}, '/reset_password.ejs')

    nodemailer.transporter.sendMail({
        from: 'testusers1997@gmail.com',
        to: user.userEmail,
        subject: "Password Reset Request",
        html: htmlString
    }, (err, info) => {
        if (err){
            console.log("Error in sending mail", err);
            return;
        }
        return;
    });
}