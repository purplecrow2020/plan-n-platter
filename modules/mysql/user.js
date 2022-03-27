class User {
    constructor(){

    }

    static getUserByEmailPwd(database, mobile, password) {
        console.log('mobile', mobile);
        console.log('password', password);
        const sql = "select * from users where mobile=? and password= ?";
        return database.query(sql, [mobile, password]);
    }

    static insertNewUser(database, obj) {
        const sql = "INSERT INTO users SET ?";
        return database.query(sql, obj);
    }

    static getUserById(database, user_id) {
        const sql = `SELECT * from users where id = ${user_id}`;
        return database.query(sql);
    }

    static updateGuestLoginDetails(database, user_id, obj) {
        const sql = "update users SET ? where id = ?";
        return database.query(sql, [obj, user_id]);
    }
}

module.exports = User;