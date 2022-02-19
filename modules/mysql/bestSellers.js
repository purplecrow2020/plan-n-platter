module.exports = class BestSellers {
    constructor() {

    }

    static getByVendorId(database, vendor_id) {
        let sql = "select * from ((select * from bestsellers where vendor_id=?) as a inner join (select * from menus) as b on a.menu_id=b.id)"
        return database.query(sql, vendor_id);
    }

    static addMenuItem(database, obj) {
        const sql ="insert into bestsellers SET ?";
        return database.query(sql, obj);
    }
}

