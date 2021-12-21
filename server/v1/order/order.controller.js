
const orderMysql = require('../../../modules/mysql/orders');
const cartMysql = require('../../../modules/mysql/cart');

async function addToCart(req, res, next) {
    try {
        const user_id =1;
        const db = req.app.get('db');
        const {
            menu_id, 
        } = req.body;
        let order_id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details.length > 0) {
            order_id = order_details[0]['order_id'];
        } else {
            order_id = await orderMysql.addNewOrder(db.mysql.read, user_id).then(r=>r.insertId);
        }
        const cartItemObj = {
            user_id: user_id,
            menu_id: parseInt(menu_id),
            order_id: order_id
        }; 
        await cartMysql.addToCart(db.mysql.write, cartItemObj);
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: null,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch(e) {
        console.log(e);
    }
}

async function getCartDetails(req, res, next) {
    try {
        const {
        } = req.body;
        const db = req.app.get('db');
        const user_id = 1;
        let order_id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details.length > 0) {
            order_id = order_details[0]['order_id'];
        }
        
        const cartDetails = await cartMysql.getCartDetails(db.mysql.read, order_id);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: cartDetails,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch(e) {
        console.log(e);
    }
}




module.exports = {
    addToCart,
    getCartDetails,
}