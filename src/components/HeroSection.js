import { useNavigate } from 'react-router-dom';
import { FaStethoscope, FaArrowRight } from 'react-icons/fa6';
import './HeroSection.css';

function HeroSection() {
  const navigate = useNavigate();

  const handleStartAnalysis = () => {
    navigate('/dashboard');
  };

  return (
    <section className="hero-section">
      <div className="hero-background">
        <div className="hero-shape hero-shape-1"></div>
        <div className="hero-shape hero-shape-2"></div>
        <div className="hero-shape hero-shape-3"></div>
      </div>

      <div className="hero-container">
        <div className="hero-content">
          <div className="hero-badge">
            <FaStethoscope className="badge-icon" />
            <span>AI-Powered Healthcare</span>
          </div>

          <h1 className="hero-title">Your Health, Our Priority</h1>
          
          <p className="hero-subtitle">
            Experience intelligent healthcare support with our advanced voice-assisted diagnosis system. 
            Fast, accurate, and compassionate care at your fingertips.
          </p>

          <div className="hero-features-inline">
            <div className="inline-feature">
              <span className="feature-check">✓</span>
              <span>AI-Assisted Diagnosis</span>
            </div>
            <div className="inline-feature">
              <span className="feature-check">✓</span>
              <span>Voice-Enabled Records</span>
            </div>
            <div className="inline-feature">
              <span className="feature-check">✓</span>
              <span>24/7 Support</span>
            </div>
          </div>

          <button className="hero-cta" onClick={handleStartAnalysis}>
            Start Smart Analysis
            <FaArrowRight className="cta-icon" />
          </button>
        </div>

        <div className="hero-visual">
          <div className="healthcare-illustration">
            <div className="illustration-card medical">
              <div className="card-icon">🏥</div>
              <div className="card-text">Clinical Network</div>
            </div>
            <div className="illustration-card voice">
              <div className="card-icon">🎤</div>
              <div className="card-text">Voice AI</div>
            </div>
            <div className="illustration-card health">
              <div className="card-icon">📈</div>
              <div className="card-text">Smart Triage</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
