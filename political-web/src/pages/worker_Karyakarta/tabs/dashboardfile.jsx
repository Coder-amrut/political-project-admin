import React from 'react';
import {
  Users,
  PhoneCall,
  ClipboardCheck,
  BarChart2,
  AlertCircle,
  Calendar,
  CheckSquare,
  CalendarCheck,
  Clock,
  ChevronRight,
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
import BackButton from '../../../components/BackButton';

export default function DashboardTab({
  isMr,
  profileData,
  user,
  dashboardStats,
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
  const pendingTasksCount = tasksList.filter((t) => !t.completed).length;

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
    },
    {
      id: 2,
      title: isMr ? 'बूथ क्र. १२ मधील मतदारांशी थेट भेट व संवाद' : 'Door-to-door interaction with voters at Booth 12',
      time: isMr ? '३५ मिनिटांपूर्वी' : '35 mins ago',
      type: 'users',
      color: '#16a34a',
      bgColor: '#dcfce7',
    },
    {
      id: 3,
      title: isMr ? 'रस्ता दुरुस्तीबाबतची नवीन तक्रार नोंदवली' : 'Logged citizen grievance for road repair',
      time: isMr ? '२ तासांपूर्वी' : '2 hours ago',
      type: 'complaint',
      color: '#ea580c',
      bgColor: '#ffedd5',
    },
    {
      id: 4,
      title: isMr ? 'सकाळची डिजिटल उपस्थिती (Geo Punch) यशस्वी' : 'Geo Attendance punched in successfully',
      time: isMr ? 'आज स. ०९:१५' : 'Today, 09:15 AM',
      type: 'clock',
      color: '#7c3aed',
      bgColor: '#f3e8ff',
    },
  ];

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* 1. Executive Welcome Header Card */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '16px',
          padding: '18px 22px',
          boxShadow: '0 2px 10px rgba(2, 132, 199, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '900',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              flexShrink: 0,
            }}
          >
            🇮🇳
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '900', color: '#0f172a' }}>
                {isMr ? `नमस्कार, ${profileData.fullName || user?.full_name || 'अधिकारी'}!` : `Welcome, ${profileData.fullName || user?.full_name || 'Field Officer'}!`}
              </h1>
              <span style={{ fontSize: '11px', fontWeight: '800', background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: '12px' }}>
                {isMr ? 'सक्रिय संचलन' : 'Active Duty'}
              </span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '3px', fontWeight: '600' }}>
              📍 {profileData.assignedWard ? `${isMr ? 'प्रभाग' : 'Ward'} ${profileData.assignedWard}` : (isMr ? 'सांगली मध्यवर्ती प्रभाग' : 'Sangli Central Ward')} • {isMr ? 'बूथ क्र. १ ते १४ थेट संचलन कक्ष' : 'Booths 1-14 Field Command'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {LiveClock && <LiveClock isMr={isMr} variant="header" />}
          <button
            type="button"
            onClick={() => setActiveTab('Survey')}
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12.5px',
              fontWeight: '750',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            }}
          >
            <ClipboardCheck size={15} />
            <span>{isMr ? '+ सर्वेक्षण नोंद' : '+ New Survey'}</span>
          </button>
          {user?.roles?.some((r) => r === 'ADMIN' || r === 'OFFICER') && (
            <BackButton fallbackPath="/admin" text={isMr ? 'प्रशासक HQ' : 'Admin HQ'} />
          )}
        </div>
      </div>

      {/* 2. Four Clean Modern Executive Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        {/* Card 1: Total Assigned */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#ffffff',
            border: '1.5px solid #bae6fd',
            borderTop: '4px solid #0284c7',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 14px rgba(2, 132, 199, 0.06)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(2, 132, 199, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(2, 132, 199, 0.06)';
          }}
        >
          <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.05, color: '#0284c7', pointerEvents: 'none' }}>
            <Users size={80} strokeWidth={1.4} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {isMr ? 'एकूण नियुक्त मतदार' : 'Total Assigned Voters'}
            </span>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(2, 132, 199, 0.12)' }}>
              <Users size={19} />
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}>
            {dashboardStats.totalAssigned?.toLocaleString() || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#64748b', fontWeight: '650', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0284c7', boxShadow: '0 0 6px #0284c7' }} />
              {dashboardStats.contactRate ? `${dashboardStats.contactRate}% ${isMr ? 'संपर्क दर' : 'Contact Rate'}` : (isMr ? 'बूथ मतदार' : 'Booth Network')}
            </span>
            <span style={{ background: '#f0f9ff', padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '750', color: '#0284c7', border: '1px solid #bae6fd' }}>
              {isMr ? 'नियुक्त' : 'Assigned'}
            </span>
          </div>
        </div>

        {/* Card 2: Contacted */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#ffffff',
            border: '1.5px solid #bbf7d0',
            borderTop: '4px solid #16a34a',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.06)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(22, 163, 74, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 163, 74, 0.06)';
          }}
        >
          <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.05, color: '#16a34a', pointerEvents: 'none' }}>
            <PhoneCall size={80} strokeWidth={1.4} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {isMr ? 'थेट संपर्क साधलेले' : 'Contacted Voters'}
            </span>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(22, 163, 74, 0.12)' }}>
              <PhoneCall size={19} />
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}>
            {dashboardStats.contacted?.toLocaleString() || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#64748b', fontWeight: '650', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 6px #16a34a' }} />
              {dashboardStats.supportiveRate ? `${dashboardStats.supportiveRate}% ${isMr ? 'अनुकूल कल' : 'Positive Response'}` : (isMr ? 'थेट संवाद' : 'Direct Outreach')}
            </span>
            <span style={{ background: '#f0fdf4', padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '750', color: '#15803d', border: '1px solid #bbf7d0' }}>
              {isMr ? 'संपर्कित' : 'Reached'}
            </span>
          </div>
        </div>

        {/* Card 3: Surveys Completed */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#ffffff',
            border: '1.5px solid #fed7aa',
            borderTop: '4px solid #ea580c',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 14px rgba(234, 88, 12, 0.06)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(234, 88, 12, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(234, 88, 12, 0.06)';
          }}
        >
          <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.05, color: '#ea580c', pointerEvents: 'none' }}>
            <ClipboardCheck size={80} strokeWidth={1.4} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {isMr ? 'कुटुंब सर्वेक्षण नोंद' : 'Household Surveys Completed'}
            </span>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(234, 88, 12, 0.12)' }}>
              <ClipboardCheck size={19} />
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}>
            {dashboardStats.surveysCompleted?.toLocaleString() || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#64748b', fontWeight: '650', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ea580c', boxShadow: '0 0 6px #ea580c' }} />
              {isMr ? `उद्दिष्ट: ${dashboardStats.surveysTarget || 50} कुटुंबे` : `Target: ${dashboardStats.surveysTarget || 50} Families`}
            </span>
            <span style={{ background: '#fff7ed', padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '750', color: '#c2410c', border: '1px solid #fed7aa' }}>
              {isMr ? 'सक्रिय' : 'Active'}
            </span>
          </div>
        </div>

        {/* Card 4: Supportive Base */}
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            background: '#ffffff',
            border: '1.5px solid #e9d5ff',
            borderTop: '4px solid #7c3aed',
            borderRadius: '16px',
            padding: '20px',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.06)',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            cursor: 'default',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(124, 58, 237, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(124, 58, 237, 0.06)';
          }}
        >
          <div style={{ position: 'absolute', right: '-8px', bottom: '-8px', opacity: 0.05, color: '#7c3aed', pointerEvents: 'none' }}>
            <BarChart2 size={80} strokeWidth={1.4} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '800', letterSpacing: '0.4px', textTransform: 'uppercase' }}>
              {isMr ? 'अनुकूल मतदार आधार' : 'Supportive Voter Base'}
            </span>
            <span style={{ width: '38px', height: '38px', borderRadius: '11px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(124, 58, 237, 0.12)' }}>
              <BarChart2 size={19} />
            </span>
          </div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1, letterSpacing: '-0.5px', position: 'relative', zIndex: 1 }}>
            {dashboardStats.supportive?.toLocaleString() || 0}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', fontSize: '11.5px', color: '#64748b', fontWeight: '650', position: 'relative', zIndex: 1 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#7c3aed', boxShadow: '0 0 6px #7c3aed' }} />
              {dashboardStats.totalAssigned > 0 ? `${Math.round((dashboardStats.supportive / dashboardStats.totalAssigned) * 100)}% ${isMr ? 'समर्थक कल' : 'Base Sentiment'}` : (isMr ? 'सकारात्मक कल' : 'Positive Base')}
            </span>
            <span style={{ background: '#faf5ff', padding: '2px 8px', borderRadius: '10px', fontSize: '10.5px', fontWeight: '750', color: '#6d28d9', border: '1px solid #e9d5ff' }}>
              {isMr ? 'अनुकूल' : 'Positive'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operational Quick Action Command Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
        {/* Grievance Desk */}
        <div
          onClick={() => setActiveTab('Complaints')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #fed7aa',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(234, 88, 12, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#ea580c';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(234, 88, 12, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#fed7aa';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(234, 88, 12, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                {isMr ? 'नागरिकांच्या समस्या' : 'Citizen Grievances'}
              </div>
              <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '600', marginTop: '2px' }}>
                {pendingComplaintsCount > 0 ? `${pendingComplaintsCount} ${isMr ? 'तक्रारी प्रलंबित' : 'Pending Resolution'}` : (isMr ? 'सर्व तक्रारी निकाली' : 'All Grievances Resolved')}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#ea580c" />
        </div>

        {/* Citizen Directory */}
        <div
          onClick={() => setActiveTab('Contact & Meetings')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #bbf7d0',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#16a34a';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(22, 163, 74, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#bbf7d0';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(22, 163, 74, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                {isMr ? 'नागरिक संपर्क' : 'Citizen Contacts'}
              </div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', marginTop: '2px' }}>
                {votersList.length || 8} {isMr ? 'मतदार नोंद उपलब्ध' : 'Voters in Directory'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#16a34a" />
        </div>

        {/* Field Tasks */}
        <div
          onClick={() => setActiveTab('Tasks')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #bfdbfe',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(37, 99, 235, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#bfdbfe';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckSquare size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                {isMr ? 'नेमलेली कार्ये' : 'Field Tasks'}
              </div>
              <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '600', marginTop: '2px' }}>
                {pendingTasksCount} {isMr ? 'कार्ये बाकी' : 'Tasks Pending'}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#2563eb" />
        </div>

        {/* Attendance Status */}
        <div
          onClick={() => setActiveTab('Attendance')}
          style={{
            cursor: 'pointer',
            background: '#ffffff',
            border: '1.5px solid #e9d5ff',
            borderRadius: '14px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(124, 58, 237, 0.04)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#7c3aed';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e9d5ff';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(124, 58, 237, 0.04)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#f3e8ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CalendarCheck size={20} />
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: '800', color: '#0f172a' }}>
                {isMr ? 'डिजिटल उपस्थिती' : 'Geo Attendance'}
              </div>
              <div style={{ fontSize: '12px', color: '#6d28d9', fontWeight: '600', marginTop: '2px' }}>
                {attendanceState === 'Punched In' ? (isMr ? '🟢 ड्युटी सुरू (हजर)' : '🟢 Punched In') : (isMr ? 'हजेरी आवश्यक' : 'Punch-In Required')}
              </div>
            </div>
          </div>
          <ChevronRight size={18} color="#7c3aed" />
        </div>
      </div>

      {/* 4. Elegant Field Command Banner */}
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #075985 0%, #0369a1 50%, #0284c7 100%)',
          color: '#ffffff',
          padding: '22px 26px',
          overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.18)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Top Indian Tricolor Stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #FF671F 0%, #FFFFFF 50%, #138808 100%)',
          }}
        />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: '680px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(255, 255, 255, 0.2)', padding: '3px 10px', borderRadius: '10px', letterSpacing: '0.5px' }}>
              🇮🇳 {isMr ? 'बूथ कार्य संचालन कक्ष' : 'BOOTH FIELD COMMAND CENTER'}
            </span>
            <span style={{ fontSize: '12px', color: '#bae6fd' }}>
              • {profileData.assignedWard ? `${isMr ? 'प्रभाग' : 'Ward'} ${profileData.assignedWard}` : 'Sangli Central Ward'}
            </span>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff', lineHeight: 1.25 }}>
            {isMr ? 'सशक्त समाज • उज्ज्वल भविष्य • अविरत जनसेवा' : 'Stronger Communities • Brighter Tomorrow • Public Service'}
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#e0f2fe', lineHeight: 1.5 }}>
            {isMr
              ? 'प्रत्येक घरात पोहोचून नागरिकांच्या समस्यांचे निवारण करा, मतदारांशी थेट संवाद साधा आणि बूथवर पक्षाची बाजू भक्कम करा.'
              : 'Engage voters directly at their doorstep, log civic grievances with photos and GPS, and empower your grassroot booth network.'}
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveTab('Survey')}
            style={{
              background: 'linear-gradient(135deg, #FF671F 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: '750',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(234, 88, 12, 0.35)',
            }}
          >
            <ClipboardCheck size={16} />
            <span>{isMr ? 'सर्वेक्षण सुरू करा' : 'Start Survey'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Complaints')}
            style={{
              background: 'rgba(255, 255, 255, 0.18)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              color: '#ffffff',
              padding: '9px 16px',
              borderRadius: '8px',
              fontWeight: '750',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AlertCircle size={16} />
            <span>{isMr ? 'तक्रार नोंदवा' : 'Log Grievance'}</span>
          </button>
        </div>
      </div>

      {/* 5. Responsive Bottom Layout: Outreach Trends Chart & Recent Activity Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Left: Voter Outreach Trends Card */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span>📊</span>
                <span>{isMr ? 'मतदार संपर्क कल' : 'Voter Outreach Trends'}</span>
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {isMr ? 'मागील ६ महिन्यांमधील प्रत्यक्ष संपर्क प्रगती' : 'Direct contact progress over last 6 months'}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#0284c7' }} />
                <span style={{ color: '#0f172a' }}>{isMr ? 'संपर्क साधलेले' : 'Contacted'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: '#bae6fd' }} />
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
                    border: '1.5px solid #bae6fd',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.1)',
                    fontSize: '12.5px',
                    fontWeight: '700',
                  }}
                  cursor={{ fill: '#f0f9ff' }}
                />
                <Bar dataKey="value1" name={isMr ? 'संपर्क साधलेले' : 'Contacted'} fill="#0284c7" radius={[6, 6, 0, 0]} />
                <Bar dataKey="value2" name={isMr ? 'उद्दिष्ट' : 'Target'} fill="#bae6fd" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Recent Field Activities Stream */}
        <div
          style={{
            background: '#ffffff',
            border: '1.5px solid #e2e8f0',
            borderRadius: '16px',
            padding: '22px',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span>⚡</span>
                <span>{isMr ? 'थेट क्षेत्रीय घडामोडी' : 'Recent Field Activities'}</span>
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {isMr ? 'अधिकारी व बूथ स्तरावरील ताज्या नोंदी' : 'Live updates from assigned booths'}
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: '800', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '12px' }}>
              ● Live Feed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {activitiesToRender.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f0f9ff';
                  e.currentTarget.style.borderColor = '#bae6fd';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.borderColor = '#f1f5f9';
                }}
              >
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    backgroundColor: item.bgColor || item.bg_color || '#e0f2fe',
                    color: item.color || '#0284c7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {item.type === 'users' ? (
                    <Users size={17} />
                  ) : item.type === 'clock' ? (
                    <Clock size={17} />
                  ) : item.type === 'complaint' ? (
                    <AlertCircle size={17} />
                  ) : (
                    <ClipboardCheck size={17} />
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
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    {item.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
