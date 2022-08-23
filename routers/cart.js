const express = require('express');
const { readToken } = require('../config/encrypt');
const { cartController } = require('../controllers')
const route = express.Router();

route.get('/', readToken, cartController.getCart);
route.delete('/:idcarts', readToken, cartController.deleteCart);
route.patch('/:idcarts', readToken, cartController.editCart);

module.exports = route;