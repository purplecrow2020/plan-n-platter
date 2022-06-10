module.exports = class Menu {
    constructor() {

    }

    static getMenuByVendorId(database, vendor_id) {
        let sql = "select * from menus where vendor_id = ?"
        return database.query(sql, vendor_id);
    }

    static getMenuByVendorIdWithOrderDetails(database, vendor_id, order_id) {
        const sql = "select * from ((select * from menus where vendor_id = ? and is_active=1) as a left join (select  menu_id, count(id) as qty from cart where order_id=? and is_ordered !=1 group by menu_id) as b on a.id=b.menu_id)";
        return database.query(sql, [vendor_id,order_id]);
    }
    
    static getItemDetailsByMenuId(database, menu_id) {
        let sql = "select * from menus where id = ?";
        return database.query(sql, menu_id);
    }

    static searchMenu(database, menu_item_search_string) {
        const sql = `select * from menus where name like '%${menu_item_search_string}%'`;
        return database.query(sql);
    }

    static insertItem(database, obj) {
        const sql = "INSERT into menus SET ?";
        return database.query(sql, obj);
    }

    static updatetItem(database, update_obj, id) {
        console.log(update_obj);
        const sql = "UPDATE menus SET ? where id = ?";
        return database.query(sql, [update_obj, id]);
    }
    
    static getMenuCategories(database) {
        const sql = "select * from menu_categories where is_active =1 order by priority asc";
        return database.query(sql);
    }
    
    static deleteItemById(database, menu_item_id) {
        const sql = "DELETE from menus where id = ?";
        return database.query(sql, menu_item_id);
    }
}