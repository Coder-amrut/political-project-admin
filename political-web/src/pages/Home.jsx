import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RoleName } from '../api/contracts';
import BackButton from '../components/BackButton';

function Home() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = () => {
    const roles = user?.roles || [];
    if (roles.includes(RoleName.ADMIN)) return '/admin';
    if (roles.includes(RoleName.OFFICER)) return '/officer';
    if (roles.includes(RoleName.WORKER)) return '/worker';
    return '/admin';
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
        color: '#f8fafc',
        fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        padding: '30px 20px',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ maxWidth: '880px', width: '100%' }}>
        {/* Top Header Card */}
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 60%, #0f172a 100%)',
            borderRadius: '20px',
            padding: '32px 36px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
            marginBottom: '28px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    letterSpacing: '0.6px',
                    textTransform: 'uppercase',
                  }}
                >
                  ⚡ महाराष्ट्र राज्य निवडणूक व मोहीम व्यासपीठ
                </span>
                {/* <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#34d399',
                    fontSize: '11.5px',
                    fontWeight: '700',
                  }}
                >
                  <span style={{ width: '7px', height: '7px', borderRadius: '4px', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                  Live MySQL DB
                </span> */}
              </div>

              <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>
                Political Campaign & Field Management Platform
              </h1>
              <p style={{ margin: 0, color: '#94a3b8', fontSize: '14.5px', maxWidth: '620px', lineHeight: 1.5 }}>
                महाराष्ट्र राज्यभरातील सर्व विधानसभा मतदारसंघ, मतदान केंद्रे (बूथ), घरोघरी सर्व्हे आणि केंद्रीय प्रशासनासाठी एकात्मिक डिजिटल नियंत्रण प्रणाली.
              </p>
            </div>

            {isAuthenticated ? (
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '12px',
                  padding: '12px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    fontWeight: '800',
                    color: '#fff',
                  }}
                >
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#f8fafc' }}>{user?.full_name}</div>
                  <div style={{ fontSize: '11.5px', color: '#60a5fa', fontWeight: '600' }}>{user?.roles?.join(', ')}</div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: 'rgba(239, 68, 68, 0.2)',
                    border: '1px solid #ef4444',
                    color: '#fca5a5',
                    padding: '5px 10px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginLeft: '4px',
                  }}
                >
                  बाहेर पडा
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '9px 18px',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '750',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                  }}
                >
                  लॉगिन करा (Sign In)
                </Link>
                <Link
                  to="/register"
                  style={{
                    padding: '9px 18px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#f8fafc',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                  }}
                >
                  नवीन नोंदणी
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 3 Major Portals Grid with High-Contrast Colors */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px' }}>
          {/* 1. Admin Platform Card */}
          <div
            onClick={() => navigate('/admin')}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              borderTop: '4px solid #2563eb',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              color: '#0f172a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(37, 99, 235, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  }}
                >
                  🛡️
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#eff6ff',
                    color: '#1d4ed8',
                    border: '1px solid #bfdbfe',
                  }}
                >
                  Root Access
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                प्रशासन नियंत्रण कक्ष
              </h3>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', marginBottom: '8px' }}>
                ADMIN COMMAND HQ
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                प्रकल्प रचना, वापरकर्ते मंजुरी, मतदारसंघ भूगोल मॅपिंग आणि संपूर्ण सिस्टिम ऑडिटचे केंद्रीय प्रशासन.
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '750', color: '#1d4ed8' }}>ॲडमिन डॅशबोर्ड उघडा →</span>
              <span style={{ fontSize: '16px' }}>👑</span>
            </div>
          </div>

          {/* 2. Neta & Officer Platform Card */}
          <div
            onClick={() => navigate('/officer')}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              borderTop: '4px solid #ea580c',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              color: '#0f172a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(234, 88, 12, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: '0 4px 12px rgba(234, 88, 12, 0.3)',
                  }}
                >
                  🏛️
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#fff7ed',
                    color: '#c2410c',
                    border: '1px solid #fed7aa',
                  }}
                >
                  Executive Neta
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                नेता व जनसेवक कक्ष
              </h3>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#ea580c', marginBottom: '8px' }}>
                POLITICAL COMMAND HQ
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                मतदारसंघ आढावा, बूथनिहाय प्रगती, अधिकाऱ्यांचे काम, आगामी बैठका, महत्त्वाचे अहवाल आणि थेट राजकीय विश्लेषण.
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '750', color: '#ea580c' }}>नेता कक्ष उघडा →</span>
              <span style={{ fontSize: '16px' }}>🚩</span>
            </div>
          </div>

          {/* 3. Field Officer Platform Card */}
          <div
            onClick={() => navigate('/worker')}
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '24px',
              borderTop: '4px solid #10b981',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'all 0.2s ease',
              color: '#0f172a',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 14px 30px rgba(16, 185, 129, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '22px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  👮
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: '#f0fdf4',
                    color: '#15803d',
                    border: '1px solid #bbf7d0',
                  }}
                >
                  Field Officer App
                </span>
              </div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                क्षेत्र अधिकारी कक्ष
              </h3>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#059669', marginBottom: '8px' }}>
                FIELD OFFICER APP
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                घरोघरी मतदार भेट, कुटुंब सर्वेक्षण फॉर्म भरणे, मतदार डेटा संकलन आणि स्थानिक समस्यांची नोंदणी.
              </p>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '750', color: '#059669' }}>अधिकारी पोर्टल उघडा →</span>
              <span style={{ fontSize: '16px' }}>📝</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
