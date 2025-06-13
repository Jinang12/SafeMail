import { useState } from 'react';

const API_URL = 'http://localhost:8000/api';

export default function SMSScan() {
  const [smsContent, setSmsContent] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_URL}/analyze-sms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: smsContent }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to analyze SMS');
      }

      setResult(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'An error occurred while analyzing the SMS');
      setResult(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="sms-scan-container">
      <div className="scan-header">
        <h2 className="terminal-title">SMS Security Scanner</h2>
        <p className="terminal-text">
          Paste your SMS content below for instant security analysis
        </p>
      </div>

      <form onSubmit={handleSubmit} className="scan-form">
        <div className="form-group">
          <label htmlFor="smsContent" className="form-label">SMS Content</label>
          <textarea
            id="smsContent"
            value={smsContent}
            onChange={(e) => setSmsContent(e.target.value)}
            placeholder="Paste your SMS content here..."
            className="sms-textarea"
            rows="5"
            maxLength="160"
            required
          />
          <div className="char-count">
            {smsContent.length}/160 characters
          </div>
        </div>

        <button 
          type="submit" 
          className="scan-button"
          disabled={isAnalyzing || !smsContent.trim()}
        >
          {isAnalyzing ? 'Analyzing...' : 'Scan SMS'}
        </button>
      </form>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <p className="error-details">
            Please check if:
            <ul>
              <li>The backend server is running</li>
              <li>You're connected to the same network</li>
              <li>The SMS content is not empty</li>
            </ul>
          </p>
        </div>
      )}

      {result && (
        <div className={`scan-result ${result.is_safe ? 'safe' : 'unsafe'}`}>
          <h3 className="result-title">
            {result.is_safe ? '✅ SMS is Safe' : '⚠️ Potential Threats Detected'}
          </h3>
          <div className="result-details">
            <p className="confidence-score">
              Confidence Score: {result.confidence.toFixed(1)}%
            </p>
            <p className="analysis-text">{result.analysis}</p>
            {result.threats.length > 0 && (
              <div className="threats-list">
                <h4>Detected Threats:</h4>
                <ul>
                  {result.threats.map((threat, index) => (
                    <li key={index}>{threat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 