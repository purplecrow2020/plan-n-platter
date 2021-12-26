const express = require('express');
const validate = require('express-validator');
// const paramValidation = require('./routeValidation');
// const AuthMiddleware = require('../../../middlewares/auth');

const orderCtrl = require('./order.controller');
const authGuard = require('../../../middlewares/auth');
const router = express.Router();

router.route('/add-to-cart').post(authGuard, orderCtrl.addToCart);
router.route('/get-cart-details').get(orderCtrl.getCartDetails);
// router.route('/add-to-cart').post(orderCtrl.addItemToCart);
router.route('/delete-cart-item').post(authGuard, orderCtrl.deleteItemFromCart);



module.exports = router;
