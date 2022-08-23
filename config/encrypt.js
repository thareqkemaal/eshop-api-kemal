const Crypto = require('crypto');
const jwt = require('jsonwebtoken');

module.exports = {
    hashPassword: (pass) => {
        return Crypto.createHmac("sha256", "eshop123").update(pass).digest("hex");
    },
    // middleware untuk membuat token
    createToken: (payload, expiresIn='24h') => {
        return jwt.sign(payload, 'shopping', {
            expiresIn
        });
    },

    readToken: (req, res, next) => {
        console.log('req token', req.token)

        jwt.verify(req.token, 'shopping', (err, decode) => {
            if (err) {
                // dikasih return di err biar bisa stop
                return res.status(401).send({
                    message: "Authenticate Error/Token Expired ❌"
                })
            }

            console.log('Translate Token', decode)

            req.dataToken = decode;

            next();
        })
    }
};

