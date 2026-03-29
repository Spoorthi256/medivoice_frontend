import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import VoiceInput from '../components/VoiceInput';
import './Dashboard.css';

function ReceptionistDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [patientId, setPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [assignedDoctor, setAssignedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [assignedDoctorLabel, setAssignedDoctorLabel] = useState('No patient selected');
  const [selectedPatientHistory, setSelectedPatientHistory] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');


  useEffect(() => {
    let cancelled = false;

    const loadData = async () => {
      try {
        const [dashboard, patientList, userList] = await Promise.all([
          api.getDashboard(),
          api.getPatients(''),
          api.getUsers(),
        ]);
        if (cancelled) return;
        setData(dashboard?.data || {});
        setPatients(Array.isArray(patientList) ? patientList : []);
        // Keep doctor list for name matching in voice input, but no manual selection
        setDoctors(
          Array.isArray(userList) ? userList.filter((u) => u.role?.toLowerCase() === 'doctor') : []
        );
        // Keep initial patient selection empty
        setSelectedPatientId('');
      } catch (err) {
        if (!cancelled) setError(err.data?.message || err.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedPatientId) {
      setAssignedDoctorLabel('No patient selected');
      setSelectedPatientHistory('');
      return;
    }

    api.getPatientById(selectedPatientId)
      .then((patient) => {
        const doctorName = patient.assignedDoctorName || 'Unknown';
        const doctorSpec = patient.assignedDoctorSpecialization ? ` (${patient.assignedDoctorSpecialization})` : '';
        setAssignedDoctorLabel(`Assigned Doctor: Dr. ${doctorName}${doctorSpec}`);
        setSelectedPatientHistory(patient.medicalHistory || '');
        setSelectedDoctorId(patient.assignedDoctorId ? patient.assignedDoctorId.toString() : '');
      })
      .catch(() => {
        setAssignedDoctorLabel('Unable to load assigned doctor');
        setSelectedPatientHistory('');
        setSelectedDoctorId('');
      });
  }, [selectedPatientId]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);
    try {
      const payload = {
        patientId: Number(selectedPatientId),
        appointmentDate: appointmentDate,
        notes: '',
      };

      if (selectedDoctorId) {
        payload.doctorId = Number(selectedDoctorId);
      }

      await api.createAppointment(payload);
      setBookingSuccess('Appointment booked successfully.');
    } catch (err) {
      setBookingError(err.data?.message || err.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const parseAppointmentVoiceInput = (text) => {
    const result = {};
    let working = text;

    // Patient
    const patientMatch = /patient\s+(.+?)(?=\s+(?:with|doctor|tomorrow|today|at|for|notes|note|$))/i.exec(working);
    if (patientMatch) {
      result.patientName = patientMatch[1].trim();
      working = working.replace(patientMatch[0], ' ');
    }

    // Doctor
    const doctorMatch = /doctor\s+(.+?)(?=\s+(?:for|at|tomorrow|today|patient|notes|note|$))/i.exec(working);
    if (doctorMatch) {
      result.doctorName = doctorMatch[1].trim();
      working = working.replace(doctorMatch[0], ' ');
    }

    // Date/time (basic parsing: today/tomorrow + time)
    const dateTimeMatch = /(today|tomorrow)\s+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:am|pm)?)/i.exec(working);
    if (dateTimeMatch) {
      const when = dateTimeMatch[1].toLowerCase();
      const timePart = dateTimeMatch[2];
      const date = new Date();
      if (when === 'tomorrow') date.setDate(date.getDate() + 1);
      const parsed = Date.parse(`${date.toDateString()} ${timePart}`);
      if (!Number.isNaN(parsed)) {
        result.dateTime = new Date(parsed).toISOString().slice(0, 16);
      }
      working = working.replace(dateTimeMatch[0], ' ');
    }

    // Medical History: prefer text after keywords, otherwise take remaining text
    const notesMatch = /(?:for|notes?|history|reason)\s+(.+)/i.exec(working);
    if (notesMatch) {
      result.medicalHistory = notesMatch[1].trim();
    } else {
      const remaining = working.replace(/\s+/g, ' ').trim();
      if (remaining) result.medicalHistory = remaining;
    }

    return result;
  };

  const findOptionByName = (list, name, fields) => {
    if (!name) return null;
    const tokens = name
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    return list.find((item) => {
      const haystack = fields
        .map((field) => (item[field] || '').toString().toLowerCase())
        .join(' ');
      return tokens.every((token) => haystack.includes(token));
    });
  };

  const handleProceedVoice = async () => {
    console.log('Proceed click: transcript=', voiceTranscript);
    if (!voiceTranscript?.trim()) {
      console.log('No transcript to process.');
      return;
    }

    const parsed = parseAppointmentVoiceInput(voiceTranscript);
    console.log('Parsed voice data:', parsed);

    // Patient MMatching
    if (parsed.patientName) {
      const patientMatch = findOptionByName(patients, parsed.patientName, ['firstName', 'lastName']);
      console.log('Matched patient:', patientMatch);

      if (patientMatch) {
        setSelectedPatientId(patientMatch.id.toString());
        setPatientId(patientMatch.id.toString());

        try {
          const patientData = await api.getPatientById(patientMatch.id);
          const doctorLabel = patientData.assignedDoctorName
            ? `Dr. ${patientData.assignedDoctorName}${patientData.assignedDoctorSpecialization ? ` (${patientData.assignedDoctorSpecialization})` : ''}`
            : 'None';

          setAssignedDoctor(doctorLabel);
          setAssignedDoctorLabel(`Assigned Doctor: ${doctorLabel}`);
          setSelectedDoctorId(patientData.assignedDoctorId ? patientData.assignedDoctorId.toString() : '');

          if (patientData.medicalHistory) {
            setSelectedPatientHistory(patientData.medicalHistory);
          }
        } catch (error) {
          console.error('Failed to fetch patient details for assigned doctor:', error);
        }
      }
    }

    // Doctor
    if (parsed.doctorName) {
      const doctorMatch = findOptionByName(doctors, parsed.doctorName, ['firstName', 'lastName', 'username', 'specialization']);
      console.log('Matched doctor:', doctorMatch);
      if (doctorMatch) {
        setSelectedDoctorId(doctorMatch.id?.toString() || '');
        const name = doctorMatch.firstName && doctorMatch.lastName ? `${doctorMatch.firstName} ${doctorMatch.lastName}` : doctorMatch.username;
        const specialization = doctorMatch.specialization ? ` (${doctorMatch.specialization})` : '';
        const doctorLabel = `Dr. ${name}${specialization}`;
        setAssignedDoctor(doctorLabel);
        setAssignedDoctorLabel(`Assigned Doctor: ${doctorLabel}`);
      }
    }

    // Date/time
    if (parsed.dateTime) {
      console.log('Extracted dateTime:', parsed.dateTime);
      setAppointmentDate(parsed.dateTime);
      setDateTime(parsed.dateTime);
    }

    // Medical history removed by request: no action on parsed medical-history data

    // ensure state values are visible
    console.log('State after proceed:', {
      patientId: patientId || selectedPatientId,
      assignedDoctor,
      dateTime: parsed.dateTime || dateTime || appointmentDate,
      selectedPatientHistory,
    });
  };


  if (loading) return <div className="dashboard"><div className="loading">Loading dashboard...</div></div>;
  if (error) return <div className="dashboard"><div className="dashboard-error">{error}</div></div>;

  return (
    <div className="dashboard">
      <h1>Receptionist dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-key">Total Patients</div>
          <div className="dashboard-card-value">{data?.totalPatients ?? '—'}</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-key">Appointments Today</div>
          <div className="dashboard-card-value">{data?.appointmentsToday ?? '—'}</div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link to="/patients/new" className="btn btn-primary">
            Register New Patient
          </Link>
          <Link to="/patients" className="btn btn-secondary">
            Search / Update Patient
          </Link>
        </div>
      </div>

      <div className="appointment-section" style={{ marginTop: '1.5rem' }}>
        <h2>Book Appointment</h2>

        <div className="appointment-container">
          <div className="appointment-panel left-panel">
            <form onSubmit={handleBookAppointment}>
              {bookingError && <div className="form-error">{bookingError}</div>}
              {bookingSuccess && <div className="form-success">{bookingSuccess}</div>}
              <div className="form-group">
                <label htmlFor="appointmentPatient">Patient</label>
                <select
                  id="appointmentPatient"
                  value={selectedPatientId}
                  onChange={(e) => {
                    setSelectedPatientId(e.target.value);
                    setPatientId(e.target.value);
                  }}
                  required
                >
                  <option value="" disabled>
                    Select a patient
                  </option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.firstName} {p.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="appointmentDoctor">Assigned Doctor</label>
                <select
                  id="appointmentDoctor"
                  value={selectedDoctorId}
                  onChange={(e) => {
                    setSelectedDoctorId(e.target.value);
                    const selector = doctors.find((d) => d.id?.toString() === e.target.value);
                    if (selector) {
                      const name = selector.firstName && selector.lastName ? `${selector.firstName} ${selector.lastName}` : selector.username;
                      const specialization = selector.specialization ? ` (${selector.specialization})` : '';
                      const label = `Dr. ${name}${specialization}`;
                      setAssignedDoctor(label);
                      setAssignedDoctorLabel(`Assigned Doctor: ${label}`);
                    } else {
                      setAssignedDoctor('');
                      setAssignedDoctorLabel('No doctor selected');
                    }
                  }}
                  required
                >
                  <option value="" disabled>
                    Select a doctor
                  </option>
                  {doctors.map((doc) => {
                    const displayName = doc.firstName && doc.lastName ? `${doc.firstName} ${doc.lastName}` : doc.username;
                    return (
                      <option key={doc.id} value={doc.id}>
                        {displayName}{doc.specialization ? ` (${doc.specialization})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="appointmentDate">Date & Time</label>
                <input
                  id="appointmentDate"
                  type="datetime-local"
                  value={dateTime || appointmentDate}
                  onChange={(e) => {
                    setAppointmentDate(e.target.value);
                    setDateTime(e.target.value);
                  }}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
                {bookingLoading ? 'Booking…' : 'Book Appointment'}
              </button>
            </form>
          </div>

          <div className="appointment-panel right-panel">
            <h3>Voice Input</h3>
            <VoiceInput
              value={voiceTranscript}
              onChange={setVoiceTranscript}
              onProceed={handleProceedVoice}
              onReset={() => {
                setVoiceTranscript('');
                setVoiceError('');
              }}
              onError={(msg) => setVoiceError(msg)}
              placeholder="Your speech will appear here..."
            />
            {voiceError && <div className="form-error" style={{ marginTop: '0.75rem' }}>{voiceError}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;
