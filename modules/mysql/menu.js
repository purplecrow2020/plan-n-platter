module.exports = class Menu {
    constructor() {

    }

    static getMenuByVendorId(database, vendor_id) {
        let sql = "select * from menus where vendor_id = ?"
        return database.query(sql, vendor_id);
    }
    
    static getItemDetailsByMenuId(database, menu_id) {
        let sql = "select * from menus where id = ?";
        return database.query(sql, menu_id);
    }

    static searchMenu(database, menu_item_search_string) {
        const sql = `select * from menus where name like '%${menu_item_search_string}%'`;
        return database.query(sql);
    }
}