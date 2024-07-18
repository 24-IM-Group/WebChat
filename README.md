# WebChat

一个基于 Web 的简易聊天室。

## 目录

- [WebChat](#webchat)
  - [目录](#目录)
  - [简介](#简介)
  - [功能](#功能)
  - [项目结构](#项目结构)
  - [安装](#安装)
      - [环境准备](#环境准备)
      - [存储库克隆](#存储库克隆)
      - [服务启动](#服务启动)
  - [使用方法](#使用方法)
  - [环境变量](#环境变量)

## 简介

WebChat 是一个基于 Web 的简易聊天室，支持用户管理、公共聊天室、好友私聊等功能。此项目基于 Express 搭建 Web 应用，使用 Socket.IO 实现聊天功能，使用 MySQL 实现数据持久化，使用 Redis 实现会话管理和多服务器协同，使用 Nginx 实现反向代理。

## 功能

- 用户管理
- 实时消息通信
- 会话管理
- 数据持久化
- 多服务器协同
- 反向代理

## 项目结构

以下是项目的目录结构:

```
WebChat/
├── nginx/
│       nginx.conf                  // nginx 配置文件
│
├── server/                         // 业务逻辑服务器相关代码
│   ├── config/                     // 配置文件
│   │       database.js             // 数据库配置
│   │
│   ├── controllers/                // 控制器
│   │       loginController.js      // 登录控制相关逻辑
│   │   
│   ├── middlewares/                // 中间件
│   │       sessionMiddleware.js    // 会话管理中间件
│   │
│   ├── models/                     // 数据库模型
│   │       friendShip.js           // 好友关系
│   │       groupMessage.js         // 群聊消息记录
│   │       message.js              // 私聊消息记录
│   │       user.js                 // 用户信息
│   │       usMap.js                // userId 与 socketId 映射关系
│   │
│   ├── public/                     // 静态资源目录
│   │   ├── css/                    
│   │   ├── html/                  
│   │   ├── imgs/              
│   │   └── js/  
│   │
│   ├── routes/                     // 路由
│   │       home.js                 // 主页路由
│   │       index.js                // 首页路由
│   │       login.js                // 登录路由
│   │       register.js             // 注册路由
│   │
│   ├── views/                      // 视图模板
│   │       home.ejs                // 主页视图
│   │       login_error.ejs         // 登录错误视图
│   │       register_error.ejs      // 注册错误视图
│   │
│   ├── websockets/           
│   │       socketConfig.js         // WebSocket 配置文件  
│   │       socketHandler.js        // WebSocket 处理逻辑
│   │
│   ├── .env                        // 环境变量配置文件
│   ├── app.js                      // 应用入口文件
│   └── package.json                // 项目信息及依赖
│   
├── login/                          // 登录管理服务器相关代码
│ 
└── README.md  
```

## 安装

#### 环境准备

- 在服务器上使用 Compose 插件或 docker-compose 安装 Docker。有关安装详细信息，请访问 [Docker Compose 安装指南](https://blog.csdn.net/weixin_44330367/article/details/130281711)。

#### 存储库克隆

```
git clone https://github.com/24-IM-Group/WebChat.git
```
#### 服务启动

- 要启动服务，请执行以下操作：
```
docker-compose up -d
```
- 要终止服务，请执行以下操作：
```
docker-compose down -v
```

## 使用方法

等待后续更新

## 环境变量

- `DB_HOST`: MySQL host
- `DB_USER`: MySQL 用户名
- `DB_PASSWORD`: MySQL 密码
- `DB_DATABASE`: MySQL 数据表
- `RD_HOST`: Redis host
- `RD_PORT`: Redis 端口
- `PORT`: 本地服务器监听端口

```
# .env 示例
DB_HOST=mysql
DB_USER=root
DB_PASSWORD=123456
DB_DATABASE=login
RD_HOST=redis
RD_PORT=6379
PORT=3000
```
