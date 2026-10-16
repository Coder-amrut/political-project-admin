import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Unauthorized from '../pages/Unauthorized';
import AdminDashboard from '../pages/admin/AdminDashboard';
import OfficerDashboard from '../pages/officer_Neta/OfficerDashboard';
import WorkerDashboard from '../pages/worker_Karyakarta/WorkerDashboard';
import KarkartaEvmVotingSystem from '../pages/worker_Karyakarta/components/KarkartaEvmVotingSystem';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { RoleName } from '../api/contracts';
import BackButton from '../components/BackButton';

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/evm-demo" element={
        <div style={{ minHeight: '100vh', background: '#f3f4f6', padding: '16px' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto 12px auto' }}>
            <BackButton fallbackPath="/worker" />
          </div>
          <KarkartaEvmVotingSystem />
        </div>
      } />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[RoleName.ADMIN, RoleName.OFFICER, RoleName.WORKER]}>
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Officer Protected Routes */}
      <Route
        path="/officer"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[RoleName.OFFICER, RoleName.ADMIN]}>
              <OfficerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      {/* Neta Route Alias */}
      <Route
        path="/neta"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[RoleName.OFFICER, RoleName.ADMIN]}>
              <OfficerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* Worker Protected Routes */}
      <Route
        path="/worker"
        element={
          <ProtectedRoute>
            <RoleRoute allowedRoles={[RoleName.WORKER, RoleName.ADMIN, RoleName.SUPER_ADMIN]}>
              <WorkerDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={
          <div style={{ maxWidth: '440px', margin: '60px auto', padding: '24px', textAlign: 'center', fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif" }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <BackButton fallbackPath="/" />
            </div>
            <h2 style={{ color: '#111827', fontSize: '22px', margin: '0 0 8px 0' }}>404 - Page Not Found</h2>
            <p style={{ color: '#6b7280', margin: '0 0 20px 0' }}>The requested page does not exist.</p>
            <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Return to Home</Link>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
