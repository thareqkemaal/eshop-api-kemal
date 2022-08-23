const express = require('express');
const { readToken } = require('../config/encrypt');
const { uploader } = require('../config/uploader');
const { productController } = require('../controllers')
const route = express.Router();

// konfigurasi uploader
const uploadFile = uploader('/imgProduct', 'IMGPRD').array('images', 1);

route.get('/', productController.getData);
route.post('/addproduct', uploadFile, readToken, productController.addProduct);
route.delete('/:idproducts', readToken, productController.deleteProduct);
route.patch('/:idproducts', readToken, productController.editProduct);
route.post('/:idproducts', readToken, productController.addtoCart);


module.exports = route;