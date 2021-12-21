module.exports = class Cart {
    static addToCart(database, obj) {
        const sql ="insert into cart SET ?";
        return database.query(sql, obj);
    }

    static getCartDetails(database, order_id) {
        const sql = "select * from ((select menu_id, count(id) as qty  from cart where order_id =? group by  menu_id) as a left join (select * from menus) as b on a.menu_id = b.id)";
        return database.query(sql, order_id);
    }
}