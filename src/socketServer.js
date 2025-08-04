const express = require("express");
const WebSocket = require("ws"); // WebSocket 모듈을 가져온다
const app = express();

app.use("/", (req, res) => {
  res.sendFile(__dirname + "/socket.html");
});

app.listen(8080);

const socket = new WebSocket.Server({ port: 8081 }); // WebSocket 서버를 8081 포트에서 실행

socket.on("connection", (ws, req) => {
  ws.on("message", (msg) => {
    console.log("받은 메세지:" + msg);
    ws.send("서버에서 응답: " + msg);
  });
});
