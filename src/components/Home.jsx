import Scene3D from './Scene3D';
import Services from './Services';
import About from './About';

export default function Home() {
  return (
    <>
      <div className="home-container">
        <div className="text-content">
          <h1 className="terminal-title">SafeMail</h1>
          <p className="terminal-text">
            Welcome to SafeMail, your advanced email security solution.
          </p>
          <p className="terminal-text">
            Our AI-powered system analyzes emails in real-time to detect and prevent:
          </p>
          <ul className="terminal-list">
            <li>Phishing attempts</li>
            <li>Malware threats</li>
            <li>Spam messages</li>
            <li>Suspicious attachments</li>
          </ul>
          <p className="terminal-text">
            Interact with the 3D model to explore our security features.
          </p>
        </div>
        <div className="scene-wrapper">
          <Scene3D />
        </div>
      </div>
      <Services />
      <About />
    </>
  );
} 