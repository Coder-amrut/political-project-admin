import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RoleName } from '../api/contracts';
import BackButton from '../components/BackButton';

function Unauthorized() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleLanding = () => {
    const roles = user?.roles || [];
    if (roles.includes(RoleName.ADMIN)) return '/admin';
    if (roles.includes(RoleName.OFFICER)) return '/officer';
    return '/';
  };

  return (
    <div style={{ maxWidth: '480px', margin: '60px auto', padding: '28px', textAlign: 'center', fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif" }}>
      <div style={{ textAlign: 'left', marginBottom: '20px' }}>
        <BackButton fallbackPath={getRoleLanding()} />
      </div>
      <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', fontSize: '24px', fontWeight: 'bold' }}>
        !
      </div>
      <h2 style={{ color: '#111827', fontSize: '22px', margin: '0 0 8px 0' }}>403 - Access Forbidden</h2>
      <p style={{ color: '#6b7280', fontSize: '14px', margin: '0 0 24px 0' }}>
        You do not have the required permissions to access this area.
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <Link
          to={getRoleLanding()}
          style={{
            padding: '10px 18px',
            backgroundColor: '#2563eb',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Go to Your Dashboard
        </Link>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 18px',
            backgroundColor: '#f3f4f6',
            color: '#374151',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
