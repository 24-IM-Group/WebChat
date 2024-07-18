const express = require("express");
const bodyParser = require("body-parser");
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.redirect("/login");
});

// 登录界面GET请求
app.get("/login", (req, res) => {
    res.sendFile(__dirname + "/static/login.html");    
});

// 登录界面POST请求，处理表单提交
app.post('/login', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    // 这里可以添加验证逻辑和数据库查询等
    console.log(`Username: ${username}, Password:${password}`);
    res.send('登录成功！');
});

// 注册界面GET请求
app.get("/register", (req, res) => {
    res.sendFile(__dirname + "/static/register.html");
});

// 注册界面POST请求
app.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    // 验证逻辑、添加新用户
});

app.listen(3000, () => {
  console.log("示例应用正在监听 3000 端口 !");
});
