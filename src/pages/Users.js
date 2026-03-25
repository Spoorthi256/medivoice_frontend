import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { getUser } from '../services/auth';
import './Dashboard.css';

function Users() {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'receptionist',
  });
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const list = await api.getUsers();
        setUsers(Array.isArray(list) ? list : []);
      } catch (err) {
        setError(err.data?.message || err.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
    setSaveError('');
    setSaveSuccess('');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSaveError('');
    setSaveSuccess('');
    setSaving(true);
    try {
      await api.register(newUser);
      setSaveSuccess('User created successfully.');
      setNewUser({ username: '', email: '', password: '', role: 'receptionist' });
      const list = await api.getUsers();
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      setSaveError(err.data?.message || err.message || 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  if (!currentUser || currentUser.role?.toLowerCase() !== 'admin') {
    return (
      <div className="dashboard">
        <div className="dashboard-error">You do not have access to this page.</div>
      </div>
    );
  }

  if (loading) return <div className="dashboard"><div className="loading">Loading users...</div></div>;
  if (error) return <div className="dashboard"><div className="dashboard-error">{error}</div></div>;

  return (
    <div className="dashboard">
      <h1>User Management</h1>
      <section style={{ marginBottom: '1.5rem' }}>
        <h2>Existing Users</h2>
        {users.length === 0 ? (
          <p>No users found.</p>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>Create New User</h2>
        {saveError && <div className="form-error">{saveError}</div>}
        {saveSuccess && <div className="form-success">{saveSuccess}</div>}
        <form onSubmit={handleCreateUser} style={{ maxWidth: 420 }}>
          <div className="form-group">
            <label htmlFor="username">Name</label>
            <input id="username" name="username" value={newUser.username} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={newUser.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={newUser.password} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="role">Role</label>
            <select id="role" name="role" value={newUser.role} onChange={handleChange}>
              <option value="receptionist">Receptionist</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : 'Create User'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default Users;
