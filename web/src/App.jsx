import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const [command, setCommand] = useState('')
  const [output, setOutput] = useState([])
  const outputRef = useRef(null)

  useEffect(() => {
    // WebSocket 연결
    const ws = new WebSocket('ws://localhost:8081')
    
    ws.onopen = () => {
      console.log('WebSocket 연결됨')
      setConnected(true)
      setSocket(ws)
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      console.log('메시지 받음:', data)
      
      setOutput(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: data.type,
        command: data.command,
        content: data.message || data.output
      }])
    }

    ws.onclose = () => {
      console.log('WebSocket 연결 종료됨')
      setConnected(false)
      setSocket(null)
    }

    ws.onerror = (error) => {
      console.error('WebSocket 오류:', error)
      setOutput(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'error',
        content: 'WebSocket 연결 오류가 발생했습니다.'
      }])
    }

    return () => {
      ws.close()
    }
  }, [])

  useEffect(() => {
    // 출력 영역 자동 스크롤
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [output])

  const sendCommand = () => {
    if (socket && connected && command.trim()) {
      socket.send(JSON.stringify({
        type: 'command',
        command: command.trim()
      }))
      
      setOutput(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: 'command',
        content: `$ ${command.trim()}`
      }])
      
      setCommand('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendCommand()
    }
  }

  const clearOutput = () => {
    setOutput([])
  }

  return (
    <div className="App">
      <header className="header">
        <h1>🖥️ Process Monitor</h1>
        <div className={`status ${connected ? 'connected' : 'disconnected'}`}>
          {connected ? '🟢 연결됨' : '🔴 연결 안됨'}
        </div>
      </header>

      <main className="main">
        <div className="terminal">
          <div className="terminal-header">
            <span>터미널</span>
            <button onClick={clearOutput} className="clear-btn">
              지우기
            </button>
          </div>
          
          <div className="terminal-output" ref={outputRef}>
            {output.map((item, index) => (
              <div key={index} className={`output-line ${item.type}`}>
                <span className="timestamp">[{item.timestamp}]</span>
                {item.command && <span className="command-name">[{item.command}]</span>}
                <span className="content">{item.content}</span>
              </div>
            ))}
          </div>

          <div className="terminal-input">
            <span className="prompt">$ </span>
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="명령어를 입력하세요 (예: ps, ps aux, whoami)"
              disabled={!connected}
            />
            <button onClick={sendCommand} disabled={!connected || !command.trim()}>
              실행
            </button>
          </div>
        </div>

        <div className="help">
          <h3>📋 사용 가능한 명령어</h3>
          <ul>
            <li><code>ps</code> - 현재 프로세스 목록</li>
            <li><code>ps aux</code> - 상세한 프로세스 정보</li>
            <li><code>ps -ef</code> - 전체 프로세스 정보</li>
            <li><code>top -n 1</code> - 시스템 리소스 사용량</li>
            <li><code>whoami</code> - 현재 사용자</li>
            <li><code>date</code> - 현재 시간</li>
            <li><code>uptime</code> - 시스템 가동 시간</li>
          </ul>
        </div>
      </main>
    </div>
  )
}

export default App
