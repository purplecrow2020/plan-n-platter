const express = require('express');
const validate = require('express-validator');
const authGuard = require('../../../middlewares/auth');
// const paramValidation = require('./routeValidation');
// const AuthMiddleware = require('../../../middlewares/auth');

const vendorCtrl = require('./vendor.controller');

const router = express.Router();

router.route('/get-menu/:vendor_id').get(authGuard, vendorCtrl.getMenu);
router.route('/get-bestsellers/:vendor_id').get(vendorCtrl.getBestSellers);

module.exports = router;
