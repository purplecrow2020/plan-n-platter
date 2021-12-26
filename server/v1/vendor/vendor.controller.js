const menuMysql = require('../../../modules/mysql/menu');
const bestsellersMysql = require('../../../modules/mysql/bestSellers');
const orderMysql = require('../../../modules/mysql/orders');

const _ = require('lodash');

async function getMenu(req, res) {
    try {
        const db = req.app.get('db');
        const { vendor_id } = req.params; 
        const user_id =req.user.id;
        let order_id;
        let menuDetails;
        console.log("USER_ID", user_id);
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details[0].order_id != null) {
            order_id = order_details[0]['order_id'];
            menuDetails = await menuMysql.getMenuByVendorIdWithOrderDetails(db.mysql.read, vendor_id, order_id);
        } else {
            menuDetails = await menuMysql.getMenuByVendorId(db.mysql.read, vendor_id);
        }
        console.log("ORDERERERERERERE",order_id)
        const groupedDetails = _.mapValues(_.groupBy(menuDetails, 'category'),
                          clist => clist.map(menuDetails => _.omit(menuDetails, 'category')));
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: groupedDetails,
        };
        res.status(responseData.meta.code).json(responseData);
    }catch(e) { 
        next(e);
    }
}

async function getBestSellers(req, res, next) {
    try {
        const db = req.app.get('db');
        const { vendor_id } = req.params; 
        const bestsellers = await bestsellersMysql.getByVendorId(db.mysql.read, vendor_id);
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: bestsellers,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch(e) {
        next(e);
    }
}


module.exports = {
    getMenu,
    getBestSellers,
}