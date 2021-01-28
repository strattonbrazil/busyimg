// Load Node modules
var express = require('express');
// Initialise Express
var app = express();
// Render static files
app.use(express.static('build'));
// Port website will run on
console.log("starting server on port: " + process.env.PORT);
app.listen(process.env.PORT);