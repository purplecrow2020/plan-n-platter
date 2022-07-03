const menuMysql = require('../../../modules/mysql/menu');
const bestsellersMysql = require('../../../modules/mysql/bestSellers');
const orderMysql = require('../../../modules/mysql/orders');
const vendorMysql = require('../../../modules/mysql/vendor');
const cartMysql = require('../../../modules/mysql/cart');
const quickRequestMysql = require('../../../modules/mysql/quickRequests');
const TokenAuth = require('../../../modules/tokenAuth');
const moment = require('moment');


const _ = require('lodash');
const { update } = require('lodash');

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
            menuDetails = await menuMysql.getMenuByVendorIdWithOrderDetails(db.mysql.read, vendor_id, order_id, req.headers['is_request_on_panel']);
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


async function updateMenuItemDetailsByVendor(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            name, 
            category, 
            img_url, 
            price, 
            dietary_flag,
            item_id,
            is_active,
        } = req.body;

        const udpateObj ={};
        if (typeof name !== 'undefined') {
            udpateObj.name = name;
        }

        if (typeof is_active !== 'undefined') {
            udpateObj.is_active = is_active;
        }

        if (typeof category !== 'undefined') {
            udpateObj.category = category;
        }

        if (typeof img_url !== 'undefined') {
            udpateObj.img_url = img_url;
        }

        if (typeof price !== 'undefined') {
            udpateObj.price = price;
        }

        if (typeof dietary_flag !== 'undefined') {
            udpateObj.dietary_flag = dietary_flag;
        }
        const updateDetails = await menuMysql.updatetItem(db.mysql.write, udpateObj, item_id); 
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
        console.log(activeOrders);
        const cartDetailsPromises = [];
        for (let i=0; i < activeOrders.length; i++) {
            let order_id = activeOrders[i]['id'];
            cartDetailsPromises.push(cartMysql.getOrderCompleteDetailsById(db.mysql.read, order_id));
        }

        cartDetailsPromises.push(quickRequestMysql.getUnresolvedRequestsByVendorId(db.mysql.read, vendor_id));
        const resolvedPromises = await Promise.all(cartDetailsPromises);
        const quickRequests = resolvedPromises.pop();
        const orderDetails = resolvedPromises;
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
                            order_time: orderDetail[k]['updated_at'],
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
            order.is_payment_requested = activeOrders[j].is_payment_requested;


            order.details = {
                ordered,
                completed,
            }
            data.push(order);
        }


        for (let i=0; i < data.length; i++) {
            const order = data[i];
            const table_id = order.table_id;
            const quick_request_for_table = quickRequests.filter(x => x.table_id == table_id);
            order.quick_requests  = quick_request_for_table;
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


async function getVendorCompletedOrders(req, res) {
    try {
        const db = req.app.get('db');
        const {
            id: vendor_id,
        } = req.user;

        const {
            from, 
            to,
        } = req.query;

        const completedOrders = await orderMysql.getCompletedOrderByVendorId(db.mysql.read, vendor_id, from, to);
        const cartDetailsPromises = [];
        for (let i=0; i < completedOrders.length; i++) {
            let order_id = completedOrders[i]['id'];
            cartDetailsPromises.push(cartMysql.getOrderCompleteDetailsById(db.mysql.read, order_id));
        }

        const orderDetails = await Promise.all(cartDetailsPromises);
        const data = [];
        for (let j=0; j < orderDetails.length; j++) {
            const orderDetail = orderDetails[j];
            const order = {};
            const details = {};
            for (let k=0; k < orderDetail.length; k++) {
                const menu_id = orderDetail[k].menu_id;
                if (orderDetail[k].menu_id in details) {
                    details[menu_id].qty += 1;
                    details[menu_id].price += Math.floor((details[menu_id].price)/ (details[menu_id].qty-1));
                } else {
                    details[menu_id] = {
                        name: orderDetail[k].name,
                        price: parseInt(orderDetail[k].price),
                        qty: 1,
                    }
                }
            }
            order.user_id = completedOrders[j].user_id;
            order.table_id = completedOrders[j].table_id;
            order.order_id = completedOrders[j].id;
            order.timestamp = moment(completedOrders[j].created_at).add(5, 'h').add(30, 'm').format('MM/DD/YYYY HH:mm:ss');
            order.amt_payable = completedOrders[i].amt_payable;
            order.discount = completedOrders[i].discount;
            order.details = {
             ...details
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
    } catch (e) {
        console.log(e);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: [],
        };
        res.status(responseData.meta.code).json(responseData);
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

async function deleteMenuItem(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            menu_item_id
        } = req.body;

        await menuMysql.deleteItemById(db.mysql.write, menu_item_id);
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

async function completeOrderByMenuItem(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            menu_item_id,
            order_id,  
        } = req.body;

        await cartMysql.completeMenuItemOrder(db.mysql.write, menu_item_id, order_id);
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

async function getVendorSalesMetrics(req, res, next) {
    try {
        const db =req.app.get('db');
        const {
            id: vendor_id
        } = req.user;
        const {
            from, 
            to,
        } = req.body;
    
        const salesMetrics = await orderMysql.getVendorSalesMetrics(db.mysql.read, vendor_id, from, to);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: salesMetrics[0],
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
    } 
   
}


async function getActiveOrdersByVendorTableId(req, res, next) {
    try {
        const db = req.app.get('db');
        const {
            vendor_id,
            table_id,
        } = req.query;
        console.log(vendor_id, table_id)

        const activeOrderByTableDetails = await orderMysql.getActiveOrderDetailsByVendorTable(db.mysql.read, vendor_id, table_id);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: activeOrderByTableDetails,
        };
        res.status(responseData.meta.code).json(responseData);
    } catch (e) {
        console.log(e);
        const responseData = {
            meta: {
                code: 200,
                success: true,
                message: 'Success',
            },
            data: [],
        };
        res.status(responseData.meta.code).json(responseData);
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
    deleteMenuItem,
    completeOrderByMenuItem,
    getVendorCompletedOrders,
    getVendorSalesMetrics,
    getActiveOrdersByVendorTableId,
    updateMenuItemDetailsByVendor,
}