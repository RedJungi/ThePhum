# 🖥️ Process Monitor

Node.js + React를 사용한 실시간 프로세스 모니터링 웹사이트

## 주요 기능

- **실시간 WebSocket 통신**: 서버와 클라이언트 간 즉시 데이터 교환
- **프로세스 명령어 실행**: `ps`, `top`, `kill` 명령어 지원
- **터미널 스타일 UI**: 실제 터미널과 유사한 사용자 인터페이스
- **연결 상태 표시**: WebSocket 연결 상태 실시간 모니터링

## 사용 기술 스택

### Backend

- **Node.js**: JavaScript 런타임
- **Express**: 웹 프레임워크
- **WebSocket (ws)**: 실시간 양방향 통신
- **CORS**: Cross-Origin Resource Sharing

### Frontend

- **React**: 사용자 인터페이스 라이브러리
- **Vite**: 빌드 도구 및 개발 서버
- **WebSocket API**: 실시간 통신

## 7/25 추가 사항

- **node.js**: ssh를 사용해 Linux와 연결
- **host: '192.168.10.131', // 연결할 리눅스 서버의 IP 주소**
- **port: 22, // SSH 기본 포트 (22번)**
- **username: 'hjg', //사용자 이름**
- **userpassword: '1234', //사용자 비밀번호**

## 8/2 추가 사항

- **Node.js 학습 커밋**

- **Express.js 서버 구현**
- **SSH2를 이용한 리눅스 서버 연결**
- **프로세스 정보 웹 API 제공**
- **child_process를 이용한 시스템 명령어 실행**
