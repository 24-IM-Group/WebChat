const session = require("express-session");
const redis = require('redis');
const redisStore = require('connect-redis').default;

// 创建 Redis 连接
const redisClient = redis.createClient({
    url: `redis://${process.env.RD_HOST}:${process.env.RD_PORT}`
});

// 监听错误信息
redisClient.on('error', err => {
    console.error(err) // 打印错误信息
  });

// 尝试连接到 Redis 服务器
redisClient.connect().then(() => {
    console.log('Connected to Redis server successfully!');
  
    // 执行 PING 命令来测试连接
    return redisClient.ping();
  }).then((response) => {
    console.log('Redis server responded with:', response);
  }).catch((err) => {
    console.error('Error connecting to Redis server:', err);
  });

// 配置 session
const sessionMiddleware = session({
    secret: "123456",
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1800000
    },
    resave: false,
    saveUninitialized: true,
    store: new redisStore({ client: redisClient })
});


module.exports = sessionMiddleware;