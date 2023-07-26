const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user')
const Encrypt = require('../config/bcrypt');
const fetch = require('node-fetch');


// authentication using passport js
passport.use(new LocalStrategy(
    {
        usernameField: 'email',
        passReqToCallback: true
    },
    async function(req, email, password, done){
        var captchaResponse = req.body["g-recaptcha-response"]; // Get captcha response
        const captchaVerfied = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=6Lcc_1cnAAAAAA-sXzzRnJp25YbAX96E5pzGruwo-${captchaResponse}`, {
            method: 'POST',

        }); // api call to verfiy the captcha


        if (captchaResponse == ''){
            req.flash('error', 'Please Enable Captcha'); // throw error msg for not enabling captcha
            return done(null, false);
        }

        // find the user and establish the identity
        User.findOne({email: email}).then(async function(user){
            if(!user){
                req.flash('error', 'Invalid Email'); // throw error msg for invalid email id
                return done(null, false);
            }
            // compare user typed password vs db user password
            const isEncryptedPassworMatch = await Encrypt.comparePassword(password, user.password);
            if (!isEncryptedPassworMatch){
                req.flash('error', 'Incorrect Password'); // throw error msg for incorrect password
                return done(null, false);
            }
            if (captchaVerfied.success === false) {
                req.flash('error', 'Invalid Captcha'); // throw error msg if captcha is not valid
                return done(null, false);
            }
            return done(null, user);
            
        }).catch(function(err){
            req.flash('error', "Error in finding the user ---> passport");
            return done(err);
        });
    }
));


// serialize the user to decide which key is to be kept in the cookies
passport.serializeUser(function(user, done){
    done(null, user.id);
});


// deserialize the user id from the cookie
passport.deserializeUser(function(id, done){
    User.findById(id).then(function(user){
        if (user){
            return done(null, user);
        }
        
    }).catch(function(err){
        console.log("Error in finding the user ---> passport")
        return done(err);
    });
});


//check if the user is authenticated
passport.checkAuthentication = function(req, res, next){
    if (req.isAuthenticated()){
        return next();
    }
    return res.redirect('/users/signIn');
}


passport.setAuthenticatedUser = function(req, res, next){
    if(req.isAuthenticated()){
        res.locals.user = req.user;
    }
    next();
}


// export module
module.exports = passport;
