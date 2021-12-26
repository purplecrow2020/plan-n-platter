
class Vendor {
    constructor () {

    }

    static getVendorById(database, vendor_id) {
        const sql = "select * from vendors where id = ?";
        return database.query(sql, vendor_id);
    }
}

module.exports = Vendor;