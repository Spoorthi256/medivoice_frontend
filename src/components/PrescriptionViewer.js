import { useState } from 'react';
import { api } from '../services/api';
import './PrescriptionViewer.css';

function PrescriptionViewer({ prescriptions = [] }) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [error, setError] = useState('');

  const downloadPdf = async (id) => {
    setError('');
    setDownloadingId(id);
    try {
      const data = await api.downloadPrescriptionPdf(id);
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prescription-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to download prescription');
    } finally {
      setDownloadingId(null);
    }
  };

  if (!prescriptions || prescriptions.length === 0) {
    return <p>No prescriptions found.</p>;
  }

  return (
    <div className="prescription-viewer">
      {error && <div className="form-error">{error}</div>}
      <table className="prescription-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.map((p) => (
            <tr key={p.id}>
              <td>{p.prescriptionDate}</td>
              <td className="prescription-notes">{p.notes || '—'}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  disabled={downloadingId === p.id}
                  onClick={() => downloadPdf(p.id)}
                >
                  {downloadingId === p.id ? 'Downloading…' : 'Download PDF'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PrescriptionViewer;
