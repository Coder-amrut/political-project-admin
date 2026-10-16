import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoleName } from '../../api/contracts';
import BackButton from '../../components/BackButton';

function Login() {
  const { login, devLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [devRoleLoggingIn, setDevRoleLoggingIn] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear specific field error when user types
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleRedirect = (userRoles, targetRole) => {
    // 1. If explicit developer 1-click role was triggered, route directly to that target
    if (targetRole === 'ADMIN') {
      navigate('/admin', { replace: true });
      return;
    }
    if (targetRole === 'OFFICER') {
      navigate('/officer', { replace: true });
      return;
    }
    if (targetRole === 'WORKER') {
      navigate('/worker', { replace: true });
      return;
    }

    // 2. Otherwise honor deep-link if user was redirected from a protected route
    const fromPath = location.state?.from?.pathname;
    if (fromPath && fromPath !== '/login' && fromPath !== '/register') {
      navigate(fromPath, { replace: true });
      return;
    }

    // 3. Normal form login fallback based on roles
    if (userRoles.includes(RoleName.ADMIN)) {
      navigate('/admin', { replace: true });
    } else if (userRoles.includes(RoleName.OFFICER)) {
      navigate('/officer', { replace: true });
    } else if (userRoles.includes(RoleName.WORKER)) {
      navigate('/worker', { replace: true });
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});

    // Client-side required field checks
    const errors = {};
    if (!formData.login.trim()) {
      errors.login = 'Please provide your email address or phone number.';
    }
    if (!formData.password) {
      errors.password = 'Please provide your password.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await login({
        login: formData.login.trim(),
        password: formData.password,
      });

      handleRedirect(response.user?.roles || []);
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setGeneralError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevLogin = async (role) => {
    setGeneralError('');
    setFieldErrors({});
    setIsSubmitting(true);
    setDevRoleLoggingIn(role);

    try {
      const response = await devLogin(role);
      handleRedirect(response.user?.roles || [], role);
    } catch (err) {
      setGeneralError(err.message || `Developer quick login as ${role} failed.`);
    } finally {
      setIsSubmitting(false);
      setDevRoleLoggingIn('');
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '40px auto', padding: '28px', fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif", lineHeight: '1.5' }}>
      <div style={{ marginBottom: '18px' }}>
        <BackButton fallbackPath="/" label="Back to Home" />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Sign In</h2>
      <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 24px 0' }}>
        Enter your registered email or mobile number to continue.
      </p>

      {generalError && (
        <div style={{
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          padding: '12px 14px',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '20px',
        }}>
          {generalError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Email or Phone Number <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="text"
            name="login"
            value={formData.login}
            onChange={handleChange}
            placeholder="admin@example.com or 9876543210"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 12px',
              boxSizing: 'border-box',
              border: fieldErrors.login ? '1px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? '#f3f4f6' : '#ffffff',
            }}
          />
          {fieldErrors.login && (
            <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
              {Array.isArray(fieldErrors.login) ? fieldErrors.login[0] : fieldErrors.login}
            </p>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
            Password <span style={{ color: '#dc2626' }}>*</span>
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '10px 12px',
              boxSizing: 'border-box',
              border: fieldErrors.password ? '1px solid #dc2626' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: isSubmitting ? '#f3f4f6' : '#ffffff',
            }}
          />
          {fieldErrors.password && (
            <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
              {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: '12px',
            backgroundColor: isSubmitting ? '#93c5fd' : '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            marginTop: '8px',
          }}
        >
          {isSubmitting && !devRoleLoggingIn ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Developer Quick 1-Click Access for All 3 Roles */}
      <div style={{
        marginTop: '24px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        border: '1px dashed #cbd5e1',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            ⚡ Developer 1-Click Access (No Password)
          </span>
          <span style={{ fontSize: '11px', backgroundColor: '#e2e8f0', color: '#334155', padding: '2px 8px', borderRadius: '10px', fontWeight: '600' }}>
            Dev Mode
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDevLogin('ADMIN')}
            style={{
              padding: '10px 6px',
              backgroundColor: devRoleLoggingIn === 'ADMIN' ? '#475569' : '#1e293b',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '16px' }}>👑</span>
            <span>{devRoleLoggingIn === 'ADMIN' ? 'Entering...' : 'Admin'}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDevLogin('OFFICER')}
            style={{
              padding: '10px 6px',
              backgroundColor: devRoleLoggingIn === 'OFFICER' ? '#0369a1' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '16px' }}>🏛️</span>
            <span>{devRoleLoggingIn === 'OFFICER' ? 'Entering...' : 'Officer (Neta)'}</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleDevLogin('WORKER')}
            style={{
              padding: '10px 6px',
              backgroundColor: devRoleLoggingIn === 'WORKER' ? '#047857' : '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: '600',
              fontSize: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              transition: 'background-color 0.15s ease',
            }}
          >
            <span style={{ fontSize: '16px' }}>👷</span>
            <span>{devRoleLoggingIn === 'WORKER' ? 'Entering...' : 'Worker'}</span>
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#4b5563', textAlign: 'center' }}>
        <span>Don't have an account? </span>
        <Link to="/register" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Register</Link>
        <span style={{ margin: '0 8px', color: '#9ca3af' }}>|</span>
        <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Back to Home</Link>
      </div>
    </div>
  );
}

export default Login;
