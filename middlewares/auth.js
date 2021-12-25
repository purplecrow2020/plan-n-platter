
const userMysql = require('../modules/mysql/user');
const tokenAuth = require('../modules/tokenAuth');
const _ = require('lodash');

async function authGuard(req, res, next) {
    try {
        const db = req.app.get('db');
        const config = req.app.get('config');
        const authKey = req.headers['x-auth-token'];
        if (typeof authKey !='undefined') {
            const payload = tokenAuth.verify(config, authKey);
            const user_id = payload['id'];
            const userDetails = await userMysql.getUserById(db.mysql.read, user_id);
            console.log(userDetails);
            if (!_.isEmpty(userDetails)){
                req.user = userDetails[0];
                next();
            } else {
                throw new Error("no user with this id");
            }
        } else {
            throw new Error("no key specified");
        }
    } catch (e) {
        console.log(e);
        const responseData = {
            meta: {
                code: 401,
                success: false,
                message: 'Unauthorized',
            },
            data: 'Unauthorized',
        };
        return res.status(responseData.meta.code).json(responseData);
    }   
}

module.exports = authGuard;