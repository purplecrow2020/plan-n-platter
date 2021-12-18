module.exports = class Menu {
    constructor() {

    }

    static getMenuByVendorId(database, vendor_id) {
        let sql = "select * from menus where vendor_id = ?"
        return database.query(sql, vendor_id);
    }
}