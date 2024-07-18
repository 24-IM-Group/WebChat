const pool = require("../config/database");

const User = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM users", (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    },
    getUserByName: (name) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM users WHERE name = ?", [name], (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    if (rows.length > 0) {
                        const user = rows[0];
                        resolve(user);
                    }
                    else {
                        resolve(null);
                    }
                }
            });
        });
    },
    create: (name, password) => {
        return new Promise((resolve, reject) => {
            pool.query("INSERT INTO users (name, password) VALUES (?, ?)", [name, password], err => {
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

module.exports = User;