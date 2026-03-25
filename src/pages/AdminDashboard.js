import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './Dashboard.css';

function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    api.getDashboard()
      .then((d) => {
        if (!cancelled) setData(d?.data || {});
      })
      .catch((err) => {
        if (!cancelled) setError(err.data?.message || err.message || 'Failed to load dashboard');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <div className="dashboard"><div className="loading">Loading dashboard...</div></div>;
  if (error) return <div className="dashboard"><div className="dashboard-error">{error}</div></div>;

  return (
    <div className="dashboard">
      <h1>Admin dashboard</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-key">Total Patients</div>
          <div className="dashboard-card-value">{data.totalPatients ?? '—'}</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-key">Total Doctors</div>
          <div className="dashboard-card-value">{data.totalDoctors ?? '—'}</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-key">Total Receptionists</div>
          <div className="dashboard-card-value">{data.totalReceptionists ?? '—'}</div>
        </div>
        <div className="dashboard-card">
          <div className="dashboard-card-key">Total Appointments</div>
          <div className="dashboard-card-value">{data.totalAppointments ?? '—'}</div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <Link className="btn btn-primary" to="/patients">
            Manage Patients
          </Link>
          <Link className="btn btn-secondary" to="/users">
            Manage Users
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
