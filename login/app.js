const express = require("express");
const path = require("path");
const http = require("http")

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const registerRouter = require("./routes/register");

const sessionMiddleware = require("./middlewares/sessionMiddleware");

const pool = require("./config/database");

// 测试 MySQL 连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Error connecting to the database");
        return;
    }
    console.log("Connected to MySQL server successfully!");
    connection.release();
});

const app = express();

// 中间件
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 配置 session
app.use(sessionMiddleware);

// 设置 EJS 为模板引擎
app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

// 路由列表
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/register", registerRouter);

// 创建 HTTP 服务器
const server = http.createServer(app);

server.listen(process.env.PORT || 3000, () => {
    const addr = server.address().address;
    const port = server.address().port;

    console.log(`Server running on http://${addr}:${port}`);
});