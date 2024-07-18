const express = require('express');
const path = require("path");
const loginController = require("../controllers/loginController");
const logger = require("../utils/logger");

const router = express.Router();

// 用户登录页面
router.get("/", (req, res) => {
    logger.info(`${req.ip} : GET ${req.url}`);
    const filePath = path.join(__dirname, "..", "public", "html", "login.html");
    res.sendFile(filePath);    
});

// 用户登录验证
router.post("/", loginController.check);

module.exports = router;