import { useState } from 'react';
import { api } from '../services/api';
import './SymptomAnalysis.css';

function SymptomAnalysis() {
  const [queryText, setQueryText] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!queryText.trim()) return;

    setLoading(true);
    setError('');
    setResponse(null);

    try {
      const result = await api.analyzeSymptoms({
        queryType: 'symptom_analysis',
        queryText: queryText.trim(),
      });
      setResponse(result);
    } catch (err) {
      setError(err.message || 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'emergency': return '#dc3545';
      case 'high': return '#fd7e14';
      case 'medium': return '#ffc107';
      case 'low': return '#28a745';
      default: return '#6c757d';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'emergency': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      case 'low': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <div className="symptom-analysis">
      <h2>Symptom Analysis</h2>
      <p>Describe your symptoms for intelligent analysis and recommendations.</p>

      <div className="analysis-input">
        <label htmlFor="symptoms">Describe Symptoms:</label>
        <textarea
          id="symptoms"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="e.g., I have chest pain and difficulty breathing..."
          rows={4}
        />
        <button
          onClick={handleAnalyze}
          disabled={!queryText.trim() || loading}
          className="analyze-btn"
        >
          {loading ? 'Analyzing...' : 'Analyze Symptoms'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {response && (
        <div className="analysis-result">
          <div
            className="severity-badge"
            style={{ backgroundColor: getSeverityColor(response.severityLevel) }}
          >
            {getSeverityIcon(response.severityLevel)} {response.severityLevel?.toUpperCase()}
          </div>
          <div className="response-content">
            <h3>Analysis & Recommendations</h3>
            <div className="response-text">
              {response.responseText.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>
          <div className="response-meta">
            <small>Analyzed on {new Date(response.createdAt).toLocaleString()}</small>
          </div>
        </div>
      )}
    </div>
  );
}

export default SymptomAnalysis;