const menuMysql = require('../../../modules/mysql/menu');
const bestsellersMysql = require('../../../modules/mysql/bestSellers');
const _ = require('lodash');

async function getMenu(req, res) {
    try {
        const db = req.app.get('db');
        const { vendor_id } = req.params; 
        const menuDetails = await menuMysql.getMenuByVendorId(db.mysql.read, vendor_id);
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