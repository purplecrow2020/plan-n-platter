const express = require('express');
const validate = require('express-validator');

const menuCtrl = require('./menu.controller');

const router = express.Router();

router.route('/search-menu-items').post(menuCtrl.getMenuItemSearchRecommendations);



module.exports = router;
