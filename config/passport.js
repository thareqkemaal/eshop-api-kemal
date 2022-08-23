const passport = require('passport');
const { dbConf, dbQuery } = require('./db');
const { hashPassword, createToken } = require('./encrypt');
const { transport } = require('./nodemailer');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const GOOGLE_CLIENT_ID = process.env.GCLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GCLIENT_SECRET;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("PROFILE from Google ✅", profile);

        let username = profile.name.givenName+profile.name.familyName;
        let email = profile.emails[0].value;
        let password = profile.id;

        let sqlInsert = await dbQuery(`Insert Into users (username, email, password) Values 
        (${dbConf.escape(username)},${dbConf.escape(email)},${dbConf.escape(hashPassword(password))});`);

        console.log(sqlInsert);
            if(sqlInsert.insertId){
                let sqlGet = await dbQuery(`SELECT iduser, email, status_id FROM users WHERE iduser = ${dbConf.escape(sqlInsert.insertId)};`)

                // generate token
                let token = createToken({...sqlGet[0]}, '1h');

                // mengirimkan email
                await transport.sendMail({
                    from:'ESHOP ADMIN CARE',
                    to: sqlGet[0].email,
                    subject: 'Verification Email Account',
                    html: `<div>
                    <h3>Click link below</h3>
                    <a href="${process.env.FE_URL}/verification/${token}">Verified Account</a>
                    </div>`
                })
            }

        return done(null, profile);

    } catch (error) {
        console.log(error);
    }
}));

passport.serializeUser((user, done) => {
    //console.log('SerailizerUser', user);
    done(null, user);
})

passport.deserializeUser((obj, done) => {
    //console.log('DeserailizerUser', obj);
    done(null, obj);
})

