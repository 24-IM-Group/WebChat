-- 创建数据库 login
flush privileges;
CREATE DATABASE IF NOT EXISTS login;

-- 使用该数据库
USE login;

-- 创建数据表 users, 保存用户信息
CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

-- 创建数据表 friendships, 保存好友关系信息
CREATE TABLE IF NOT EXISTS friendships (
    user_id INT,
    friend_id INT,
    user_name VARCHAR(255),
    friend_name VARCHAR(255)
);

-- 创建数据表 messages, 保存私聊消息记录
CREATE TABLE IF NOT EXISTS messages (
    message_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id_from INT,
    user_name_from VARCHAR(255),
    user_id_to INT,
    user_name_to VARCHAR(255),
    content TEXT,
    created_at VARCHAR(255)
);

-- 创建数据表 group_messages, 保存群聊消息记录
CREATE TABLE IF NOT EXISTS group_messages (
    message_id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    group_id INT,
    user_id INT,
    user_name VARCHAR(255),
    content TEXT,
    created_at VARCHAR(255)
);

-- 创建数据表 user_socket, 保存 userId 与 socketId 的映射关系
CREATE TABLE IF NOT EXISTS user_socket (
    user_id INT NOT NULL PRIMARY KEY,
    socket_id VARCHAR(255)
);