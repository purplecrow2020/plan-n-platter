module.exports = class Cart {
    static addToCart(database, obj) {
        const sql ="insert into cart SET ?";
        return database.query(sql, obj);
    }

    static getActiveCartDetails(database, order_id) {
        const sql = "select * from ((select menu_id, count(id) as qty  from cart where order_id =? and is_ordered !=1 group by  menu_id) as a left join (select * from menus) as b on a.menu_id = b.id)";
        return database.query(sql, order_id);
    }

    static getInProgressOrderDetails(database, order_id) {
        const sql = "select * from ((select menu_id, count(id) as qty  from cart where order_id =? and is_ordered=1 and is_completed=0 group by  menu_id) as a left join (select * from menus) as b on a.menu_id = b.id)";
        return database.query(sql, order_id);
    }

    static getCompletedOrderDetails(database, order_id) {
        const sql = "select * from ((select menu_id, count(id) as qty  from cart where order_id =? and is_ordered=1 and is_completed=1 group by  menu_id) as a left join (select * from menus) as b on a.menu_id = b.id)";
        return database.query(sql, order_id);
    }

    static deleteCartItemById(database, order_id, menu_item_id) {
        let sql = "delete from cart where order_id = ? and menu_id = ? order by id asc limit 1";
        return database.query(sql, [order_id, menu_item_id]);
    }   

    static placeOrderAddedItems(database, order_id){
        const sql = "UPDATE cart SET is_ordered=1 where order_id = ?";
        return database.query(sql, order_id);
    }

    static getOrderDetailsById(database, order_id){
        const sql = "select * from ((select menu_id, count(id) as qty from cart where order_id = ? group by menu_id) as a left join (select * from menus) as b on a.menu_id = b.id left join (select id , name as vendor_name, address from vendors) as c on b.vendor_id=c.id)";
        return database.query(sql, order_id);
    }

    static getOrderCompleteDetailsById(database, order_id) {
        const sql = "select * from ((select * from cart where order_id = ?) as a left join (select * from menus) as b on a.menu_id= b.id)";
        return database.query(sql, order_id);
    }

    static completeMenuItemOrder(database, menu_id, order_id) {
        console.log(menu_id, order_id);
        const sql ="UPDATE cart SET is_completed = 1 where order_id = ? and menu_id = ?";
        return database.query(sql, [order_id, menu_id]);
    }
}