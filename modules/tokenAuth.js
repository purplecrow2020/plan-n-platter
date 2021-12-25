const jwt = require('jsonwebtoken');

const session_expiry_time = 1 * 60 * 10; // 5 minutes
const token_expiry_time = '730d';



class TokenAuth {

    static create(student_id, config) {
        return jwt.sign({ id: student_id }, config.jwtSecret, {
            expiresIn: token_expiry_time,
        });
    }
    
    static verify(config, token, ignoreExpiration = false) {
        return jwt.verify(token, config.jwt_secret, { ignoreExpiration });
    }
}

module.exports = TokenAuth;
