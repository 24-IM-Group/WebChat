const express = require("express");
const session = require("express-session");
const createError = require("http-errors");
const FileStore = require("session-file-store")(session);
const path = require("path");
const fs = require("fs")

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const rootDir = __dirname;
const staticDir = path.join(__dirname, "static");
app.use(express.static(staticDir));

// 配置 session
app.use(session({
    secret: "123456",
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 10000
    },
    resave: false,
    saveUninitialized: false,
    store: new FileStore()
}));

// app.get("/test", (req, res) => {
//     res.sendFile(rootDir + "/static/test.html");
// });

// app.post("/test", (req, res) => {
//     const user = req.body;
//     fs.readFile("./user.json", "utf-8", (err, data) => {
//         const users = JSON.parse(data);
//         users.push(user);
//         fs.writeFile("./user.json", JSON.stringify(users), (err, result) => {
//             res.send("写入成功");
//         });
//     })
// });


// 首页路由（默认跳转到登录页面）
app.get("/", (req, res) => {
    if (req.session.status) {
        res.redirect("/homepage");
    }
    else {
        res.redirect("/login");
    }
});

// 用户登录页面
app.get("/login", (req, res) => {
    res.sendFile(rootDir + "/static/login.html");    
});

// 用户登录验证
app.post("/login", (req, res, next) => {
    // 获取用户输入数据
    const user = req.body;
    // 查看用户是否存在
    fs.readFile("./user.json", "utf-8", (err, data) => {
        if (err) next(createError("no file"));
        else {
            const users = JSON.parse(data);
            // 匹配用户信息
            const dbUser = users.filter(v => v.username === user.username);
            if (dbUser.length === 0) next(createError(403, "no user"));
            else if (dbUser[0].password !== user.password) next(createError(403, "wrong password"));
            else {
                req.session.status = "login success";
                req.session.views = 0;
                req.session.username = user.username;
                res.redirect("/homepage");
                console.log(`用户 ${user.username} 登录成功!`)
            }
        }
    });
});

// 用户注册页面
app.get("/register", (req, res) => {
    res.sendFile(rootDir + "/static/register.html");
});

// 用户注册验证
app.post("/register", (req, res, next) => {
    const user = req.body;
    // 查看是否存在同名用户
    fs.readFile("./user.json", "utf-8", (err, data) => {
        if (err) next(createError("no file"));
        else {
            const users = JSON.parse(data);
            const dbUser = users.filter(v => v.username === user.username);
            if (dbUser.length !== 0) next(createError(403, "用户已存在"));
            else if (user.password !== user.confirm_password) next(createError(403, "两次输入的密码不一致"));
            else {
                users.push({"username": user.username, "password": user.password});
                fs.writeFile("./user.json", JSON.stringify(users), (err, result) => {
                    if (err) next(createError("注册失败!"));
                    else {
                        //res.send("注册成功!");
                        res.redirect("/");
                    }
                });
            }
        }
    })
})

// // 授权中间件
// app.use((req, res, next) => {
//     if (req.session.status) next();
//     else next(createError(401));
// });

app.get("/homepage", (req, res) => {
    if (!req.session.status) {
        res.redirect("/login");
    } 
    else {
        req.session.views++;
        res.write("<!DOCTYPE html>\r\n<html lang='zh-CN'>\r\n<head>\r\n<meta charset='utf-8'>\r\n<title>主页</title>\r\n</head>\r\n<body>");
        res.write(`<p>Hello, ${req.session.username}, welcome to homepage</p>`, "utf-8");
        res.write(`<p>这是第 ${req.session.views} 次访问</p>`, "utf-8");
        res.write(`<p>会话将于 ${req.session.cookie.maxAge/1000} 秒后过期</p>`, "utf-8");;
        res.end("</body></html>");
    }
});


app.listen(3000, () => {
  console.log("示例应用正在监听 3000 端口 !");
});
