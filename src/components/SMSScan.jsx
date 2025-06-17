import { useState } from 'react';

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
      const response = await fetch('http://localhost:8000/api/analyze-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: smsContent }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to analyze SMS');
      }

      const data = await response.json();
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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-[#39ff14] to-[#2ecc71] mb-4">
            SMS Security Scanner
          </h2>
          <p className="text-xl text-gray-400">
            Advanced AI-powered analysis for your messages
          </p>
        </div>

        <div className="backdrop-blur-xl bg-black/40 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="smsContent" className="block text-lg font-semibold text-[#39ff14] mb-3">
                Enter SMS Content
              </label>
              <div className="relative group">
                <textarea
                  id="smsContent"
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  className="w-full px-6 py-4 bg-black/50 rounded-xl text-white placeholder-gray-500 
                    focus:outline-none focus:ring-2 focus:ring-[#39ff14]/50 focus:border-transparent 
                    transition-all duration-300 ease-in-out"
                  rows={4}
                  placeholder="Paste your SMS content here..."
                  required
                />
                <div className="absolute bottom-3 right-3 text-sm text-[#39ff14]/50 group-hover:text-[#39ff14]/70 transition-colors duration-300">
                  {smsContent.length}/160
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !smsContent.trim()}
              className={`w-full flex justify-center py-4 px-6 rounded-xl text-lg font-semibold
                transition-all duration-300 ease-in-out transform hover:scale-[1.02]
                ${isAnalyzing || !smsContent.trim() 
                  ? 'bg-gray-800/50 cursor-not-allowed text-gray-500'
                  : 'bg-gradient-to-r from-[#39ff14] to-[#2ecc71] text-black hover:shadow-lg hover:shadow-[#39ff14]/20'
                }`}
            >
              {isAnalyzing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </span>
              ) : (
                'Analyze SMS'
              )}
            </button>
          </form>

          {error && (
            <div className="mt-8 p-6 rounded-xl bg-red-500/10">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-red-500">Error</h3>
                  <p className="mt-2 text-red-400">{error}</p>
                </div>
              </div>
            </div>
          )}

          {result && (
            <div className={`mt-8 p-8 rounded-2xl backdrop-blur-xl transition-all duration-300 ${
              result.is_safe 
                ? 'bg-gradient-to-br from-[#39ff14]/5 to-transparent' 
                : 'bg-gradient-to-br from-red-500/5 to-transparent'
            }`}>
              <div className="flex items-center mb-8">
                <div className={`flex-shrink-0 p-4 rounded-2xl ${
                  result.is_safe 
                    ? 'bg-gradient-to-br from-[#39ff14]/10 to-[#39ff14]/5' 
                    : 'bg-gradient-to-br from-red-500/10 to-red-500/5'
                }`}>
                  {result.is_safe ? (
                    <svg className="h-8 w-8 text-[#39ff14]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  )}
                </div>
                <div className="ml-5">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {result.is_safe ? 'SMS is Safe' : 'Potential Threats Detected'}
                  </h3>
                  <p className="text-gray-400">
                    {result.is_safe 
                      ? 'Your message has been analyzed and appears to be secure'
                      : 'We\'ve detected some potential security concerns'}
                  </p>
                </div>
              </div>

              <div className="grid gap-6">
                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-[#39ff14]">Confidence Score</h4>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                      result.is_safe 
                        ? 'bg-[#39ff14]/10 text-[#39ff14]'
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {result.confidence.toFixed(1)}%
                    </div>
                  </div>
                  <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        result.is_safe ? 'bg-[#39ff14]' : 'bg-red-500'
                      }`}
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                  <h4 className="text-lg font-semibold text-[#39ff14] mb-4">Analysis</h4>
                  <p className="text-gray-300 leading-relaxed">
                    {result.analysis}
                  </p>
                </div>

                {result.threats && result.threats.length > 0 && (
                  <div className="bg-black/20 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-[#39ff14]">Potential Threats</h4>
                      <span className="px-4 py-2 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                        {result.threats.length} detected
                      </span>
                    </div>
                    <ul className="space-y-4">
                      {result.threats.map((threat, index) => (
                        <li key={index} className="flex items-start group">
                          <div className="flex-shrink-0 mt-1">
                            <div className="p-2 rounded-lg bg-red-500/10 group-hover:bg-red-500/20 transition-colors duration-300">
                              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <div className="ml-4">
                            <p className="text-red-400 group-hover:text-red-300 transition-colors duration-300">
                              {threat}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 