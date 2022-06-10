const express = require('express');
const validate = require('express-validator');
// const paramValidation = require('./routeValidation');
// const AuthMiddleware = require('../../../middlewares/auth');

const orderCtrl = require('./order.controller');
const authGuard = require('../../../middlewares/auth');
const router = express.Router();

router.route('/add-to-cart').post(authGuard, orderCtrl.addToCart);
router.route('/get-cart-details').get(authGuard, orderCtrl.getCartDetails);
// router.route('/add-to-cart').post(orderCtrl.addItemToCart);
router.route('/delete-cart-item').post(authGuard, orderCtrl.deleteItemFromCart);
router.route('/place-order').post(authGuard, orderCtrl.placeOrder);
router.route('/complete-order').post(authGuard, orderCtrl.completePayment);
router.route('/past-orders-summary').get(authGuard, orderCtrl.getOrderHistory);
router.route('/quick-request').post(authGuard, orderCtrl.registerQuickRequest);
router.route('/resolve-quick-request').post(authGuard, orderCtrl.resolveQuickRequest);
router.route('/initiate-payment-request').post(authGuard, orderCtrl.initiateRequestForPayment);



module.exports = router;
