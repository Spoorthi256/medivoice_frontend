import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { getUser } from '../services/auth';
import VoiceRecorder from '../components/VoiceRecorder';
import PatientHistory from '../components/PatientHistory';
import './PatientDetails.css';

function PatientDetails() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const p = await api.getPatientById(id);
        setPatient(p);
        setEditForm({
          firstName: p.firstName || '',
          lastName: p.lastName || '',
          dateOfBirth: p.dateOfBirth || '',
          gender: p.gender || 'female',
          phone: p.phone || '',
          email: p.email || '',
          address: p.address || '',
          medicalHistory: p.medicalHistory || '',
        });
      } catch (err) {
        setError(err.data?.message || err.message || 'Failed to load patient details');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  if (loading) return <div className="patient-details">Loading...</div>;
  if (error) return <div className="patient-details error">{error}</div>;
  if (!patient) return <div className="patient-details">Patient not found</div>;

  const user = getUser();
  const canEdit = ['admin', 'doctor', 'receptionist'].includes(user?.role?.toLowerCase());

  const calculateAge = (dob) => {
    if (!dob) return '—';
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age -= 1;
    }
    return age;
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
    setSaveError('');
    setSaveMessage('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveMessage('');
    setSaving(true);
    try {
      const updated = await api.updatePatient(id, editForm);
      setPatient(updated);
      setEditForm({
        firstName: updated.firstName || '',
        lastName: updated.lastName || '',
        dateOfBirth: updated.dateOfBirth || '',
        gender: updated.gender || 'female',
        phone: updated.phone || '',
        email: updated.email || '',
        address: updated.address || '',
        medicalHistory: updated.medicalHistory || '',
      });
      setSaveMessage('Patient updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.data?.message || err.message || 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="patient-details">
      <header className="patient-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <h1>
            {patient.firstName} {patient.lastName}
          </h1>
          {canEdit && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isEditing ? (
                <button type="button" className="btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              ) : (
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditing(true)}>
                  Edit Patient
                </button>
              )}
            </div>
          )}
        </div>

        {isEditing ? (
          <form className="patient-edit-form" onSubmit={handleSave} style={{ marginTop: '1rem' }}>
            {saveError && <div className="form-error">{saveError}</div>}
            {saveMessage && <div className="form-success">{saveMessage}</div>}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={editForm?.firstName || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={editForm?.lastName || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={editForm?.dateOfBirth || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="gender">Gender</label>
                <select id="gender" name="gender" value={editForm?.gender || 'female'} onChange={handleEditChange}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={editForm?.phone || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={editForm?.email || ''}
                  onChange={handleEditChange}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="address">Address</label>
              <input
                id="address"
                name="address"
                type="text"
                value={editForm?.address || ''}
                onChange={handleEditChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="medicalHistory">Medical History</label>
              <textarea
                id="medicalHistory"
                name="medicalHistory"
                value={editForm?.medicalHistory || ''}
                onChange={handleEditChange}
                rows={3}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="patient-meta">
            <div>
              <strong>Age:</strong> {calculateAge(patient.dateOfBirth)}
            </div>
            <div>
              <strong>Gender:</strong> {patient.gender || '—'}
            </div>
            <div>
              <strong>Phone:</strong> {patient.phone || '—'}
            </div>
            <div>
              <strong>Address:</strong> {patient.address || '—'}
            </div>
            <div>
              <strong>Medical History:</strong> {patient.medicalHistory || '—'}
            </div>
          </div>
        )}
      </header>

      <PatientHistory patientId={id} />

      <section className="voice-panel">
        <h2>Voice to Prescription</h2>
        <VoiceRecorder patientId={id} />
      </section>
    </div>
  );
}

export default PatientDetails;
