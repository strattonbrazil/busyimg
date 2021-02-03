// Load Node modules
var express = require('express');
// Initialise Express
var app = express();
// Render static files
app.use(express.static('build'));

app.get('/i/[a-zA-z0-9\-]+', function (req, res) {
    res.sendFile(__dirname + '/build/index.html');
});

// Port website will run on
console.log("starting server on port: " + process.env.PORT);
app.listen(process.env.PORT);