const net = require('net');

const client = net.connect({ port: 3003, host: '172.19.0.8' }, () => {
  console.log('已连接到服务器');
});

client.on('data', (data) => {
  console.log(`收到服务器数据: ${data}`);
});

client.on('end', () => {
  console.log('连接已关闭');
});

client.write('你好，服务器！');
