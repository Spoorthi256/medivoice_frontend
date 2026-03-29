import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import VoiceInput from '../components/VoiceInput';
import './Form.css';

function parsePatientVoiceInput(transcript) {
  const result = {};
  const lower = transcript.toLowerCase();

  // Clean up common noise words that might appear in conversation
  const cleanedTranscript = transcript
    .replace(/\b(from\s+)?(today(?:'s)?|tomorrow|yesterday)\b/gi, '')
    .replace(/\b(please|thanks|thank you|okay|ok)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Age (must be preceded by "age" or "years old")
  const ageMatch = /(?:age|years? old)\s+(\d{1,3})\b/i.exec(cleanedTranscript);
  if (ageMatch) {
    const ageValue = parseInt(ageMatch[1], 10);
    if (!Number.isNaN(ageValue) && ageValue > 0 && ageValue < 120) {
      result.age = String(ageValue);
    }
  }

  // Gender
  const genderMatch = /\b(gender\s+)?(male|female|other)\b/i.exec(cleanedTranscript);
  if (genderMatch) {
    result.gender = genderMatch[2];
  }

  // Phone (keyword preferred, otherwise first long digit group)
  const phoneMatch = /phone(?: number)?\s*([0-9\s-]{6,})/i.exec(cleanedTranscript);
  if (phoneMatch) {
    const digits = phoneMatch[1].replace(/\D/g, '');
    if (digits.length >= 7) {
      result.phone = digits.slice(0, 10);
    }
  } else {
    const digitGroups = cleanedTranscript.match(/(\d[\d\s-]{6,}\d)/g);
    if (digitGroups) {
      const candidate = digitGroups[0].replace(/\D/g, '');
      if (candidate.length >= 7) {
        result.phone = candidate.slice(0, 10);
      }
    }
  }

  // Address
  const addressMatch = /address\s+(.+?)(?=\s+(?:medical\s+(?:history|records?)|age|years? old|male|female|other|phone|$))/i.exec(cleanedTranscript);
  if (addressMatch) {
    result.address = addressMatch[1].trim();
  }

  // Medical History (support various keywords)
  const historyMatch =
    /medical history\s+(.+)/i.exec(cleanedTranscript) ||
    /\bhistory\s+(.+)/i.exec(cleanedTranscript) ||
    /\bsymptoms\s+(.+)/i.exec(cleanedTranscript) ||
    /\bcomplaint\s+(.+)/i.exec(cleanedTranscript);

  if (historyMatch) {
    result.medicalHistory = historyMatch[1].trim();
  }

  // Name fields: allow explicit "first name" / "last name" labeling
  const firstNameMatch = /first\s+name\s+(.+?)(?=\s+(?:last\s+name|age|years? old|male|female|other|phone|address|medical\s+(?:history|records?)|$))/i.exec(cleanedTranscript);
  const lastNameMatch = /last\s+name\s+(.+?)(?=\s+(?:first\s+name|age|years? old|male|female|other|phone|address|medical\s+(?:history|records?)|$))/i.exec(cleanedTranscript);

  if (firstNameMatch) {
    result.firstName = firstNameMatch[1].trim();
  }
  if (lastNameMatch) {
    result.lastName = lastNameMatch[1].trim();
  }

  // Name: look for patterns around "patient" and/or "register/add"
  const namePatterns = [
    /(?:register|add)\s+patient\s+(.+?)(?=\s+(?:age|years? old|male|female|other|phone|address|medical\s+(?:history|records?)|$))/i,
    /patient\s+(.+?)(?=\s+(?:age|years? old|male|female|other|phone|address|medical\s+(?:history|records?)|$))/i,
  ];

  let nameCandidate = '';
  for (const pattern of namePatterns) {
    const match = pattern.exec(cleanedTranscript);
    if (match) {
      nameCandidate = match[1].trim();
      break;
    }
  }

  // If no name found yet, try to infer from remaining words (ignore known keywords and numeric values)
  if (!nameCandidate) {
    const cleaned = lower
      .replace(/\b(register|add|patient|age|years? old|male|female|other|phone|number|address|medical|history)\b/g, '')
      .replace(/\d+/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const filtered = cleaned
      .split(' ')
      .filter((w) => w && !['from', "today's", 'today', 'yesterday'].includes(w));

    if (filtered.length) {
      nameCandidate = filtered.slice(0, 3).join(' ');
    }
  }

  if (nameCandidate) {
    const parts = nameCandidate.split(' ').filter((p) => p.trim());
    if (parts.length) {
      if (!result.firstName) result.firstName = parts[0];
      if (!result.lastName && parts.length > 1) result.lastName = parts.slice(1).join(' ');
    }
  }

  return result;
}

function PatientRegistration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: 'female',
    phone: '',
    address: '',
    medicalHistory: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleProceedVoice = () => {
    if (!voiceTranscript.trim()) return;
    const parsed = parsePatientVoiceInput(voiceTranscript);
    setForm((prev) => ({ ...prev, ...parsed }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = { ...form };
      const age = parseInt(form.age, 10);
      if (!Number.isNaN(age) && age > 0 && age < 120) {
        const year = new Date().getFullYear() - age;
        payload.dateOfBirth = `${year}-07-01`;
      } else {
        throw new Error('Please provide a valid age');
      }

      delete payload.age;

      const response = await api.createPatient(payload);
      navigate(`/patients/${response.id}`);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-page">
      <div className="form-card">
        <h1>Register Patient</h1>
        <div style={{ marginBottom: '1rem' }}>
          <VoiceInput
            value={voiceTranscript}
            onChange={setVoiceTranscript}
            onError={(msg) => setVoiceError(msg)}
            placeholder="Your speech will appear here..."
          />

          {voiceError && <div className="form-error" style={{ marginTop: '0.75rem' }}>{voiceError}</div>}

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleProceedVoice}
            style={{ marginTop: '0.75rem' }}
            disabled={!voiceTranscript.trim()}
          >
            Use Voice Input
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={form.age}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select id="gender" name="gender" value={form.gender} onChange={handleChange}>
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
                value={form.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="medicalHistory">Medical History</label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              value={form.medicalHistory}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Patient'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PatientRegistration;
