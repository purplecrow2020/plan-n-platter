const userMysql = require('../../../modules/mysql/user');
const _ = require('lodash');
const genUsername = require("unique-username-generator");
const TokenAuth = require('../../../modules/tokenAuth');

async function login(req, res) {
    try {
        const db = req.app.get('db');
        const config = req.app.get('config');
        const {
            mobile, 
            password
        } = req.body;

        const userDetails = await userMysql.getUserByEmailPwd(db.mysql.read, mobile, password);
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
                authKey: token
            },
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}

async function loginAsGuest(req, res) {
    try {
        const db = req.app.get('config');
        const insert_obj = {
            mobile: req.body.udid,
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
                authKey: token
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
    loginAsGuest
}