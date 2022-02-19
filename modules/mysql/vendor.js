
class Vendor {
    constructor () {

    }

    static getVendorById(database, vendor_id) {
        const sql = "select * from vendors where id = ?";
        return database.query(sql, vendor_id);
    }

    static getVendorByUsernamePassword(database, username, password) {
        const sql = "select * from ((select * from vendor_logins where username = ? and password = ?) as a left join (select * from vendors) as b on a.vendor_id=b.id)";
        return database.query(sql, [username, password]);
    }
}

module.exports = Vendor;