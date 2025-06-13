import { useEffect, useState } from 'react';

const terminalTexts = [
  "Initializing SafeMail Security Protocol...",
  "Scanning network interfaces...",
  "Establishing secure connection...",
  "Running vulnerability assessment...",
  "Checking for malicious patterns...",
  "Analyzing email headers...",
  "Verifying sender authenticity...",
  "Monitoring for suspicious activities...",
  "Encrypting sensitive data...",
  "Updating security protocols...",
  "System Status: SECURE",
  "All systems operational",
];

const randomHex = () => Math.floor(Math.random() * 16).toString(16).toUpperCase();
const randomBinary = () => Math.random() > 0.5 ? '1' : '0';

function Terminal() {
  const [lines, setLines] = useState([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [binaryLine, setBinaryLine] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [matrixEffect, setMatrixEffect] = useState([]);

  useEffect(() => {
    const typeWriter = () => {
      if (currentLine < terminalTexts.length) {
        const currentText = terminalTexts[currentLine];
        const currentLength = lines.length > 0 ? lines[lines.length - 1].length : 0;
        
        if (currentLength < currentText.length) {
          setLines(prev => {
            const newLines = [...prev];
            if (newLines.length === 0) {
              newLines.push(currentText.slice(0, currentLength + 1));
            } else {
              newLines[newLines.length - 1] = currentText.slice(0, currentLength + 1);
            }
            return newLines;
          });
        } else {
          setCurrentLine(prev => prev + 1);
          setLines(prev => [...prev, '']);
        }
      } else {
        setIsTyping(false);
      }
    };

    const interval = setInterval(typeWriter, 50);
    return () => clearInterval(interval);
  }, [currentLine, lines]);

  useEffect(() => {
    if (!isTyping) {
      const binaryInterval = setInterval(() => {
        setBinaryLine(prev => {
          const newLine = Array(40).fill(0).map(() => randomBinary()).join('');
          return newLine;
        });
      }, 100);

      return () => clearInterval(binaryInterval);
    }
  }, [isTyping]);

  // Matrix rain effect
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 20);
    const initialMatrix = Array(columns).fill(0).map(() => ({
      value: randomHex(),
      speed: Math.random() * 0.5 + 0.5,
      position: Math.random() * -100
    }));
    setMatrixEffect(initialMatrix);

    const matrixInterval = setInterval(() => {
      setMatrixEffect(prev => prev.map(col => ({
        ...col,
        value: randomHex(),
        position: col.position + col.speed > 100 ? -10 : col.position + col.speed
      })));
    }, 50);

    return () => clearInterval(matrixInterval);
  }, []);

  return (
    <div className="terminal-wrapper">
      <div className="matrix-background">
        {matrixEffect.map((col, i) => (
          <div
            key={i}
            className="matrix-column"
            style={{
              left: `${i * 20}px`,
              top: `${col.position}%`,
              animationDuration: `${1 / col.speed}s`
            }}
          >
            {col.value}
          </div>
        ))}
      </div>
      <div className="terminal-content">
        <div className="terminal-header">
          <div className="terminal-title">SafeMail Security Terminal</div>
          <div className="terminal-status">
            <span className="status-indicator"></span>
            <span className="status-text">LIVE</span>
          </div>
        </div>
        <div className="terminal-output">
          {lines.map((line, index) => (
            <div key={index} className="terminal-line">
              <span className="terminal-prompt">$</span>
              <span className="terminal-text">{line}</span>
              {index === lines.length - 1 && isTyping && (
                <span className="terminal-cursor">_</span>
              )}
            </div>
          ))}
          {!isTyping && (
            <>
              <div className="terminal-line binary-line">{binaryLine}</div>
              <div className="terminal-line status-line">
                <span className="status-text">SYSTEM SECURE</span>
                <span className="status-indicator"></span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Terminal; 