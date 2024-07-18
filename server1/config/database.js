// mysql 配置信息
const mysqlConfig = {
    host: "mysql2",
	user: "root",
	password: "123456",
	database: "login",
	multipleStatements: true
};
// const mysqlConfig = {
//     host: "10.128.9.182",
// 	user: "root",
// 	password: "122629",
// 	database: "mydatabase",
// 	multipleStatements: true
// };
// redis 配置信息
const redisConfig = {
    host: "redis2",
    port: "6379"
};
// const redisConfig = {
//     host: "10.128.9.182",
//     port: "6379"
// };

const dbConfig = {
    mysqlConfig: mysqlConfig,
    redisConfig: redisConfig
};

module.exports = dbConfig;