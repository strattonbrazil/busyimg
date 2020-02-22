import { registerPassport } from "./auth"

const express = require('express')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const https = require("https")
const fs = require("fs")

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("no Google auth envs located");
    process.exit(1);
}

const app = express()

const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === "development";

if (IS_DEVELOPMENT) {
    console.log("starting app in development mode");
} else { 
    console.log("starting app in production mode");
}

registerPassport(passport, "/auth/google/callback");

app.use(passport.initialize());

const port = process.env.PORT || process.argv[2] || 8080

app.set('view engine', 'ejs');

function requireHTTPS(req: any, res: any, next: any) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        console.log("redirecting to https: " + req.url);
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
}

app.use(requireHTTPS);

app.use("/static", express.static('static'));

app.use(cookieSession({
    name: 'session',
    keys: ['AHuXy5kB4w1iMxzRBrctNTo6oP1u9mDT']
}));

app.use(cookieParser());

app.get('/auth/google', passport.authenticate('google', {
    scope: ['https://www.googleapis.com/auth/userinfo.profile']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req: any, res: any) => {
        console.log(JSON.stringify(req.user));
        req.session.token = req.user.token;
        res.redirect('/');
    }
);

app.get('/signout', (req: any, res: any) => {
    req.session.token = null;
    res.redirect('/');
})

app.get('/', (req: any, res: any) => {
    if (req.session.token) {
        //console.log("valid token");
        //res.cookie('token', req.session.token);
        //res.json({
        //   status: 'session cookie set'
        //});
    } else {
        //console.log("no valid token");
        //res.cookie('token', '')
        //res.json({
        //    status: 'session cookie not set'
        //});
    }

    res.render('pages/index', {
        "logged_in" : !!req.session.token
    });
})

// create a simple HTTPS server for local use so it behaves similar to prod
function getHttpsListener(): number {
    if (!IS_DEVELOPMENT) { throw Error("starting prod environment with dummy certs") }

    const dummyKey = fs.readFileSync('./dummy/key.pem');
    const dummyCert = fs.readFileSync('./dummy/cert.pem');
    return https.createServer({key: dummyKey, cert: dummyCert }, app);
}

const listener = IS_DEVELOPMENT ? 
    getHttpsListener() :
    app;
listener.listen(port, () => console.log(`Example app listening on port ${port}!`))

