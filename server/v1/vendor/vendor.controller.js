const menuMysql = require('../../../modules/mysql/menu');
const bestsellersMysql = require('../../../modules/mysql/bestSellers');
const orderMysql = require('../../../modules/mysql/orders');
const vendorMysql = require('../../../modules/mysql/vendor');
const cartMysql = require('../../../modules/mysql/cart');
const quickRequestMysql = require('../../../modules/mysql/quickRequests');
const TokenAuth = require('../../../modules/tokenAuth');



const _ = require('lodash');

async function getMenu(req, res, next) {
    try {
        const db = req.app.get('db');
        const { vendor_id } = req.params; 
        const user_id =req.user.id;
        let order_id;
        let menuDetails;
        const order_details = await orderMysql.getOrderId(db.mysql.read, user_id);
        if (order_details && order_details[0].order_id != null) {
            order_id = order_details[0]['order_id'];
            menuDetails = await menuMysql.getMenuByVendorIdWithOrderDetails(db.mysql.read, vendor_id, order_id);
        } else {
            menuDetails = await menuMysql.getMenuByVendorId(db.mysql.read, vendor_id);
        }
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

async function getVendorDetails(req, res, next) {
    try {
        const db = req.app.get('db');
        const { vendor_id } = req.params; 
        const vendorDetails = await vendorMysql.getVendorById(db.mysql.read, vendor_id);
        responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: vendorDetails[0],
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
        next(e);
    }
}


async function login(req, res, next) {
    try {
        const db = req.app.get('db');
        const config =  req.app.get('config');
        const {
            username,
            password,
        } = req.body;

        const vendorDetails = await vendorMysql.getVendorByUsernamePassword(db.mysql.read, username, password);
        if (!_.isEmpty(vendorDetails)) {
            const responseData = {
                meta: {
                    code: 200,
                    success: true,
                    message: 'Success',
                },
                data: {
                    authKey: TokenAuth.create(vendorDetails[0].id, config),
                    ...vendorDetails[0],
                }
            };
            res.status(responseData.meta.code).json(responseData);
        } else {
            throw new Error ("no vendor as such exists");
        }
    } catch (e) {
        console.log(e);
        next(e);
    }
}


async function addMenuItems(req, res, next) {
    try {
        const db = req.app.get('db'); 
        const {
            name, 
            category, 
            img_url, 
            price, 
            dietary_flag,
        } = req.body;
        const vendor_id = req.user.id;
        const insertObj ={
            vendor_id, 
            name, 
            category, 
            img_url, 
            price, 
            dietary_flag,
        }

        const insertDetails = await menuMysql.insertItem(db.mysql.write, insertObj);
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
        next(e);
    }
}

async function addMenuItemToBestsellers(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            menu_id
        } = req.body;

        const {
            id: vendor_id
        } = req.user;
        const rating = 4.3;
        const insertObj = {
            vendor_id, 
            menu_id,
            rating
        };

        const insertDetails = await bestsellersMysql.addMenuItem(db.mysql.write, insertObj);
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
        next(e);
    } 
}

async function getVendorActiveOrders(req, res, next) {
    try {   
        const db = req.app.get('db');
        const {
            id: vendor_id
        } = req.user;
        const activeOrders = await orderMysql.getActiveOrderByVendorId(db.mysql.read, vendor_id);
        const cartDetailsPromises = [];
        for (let i=0; i < activeOrders.length; i++) {
            let order_id = activeOrders[i]['id'];
            cartDetailsPromises.push(cartMysql.getOrderCompleteDetailsById(db.mysql.read, order_id));
        }

        const orderDetails = await Promise.all(cartDetailsPromises);
        const data = [];
        for (let j=0; j < orderDetails.length; j++) {
            const orderDetail = orderDetails[j];
            const order = {};
            const ordered = {};
            const completed = {};
            for (let k=0; k < orderDetail.length; k++) {
                const menu_id = orderDetail[k].menu_id;
                if (orderDetail[k].is_ordered == 1 && orderDetail[k].is_completed == 0) {
                    if (orderDetail[k].menu_id in ordered) {
                        ordered[menu_id].qty += 1;
                        ordered[menu_id].price += Math.floor((ordered[menu_id].price)/ (ordered[menu_id].qty-1));
                    } else {
                        ordered[menu_id] = {
                            name: orderDetail[k].name,
                            price: parseInt(orderDetail[k].price),
                            qty: 1,
                        }
                    }
                }

                if (orderDetail[k].is_ordered == 1 && orderDetail[k].is_completed == 1) {
                    if (orderDetail[k].menu_id in completed) {
                        completed[menu_id].qty += 1;
                        completed[menu_id].price += Math.floor((completed[menu_id].price)/ (completed[menu_id].qty-1));
                    } else {
                        completed[menu_id] = {
                            name: orderDetail[k].name,
                            price: parseInt(orderDetail[k].price),
                            qty: 1,
                        }
                    }
                }
            }
            order.user_id = activeOrders[j].user_id;
            order.table_id = activeOrders[j].table_id;
            order.order_id = activeOrders[j].id;
            order.details = {
                ordered,
                completed,
            }
            data.push(order);
        }

        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data,
        };
        res.status(responseData.meta.code).json(responseData);
        // console.log(orderDetails);
    } catch (e) {
        console.log(e);
        next(e);
    }
}


async function getMenuCategories(req, res, next) {
    try {
        const db = req.app.get('db');
        const categories = await menuMysql.getMenuCategories(db.mysql.read);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: categories,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
        next(e);
    }
}

async function getQuickRequests(req, res, next) {
    try {
        const db =req.app.get('db');
        const {
            id: vendor_id
        } = req.user;

        const requests = await quickRequestMysql.getUnresolvedRequestsByVendorId(db.mysql.read, vendor_id);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: requests,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    }
}


module.exports = {
    getMenu,
    getBestSellers,
    getVendorDetails,
    login,
    addMenuItems,
    addMenuItemToBestsellers,
    getVendorActiveOrders,
    getMenuCategories,
    getQuickRequests,
}