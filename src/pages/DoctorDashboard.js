import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { getUser } from '../services/auth';
import VoiceRecorder from '../components/VoiceRecorder';
import './Dashboard.css';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = getUser();

  useEffect(() => {
    if (!user?.id) {
      setError('No user information available.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadAppointments = async () => {
      try {
        const data = await api.getAppointmentsByDoctor(user.id);
        if (!cancelled) setAppointments(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) setError(err.data?.message || err.message || 'Failed to load appointments');
      }
    };

    const loadPatients = async () => {
      try {
        const data = await api.getPatients('');
        if (!cancelled) {
          const patients = Array.isArray(data) ? data : [];
          setPatients(patients);
          setSelectedPatientId((prev) => (prev ? prev : patients[0]?.id || null));
        }
      } catch (err) {
        if (!cancelled) setError(err.data?.message || err.message || 'Failed to load patients');
      }
    };

    Promise.all([loadAppointments(), loadPatients()])
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (loading) return <div className="dashboard"><div className="loading">Loading appointments...</div></div>;
  if (error) return <div className="dashboard"><div className="dashboard-error">{error}</div></div>;

  return (
    <div className="dashboard">
      <h1>Doctor dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-key">Today's Appointments</div>
          <div className="dashboard-card-value">{appointments.filter((a) => new Date(a.appointmentDate).toDateString() === new Date().toDateString()).length}</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-key">Upcoming Appointments</div>
          <div className="dashboard-card-value">{appointments.length}</div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2>Recent Appointments</h2>
        {appointments.length === 0 ? (
          <p>No appointments scheduled.</p>
        ) : (
          <ul>
            {appointments.slice(0, 10).map((a) => (
              <li key={a.id}>
                <strong>{new Date(a.appointmentDate).toLocaleString()}</strong> — {a.patientName} ({a.status})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2>My Patients</h2>
        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <ul>
            {patients.slice(0, 10).map((p) => (
              <li key={p.id}>
                <Link to={`/patients/${p.id}`}>
                  {p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Unknown'}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2>Appointment Calendar</h2>
        <div className="appointment-table">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patient</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="4">No appointments scheduled.</td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id}>
                    <td>{new Date(a.appointmentDate).toLocaleDateString()}</td>
                    <td>{a.patientName || 'N/A'}</td>
                    <td>{new Date(a.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <span className={`status-badge ${a.status?.toLowerCase() === 'completed' ? 'completed' : 'pending'}`}>
                        {a.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2>Voice Prescription</h2>
        <p>Select a patient then record voice notes to save a prescription.</p>

        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="voice-patient" style={{ fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>
            Patient
          </label>
          <select
            id="voice-patient"
            value={selectedPatientId ?? ''}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            style={{ padding: '0.5rem', width: '100%', maxWidth: '400px' }}
          >
            <option value="" disabled>
              Select a patient
            </option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.fullName || `${p.firstName || ''} ${p.lastName || ''}`.trim() || p.id}
              </option>
            ))}
          </select>
        </div>

        {selectedPatientId ? (
          <VoiceRecorder patientId={selectedPatientId} />
        ) : (
          <p>Please select a patient to start recording a prescription.</p>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
