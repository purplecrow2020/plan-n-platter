const express = require('express');
const validate = require('express-validator');
// const paramValidation = require('./routeValidation');
// const AuthMiddleware = require('../../../middlewares/auth');

const vendorCtrl = require('./vendor.controller');

const router = express.Router();

router.route('/get-menu/:vendor_id').get(vendorCtrl.getMenu);
router.route('/get-bestsellers/:vendor_id').get(vendorCtrl.getBestSellers);

module.exports = router;
