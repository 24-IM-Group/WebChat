const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const chatForm = document.getElementById('chatForm');

const socket = io("http://localhost:3000");

socket.on("message", data => {
    console.log(`从 ${data.userFrom} 收到消息: ${data.message}`);
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `
        <div class="message-info">${data.userFrom}  ${data.timeStamp}</div></div>
        <div class="message-text">${data.message}</div>
    `;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on("logout", data => {
    alert(data.message);
    socket.close();
    window.location.href = "/login";
});

const curUname = document.querySelector("#cur-username").textContent;

chatForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const messageText = messageInput.value.trim();
    if (messageText) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        const curTime = new Date();
        messageElement.innerHTML = `
            <div class="my-message-info">${curUname}  ${curTime.toLocaleString()}</div>
            <div class="my-message-text">${messageText}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        messageInput.value = '';

        const msg = {
            userFrom: curUname,
            message: messageText,
            userTo: "all",
            timeStamp: curTime.toLocaleString(),
            type: 1
        };
        
        socket.emit("message", msg);
        console.log(`${msg.userFrom} 已向 ${msg.userTo} 发送消息: ${msg.message}`);
    }
});

const logoutBtn = document.querySelector(".logout-button");
logoutBtn.addEventListener("click", () => {
    socket.close();
    window.location.href = "/logout";
});