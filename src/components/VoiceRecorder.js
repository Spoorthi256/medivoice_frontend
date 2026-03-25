import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getUser } from '../services/auth';
import './VoiceRecorder.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

function VoiceRecorder({ patientId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let resultText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          resultText += result[0].transcript + ' ';
        }
      }
      if (resultText) {
        setTranscript((prev) => `${prev}${resultText}`);
      }
    };

    rec.onerror = (event) => {
      setError('Voice recognition error: ' + (event.error || 'unknown'));
      setIsRecording(false);
    };

    rec.onend = () => {
      setIsRecording(false);
    };

    setRecognition(rec);

    return () => {
      if (rec) {
        try {
          rec.stop();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const startRecording = () => {
    setError('');
    setMessage('');
    setTranscript('');
    if (!recognition) {
      setError('Voice recognition is not available.');
      return;
    }
    try {
      recognition.start();
      setIsRecording(true);
    } catch (e) {
      setError('Unable to start recording: ' + e.message);
    }
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
    }
    setIsRecording(false);
  };

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
      {isRecording && <div className="voice-listening">Listening…</div>}
      <div className="voice-controls">
        <button type="button" className="btn" onClick={startRecording} disabled={isRecording || !!error}>
          Record
        </button>
        <button type="button" className="btn" onClick={stopRecording} disabled={!isRecording}>
          Stop
        </button>
      </div>
      <textarea
        className="voice-transcript"
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Transcript will appear here..."
      />
      <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={!transcript.trim() || loading}>
        {loading ? 'Saving...' : 'Save as Prescription'}
      </button>
    </div>
  );
}

export default VoiceRecorder;
