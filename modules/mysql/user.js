class User {
    constructor(){

    }

    static getUserByEmailPwd(database, mobile, password) {
        const sql = "select * from users where mobile=? and password= ?";
        return database.query(sql, [mobile, password]);
    }

    static insertNewUser(database, obj) {
        const sql = "INSERT INTO users SET ?";
        return database.query(sql, obj);
    }
}

module.exports = User;