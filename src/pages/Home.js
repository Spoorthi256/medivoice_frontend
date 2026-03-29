import './Home.css';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';

function Home() {
  return (
    <div className="home">
      <HeroSection />
      <ServicesSection />
      <footer className="home-footer">
        <p>© {new Date().getFullYear()} MediVoice Clinic System. All rights reserved.</p>
        <p>Designed for clinical professionals — clean, minimal, and secure.</p>
      </footer>
    </div>
  );
}

export default Home;
