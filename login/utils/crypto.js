/*
 * 通过 crypto-js 实现 哈希计算工具
 * MD5、SHA-1、SHA-256
 */

const CryptoJS = require("crypto-js");

// MD5
const md5 = data => {
    return CryptoJS.MD5(data).toString();
}

// SHA-1
const sha1 = data => {
    return CryptoJS.SHA1(data).toString();
}

// SHA-256
const sha256 = data => {
    return CryptoJS.SHA256(data).toString();
}

module.exports = {
    md5,
    sha1,
    sha256
};