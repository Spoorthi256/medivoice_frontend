import { useEffect, useState } from 'react';
import { FaUsers, FaHeartPulse, FaLightbulb, FaPercent } from 'react-icons/fa6';
import './StatisticsPanel.css';

function StatisticsPanel() {
  const [stats, setStats] = useState([
    { id: 1, label: 'Patients Served', value: 0, target: 2847, icon: FaUsers, color: 'stat-blue' },
    { id: 2, label: 'Diagnoses Made', value: 0, target: 5623, icon: FaHeartPulse, color: 'stat-green' },
    { id: 3, label: 'AI Insights', value: 0, target: 12450, icon: FaLightbulb, color: 'stat-purple' },
    { id: 4, label: 'System Accuracy', value: 0, target: 94, suffix: '%', icon: FaPercent, color: 'stat-orange' },
  ]);

  useEffect(() => {
    const timers = stats.map((stat) => {
      const increment = stat.target / 30;
      let currentValue = 0;
      const interval = setInterval(() => {
        currentValue += increment;
        if (currentValue >= stat.target) {
          currentValue = stat.target;
          clearInterval(interval);
        }
        setStats((prevStats) =>
          prevStats.map((s) =>
            s.id === stat.id ? { ...s, value: Math.floor(currentValue) } : s
          )
        );
      }, 50);

      return () => clearInterval(interval);
    });

    return () => {
      timers.forEach((timer) => timer());
    };
  }, []);

  return (
    <section className="statistics-panel">
      <div className="stats-container">
        <div className="stats-header">
          <h2>Our Impact</h2>
          <p>Trusted healthcare technology delivering real results</p>
        </div>

        <div className="stats-grid">
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div key={stat.id} className={`stat-card ${stat.color}`}>
                <div className="stat-icon">
                  <IconComponent />
                </div>
                <div className="stat-content">
                  <div className="stat-value">
                    {stat.value.toLocaleString()}
                    {stat.suffix && <span className="stat-suffix">{stat.suffix}</span>}
                  </div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StatisticsPanel;
