const express = require('express');
const router = express.Router();

// 主页路由
router.get("/", (req, res) => {
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
    const sess = req.session;
    console.log(`用户 ${sess.username} 退出登录`);
    sess.destroy(err => {
        if (err) {
            console.error(err.message);
        }
    });
    res.redirect("/");
});

module.exports = router;