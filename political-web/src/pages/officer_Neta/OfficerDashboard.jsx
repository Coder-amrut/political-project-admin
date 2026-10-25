import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import ErrorBoundary from '../../components/ErrorBoundary';

export default function OfficerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview');
  const [showFloatingChat, setShowFloatingChat] = useState(false);
  const [lang, setLang] = useState('mr'); // 'mr' (default) or 'en'
  const [overviewData, setOverviewData] = useState(null);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll Tracking & Animations
  const mainRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  // Officer Profile & Password Management State
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileTab, setProfileTab] = useState('details'); // 'details', 'change_pwd', 'forgot_pwd'

  // Change password fields
  const [pwdForm, setPwdForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [pwdSubmitting, setPwdSubmitting] = useState(false);
  const [pwdSuccessMsg, setPwdSuccessMsg] = useState('');
  const [pwdErrorMsg, setPwdErrorMsg] = useState('');

  // Forgot password OTP flow
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPwd, setForgotNewPwd] = useState('');
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');
  const [forgotErrorMsg, setForgotErrorMsg] = useState('');
  const [forgotMaskedPhone, setForgotMaskedPhone] = useState('');
  const [forgotUserId, setForgotUserId] = useState(null);
  const [forgotDevOtp, setForgotDevOtp] = useState('');

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwdSuccessMsg('');
    setPwdErrorMsg('');
    if (!pwdForm.old_password) {
      setPwdErrorMsg(isMr ? 'कृपया जुना पासवर्ड प्रविष्ट करा.' : 'Please enter old password.');
      return;
    }
    if (!pwdForm.new_password || pwdForm.new_password.length < 6) {
      setPwdErrorMsg(isMr ? 'नवीन पासवर्ड किमान ६ अक्षरांचा असावा.' : 'New password must be at least 6 characters.');
      return;
    }
    if (pwdForm.new_password !== pwdForm.confirm_password) {
      setPwdErrorMsg(isMr ? 'नवीन पासवर्ड आणि पुष्टी पासवर्ड जुळत नाहीत.' : 'New password and confirm password do not match.');
      return;
    }

    setPwdSubmitting(true);
    try {
      const res = await netaApi.changePassword({
        user_id: user?.id,
        old_password: pwdForm.old_password,
        new_password: pwdForm.new_password,
      });
      if (res.success) {
        setPwdSuccessMsg(res.message || (isMr ? '✓ पासवर्ड यशस्वीरीत्या बदलण्यात आला आहे!' : '✓ Password changed successfully!'));
        setPwdForm({ old_password: '', new_password: '', confirm_password: '' });
      }
    } catch (err) {
      const msg = err?.response?.data?.message || (isMr ? 'पासवर्ड बदलताना त्रुटी आली.' : 'Failed to change password.');
      setPwdErrorMsg(msg);
    } finally {
      setPwdSubmitting(false);
    }
  };

  const handleForgotRequestOtp = async (e) => {
    e.preventDefault();
    setForgotSuccessMsg('');
    setForgotErrorMsg('');
    if (!forgotEmail.trim()) {
      setForgotErrorMsg(isMr ? 'कृपया नोंदणीकृत ईमेल आयडी किंवा मोबाईल नंबर प्रविष्ट करा.' : 'Please enter registered email or phone.');
      return;
    }

    setForgotSubmitting(true);
    try {
      const res = await netaApi.requestForgotOtp(forgotEmail.trim());
      if (res.success) {
        setForgotMaskedPhone(res.masked_phone || '');
        setForgotUserId(res.user_id);
        setForgotDevOtp(res.dev_otp || '');
        setForgotStep(2);
        setForgotSuccessMsg(res.message);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || (isMr ? 'OTP पाठवताना त्रुटी आली.' : 'Failed to send OTP.');
      setForgotErrorMsg(msg);
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleForgotVerifyOtp = async (e) => {
    e.preventDefault();
    setForgotSuccessMsg('');
    setForgotErrorMsg('');
    if (!forgotOtp.trim()) {
      setForgotErrorMsg(isMr ? 'कृपया ६-अंकी OTP प्रविष्ट करा.' : 'Please enter 6-digit OTP.');
      return;
    }
    if (!forgotNewPwd || forgotNewPwd.length < 6) {
      setForgotErrorMsg(isMr ? 'नवीन पासवर्ड किमान ६ अक्षरांचा असावा.' : 'New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPwd !== forgotConfirmPwd) {
      setForgotErrorMsg(isMr ? 'नवीन पासवर्ड आणि पुष्टी पासवर्ड जुळत नाहीत.' : 'Passwords do not match.');
      return;
    }

    setForgotSubmitting(true);
    try {
      const res = await netaApi.verifyForgotOtp({
        user_id: forgotUserId,
        otp: forgotOtp.trim(),
        new_password: forgotNewPwd,
      });
      if (res.success) {
        setForgotSuccessMsg(res.message || (isMr ? '✓ पासवर्ड यशस्वीरीत्या सेट केला गेला आहे!' : '✓ Password reset successfully!'));
        setTimeout(() => {
          setForgotStep(1);
          setForgotEmail('');
          setForgotOtp('');
          setForgotNewPwd('');
          setForgotConfirmPwd('');
          setProfileTab('details');
        }, 2000);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || (isMr ? 'OTP पडताळणी अयशस्वी झाली.' : 'OTP verification failed.');
      setForgotErrorMsg(msg);
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleMainScroll = () => {
    if (!mainRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = mainRef.current;
    const maxScroll = scrollHeight - clientHeight;
    const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    setScrollProgress(progress);
    setShowScrollTop(scrollTop > 180);
    if (maxScroll > 50 && scrollTop + clientHeight >= scrollHeight - 35) {
      setIsAtBottom(true);
    } else {
      setIsAtBottom(false);
    }
  };

  const scrollToTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsAtBottom(false);
  }, [activeTab]);

  // Escape key and background scroll lock for floating AI assistant
  useEffect(() => {
    if (!showFloatingChat) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setShowFloatingChat(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    if (window.innerWidth <= 768) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [showFloatingChat]);

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
    try {
      await logout();
    } catch {
      // Ignore if session was not active
    }
    navigate('/', { replace: true });
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
    menu: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
    close: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
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
          short_label_mr: 'डॅशबोर्ड',
          short_label_en: 'Dashboard',
          iconKey: 'overview',
        },
        {
          id: 'ai_chatbot',
          label_mr: 'AI प्रचार व निवडणूक सहाय्यक',
          label_en: 'AI Campaign & Intelligence Desk',
          short_label_mr: 'AI सहाय्यक',
          short_label_en: 'AI Assistant',
          iconKey: 'chatbot',
        },
        {
          id: 'geography_progress',
          label_mr: 'जिल्हा/विधानसभा/तालुका/गाव/बूथनिहाय प्रगती',
          label_en: 'Geography & Booth Progress',
          short_label_mr: 'जिल्हा व बूथ प्रगती',
          short_label_en: 'Geography & Booths',
          iconKey: 'geography_progress',
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
          short_label_mr: 'कार्यकर्ते कामगिरी',
          short_label_en: 'Workers Performance',
          iconKey: 'workers_performance',
        },
        {
          id: 'crm_citizens',
          label_mr: 'नागरिक CRM ३६०° (मतदार संपर्क)',
          label_en: 'Citizen CRM 360° Profile',
          short_label_mr: 'नागरिक CRM',
          short_label_en: 'Citizens CRM',
          iconKey: 'crm_citizens',
        },
        {
          id: 'meetings_tours',
          label_mr: 'बैठका व दौरे',
          label_en: 'Meetings & Field Tours',
          short_label_mr: 'बैठका व दौरे',
          short_label_en: 'Meetings & Tours',
          iconKey: 'meetings_tours',
        },
        {
          id: 'pending_tasks',
          label_mr: 'प्रलंबित कामे व पाठपुरावा',
          label_en: 'Pending Tasks & Follow-ups',
          short_label_mr: 'प्रलंबित कामे',
          short_label_en: 'Pending Tasks',
          iconKey: 'pending_tasks',
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
          short_label_mr: 'डेटा एक्सपोर्ट',
          short_label_en: 'Data Export',
          iconKey: 'data_export',
        },
        {
          id: 'field_updates',
          label_mr: 'फील्ड घडामोडी व थेट माहिती',
          label_en: 'Field Updates & Ground Pulse',
          short_label_mr: 'फील्ड घडामोडी',
          short_label_en: 'Field Updates',
          iconKey: 'field_updates',
        },
        {
          id: 'notifications',
          label_mr: 'सूचना व सतर्कता',
          label_en: 'Notifications & Alerts',
          short_label_mr: 'सूचना व सतर्कता',
          short_label_en: 'Notifications',
          iconKey: 'notifications',
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
      className="neta-dashboard-layout"
      style={{
        height: '100vh',
        maxHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: isMr ? "'Noto Sans Devanagari', 'Mukta', 'Inter', sans-serif" : "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif",
        display: 'flex',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
    >
      <style>{`
        .neta-sidebar-search::placeholder {
          color: rgba(255, 255, 255, 0.75) !important;
        }

        /* Desktop Title Display (No Duplication) */
        .neta-title-desktop {
          display: inline !important;
        }
        .neta-title-mobile {
          display: none !important;
        }

        /* Separate Scrollbar Styling for Main Content with Smooth Scrolling */
        .neta-main-body {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
          scroll-behavior: smooth !important;
        }
        .neta-main-body::-webkit-scrollbar {
          width: 6px;
        }
        .neta-main-body::-webkit-scrollbar-track {
          background: transparent;
        }
        .neta-main-body::-webkit-scrollbar-thumb {
          background: rgba(37, 99, 235, 0.35);
          border-radius: 4px;
        }
        .neta-main-body::-webkit-scrollbar-thumb:hover {
          background: rgba(37, 99, 235, 0.65);
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulseSlow {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .neta-scroll-top-btn:hover {
          transform: translateY(-2px) scale(1.06);
          background: #2563eb !important;
          color: #ffffff !important;
          box-shadow: 0 6px 18px rgba(37, 99, 235, 0.4) !important;
        }

        /* Mobile Drawer & Responsive Layout */
        @media (max-width: 900px) {
          .neta-dashboard-layout {
            flex-direction: column !important;
            height: 100vh !important;
            overflow: hidden !important;
          }
          .neta-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            width: 295px !important;
            max-width: 88vw !important;
            z-index: 9999 !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1) !important;
            box-shadow: 6px 0 30px rgba(0, 0, 0, 0.45) !important;
            padding-bottom: calc(48px + env(safe-area-inset-bottom, 28px)) !important;
            overflow-y: auto !important;
            -webkit-overflow-scrolling: touch !important;
          }
          .neta-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .neta-backdrop {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            background: rgba(15, 23, 42, 0.6) !important;
            backdrop-filter: blur(4px) !important;
            z-index: 9998 !important;
            animation: fadeIn 0.2s ease !important;
          }
          .neta-hamburger-btn {
            display: inline-flex !important;
          }
          .neta-mobile-close-btn {
            display: inline-flex !important;
          }
          .neta-desktop-collapse-btn {
            display: none !important;
          }
          .neta-header {
            padding: 8px 12px !important;
            flex-wrap: nowrap !important;
            gap: 8px !important;
            flex-shrink: 0 !important;
          }
          .neta-header-title {
            font-size: 14.5px !important;
            line-height: 1.25 !important;
          }
          .neta-title-desktop {
            display: none !important;
          }
          .neta-title-mobile {
            display: -webkit-box !important;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 13.5px !important;
            line-height: 1.25 !important;
            font-weight: 750 !important;
          }
          .neta-header-sub {
            display: none !important;
          }
          .neta-time-badge {
            display: none !important;
          }
          .neta-main-body {
            padding: 12px 10px !important;
          }
        }

        @media (max-width: 480px) {
          .neta-header {
            padding: 8px 10px !important;
            gap: 8px !important;
          }
          .neta-hamburger-btn {
            width: 44px !important;
            height: 44px !important;
            min-width: 44px !important;
            min-height: 44px !important;
          }
          .neta-lang-btn {
            padding: 6px 10px !important;
            font-size: 12px !important;
            min-height: 44px !important;
            display: inline-flex !important;
            align-items: center !important;
          }
          .neta-bell-btn {
            width: 44px !important;
            height: 44px !important;
            min-width: 44px !important;
            min-height: 44px !important;
          }
        }

        @media (min-width: 901px) {
          .neta-backdrop {
            display: none !important;
          }
          .neta-hamburger-btn {
            display: none !important;
          }
          .neta-mobile-close-btn {
            display: none !important;
          }
          .neta-desktop-collapse-btn {
            display: inline-flex !important;
          }
          .neta-title-desktop {
            display: inline !important;
          }
          .neta-title-mobile {
            display: none !important;
          }
        }
      `}</style>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="neta-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ROYAL BLUE THEMED SAAS SIDEBAR */}
      <aside
        className={`neta-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}
        style={{
          width: isCollapsed ? '72px' : '268px',
          minWidth: isCollapsed ? '72px' : '268px',
          background: '#2f72d4',
          borderRight: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '2px 0 14px rgba(47, 114, 212, 0.25)',
          color: '#ffffff',
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
          scrollbarColor: 'rgba(255, 255, 255, 0.3) transparent',
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
            {/* Top Accent Stripe */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
              }}
            />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                {/* Official Brand Emblem */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    flexShrink: 0,
                    border: '1px solid rgba(59, 130, 246, 0.4)',
                    boxShadow: '0 2px 8px rgba(30, 58, 138, 0.25)',
                    fontSize: '18px',
                  }}
                  title={isMr ? 'नेता व जनसेवक कक्ष' : 'Political Command HQ'}
                >
                  🏛️
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
                        ? `🏛️ ${overviewData.profile.name_mr}`
                        : (isMr ? '🏛️ भारत • महाराष्ट्र राज्य' : '🏛️ India • Maharashtra State')}
                    </div>
                  </div>
                )}
              </div>

              {/* Collapse / Expand Toggle Button for Desktop */}
              <button
                type="button"
                className="neta-desktop-collapse-btn"
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

              {/* Close Button for Mobile Drawer */}
              <button
                type="button"
                className="neta-mobile-close-btn"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#1e3a8a',
                  display: 'none',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  padding: 0,
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                }}
                title={isMr ? 'मेनू बंद करा' : 'Close Menu'}
              >
                {Icons.close}
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

          {/* Search Bar on Blue Background */}
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
                  color: 'rgba(255, 255, 255, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {Icons.search}
              </span>
              <input
                type="text"
                className="neta-sidebar-search"
                placeholder={isMr ? 'पर्याय शोधा...' : 'Search modules...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  borderRadius: '6px',
                  padding: '6px 26px 6px 28px',
                  color: '#ffffff',
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.7)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.25)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.28)';
                  e.target.style.background = 'rgba(255, 255, 255, 0.18)';
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
                    color: 'rgba(255, 255, 255, 0.85)',
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
                      fontSize: '10.5px',
                      fontWeight: '700',
                      color: 'rgba(255, 255, 255, 0.72)',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      padding: '0 8px',
                      marginBottom: '5px',
                    }}
                  >
                    {isMr ? sec.title_mr : sec.title_en}
                  </div>
                ) : (
                  <div
                    style={{
                      height: '1px',
                      background: 'rgba(255, 255, 255, 0.2)',
                      margin: '4px 2px',
                    }}
                  />
                )}

                {/* Items under Category */}
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {sec.items.map((item) => {
                    const isSelected = activeTab === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        title={isCollapsed ? (isMr ? item.label_mr : item.label_en) : undefined}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isCollapsed ? 'center' : 'flex-start',
                          width: '100%',
                          padding: isCollapsed ? '8px 0' : '8px 10px',
                          borderRadius: '8px',
                          border: isSelected
                            ? '1px solid rgba(255, 255, 255, 0.35)'
                            : '1px solid transparent',
                          background: isSelected
                            ? 'rgba(0, 0, 0, 0.18)'
                            : 'transparent',
                          color: '#ffffff',
                          fontWeight: isSelected ? '700' : '500',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          textAlign: 'left',
                          position: 'relative',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseOver={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.14)';
                            e.currentTarget.style.color = '#ffffff';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isSelected) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.92)';
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
                                ? 'rgba(255, 255, 255, 0.22)'
                                : 'rgba(255, 255, 255, 0.12)',
                              color: isSelected ? '#fed7aa' : 'rgba(255, 255, 255, 0.92)',
                              border: isSelected
                                ? '1px solid rgba(255, 255, 255, 0.35)'
                                : '1px solid rgba(255, 255, 255, 0.18)',
                              flexShrink: 0,
                              position: 'relative',
                            }}
                          >
                            {Icons[item.iconKey] || Icons.overview}
                          </span>

                          {!isCollapsed && (
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontSize: '12.5px',
                                lineHeight: 1.3,
                                color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.92)',
                              }}
                            >
                              {isMr ? item.label_mr : item.label_en}
                            </span>
                          )}
                        </div>
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
            background: 'rgba(0, 0, 0, 0.16)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCollapsed ? 'center' : 'stretch',
            gap: '8px',
          }}
        >
          {/* User Profile Info - Clickable for Full Profile & Password Management Modal */}
          <div
            onClick={() => {
              setShowProfileModal(true);
              setProfileTab('details');
              setPwdSuccessMsg('');
              setPwdErrorMsg('');
              setForgotSuccessMsg('');
              setForgotErrorMsg('');
            }}
            role="button"
            tabIndex={0}
            title={isMr ? 'प्रोफाइल व पासवर्ड व्यवस्थापनासाठी क्लिक करा' : 'Click to view profile & password settings'}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.18)',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.35)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.18)';
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: '#ffffff',
                color: '#2f72d4',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '13px',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                position: 'relative',
                flexShrink: 0,
              }}
              title={user?.full_name || 'मा. मकरंद सर (Makrand Sir)'}
            >
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'M'}
              <span
                style={{
                  position: 'absolute',
                  bottom: '-1px',
                  right: '-1px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: '#10b981',
                  border: '1.5px solid #2f72d4',
                }}
              />
            </div>

            {!isCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{user?.full_name || (isMr ? 'मकरंद सर (Makrand Sir)' : 'Makrand Sir (Officer)')}</span>
                  <span style={{ fontSize: '10px', opacity: 0.85 }}>⚙️</span>
                </div>
                <div
                  style={{
                    fontSize: '10.5px',
                    color: 'rgba(255, 255, 255, 0.78)',
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

          {/* Quick Actions */}
          {isCollapsed ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                width: '100%',
              }}
            >
              {user?.roles?.includes('ADMIN') && (
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    border: '1px solid rgba(255, 255, 255, 0.28)',
                    color: '#ffffff',
                    padding: '6px 0',
                    borderRadius: '6px',
                    fontSize: '11px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title={isMr ? 'ॲडमिन डॅशबोर्ड' : 'Admin Dashboard'}
                >
                  {Icons.admin}
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  background: 'rgba(255, 255, 255, 0.18)',
                  border: '1px solid rgba(255, 255, 255, 0.28)',
                  color: '#ffffff',
                  padding: '6px 0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={isMr ? 'मुख्य पृष्ठ' : 'Home'}
              >
                <span style={{ fontSize: '13px' }}>🏠</span>
              </button>
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  padding: '6px 0',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={isMr ? 'बाहेर पडा' : 'Logout'}
              >
                {Icons.logout}
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                width: '100%',
              }}
            >
              {/* Secondary Navigation Row (Admin & Home) */}
              <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                {user?.roles?.includes('ADMIN') && (
                  <button
                    type="button"
                    onClick={() => navigate('/admin')}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.18)',
                      border: '1px solid rgba(255, 255, 255, 0.28)',
                      color: '#ffffff',
                      padding: '6px 8px',
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
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                    }}
                    title={isMr ? 'ॲडमिन डॅशबोर्ड' : 'Admin Dashboard'}
                  >
                    {Icons.admin}
                    <span>{isMr ? 'ॲडमिन' : 'Admin'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  style={{
                    flex: 1,
                    background: 'rgba(255, 255, 255, 0.18)',
                    border: '1px solid rgba(255, 255, 255, 0.28)',
                    color: '#ffffff',
                    padding: '6px 8px',
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
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.28)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
                  }}
                  title={isMr ? 'मुख्य पृष्ठ' : 'Home'}
                >
                  <span style={{ fontSize: '13px' }}>🏠</span>
                  <span>{isMr ? 'मुख्य पृष्ठ' : 'Home'}</span>
                </button>
              </div>

              {/* Full Width Prominent Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.35)',
                  color: '#ffffff',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 3px 10px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 5px 14px rgba(220, 38, 38, 0.55)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 3px 10px rgba(220, 38, 38, 0.4)';
                }}
                title={isMr ? 'बाहेर पडा' : 'Logout'}
              >
                {Icons.logout}
                <span>{isMr ? 'बाहेर पडा (Sign out)' : 'Sign out'}</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN VIEW AREA with Fixed Header & Independent Separate Scroll */}
      <div
        className="neta-main-wrapper"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100vh',
          maxHeight: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Header Bar (Stationary / Fixed at Top) */}
        <header
          className="neta-header"
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
            flexShrink: 0,
          }}
        >
          {/* Top National Ribbon */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3.5px',
              background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 50%, #0ea5e9 100%)',
              zIndex: 10,
            }}
          />

          {/* Active Title, Mobile Hamburger & Back Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
            {/* Hamburger Button for Mobile Drawer */}
            <button
              type="button"
              className="neta-hamburger-btn"
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#2f72d4',
                color: '#ffffff',
                border: 'none',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(47, 114, 212, 0.35)',
              }}
              title={isMr ? 'मेनू उघडा' : 'Open Menu'}
            >
              {Icons.menu}
            </button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="neta-header-sub" style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isMr ? 'महाराष्ट्र निवडणूक कक्ष' : 'Maharashtra Election Control Desk'}
              </div>
              <h2 className="neta-header-title" style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                <span className="neta-title-desktop">{isMr ? currentNav.label_mr : currentNav.label_en}</span>
                <span className="neta-title-mobile">{isMr ? (currentNav.short_label_mr || currentNav.label_mr) : (currentNav.short_label_en || currentNav.label_en)}</span>
              </h2>
            </div>
          </div>

          {/* Right Header Utilities: Language Toggle, IST Clock & Notifications Bell */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* National Indian Flag & IST Time Badge */}
            <div
              className="neta-time-badge"
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
              <span style={{ fontSize: '13px', lineHeight: 1 }}>🌐</span>
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
                type="button"
                className="neta-lang-btn"
                onClick={() => setLang('mr')}
                style={{
                  border: 'none',
                  background: lang === 'mr' ? '#1e3a8a' : 'transparent',
                  color: lang === 'mr' ? '#ffffff' : '#475569',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                मराठी
              </button>
              <button
                type="button"
                className="neta-lang-btn"
                onClick={() => setLang('en')}
                style={{
                  border: 'none',
                  background: lang === 'en' ? '#1e3a8a' : 'transparent',
                  color: lang === 'en' ? '#ffffff' : '#475569',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                English
              </button>
            </div>

            {/* Notification Bell Icon */}
            <button
              type="button"
              className="neta-bell-btn"
              onClick={() => setActiveTab('notifications')}
              title={isMr ? 'सूचना पहा' : 'View Notifications'}
              style={{
                position: 'relative',
                background: activeTab === 'notifications' ? '#eff6ff' : '#f8fafc',
                border: activeTab === 'notifications' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '7px 11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
              }}
            >
              <span>🔔</span>
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    background: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '1px 5px',
                    borderRadius: '999px',
                  }}
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Thin Animated Scroll Progress Bar */}
        <div
          style={{
            height: '3px',
            width: '100%',
            background: 'transparent',
            position: 'relative',
            zIndex: 45,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${scrollProgress}%`,
              background: 'linear-gradient(90deg, #2563eb 0%, #10b981 100%)',
              transition: 'width 0.12s ease-out',
              boxShadow: scrollProgress > 0 ? '0 0 8px rgba(37, 99, 235, 0.5)' : 'none',
            }}
          />
        </div>

        {/* Dynamic Main Body Content with Independent Separate Scroll */}
        <main
          ref={mainRef}
          onScroll={handleMainScroll}
          className="neta-main-body"
          style={{
            padding: '24px 28px',
            flex: 1,
            minWidth: 0,
            width: '100%',
            boxSizing: 'border-box',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}
        >
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

          {/* End of Page Animated Indicator Banner */}
          <div
            className="neta-scroll-end-banner"
            style={{
              marginTop: '42px',
              marginBottom: '26px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '18px 24px',
              borderRadius: '14px',
              background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.6) 0%, #e2e8f0 100%)',
              border: '1.5px dashed #cbd5e1',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              animation: 'fadeInUp 0.3s ease',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#334155', fontSize: '13.5px', fontWeight: '800' }}>
              <span style={{ fontSize: '20px', animation: 'bounceSlow 2s infinite', display: 'inline-block' }}>🏁</span>
              <span>
                {isMr
                  ? '✓ आपण पृष्ठाच्या अंतिम टोकापर्यंत स्क्रोल केले आहे'
                  : '✓ You have reached the end of this page'}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
              {isMr
                ? 'खालील बटणावर क्लिक करून त्वरित सुरुवातीस जाऊ शकता'
                : 'Click below to smoothly return to top'}
            </p>
            <button
              type="button"
              onClick={scrollToTop}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '24px',
                fontSize: '12.5px',
                fontWeight: '750',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
                transition: 'all 0.2s ease',
                marginTop: '4px',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 99, 235, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.35)';
              }}
            >
              <span style={{ fontSize: '14px' }}>🔝</span>
              <span>{isMr ? 'शीर्षावर जा (Back to Top)' : 'Back to Top'}</span>
            </button>
          </div>
        </main>

        {/* Floating Quick Back to Top FAB Button */}
        {showScrollTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="neta-scroll-top-btn"
            title={isMr ? 'वर स्क्रोल करा' : 'Scroll to top'}
            style={{
              position: 'fixed',
              bottom: '24px',
              right: activeTab !== 'ai_chatbot' ? '210px' : '24px',
              zIndex: 9990,
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#ffffff',
              border: '2px solid #2563eb',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.25)',
              transition: 'all 0.2s ease',
              animation: 'fadeInUp 0.25s ease',
            }}
          >
            ↑
          </button>
        )}

        {/* Floating AI Political Campaign Assistant Launcher (Hidden when full chatbot tab is active) */}
        {activeTab !== 'ai_chatbot' && (
          <>
            {showFloatingChat ? (
              <>
                {/* Backdrop overlay for focus and easy outside-click dismiss */}
                <div
                  className="neta-ai-modal-backdrop"
                  onClick={() => setShowFloatingChat(false)}
                  aria-hidden="true"
                />

                {/* AI Assistant Modal Window */}
                <div
                  className="neta-ai-modal-window"
                  role="dialog"
                  aria-modal="true"
                  aria-label={isMr ? 'AI प्रचार सहाय्यक' : 'AI Campaign Assistant'}
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
              </>
            ) : (
              <div className="neta-ai-fab-container">
                <button
                  type="button"
                  onClick={() => setShowFloatingChat(true)}
                  className="neta-ai-fab-btn"
                  title={isMr ? 'AI प्रचार सहाय्यक उघडा' : 'Open AI Campaign Assistant'}
                >
                  <span style={{ fontSize: '18px' }}>🤖</span>
                  <span>{isMr ? 'AI प्रचार सहाय्यक' : 'AI Campaign Bot'}</span>
                  <span style={{ background: '#22c55e', width: '8px', height: '8px', borderRadius: '50%', boxShadow: '0 0 6px #22c55e' }} />
                </button>
              </div>
            )}

            {/* Embedded styles for perfect phone & desktop responsiveness */}
            <style>{`
              .neta-ai-fab-container {
                position: fixed;
                bottom: 24px;
                right: 24px;
                z-index: 9990;
              }
              .neta-ai-fab-btn {
                background: linear-gradient(135deg, #c2410c 0%, #ea580c 100%);
                color: #ffffff;
                border: none;
                border-radius: 50px;
                padding: 12px 22px;
                font-size: 13.5px;
                font-weight: 750;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                box-shadow: 0 10px 25px -4px rgba(234, 88, 12, 0.45);
                transition: transform 0.18s ease, box-shadow 0.18s ease;
              }
              .neta-ai-fab-btn:hover {
                transform: translateY(-2px) scale(1.03);
                box-shadow: 0 14px 30px -4px rgba(234, 88, 12, 0.55);
              }
              .neta-ai-fab-btn:active {
                transform: scale(0.97);
              }

              .neta-ai-modal-backdrop {
                position: fixed;
                inset: 0;
                background: rgba(15, 23, 42, 0.65);
                backdrop-filter: blur(4px);
                -webkit-backdrop-filter: blur(4px);
                z-index: 99998;
                animation: netaBackdropFadeIn 0.2s ease-out;
              }

              .neta-ai-modal-window {
                position: fixed;
                bottom: 24px;
                right: 24px;
                width: 440px;
                max-width: calc(100vw - 32px);
                height: min(600px, 86vh);
                max-height: calc(100dvh - 32px);
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.1);
                z-index: 99999;
                display: flex;
                flex-direction: column;
                background: #ffffff;
                animation: netaWindowSlideDesktop 0.25s cubic-bezier(0.16, 1, 0.3, 1);
              }

              @media (max-width: 768px) {
                .neta-ai-fab-container {
                  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
                  right: 14px;
                }
                .neta-ai-fab-btn {
                  padding: 10px 16px;
                  font-size: 12.5px;
                }
                .neta-ai-modal-window {
                  bottom: 0;
                  left: 0;
                  right: 0;
                  width: 100%;
                  max-width: 100vw;
                  height: 90dvh;
                  max-height: 92dvh;
                  border-radius: 20px 20px 0 0;
                  box-shadow: 0 -12px 35px rgba(0, 0, 0, 0.35);
                  animation: netaWindowSlideMobile 0.28s cubic-bezier(0.16, 1, 0.3, 1);
                }
              }

              @keyframes netaBackdropFadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes netaWindowSlideDesktop {
                from { opacity: 0; transform: translateY(20px) scale(0.97); }
                to { opacity: 1; transform: translateY(0) scale(1); }
              }
              @keyframes netaWindowSlideMobile {
                from { transform: translateY(100%); }
                to { transform: translateY(0); }
              }
            `}</style>
          </>
        )}
        {/* Makrand Sir / Officer Profile & Password Management Modal */}
        {showProfileModal && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 10000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
            }}
            onClick={() => setShowProfileModal(false)}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '18px',
                maxWidth: 'min(520px, 96vw)',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxSizing: 'border-box',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
                position: 'relative',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Top Banner with Officer Branding */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                  padding: '22px 24px',
                  color: '#ffffff',
                  borderTopLeftRadius: '18px',
                  borderTopRightRadius: '18px',
                  position: 'relative',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowProfileModal(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: 'none',
                    color: '#ffffff',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    fontSize: '16px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  ✕
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '14px',
                      background: '#ffffff',
                      color: '#1e3a8a',
                      fontSize: '24px',
                      fontWeight: '800',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255, 255, 255, 0.8)',
                    }}
                  >
                    👔
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                      {user?.full_name || 'मा. मकरंद सर (Makrand Sir)'}
                    </h3>
                    <div style={{ fontSize: '12px', opacity: 0.9, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🏛️ {isMr ? 'पक्ष निरीक्षक व निवडणूक समन्वयक' : 'Party Officer & Coordinator'}</span>
                      <span style={{ background: '#10b981', color: '#ffffff', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', fontWeight: '800' }}>
                        🟢 ACTIVE
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs inside Profile Modal */}
              <div
                style={{
                  display: 'flex',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  padding: '0 12px',
                }}
              >
                {[
                  { key: 'details', label_mr: '👤 प्रोफाइल माहिती', label_en: '👤 Profile Details' },
                  { key: 'change_pwd', label_mr: '🔑 पासवर्ड बदला', label_en: '🔑 Change Password' },
                  { key: 'forgot_pwd', label_mr: '❓ पासवर्ड विसरलात?', label_en: '❓ Forgot Password' },
                ].map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      setProfileTab(t.key);
                      setPwdSuccessMsg('');
                      setPwdErrorMsg('');
                      setForgotSuccessMsg('');
                      setForgotErrorMsg('');
                    }}
                    style={{
                      flex: 1,
                      padding: '12px 6px',
                      border: 'none',
                      background: 'transparent',
                      borderBottom: profileTab === t.key ? '2.5px solid #2563eb' : '2.5px solid transparent',
                      color: profileTab === t.key ? '#1e3a8a' : '#64748b',
                      fontWeight: profileTab === t.key ? '800' : '600',
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isMr ? t.label_mr : t.label_en}
                  </button>
                ))}
              </div>

              <div style={{ padding: '22px 24px' }}>
                {/* TAB 1: Profile Details */}
                {profileTab === 'details' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {isMr ? 'पूर्ण नाव' : 'Full Name'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '750', marginTop: '3px' }}>
                          {user?.full_name || 'मकरंद सर (Makrand Sir)'}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {isMr ? 'मोबाईल नंबर' : 'Phone Number'}
                        </div>
                        <div style={{ fontSize: '14px', color: '#0f172a', fontWeight: '750', marginTop: '3px' }}>
                          {user?.phone || '९८२२० ११२२१'}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {isMr ? 'ईमेल आयडी' : 'Email Address'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#0f172a', fontWeight: '750', marginTop: '3px' }}>
                          {user?.email || 'makrand.officer@sangli.in'}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {isMr ? 'भूमिका व अधिकार' : 'Roles & Permissions'}
                        </div>
                        <div style={{ fontSize: '13px', color: '#1e3a8a', fontWeight: '800', marginTop: '3px' }}>
                          {user?.roles?.join(', ') || 'OFFICER · NETA · ADMIN'}
                        </div>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: '1 / -1' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                          {isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Constituency'}
                        </div>
                        <div style={{ fontSize: '13.5px', color: '#0f172a', fontWeight: '750', marginTop: '3px' }}>
                          📍 सांगली विधानसभा मतदारसंघ (२८२) • संपूर्ण सांगली जिल्हा
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: '8px', display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => setProfileTab('change_pwd')}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px 18px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        🔑 {isMr ? 'पासवर्ड बदला' : 'Change Password'}
                      </button>
                    </div>
                  </div>
                )}

                {/* TAB 2: Change Password */}
                {profileTab === 'change_pwd' && (
                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {pwdSuccessMsg && (
                      <div style={{ padding: '10px 14px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                        {pwdSuccessMsg}
                      </div>
                    )}
                    {pwdErrorMsg && (
                      <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                        ⚠️ {pwdErrorMsg}
                      </div>
                    )}

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        {isMr ? 'सध्याचा जुना पासवर्ड *' : 'Current Old Password *'}
                      </label>
                      <input
                        type="password"
                        required
                        value={pwdForm.old_password}
                        onChange={(e) => setPwdForm({ ...pwdForm, old_password: e.target.value })}
                        placeholder={isMr ? 'आपला जुना पासवर्ड प्रविष्ट करा' : 'Enter old password'}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        {isMr ? 'नवीन पासवर्ड *' : 'New Password *'}
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={pwdForm.new_password}
                        onChange={(e) => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                        placeholder={isMr ? 'किमान ६ अक्षरी नवीन पासवर्ड' : 'Min 6 characters'}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                        {isMr ? 'नवीन पासवर्ड पुष्टी *' : 'Confirm New Password *'}
                      </label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={pwdForm.confirm_password}
                        onChange={(e) => setPwdForm({ ...pwdForm, confirm_password: e.target.value })}
                        placeholder={isMr ? 'नवीन पासवर्ड पुन्हा प्रविष्ट करा' : 'Re-enter new password'}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setProfileTab('forgot_pwd')}
                        style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '12px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {isMr ? 'जुना पासवर्ड आठवत नाही? (Forgot Password)' : 'Forgot Password?'}
                      </button>

                      <button
                        type="submit"
                        disabled={pwdSubmitting}
                        style={{
                          background: '#1e3a8a',
                          color: '#ffffff',
                          border: 'none',
                          padding: '9px 20px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: pwdSubmitting ? 'wait' : 'pointer',
                        }}
                      >
                        {pwdSubmitting ? (isMr ? 'अद्ययावत करत आहे...' : 'Updating...') : (isMr ? '💾 पासवर्ड अद्ययावत करा' : 'Update Password')}
                      </button>
                    </div>
                  </form>
                )}

                {/* TAB 3: Forgot Password with OTP Flow */}
                {profileTab === 'forgot_pwd' && (
                  <div>
                    {forgotSuccessMsg && (
                      <div style={{ padding: '10px 14px', background: '#dcfce7', color: '#16a34a', borderRadius: '8px', fontSize: '13px', fontWeight: '700', marginBottom: '14px' }}>
                        {forgotSuccessMsg}
                      </div>
                    )}
                    {forgotErrorMsg && (
                      <div style={{ padding: '10px 14px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', fontWeight: '700', marginBottom: '14px' }}>
                        ⚠️ {forgotErrorMsg}
                      </div>
                    )}

                    {forgotStep === 1 ? (
                      <form onSubmit={handleForgotRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ background: '#eff6ff', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', color: '#1e40af', lineHeight: 1.5 }}>
                          ℹ️ {isMr
                            ? 'आपल्या खात्याचा पासवर्ड रीसेट करण्यासाठी नोंदणीकृत ईमेल आयडी किंवा फोन नंबर प्रविष्ट करा. त्यावर पडताळणी OTP पाठवला जाईल.'
                            : 'Enter registered email ID or phone to receive a verification OTP on your mobile.'}
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                            {isMr ? 'नोंदणीकृत ईमेल आयडी किंवा मोबाईल *' : 'Registered Email or Mobile *'}
                          </label>
                          <input
                            type="text"
                            required
                            value={forgotEmail}
                            onChange={(e) => setForgotEmail(e.target.value)}
                            placeholder={user?.email || 'उदा. makrand.officer@sangli.in'}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                          <button
                            type="submit"
                            disabled={forgotSubmitting}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              border: 'none',
                              padding: '10px 22px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: forgotSubmitting ? 'wait' : 'pointer',
                            }}
                          >
                            {forgotSubmitting ? (isMr ? 'OTP पाठवत आहे...' : 'Sending OTP...') : (isMr ? '📲 मोबाईलवर OTP पाठवा' : 'Send OTP')}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleForgotVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ background: '#ecfdf5', padding: '12px 14px', borderRadius: '10px', fontSize: '12px', color: '#065f46', lineHeight: 1.5 }}>
                          📱 {isMr
                            ? `आपल्या नोंदणीकृत मोबाईल ${forgotMaskedPhone || ''} वर ६-अंकी OTP पाठवण्यात आला आहे.`
                            : `6-digit OTP sent to registered mobile ${forgotMaskedPhone || ''}.`}
                          {forgotDevOtp && (
                            <span style={{ display: 'block', marginTop: '4px', fontWeight: '800', color: '#166534' }}>
                              (पडताळणी चाचणी OTP: {forgotDevOtp})
                            </span>
                          )}
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                            {isMr ? '६-अंकी OTP प्रविष्ट करा *' : 'Enter 6-Digit OTP *'}
                          </label>
                          <input
                            type="text"
                            required
                            maxLength={6}
                            value={forgotOtp}
                            onChange={(e) => setForgotOtp(e.target.value)}
                            placeholder="123456"
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', letterSpacing: '2px', fontWeight: '800' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                            {isMr ? 'नवीन पासवर्ड *' : 'New Password *'}
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={forgotNewPwd}
                            onChange={(e) => setForgotNewPwd(e.target.value)}
                            placeholder={isMr ? 'किमान ६ अक्षरी नवीन पासवर्ड' : 'Min 6 characters'}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                            {isMr ? 'नवीन पासवर्ड पुष्टी *' : 'Confirm New Password *'}
                          </label>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={forgotConfirmPwd}
                            onChange={(e) => setForgotConfirmPwd(e.target.value)}
                            placeholder={isMr ? 'नवीन पासवर्ड पुन्हा प्रविष्ट करा' : 'Re-enter new password'}
                            style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                          />
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => setForgotStep(1)}
                            style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '12px', cursor: 'pointer' }}
                          >
                            ← {isMr ? 'ईमेल बदला' : 'Change Email'}
                          </button>

                          <button
                            type="submit"
                            disabled={forgotSubmitting}
                            style={{
                              background: '#16a34a',
                              color: '#ffffff',
                              border: 'none',
                              padding: '10px 22px',
                              borderRadius: '8px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: forgotSubmitting ? 'wait' : 'pointer',
                            }}
                          >
                            {forgotSubmitting ? (isMr ? 'पासवर्ड सेट करत आहे...' : 'Resetting...') : (isMr ? '✓ नवीन पासवर्ड सेट करा' : 'Set New Password')}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
