const pool = require("../config/database");

const FriendShip = {
    getFriendsById: (id) => {
        return new Promise((resolve, reject) => {
            pool.query("SELECT * FROM friendships WHERE user_id = ?", [id], (err, rows) => {
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
    create: (user_id, friend_id, user_name, friend_name) => {
        const sqlStr = `INSERT INTO friendships (user_id, friend_id, user_name, friend_name) VALUES (${user_id}, ${friend_id}, "${user_name}", "${friend_name}"), (${friend_id}, ${user_id}, "${friend_name}", "${user_name}")`;
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

module.exports = FriendShip;