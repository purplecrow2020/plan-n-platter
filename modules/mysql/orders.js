module.exports = class Orders {
    static getOrderId(database, user_id) {
        let sql = "select MAX(id) as order_id from orders where  user_id =? and is_completed=0";
        return database.query(sql, user_id);
    }

    static addNewOrder(database, user_id) {
        const obj = {
            user_id,
        }
        const sql = "insert into orders SET  ?";
        return database.query(sql, obj);
    }

    static completeOrder(database, order_id) {
        const sql = "UPDATE orders SET is_completed =1 where order_id = ?";
        return database.query(sql, order_id);
    }
}