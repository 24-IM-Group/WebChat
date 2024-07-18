const sqlite = require("sqlite3");

// 创建数据库连接
const db = new sqlite.Database("./data.sqlite", err => {
    if (err) {
        console.error(err.message);
    }
    console.log("数据库连接已打开");
});

// // 创建用户表 users
// db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, name TEXT, password TEXT);", err => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log("用户表已创建");
// });

// // 插入用户 admin
// db.run("INSERT INTO users (name, password) VALUES (?, ?);", ["admin", "admin"], err => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log("用户 admin 已插入");
// });

// db.run("INSERT INTO users (name, password) VALUES (?, ?), (?, ?);", ["user1", "1234", "user2", "1234"], err => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log("用户 user1, user2 已插入");
// });

// db.get("SELECT * FROM users WHERE name = ?", ["user1"], (err, row) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log(`user1: ${row.id}`);
// });

// // 创建消息记录表
// db.run("CREATE TABLE messages (id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, userFrom TEXT, userTo TEXT, message TEXT, timestamp DATETIME, type INTEGER);", err => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log("消息记录表已创建");
// });

// // 删除消息记录表
// db.run("DROP TABLE messages", err => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log("消息记录表已删除");
// });

// 插入消息记录（样例）
const nowTime = new Date();
db.run("INSERT INTO messages (id, userFrom, userTo, message, timestamp, type) VALUES (?, ?, ?, ?, ?, ?);", [0, "admin", "admin", "This is an example.", nowTime.toLocaleString(), 0], err => {
    if (err) {
        console.error(err.message);
    }
    console.log("消息记录（样例）已插入");
});

// 查询消息记录（样例）
db.get("SELECT * FROM messages WHERE id = ?", [0], (err, row) => {
    if (err) {
        console.error(err.message);
    }
    console.log(row);
});

// 关闭数据库连接
db.close(err => {
    if (err) {
        console.error(err.message);
    }
    console.log("数据库连接已关闭");
})
