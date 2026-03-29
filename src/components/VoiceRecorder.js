import { useState } from 'react';
import { api } from '../services/api';
import { getUser } from '../services/auth';
import VoiceInput from './VoiceInput';
import './VoiceRecorder.css';

function VoiceRecorder({ patientId }) {
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    setMessage('');
    setLoading(true);
    const user = getUser();
    try {
      await api.createPrescription({
        patientId: parseInt(patientId, 10),
        doctorId: user?.id,
        prescriptionDate: new Date().toISOString().split('T')[0],
        notes: transcript,
        items: [],
      });
      setMessage('Prescription created successfully.');
      setTranscript('');
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="voice-recorder">
      {error && <div className="voice-error">{error}</div>}
      {message && <div className="voice-message">{message}</div>}

      <VoiceInput
        value={transcript}
        onChange={setTranscript}
        onError={(msg) => setError(msg)}
        onReset={() => {
          setTranscript('');
          setError('');
          setMessage('');
        }}
        onListeningChange={(isListening) => {
          if (!isListening) {
            // no-op for now; could be used to signal recording state in parent
          }
        }}
        placeholder="Your prescription notes will appear here..."
      />

      <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!transcript.trim() || loading}>
        {loading ? 'Saving...' : 'Save as Prescription'}
      </button>
    </div>
  );
}

export default VoiceRecorder;
