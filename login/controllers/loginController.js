const userModel = require("../models/user");
const logger = require("../utils/logger");

// 登录验证
exports.check = (req, res) => {
    logger.info(`${req.ip} : POST ${req.url}`);
    // 获取用户输入数据
    const user = req.body;
    // 查看用户是否存在
    userModel.getUserByName(user.username)
        .then(row => {
            if (user.username === "" || user.password === "") {
                res.render("login_error", {
                    errInfo: "用户名或密码不能为空!",
                    username: user.username
                });
            }
            else if (row === null) {
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
                req.session.username = user.username;
                req.session.userid = row.id;
                res.redirect("/home");
                //console.log(`用户 ${user.username} 登录成功!`);
                logger.info(`${req.ip} : [登录成功] 用户 ${user.username}`);
            }
        })
        .catch(err => {
            res.status(500).json({error:err.message});
        });
};

// 注册验证
exports.register = (req, res) => {
    logger.info(`${req.ip} : POST ${req.url}`);
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
        userModel.getUserByName(user.username)
            .then(row => {
                if (row !== null) {
                    res.render("register_error", {
                        errInfo: "用户名已存在",
                        username: user.username,
                        password: user.password,
                        confirmPassword: user.confirmPassword
                    });
                }
                else {
                    userModel.create(user.username, user.password)
                        .then(info => {
                            if (info === "Operation success") {
                                //console.log(`用户 ${user.username} 注册成功!`);
                                logger.info(`${req.ip} : [注册成功] 用户 ${user.username}`);
                                userModel.getUserByName(user.username)
                                    .then(row => {
                                        if (row !== null) {
                                            req.session.userid = row.id;
                                            req.session.status = "login success";
                                            req.session.username = user.username;
                                            res.redirect("/home");
                                            //console.log(`用户 ${user.username} 登录成功!`);
                                            logger.info(`${req.ip} : [登录成功] 用户 ${user.username}`);
                                        }
                                    })
                                    .catch(err => {
                                        res.status(500).json({error:err.message});
                                    });
                            }
                        })
                        .catch(err => {
                            res.status(500).json({error:err.message});
                        });
                }
            })
            .catch(err => {
                res.status(500).json({error:err.message});
            })
    }
};