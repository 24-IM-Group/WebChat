const express = require('express');
const router = express.Router();
const logger = require("../utils/logger");

// 主页路由
router.get("/", (req, res) => {
    logger.info(`${req.ip} : GET ${req.url}`);
    if (!req.session.status) {
        res.redirect("/login");
    } 
    else {
        res.render("home", {
            username: req.session.username
        });
    }
});

// 用户退出登录
router.get("/logout", (req, res) => {
    logger.info(`${req.ip} : GET ${req.url}`);
    const sess = req.session;
    //console.log(`用户 ${sess.username} 退出登录`);
    logger.info(`${req.ip} : [退出登录] 用户 ${sess.username}`);
    sess.destroy(err => {
        if (err) {
            console.error(err.message);
        }
    });
    res.redirect("/");
});

module.exports = router;