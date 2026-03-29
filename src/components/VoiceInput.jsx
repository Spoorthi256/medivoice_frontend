import { useEffect, useRef, useState } from 'react';
import { FaMicrophone } from 'react-icons/fa';
import './VoiceInput.css';

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

function VoiceInput({ value = '', onChange, onProceed, onReset, onListeningChange, onError, placeholder = 'Your speech will appear here...' }) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const listeningRef = useRef(false);

  useEffect(() => {
    if (!SpeechRecognition) {
      const msg = 'Speech recognition is not supported in this browser.';
      setError(msg);
      setIsSupported(false);
      onError?.(msg);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = finalTranscriptRef.current || '';

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += `${result} `;
        } else {
          interimTranscript += `${result} `;
        }
      }

      finalTranscript = finalTranscript.trim();
      interimTranscript = interimTranscript.trim();

      finalTranscriptRef.current = finalTranscript;
      const combined = [finalTranscript, interimTranscript].filter(Boolean).join(' ').trim();
      onChange?.(combined);
    };

    rec.onerror = (event) => {
      const msg = 'Speech recognition error: ' + (event.error || 'unknown');
      setError(msg);
      onError?.(msg);
      listeningRef.current = false;
      setIsListening(false);
      onListeningChange?.(false);
    };

    rec.onend = () => {
      if (listeningRef.current) {
        try {
          rec.start();
        } catch (e) {
          console.warn('Speech recognition restart failed:', e);
          listeningRef.current = false;
          setIsListening(false);
          onListeningChange?.(false);
        }
      } else {
        listeningRef.current = false;
        setIsListening(false);
        onListeningChange?.(false);
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (rec) {
        try {
          rec.stop();
        } catch (e) {
          console.warn('Speech recognition stop in cleanup failed:', e);
        }
      }
    };
  }, [onChange, onError, onListeningChange]);

  const toggleListening = () => {
    setError('');

    if (!isSupported || !recognitionRef.current) {
      const msg = 'Speech recognition is not available in this browser.';
      setError(msg);
      onError?.(msg);
      setIsListening(false);
      onListeningChange?.(false);
      return;
    }

    if (!listeningRef.current) {
      finalTranscriptRef.current = value || '';
      try {
        recognitionRef.current.start();
        listeningRef.current = true;
        setIsListening(true);
        onListeningChange?.(true);
      } catch (e) {
        const msg = 'Unable to start voice input: ' + (e?.message || e);
        setError(msg);
        onError?.(msg);
        listeningRef.current = false;
        setIsListening(false);
        onListeningChange?.(false);
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Speech recognition stop failed:', e);
      }
      listeningRef.current = false;
      setIsListening(false);
      onListeningChange?.(false);
    }
  };

  const resetVoice = () => {
    setError('');

    if (recognitionRef.current && listeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.warn('Speech recognition stop failed during reset:', e);
      }
    }

    listeningRef.current = false;
    setIsListening(false);
    onListeningChange?.(false);
    finalTranscriptRef.current = '';
    onChange?.('');
    onReset?.();
  };

  return (
    <div className="voice-input-wrapper">
      {error && <div className="voice-error">{error}</div>}

      <div className="voice-mic-area">
        <button
          type="button"
          className={`voice-mic-btn ${isListening ? 'recording' : ''}`}
          onClick={toggleListening}
          aria-label={isListening ? 'Stop recording' : 'Start recording'}
          disabled={!isSupported}
        >
          <FaMicrophone />
        </button>
        <div className="voice-status" data-listening={isListening}>
          {isListening ? 'Listening...' : isSupported ? 'Click mic to speak' : 'Speech recognition not supported'}
        </div>
        <button
          type="button"
          className="voice-reset-btn"
          onClick={resetVoice}
          aria-label="Start again and clear transcript"
          disabled={!value && !isListening}
        >
          Start Again
        </button>
      </div>

      <div className="voice-transcript-container">
        <button
          type="button"
          className="voice-proceed-btn"
          onClick={() => onProceed?.()}
          disabled={!((value || '').trim())}
        >
          Proceed
        </button>
        <textarea
          className="voice-transcript"
          rows={5}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}

export default VoiceInput;
