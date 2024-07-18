const pool = require("../config/database");

const Message = {
    getMsgsById: (id_from, id_to) => {
        const sqlStr = `SELECT * FROM (SELECT * FROM messages WHERE (user_id_from = ${id_from} AND user_id_to = ${id_to}) OR (user_id_from = ${id_to} AND user_id_to = ${id_from}) ORDER BY message_id DESC LIMIT 50) AS subquery ORDER BY message_id ASC`;
        return new Promise((resolve, reject) => {
            pool.query(sqlStr, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (rows.length > 0) {
                        resolve(rows);
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    },
    store: (msg) => {
        const [user_id_from, user_name_from, user_id_to, user_name_to, content, created_at] = [msg.user_id_from, msg.user_name_from, msg.user_id_to, msg.user_name_to, msg.content, msg.created_at];
        const sqlStr = `INSERT INTO messages (user_id_from, user_name_from, user_id_to, user_name_to, content, created_at) VALUES (${user_id_from}, "${user_name_from}", ${user_id_to}, "${user_name_to}", "${content}", "${created_at}")`;
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
    }
};

module.exports = Message;