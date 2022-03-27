const userMysql = require('../../../modules/mysql/user');
const menuMysql = require('../../../modules/mysql/menu');
const _ = require('lodash');
const genUsername = require("unique-username-generator");
const TokenAuth = require('../../../modules/tokenAuth');
const req = require('express/lib/request');

async function login(req, res) {
    try {
        const db = req.app.get('db');
        const config = req.app.get('config');
        const {
            mobile, 
            password
        } = req.body;

        const userDetails = await userMysql.getUserByEmailPwd(db.mysql.read, mobile, password);
        console.log(userDetails);
        let user_id;
        if (!_.isEmpty(userDetails)) {
            //  token generated
            user_id = userDetails[0]['id'];
        } else {
            // wrong
            throw new Error("no user exists");
        }

        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: {
                authKey: TokenAuth.create(user_id, config),
                username: userDetails[0]['name']
            },
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
        const responseData = {
            meta: {
                code: 403,
                success: false,
                message: 'Failure',
            },
            data: null
        };
        res.status(responseData.meta.code).json(responseData);
    }
}


async function register(req, res) {
    try {
        const db = req.app.get('db');
        const config = req.app.get('config');
        const {
            mobile,
            name, 
            email_id,
            password
        } = req.body;

        const insert_obj = {
            mobile,
            name, 
            email_id,
            password
        };
        const insertedResponse = await userMysql.insertNewUser(db.mysql.write, insert_obj);
        const user_id = insertedResponse.insertId;
        const token = TokenAuth.create(user_id, config);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: {
                authKey: token,
                username: insert_obj.name,
            },
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}

async function loginAsGuest(req, res) {
    try {
        const db = req.app.get('db');
        const config = req.app.get('config');
        const insert_obj = {
            // mobile: req.body.udid,
            email_id: req.body.udid,
            name: genUsername.generateUsername("", 0, 10)
        };
        const insertedResponse = await userMysql.insertNewUser(db.mysql.write, insert_obj);
        const user_id = insertedResponse.insertId;
        const token = TokenAuth.create(user_id, config);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: {
                authKey: token,
                username: insert_obj.name
            },
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}

async function guestLoginUpdate(req, res, next) {
    try {
        const db = req.app.get('db');
        const config = req.app.get('config');
        const updateObj = {
            mobile: req.body.mobile,
            password: req.body.password,
        };
        const updateResponse = await userMysql.updateGuestLoginDetails(db.mysql.write, req.user.id, updateObj);
        const token = TokenAuth.create(req.user.id, config);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: {
                authKey: token,
            },
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}

async function getUserDetails(req, res, next) {
    try {
        const db = req.app.get('db');
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: {
                ...req.user
            },
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}



module.exports = {
    login,
    register,
    loginAsGuest,
    getUserDetails,
    guestLoginUpdate
}