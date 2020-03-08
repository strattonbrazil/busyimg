import { registerPassport, setUserSession, clearUserSession, isLoggedIn, isUser } from "./auth"
import { isDatabaseConnected, initDatabase, User, BusyImage } from "./database";

const expressNunjucks = require('express-nunjucks');
const express = require('express')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const cookieSession = require('cookie-session')
const fs = require("fs")
const multer = require("multer")
const { Sequelize } = require('sequelize');

const IS_DEVELOPMENT: boolean = process.env.NODE_ENV === "development";

if (IS_DEVELOPMENT) {
    console.log("starting app in development mode");
    if (!process.env.DATABASE_URL) {
        console.log("defaulting to sqlite in-memory database");
        process.env.DATABASE_URL = "sqlite::memory:";
    }
} else { 
    console.log("starting app in production mode");
}

const REQUIRED_ENVS = [
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "DATABASE_URL"
];

for (let key of REQUIRED_ENVS) {
    if (!process.env[key]) {
        console.error("missing required env: " + key);
        process.exit(1);
    }
}

const app = express()

console.log("starting database: " + process.env.DATABASE_URL);
initDatabase(process.env.DATABASE_URL);

registerPassport(passport, "/auth/google/callback");

app.use(passport.initialize());

// returns the port exposed to external requests
function getExternalPort(): number {
    if (process.env.PORT) {
        return parseInt(process.env.PORT, 10);
    } else if (process.argv[2]) {
        return parseInt(process.argv[2], 10);
    } else {
        return 5000;
    }
}
const EXTERNAL_PORT = getExternalPort();

const njk = expressNunjucks(app, {
    watch: IS_DEVELOPMENT,
    noCache: IS_DEVELOPMENT
});

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
    scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
    ]
}));


app.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/'
    }),
    (req: any, res: any) => {
        const email = req.user.profile.emails[0].value;
        setUserSession(req, {
            token: req.user.token,
            email: email,
            provider: "google"
        })

        // save user in database
        User.findOrCreate({
            where: {
                reference: "google:" + email
            }
        }).then(([user, created]: any) => {
            console.log(user.get({
                plain: true
            }))
            console.log(created);
        });
        res.redirect('/');
    }
);

var storage = multer.memoryStorage();
var uploadMem = multer({ 
    storage: storage,
    limits: {
        "fileSize" : 100000 // bytes
    }
});
const upload = uploadMem.single("image");

app.post('/api/upload', (req: any, res: any) => {
    if (!isLoggedIn(req)) {
        res.status(403).send('Invalid user credentials')
    } else {
        upload(req, res, function (err: any) {
            console.log("processing upload")
            if (err instanceof multer.MulterError) {
                console.log("multer error on upload");
                res.status(400).send(err.message);
                // A Multer error occurred when uploading.
            } else if (err) {
                console.log("unknown error on upload");
                res.status(400).send("unknown error");
                // An unknown error occurred when uploading.
            } else {
                fs.writeFileSync('/tmp/foo/'+req.file.originalname, req.file.buffer)
                console.log(" file mem  uploaded: " + req.file.originalname);
                res.send("file mem upload success");
            }
        });
    }
})

app.get('/signout', (req: any, res: any) => {
    clearUserSession(req);
    res.redirect('/');
})

app.get('/upload', (req: any, res: any) => {
    res.render("upload", {
        "logged_in" : isLoggedIn(req)
    })
})

app.get('/', (req: any, res: any) => {
    res.render("home", {
        "logged_in" : isLoggedIn(req)
    });
})

app.get('/busyadmin', async (req: any, res: any, next: Function) => {
    if (isUser(req, "google", "strattonbrazil@gmail.com")) {
        res.render("admin", {
            "db_connected" : isDatabaseConnected()
        });
    } else { // pretend this resource doesn't exist
        console.log("user doesn't exist");
        next();
    }
});

function startBusyImg(port: number) {
    app.listen(port, () => console.log(`Starting busyimg!`));
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
