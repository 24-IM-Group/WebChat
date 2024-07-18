const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const chatForm = document.getElementById('chatForm');
const friendList = document.querySelector(".friendlist-container");
const logoutBtn = document.querySelector(".logout-button");
const searchForm = document.querySelector(".search-form");
const searchInput = document.querySelector(".search-input");

const socket = io();

let curUserInfo = {
    id: -1,
    name: "",
    friendList: []
};

let curFriendInfo = {
    id: -1,
    name: "",
    type: -1,
    window: null
};

/* 监听服务端“消息” */
socket.on("message", msg => {
    // 私聊消息
    if (msg.type === 0) {
        if (msg.type == curFriendInfo.type && msg.user_id_from === curFriendInfo.id) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML = `
                <div class="message-info">${msg.user_name_from}  ${msg.created_at}</div></div>
                <div class="message-text">${msg.content}</div>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
    // 群聊消息
    else if (msg.type === 1) {
        if (msg.type == curFriendInfo.type && msg.user_id_to === curFriendInfo.id) {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.innerHTML = `
                <div class="message-info">${msg.user_name_from}  ${msg.created_at}</div></div>
                <div class="message-text">${msg.content}</div>
            `;
            chatMessages.appendChild(messageElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }
});

/* 监听“强制登出”消息 */
socket.on("logout", data => {
    alert(data.message);
    window.location.href = "/login";
});

/* 监听“用户信息”消息 */
socket.on("userinfo", userInfo => {
    curUserInfo.id = userInfo.userid;
    curUserInfo.name = userInfo.username;
    curUserInfo.friendList = userInfo.friendList;
    for (const item of curUserInfo.friendList) {
        const friendElement = document.createElement("div");
        friendElement.classList.add('friend-item');
        friendElement.innerHTML = `${item.name}`;
        friendElement.addEventListener('click', () => {
            if (curFriendInfo.window !== null) {
                curFriendInfo.window.style.backgroundColor = '#e9e8e8';
                curFriendInfo.window = friendElement;
            }
            else {
                curFriendInfo.window = friendElement;
            }
            // 更新当前好友窗口信息
            const nextFriend = curUserInfo.friendList.filter(friend => friend.name === curFriendInfo.window.innerHTML)[0];
            curFriendInfo.id = nextFriend.id;
            curFriendInfo.name = nextFriend.name;
            curFriendInfo.type = nextFriend.type;

            friendElement.style.backgroundColor = "white";
            chatMessages.innerHTML = '';
            const msgReq = {
                userid: curUserInfo.id,
                friendid: item.id,
                type: item.type
            };
            socket.emit("msgHistory", msgReq);
        });
        friendList.appendChild(friendElement);
    }
});

// 监听“消息记录”消息
socket.on("msgHistory", data => {
    const msg = data[0];
    const type = data[1];
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    // 私聊消息记录
    if (type === 0) {
        if (msg.user_id_from === curUserInfo.id) {
            messageElement.innerHTML = `
                <div class="my-message-info">${msg.user_name_from}  ${msg.created_at}</div>
                <div class="my-message-text">${msg.content}</div>
            `;
        }
        else {
            messageElement.innerHTML = `
                <div class="message-info">${msg.user_name_from}  ${msg.created_at}</div></div>
                <div class="message-text">${msg.content}</div>
            `;
        }
    }
    // 群聊消息记录
    else {
        if (msg.user_id === curUserInfo.id) {
            messageElement.innerHTML = `
                <div class="my-message-info">${msg.user_name}  ${msg.created_at}</div>
                <div class="my-message-text">${msg.content}</div>
            `;                
        }
        else {
            messageElement.innerHTML = `
                <div class="message-info">${msg.user_name}  ${msg.created_at}</div></div>
                <div class="message-text">${msg.content}</div>
            `;
        }
    }
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// 监听“添加好友”响应消息
socket.on("search", searchRes => {
    if (searchRes.status === 0) {
        alert(searchRes.info);
    }
    else {
        searchInput.value = "";
        const friendInfo = searchRes.friend_info;
        curUserInfo.friendList.push(friendInfo);
        const friendElement = document.createElement("div");
        friendElement.classList.add('friend-item');
        friendElement.innerHTML = `${friendInfo.name}`;
        friendElement.addEventListener('click', () => {
            if (curFriendInfo.window !== null) {
                curFriendInfo.window.style.backgroundColor = '#e9e8e8';
                curFriendInfo.window = friendElement;
            }
            else {
                curFriendInfo.window = friendElement;
            }
            // 更新当前好友窗口信息
            const nextFriend = curUserInfo.friendList.filter(friend => friend.name === curFriendInfo.window.innerHTML)[0];
            curFriendInfo.id = nextFriend.id;
            curFriendInfo.name = nextFriend.name;
            curFriendInfo.type = nextFriend.type;

            friendElement.style.backgroundColor = "white";
            chatMessages.innerHTML = '';
            const msgReq = {
                userid: curUserInfo.id,
                friendid: friendInfo.id,
                type: friendInfo.type
            };
            socket.emit("msgHistory", msgReq);
        });
        friendList.appendChild(friendElement);
        alert(searchRes.info);
    }
});

// 发送聊天消息
chatForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const messageText = messageInput.value.trim();
    if (messageText) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        const curTime = new Date();
        messageElement.innerHTML = `
            <div class="my-message-info">${curUserInfo.name}  ${curTime.toLocaleString()}</div>
            <div class="my-message-text">${messageText}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        messageInput.value = '';


        const msg = {
            user_id_from: curUserInfo.id,
            user_name_from: curUserInfo.name,
            user_id_to: curFriendInfo.id,
            user_name_to: curFriendInfo.name,
            content: messageText,
            created_at: curTime.toLocaleString(),
            type: curFriendInfo.type
        };
        
        socket.emit("message", msg);
        console.log(`${msg.user_name_from} 已向 ${msg.user_name_to} 发送消息: ${msg.content}`);
    }
});

// 登出
logoutBtn.addEventListener("click", () => {
    socket.disconnect();
    window.location.href = "/home/logout";
});

// 添加好友
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const searchText = searchInput.value.trim();
    if (searchText) {
        const searchList = curUserInfo.friendList.filter(friend => friend.name === searchText);
        if (searchText === curUserInfo.name) {
            alert("不能添加自己为好友!");
        }
        else if (searchList.length !== 0) {
            alert("此用户已添加为好友!");
        }
        else {
            socket.emit("search", {
                user_id: curUserInfo.id,
                username: curUserInfo.name,
                friendname: searchText
            });
        }
    }
});