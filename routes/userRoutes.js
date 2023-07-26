const express = require('express');
const userController = require('../controllers/userController');
const passport = require('passport');


const router = express.Router();


router.get('/signin', userController.viewSignIn); // view user signin page
router.get('/signup', userController.viewSignUp); // view user signup page
router.post('/create_user', userController.addNewUser); // create new user

// create session router for passport js authentication
router.post('/create-session', passport.authenticate(
    'local',
    { failureRedirect: '/users/signIn' }
), userController.createSession);

router.get('/signOut', userController.signOut); // signout user
router.post('/reset-password', userController.resetPassword); // reset user password

// google oauth2 routes
router.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate(
    'google', { failureRedirect: '/users/SignIn' }), userController.createSession);

router.post('/forget_password', userController.forgetPassword); // forget password
router.get('/change-password/:access_token', userController.changePassword); // render reset password page
router.post('/updatePassword', userController.updatePassword); // update the password

module.exports = router;