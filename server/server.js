const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const server = createServer(app);

// Express 미들웨어
app.use(cors());
app.use(express.json());

// WebSocket 서버 생성 (포트 3001)
const wss = new WebSocket.Server({ port: 3001 });

console.log('WebSocket 서버가 포트 3001에서 실행 중');

// WebSocket 연결 처리
wss.on('connection', (ws) => {
  console.log('새로운 클라이언트 연결됨');
  
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const { command, value } = data;
      
      console.log('받은 명령:', command, value);
      
      // 명령어 처리
      switch (command) {
        case 'ps':
          exec('ps aux', (error, stdout, stderr) => {
            if (error) {
              ws.send(JSON.stringify({ error: `ps 명령 오류: ${error.message}` }));
              return;
            }
            if (stderr) {
              ws.send(JSON.stringify({ error: `ps stderr: ${stderr}` }));
              return;
            }
            ws.send(JSON.stringify({ output: stdout }));
          });
          break;
          
        case 'top':
          // top 명령은 한 번의 스냅샷만 가져오기
          exec('top -l 1 -n 20', (error, stdout, stderr) => {
            if (error) {
              ws.send(JSON.stringify({ error: `top 명령 오류: ${error.message}` }));
              return;
            }
            if (stderr) {
              ws.send(JSON.stringify({ error: `top stderr: ${stderr}` }));
              return;
            }
            ws.send(JSON.stringify({ output: stdout }));
          });
          break;
          
        case 'kill':
          if (!value) {
            ws.send(JSON.stringify({ error: 'PID가 제공되지 않았습니다.' }));
            return;
          }
          
          const pid = parseInt(value);
          if (isNaN(pid)) {
            ws.send(JSON.stringify({ error: '유효하지 않은 PID입니다.' }));
            return;
          }
          
          exec(`kill ${pid}`, (error, stdout, stderr) => {
            if (error) {
              ws.send(JSON.stringify({ error: `kill 명령 오류: ${error.message}` }));
              return;
            }
            ws.send(JSON.stringify({ output: `프로세스 ${pid}를 종료했습니다.` }));
          });
          break;
          
        default:
          ws.send(JSON.stringify({ error: `알 수 없는 명령: ${command}` }));
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
      ws.send(JSON.stringify({ error: '잘못된 메시지 형식입니다.' }));
    }
  });
  
  ws.on('close', () => {
    console.log('클라이언트 연결 해제됨');
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket 오류:', error);
  });
});

// Express 서버는 포트 3000에서 실행
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Express 서버가 포트 ${PORT}에서 실행 중`);
});