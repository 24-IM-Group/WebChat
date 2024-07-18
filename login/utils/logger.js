const log4js = require("log4js");

// 日志配置
log4js.configure({
    appenders: {
        "console": { "type": "console" },
        "file": {
            "type": "file",
            "filename": "../logs/app.log",
            "maxLogSize": 10485760,
            "backups": 3,
            "compress": true
        }
    },
    "categories": {
        "default": {
            "appenders": [ "console", "file" ],
            "level": "debug"
        },
        "info": {
            "appenders": [ "console", "file" ],
            "level": "info"
        },
        "error": {
            "appenders": [ "console", "file" ],
            "level": "error"
        }
    }
});

/**
 * 日志输出 level 为 debug
 * @param { string } content
 */
exports.debug = ( content ) => {
    let logger = log4js.getLogger("debug");
    logger.level = "debug";
    logger.debug(content);
}

/**
 * 日志输出 level 为 info
 * @param { string } content
 */
exports.info = ( content ) => {
    let logger = log4js.getLogger("info");
    logger.level = "info";
    logger.info(content);
}

/**
 * 日志输出 level 为 error
 * @param { string } content
 */
exports.error = ( content ) => {
    let logger = log4js.getLogger("error");
    logger.level = "error";
    logger.error(content);
}
