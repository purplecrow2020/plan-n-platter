module.exports = class QuickRequests {

    static addNewRequest(database, obj) {
        const sql ="insert into quick_requests SET ?";
        return database.query(sql, obj);
    }

    static resolveRequestById(database, id) {
        const sql = "UPDATE quick_requests SET is_resolved=1 where id = ?";
        return database.query(sql, id);
    }
    
    static getUnresolvedRequestsByVendorId(database, id) {
        const sql ="select * from quick_requests where vendor_id = ?  and is_resolved =0";
        return database.query(sql, id);
    }

}