const express = require('express');

const router = express.Router();

// route requiremets
const vendorRoutes = require('./vendor/vendor.route');
const orderRoutes = require('./order/order.route');
const menuRoutes = require('./menu/menu.route');
const userRoutes = require('./user/user.route');


// router usages
router.get('/health-check', (req, res) => res.send('OK2'));
router.use('/vendor', vendorRoutes);
router.use('/order', orderRoutes);
router.use('/menu', menuRoutes);
router.use('/user', userRoutes);



module.exports = router;
