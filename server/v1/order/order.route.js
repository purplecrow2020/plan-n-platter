const express = require('express');
const validate = require('express-validator');
// const paramValidation = require('./routeValidation');
// const AuthMiddleware = require('../../../middlewares/auth');

const orderCtrl = require('./order.controller');

const router = express.Router();

router.route('/add-to-cart').post(orderCtrl.addToCart);
router.route('/get-cart-details').get(orderCtrl.getCartDetails);


module.exports = router;
