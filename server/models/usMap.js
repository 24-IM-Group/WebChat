const pool = require("../config/database");

const usMap = {
    get: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM user_socket WHERE user_id = ?", [user_id], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (rows.length > 0) {
                        const row = rows[0];
                        resolve(row);
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    },
    set: (user_id, socket_id) => {
        const sqlStr = `INSERT INTO user_socket (user_id, socket_id) VALUES (${user_id}, "${socket_id}") ON DUPLICATE KEY UPDATE socket_id = VALUES(socket_id)`;
        return new Promise((resolve, reject) => {
            pool.query(sqlStr, err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve("Operation success");
                }
            });
        });
    },
    delete: (user_id) => {
        return new Promise((resolve, reject) => {
            pool.query("DELETE FROM user_socket WHERE user_id = ?", [user_id], err => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve("Operation success");
                }
            });
        });
    }
};

module.exports = usMap;