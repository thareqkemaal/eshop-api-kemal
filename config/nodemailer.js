const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'thareqkemal03@gmail.com',
        pass:'urcjrkscuquciedt'
    }
});

module.exports = {
    transport
}