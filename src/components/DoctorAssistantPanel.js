import { FaUser, FaList, FaLightbulb, FaClock } from 'react-icons/fa6';
import './DoctorAssistantPanel.css';

function DoctorAssistantPanel() {
  const doctorFeatures = [
    {
      id: 1,
      icon: FaUser,
      title: 'Patient Overview',
      description: 'Quick access to patient demographics, medical history, and vital information',
      color: 'doctor-blue',
    },
    {
      id: 2,
      icon: FaList,
      title: 'Clinical Notes',
      description: 'Automatically transcribed and formatted medical notes from voice input',
      color: 'doctor-green',
    },
    {
      id: 3,
      icon: FaLightbulb,
      title: 'AI Insights',
      description: 'Clinical decision support based on patient data and best practices',
      color: 'doctor-purple',
    },
    {
      id: 4,
      icon: FaClock,
      title: 'Quick Actions',
      description: 'Fast prescription management and appointment scheduling',
      color: 'doctor-orange',
    },
  ];

  return (
    <section className="doctor-assistant-panel">
      <div className="doctor-container">
        <div className="section-header">
          <h2>For Healthcare Professionals</h2>
          <p>Powerful tools designed specifically for doctors and medical staff</p>
        </div>

        <div className="doctor-layout">
          {/* Main Feature */}
          <div className="doctor-main">
            <div className="doctor-hero">
              <div className="doctor-hero-content">
                <h3>Streamline Your Workflow</h3>
                <p>
                  MediVoice integrates seamlessly into your clinical practice, reducing documentation time 
                  and improving patient care quality. Focus on what matters most – your patients.
                </p>

                <div className="doctor-cta-group">
                  {['Voice Dictation', 'Patient Search', 'Quick Triage', 'Report Export'].map((feature, idx) => (
                    <button key={idx} className="doctor-feature-btn">
                      {feature}
                    </button>
                  ))}
                </div>
              </div>

              <div className="doctor-illustration">
                <div className="doctor-dashboard-mockup">
                  <div className="dashboard-header">📊 Dashboard</div>
                  <div className="dashboard-content">
                    <div className="dashboard-item">
                      <span className="item-label">Patients Today</span>
                      <span className="item-value">12</span>
                    </div>
                    <div className="dashboard-item">
                      <span className="item-label">Pending Triage</span>
                      <span className="item-value">3</span>
                    </div>
                    <div className="dashboard-item">
                      <span className="item-label">Avg Response</span>
                      <span className="item-value">2.5min</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="doctor-features-grid">
            {doctorFeatures.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div key={feature.id} className={`doctor-feature-card ${feature.color}`}>
                  <div className="doctor-card-icon">
                    <IconComponent />
                  </div>
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default DoctorAssistantPanel;
