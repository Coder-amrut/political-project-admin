import React, { useState, useEffect, useMemo } from 'react';
import { netaApi } from '../api/netaApi';

export default function AreaOverviewDashboard({ onNavigate, lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);

  // Live Indian Standard Time (IST) Clock
  const [currentTime, setCurrentTime] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const istTimeFormatted = useMemo(() => {
    try {
      const timeStr = currentTime.toLocaleTimeString(isMr ? 'mr-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = currentTime.toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return { time: timeStr, date: dateStr };
    } catch {
      return { time: currentTime.toTimeString().split(' ')[0], date: '' };
    }
  }, [currentTime, isMr]);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, meetingsRes] = await Promise.all([
        netaApi.getOverview(),
        netaApi.getMeetings({ status: 'scheduled' }),
      ]);

      if (overviewRes.success) {
        setData(overviewRes.data);
      }
      if (meetingsRes.success) {
        setUpcomingMeetings(meetingsRes.data.slice(0, 3));
      }
    } catch (err) {
      console.error('Failed to load overview data from backend:', err);
      setError(err?.message || 'डेटा लोड करण्यात त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>⏳</div>
        <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e3a8a' }}>
          {isMr ? 'डेटाबेसवरून मतदारसंघ माहिती लोड होत आहे...' : 'Loading constituency data from backend database...'}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: '30px', textAlign: 'center', background: '#fff1f2', borderRadius: '14px', border: '1px solid #fecdd3' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
        <div style={{ color: '#991b1b', fontWeight: '700', marginBottom: '12px' }}>{error}</div>
        <button
          onClick={loadDashboardData}
          style={{
            background: '#1e3a8a',
            color: '#ffffff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          {isMr ? 'पुन्हा प्रयत्न करा' : 'Retry'}
        </button>
      </div>
    );
  }

  const { profile, summary } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @media (max-width: 768px) {
          .area-overview-hero {
            padding: 16px 14px !important;
            border-radius: 12px !important;
          }
          .area-overview-hero h1 {
            font-size: 19px !important;
            line-height: 1.3 !important;
          }
          .area-overview-time-card {
            width: 100% !important;
            min-width: 0 !important;
            margin-top: 8px !important;
          }
          .area-kpi-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
        }
      `}</style>
      {/* Top Welcome & Constituency Banner — Soft Pastel Executive Theme */}
      <div
        className="area-overview-hero"
        style={{
          background: 'linear-gradient(90deg, #edd6cc 0%, #f7ded1 12%, #fce7db 24%, #fff7f0 38%, #ffffff 48%, #ffffff 62%, #f0fbf4 72%, #d2f2de 82%, #e2f1e8 92%, #ceddc6 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#0f172a',
          boxShadow: '0 8px 24px -5px rgba(229, 206, 196, 0.4), 0 8px 20px -5px rgba(136, 201, 147, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
          <div style={{ flex: '1 1 300px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
              {/* Official National Tag Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  padding: '4px 10px',
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                }}
              >
                <span style={{ fontSize: '12px' }}>🌐</span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#1e293b', letterSpacing: '0.5px' }}>
                  {isMr ? 'भारत • INDIA' : 'INDIA • भारत'}
                </span>
              </div>

              {/* National Motto Emblem Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '4px 11px',
                  background: 'rgba(255, 255, 255, 0.65)',
                  border: '1px solid rgba(255, 255, 255, 0.85)',
                  borderRadius: '20px',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.06)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <span style={{ fontSize: '12px' }}>🏛️</span>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#92400e', letterSpacing: '0.5px' }}>
                  सत्यमेव जयते • SATYAMEVA JAYATE
                </span>
              </div>

              <span
                style={{
                  background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
                  color: '#ffffff',
                  fontSize: '11px',
                  fontWeight: '800',
                  padding: '4px 11px',
                  borderRadius: '20px',
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase',
                  boxShadow: '0 2px 8px rgba(234, 88, 12, 0.25)',
                }}
              >
                ⚡ {isMr ? 'सर्वोच्च नेतृत्व डॅशबोर्ड' : 'Executive Command Center'}
              </span>
              <span style={{ color: '#475569', fontSize: '13px', fontWeight: '700' }}>
                {isMr 
                  ? (profile.district_mr?.includes('महाराष्ट्र') ? 'महाराष्ट्र राज्य • सर्व मतदारसंघ' : profile.district_mr + ' जिल्हा • महाराष्ट्र राज्य')
                  : (profile.district_en?.includes('Maharashtra') ? 'Maharashtra State • All Constituencies' : profile.district_en + ' District • Maharashtra')}
              </span>
            </div>

            <h1 style={{ margin: '8px 0 6px 0', fontSize: '26px', fontWeight: '850', color: '#0f172a', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span>{isMr ? profile.name_mr : profile.name_en}</span>
            </h1>
            <p style={{ margin: 0, color: '#334155', fontSize: '13.5px', maxWidth: '540px', lineHeight: 1.5, fontWeight: '500' }}>
              {isMr
                ? `महाराष्ट्र राज्यभरातील सर्व विधानसभा मतदारसंघ, मतदान केंद्रे आणि थेट राजकीय डेटाबेसशी जोडलेला रिअल-टाइम आढावा.`
                : `Real-time strategic state-wide political command and monitoring dashboard for Maharashtra.`}
            </p>
          </div>

          {/* Live Indian Standard Time (IST) Clock Card */}
          <div
            className="area-overview-time-card"
            style={{
              background: '#82d38e',
              border: '1.5px solid rgba(255, 255, 255, 0.85)',
              borderRadius: '14px',
              padding: '12px 18px',
              textAlign: 'center',
              minWidth: '175px',
              boxShadow: '0 4px 16px rgba(130, 211, 142, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <div style={{ fontSize: '10.5px', color: '#166534', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span>🕒</span>
              <span>{isMr ? 'भारतीय प्रमाणवेळ (IST)' : 'Indian Standard Time'}</span>
            </div>
            <div style={{ fontSize: '19px', fontWeight: '900', color: '#064e3b', margin: '4px 0', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
              {istTimeFormatted.time}
            </div>
            <div style={{ fontSize: '11px', color: '#15803d', fontWeight: '600' }}>
              {istTimeFormatted.date}
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Stat Cards Grid — Royal Blue Theme */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>

        {/* Pillar 1: Active Karyakartas */}
        <div
          style={{
            background: '#2f72d4',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 20px rgba(47, 114, 212, 0.22)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            color: '#ffffff',
          }}
          onClick={() => onNavigate('workers_performance')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 26px rgba(47, 114, 212, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(47, 114, 212, 0.22)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '700' }}>
              {isMr ? 'आज सक्रिय कार्यकर्ते ऑन-फील्ड' : 'Active Workers Today'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>🚩</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {profile.active_karyakartas_today}{' '}
            <span style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '600' }}>
              / {profile.total_karyakartas} {isMr ? 'एकूण' : 'Total'}
            </span>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '700' }}>
              ● {Math.round((profile.active_karyakartas_today / profile.total_karyakartas) * 100)}% {isMr ? 'उपस्थिती' : 'Attendance'}
            </span>
            <span style={{ fontSize: '11px', background: '#fff7ed', color: '#c2410c', padding: '3px 10px', borderRadius: '9999px', fontWeight: '750', border: '1px solid #fed7aa' }}>
              ⚡ ऑन-फील्ड
            </span>
          </div>
        </div>

        {/* Pillar 2: Total Booths Status */}
        <div
          style={{
            background: '#2f72d4',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 20px rgba(47, 114, 212, 0.22)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            color: '#ffffff',
          }}
          onClick={() => onNavigate('geography_progress')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 26px rgba(47, 114, 212, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(47, 114, 212, 0.22)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '700' }}>
              {isMr ? 'एकूण मतदान केंद्रे (बूथ)' : 'Polling Stations / Booths'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>🗳️</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {profile.total_booths}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '6px', fontSize: '11.5px', color: '#ffffff' }}>
              <span style={{ color: '#86efac', fontWeight: '750' }}>{summary.high_coverage_booths} {isMr ? 'उच्च' : 'High'}</span>
              <span>·</span>
              <span style={{ color: '#fde047', fontWeight: '750' }}>{summary.medium_coverage_booths} {isMr ? 'मध्यम' : 'Med'}</span>
            </div>
            <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '3px 10px', borderRadius: '9999px', fontWeight: '750', border: '1px solid #bfdbfe' }}>
              📍 १००% बूथ
            </span>
          </div>
        </div>

        {/* Pillar 3: Meetings & Field Tours */}
        <div
          style={{
            background: '#2f72d4',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 20px rgba(47, 114, 212, 0.22)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            color: '#ffffff',
          }}
          onClick={() => onNavigate('meetings_tours')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 26px rgba(47, 114, 212, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(47, 114, 212, 0.22)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '700' }}>
              {isMr ? 'आगामी बैठका व दौरे' : 'Upcoming Tours & Meetings'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>📅</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {summary.upcoming_meetings_count}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '600' }}>
              {isMr ? 'नियोजित स्थानिक सभा' : 'Scheduled Events'}
            </span>
            <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1e3a8a', padding: '3px 10px', borderRadius: '9999px', fontWeight: '750', border: '1px solid #dbeafe' }}>
              📅 थेट वेळापत्रक
            </span>
          </div>
        </div>

        {/* Pillar 4: Surveyed Households Reach */}
        <div
          style={{
            background: '#2f72d4',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 8px 20px rgba(47, 114, 212, 0.22)',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            color: '#ffffff',
          }}
          onClick={() => onNavigate('crm_citizens')}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 12px 26px rgba(47, 114, 212, 0.35)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(47, 114, 212, 0.22)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '13.5px', color: '#ffffff', fontWeight: '700' }}>
              {isMr ? 'मतदार कुटुंब संपर्क (नागरिक CRM)' : 'Surveyed Voter Households'}
            </span>
            <span style={{ fontSize: '18px', padding: '6px 10px', background: '#ffffff', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>👥</span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px' }}>
            {profile.surveyed_households ? profile.surveyed_households.toLocaleString('en-IN') : '1,42,850'}
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.22)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '700' }}>
              {profile.sentiment?.support}% {isMr ? 'अनुकूल मतदार' : 'Favorable'}
            </span>
            <span style={{ fontSize: '11px', background: '#f0fdf4', color: '#15803d', padding: '3px 10px', borderRadius: '9999px', fontWeight: '750', border: '1px solid #bbf7d0' }}>
              👥 मतदार संवाद
            </span>
          </div>
        </div>
      </div>

      {/* Sentiment Gauge & Political Mood Index */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
              📊 {isMr ? 'मतदारसंघ जनभावना व कल विश्लेषण' : 'Constituency Voter Sentiment & Trend'}
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
              {isMr
                ? `${profile.surveyed_households.toLocaleString('en-IN')} कुटुंबांच्या प्रत्यक्ष संवादातून गोळा केलेला सांख्यिकीय राजकीय कल`
                : 'Aggregated ground political mood based on surveyed households'}
            </p>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            style={{
              background: '#f1f5f9',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '600',
              color: '#1e293b',
              cursor: 'pointer',
            }}
          >
            {isMr ? 'सविस्तर अहवाल पहा →' : 'View Deep Report →'}
          </button>
        </div>

        {/* Multi-segment Progress Bar */}
        <div
          style={{
            height: '24px',
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.1)',
          }}
        >
          <div
            style={{
              width: `${profile.sentiment.support}%`,
              background: 'linear-gradient(90deg, #16a34a, #22c55e)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${profile.sentiment.support}% Support`}
          >
            {profile.sentiment.support}%
          </div>
          <div
            style={{
              width: `${profile.sentiment.neutral_swing}%`,
              background: 'linear-gradient(90deg, #eab308, #facc15)',
              color: '#713f12',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${profile.sentiment.neutral_swing}% Swing`}
          >
            {profile.sentiment.neutral_swing}%
          </div>
          <div
            style={{
              width: `${profile.sentiment.opposition}%`,
              background: 'linear-gradient(90deg, #ef4444, #f87171)',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`${profile.sentiment.opposition}% Opposition`}
          >
            {profile.sentiment.opposition}%
          </div>
        </div>

        {/* Sentiment Legends */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '16px' }}>
          <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#15803d' }}>
              ✓ {isMr ? 'अनुकूल व भक्कम मतदार' : 'Favorable Loyalists'} ({profile.sentiment.support}%)
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
              {isMr ? 'लाडकी बहीण, शेतकरी सन्मान व विकासकामांचा प्रभाव' : 'Impact of Ladki Bahin, Farmer aid & local work'}
            </div>
          </div>

          <div style={{ padding: '12px', background: '#fefce8', borderRadius: '8px', borderLeft: '4px solid #eab308' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#a16207' }}>
              ⚖ {isMr ? 'तटस्थ / निर्णय न घेतलेले' : 'Swing / Undecided'} ({profile.sentiment.neutral_swing}%)
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
              {isMr ? 'पाणी, रस्ते व रोजगारावर लक्ष दिल्यास आपल्याकडे वळू शकतात' : 'Can tilt with focused water & civic redressal'}
            </div>
          </div>

          <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#b91c1c' }}>
              ⚠ {isMr ? 'सावध / विरोधक प्रभाव' : 'Opposition Leaning'} ({profile.sentiment.opposition}%)
            </div>
            <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
              {isMr ? 'कुपवाड व बामणी परिसरातील बुथांवर विशेष लक्ष हवे' : 'Requires micro-strategy in Kupwad & Bamani'}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Tours & Meetings */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '22px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
            📍 {isMr ? 'नेत्यांचे आगामी दौरे व बैठका' : "Upcoming Tours & Meetings"}
          </h4>
          <span
            onClick={() => onNavigate('meetings_tours')}
            style={{ fontSize: '12px', color: '#2563eb', cursor: 'pointer', fontWeight: '600' }}
          >
            {isMr ? 'सर्व वेळापत्रक' : 'Full Itinerary'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
          {upcomingMeetings.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px', gridColumn: '1 / -1' }}>
              {isMr ? 'कोणतेही नियोजित आगामी दौरे नाहीत.' : 'No upcoming tours scheduled.'}
            </div>
          ) : (
            upcomingMeetings.map((meeting) => (
              <div
                key={meeting.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    {isMr ? meeting.title_mr : (meeting.title_en || meeting.title_mr)}
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      background: '#dbeafe',
                      color: '#1d4ed8',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isMr ? meeting.type_mr : (meeting.type_en || meeting.type_mr)}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  📅 {meeting.date} ({meeting.time})
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  🏛️ {isMr ? meeting.venue_mr : (meeting.venue_en || meeting.venue_mr)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Sovereign Political Command & Digital Governance Seal Ribbon */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          position: 'relative',
          overflow: 'hidden',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
        }}
      >
        {/* Top Accent Strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #0ea5e9 100%)',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              border: '1.5px solid #6366f1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(99, 102, 241, 0.08)',
              fontSize: '18px',
              flexShrink: 0,
            }}
            title={isMr ? 'प्रशासनिक सुरक्षा' : 'Administrative Governance'}
          >
            🏛️
          </div>
          <div>
            <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span>{isMr ? 'भारत निवडणूक व राजकीय व्यवस्थापन प्रणाली • सुरक्षित डेटा व्यवस्था' : 'Political Command & Field Governance Administration • Secure Sovereign Platform'}</span>
              <span style={{ fontSize: '11px', background: '#fef3c7', color: '#b45309', padding: '2px 8px', borderRadius: '4px', fontWeight: '750', border: '1px solid #fde68a' }}>
                {isMr ? '🏛️ सत्यमेव जयते' : '🏛️ Satyameva Jayate'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              {isMr
                ? 'स्थानिक स्वराज्य संस्था व सार्वत्रिक निवडणुकांसाठी सुरक्षित, पारदर्शक व रिअल-टाइम डिजिटल नियंत्रण कक्ष.'
                : 'Encrypted, transparent and real-time administrative platform compliant with digital governance standards.'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '5px 11px',
              fontSize: '11.5px',
              fontWeight: '700',
              color: '#334155',
            }}
          >
            <span>🛡️</span> {isMr ? 'डेटा सार्वभौमत्व व सुरक्षा' : 'Data Sovereignty & Security'}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ecfdf5',
              border: '1px solid #a7f3d0',
              borderRadius: '6px',
              padding: '5px 11px',
              fontSize: '11.5px',
              fontWeight: '750',
              color: '#047857',
            }}
          >
            <span>🔒</span> 256-Bit SSL
          </span>
        </div>
      </div>
    </div>
  );
}
