// Require the library
const mongoose = require('mongoose');

// connect to database
mongoose.connect(`mongodb://localhost/CAuth`);


// acquire the connection (to check connection is successfull)
const db = mongoose.connection;


// message on connection error
db.on('error', console.error.bind(console, "Error connecting to MongoDB"));


// message on connection success
db.once('open', function(){
   console.log("Connected to MongoDB");
});