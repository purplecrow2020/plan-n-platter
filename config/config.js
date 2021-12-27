require('dotenv').config();

const Joi = require('joi');

const envVarsSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production').default('development'),
    PORT: Joi.number().default(3000),

    MYSQL_HOST: Joi.string().required().description('Mysql host'),
    MYSQL_USER: Joi.string().required().description('Mysql username'),
    MYSQL_DB: Joi.string().required().description('Mysql dbname'),
    MYSQL_PASS: Joi.string().allow(null, ''),
    JWT_SECRET: Joi.string().required().description('jwt secret')
}).unknown().required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) {
    throw new Error(`Config validation error: ${error.message}`);
}

function getPoolConnectionLimit(slave = false) {
    if (envVars.NODE_ENV === 'production') {
        if (slave) {
            return parseInt(envVars.MYSQL_CONNECTION_POOL_SLAVE);
        }
        return parseInt(envVars.MYSQL_CONNECTION_POOL);
    }
    if (slave) {
        return 3;
    }
    return 2;
}


const appConfig = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    write_mysql: {
        host: envVars.MYSQL_HOST,
        user: envVars.MYSQL_USER,
        password: envVars.MYSQL_PASS,
        database: envVars.MYSQL_DB,
        connectionLimit: getPoolConnectionLimit(true),
        connectTimeout: 600000,		// 60 * 60 * 1000
        aquireTimeout: 600000,			// 60 * 60 * 1000
        timeout: 600000,				// 60 * 60 * 1000
    },
    read_mysql: {
        host: envVars.MYSQL_HOST,
        user: envVars.MYSQL_USER,
        password: envVars.MYSQL_PASS,
        database: envVars.MYSQL_DB,
        connectionLimit: getPoolConnectionLimit(true),
        connectTimeout: 600000,		// 60 * 60 * 1000
        aquireTimeout: 600000,			// 60 * 60 * 1000
        timeout: 600000,				// 60 * 60 * 1000
        charset: 'utf8mb4',
    },
    versions: {
        'Version 1': '/v1',
    },
    jwtSecret: envVars.JWT_SECRET
};

console.log(appConfig);
module.exports = { ...appConfig };
