const express = require('express');
const passport = require('passport');
const { readToken } = require('../config/encrypt');
const { authController } = require('../controllers')
const route = express.Router();

route.get('/', authController.getData);
route.post('/login', authController.login);
route.post('/regis', authController.register);
route.get('/keep', readToken, authController.keepLogin);
route.patch('/verify', readToken, authController.verifyLogin);

// routing for google api
route.get('/google', passport.authenticate('google', {scope:['profile', 'email']}));
route.get('/google/callback', passport.authenticate('google', {
    successRedirect: process.env.FE_URL,
    failureRedirect: process.env.FE_URL+`?message=401_auth_failure`
}));

module.exports = route;