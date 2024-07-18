const express = require("express");
const session = require("express-session");
const createError = require("http-errors");
const path = require("path");
const socketIO = require("socket.io");
const dbConfig = require("./config/database");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const rootDir = __dirname;
const staticDir = path.join(__dirname, "static");
app.use(express.static(staticDir));
//+++
const RedisStore = require('connect-redis').default;
const redis = require('redis');
const mysql = require("mysql")

// 设置 EJS 为模板引擎
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// 配置数据库
// 创建redis数据库连接
const redisConfig = dbConfig.redisConfig;
const redisClient = redis.createClient({
    url: `redis://${redisConfig.host}:${redisConfig.port}`
}); // 端口，主机

// 监听错误信息
redisClient.on('error', err => {
  console.error(err) // 打印监听到的错误信息
});

// 尝试连接到 Redis 服务器
redisClient.connect().then(() => {
    console.log('Connected to Redis server successfully!');
  
    // 执行 PING 命令来测试连接
    return redisClient.ping();
  }).then((response) => {
    console.log('Redis server responded with:', response);
  }).catch((err) => {
    console.error('Error connecting to Redis server:', err);
  });

// mysql 配置
const sqlConfig = dbConfig.mysqlConfig;

// 创建 mysql 连接
const conne = function(){
    let connection = mysql.createConnection(sqlConfig)
    connection.connect()
    connection.on('error',err=>{
        console.log('Re-connecting lost connection: ');
        connection = mysql.createConnection(sqlConfig)

    })
    
	return connection

}

const db = conne()


// 配置 session
const sessionMiddleware = session({
    secret: "123456",
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1800000
    },
    resave: false,
    saveUninitialized: true,
    store: new RedisStore({ client: redisClient })
});

app.use(sessionMiddleware);

////////////////////////////////////////////////
/* Socket 连接 */
///////////////////////////////////////////////
const net = require('net');

const client = net.connect({ port: 3003, host: '172.19.0.8' }, () => {
  console.log('已连接到根服务器');
});

client.on('data', (msg) => {
//   console.log(`收到服务器数据: ${data}`);
    users.forEach(user => {
        if (user.userid !== msg.user_id_to) {
            user.socket.emit("message", msg);
        }
    });
});

client.on('end', () => {
  console.log('连接已关闭');
});

// client.write('你好，服务器！');

///////////////////////////////////////////////////////
/* 路由列表  */
//////////////////////////////////////////////////////

// 首页路由（默认跳转到登录页面）
app.get("/", (req, res) => {
    if (req.session.status) {
        res.redirect("/home");
    }
    else {
        res.redirect("/login");
    }
});

// 用户登录页面
app.get("/login", (req, res) => {
    res.sendFile(rootDir + "/static/html/login.html");    
});

// 用户登录验证
app.post("/login", (req, res, next) => {
    // 获取用户输入数据
    const user = req.body;
    // 查看用户是否存在
    db.query("SELECT * FROM users WHERE name = ?", [user.username], (err, row) => {
        row = row[0]
        if (err) next(createError("database query error"));
        else if (user.username == "" || user.password == "") {
            res.render("login_error", {
                errInfo: "用户名或密码不能为空!",
                username: user.username
            });
        }
        else if (row == undefined) {
            res.render("login_error", {
                errInfo: "用户名不存在!",
                username: user.username
            });
        }
        else if (row.password !== user.password) {
            res.render("login_error", {
                errInfo: "密码错误!",
                username: user.username
            });            
        }
        else {
            req.session.status = "login success";
            req.session.views = 0;
            req.session.username = user.username;
            req.session.userid = row.id;
            res.redirect("/home");
            console.log(`用户 ${user.username} 登录成功!`);
        }
    });
});

// 用户注册页面
app.get("/register", (req, res) => {
    res.sendFile(rootDir + "/static/html/register.html");
});

// 用户注册验证
app.post("/register", (req, res, next) => {
    const user = req.body;
    if (user.username === "" || user.password === "") {
        res.render("register_error", {
            errInfo: "用户名或密码不能为空",
            username: user.username,
            password: user.password,
            confirmPassword: user.confirmPassword
        });
    }
    else if (user.password !== user.confirmPassword) {
        res.render("register_error", {
            errInfo: "两次输入的密码不一致",
            username: user.username,
            password: user.password,
            confirmPassword: ""
        });
    }
    else {
        // 查看是否存在同名用户
        db.query("SELECT * FROM users WHERE name = ?", [user.username], (err, row) => {
            if (err) next(createError("database query error"));
            else if (row.length >= 1) {
                res.render("register_error", {
                    errInfo: "用户名已存在",
                    username: user.username,
                    password: user.password,
                    confirmPassword: user.confirmPassword
                });
            }
            else {
                db.query("INSERT INTO users (name, password) VALUES (?, ?)", [user.username, user.password], err => {
                    if (err) next(createError("注册失败"));
                    else {
                        console.log(`用户 ${user.username} 注册成功!`);
                        // 自动登录
                        db.query("SELECT * FROM users WHERE name = ?", [user.username], (err, row) => {
                            if (err) createError("database query error");
                            row = row[0];
                            req.session.userid = row.id;
                            req.session.status = "login success";
                            req.session.views = 0;
                            req.session.username = user.username;
                            res.redirect("/home");
                            console.log(`用户 ${user.username} 登录成功!`);
                        });
                    }
                });
            }
        });
    }
});

app.get("/home", (req, res) => {
    if (!req.session.status) {
        res.redirect("/login");
    } 
    else {
        req.session.views++;
        const userid = req.session.userid;
        updateUser(userid);
        res.render("home", {
            username: req.session.username
        });
        // res.render("draft", {
        //     username: req.session.username
        // });
    }
});

// 用户退出登录
app.get("/logout", (req, res) => {
    const sess = req.session;
    console.log(`用户 ${sess.username} 退出登录`);
    let newUsers = new Array();
    users.forEach(user => {
        if (user.userid !== sess.userid) {
            newUsers.push(user);
        }
        else {
            user.socket.disconnect();
        }
    });
    users = newUsers;
    sess.destroy(err => {
        if (err) {
            console.error(err.message);
        }
    });
    res.redirect("/");
});


const server = app.listen(3002, () => {
    const addr = server.address().address;
    const port = server.address().port;

    console.log(`Server running on http://${addr}:${port}`);
});

////////////////////////////////////////////////
/* WebSocket 连接 */
///////////////////////////////////////////////

// 全局用户信息表
let users = new Array();

const sio = socketIO(server);

sio.engine.use(sessionMiddleware);

sio.on("connection", (socket) => {
    const sess = socket.request.session;

    // 查看 ws 连接是否已存在
    const userExist = users.filter(user => user.userid === sess.userid);
    if (userExist.length !== 0) {
        users.forEach(user => {
            if (user.userid === sess.userid) {
                user.socket.emit("logout", {message: "当前用户已在其他地方登录"});
                user.socket = socket;
                console.log(`用户 ${user.username} 的 ws 连接已改变`);
            }
        })
    }
    else {
        users.push({
            userid: sess.userid,
            username: sess.username,
            socket: socket
        });
        console.log(`用户 ${sess.username} 已连接 ws`);
    }

    // 好友列表
    let friendList = [{id: 1, name: "World", type: 1}];
    db.query("SELECT * FROM friendships WHERE user_id = ?", [sess.userid], (err, rows) => {
        if (err) createError("用户好友信息查询失败");
        if (rows.length !== 0) {
            for (let row of rows) {
                let friendItem = {id: row.friend_id, name: row.friend_name, type: 0}
                friendList.push(friendItem)
            }
        }
        // 用户信息
        const userInfo = {
            userid: sess.userid,
            username: sess.username,
            friendList: friendList
        };
        socket.emit("userinfo", userInfo);
    });


    // 监听客户端聊天消息
    socket.on("message", msg => {
        storeMessage(msg);
        // 群聊消息
        if (msg.type === 1) {
            console.log(`用户 ${msg.user_name_from} 在群聊 ${msg.user_name_to} 发送消息: ${msg.content}`);
            users.forEach(user => {
                if (user.userid !== sess.userid) {
                    user.socket.emit("message", msg);
                }
            });            
        }
        // 私聊消息
        else if (msg.type === 0) {
            console.log(`用户 ${msg.user_name_from} 向用户 ${msg.user_name_to} 发送消息: ${msg.content}`);
            const userTo = users.filter(user => user.userid === msg.user_id_to);
            if (userTo.length !== 0) {
                users.forEach(user => {
                    if (user.userid === msg.user_id_to) {
                        user.socket.emit("message", msg);
                    }
                })
            }
            else {
                sendMsg(msg);
            }
        }
    });

    // 监听客户端消息记录请求
    socket.on("msgHistory", data => {
        const user_id = data.userid;
        const friend_id = data.friendid;
        const type = data.type;
        // 私聊消息记录
        if (type === 0) {
            //console.log(`SELECT * FROM messages WHERE (user_from = ${user_id} AND user_to = ${friend_id}) OR (user_from = ${friend_id} AND user_to = ${user_id}) ORDER BY id ASC`)
            db.query("SELECT * FROM messages WHERE (user_id_from = ? AND user_id_to = ?) OR (user_id_from = ? AND user_id_to = ?) ORDER BY message_id ASC", [user_id, friend_id, friend_id, user_id], (err, rows) => {
                if (err) next(createError("消息记录查询失败"));
                // socket.emit("msgHistory", [rows, 0]);
                rows.forEach(row => {
                    socket.emit("msgHistory", [row, 0]);
                });
            });
        }
        // 群聊消息记录
        else if (type === 1) {
            db.query("SELECT * FROM group_messages WHERE group_id = ? ORDER BY message_id ASC", [friend_id], (err, rows) => {
                if (err) next(createError("消息记录查询失败"));
                rows.forEach(row => {
                    // const msg = {
                    //     user_id_from: row.user_id_from,
                    //     user_name_from: row.user_name_from,
                    //     user_id_to: row.user_id_to,
                    //     user_name_to: row.user_name_to,
                    //     content: row.content,
                    //     created_at: row.created_at
                    // };
                    socket.emit("msgHistory", [row, 1]);
                });
            });
        }
    });

    // 监听客户端“搜索好友”消息请求
    socket.on("search", searchReq => {
        let searchRes = {};
        db.query("SELECT * FROM users WHERE name = ?", [searchReq.friendname], (err, rows) => {
            if (err) createError(err);
            if (rows.length === 0) {
                searchRes = {
                    friend_info: {},
                    status: 0,
                    info: "用户不存在"
                };
                socket.emit("search", searchRes);
            }
            else {
                const row = rows[0];
                db.query("INSERT INTO friendships (user_id, friend_id, user_name, friend_name) VALUES (?, ?, ?, ?), (?, ?, ?, ?);", [searchReq.user_id, row.id, searchReq.username, row.name, row.id, searchReq.user_id, row.name, searchReq.username], err => {
                    if (err) createError(err);
                    console.log(`用户 ${searchReq.username} 已添加用户 ${row.name} 为好友`)
                    searchRes = {
                        friend_info: {
                            id: row.id,
                            name: row.name,
                            type: 0
                        },
                        status: 1,
                        info: "成功添加好友"
                    };
                    socket.emit("search", searchRes);
                });
            }
        });
    });
});

function storeMessage(msg) {
    const [user_id_from, user_name_from, user_id_to, user_name_to, content, created_at, type] = [msg.user_id_from, msg.user_name_from, msg.user_id_to, msg.user_name_to, msg.content, msg.created_at, msg.type];
    if (user_id_from !== undefined && user_id_to !== undefined && content !== undefined && created_at !== undefined && type !== undefined) {
        if (type === 1) {
            db.query("INSERT INTO group_messages (group_id, user_id, user_name, content, created_at) VALUES (?, ?, ?, ?, ?)", [user_id_to, user_id_from, user_name_from, content, created_at], err => {
                if (err) next(createError("消息插入失败"));
            });
        }
        else if (type === 0) {
            db.query("INSERT INTO messages (user_id_from, user_name_to, user_id_to, user_name_from, content, created_at) VALUES (?, ?, ?, ?, ?, ?)", [user_id_from, user_name_from, user_id_to, user_name_to, content, created_at], err => {
                if (err) next(createError("消息插入失败"));
            });            
        }
        else {
            console.log("消息类型错误，仅存在私聊消息(0)与群聊消息(1)");
        }
    }
    else {
        console.log(msg);
        console.log("消息格式错误，无法存入消息记录");
    }
}

function updateUser(userid) {
    data = {
        type: "update",
        id: userid
    };
    client.write(data);
}

function sendMsg(msg) {
    data = {
        type: "msg",
        msg: msg
    };
    client.write(data);
}

