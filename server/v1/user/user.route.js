const express = require('express');
const validate = require('express-validator');
const authGuard = require('../../../middlewares/auth');


const userCtrl = require('./user.controller');

const router = express.Router();

router.route('/sign-up').post(userCtrl.register);
router.route('/login').post(userCtrl.login);
router.route('/guest-login').post(userCtrl.loginAsGuest);
router.route('/get-user-details').get(authGuard, userCtrl.getUserDetails);
router.route('/guest-login-update').post(authGuard, userCtrl.guestLoginUpdate);


module.exports = router;
