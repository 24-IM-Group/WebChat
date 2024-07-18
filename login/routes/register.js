const express = require('express');
const path = require("path");
const loginController = require("../controllers/loginController");

const router = express.Router();

// 用户注册页面
router.get("/", (req, res) => {
    const filePath = path.join(__dirname, "..", "public", "html", "register.html");
    res.sendFile(filePath);    
});

// 用户注册验证
router.post("/", loginController.register);

module.exports = router;