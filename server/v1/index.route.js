const express = require('express');

const router = express.Router();

// route requiremets
const vendorRoutes = require('./vendor/vendor.route');

// router usages
router.get('/health-check', (req, res) => res.send('OK2'));
router.use('/vendor', vendorRoutes);

module.exports = router;
