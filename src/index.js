const Client = require("ssh2").Client; // ssh2 모듈에서 Client 클래스를 가져온다
const bodyParser = require("body-parser"); // body-parser 모듈을 가져온다
const express = require("express"); // express 모듈을 가져온다
//const tunnel = require("tunnel-ssh"); // tunnel-ssh 모듈을 가져온다
const port = 3000; // 서버 포트 번호, 만약 이 포트를 사용하고 있다면 다른 포트로 사용
const app = express();
const exec = require("child_process").exec; // child_process 모듈에서 exec 함수를 가져온다
const http = require("http"); // http 모듈을 가져온다

app.use(bodyParser.json()); // JSON 형식의 요청 본문을 파싱하기 위해 body-parser 미들웨어를 사용

const conn = new Client(); // ssh2 모듈의 Client 클래스를 사용하여 SSH 클라이언트 인스턴스를 생성

const linux = {
  host: "192.168.105.131",
  port: 22,
  username: "hjg",
  password: "1234",
};

//--------------터미널(콘솔창)에서 'ps' 명령어를 실행하여 현재 실행 중인 프로세스를 가져오는 코드-------------------
//let process = exec("ps"); // 'ps' 명령어를 실행하여 현재 실행 중인 프로세스를 가져온다
// process.stdout.on("data", (data) => {
//   console.log(`현재 실행 중인 프로세스:\n${data}`); // 실행 중인 프로세스의 정보를 콘솔에 출력
// });

conn
  .on("ready", () => {
    console.log("SSH 연결 성공");
    // SSH 연결이 성공하면 실행
  })
  .on("error", (err) => {
    console.error("SSH 연결 실패:", err);
  })
  .on("end", () => {
    console.log("SSH 연결 종료");
  })
  .connect(linux); // SSH 서버에 연결
// SSH 연결 설정을 정의하고 connect 메서드를 호출하여 SSH 서버에 연결
let data = [
  { name: "jun", age: 20 },
  { name: "kim", age: 21 },
  { name: "lee", age: 22 },
];

// 클라이언트에서 HTTP 요청 메소드 중 POST를 이용해서 'host:port
app.post("/", (req, res) => {
  data.push(req.body); // 클라이언트에서 보낸 요청 본문을 가져온다
  res.json(data); // 응답으로 data 배열을 JSON 형식으로 보낸다
  console.log(data); // 서버 콘솔에 data 배열을 출력
});

// 클라이언트에서 HTTP 요청 메소드 중 GET을 이용해서 'host:port'로 요청을 보내면 실행되는 라우트
app.get("/process", (req, res) => {
  exec("ps -eo pid,tty,time,args", (error, stdout, stderr) => {
    // 'ps' 명령어를 실행하여 현재 실행 중인 프로세스를 가져온다
    if (error) {
      return res.status(500).json({ error: error.message }); // 오류가 발생하면 500 상태 코드와 오류 메시지를 응답
    }
    if (stderr) {
      return res.status(500).json({ error: stderr }); // 표준 오류가 있으면 500 상태 코드와 오류 메시지를 응답
    }
    res.json({
      process: stdout, // 실행 중인 프로세스 정보를 응답
    });
  });
  // exec 함수를 사용하여 'ps' 명령어를 실행하고, 콜백 함수에서 결과를 처리
});

app.get("/", (req, res) => {
  //클라이언트에서 HTTP 요청 메소드 중 GET을 이용해서 'host:port/data'로 요청을 보내면 실행되는 라우트
  //data 배열을 JSON 형식으로 응답
  res.json(data);
});

//app.listten() 함수를 사용해서 서버를 실행
//클라이언트는 'host:port' 로 노드 서버에 요청을 보낼 수 있다.
app.listen(port, () => {
  console.log(`서버 실행 http://localhost:${port}`);
});
