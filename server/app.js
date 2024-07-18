const express = require("express");
const path = require("path");
const http = require("http")

const indexRouter = require("./routes/index");
const homeRouter = require("./routes/home");

const sessionMiddleware = require("./middlewares/sessionMiddleware");

const socketConfig = require("./websockets/socketConfig");

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
app.set('views', "./views");

// 路由列表
app.use("/", indexRouter);
app.use("/home", homeRouter);

// 创建 HTTP 服务器
const server = http.createServer(app);

// 配置 WebSocket
const sio = socketConfig(server);
sio.engine.use(sessionMiddleware);

server.listen(process.env.PORT || 3000, () => {
    const addr = server.address().address;
    const port = server.address().port;

    console.log(`Server running on http://${addr}:${port}`);
});