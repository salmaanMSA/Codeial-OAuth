// require library and configure the port
const express = require('express');
const path = require('path');
var cookieParser = require('cookie-parser');
const PORT = 8000;
const db = require('./config/mongoose'); // Import mongoose.js file from config dir
const app = express();
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const passport =require('passport');
const passportLocal = require("./config/passport-local-strategy");
const passportGoogle = require("./config/passport-google-oauth2-strategy");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const customMiddleware = require('./config/middleware');



app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

app.use(express.static('./assets'));
app.use(expressLayout);

// extract style and script from sub pages to layout
app.set('layout extractStyles', true);
app.set('layout extractScripts', true);


// setting the view engine to ejs(Similar to django jinja template)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded());
app.use(express.static('assets'));

// using mongo store to store session cookies in db
app.use(session({
   name: 'codeialAuthentication',
   secret: 'something',
   saveUninitialized: false,
   resave: false,
   cookie: {
   maxAge: (1000 * 60 * 100)
   },
   store: MongoStore.create({
   mongoUrl: 'mongodb://localhost/CAuth',
   autoRemove: 'disabled'
   }),
}));
   

app.use(passport.initialize());
app.use(passport.session());

app.use(passport.setAuthenticatedUser);

// set flash
app.use(flash());
app.use(customMiddleware.setFlash);

// use the router
app.use('/', require('./routes'));

// Listening Port and logging success or error msg
app.listen(PORT, function(err){
   if (err) console.log("Error in server setup")
   console.log("Server listening on Port", PORT);
});
