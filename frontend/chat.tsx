import React, { useState, useRef } from 'react';
import './DiscussionSummarizer.css';

interface SummaryResult {
  success: boolean;
  summary: string;
  stats: {
    original_words: number;
    summary_words: number;
    compression_ratio: string;
    reduction: number;
  };
  filename: string;
}

interface HistoryItem {
  filename: string;
  timestamp: string;
  summary: string;
  stats: {
    original_words: number;
    summary_words: number;
    compression_ratio: string;
    reduction: number;
  };
}

const DiscussionSummarizer: React.FC = () => {
  const [discussionText, setDiscussionText] = useState('');
  const [summary, setSummary] = useState('');
  const [stats, setStats] = useState<SummaryResult['stats'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle text input
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDiscussionText(e.target.value);
    setError('');
  };

  // Validate file type
  const validateFile = (file: File): boolean => {
    const allowedTypes = ['text/plain', 'application/json', 'text/csv'];
    const allowedExtensions = ['.txt', '.json', '.csv'];
    
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExtension = allowedExtensions.some(ext => 
      file.name.toLowerCase().endsWith(ext)
    );

    return hasValidType || hasValidExtension;
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!validateFile(file)) {
      setError('Invalid file type. Please upload .txt, .json, or .csv files only.');
      return;
    }

    setLoading(true);
    setError('');
    setUploadProgress(0);

    try {
      const reader = new FileReader();

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          setUploadProgress(percentComplete);
        }
      };

      reader.onload = async (event) => {
        try {
          const content = event.target?.result as string;
          setDiscussionText(content);
          setUploadProgress(100);

          // Auto-summarize after upload
          await summarizeDiscussion(content);
        } catch (err) {
          setError('Failed to read the file – Could not extract text from this discussion export.');
        } finally {
          setLoading(false);
          setUploadProgress(0);
        }
      };

      reader.onerror = () => {
        setError('Failed to read the file – Could not extract text from this discussion export.');
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Failed to connect to the server – Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  // Summarize discussion
  const summarizeDiscussion = async (text?: string) => {
    const textToSummarize = text || discussionText;

    if (!textToSummarize.trim()) {
      setError('Please enter or upload discussion messages.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chat_text: textToSummarize }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data: SummaryResult = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setStats(data.stats);
      } else {
        setError('No summary could be generated for this discussion thread.');
      }
    } catch (err) {
      setError('No response from the server – No summary could be generated for this.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch history
  const fetchHistory = async () => {
    try {
      const response = await fetch('/history');
      const data = await response.json();
      setHistory(data.summaries);
      setShowHistory(true);
    } catch (err) {
      setError('Failed to load history.');
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Download summary
  const downloadSummary = () => {
    if (!summary) return;

    const element = document.createElement('a');
    const file = new Blob([summary], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `discussion_summary_${new Date().getTime()}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const styles = `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .discussion-summarizer {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    }

    .header {
      text-align: center;
      color: white;
      margin-bottom: 40px;
    }

    .header h1 {
      font-size: 2.5rem;
      margin: 0 0 10px 0;
      font-weight: 700;
    }

    .header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
    }

    .input-section,
    .output-section {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .input-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }

    .tab-btn {
      padding: 10px 20px;
      border: none;
      background: none;
      cursor: pointer;
      font-size: 1rem;
      color: #666;
      border-bottom: 3px solid transparent;
      transition: all 0.3s;
      font-weight: 500;
    }

    .tab-btn.active {
      color: #667eea;
      border-bottom-color: #667eea;
    }

    .tab-btn:hover {
      color: #667eea;
    }

    .discussion-input {
      width: 100%;
      padding: 15px;
      border: 2px solid #e0e0e0;
      border-radius: 8px;
      font-size: 1rem;
      font-family: 'Courier New', monospace;
      resize: vertical;
      transition: border-color 0.3s;
      line-height: 1.6;
    }

    .discussion-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .char-count {
      text-align: right;
      color: #999;
      font-size: 0.9rem;
      margin-top: 8px;
    }

    .file-upload {
      margin: 20px 0;
      padding: 20px;
      border: 2px dashed #667eea;
      border-radius: 8px;
      text-align: center;
      background: #f8f9ff;
    }

    .upload-btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 600;
      transition: background 0.3s, transform 0.2s;
    }

    .upload-btn:hover:not(:disabled) {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .upload-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .upload-hint {
      color: #999;
      font-size: 0.9rem;
      margin-top: 10px;
    }

    .progress-container {
      margin: 20px 0;
    }

    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transition: width 0.3s;
    }

    .progress-text {
      text-align: center;
      color: #667eea;
      font-size: 0.9rem;
      margin-top: 8px;
      font-weight: 600;
    }

    .file-preview {
      margin: 20px 0;
      padding: 15px;
      background: #f8f9ff;
      border-radius: 8px;
      border-left: 4px solid #667eea;
    }

    .file-preview h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 1rem;
    }

    .preview-stats {
      display: flex;
      gap: 20px;
      margin-bottom: 10px;
      font-size: 0.9rem;
      color: #666;
      flex-wrap: wrap;
    }

    .preview-content {
      color: #666;
      font-size: 0.9rem;
      line-height: 1.5;
      max-height: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .error-message {
      padding: 12px 15px;
      background: #fee;
      color: #c33;
      border-radius: 6px;
      margin: 15px 0;
      border-left: 4px solid #c33;
      font-size: 0.95rem;
    }

    .summarize-btn {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      margin-top: 20px;
    }

    .summarize-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
    }

    .summarize-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .output-section h2 {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.5rem;
    }

    .summary-box {
      background: #f8f9ff;
      padding: 20px;
      border-radius: 8px;
      border-left: 4px solid #667eea;
      line-height: 1.8;
      color: #333;
      margin-bottom: 20px;
    }

    .stats-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
      margin: 20px 0;
    }

    .stat-card {
      background: #f8f9ff;
      padding: 15px;
      border-radius: 8px;
      text-align: center;
      border: 1px solid #e0e0e0;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
    }

    .stat-label {
      display: block;
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 8px;
      font-weight: 500;
    }

    .stat-value {
      display: block;
      font-size: 1.8rem;
      font-weight: 700;
      color: #667eea;
    }

    .action-buttons {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .action-btn {
      flex: 1;
      padding: 12px;
      border: 2px solid #667eea;
      background: white;
      color: #667eea;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s;
      font-size: 0.95rem;
    }

    .action-btn:hover {
      background: #667eea;
      color: white;
      transform: translateY(-2px);
    }

    .history-section {
      grid-column: 1 / -1;
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
    }

    .history-btn {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s, transform 0.2s;
      font-size: 1rem;
    }

    .history-btn:hover {
      background: #5568d3;
      transform: translateY(-2px);
    }

    .history-list {
      margin-top: 20px;
    }

    .history-list h3 {
      margin-bottom: 15px;
      color: #333;
      font-size: 1.2rem;
    }

    .history-item {
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      margin-bottom: 10px;
      background: #f8f9ff;
      transition: all 0.2s;
    }

    .history-item:hover {
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.1);
      border-color: #667eea;
    }

    .history-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
      font-size: 0.9rem;
      flex-wrap: wrap;
      gap: 10px;
    }

    .history-time {
      color: #667eea;
      font-weight: 600;
    }

    .history-stats {
      color: #666;
    }

    .history-summary {
      color: #666;
      line-height: 1.6;
      margin: 0;
      font-size: 0.95rem;
    }

    @media (max-width: 768px) {
      .container {
        grid-template-columns: 1fr;
      }

      .header h1 {
        font-size: 1.8rem;
      }

      .stats-container {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
      }

      .history-header {
        flex-direction: column;
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="discussion-summarizer">
        <header className="header">
          <h1>Discussion Summarizer</h1>
          <p>Extract key insights from research discussions instantly</p>
        </header>

        <div className="container">
          {/* Input Section */}
          <div className="input-section">
            <div className="input-tabs">
              <button className="tab-btn active">Paste Text</button>
              <button className="tab-btn">Upload File</button>
            </div>

            {/* Text Input */}
            <div className="input-area">
              <textarea
                value={discussionText}
                onChange={handleTextChange}
                placeholder="Paste your discussion thread here... (e.g., Slack conversations, forum threads, comment sections)"
                rows={10}
                className="discussion-input"
              />
              <div className="char-count">
                {discussionText.length} characters
              </div>
            </div>

            {/* File Upload */}
            <div className="file-upload">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.json,.csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="upload-btn"
                disabled={loading}
              >
                📁 Upload Discussion File
              </button>
              <p className="upload-hint">
                Only allow supported formats (.txt, .json, .csv)
              </p>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="progress-text">
                  Uploading... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}

            {/* File Preview */}
            {discussionText && (
              <div className="file-preview">
                <h3>Discussion Preview</h3>
                <div className="preview-stats">
                  <span>📝 {discussionText.split('\n').length} lines</span>
                  <span>💬 {discussionText.split('\n').filter(l => l.trim()).length} messages</span>
                  <span>📊 {discussionText.split(' ').length} words</span>
                </div>
                <div className="preview-content">
                  {discussionText.substring(0, 300)}...
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="error-message">
                ⚠️ {error}
              </div>
            )}

            {/* Summarize Button */}
            <button
              onClick={() => summarizeDiscussion()}
              disabled={!discussionText.trim() || loading}
              className="summarize-btn"
            >
              {loading ? 'Summarizing...' : '✨ Summarize Discussion'}
            </button>
          </div>

          {/* Output Section */}
          {summary && (
            <div className="output-section">
              <h2>Summary</h2>
              <div className="summary-box">
                <p>{summary}</p>
              </div>

              {/* Statistics */}
              {stats && (
                <div className="stats-container">
                  <div className="stat-card">
                    <span className="stat-label">Original Words</span>
                    <span className="stat-value">{stats.original_words}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Summary Words</span>
                    <span className="stat-value">{stats.summary_words}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Compression</span>
                    <span className="stat-value">{stats.compression_ratio}</span>
                  </div>
                  <div className="stat-card">
                    <span className="stat-label">Reduction</span>
                    <span className="stat-value">{stats.reduction} words</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  onClick={() => copyToClipboard(summary)}
                  className="action-btn copy-btn"
                >
                  📋 Copy Summary
                </button>
                <button
                  onClick={downloadSummary}
                  className="action-btn download-btn"
                >
                  ⬇️ Download
                </button>
              </div>
            </div>
          )}

          {/* History Section */}
          <div className="history-section">
            <button
              onClick={fetchHistory}
              className="history-btn"
            >
              📚 View History ({history.length})
            </button>

            {showHistory && history.length > 0 && (
              <div className="history-list">
                <h3>Previous Summaries</h3>
                {history.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-header">
                      <span className="history-time">
                        {new Date(item.timestamp).toLocaleString()}
                      </span>
                      <span className="history-stats">
                        {item.stats.original_words} → {item.stats.summary_words} words
                      </span>
                    </div>
                    <p className="history-summary">{item.summary}</p>
                  </div>
                ))}
            </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DiscussionSummarizer;
