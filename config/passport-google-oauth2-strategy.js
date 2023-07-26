const passport = require('passport');
const googleStrategy = require('passport-google-oauth').OAuth2Strategy;
const crypto = require('crypto');
const User = require('../models/user');
const Encrypt = require('./bcrypt');




passport.use(new googleStrategy({
    clientID: "5032230248-u251fclhsvepaam4p1cafikofo1fhp4l.apps.googleusercontent.com",
    clientSecret: "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",
    callbackURL: "http://localhost:8000/users/auth/google/callback",
},
    function (accessToken, refreshToken, profile, done) {
        User.findOne({ email: profile.emails[0].value }).then(async function (user) {
            if (user) {
                return done(null, user);
            }
            else {
                const encryptPassword = await Encrypt.cryptPassword(crypto.randomBytes(20).toString('hex'));
                User.create({
                    name: profile.displayName,
                    email: profile.emails[0].value,
                    password: encryptPassword
                }).then(function (user) {
                    if (user) {
                        return done(null, user);
                    }
                }).catch(function (err) {
                    console.log("Error creating a user, google passport strategy", err);
                    return;
                })
            }
        }).catch(function (err) {
            console.log("Error in google strategy passport", err);
            return;
        });
    }
));


module.exports = passport;