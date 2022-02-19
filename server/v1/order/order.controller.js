
const orderMysql = require('../../../modules/mysql/orders');
const cartMysql = require('../../../modules/mysql/cart');
const menuMysql = require('../../../modules/mysql/menu');
const quickRequestMysql = require('../../../modules/mysql/quickRequests');
const { required } = require('joi');
const _ = require('lodash');

async function addToCart(req, res, next) {
    try {
        const db = req.app.get('db');
        const user_id = req.user.id;
        const {
            menu_id, 
        } = req.body;

        const {
            vendor_id, 
            table_id,
        } = req.headers;
        let order_id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details[0].order_id != null) {
            order_id = order_details[0]['order_id'];
        } else {
            // get vendor id by menu_id
            order_id = await orderMysql.addNewOrder(db.mysql.read, user_id, vendor_id, table_id).then(r=>r.insertId);
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
        const user_id = req.user.id;
        let order_id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details[0].order_id != null) {
            order_id = order_details[0]['order_id'];
        } else {
            throw new Error("no order id");
        }
        let total_qty = 0;
        let total_bill = 0;
        const promises = [];
        promises.push(cartMysql.getActiveCartDetails(db.mysql.read, order_id));
        promises.push(cartMysql.getInProgressOrderDetails(db.mysql.read, order_id));
        promises.push(cartMysql.getCompletedOrderDetails(db.mysql.read, order_id));

        const [
            activeCartDetails, 
            inProgressOrderDetails,
            completedOrderDetails,
        ] = await Promise.all(promises);


        for (let i=0; i < activeCartDetails.length; i++) {
            total_qty += activeCartDetails[i]['qty'];
            total_bill += activeCartDetails[i]['qty'] * activeCartDetails[i]['price']
        }

        for (let i=0; i < inProgressOrderDetails.length; i++) {
            total_qty += inProgressOrderDetails[i]['qty'];
            total_bill += inProgressOrderDetails[i]['qty'] * inProgressOrderDetails[i]['price']
        }

        for (let i=0; i < completedOrderDetails.length; i++) {
            total_qty += completedOrderDetails[i]['qty'];
            total_bill += completedOrderDetails[i]['qty'] * completedOrderDetails[i]['price']
        }
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: {
                details: {
                    to_order: activeCartDetails,
                    in_progress: inProgressOrderDetails,
                    completed: completedOrderDetails,
                },
                total_qty, 
                total_bill
            },
        };
        res.status(responseData.meta.code).json(responseData);
    } catch(e) {
        console.log(e);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: {
                details: null,
                total_qty: 0, 
                total_bill:0
            },
        };
        res.status(responseData.meta.code).json(responseData);
    }
}


// async function addItemToCart(req, res, next) {
//     try {
//         const user_id = 1;
//         const db = req.app.get('db');
//         const {
//             menu_item_id
//         } = req.body;
//         console.log("sdsdasdasdasdA",body);
//         let order_id;
//         const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
//         if (order_details && order_details.length > 0) {
//             order_id = order_details[0]['order_id'];
//         } else {
//             throw new Error("no order id asccociated")
//         }
//         const cartItemObj = {
//             user_id,
//             order_id,
//             menu_id: menu_item_id,
//         }
//         console.log(cartItemObj);
//         await cartMysql.addToCart(db.mysql.write, {...cartItemObj});
//         const responseData = {
//             meta: {
//                 code: 200,
//                 success: true,
//                 message: 'Success',
//             },
//             data: null,
//         };
//         res.status(responseData.meta.code).json(responseData);
//     } catch (E) {
//         console.log(E);
//     }
// }

async function deleteItemFromCart(req, res, next) {
    try {
        const user_id = req.user.id;;
        const db = req.app.get('db');
        const {
            menu_item_id
        } = req.body;
        // order id 
        let order_id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details[0].order_id != null) {
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



async function placeOrder(req, res, next){
    try {
        const db = req.app.get('db');
        const user_id = req.user.id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details[0].order_id != null) {
            order_id = order_details[0]['order_id'];
        } else {
            throw new Error("ADD ITEMS TO CART FIRST");
        }

        await cartMysql.placeOrderAddedItems(db.mysql.write, order_id);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: null,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}


async function completePayment(req, res, next) {
    try {
        const db = req.app.get('db');
        const user_id = req.user.id;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details[0].order_id != null) {
            order_id = order_details[0]['order_id'];
        } else {
            throw new Error("ADD ITEMS TO CART FIRST");
        }

        await orderMysql.completeOrder(db.mysql.read, order_id);
        const responseData = {
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


async function getOrderHistory(req, res, next) {
    try {
        const db = req.app.get('db');
        const user_id =  req.user.id;
        const orders = await orderMysql.getPastOrderIds(db.mysql.read, user_id);
        const orderDetailsPromises = [];
        for (let i=0; i < orders.length; i++) {
            orderDetailsPromises.push(cartMysql.getOrderDetailsById(db.mysql.read, orders[i]['id']));
        }
        const orderDetails = await Promise.all(orderDetailsPromises);
        const response = [];
        for (let i=0; i < orderDetails.length; i++) {
            let vendor_name = orderDetails[0][0]['vendor_name'];
            let vendor_address = orderDetails[0][0]['address'];
            let order_string = "";
            let bill_string = orders[i]['bill_amount'];

            for(let j=0; j < orderDetails[i]. length; j++) {
                if (j == orderDetails[i].length-1) {
                    order_string += `${orderDetails[i][j]['name']} ✖ (${orderDetails[i][j]['qty']})`;
                } else {
                    order_string += `${orderDetails[i][j]['name']} ✖ (${orderDetails[i][j]['qty']}),`;
                }
            }
            response.push({
                vendor_name, 
                vendor_address,
                order_string,
                bill_string
            });
        }

        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: response,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}

async function registerQuickRequest(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            id, 
        } = req.user;

        const {
            vendor_id, 
            table_id,
        } = req.headers;

        const {
            request
        } = req.body;

        const obj = {
            user_id: id, 
            vendor_id,
            table_id, 
            request,
        }
        const requestsResponse = await quickRequestMysql.addNewRequest(db.mysql.write, obj);

        const responseData = {
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
        next(e);
    }
}

async function resolveQuickRequest(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            request_id
        } = req.body;

        await quickRequestMysql.resolveRequestById(db.mysql.write, request_id);
        const responseData = {
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
        next(e);
    }
}

module.exports = {
    addToCart,
    getCartDetails,
    // addItemToCart,
    deleteItemFromCart,
    placeOrder,
    completePayment,
    getOrderHistory,
    registerQuickRequest,
    resolveQuickRequest,
}