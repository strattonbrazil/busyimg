import { registerPassport } from "./auth"

const express = require('express')
const exphbs  = require('express-handlebars');
const passport = require('passport')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
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

// returns the port exposed to external requests
function getExternalPort(): number {
    if (process.env.PORT) {
        return parseInt(process.env.PORT, 10);
    } else if (process.argv[2]) {
        return parseInt(process.argv[2], 10);
    } else {
        return 8080;
    }
}
const EXTERNAL_PORT = getExternalPort();

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

function requireHTTPS(req: any, res: any, next: any) {
    // The 'x-forwarded-proto' check is for Heroku proxy
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

function isLoggedIn(req: any): boolean {
    return !!req.session.token;
}

app.get('/upload', (req: any, res: any) => {
    res.render("upload", {
        "logged_in" : isLoggedIn(req)
    })
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

    res.render("home", {
        "logged_in" : isLoggedIn(req)
    });
})

function startBusyImg(port: number) {
    app.listen(port, () => console.log(`Starting busyimg on port ${port}!`));
}

// run local server through HTTPS proxy so it behaves similarly to Heroku environment
if (IS_DEVELOPMENT) {
    const proxiedPort = 9090; // don't hit this directly
    startBusyImg(proxiedPort);

    const httpProxy = require('http-proxy')

    httpProxy.createServer({
        target: {
            host: 'localhost',
            port: proxiedPort
        },
        ssl: {
            key: fs.readFileSync('./dummy/key.pem', 'utf8'),
            cert: fs.readFileSync('./dummy/cert.pem', 'utf8')
        },
        xfwd: true // add X-Forward-* headers as Heroku does
    }).listen(EXTERNAL_PORT);

    console.log("open your browser to: https://localhost:" + EXTERNAL_PORT);
} else {
    startBusyImg(EXTERNAL_PORT);
}
