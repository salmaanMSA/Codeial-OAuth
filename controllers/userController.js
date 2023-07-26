const User = require('../models/user');
const Encrypt = require('../config/bcrypt');
const crypto = require('crypto');
const PasswordReset = require('../models/password_reset');
const queue = require('../config/kue');
const passwordResetMailer = require('../mailers/reset-password-mailer');
const passwordResetEmailWorker = require('../workers/password_reset_email_worker');

//  Render user signUp Page
module.exports.viewSignUp = function(req, res){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    return res.render('signUp', {title: "SignUp"});
}

// Render User SignIn page
module.exports.viewSignIn = function(req, res){
    if (req.isAuthenticated()){
        return res.redirect('/')
    }
    return res.render('signIn', {title: "SignIn"} );
}

// add new user details
module.exports.addNewUser = async function(req, res){
    // get input details
    let email = req.body.email;
    let password = req.body.password;
    let name = req.body.name;
    let confirmPassword = req.body.repeatpswd;
    var captchaResponse = req.body["g-recaptcha-response"]; // Get captcha response

    const captchaVerfied = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=6Lcc_1cnAAAAAA-sXzzRnJp25YbAX96E5pzGruwo-${captchaResponse}`, {
        method: 'POST',

    }); // api call to verfiy the captcha
    
    // check if user with same email already exists
    let isUserExists = await User.findOne({email: email});
    if (isUserExists){
        return res.redirect('/users/signIn'); // if exists, then redirect to signIn page
    }
    else if (password != confirmPassword){
        req.flash('error', "Password doesnot match with confirm password");
        return res.redirect('back'); // if password deoesnot match with confirm password, redirect to same page
    }
    else if (captchaResponse == '' || captchaVerfied.success === false){
        req.flash('error', "Please Enable Captcha for SignUp");
        return res.redirect('back');
    }
    else{
        const encryptPassword = await Encrypt.cryptPassword(password);
        // create new user to db
        let addUser = await User.create({name: name, email: email, password: encryptPassword});
        if (addUser){
            return res.redirect('/users/signIn'); // redirect to signIN page
        }
        else{
            return res.redirect('back');
        }
    }
}

// create session using passport js authentication
module.exports.createSession = function(req, res){
    req.flash('success', 'Logged In Successfully');
    return res.redirect('/');
}

// destroy session for the user - SignOut
module.exports.signOut = function(req, res){
    req.flash('success', 'Logged Out Successfully');
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/users/signIn');
    });
}

// reset user password after user signed in
module.exports.resetPassword = async function(req, res){
    if (req.isAuthenticated()){
        let password = req.body.password;
        let confirmPassword = req.body.confirmPassword;
        
        // check if password and confirm password matches
        if (password != confirmPassword){
            req.flash('error', "Password not match with confirm password, Try Again");
            res.redirect('back');
        }
        // if password matches
        const encryptPassword = await Encrypt.cryptPassword(password);
        let user = await User.findOne({_id: req.user._id});
        if (user){
            user.password = encryptPassword;
            user.save();
            req.flash('success', "Your password has been reset successfully");
            return res.redirect('back');
        }
        req.flash('error', 'Invalid request || Invalid User');
        return res.redirect('back')
    }
}

// Forget Password Logic
module.exports.forgetPassword = async function(req, res){
    // check for user using email provided
    let user = await User.findOne({email: req.body.email_forget});
    if (user){
        let access_token = crypto.randomBytes(20).toString('hex');
        let resetPass = await PasswordReset.create({
            user: user._id,
            access_token: access_token,
            is_valid: true
        });
        let userDet = {
            userName: user.name,
            userEmail: user.email,
            accessToken: access_token
        }
        // passwordResetMailer.resetPassword(userDet);
        let job = queue.create('resetPasswordEmails', userDet).save(function(err){
            if (err){
                console.log("Error in creating queue");
            }
            console.log(job.id);
        });
        return res.redirect('back');
    }
    else{
        return;
    }
}

// render the reset password page from the link send to mail
module.exports.changePassword = async function(req, res){
    let accessToken = await PasswordReset.findOne({access_token: req.params.access_token});
    if (accessToken){
        // check if the access token is valid
        if (accessToken.is_valid){
            return res.render('resetPassword', 
            {acccessToken: accessToken.access_token, title: 'Reset Password'});
        }
        else{
            console.log("The link is not valid or expired");
            return res.redirect('/');
        }
    }
    else{
        console.log("Invalid Link for resetPassword");
        return res.redirect('/');
    }
}

// updating the password - when user click forget password
module.exports.updatePassword = async function(req, res){
    let password = req.body.password;
    let confirmPassword = req.body.confirmPassword;

    if (password == confirmPassword){
        let token = await PasswordReset.findOne({access_token: req.body.access_token});
        if (token){
            token.is_valid = false;
            token.save();
        }
        const encryptPassword = await Encrypt.cryptPassword(password);
        let user = await User.findByIdAndUpdate(token.user, {password: encryptPassword});

        if (user){
            req.flash('success', 'Password Updated Successfully, Kindly SignIn.....!');
            return res.redirect('back');
        }
        else{
            console.log("Error in updating new password");
            return res.redirect('back');
        }
    }
    else{
        req.flash('error', 'Password and Confirm Passsword Doesnot Match');
        return res.redirect('back');
    }
}