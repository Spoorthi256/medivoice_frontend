import { FaMicrophone, FaChartLine, FaUserLock } from 'react-icons/fa6';
import './ServicesSection.css';

function ServicesSection() {
  const services = [
    {
      id: 1,
      title: 'Voice Assistant',
      description: 'Capture clinical prescriptions with voice-to-text accuracy and instant documentation.',
      icon: FaMicrophone,
      color: 'service-blue',
    },
    {
      id: 2,
      title: 'Appointment Booking',
      description: 'Quickly view schedule, upcoming appointments, and allocate slots efficiently.',
      icon: FaChartLine,
      color: 'service-green',
    },
    {
      id: 3,
      title: 'Patient Records',
      description: 'Access and manage patient profiles, history, and care notes with minimal clicks.',
      icon: FaUserLock,
      color: 'service-purple',
    },
  ];

  return (
    <section className="services-section">
      <div className="services-container">
        <div className="section-header">
          <h2>Our Services</h2>
          <p>Comprehensive healthcare technology solutions</p>
        </div>

        <div className="services-grid">
          {services.map((service) => {
            const IconComponent = service.icon;
            return (
              <div key={service.id} className={`service-card ${service.color}`}>
                <div className="service-icon">
                  <IconComponent />
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default ServicesSection;
