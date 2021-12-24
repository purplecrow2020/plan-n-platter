
const orderMysql = require('../../../modules/mysql/orders');
const cartMysql = require('../../../modules/mysql/cart');
const menuMysql = require('../../../modules/mysql/menu');

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


async function addItemToCart(req, res, next) {
    try {
        const user_id = 1;
        const db = req.app.get('db');
        const {
            menu_item_id
        } = req.body;
        let order_id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details.length > 0) {
            order_id = order_details[0]['order_id'];
        } else {
            throw new Error("no order id asccociated")
        }
        const cartItemObj = {
            user_id,
            order_id,
            menu_item_id,
        }
        await cartMysql.addToCart(db.mysql.write, {...cartItemObj});
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: null,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (E) {
        console.log(E);
    }
}

async function deleteItemFromCart(req, res, next) {
    try {
        const user_id =1;
        const db = req.app.get('db');
        const {
            menu_item_id
        } = req.body;
        // order id 
        let order_id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details.length > 0) {
            order_id = order_details[0]['order_id'];
        } else {
            throw new Error('no order started');
        }
        await cartMysql.deleteCartItemById(db.mysql.write, order_id, menu_item_id);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: null,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (E) {
        console.log(E);
    }
}




module.exports = {
    addToCart,
    getCartDetails,
    addItemToCart,
    deleteItemFromCart,
}