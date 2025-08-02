const express = require('express');
const WebSocket = require('ws');
const { exec } = require('child_process');
const cors = require('cors');

const app = express();
const PORT = 8080;

// CORS 설정
app.use(cors());
app.use(express.json());

// WebSocket 서버 생성
const wss = new WebSocket.Server({ port: 8081 });

console.log('WebSocket 서버가 8081 포트에서 실행 중입니다...');

// WebSocket 연결 처리
wss.on('connection', (ws) => {
  console.log('새로운 클라이언트가 연결되었습니다.');

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    console.log('받은 메시지:', data);

    if (data.type === 'command') {
      const command = data.command;
      
      // 안전한 명령어만 허용
      const allowedCommands = ['ps', 'ps aux', 'ps -ef', 'top -n 1', 'whoami', 'date', 'uptime'];
      const isAllowed = allowedCommands.some(cmd => command.startsWith(cmd));
      
      if (!isAllowed) {
        ws.send(JSON.stringify({
          type: 'error',
          message: '허용되지 않은 명령어입니다.'
        }));
        return;
      }

      // 명령어 실행
      exec(command, (error, stdout, stderr) => {
        if (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: `실행 오류: ${error.message}`
          }));
          return;
        }

        if (stderr) {
          ws.send(JSON.stringify({
            type: 'error',
            message: `에러: ${stderr}`
          }));
          return;
        }

        ws.send(JSON.stringify({
          type: 'result',
          command: command,
          output: stdout
        }));
      });
    }
  });

  ws.on('close', () => {
    console.log('클라이언트 연결이 종료되었습니다.');
  });

  // 연결 확인 메시지
  ws.send(JSON.stringify({
    type: 'connected',
    message: 'WebSocket 서버에 연결되었습니다.'
  }));
});

// Express 서버
app.get('/', (req, res) => {
  res.json({ message: 'Process Monitor Server가 실행 중입니다.' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Express 서버가 ${PORT} 포트에서 실행 중입니다...`);
});
