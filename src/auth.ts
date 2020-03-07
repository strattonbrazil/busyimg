const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

export function registerPassport(passport: any, callbackURL: string) {
    passport.serializeUser((user: any, done: any) => {
        done(null, user);
    });
    passport.deserializeUser((user: any, done: any) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: callbackURL,
            proxy: true
        },
        (token: any, refreshToken: any, profile: any, done: any) => {
            return done(null, {
                profile: profile,
                token: token
            });
        }));
};

export interface UserSessionData {
    token: string;
    email: string;
    provider: string;
}

export function setUserSession(req: any, userData: UserSessionData) {
    req.session.userData = userData;
}

export function clearUserSession(req: any) {
    req.session = null;
}

export function isUser(req: any, provider: string, email: string): boolean {
    console.log(req.session.userData);
    return isLoggedIn(req) && 
    req.session.userData.provider == provider && 
    req.session.userData.email == email;
}

export function isLoggedIn(req: any): boolean {
    return !!req.session.userData;
}

