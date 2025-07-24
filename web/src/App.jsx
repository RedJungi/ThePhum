
// React 라이브러리에서 필요한 훅(Hook)들을 가져옵니다
// useState: 컴포넌트의 상태(state)를 관리하기 위한 훅
// useEffect: 컴포넌트의 생명주기(마운트, 업데이트, 언마운트)에서 부수 효과를 처리하는 훅
import React, { useState, useEffect } from 'react';
// CSS 스타일 파일을 가져옵니다 (현재는 사용하지 않음)
import './App.css'

// App 컴포넌트 정의 - 전체 애플리케이션의 메인 컴포넌트
function App() {
  // WebSocket 연결 객체를 저장하는 상태 변수
  // null로 초기화되며, 연결이 성공하면 WebSocket 객체가 저장됩니다
  const [socket, setSocket] = useState(null);
  
  // 서버로부터 받은 명령어 실행 결과를 저장하는 상태 변수
  // 빈 문자열로 초기화되며, 서버 응답이 오면 결과가 저장됩니다
  const [output, setOutput] = useState('');
  
  // 사용자가 입력한 종료할 프로세스의 PID를 저장하는 상태 변수
  // 빈 문자열로 초기화되며, 사용자가 입력하면 해당 값이 저장됩니다
  const [killPid, setKillPid] = useState('');
  
  // WebSocket 연결 상태를 나타내는 불린(boolean) 상태 변수
  // false로 초기화되며, 연결되면 true, 연결 해제되면 false가 됩니다
  const [connected, setConnected] = useState(false);

  // useEffect 훅: 컴포넌트가 마운트(처음 렌더링)될 때 실행되는 부수 효과
  // 빈 배열 []을 두 번째 매개변수로 전달하면 컴포넌트 마운트 시 한 번만 실행됩니다
  useEffect(() => {
    // WebSocket 객체 생성: localhost:3001 포트의 WebSocket 서버에 연결
    // 'ws://' 프로토콜을 사용하여 WebSocket 연결을 시도합니다
    const ws = new WebSocket('ws://localhost:3001');
    
    // onopen 이벤트: WebSocket 연결이 성공적으로 열렸을 때 실행되는 콜백 함수
    ws.onopen = () => {
      console.log(' WebSocket 연결됨'); // 콘솔에 연결 성공 메시지 출력
      setConnected(true); // 연결 상태를 true로 변경
      setSocket(ws); // WebSocket 객체를 상태에 저장
    };
    
    // onmessage 이벤트: 서버로부터 메시지를 받았을 때 실행되는 콜백 함수
    ws.onmessage = (event) => {
      // event.data는 서버에서 보낸 JSON 문자열이므로 JavaScript 객체로 파싱
      const data = JSON.parse(event.data);
      console.log('받은 데이터:', data); // 받은 데이터를 콘솔에 출력
      
      // 서버 응답에 output 필드가 있으면 (명령어 실행 결과)
      if (data.output) {
        setOutput(data.output); // 출력 결과를 화면에 표시
      } 
      // 서버 응답에 error 필드가 있으면 (오류 메시지)
      else if (data.error) {
        setOutput(data.error); // 오류 메시지를 화면에 표시
      }
    };
    
    // onclose 이벤트: WebSocket 연결이 닫혔을 때 실행되는 콜백 함수
    ws.onclose = () => {
      console.log('연결 해제됨'); // 콘솔에 연결 해제 메시지 출력
      setConnected(false); // 연결 상태를 false로 변경
    };
    
    // onerror 이벤트: WebSocket 연결 중 오류가 발생했을 때 실행되는 콜백 함수
    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error); // 콘솔에 오류 메시지 출력
      setConnected(false); // 연결 상태를 false로 변경
    };

    // cleanup 함수: 컴포넌트가 언마운트될 때 실행됩니다
    // 메모리 누수를 방지하기 위해 WebSocket 연결을 정리합니다
    return () => ws.close();
  }, []); // 빈 의존성 배열: 컴포넌트 마운트 시 한 번만 실행

  // sendCommand 함수: 서버에 명령어를 전송하는 함수
  // command: 실행할 명령어 ('ps', 'top', 'kill')
  // value: 명령어와 함께 보낼 값 (kill 명령의 경우 PID, 기본값은 null)
  const sendCommand = (command, value = null) => {
    // WebSocket이 존재하고 연결이 되어있는지 확인
    if (socket && connected) {
      // 콘솔에 전송할 명령어 정보 출력 (디버깅용)
      console.log(`명령어 전송: ${command}`, value || '');
      // JSON 형태로 명령어와 값을 서버에 전송
      // JSON.stringify(): JavaScript 객체를 JSON 문자열로 변환
      socket.send(JSON.stringify({ command, value }));
    }
  };

  // return문: 컴포넌트가 렌더링할 JSX를 반환합니다
  // JSX는 JavaScript XML로, HTML과 비슷한 문법으로 UI를 작성할 수 있게 해줍니다
  return (
    // 메인 컨테이너 div: 전체 애플리케이션을 감싸는 최상위 요소
    // style 속성: 인라인 CSS 스타일을 JavaScript 객체 형태로 작성
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      {/* h1 태그: 페이지의 제목을 표시하는 헤딩 요소 */}
      <h1>🖥️ 프로세스 모니터</h1>
      
      {/* 연결 상태 표시 영역 */}
      <div style={{ marginBottom: '20px' }}>
        상태: <span style={{ color: connected ? 'green' : 'red' }}>
          {/* 삼항 연산자를 사용한 조건부 렌더링 */}
          {connected ? ' 연결됨' : ' 연결 해제됨'}
        </span>
      </div>

      {/* 명령어 버튼들을 담는 컨테이너 */}
      <div style={{ marginBottom: '20px' }}>
        {/* ps 명령어 실행 버튼 */}
        <button 
          onClick={() => sendCommand('ps')} // 클릭 시 'ps' 명령어 전송
          disabled={!connected} // 연결되지 않았으면 버튼 비활성화
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          ps 보기
        </button>
        
        {/* top 명령어 실행 버튼 */}
        <button 
          onClick={() => sendCommand('top')} // 클릭 시 'top' 명령어 전송
          disabled={!connected} // 연결되지 않았으면 버튼 비활성화
          style={{ marginRight: '10px', padding: '8px 16px' }}
        >
          top 보기
        </button>
      </div>

      {/* 프로세스 종료(Kill) 입력 영역 */}
      <div style={{ marginBottom: '20px' }}>
        {/* PID 입력 필드 */}
        <input
          type="text" // 텍스트 입력 타입
          placeholder="PID 입력" // 입력 필드에 표시되는 힌트 텍스트
          value={killPid} // 현재 입력된 값 (상태와 연결)
          onChange={(e) => setKillPid(e.target.value)} // 입력값 변경 시 상태 업데이트
          style={{ marginRight: '10px', padding: '8px' }}
        />
        {/* Kill 실행 버튼 */}
        <button 
          onClick={() => {
            sendCommand('kill', killPid); // 'kill' 명령어와 PID를 함께 전송
            setKillPid(''); // 전송 후 입력 필드 초기화
          }}
          disabled={!connected || !killPid} // 연결 안됨 또는 PID 없으면 비활성화
          style={{ padding: '8px 16px', backgroundColor: '#ff4444', color: 'white' }}
        >
          Kill
        </button>
      </div>

      {/* 명령어 실행 결과를 표시하는 출력창 */}
      <div style={{
        backgroundColor: '#000', // 검은색 배경 (터미널처럼)
        color: '#0f0', // 초록색 텍스트 (터미널처럼)
        padding: '15px', // 내부 여백
        borderRadius: '5px', // 둥근 모서리
        maxHeight: '400px', // 최대 높이 제한
        overflow: 'auto', // 내용이 넘치면 스크롤 표시
        fontSize: '12px', // 글자 크기
        whiteSpace: 'pre-wrap' // 공백과 줄바꿈을 그대로 유지
      }}>
        {/* 출력 결과가 있으면 표시, 없으면 기본 메시지 표시 */}
        {/* 논리 OR 연산자(||)를 사용한 기본값 설정 */}
        {output || '명령어 결과가 여기에 표시됩니다...'}
      </div>
    </div>
  );
}
// export default: App 컴포넌트를 기본 내보내기로 설정
// 이렇게 하면 다른 파일에서 import App from './App' 형태로 가져올 수 있습니다
export default App
