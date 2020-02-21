import { registerPassport } from "./auth"

const express = require('express')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("no Google auth envs located");
    process.exit(1);
}

const app = express()

const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === "development";

if (IS_DEVELOPMENT) {
    console.log("starting app in development mode");

    registerPassport(passport, "/auth/google/callback");
} else { 
    console.log("starting app in production mode");

    // for some reason on prod the passport callback url is resolving to http, 
    // which fails.  For now hardcoding full path.  :(
    registerPassport(passport, "https://busyimg.com/auth/google/callback");
}



app.use(passport.initialize());

const port = process.env.PORT || process.argv[2] || 8080

app.set('view engine', 'ejs');

function requireHTTPS(req: any, res: any, next: any) {
    // The 'x-forwarded-proto' check is for Heroku
    if (!req.secure && req.get('x-forwarded-proto') !== 'https' && !IS_DEVELOPMENT) {
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
        console.log("valid token");
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

console.log(process.env.NODE_ENV);

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

