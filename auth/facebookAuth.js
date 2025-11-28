import dotenv from "dotenv";
dotenv.config();  

import passport from 'passport';
import { Strategy as FacebookStrategy } from 'passport-facebook';

passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    callbackURL: process.env.FB_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'emails']
  },
  function(accessToken, refreshToken, profile, done) {
    console.log(profile);
    return done(null, profile);
  }
));

export default passport;
