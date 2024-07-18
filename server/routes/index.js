const express = require('express');
const router = express.Router();

// 首页路由（默认跳转到登录页面）
router.get("/", (req, res) => {
    if (req.session.status) {
        res.redirect("/home");
    }
    else {
        res.redirect("/login");
    }
});

module.exports = router;