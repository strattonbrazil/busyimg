const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

export function registerPassport(passport: any) {
    passport.serializeUser((user: any, done: any) => {
        done(null, user);
    });
    passport.deserializeUser((user: any, done: any) => {
        done(null, user);
    });
    passport.use(new GoogleStrategy({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback"
        },
        (token: any, refreshToken: any, profile: any, done: any) => {
            return done(null, {
                profile: profile,
                token: token
            });
        }));
};