import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';

import DashboardLayout from './layouts/DashboardLayout';
import Overview from './pages/Overview';
import LiveSessions from './pages/LiveSessions';
import SessionDetail from './pages/SessionDetail';
import RiskMonitor from './pages/RiskMonitor';
import RecoveryActions from './pages/RecoveryActions';
import Experiments from './pages/Experiments';
import Analytics from './pages/Analytics';
import Customers from './pages/Customers';
import Campaigns from './pages/Campaigns';
import AuditLogs from './pages/AuditLogs';
import Datasets from './pages/Datasets';
import Settings from './pages/Settings';
import Login from './pages/Login';
import DemoStore from './pages/DemoStore';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-xs">Loading Cart Rescue Platform...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/demo-store" element={<DemoStore />} />

            <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route index element={<Overview />} />
              <Route path="sessions" element={<LiveSessions />} />
              <Route path="sessions/:id" element={<SessionDetail />} />
              <Route path="risk-monitor" element={<RiskMonitor />} />
              <Route path="actions" element={<RecoveryActions />} />
              <Route path="experiments" element={<Experiments />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="customers" element={<Customers />} />
              <Route path="campaigns" element={<Campaigns />} />
              <Route path="audit-logs" element={<AuditLogs />} />
              <Route path="datasets" element={<Datasets />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}
