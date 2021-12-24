const express = require('express');

const router = express.Router();

// route requiremets
const vendorRoutes = require('./vendor/vendor.route');
const orderRoutes = require('./order/order.route');
const menuRoutes = require('./menu/menu.route');

// router usages
router.get('/health-check', (req, res) => res.send('OK2'));
router.use('/vendor', vendorRoutes);
router.use('/order', orderRoutes);
router.use('/menu', menuRoutes);



module.exports = router;
