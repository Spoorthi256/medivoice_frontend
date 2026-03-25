import { useMemo } from 'react';
import { getUser } from '../services/auth';
import AdminDashboard from './AdminDashboard';
import DoctorDashboard from './DoctorDashboard';
import ReceptionistDashboard from './ReceptionistDashboard';

function Dashboard() {
  const user = getUser();
  const role = useMemo(() => user?.role?.toLowerCase(), [user]);

  if (!user) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">Not logged in. Please log in to view the dashboard.</div>
      </div>
    );
  }

  if (role === 'admin') return <AdminDashboard />;
  if (role === 'doctor') return <DoctorDashboard />;
  if (role === 'receptionist') return <ReceptionistDashboard />;

  return (
    <div className="dashboard">
      <div className="dashboard-error">Unknown role: {user.role}</div>
    </div>
  );
}

export default Dashboard;
