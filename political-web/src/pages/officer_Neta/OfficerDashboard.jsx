import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AreaOverviewDashboard from './components/AreaOverviewDashboard';
import GeographyBoothProgress from './components/GeographyBoothProgress';
import KaryakartaPerformance from './components/KaryakartaPerformance';
import MeetingsAndTours from './components/MeetingsAndTours';
import PendingTasksManager from './components/PendingTasksManager';
import ImportantReports from './components/ImportantReports';
import FieldUpdatesFeed from './components/FieldUpdatesFeed';
import NotificationsAlerts from './components/NotificationsAlerts';
import DataExportCenter from './components/DataExportCenter';
import Citizen360CRM from './components/Citizen360CRM';
import AdminChatbotDesk from '../admin/AdminChatbotDesk';
import { netaApi } from './api/netaApi';
import BackButton from '../../components/BackButton';
import ErrorBoundary from '../../components/ErrorBoundary';

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [lang, setLang] = useState('mr'); // 'mr' (default) or 'en'
  const [overviewData, setOverviewData] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);

  const isMr = lang === 'mr';

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

  const loadHeaderStats = async () => {
    try {
      const [ovRes, notifRes] = await Promise.all([
        netaApi.getOverview(),
        netaApi.getNotifications({ filter: 'unread' }),
      ]);
      if (ovRes.success) {
        setOverviewData(ovRes.data);
      }
      if (notifRes.success) {
        setUnreadAlerts(notifRes.unread_count || 0);
      }
    } catch (err) {
      console.error('Error fetching header stats:', err);
    }
  };

  useEffect(() => {
    loadHeaderStats();
  }, [activeTab]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const totalBoothsCount = overviewData?.profile?.total_booths || 318;
  const activeWorkersCount = overviewData?.profile?.active_karyakartas_today || 184;
  const upcomingMeetingsCount = overviewData?.summary?.upcoming_meetings_count || 0;
  const pendingTasksCount = overviewData?.summary?.urgent_tasks_count || 0;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Clean Modern SaaS SVG Icons
  const Icons = {
    overview: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
    chatbot: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="10" rx="2" />
        <circle cx="12" cy="5" r="2" />
        <path d="M12 7v4" />
        <line x1="8" y1="16" x2="8.01" y2="16" />
        <line x1="16" y1="16" x2="16.01" y2="16" />
      </svg>
    ),
    geography_progress: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="16" y1="6" x2="16" y2="22" />
      </svg>
    ),
    workers_performance: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    crm_citizens: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
    meetings_tours: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" />
      </svg>
    ),
    pending_tasks: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    reports: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="2" y1="20" x2="22" y2="20" />
      </svg>
    ),
    field_updates: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
        <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
        <circle cx="12" cy="12" r="2" />
        <path d="M12 14v7" />
      </svg>
    ),
    notifications: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    data_export: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
      </svg>
    ),
    collapse: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="11 19 4 12 11 5" />
        <polyline points="18 19 11 12 18 5" />
      </svg>
    ),
    expand: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="13 19 20 12 13 5" />
        <polyline points="6 19 13 12 6 5" />
      </svg>
    ),
    search: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    admin: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    logout: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    shield: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  };

  const badgeConfig = {
    live: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
    blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    amber: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
    purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
    red: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
    indigo: { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
    teal: { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  };

  // The 9 Navigation Options organized into 3 logical operational categories
  const navSections = [
    {
      id: 'core_command',
      title_mr: 'मुख्य नियंत्रण',
      title_en: 'COMMAND & OVERVIEW',
      items: [
        {
          id: 'overview',
          label_mr: 'संपूर्ण क्षेत्राचा डॅशबोर्ड',
          label_en: 'Constituency Overview Dashboard',
          iconKey: 'overview',
          badge: isMr ? 'थेट डेटा' : 'Live DB',
          badgeTheme: 'live',
        },
        {
          id: 'ai_chatbot',
          label_mr: 'AI प्रचार व निवडणूक सहाय्यक',
          label_en: 'AI Campaign & Intelligence Desk',
          iconKey: 'chatbot',
          badge: isMr ? 'AI थेट' : 'AI Live',
          badgeTheme: 'live',
        },
        {
          id: 'geography_progress',
          label_mr: 'जिल्हा/विधानसभा/तालुका/गाव/बूथनिहाय प्रगती',
          label_en: 'Geography & Booth Progress',
          iconKey: 'geography_progress',
          badge: `${totalBoothsCount} ${isMr ? 'बूथ' : 'Booths'}`,
          badgeTheme: 'blue',
        },
      ],
    },
    {
      id: 'field_organization',
      title_mr: 'संघटना व नियोजन',
      title_en: 'ORGANIZATION & FIELD',
      items: [
        {
          id: 'workers_performance',
          label_mr: 'कार्यकर्त्यांचे काम व कामगिरी डॅशबोर्ड',
          label_en: 'Karyakarta Work & Performance',
          iconKey: 'workers_performance',
          badge: `${activeWorkersCount} ${isMr ? 'सक्रिय' : 'Active'}`,
          badgeTheme: 'amber',
        },
        {
          id: 'crm_citizens',
          label_mr: 'नागरिक CRM ३६०° (मतदार संपर्क)',
          label_en: 'Citizen CRM 360° Profile',
          iconKey: 'crm_citizens',
          badge: isMr ? 'CRM ३६०°' : 'CRM 360°',
          badgeTheme: 'teal',
        },
        {
          id: 'meetings_tours',
          label_mr: 'बैठका व दौरे',
          label_en: 'Meetings & Field Tours',
          iconKey: 'meetings_tours',
          badge: `${upcomingMeetingsCount} ${isMr ? 'आगामी' : 'Upcoming'}`,
          badgeTheme: 'purple',
        },
        {
          id: 'pending_tasks',
          label_mr: 'प्रलंबित कामे व पाठपुरावा',
          label_en: 'Pending Tasks & Follow-ups',
          iconKey: 'pending_tasks',
          badge: `${pendingTasksCount} ${isMr ? 'प्रलंबित' : 'Pending'}`,
          badgeTheme: 'red',
        },
      ],
    },
    {
      id: 'intelligence_reports',
      title_mr: 'गुप्तचर वार्ता व अहवाल',
      title_en: 'INTELLIGENCE & REPORTS',
      items: [
        {
          id: 'data_export',
          label_mr: 'डेटा बॅकअप व निर्यात',
          label_en: 'Data Backup & Export',
          iconKey: 'data_export',
          badge: isMr ? 'बॅकअप' : 'Backup',
          badgeTheme: 'teal',
        },
        {
          id: 'field_updates',
          label_mr: 'फील्ड घडामोडी व थेट माहिती',
          label_en: 'Field Updates & Ground Pulse',
          iconKey: 'field_updates',
          badge: isMr ? 'थेट वार्ता' : 'Live Pulse',
          badgeTheme: 'live',
        },
        {
          id: 'notifications',
          label_mr: 'सूचना व सतर्कता',
          label_en: 'Notifications & Alerts',
          iconKey: 'notifications',
          badge: unreadAlerts > 0 ? `${unreadAlerts} ${isMr ? 'नवीन' : 'New'}` : null,
          badgeTheme: 'red',
        },
      ],
    },
  ];

  const allItems = navSections.flatMap((s) => s.items);
  const currentNav = allItems.find((item) => item.id === activeTab) || allItems[0];

  // Search Filtering
  const filteredSections = navSections
    .map((sec) => {
      if (!searchQuery.trim()) return sec;
      const q = searchQuery.toLowerCase().trim();
      const matched = sec.items.filter(
        (i) =>
          i.label_mr.toLowerCase().includes(q) ||
          i.label_en.toLowerCase().includes(q) ||
          (i.badge && i.badge.toLowerCase().includes(q))
      );
      return { ...sec, items: matched };
    })
    .filter((sec) => sec.items.length > 0);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: isMr ? "'Noto Sans Devanagari', 'Mukta', 'Inter', sans-serif" : "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif",
        display: 'flex',
      }}
    >
      {/* SIMPLE & CLEAN LIGHT SAAS SIDEBAR */}
      <aside
        style={{
          width: isCollapsed ? '72px' : '268px',
          minWidth: isCollapsed ? '72px' : '268px',
          background: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '1px 0 3px rgba(0, 0, 0, 0.03)',
          color: '#1e293b',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          height: '100vh',
          boxSizing: 'border-box',
          padding: isCollapsed ? '16px 8px' : '18px 12px 14px 12px',
          zIndex: 50,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
          transition: 'width 0.2s ease, min-width 0.2s ease',
        }}
      >
        <div>
          {/* Brand Header Card — Indian Flag Theme */}
          <div
            style={{
              padding: isCollapsed ? '8px 4px' : '12px 12px 10px 12px',
              borderRadius: '10px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              marginBottom: '14px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: isCollapsed ? 'center' : 'stretch',
              gap: '8px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
            }}
          >
            {/* Top Indian Tricolor Stripe */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #FF671F 0%, #FFFFFF 50%, #138808 100%)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                {/* Official Indian Flag Emblem with Ashoka Chakra */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #0f2b5c 0%, #000080 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    border: '1px solid rgba(255, 103, 31, 0.4)',
                    boxShadow: '0 2px 8px rgba(0, 0, 128, 0.25)',
                  }}
                  title={isMr ? 'भारत • नेता व जनसेवक कक्ष' : 'India • Political Command HQ'}
                >
                  <svg width="22" height="15" viewBox="0 0 36 24" style={{ borderRadius: '2px', boxShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
                    <rect width="36" height="8" fill="#FF9933" />
                    <rect y="8" width="36" height="8" fill="#FFFFFF" />
                    <rect y="16" width="36" height="8" fill="#138808" />
                    <circle cx="18" cy="12" r="3.2" fill="none" stroke="#000080" strokeWidth="0.7" />
                    <circle cx="18" cy="12" r="0.7" fill="#000080" />
                    {Array.from({ length: 24 }).map((_, i) => (
                      <line
                        key={i}
                        x1="18"
                        y1="12"
                        x2={18 + 3.1 * Math.cos((i * 15 * Math.PI) / 180)}
                        y2={12 + 3.1 * Math.sin((i * 15 * Math.PI) / 180)}
                        stroke="#000080"
                        strokeWidth="0.35"
                      />
                    ))}
                  </svg>
                </div>

                {!isCollapsed && (
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: '#0f172a',
                        fontWeight: '800',
                        fontSize: '13px',
                        lineHeight: 1.2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isMr ? 'नेता व जनसेवक कक्ष' : 'Political Command HQ'}
                    </div>
                    <div
                      style={{
                        color: '#c2410c',
                        fontSize: '10.5px',
                        fontWeight: '700',
                        marginTop: '2px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {overviewData?.profile?.name_mr
                        ? `🇮🇳 ${overviewData.profile.name_mr}`
                        : (isMr ? '🇮🇳 भारत • महाराष्ट्र राज्य' : '🇮🇳 India • Maharashtra State')}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapse / Expand Toggle Button */}
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = '#2563eb';
                  e.currentTarget.style.borderColor = '#2563eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = '#64748b';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                title={isCollapsed ? (isMr ? 'विस्तृत करा' : 'Expand Sidebar') : (isMr ? 'संक्षिप्त करा' : 'Collapse Sidebar')}
              >
                {isCollapsed ? Icons.expand : Icons.collapse}
              </button>
            </div>

            {/* Live Database Sync Status Bar (When Expanded) */}
            {!isCollapsed && (
              <div
                style={{
                  paddingTop: '6px',
                  borderTop: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '11px',
                }}
              >
                <span
                  style={{
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontWeight: '600',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: '#10b981',
                    }}
                  />
                  {isMr ? 'थेट डेटाबेस जोडणी' : 'Live Sync'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>v2.5 SaaS</span>
              </div>
            )}
          </div>

          {/* Simple Light Search Bar */}
          {!isCollapsed && (
            <div
              style={{
                position: 'relative',
                marginBottom: '14px',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  left: '9px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {Icons.search}
              </span>
              <input
                type="text"
                placeholder={isMr ? 'पर्याय शोधा...' : 'Search modules...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '6px 26px 6px 28px',
                  color: '#0f172a',
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.background = '#f8fafc';
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '7px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Categorized Navigation Groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: isCollapsed ? '8px' : '14px' }}>
            {filteredSections.map((sec) => (
              <div key={sec.id}>
                {/* Category Header Label */}
                {!isCollapsed ? (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      color: '#94a3b8',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      padding: '0 6px',
                      marginBottom: '4px',
                    }}
                  >
                    {isMr ? sec.title_mr : sec.title_en}
                  </div>
                ) : (
                  <div
                    style={{
                      height: '1px',
                      background: '#f1f5f9',
                      margin: '4px 2px',
                    }}
                  />
                )}

                {/* Items under Category */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {sec.items.map((item) => {
                    const isSelected = activeTab === item.id;
                    const badgeTheme = badgeConfig[item.badgeTheme] || badgeConfig.blue;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        title={
                          isCollapsed
                            ? `${isMr ? item.label_mr : item.label_en}${item.badge ? ` (${item.badge})` : ''}`
                            : undefined
                        }
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isCollapsed ? 'center' : 'space-between',
                          width: '100%',
                          padding: isCollapsed ? '8px 0' : '7px 9px',
                          borderRadius: '8px',
                          border: isSelected
                            ? '1px solid #fed7aa'
                            : '1px solid transparent',
                          borderLeft: isSelected
                            ? '3.5px solid #FF671F'
                            : '3.5px solid transparent',
                          background: isSelected
                            ? 'linear-gradient(90deg, #fff7ed 0%, #ffffff 100%)'
                            : 'transparent',
                          color: isSelected ? '#c2410c' : '#475569',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          position: 'relative',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = '#f8fafc';
                            e.currentTarget.style.color = '#0f172a';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#475569';
                          }
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '9px',
                            minWidth: 0,
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                          }}
                        >
                          {/* SVG Icon Container */}
                          <span
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: isSelected
                                ? '#ffedd5'
                                : '#f8fafc',
                              color: isSelected ? '#ea580c' : '#64748b',
                              border: isSelected
                                ? '1px solid #fed7aa'
                                : '1px solid #e2e8f0',
                              flexShrink: 0,
                              position: 'relative',
                            }}
                          >
                            {Icons[item.iconKey] || Icons.overview}

                            {/* Collapsed Indicator Dot */}
                            {isCollapsed && item.badge && (
                              <span
                                style={{
                                  position: 'absolute',
                                  top: '-2px',
                                  right: '-2px',
                                  width: '7px',
                                  height: '7px',
                                  borderRadius: '3.5px',
                                  background: item.badgeTheme === 'red' ? '#ef4444' : '#3b82f6',
                                  border: '1px solid #ffffff',
                                }}
                              />
                            )}
                          </span>

                          {!isCollapsed && (
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '12.5px',
                                lineHeight: 1.3,
                              }}
                            >
                              {isMr ? item.label_mr : item.label_en}
                            </span>
                          )}
                        </div>

                        {/* Smooth SaaS Pill Badge (When Expanded) */}
                        {!isCollapsed && item.badge && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '600',
                              padding: '2px 6px',
                              borderRadius: '9999px',
                              background: isSelected ? '#dbeafe' : badgeTheme.bg,
                              color: isSelected ? '#1e40af' : badgeTheme.text,
                              border: `1px solid ${isSelected ? '#bfdbfe' : badgeTheme.border}`,
                              marginLeft: '6px',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>
        </div>

        {/* Executive SaaS Bottom Profile & Actions Card */}
        <div
          style={{
            marginTop: '14px',
            padding: isCollapsed ? '8px 4px' : '10px',
            borderRadius: '10px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCollapsed ? 'center' : 'stretch',
            gap: '8px',
          }}
        >
          {/* User Profile Info */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#dbeafe',
                color: '#1d4ed8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '700',
                fontSize: '13px',
                border: '1px solid #bfdbfe',
                position: 'relative',
                flexShrink: 0,
              }}
              title={user?.full_name || 'मा. जनसेवक / अधिकारी'}
            >
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'N'}
              <span
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: '#10b981',
                  border: '1.5px solid #ffffff',
                }}
              />
            </div>

            {!isCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#0f172a',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.full_name || (isMr ? 'मा. जनसेवक / अधिकारी' : 'Hon. Leader / Officer')}
                </div>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: '#64748b',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '1px',
                  }}
                >
                  {user?.roles?.join(', ') || 'OFFICER · NETA'}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions Row */}
          <div
            style={{
              display: 'flex',
              gap: '6px',
              flexDirection: isCollapsed ? 'column' : 'row',
              width: '100%',
            }}
          >
            {user?.roles?.includes('ADMIN') && (
              <button
                type="button"
                onClick={() => navigate('/admin')}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: isCollapsed ? '6px 0' : '5px 6px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = '#f1f5f9';
                  e.currentTarget.style.color = '#0f172a';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = '#ffffff';
                  e.currentTarget.style.color = '#334155';
                }}
                title={isMr ? 'ॲडमिन डॅशबोर्ड' : 'Admin Dashboard'}
              >
                {Icons.admin}
                {!isCollapsed && <span>{isMr ? 'ॲडमिन' : 'Admin'}</span>}
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              style={{
                flex: 1,
                background: '#ffffff',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: isCollapsed ? '6px 0' : '5px 6px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                transition: 'all 0.15s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = '#fef2f2';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = '#ffffff';
              }}
              title={isMr ? 'बाहेर पडा' : 'Logout'}
            >
              {Icons.logout}
              {!isCollapsed && <span>{isMr ? 'बाहेर पडा' : 'Logout'}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
        {/* Top Header Bar */}
        <header
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '14px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          }}
        >
          {/* Top Indian National Flag (Tiranga) 3-Stripe Ribbon */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3.5px',
              background: 'linear-gradient(90deg, #FF671F 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #046A38 100%)',
              zIndex: 10,
            }}
          />

          {/* Active Title & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <BackButton
              lang={lang}
              variant="default"
              fallbackPath="/admin"
              onBack={() => {
                if (activeTab !== 'overview') {
                  setActiveTab('overview');
                } else if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/admin');
                }
              }}
            />
            <div>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isMr ? 'महाराष्ट्र निवडणूक कक्ष' : 'Maharashtra Election Control Desk'}
              </div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                {isMr ? currentNav.label_mr : currentNav.label_en}
              </h2>
            </div>
          </div>

          {/* Right Header Utilities: Language Toggle, IST Clock & Notifications Bell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* National Indian Flag & IST Time Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '4px 9px',
              }}
            >
              <svg width="20" height="14" viewBox="0 0 36 24" style={{ borderRadius: '2px', boxShadow: '0 1px 2px rgba(0,0,0,0.2)', flexShrink: 0 }}>
                <rect width="36" height="8" fill="#FF9933" />
                <rect y="8" width="36" height="8" fill="#FFFFFF" />
                <rect y="16" width="36" height="8" fill="#138808" />
                <circle cx="18" cy="12" r="3.2" fill="none" stroke="#000080" strokeWidth="0.7" />
                <circle cx="18" cy="12" r="0.7" fill="#000080" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <line
                    key={i}
                    x1="18"
                    y1="12"
                    x2={18 + 3.1 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={12 + 3.1 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="#000080"
                    strokeWidth="0.35"
                  />
                ))}
              </svg>
              <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#1e293b' }}>
                {isMr ? 'भारत' : 'INDIA'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', fontFamily: 'monospace' }}>
                {istTimeFormatted.time}
              </span>
            </div>
            {/* Language Switcher Pill */}
            <div
              style={{
                display: 'flex',
                background: '#f1f5f9',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
              }}
            >
              <button
                onClick={() => setLang('mr')}
                style={{
                  border: 'none',
                  background: lang === 'mr' ? '#1e3a8a' : 'transparent',
                  color: lang === 'mr' ? '#ffffff' : '#475569',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                मराठी
              </button>
              <button
                onClick={() => setLang('en')}
                style={{
                  border: 'none',
                  background: lang === 'en' ? '#1e3a8a' : 'transparent',
                  color: lang === 'en' ? '#ffffff' : '#475569',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                English
              </button>
            </div>

            {/* Notification Bell Icon */}
            <button
              onClick={() => setActiveTab('notifications')}
              style={{
                position: 'relative',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                cursor: 'pointer',
              }}
              title="Notifications"
            >
              🔔
              {unreadAlerts > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '800',
                    width: '18px',
                    height: '18px',
                    borderRadius: '9px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadAlerts}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Main Body Content */}
        <main style={{ padding: '24px 28px', flex: 1 }}>
          <ErrorBoundary key={activeTab}>
            {activeTab === 'overview' && (
              <AreaOverviewDashboard onNavigate={setActiveTab} lang={lang} />
            )}

            {activeTab === 'geography_progress' && (
              <GeographyBoothProgress lang={lang} />
            )}

            {activeTab === 'workers_performance' && (
              <KaryakartaPerformance lang={lang} />
            )}

            {activeTab === 'crm_citizens' && (
              <Citizen360CRM lang={lang} />
            )}

            {activeTab === 'meetings_tours' && (
              <MeetingsAndTours lang={lang} />
            )}

            {activeTab === 'pending_tasks' && (
              <PendingTasksManager lang={lang} />
            )}


            {activeTab === 'field_updates' && (
              <FieldUpdatesFeed lang={lang} />
            )}

            {activeTab === 'notifications' && (
              <NotificationsAlerts lang={lang} />
            )}

            {activeTab === 'ai_chatbot' && (
              <AdminChatbotDesk lang={lang} onNavigateDesk={setActiveTab} />
            )}

            {activeTab === 'data_export' && (
              <DataExportCenter lang={lang} />
            )}
          </ErrorBoundary>
        </main>

        {/* Floating AI Political Campaign Assistant Launcher */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
          {showFloatingChat ? (
            <div
              style={{
                width: '440px',
                maxWidth: 'calc(100vw - 32px)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                borderRadius: '16px',
                overflow: 'hidden',
              }}
            >
              <AdminChatbotDesk
                lang={lang}
                isFloating={true}
                onClose={() => setShowFloatingChat(false)}
                onNavigateDesk={(deskId) => {
                  setActiveTab(deskId);
                  setShowFloatingChat(false);
                }}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowFloatingChat(true)}
              style={{
                background: 'linear-gradient(135deg, #c2410c 0%, #ea580c 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '50px',
                padding: '12px 20px',
                fontSize: '13.5px',
                fontWeight: '750',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 8px 20px rgba(234, 88, 12, 0.35)',
                transition: 'transform 0.15s ease',
              }}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              title={isMr ? 'AI प्रचार सहाय्यक उघडा' : 'Open AI Campaign Assistant'}
            >
              <span style={{ fontSize: '18px' }}>🤖</span>
              <span>{isMr ? 'AI प्रचार सहाय्यक' : 'AI Campaign Bot'}</span>
              <span style={{ background: '#22c55e', width: '8px', height: '8px', borderRadius: '50%' }} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
