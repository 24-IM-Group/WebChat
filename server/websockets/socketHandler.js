require("dotenv").config();
const userPool = require("../models/user");
const msgPool = require("../models/message");
const gmsgPool = require("../models/groupMessage");
const fsPool = require("../models/friendShip");
const usPool = require("../models/usMap");

module.exports = (sio) => {
    sio.on("connection", (socket) => {
        // 获取用户信息
        const sess = socket.request.session;
        const [ curUserId, curUserName, curSocketId ] = [ sess.userid, sess.username, socket.id ];
        
        // 更新 ws 连接
        socket.userid = curUserId;
        socket.username = curUserName;
        // usPool.get(curUserId)
        //     .then(row => {
        //         if (row !== null) {
        //             const delSocket = sio.in(row.socket_id).fetchSockets();
        //             if (delSocket) {
        //                 delSocket.emit('logout', { message: "当前账号已在其他地方登录!" });
        //                 delSocket.disconnect();
        //             }
        //         }
        //     })
        //     .catch(err => {
        //         console.log("user_socket 表查询失败\n", err.message);
        //     });  
        usPool.set(curUserId, curSocketId);
        console.log(`用户 ${curUserName} 已连接`);  
    
        // 更新好友列表
        let friendList = [{id: 1, name: "World", type: 1}];
        fsPool.getFriendsById(curUserId)
            .then(rows => {
                if (rows !== null) {
                    for (let row of rows) {
                        let friendItem = {
                            id: row.friend_id,
                            name: row.friend_name,
                            type: 0
                        };
                        friendList.push(friendItem);
                    }
                }
                // 发送用户信息
                socket.emit("userinfo", {
                    userid: curUserId,
                    username: curUserName,
                    friendList: friendList
                });
            })
            .catch(err => {
                console.log("当前用户好友列表查询失败\n", err.message);
            });
    
    
        // 监听客户端聊天消息
        socket.on("message", msg => {
            // 群聊消息
            if (msg.type === 1) {
                console.log(`用户 ${msg.user_name_from} 在群聊 ${msg.user_name_to} 发送消息: ${msg.content}`);
                socket.broadcast.emit('message', msg);
                gmsgPool.store(msg);   
            }
            // 私聊消息
            else if (msg.type === 0) {
                console.log(`用户 ${msg.user_name_from} 向用户 ${msg.user_name_to} 发送消息: ${msg.content}`);
                usPool.get(msg.user_id_to)
                    .then(row => {
                        if (row !== null) {
                            sio.to(row.socket_id).emit('message', msg);
                        }
                    })
                    .catch(err => {
                        console.log("user_socket 表查询失败\n", err.message);
                    });
                msgPool.store(msg);
            }
        });
    
        // 监听客户端消息记录请求
        socket.on("msgHistory", data => {
            const user_id = data.userid;
            const friend_id = data.friendid;
            const type = data.type;
            // 私聊消息记录
            if (type === 0) {
                msgPool.getMsgsById(user_id, friend_id)
                    .then(rows => {
                        rows.forEach(row => {
                            socket.emit("msgHistory", [row, 0]);
                        })
                    })
                    .catch(err => {
                        console.error("messages 表查询失败\n", err.message);
                    });
            }
            // 群聊消息记录
            else if (type === 1) {
                gmsgPool.getMsgsById(friend_id)
                    .then(rows => {
                        rows.forEach(row => {
                            socket.emit("msgHistory", [row, 1]);
                        });
                    })
                    .catch(err => {
                        console.error("group_messages 表查询失败", err.message);
                    });
            }
        });
    
        // 监听客户端“搜索好友”消息请求
        socket.on("search", searchReq => {
            let searchRes = {};
            userPool.getUserByName(searchReq.friendname)
                .then(row => {
                    if (row === null) {
                        searchRes = {
                            friend_info: {},
                            status: 0,
                            info: "用户不存在"
                        };
                        socket.emit("search", searchRes);
                    }
                    else {
                        fsPool.create(searchReq.user_id, row.id, searchReq.username, row.name)
                            .then(result => {
                                if (result === "Operation success") {
                                    console.log(`用户 ${searchReq.username} 已添加用户 ${row.name} 为好友`)
                                    searchRes = {
                                        friend_info: {
                                            id: row.id,
                                            name: row.name,
                                            type: 0
                                        },
                                        status: 1,
                                        info: "成功添加好友"
                                    };
                                    socket.emit("search", searchRes);
                                }
                            })
                            .catch(err => {
                                console.error("friendships 表查询失败\n", err.message);
                            });
                    }
                })
                .catch(err => {
                    console.error("users 表查询失败\n", err.message);
                });
        });

        // 客户端断开连接
        socket.on("disconnect", () => {
            //const [ delUserId, delUserName ] = [ socket.userid, socket.username ];
            const delUserId = socket.userid;
            usPool.delete(delUserId)
            //console.log(`用户 ${delUserName} 断开连接`);
        });
    });
};