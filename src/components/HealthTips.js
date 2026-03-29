import { useEffect, useState } from 'react';
import { api } from '../services/api';
import './HealthTips.css';

function HealthTips() {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTips = async () => {
      try {
        const healthTips = await api.getHealthTips();
        setTips(healthTips);
      } catch (err) {
        setError(err.message || 'Failed to load health tips');
      } finally {
        setLoading(false);
      }
    };

    loadTips();
  }, []);

  if (loading) {
    return <div className="health-tips">Loading health tips...</div>;
  }

  if (error) {
    return <div className="health-tips error">{error}</div>;
  }

  return (
    <div className="health-tips">
      <h2>💡 Health Tips</h2>
      <p>General wellness advice to support your health journey.</p>

      <div className="tips-grid">
        {tips.map((tip, index) => (
          <div key={index} className="tip-card">
            <div className="tip-number">{index + 1}</div>
            <p>{tip}</p>
          </div>
        ))}
      </div>

      <div className="tips-footer">
        <p><strong>Remember:</strong> These are general tips and not a substitute for professional medical advice. Always consult healthcare providers for personalized guidance.</p>
      </div>
    </div>
  );
}

export default HealthTips;