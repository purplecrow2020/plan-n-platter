const express = require('express');
const validate = require('express-validator');
const authGuard = require('../../../middlewares/auth');
const vendorGuard = require('../../../middlewares/vendorAuth.js');
// const paramValidation = require('./routeValidation');
// const AuthMiddleware = require('../../../middlewares/auth');

const vendorCtrl = require('./vendor.controller');

const router = express.Router();

router.route('/get-menu/:vendor_id').get(authGuard, vendorCtrl.getMenu);
router.route('/get-bestsellers/:vendor_id').get(vendorCtrl.getBestSellers);
router.route('/get-vendor-details/:vendor_id').get(vendorCtrl.getVendorDetails);
router.route('/login').post(vendorCtrl.login);
router.route('/add-menu-item').post(vendorGuard, vendorCtrl.addMenuItems);
router.route('/add-bestsellers').post(vendorGuard, vendorCtrl.addMenuItemToBestsellers);
router.route('/get-active-orders').get(vendorGuard, vendorCtrl.getVendorActiveOrders);
router.route('/get-menu-categories').get(vendorGuard, vendorCtrl.getMenuCategories);
router.route('/get-unresolved-quick-requests').get(vendorGuard, vendorCtrl.getQuickRequests);
router.route('/delete-menu-item').post(vendorGuard, vendorCtrl.deleteMenuItem);
router.route('/completed-menu-item-order').post(vendorGuard, vendorCtrl.completeOrderByMenuItem);




module.exports = router;
