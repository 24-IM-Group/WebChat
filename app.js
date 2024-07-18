const express = require("express");
const session = require("express-session");
const createError = require("http-errors");
const FileStore = require("session-file-store")(session);
const path = require("path");

const sqlite = require("sqlite3");
const socketIO = require("socket.io");


const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const rootDir = __dirname;
const staticDir = path.join(__dirname, "static");
app.use(express.static(staticDir));


// 设置 EJS 为模板引擎
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// 配置 session
const sessionMiddleware = session({
    secret: "123456",
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1800000

    },
    resave: false,
    saveUninitialized: false,
    store: new FileStore()
});

app.use(sessionMiddleware);

// app.get("/test", (req, res) => {
//     res.sendFile(rootDir + "/static/html/register.html");
// });

// app.post("/test", (req, res) => {
//     console.log(req.body);
//     res.json({errInfo: "Form data received!"});
// });


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
    const db = new sqlite.Database("./data.sqlite");
    db.get("SELECT * FROM users WHERE name = ?", [user.username], (err, row) => {
        if (err) next(createError("database query error"));
        else if (user.username == "" || user.password == "") {
            res.render("login_error", {
                errInfo: "用户名或密码不能为空!",
                username: user.username
            });
        }
        else if (row == undefined || row.password != user.password) {
            res.render("login_error", {
                errInfo: "用户名或密码错误!",
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
        const db = new sqlite.Database("./data.sqlite");
        db.get("SELECT * FROM users WHERE name = ?", [user.username], (err, row) => {
            if (err) next(createError("database query error"));
            else if (row !== undefined) {
                res.render("register_error", {
                    errInfo: "用户名已存在",
                    username: user.username,
                    password: user.password,
                    confirmPassword: user.confirmPassword
                });
            }
            else {
                db.run("INSERT INTO users (name, password) VALUES (?, ?)", [user.username, user.password], err => {
                    if (err) next(createError("注册失败"));
                    else {
                        console.log(`用户 ${user.username} 注册成功!`);
                        // 自动登录
                        db.get("SELECT * FROM users WHERE name = ?", [user.username], (err, row) => {
                            if (err) next(createError("database query error"));
                            else {
                                req.session.userid = row.id;
                                req.session.status = "login success";
                                req.session.views = 0;
                                req.session.username = user.username;
                                res.redirect("/home");
                                console.log(`用户 ${user.username} 登录成功!`);
                            }
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
        // res.write("<!DOCTYPE html>\r\n<html lang='zh-CN'>\r\n<head>\r\n<meta charset='utf-8'>\r\n<title>主页</title>\r\n</head>\r\n<body>");
        // res.write(`<p>Hello, ${req.session.username}, welcome to homepage</p>`, "utf-8");
        // res.write(`<p>这是第 ${req.session.views} 次访问</p>`, "utf-8");
        // res.write(`<p>会话将于 ${Math.floor(req.session.cookie.maxAge/60000)} 分钟后过期</p>`, "utf-8");;
        // res.end("</body></html>");
        res.render("home", {
            username: req.session.username
        });
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
    });
    users = newUsers;
    sess.destroy(err => {
        if (err) {
            console.error(err.message);
        }
    });
    res.redirect("/");
});


const server = app.listen(3000, () => {
    
    const port = server.address().port;

    console.log("示例应用正在监听 %s 端口 !", port);
});

let users = new Array();

const sio = socketIO(server);

sio.engine.use(sessionMiddleware);

sio.on("connection", (socket) => {
    const sess = socket.request.session;

    // const curTime = new Date();
    // let msg = {
    //     userFrom: "server", 
    //     message: "Hello from server",
    //     userTo: sess.username,
    //     timeStamp: curTime.toLocaleString()
    // };

    // socket.emit("message", msg);
    // console.log(`服务器已发送消息: ${msg.message}`);

    const userExist = users.filter(user => user.userid === sess.userid);
    if (userExist.length !== 0) {
        users.forEach(user => {
            if (user.userid === sess.userid) {
                user.socket.emit("logout", {message: "当前用户已在其他地方登录"});
                user.socket = socket;
                console.log(`${user.username} 的 ws 连接已改变`);
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

    socket.on("message", data => {
        //console.log(sess.username + " says " + data.message);
        if (data.type === 1 && data.userTo === "all") {
            console.log(`${msg.userFrom} 向 ${msg.userTo} 发送消息: ${msg.message}`);
            storeMessage(msg);
            users.forEach(user => {
                if (user.userid !== sess.userid) {
                    user.socket.emit("message", data);
                }
            });            
        }
    });
});

function storeMessage(msg) {
    if (msg.userFrom !== undefined && msg.userTo !== undefined && msg.message !== undefined && msg.timestamp !== undefined && msg.type !== undefined) {
        const db = new sqlite.Database("./data.sqlite");
        db.run("INSERT INTO messages (userFrom, userTo, message, timestamp, type) VALUES (?, ?, ?, ?, ?)", [msg.userFrom, msg.userTo, msg.message, msg.timestamp, msg.type], err => {
            if (err) next(createError("消息插入失败"));
        });
    }
    else {
        console.log("消息格式错误，无法存入消息记录");
    }
}