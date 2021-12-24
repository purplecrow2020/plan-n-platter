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
}