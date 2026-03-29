import './SmartTriagePreview.css';

function SmartTriagePreview() {
  const triageExample = {
    severity: 'high',
    label: 'HIGH PRIORITY',
    percentage: 72,
    description: 'Symptoms may require urgent care',
    recommendations: [
      'Seek medical attention within 24 hours',
      'Monitor symptoms for any changes',
      'Avoid strenuous activities',
      'Stay well hydrated',
    ],
  };

  const severityLevels = [
    { level: 'Low', color: 'triage-low', percentage: 20 },
    { level: 'Medium', color: 'triage-medium', percentage: 45 },
    { level: 'High', color: 'triage-high', percentage: 72 },
    { level: 'Emergency', color: 'triage-emergency', percentage: 95 },
  ];

  return (
    <section className="smart-triage-preview">
      <div className="triage-container">
        <div className="section-header">
          <h2>Smart Triage System</h2>
          <p>AI-powered severity assessment and clinical recommendations</p>
        </div>

        <div className="triage-grid">
          {/* Live Triage Example */}
          <div className="triage-demo-card">
            <h3>Live Analysis Example</h3>

            <div className="triage-badge" style={{ '--badge-color': '#ff8c42' }}>
              {triageExample.label}
            </div>

            <div className="risk-score-container">
              <div className="risk-meter">
                <div className="risk-fill" style={{ width: `${triageExample.percentage}%` }}></div>
              </div>
              <div className="risk-percentage">{triageExample.percentage}%</div>
            </div>

            <p className="triage-description">{triageExample.description}</p>

            <div className="recommendations-list">
              <h4>Recommendations:</h4>
              <ul>
                {triageExample.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Severity Levels */}
          <div className="severity-levels-card">
            <h3>Severity Levels</h3>

            <div className="severity-levels-grid">
              {severityLevels.map((item, idx) => (
                <div key={idx} className={`severity-item ${item.color}`}>
                  <div className="severity-header">
                    <span className="severity-dot"></span>
                    <span className="severity-label">{item.level}</span>
                  </div>
                  <div className="severity-bar">
                    <div className="severity-fill" style={{ width: `${item.percentage}%` }}></div>
                  </div>
                  <span className="severity-percentage">{item.percentage}%</span>
                </div>
              ))}
            </div>

            <div className="triage-benefits">
              <h4>Key Features:</h4>
              <div className="benefits-grid">
                <div className="benefit-item">
                  <span className="benefit-icon">⚡</span>
                  <span>Instant Analysis</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🎯</span>
                  <span>Accurate Triage</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">📋</span>
                  <span>Clinical Recommendations</span>
                </div>
                <div className="benefit-item">
                  <span className="benefit-icon">🔒</span>
                  <span>Secure & Compliant</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SmartTriagePreview;
