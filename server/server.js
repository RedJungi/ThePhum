// Node.js에서 필요한 모듈들을 가져옵니다 (CommonJS 방식)
const express = require('express'); // Express 웹 프레임워크 - HTTP 서버를 쉽게 만들기 위한 라이브러리
const { createServer } = require('http'); // Node.js 내장 HTTP 모듈에서 서버 생성 함수만 가져오기
const WebSocket = require('ws'); // WebSocket 라이브러리 - 실시간 양방향 통신을 위한 모듈
const cors = require('cors'); // CORS(Cross-Origin Resource Sharing) 처리 미들웨어
const { exec } = require('child_process'); // Node.js 내장 모듈 - 시스템 명령어를 실행하기 위한 함수
const { Client } = require('ssh2'); // SSH 연결을 위한 라이브러리
//const { NodeSSH } = require('node-ssh'); // SSH 연결을 위한 라이브러리

// 7.25 추가 내용
/*
//방법1
const conn = new NodeSSH(); // SSH 클라이언트 인스턴스 생성

//SSH 서버 연결을 위한 설정 객체
const config ={
  host: '192.168.10.131', // 연결할 리눅스 서버의 IP 주소
  port: 22, // SSH 기본 포트 (22번)
  username: 'hjg',  //사용자 이름
  userpassword: '1234', //사용자 비밀번호
}
  //명령어 보내기
  conn.exec('원하는 명령어', {}).then(function(result){
    console.log('명령어 실행 결과:'+ result.stdout); // 명령어 실행 결과 출력
    console.log('명령어 실행 에러:'+ result.stderr ); // 명령어 실행 에러 출력  
    conn.dispose (); // SSH 연결 종료
  });
*/

//방법2

// SSH 서버에 연결
const conn = new Client(); // SSH 클라이언트 인스턴스 생성

//SSH 서버 연결을 위한 설정 객체
const config ={
  host: '192.168.10.131', // 연결할 리눅스 서버의 IP 주소
  port: 22, // SSH 기본 포트 (22번)
  username: 'hjg',  //사용자 이름
  userpassword: '1234', //사용자 비밀번호
}

conn.connect(config);

// SSH 서버에 연결이 성공적으로 완료되었을 때
conn.on('ready', () => {
  console.log('SSH 연결 성공'); // 콘솔에 연결 성공 메시지 출력

  //원격 서버에서 'ls -la' 명령어 실행 (현재 디렉토리의 파일 목록을 자세히 보여줌)
  conn.exec('ls -la', (err, stream) => {
    if (err) throw err; // 오류가 발생하면 예외를 던짐

    //명령어 실행이 완료되었을 때 (스트림이 닫힐 때)
    stream.on('close', (code, signal) => {
      //code: 명령어 종료 코드(0=성공, 0이 아님=오류)
      // signal: 프로세스 종료 신호
      console.log('명령어 실행 완료 - 종료 코드:' + code + ', 신호:' + signal); // 콘솔에 종료 코드와 신호 출력
      conn.end(); // SSH 연결 종료
    })
    // 명령어의 표준 출력(STDOUT) 데이터를 받을 때
    .on('data', (data) => {
      console.log('명령어 출력:', data);
    })
    //명령어의 에러 출력(STDERR) 데이터를 받을 때
    .stderr.on('data', (data) => {
      console.log('명령어 에러:', data); // 콘솔에 에러 출력
    });
  });
});

// 7.25 추가 내용   


// Express 인스턴스 생성
const app = express();

// HTTP 서버 생성
// Express 앱을 HTTP 서버로 래핑합니다. 이는 WebSocket 서버와 함께 사용하기 위함입니다
const server = createServer(app);

// CORS 미들웨어 적용
// 다른 도메인(예: localhost:5173)에서 이 서버(localhost:3000)로 요청을 보낼 수 있게 허용
app.use(cors());

// JSON 파싱 미들웨어 적용
// 클라이언트에서 보낸 JSON 형태의 데이터를 자동으로 JavaScript 객체로 변환
app.use(express.json());

// WebSocket 서버 생성 (포트 3001에서 실행)
// HTTP 서버(포트 3000)와 별도로 WebSocket 전용 서버를 3001 포트에서 실행
// WebSocket: 클라이언트와 서버 간 실시간 양방향 통신을 가능하게 하는 프로토콜
const wss = new WebSocket.Server({ port: 3001 });

// 서버 시작 메시지 출력
console.log('WebSocket 서버가 포트 3001에서 실행 중');

// WebSocket 연결 이벤트 처리
// 'connection' 이벤트: 새로운 클라이언트가 WebSocket 서버에 연결될 때 발생
wss.on('connection', (ws) => {
  // ws: 연결된 클라이언트와의 WebSocket 연결 객체
  console.log('새로운 클라이언트 연결됨');
  
  // 클라이언트로부터 메시지를 받았을 때의 이벤트 처리
  // 'message' 이벤트: 클라이언트가 서버로 메시지를 보낼 때 발생
  ws.on('message', (message) => {
    try {
      // 받은 메시지를 JSON 형태에서 JavaScript 객체로 변환
      // 클라이언트는 JSON.stringify()로 보내고, 서버는 JSON.parse()로 받습니다
      const data = JSON.parse(message);
      
      // 구조 분해 할당으로 command와 value 추출
      // 예: { command: 'ps', value: null } 또는 { command: 'kill', value: '1234' }
      const { command, value } = data;
      
      // 디버깅을 위해 받은 명령어를 콘솔에 출력
      console.log('받은 명령:', command, value);
      
      // switch문을 사용하여 명령어별로 다른 처리를 수행
      switch (command) {
        // 'ps' 명령어: 현재 실행 중인 프로세스 목록을 조회
        case 'ps':
          // exec(): 시스템 명령어를 실행하는 Node.js 함수
          // 'ps aux': 모든 프로세스의 상세 정보를 표시하는 Unix/Linux 명령어
          exec('ps aux', (error, stdout, stderr) => {
            // error: 명령어 실행 중 발생한 오류 (명령어가 존재하지 않거나 권한 문제 등)
            if (error) {
              // 오류 발생 시 클라이언트에게 오류 메시지 전송
              ws.send(JSON.stringify({ error: `ps 명령 오류: ${error.message}` }));
              return; // 함수 종료
            }
            // stderr: 명령어의 표준 에러 출력 (경고 메시지 등)
            if (stderr) {
              ws.send(JSON.stringify({ error: `ps stderr: ${stderr}` }));
              return;
            }
            // stdout: 명령어의 정상 출력 결과
            // 성공적으로 실행된 경우 결과를 클라이언트에게 전송
            ws.send(JSON.stringify({ output: stdout }));
          });
          break; // switch문 탈출
          
        // 'top' 명령어: 시스템 리소스 사용량과 실행 중인 프로세스들을 실시간으로 표시
        case 'top':
          // top 명령은 기본적으로 계속 실행되므로, 한 번의 스냅샷만 가져오기
          // -l 1: 1번만 실행, -n 20: 상위 20개 프로세스만 표시 (macOS 기준)
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
          
        // 'kill' 명령어: 특정 프로세스를 종료
        case 'kill':
          // value 검증: PID(프로세스 ID)가 제공되었는지 확인
          if (!value) {
            ws.send(JSON.stringify({ error: 'PID가 제공되지 않았습니다.' }));
            return;
          }
          
          // 문자열로 받은 PID를 정수로 변환
          const pid = parseInt(value);
          
          // PID가 유효한 숫자인지 검증
          // isNaN(): 숫자가 아니면 true를 반환하는 함수
          if (isNaN(pid)) {
            ws.send(JSON.stringify({ error: '유효하지 않은 PID입니다.' }));
            return;
          }
          
          // kill 명령어 실행: 특정 PID의 프로세스를 종료
          // 템플릿 리터럴(``)을 사용하여 동적으로 명령어 생성
          exec(`kill ${pid}`, (error, stdout, stderr) => {
            if (error) {
              // kill 명령이 실패한 경우 (존재하지 않는 PID, 권한 부족 등)
              ws.send(JSON.stringify({ error: `kill 명령 오류: ${error.message}` }));
              return;
            }
            // 성공적으로 프로세스를 종료한 경우
            ws.send(JSON.stringify({ output: `프로세스 ${pid}를 종료했습니다.` }));
          });
          break;
          
        // 정의되지 않은 명령어가 들어온 경우의 기본 처리
        default:
          ws.send(JSON.stringify({ error: `알 수 없는 명령: ${command}` }));
      }
    } catch (error) {
      // JSON.parse() 실패 등의 예외 상황 처리
      // try-catch 블록으로 예기치 않은 오류를 잡아서 서버가 중단되지 않도록 방지
      console.error('메시지 파싱 오류:', error);
      ws.send(JSON.stringify({ error: '잘못된 메시지 형식입니다.' }));
    }
  });
  
  // 클라이언트 연결이 종료되었을 때의 이벤트 처리
  // 'close' 이벤트: 클라이언트가 연결을 끊거나 네트워크 문제로 연결이 해제될 때 발생
  ws.on('close', () => {
    console.log('클라이언트 연결 해제됨');
    // 여기에 필요시 정리 작업을 추가할 수 있습니다 (로그 저장, 리소스 해제 등)
  });
  
  // WebSocket 연결 중 오류가 발생했을 때의 이벤트 처리
  // 'error' 이벤트: 네트워크 오류, 프로토콜 오류 등이 발생할 때 호출
  ws.on('error', (error) => {
    console.error('WebSocket 오류:', error);
    // 오류 로깅 및 필요시 재연결 로직을 추가할 수 있습니다
  });
});

// Express HTTP 서버 설정 및 시작
// 환경 변수 PORT가 있으면 사용하고, 없으면 기본값 3000 사용
const PORT = process.env.PORT || 3000;

// 서버를 지정된 포트에서 시작
// listen(): 서버가 해당 포트에서 클라이언트의 요청을 기다리기 시작
server.listen(PORT, () => {
  // 서버가 성공적으로 시작되면 실행되는 콜백 함수
  console.log(`Express 서버가 포트 ${PORT}에서 실행 중`);
});