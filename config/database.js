/* eslint-disable class-methods-use-this */
const mysql = require('mysql');

module.exports = class Database {
    constructor(config) {
        this.pool = mysql.createPool(config);
    }

    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, args, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
    });
    }

    transactionalQuery(conn, sql, args) {
        return new Promise((resolve, reject) => {
            conn.query(sql, args, (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    }

    /**
     * Multiple queries in a single transaction
     * @param {{sql: string; args: any}[]} params
     */
    transaction(params) {
        return new Promise((resolve, reject) => {
            this.pool.getConnection(async (err, conn) => {
                if (err) {
                    return reject(err);
                }
                try {
                    await this.transactionalQuery(conn, 'START TRANSACTION');
                    try {
                        const results = [];
                        for (let i = 0; i < params.length; i++) {
                            const { sql, args } = params[i];
                            // eslint-disable-next-line no-await-in-loop
                            const res = await this.transactionalQuery(conn, sql, args);
                            results.push(res);
                        }
                        await this.transactionalQuery(conn, 'COMMIT');
                        resolve(results);
                    } catch (e) {
                        await this.transactionalQuery(conn, 'ROLLBACK');
                        reject(e);
                    }
                } catch (e) {
                    reject(e);
                } finally {
                    conn.release();
                }
            });
        });
    }

    getConnection(cb) {
        return this.pool.getConnection(cb);
    }

    close() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, conn) => {
                if (err) {
                    return reject(err);
                }
                conn.release();
                resolve();
            });
        });
    }
};
