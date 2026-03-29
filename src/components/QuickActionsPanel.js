import { useNavigate } from 'react-router-dom';
import { FaMicrophone, FaBrain, FaChartLine, FaStethoscope } from 'react-icons/fa6';
import './QuickActionsPanel.css';

function QuickActionsPanel() {
  const navigate = useNavigate();

  const actions = [
    {
      id: 1,
      title: 'Voice Analysis',
      description: 'Record your symptoms with AI voice recognition',
      icon: <FaMicrophone />,
      color: 'action-blue',
      action: () => navigate('/dashboard'),
    },
    {
      id: 2,
      title: 'Smart Triage',
      description: 'Get instant symptom severity assessment',
      icon: <FaBrain />,
      color: 'action-green',
      action: () => navigate('/dashboard'),
    },
    {
      id: 3,
      title: 'Patient Records',
      description: 'Access medical history and prescriptions',
      icon: <FaChartLine />,
      color: 'action-purple',
      action: () => navigate('/dashboard'),
    },
    {
      id: 4,
      title: 'Doctor Support',
      description: 'AI-powered clinical decision support',
      icon: <FaStethoscope />,
      color: 'action-orange',
      action: () => navigate('/dashboard'),
    },
  ];

  return (
    <section className="quick-actions-panel">
      <div className="quick-actions-container">
        <div className="section-header">
          <h2>Quick Actions</h2>
          <p>Start using MediVoice in seconds</p>
        </div>

        <div className="actions-grid">
          {actions.map((action) => (
            <div
              key={action.id}
              className={`action-card ${action.color}`}
              onClick={action.action}
            >
              <div className="action-icon">
                {action.icon}
              </div>
              <h3>{action.title}</h3>
              <p>{action.description}</p>
              <div className="action-arrow">→</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default QuickActionsPanel;
