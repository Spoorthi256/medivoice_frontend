import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import './PatientList.css';

function PatientList() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (search) => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getPatients(search);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.data?.message || err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(query);
  };

  return (
    <div className="patients">
      <header className="patients-header">
        <h1>Patients</h1>
        <div className="patients-header__actions">
          <form className="patients-search" onSubmit={handleSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, email or phone"
            />
            <button type="submit" className="btn btn-secondary">
              Search
            </button>
          </form>
          <div>
            <Link to="/patients/new" className="btn btn-primary">
              Add Patient
            </Link>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="loading">Loading patients...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <table className="patients-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>DOB</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty">
                  No patients found.
                </td>
              </tr>
            ) : (
              patients.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.firstName} {p.lastName}
                  </td>
                  <td>{p.dateOfBirth}</td>
                  <td>{p.email}</td>
                  <td>{p.phone}</td>
                  <td>
                    <Link className="btn btn-sm" to={`/patients/${p.id}`}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PatientList;
