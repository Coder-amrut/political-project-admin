import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoleName } from '../../api/contracts';
import BackButton from '../../components/BackButton';

function Register() {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    role: RoleName.WORKER,
    password: '',
    password_confirmation: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setFieldErrors({});
    setSuccessMessage('');

    // Client-side validations
    const errors = {};
    if (!formData.full_name.trim()) {
      errors.full_name = 'Full name is required.';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    }
    if (!formData.password) {
      errors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }
    if (!formData.password_confirmation) {
      errors.password_confirmation = 'Please confirm your password.';
    } else if (formData.password !== formData.password_confirmation) {
      errors.password_confirmation = 'Password confirmation does not match.';
    }
    if (![RoleName.WORKER, RoleName.OFFICER].includes(formData.role)) {
      errors.role = 'Please select a valid role (WORKER or OFFICER).';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        full_name: formData.full_name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() ? formData.email.trim() : null,
        role: formData.role,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      };

      const response = await register(payload);

      setSuccessMessage(
        response.message || 'Registration submitted successfully. Your account is pending admin approval.'
      );
      // Reset form
      setFormData({
        full_name: '',
        phone: '',
        email: '',
        role: RoleName.WORKER,
        password: '',
        password_confirmation: '',
      });
    } catch (err) {
      if (err.errors) {
        setFieldErrors(err.errors);
      }
      setGeneralError(err.message || 'Registration failed. Please check the form.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', padding: '28px', fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif", lineHeight: '1.5' }}>
      <div style={{ marginBottom: '18px' }}>
        <BackButton fallbackPath="/login" label="Back to Login" />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px 0' }}>Create an Account</h2>
      <p style={{ color: '#4b5563', fontSize: '14px', margin: '0 0 24px 0' }}>
        Register as a Field Worker or Field Officer.
      </p>

      {successMessage && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          padding: '16px',
          borderRadius: '6px',
          fontSize: '14px',
          marginBottom: '24px',
        }}>
          <strong style={{ display: 'block', marginBottom: '4px' }}>Registration Submitted</strong>
          <p style={{ margin: '0 0 12px 0' }}>{successMessage}</p>
          <Link
            to="/login"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#059669',
              color: '#ffffff',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '13px',
            }}
          >
            Go to Login
          </Link>
        </div>
      )}

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

      {!successMessage && (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Full Name <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                boxSizing: 'border-box',
                border: fieldErrors.full_name ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: isSubmitting ? '#f3f4f6' : '#ffffff',
              }}
            />
            {fieldErrors.full_name && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                {Array.isArray(fieldErrors.full_name) ? fieldErrors.full_name[0] : fieldErrors.full_name}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Phone Number <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="e.g. 9876543210"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                boxSizing: 'border-box',
                border: fieldErrors.phone ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: isSubmitting ? '#f3f4f6' : '#ffffff',
              }}
            />
            {fieldErrors.phone && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                {Array.isArray(fieldErrors.phone) ? fieldErrors.phone[0] : fieldErrors.phone}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Email Address <span style={{ color: '#6b7280', fontWeight: 'normal' }}>(Optional)</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. ramesh@example.com"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                boxSizing: 'border-box',
                border: fieldErrors.email ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: isSubmitting ? '#f3f4f6' : '#ffffff',
              }}
            />
            {fieldErrors.email && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                {Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Select Role <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                boxSizing: 'border-box',
                border: fieldErrors.role ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: isSubmitting ? '#f3f4f6' : '#ffffff',
              }}
            >
              <option value={RoleName.WORKER}>WORKER (Field Worker)</option>
              <option value={RoleName.OFFICER}>OFFICER (Field Officer)</option>
            </select>
            {fieldErrors.role && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                {Array.isArray(fieldErrors.role) ? fieldErrors.role[0] : fieldErrors.role}
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
              placeholder="Minimum 8 characters, mixed case & numbers"
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

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
              Confirm Password <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Re-enter password"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px 12px',
                boxSizing: 'border-box',
                border: fieldErrors.password_confirmation ? '1px solid #dc2626' : '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: isSubmitting ? '#f3f4f6' : '#ffffff',
              }}
            />
            {fieldErrors.password_confirmation && (
              <p style={{ color: '#dc2626', fontSize: '12px', margin: '4px 0 0 0' }}>
                {Array.isArray(fieldErrors.password_confirmation) ? fieldErrors.password_confirmation[0] : fieldErrors.password_confirmation}
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
            {isSubmitting ? 'Submitting Registration...' : 'Submit Registration'}
          </button>
        </form>
      )}

      <div style={{ marginTop: '24px', fontSize: '14px', color: '#4b5563', textAlign: 'center' }}>
        <span>Already have an account? </span>
        <Link to="/login" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Sign In</Link>
        <span style={{ margin: '0 8px', color: '#9ca3af' }}>|</span>
        <Link to="/" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>Back to Home</Link>
      </div>
    </div>
  );
}

export default Register;
