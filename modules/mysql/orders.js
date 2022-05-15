const _ = require('lodash');
const moment = require('moment');
module.exports = class Orders {
    static getOrderId(database, user_id) {
        let sql = "select MAX(id) as order_id from orders where  user_id =? and is_completed=0";
        return database.query(sql, user_id);
    }

    static addNewOrder(database, user_id, vendor_id, table_id) {
        const obj = {
            user_id,
            vendor_id,
            table_id,
        }
        const sql = "insert into orders SET  ?";
        return database.query(sql, obj);
    }

    static completeOrder(database, order_id, payable_amt, discount) {
        const update_obj = {
            is_completed: 1,
            amt_payable: payable_amt,
            discount,
        }
        const sql = "UPDATE orders SET ? where id = ?";
        return database.query(sql, [update_obj, order_id]);
    }

    static getPastOrderIds(database, user_id) {
        const sql ="select * from orders  where user_id=? and is_completed=1 order by created_at desc limit 10";
        return database.query(sql, user_id);
    }

    static getActiveOrderByVendorId(database, vendor_id) {
        const sql = "select * from orders where vendor_id = ? and is_completed = 0 order by created_at desc";
        return database.query(sql, vendor_id);
    }

    static getCompletedOrderByVendorId(database, vendor_id, from_date, to_date) {
        let from_clause = "";
        let to_clause = "";
        if (!_.isEmpty(from_date)) {
            from_clause = `created_at >= '${moment(from_date).format('YYYY-MM-DD')} 00:00:00'`;
        }

        if (!_.isEmpty(to_date)) {
            to_clause = `created_at <= '${moment(to_date).format('YYYY-MM-DD')} 23:59:59'`;
        }
    
        let time_condition_clause = "";
        if (from_clause.length > 0) {
            time_condition_clause += " AND " + from_clause;
        }

        if (to_clause.length > 0) {
            time_condition_clause += " AND " + to_clause;
        }
        const sql = `select * from orders where vendor_id = ${vendor_id} and is_completed = 1 ${time_condition_clause}  order by created_at desc`;
        console.log(sql);
        return database.query(sql);
    }
}