import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Dashboard.css';

function ReceptionistDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [voiceError, setVoiceError] = useState('');

  const finalTranscriptRef = useRef('');
  const shouldStopRef = useRef(true);


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
        setDoctors(Array.isArray(userList) ? userList.filter((u) => u.role?.toLowerCase() === 'doctor') : []);
        if (patientList?.length) setSelectedPatientId(patientList[0].id);
        if (userList?.length) {
          const firstDoctor = (userList || []).find((u) => u.role?.toLowerCase() === 'doctor');
          if (firstDoctor) setSelectedDoctorId(firstDoctor.id);
        }
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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;
    if (!SpeechRecognition) {
      setVoiceError('Speech recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current || '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += result + ' ';
        } else {
          interimTranscript += result + ' ';
        }
      }

      finalTranscript = finalTranscript.trim();
      interimTranscript = interimTranscript.trim();

      finalTranscriptRef.current = finalTranscript;
      setVoiceTranscript([finalTranscript, interimTranscript].filter(Boolean).join(' ').trim());
    };

    rec.onerror = (event) => {
      setVoiceError('Speech recognition error: ' + (event.error || 'unknown'));
      setListening(false);
    };

    rec.onend = () => {
      if (!shouldStopRef.current) {
        try {
          rec.start();
        } catch (e) {
          // ignore
        }
      } else {
        setListening(false);
      }
    };

    setRecognition(rec);

    return () => {
      try {
        rec.stop();
      } catch (e) {
        // ignore
      }
    };
  }, []);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setBookingLoading(true);
    try {
      await api.createAppointment({
        patientId: Number(selectedPatientId),
        doctorId: Number(selectedDoctorId),
        appointmentDate: appointmentDate,
        notes: appointmentNotes,
      });
      setBookingSuccess('Appointment booked successfully.');
      setAppointmentNotes('');
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

    // Notes: prefer text after keywords, otherwise take remaining text
    const notesMatch = /(?:for|notes?|reason)\s+(.+)/i.exec(working);
    if (notesMatch) {
      result.notes = notesMatch[1].trim();
    } else {
      const remaining = working.replace(/\s+/g, ' ').trim();
      if (remaining) result.notes = remaining;
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

  const handleProceedVoice = () => {
    if (!voiceTranscript.trim()) return;
    const parsed = parseAppointmentVoiceInput(voiceTranscript);

    if (parsed.patientName) {
      const match = findOptionByName(patients, parsed.patientName, ['firstName', 'lastName']);
      if (match) setSelectedPatientId(match.id);
    }

    if (parsed.doctorName) {
      const match = findOptionByName(doctors, parsed.doctorName, ['username', 'email']);
      if (match) setSelectedDoctorId(match.id);
    }

    if (parsed.dateTime) {
      setAppointmentDate(parsed.dateTime);
    }

    if (parsed.notes) {
      setAppointmentNotes(parsed.notes);
    }
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

      <div style={{ marginTop: '1.5rem' }}>
        <h2>Book Appointment</h2>

        <div style={{ marginBottom: '1rem', maxWidth: 520 }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setVoiceError('');
              setVoiceTranscript('');
              finalTranscriptRef.current = '';
              shouldStopRef.current = false;
              if (recognition) {
                recognition.start();
                setListening(true);
              }
            }}
            disabled={listening || !!voiceError}
          >
            Start Voice Input
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              shouldStopRef.current = true;
              if (recognition) recognition.stop();
              setListening(false);
            }}
            disabled={!listening}
            style={{ marginLeft: '0.75rem' }}
          >
            Stop Recording
          </button>

          {listening && (
            <div className="form-info" style={{ marginTop: '0.75rem' }}>
              🔴 Listening...
            </div>
          )}
          {voiceError && <div className="form-error" style={{ marginTop: '0.75rem' }}>{voiceError}</div>}

          {voiceTranscript && (
            <div style={{ marginTop: '0.75rem' }}>
              <label htmlFor="voicePreview" style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'block' }}>
                Recognized Speech Preview
              </label>
              <textarea
                id="voicePreview"
                value={voiceTranscript}
                onChange={(e) => setVoiceTranscript(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #ccc' }}
              />
              {!listening && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleProceedVoice}
                  style={{ marginTop: '0.75rem' }}
                >
                  Proceed
                </button>
              )}
            </div>
          )}
        </div>

        <form onSubmit={handleBookAppointment} style={{ maxWidth: 520 }}>
          {bookingError && <div className="form-error">{bookingError}</div>}
          {bookingSuccess && <div className="form-success">{bookingSuccess}</div>}
          <div className="form-group">
            <label htmlFor="appointmentPatient">Patient</label>
            <select
              id="appointmentPatient"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
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
            <label htmlFor="appointmentDoctor">Doctor</label>
            <select
              id="appointmentDoctor"
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a doctor
              </option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.username} ({d.email})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="appointmentDate">Date & Time</label>
            <input
              id="appointmentDate"
              type="datetime-local"
              value={appointmentDate}
              onChange={(e) => setAppointmentDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="appointmentNotes">Notes (optional)</label>
            <textarea
              id="appointmentNotes"
              value={appointmentNotes}
              onChange={(e) => setAppointmentNotes(e.target.value)}
              rows={3}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={bookingLoading}>
            {bookingLoading ? 'Booking…' : 'Book Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;
