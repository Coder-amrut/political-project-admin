import React from 'react';
import {
  Users,
  Phone,
  ClipboardCheck,
  AlertCircle,
  CalendarCheck,
  CheckSquare,
  Clock,
  ChevronRight,
  Bell,
  Box,
  Plus
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from 'recharts';

export default function DashboardTab({
  isMr,
  profileData = {},
  user = {},
  dashboardStats = {},
  complaintsData = [],
  tasksList = [],
  votersList = [],
  attendanceState,
  voterData = [],
  activities = [],
  setActiveTab,
  LiveClock,
}) {
  const pendingComplaintsCount = complaintsData.filter((c) => c.status === 'Pending').length;
  const [hasScrolledDown, setHasScrolledDown] = React.useState(false);
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const [extraFeeds, setExtraFeeds] = React.useState([]);

  React.useEffect(() => {
    let triggered = false;
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      
      // When user scrolls down more (past 180px or within 400px of bottom)
      if (scrollPos > 160 || (scrollPos + windowHeight >= docHeight - 400)) {
        setHasScrolledDown(true);
        if (!triggered) {
          triggered = true;
          setIsLoadingMore(true);
          setTimeout(() => {
            setIsLoadingMore(false);
            setExtraFeeds([
              {
                id: 'extra-1',
                title: isMr ? 'बूथ क्र. १ ते १४ - थेट उपस्थिती अहवाल' : 'Booths 1-14 - Live Attendance Report',
                desc: isMr ? '९२% प्रमुख कार्यकर्ते थेट प्रभागात सक्रिय' : '92% key karyakartas currently active in ward',
                tag: isMr ? 'सक्रिय' : 'Active',
                color: '#16a34a',
                bg: '#ecfdf5',
                border: '#bbf7d0'
              },
              {
                id: 'extra-2',
                title: isMr ? 'आजचे संकलित मतदार कल विश्लेषण' : 'Today\'s Voter Sentiment Analysis',
                desc: isMr ? '८८% सकारात्मक व अनुकूल कल नोंद' : '88% positive and supportive response logged',
                tag: isMr ? 'अनुकूल' : 'Positive',
                color: '#2563eb',
                bg: '#eff6ff',
                border: '#bfdbfe'
              },
              {
                id: 'extra-3',
                title: isMr ? 'कुटुंब भेटींचा प्रति तास वेग' : 'Door-to-Door Household Outreach Pace',
                desc: isMr ? 'प्रति तास सरासरी १४ कुटुंबांशी थेट संवाद' : 'Average 14 households reached per hour',
                tag: isMr ? 'उत्कृष्ट' : 'Optimal',
                color: '#d97706',
                bg: '#fffdf5',
                border: '#fde68a'
              }
            ]);
          }, 1400);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMr]);

  const chartDataToRender = voterData.length > 0 ? voterData : [
    { name: isMr ? 'मे' : 'May', value1: 45, value2: 60 },
    { name: isMr ? 'जून' : 'Jun', value1: 58, value2: 70 },
    { name: isMr ? 'जुलै' : 'Jul', value1: 65, value2: 80 },
    { name: isMr ? 'ऑग' : 'Aug', value1: 78, value2: 85 },
    { name: isMr ? 'सप्टें' : 'Sep', value1: 88, value2: 95 },
    { name: isMr ? 'ऑक्टो' : 'Oct', value1: 96, value2: 100 },
  ];

  const activitiesToRender = activities.length > 0 ? activities : [
    {
      id: 1,
      title: isMr ? 'प्रभाग क्र. ४ मध्ये नवीन कुटुंब सर्वेक्षण पूर्ण' : 'Completed household survey in Ward 4',
      time: isMr ? '१० मिनिटांपूर्वी' : '10 mins ago',
      type: 'survey',
      color: '#0284c7',
      bgColor: '#e0f2fe',
      targetTab: 'Survey',
    },
    {
      id: 2,
      title: isMr ? 'बूथ क्र. १२ मधील मतदारांशी थेट भेट व संवाद' : 'Door-to-door interaction with voters at Booth 12',
      time: isMr ? '३५ मिनिटांपूर्वी' : '35 mins ago',
      type: 'users',
      color: '#16a34a',
      bgColor: '#dcfce7',
      targetTab: 'Contact & Meetings',
    },
    {
      id: 3,
      title: isMr ? 'रस्ता दुरुस्तीबाबतची नवीन तक्रार नोंदवली' : 'Logged citizen grievance for road repair',
      time: isMr ? '२ तासांपूर्वी' : '2 hours ago',
      type: 'complaint',
      color: '#ea580c',
      bgColor: '#ffedd5',
      targetTab: 'Complaints',
    },
    {
      id: 4,
      title: isMr ? 'सकाळची डिजिटल उपस्थिती (Geo Punch) यशस्वी' : 'Geo Attendance punched in successfully',
      time: isMr ? 'आज स. ०९:१५' : 'Today, 09:15 AM',
      type: 'clock',
      color: '#7c3aed',
      bgColor: '#f3e8ff',
      targetTab: 'Attendance',
    },
  ];

  const officerName = profileData.fullName || user?.full_name || 'Rahul Patil';
  const officerInitials = officerName
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'IN';

  const wardDisplay = profileData.assignedWard
    ? (isMr ? `प्रभाग क्र. ${profileData.assignedWard} - गावभाग व माधवनगर • बूथ क्र. १ ते १४ थेट संचलन कक्ष` : `Ward No. ${profileData.assignedWard} - Area & Madhavnagar • Booths 1-14 Field Command`)
    : (isMr ? 'प्रभाग क्र. ४ - गावभाग व माधवनगर • बूथ क्र. १ ते १४ थेट संचलन कक्ष' : 'Ward No. 4 - Area & Madhavnagar • Booths 1-14 Field Command');

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* 1. TOP HEADER (matching mockup: 3D cube app icon in blue rounded box, title, subtitle & bell button) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          padding: '4px 2px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: '#2b39b0',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 18px rgba(43, 57, 176, 0.25)',
              flexShrink: 0,
            }}
          >
            <Box size={28} color="#ffffff" strokeWidth={2.2} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.4px', lineHeight: 1.1 }}>
              {isMr ? 'डॅशबोर्ड' : 'Dashboard'}
            </h1>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
              {isMr ? 'प्रभाग व्यवस्थापन कक्ष' : 'Ward Management Desk'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {LiveClock && <LiveClock isMr={isMr} variant="header" />}
          
          <button
            type="button"
            onClick={() => alert(isMr ? 'कोणतीही नवीन सूचना नाही.' : 'No new notifications.')}
            title={isMr ? 'सूचना' : 'Notifications'}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '16px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#475569',
              position: 'relative',
              boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)',
              transition: 'all 0.15s ease'
            }}
          >
            <Bell size={20} />
            <span style={{ position: 'absolute', top: '12px', right: '12px', width: '7px', height: '7px', borderRadius: '50%', background: '#ef4444' }} />
          </button>
        </div>
      </div>

      {/* 2. OFFICER HERO CARD (White Card with dark blue IN avatar, name, green status pill, and full-width blue action button) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '26px',
          padding: '24px 26px',
          border: '1.5px solid #e2e8f0',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Avatar with Initials */}
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: '#2b39b0',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              fontWeight: '900',
              letterSpacing: '1px',
              boxShadow: '0 6px 16px rgba(43, 57, 176, 0.28)',
              flexShrink: 0
            }}
          >
            {officerInitials}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0, fontSize: '21px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.3px' }}>
                {isMr ? `नमस्कार, ${officerName}!` : `Welcome, ${officerName}!`}
              </h2>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: '750',
                  padding: '3px 12px',
                  borderRadius: '16px',
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#059669',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669', boxShadow: '0 0 6px #059669' }} />
                {isMr ? 'सक्रिय संचालन' : 'Active Duty'}
              </span>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', fontWeight: '600' }}>
              <span style={{ color: '#ef4444' }}>📍</span>
              <span>{wardDisplay}</span>
            </div>
          </div>
        </div>

        {/* Full-width Royal Blue Clickable Action Button */}
        <button
          type="button"
          onClick={() => setActiveTab('Survey')}
          style={{
            background: '#2b39b0',
            color: '#ffffff',
            border: 'none',
            borderRadius: '18px',
            padding: '14px 20px',
            fontSize: '15px',
            fontWeight: '850',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 6px 18px rgba(43, 57, 176, 0.28)',
            transition: 'all 0.2s ease',
            width: '100%',
            letterSpacing: '0.2px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(43, 57, 176, 0.38)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(43, 57, 176, 0.28)';
          }}
        >
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900' }}>+</span>
          <span>{isMr ? '+ नवीन सर्वेक्षण नोंद' : '+ New Survey Entry'}</span>
        </button>
      </div>

      {/* 3. FOUR METRIC CARDS (Exact match to theme screenshot: light cards, colored borders, circular icons, bold numbers & dot sublabels) */}
      <div className="dashboard-theme-grid">
        
        {/* CARD 1: BLUE THEME (एकूण मतदार / Total Voters -> navigates to Contact & Meetings) */}
        <div
          className="dashboard-theme-card"
          onClick={() => setActiveTab('Contact & Meetings')}
          style={{
            background: '#f8fbff',
            border: '1.5px solid #bfdbfe',
            boxShadow: '0 4px 16px rgba(37, 99, 235, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(37, 99, 235, 0.15)';
            e.currentTarget.style.borderColor = '#60a5fa';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.05)';
            e.currentTarget.style.borderColor = '#bfdbfe';
          }}
          title={isMr ? 'मतदार यादी उघडण्यासाठी क्लिक करा' : 'Click to open voter directory'}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  flexShrink: 0
                }}
              >
                <Users size={22} color="#ffffff" />
              </div>

              <span
                style={{
                  background: '#eff6ff',
                  border: '1px solid #dbeafe',
                  borderRadius: '16px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#1d4ed8'
                }}
              >
                {isMr ? 'नियुक्त' : 'Assigned'}
              </span>
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: '750', color: '#64748b', marginTop: '16px' }}>
              {isMr ? 'एकूण मतदार' : 'Total Voters'}
            </div>

            <div className="card-number">
              {dashboardStats.totalAssigned?.toLocaleString() || 8}
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '14px 0 10px 0' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#2563eb' }} />
              <span>{dashboardStats.contactRate ? `${dashboardStats.contactRate}% ${isMr ? 'संपर्क दर' : 'Contact Rate'}` : (isMr ? '७५% संपर्क दर' : '75% Contact Rate')}</span>
            </div>
          </div>
        </div>

        {/* CARD 2: GREEN THEME (थेट संपर्क / Contacted Voters -> navigates to Contact & Meetings) */}
        <div
          className="dashboard-theme-card"
          onClick={() => setActiveTab('Contact & Meetings')}
          style={{
            background: '#f7fdf9',
            border: '1.5px solid #bbf7d0',
            boxShadow: '0 4px 16px rgba(5, 150, 105, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(5, 150, 105, 0.15)';
            e.currentTarget.style.borderColor = '#4ade80';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.05)';
            e.currentTarget.style.borderColor = '#bbf7d0';
          }}
          title={isMr ? 'थेट संपर्क यादी उघडण्यासाठी क्लिक करा' : 'Click to open contacted voters'}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#059669',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(5, 150, 105, 0.3)',
                  flexShrink: 0
                }}
              >
                <Phone size={22} color="#ffffff" />
              </div>

              <span
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #d1fae5',
                  borderRadius: '16px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#059669'
                }}
              >
                {isMr ? 'संपर्कित' : 'Reached'}
              </span>
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: '750', color: '#64748b', marginTop: '16px' }}>
              {isMr ? 'थेट संपर्क' : 'Direct Contacts'}
            </div>

            <div className="card-number">
              {dashboardStats.contacted?.toLocaleString() || 6}
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '14px 0 10px 0' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#059669', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#059669' }} />
              <span>{dashboardStats.supportiveRate ? `${dashboardStats.supportiveRate}% ${isMr ? 'अनुकूल कल' : 'Positive'}` : (isMr ? '५०% अनुकूल कल' : '50% Positive')}</span>
            </div>
          </div>
        </div>

        {/* CARD 3: AMBER THEME (कुटुंब सर्वेक्षण / Household Survey -> navigates to Survey) */}
        <div
          className="dashboard-theme-card"
          onClick={() => setActiveTab('Survey')}
          style={{
            background: '#fffdf5',
            border: '1.5px solid #fde68a',
            boxShadow: '0 4px 16px rgba(245, 158, 11, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(245, 158, 11, 0.15)';
            e.currentTarget.style.borderColor = '#f59e0b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(245, 158, 11, 0.05)';
            e.currentTarget.style.borderColor = '#fde68a';
          }}
          title={isMr ? 'कुटुंब सर्वेक्षण कक्ष उघडण्यासाठी क्लिक करा' : 'Click to open survey desk'}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#f59e0b',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  flexShrink: 0
                }}
              >
                <ClipboardCheck size={22} color="#ffffff" />
              </div>

              <span
                style={{
                  background: '#fef3c7',
                  border: '1px solid #fde68a',
                  borderRadius: '16px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#b45309'
                }}
              >
                {isMr ? 'सक्रिय' : 'Active'}
              </span>
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: '750', color: '#64748b', marginTop: '16px' }}>
              {isMr ? 'कुटुंब सर्वेक्षण' : 'Household Surveys'}
            </div>

            <div className="card-number">
              {dashboardStats.surveysCompleted?.toLocaleString() || 0}
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '14px 0 10px 0' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706' }} />
              <span>{isMr ? 'सक्रिय नोंदणी' : 'Active Campaign'}</span>
            </div>
          </div>
        </div>

        {/* CARD 4: PURPLE THEME (प्रलंबित समस्या / Pending Issues -> navigates to Complaints) */}
        <div
          className="dashboard-theme-card"
          onClick={() => setActiveTab('Complaints')}
          style={{
            background: '#faf7ff',
            border: '1.5px solid #e9d5ff',
            boxShadow: '0 4px 16px rgba(124, 58, 237, 0.05)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 28px rgba(124, 58, 237, 0.15)';
            e.currentTarget.style.borderColor = '#c084fc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.05)';
            e.currentTarget.style.borderColor = '#e9d5ff';
          }}
          title={isMr ? 'नागरिक तक्रारी कक्ष उघडण्यासाठी क्लिक करा' : 'Click to open grievances'}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: '#8b5cf6',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.3)',
                  flexShrink: 0
                }}
              >
                <AlertCircle size={22} color="#ffffff" />
              </div>

              <span
                style={{
                  background: '#f3e8ff',
                  border: '1px solid #e9d5ff',
                  borderRadius: '16px',
                  padding: '5px 14px',
                  fontSize: '12px',
                  fontWeight: '800',
                  color: '#7c3aed'
                }}
              >
                {isMr ? 'प्रलंबित' : 'Pending'}
              </span>
            </div>

            <div style={{ fontSize: '13.5px', fontWeight: '750', color: '#64748b', marginTop: '16px' }}>
              {isMr ? 'प्रलंबित समस्या' : 'Pending Grievances'}
            </div>

            <div className="card-number">
              {pendingComplaintsCount > 0 ? pendingComplaintsCount : 3}
            </div>
          </div>

          <div>
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '14px 0 10px 0' }} />
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#7c3aed' }} />
              <span>{isMr ? 'तात्काळ लक्ष' : 'Needs Action'}</span>
            </div>
          </div>
        </div>

      </div>

      {/* 4. OPERATIONAL COMMAND CARDS (All Clickable to their particular panels) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        
        {/* Grievance Desk -> Complaints */}
        <div
          onClick={() => setActiveTab('Complaints')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #fed7aa',
            borderRadius: '20px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(234, 88, 12, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ea580c';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(234, 88, 12, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#fed7aa';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(234, 88, 12, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a' }}>
                {isMr ? 'नागरिकांच्या समस्या' : 'Citizen Grievances'}
              </div>
              <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '600', marginTop: '2px' }}>
                {pendingComplaintsCount > 0 ? `${pendingComplaintsCount} ${isMr ? 'तक्रारी प्रलंबित' : 'Pending Resolution'}` : (isMr ? 'सर्व तक्रारी निकाली' : 'All Grievances Resolved')}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#ea580c" />
        </div>

        {/* Citizen Directory -> Contact & Meetings */}
        <div
          onClick={() => setActiveTab('Contact & Meetings')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #bbf7d0',
            borderRadius: '20px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(22, 163, 74, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#16a34a';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(22, 163, 74, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#bbf7d0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(22, 163, 74, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a' }}>
                {isMr ? 'नागरिक संपर्क यादी' : 'Citizen Directory'}
              </div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', marginTop: '2px' }}>
                {votersList.length || 8} {isMr ? 'मतदार नोंद उपलब्ध' : 'Voters in Directory'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#16a34a" />
        </div>

        {/* Field Tasks -> Tasks */}
        <div
          onClick={() => setActiveTab('Tasks')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '20px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(37, 99, 235, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#bfdbfe';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(37, 99, 235, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckSquare size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a' }}>
                {isMr ? 'नेमलेली कार्ये' : 'Field Tasks'}
              </div>
              <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600', marginTop: '2px' }}>
                {pendingTasksCount} {isMr ? 'कार्ये बाकी' : 'Tasks Pending'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#2563eb" />
        </div>

        {/* Geo Attendance -> Attendance */}
        <div
          onClick={() => setActiveTab('Attendance')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #e9d5ff',
            borderRadius: '20px',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 10px rgba(124, 58, 237, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7c3aed';
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(124, 58, 237, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e9d5ff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 10px rgba(124, 58, 237, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarCheck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: '850', color: '#0f172a' }}>
                {isMr ? 'दैनिक डिजिटल उपस्थिती' : 'Geo Attendance'}
              </div>
              <div style={{ fontSize: '12px', color: '#6d28d9', fontWeight: '600', marginTop: '2px' }}>
                {attendanceState === 'Punched In' ? (isMr ? '🟢 ड्युटी सुरू (हजर)' : '🟢 Punched In') : (isMr ? 'हजेरी नोंद आवश्यक' : 'Punch-In Required')}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#7c3aed" />
        </div>

      </div>

      {/* 5. Responsive Bottom Layout: Outreach Trends Chart & Recent Activity Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left: Voter Outreach Trends Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '22px',
            padding: '24px',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span>📊</span>
                <span>{isMr ? 'मतदार संपर्क कल' : 'Voter Outreach Trends'}</span>
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>
                {isMr ? 'मागील ६ महिन्यांमधील प्रत्यक्ष संपर्क प्रगती' : 'Direct contact progress over last 6 months'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '750' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#2563eb' }} />
                <span style={{ color: '#0f172a' }}>{isMr ? 'संपर्क साधलेले' : 'Contacted'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '750' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#bfdbfe' }} />
                <span style={{ color: '#64748b' }}>{isMr ? 'उद्दिष्ट' : 'Target'}</span>
              </div>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartDataToRender} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#ffffff',
                    border: '1.5px solid #bfdbfe',
                    borderRadius: '12px',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.12)',
                    fontSize: '12.5px',
                    fontWeight: '750',
                  }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="value1" name={isMr ? 'संपर्क साधलेले' : 'Contacted'} fill="#2563eb" radius={[6, 6, 0, 0]} />
                <Bar dataKey="value2" name={isMr ? 'उद्दिष्ट' : 'Target'} fill="#bfdbfe" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Field Activities Stream (Items clickable to their respective panels) */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '22px',
            padding: '24px',
            boxShadow: '0 4px 18px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span>⚡</span>
                <span>{isMr ? 'थेट क्षेत्रीय घडामोडी' : 'Recent Field Activities'}</span>
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', fontWeight: '600' }}>
                {isMr ? 'अधिकारी व बूथ स्तरावरील ताज्या नोंदी' : 'Live updates from assigned booths'}
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: '14px' }}>
              ● Live Feed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {activitiesToRender.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  if (item.targetTab) setActiveTab(item.targetTab);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '14px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  cursor: item.targetTab ? 'pointer' : 'default',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f9ff';
                  e.currentTarget.style.borderColor = '#bae6fd';
                  e.currentTarget.style.transform = 'translateX(3px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
                title={item.targetTab ? `${isMr ? 'उघडा:' : 'Open:'} ${item.targetTab}` : ''}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    backgroundColor: item.bgColor || item.bg_color || '#e0f2fe',
                    color: item.color || '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.type === 'users' ? (
                    <Users size={18} />
                  ) : item.type === 'clock' ? (
                    <Clock size={18} />
                  ) : item.type === 'complaint' ? (
                    <AlertCircle size={18} />
                  ) : (
                    <ClipboardCheck size={18} />
                  )}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '750',
                      color: '#0f172a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>
                    {item.time}
                  </div>
                </div>
                {item.targetTab && (
                  <ChevronRight size={15} color="#94a3b8" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. SUN LOADING SECTION (Triggers when user scrolls down more) */}
      {hasScrolledDown && (
        <div
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #fffbf5 100%)',
            border: '1.5px solid #fed7aa',
            borderRadius: '26px',
            padding: '28px 24px',
            boxShadow: '0 8px 30px rgba(245, 158, 11, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '16px',
            marginTop: '10px',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Radiant Glowing Sun Image */}
          <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <img
              src="/sun_icon.jpg"
              alt="Sun Symbol"
              className="sun-loader-img"
              style={{
                width: '84px',
                height: '84px',
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: '0 0 24px rgba(245, 158, 11, 0.5)',
                border: '3px solid #fef3c7'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>

          <div style={{ maxWidth: '520px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#9a3412', letterSpacing: '-0.3px' }}>
              {isMr ? 'सूर्य संचलन कक्ष • थेट माहिती अपडेट्स' : 'Sun Field Command • Live Data Hub'}
            </h3>
            <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#78350f', fontWeight: '600' }}>
              {isLoadingMore
                ? (isMr ? 'नवीन क्षेत्रीय माहिती व बूथ नोंदी लोड होत आहेत...' : 'Loading latest field updates & booth data...')
                : (isMr ? 'सर्व ताज्या क्षेत्रीय नोंदी अद्ययावत आहेत.' : 'All live field records are synced.')}
            </p>
          </div>

          {/* Spinner and Loading Status */}
          {isLoadingMore ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
              <div className="sun-spinner-ring" />
              <span style={{ fontSize: '13px', fontWeight: '800', color: '#d97706' }}>
                {isMr ? 'माहिती लोड होत आहे...' : 'Loading field records...'}
              </span>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginTop: '4px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px', width: '100%' }}>
                {extraFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    style={{
                      background: feed.bg,
                      border: `1.5px solid ${feed.border}`,
                      borderRadius: '16px',
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textAlign: 'left',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: '850', color: '#0f172a' }}>
                        {feed.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px', fontWeight: '600' }}>
                        {feed.desc}
                      </div>
                    </div>
                    <span style={{ background: '#ffffff', color: feed.color, border: `1px solid ${feed.border}`, padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', whiteSpace: 'nowrap' }}>
                      {feed.tag}
                    </span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsLoadingMore(true);
                  setTimeout(() => setIsLoadingMore(false), 900);
                }}
                style={{
                  alignSelf: 'center',
                  background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '9px 22px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
                  marginTop: '6px'
                }}
              >
                <span>☀️</span>
                <span>{isMr ? 'पुन्हा रिफ्रेश करा' : 'Refresh Live Feed'}</span>
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
