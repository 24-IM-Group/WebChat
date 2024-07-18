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
      - [初次服务启动](#初次服务启动)
  - [使用方法](#使用方法)
  - [环境变量](#环境变量)
  - [第三方库许可证](#第三方库许可证)
    - [Redis](#redis)
    - [MySQL](#mysql)
    - [crypto-js](#crypto-js)
    - [dotenv](#dotenv)
    - [socket.io](#socketio)
    - [connect-redis](#connect-redis)
    - [ejs](#ejs)
    - [express](#express)
    - [express-session](#express-session)
    - [http](#http)
    - [log4js](#log4js)
    - [path](#path)

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
│   ├── utils/                      // 工具函数
│   │       logger.js                 // 日志管理器
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
├── mysql/                          // mysql服务器相关代码
│   ├── conf/
│   │       my.cnf                  // mysql服务器配置文件
│   │
│   └── init/
│           init.sql                // 初始化数据库文件 
│
├── redis/                          // redis服务器相关代码
│   └── conf/
│           redis.conf              // redis服务器配置文件
│
├── docker-compose.yml              // 构建docker容器文件
│
├── CHANGELOG.md                    // 更新日志
│
├── LICENESE                        // 许可证
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
#### 初次服务启动

- 要启动服务，请执行以下操作：
```
docker-compose up -d 
```

## 使用方法

- 要暂停服务，请执行以下操作：
```
docker-compose stop 
```

- 要启动服务，请执行以下操作：
```
docker-compose start 
```

- 要重启服务，请执行以下操作：
```
docker-compose restart 
```

- 要终止服务，请执行以下操作：
```
docker-compose down -v
```

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

## 第三方库许可证

- **[Redis](https://redis.io/)** - BSD 3-Clause "New" or "Revised" License
- **[MySQL](https://www.mysql.com/)** - GNU General Public License v2.0
- **[crypto-js](https://github.com/brix/crypto-js)** - MIT License
- **[dotenv](https://github.com/motdotla/dotenv)** - BSD 2-Clause "Simplified" License
- **[socket.io](https://socket.io/)** - MIT License
- **[connect-redis](https://github.com/tj/connect-redis)** - MIT License
- **[ejs](https://github.com/mde/ejs)** - MIT License
- **[express](https://github.com/expressjs/express)** - MIT License
- **[express-session](https://github.com/expressjs/session)** - MIT License
- **[http]** - Node.js core module (Node.js License)
- **[log4js]** - Apache License 2.0
- **[path]** - Node.js core module (Node.js License)

### Redis
Redis is licensed under the BSD 3-Clause "New" or "Revised" License.
Full text of the license can be found [here](https://opensource.org/licenses/BSD-3-Clause).

### MySQL
MySQL is licensed under the GNU General Public License v2.0.
Full text of the license can be found [here](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html).

### crypto-js
crypto-js is licensed under the MIT License.
Full text of the license can be found [here](https://opensource.org/licenses/MIT).

### dotenv
dotenv is licensed under the BSD 2-Clause "Simplified" License.
Full text of the license can be found [here](https://opensource.org/licenses/BSD-2-Clause).

### socket.io
socket.io is licensed under the MIT License.
Full text of the license can be found [here](https://opensource.org/licenses/MIT).
 
### connect-redis
connect-redis is licensed under the MIT License.
Full text of the license can be found [here](https://opensource.org/licenses/MIT).

### ejs
ejs is licensed under the MIT License.
Full text of the license can be found [here](https://opensource.org/licenses/MIT).

### express
express is licensed under the MIT License.
Full text of the license can be found [here](https://opensource.org/licenses/MIT).

### express-session
express-session is licensed under the MIT License.
Full text of the license can be found [here](https://opensource.org/licenses/MIT).

### http
http is a core module of Node.js and is licensed under the Node.js License.
Full text of the license can be found [here](https://raw.githubusercontent.com/nodejs/node/master/LICENSE).

### log4js
log4js is licensed under the Apache License 2.0.
Full text of the license can be found [here](https://www.apache.org/licenses/LICENSE-2.0).

### path
path is a core module of Node.js and is licensed under the Node.js License.
Full text of the license can be found [here](https://raw.githubusercontent.com/nodejs/node/master/LICENSE).








