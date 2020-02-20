const express = require('express')
const app = express()
const port = process.env.PORT || process.argv[2] || 8080

app.set('view engine', 'ejs');

function requireHTTPS(req, res, next) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && process.env.NODE_ENV !== "development") {
        console.log("redirecting to https");
      return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);

app.use("/static", express.static('static'));

app.get('/', (req, res) => {
    res.render('pages/index');
})

console.log(process.env.NODE_ENV);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

