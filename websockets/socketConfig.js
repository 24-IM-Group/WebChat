require("dotenv").config();
const socketIO = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

module.exports = (server) => {
    const sio = socketIO(server);
    require("./socketHandler")(sio);

    const pubClient = createClient({ url: `redis://${process.env.RD_HOST}:${process.env.RD_PORT}` });
    const subClient = pubClient.duplicate();

    Promise.all([
        pubClient.connect(),
        subClient.connect()
    ]);

    // Redis 适配器
    sio.adapter(createAdapter(pubClient, subClient));

    return sio;
};