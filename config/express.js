const express = require('express');

const app = express();
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');

const config = require('./config');
const Database = require('./database');



const readMysql = new Database(config.read_mysql);
if (config.env === 'development') {
    writeMysql = readMysql;
} else {
    writeMysql = new Database(config.write_mysql);
}
const db = {};
db.mysql = {};
db.mysql.read = readMysql;
db.mysql.write = writeMysql;


app.set('db', db);
app.set('config', config);



app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));
app.use(bodyParser.json({ limit: '50mb' }));

for (const k in config.versions) {
    app.use(config.versions[k], require(`../server${config.versions[k]}/index.route`));
}

module.exports = app;
