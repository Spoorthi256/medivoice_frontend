import { useEffect, useState } from 'react';
import { api } from '../services/api';
import './PatientHistory.css';

function PatientHistory({ patientId }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('medical');

  useEffect(() => {
    if (!patientId) return;

    const loadHistory = async () => {
      setLoading(true);
      setError('');

      try {
        const [medicalHistory, prescriptions, appointments, queryHistory] = await Promise.all([
          api.getMedicalHistoryByPatient(patientId),
          api.getPrescriptionsByPatient(patientId),
          api.getAppointmentsByPatient(patientId),
          api.getPatientQueryHistory(patientId),
        ]);

        setHistory({
          medical: medicalHistory || [],
          prescriptions: prescriptions || [],
          appointments: appointments || [],
          queries: queryHistory || [],
        });
      } catch (err) {
        setError(err.message || 'Failed to load patient history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [patientId]);

  if (!patientId) {
    return <div className="patient-history">Select a patient to view history.</div>;
  }

  if (loading) {
    return <div className="patient-history">Loading patient history...</div>;
  }

  if (error) {
    return <div className="patient-history error">{error}</div>;
  }

  const tabs = [
    { key: 'medical', label: 'Medical History', icon: '📋' },
    { key: 'prescriptions', label: 'Prescriptions', icon: '💊' },
    { key: 'appointments', label: 'Appointments', icon: '📅' },
    { key: 'queries', label: 'Symptom Analysis', icon: '🔍' },
  ];

  return (
    <div className="patient-history">
      <h3>Patient History</h3>

      <div className="history-tabs">
        {tabs.map(tab => (
          <button
            key={tab.key}
            className={`tab-button ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="history-content">
        {activeTab === 'medical' && (
          <div className="history-section">
            {history.medical.length === 0 ? (
              <p>No medical history records found.</p>
            ) : (
              history.medical.map(record => (
                <div key={record.id} className="history-item">
                  <div className="history-header">
                    <strong>{record.diagnosis}</strong>
                    <span className="history-date">{new Date(record.diagnosisDate).toLocaleDateString()}</span>
                  </div>
                  {record.notes && <p>{record.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div className="history-section">
            {history.prescriptions.length === 0 ? (
              <p>No prescriptions found.</p>
            ) : (
              history.prescriptions.map(prescription => (
                <div key={prescription.id} className="history-item">
                  <div className="history-header">
                    <strong>Prescription #{prescription.id}</strong>
                    <span className="history-date">{new Date(prescription.prescriptionDate).toLocaleDateString()}</span>
                  </div>
                  {prescription.notes && <p>{prescription.notes}</p>}
                  {prescription.items && prescription.items.length > 0 && (
                    <ul>
                      {prescription.items.map((item, index) => (
                        <li key={index}>
                          {item.medicineName} - {item.dosage}
                          {item.instructions && ` (${item.instructions})`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="history-section">
            {history.appointments.length === 0 ? (
              <p>No appointments found.</p>
            ) : (
              history.appointments.map(appointment => (
                <div key={appointment.id} className="history-item">
                  <div className="history-header">
                    <strong>{new Date(appointment.appointmentDate).toLocaleString()}</strong>
                    <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                      {appointment.status}
                    </span>
                  </div>
                  {appointment.notes && <p>{appointment.notes}</p>}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'queries' && (
          <div className="history-section">
            {history.queries.length === 0 ? (
              <p>No symptom analysis queries found.</p>
            ) : (
              history.queries.map(query => (
                <div key={query.id} className="history-item">
                  <div className="history-header">
                    <strong>Symptom Analysis</strong>
                    <span className="history-date">{new Date(query.createdAt).toLocaleString()}</span>
                  </div>
                  <p><strong>Query:</strong> {query.queryText}</p>
                  <div className="query-response">
                    <strong>Analysis:</strong>
                    <div className="response-text">
                      {query.responseText.split('\n').map((line, index) => (
                        <p key={index}>{line}</p>
                      ))}
                    </div>
                  </div>
                  {query.severityLevel && (
                    <span className={`severity-badge ${query.severityLevel}`}>
                      {query.severityLevel.toUpperCase()}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientHistory;