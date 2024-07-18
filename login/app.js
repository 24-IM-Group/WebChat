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




const server = app.listen(3001, () => {
    const addr = server.address().address;
    const port = server.address().port;

    console.log(`Server running on http://${addr}:${port}`);
});


