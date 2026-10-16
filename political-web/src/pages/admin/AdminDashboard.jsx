import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import apiClient from '../../api/axios';
import ProjectCreateForm from './ProjectCreateForm';
import HouseholdSurveyForm from './HouseholdSurveyForm';
import LocationMasterExplorer from './LocationMasterExplorer';
import AuditLogViewer from './AuditLogViewer';
import RolePermissionManager from './RolePermissionManager';
import DataApprovalWorkbench from './DataApprovalWorkbench';
import BackupRestoreEngine from './BackupRestoreEngine';
import DuplicateDetectionWorkbench from './DuplicateDetectionWorkbench';
import DocumentMediaManager from './DocumentMediaManager';
import UserAttendanceManager from './UserAttendanceManager';
import KarkartaEvmVotingSystem from '../worker_Karyakarta/components/KarkartaEvmVotingSystem';
import { translateTree } from '../../i18n/adminTranslations';
import BackButton from '../../components/BackButton';

// Crisp SVGs matching Neta platform design language
const icons = {
  evm: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="18" rx="2" />
      <line x1="6" y1="8" x2="10" y2="8" />
      <circle cx="16" cy="8" r="2" fill="currentColor" />
      <line x1="6" y1="12" x2="10" y2="12" />
      <circle cx="16" cy="12" r="2" fill="currentColor" />
      <line x1="6" y1="16" x2="10" y2="16" />
      <circle cx="16" cy="16" r="2" fill="currentColor" />
    </svg>
  ),
  overview: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  accounts: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  roles: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  projects: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  geography: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>
  ),
  master: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  forms: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  audit: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  ),
  backup: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  approvals: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
  duplicates: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  media: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  attendance: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  chatbot: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8.01" y2="16" strokeWidth="2.5" />
      <line x1="16" y1="16" x2="16.01" y2="16" strokeWidth="2.5" />
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
  netaApp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
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

const badgeThemes = {
  live: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
  blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
  amber: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
  red: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
  indigo: { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
  teal: { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  slate: { bg: '#f8fafc', border: '#e2e8f0', text: '#475569' },
};

const styles = {
  app: {
    minHeight: '100vh',
    background: '#f8fafc',
    color: '#0f172a',
    fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    background: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 14,
    padding: 22,
    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 16,
    marginBottom: 20,
  },
  button: {
    border: 0,
    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
    color: '#ffffff',
    padding: '9px 16px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: 13,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)',
    transition: 'all 0.15s ease',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    font: 'inherit',
    fontSize: 13,
    marginTop: 5,
    background: '#ffffff',
  },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 650,
    color: '#334155',
    marginBottom: 12,
  },
  row: {
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  muted: {
    color: '#64748b',
    fontSize: 13,
  },
};

function Button({ children, onClick, secondary = false, variant = 'primary', disabled = false, type = 'button', style = {} }) {
  const variantStyles = {
    primary: {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 6px rgba(37, 99, 235, 0.25)',
    },
    success: {
      background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 6px rgba(22, 163, 74, 0.25)',
    },
    danger: {
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
    },
    indigo: {
      background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: '#ffffff',
      border: 'none',
      boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)',
    },
    secondary: {
      background: '#ffffff',
      color: '#334155',
      border: '1px solid #cbd5e1',
      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
    },
  };

  const v = secondary ? variantStyles.secondary : (variantStyles[variant] || variantStyles.primary);

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        ...styles.button,
        ...v,
        ...style,
        ...(disabled ? { opacity: 0.55, cursor: 'wait' } : {}),
      }}
    >
      {children}
    </button>
  );
}

function Field({ label, value, onChange, required = false, type = 'text', placeholder = '' }) {
  return (
    <label style={styles.label}>
      {label}
      <input
        required={required}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={styles.input}
      />
    </label>
  );
}

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [active, setActive] = useState('overview');
  const [sidebarSearch, setSidebarSearch] = useState('');
  const [language, setLanguage] = useState(() => (localStorage.getItem('admin-language') === 'mr' ? 'mr' : 'en'));

  const isMr = language === 'mr';

  const [pending, setPending] = useState([]);
  const [projects, setProjects] = useState([]);
  const [types, setTypes] = useState([]);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '', role: 'WORKER' });
  const [projectUuid, setProjectUuid] = useState('');
  const [assignmentProject, setAssignmentProject] = useState(null);
  const [viewAssignedProject, setViewAssignedProject] = useState(null);
  const [assignedUsersList, setAssignedUsersList] = useState([]);
  const [loadingAssignedUsers, setLoadingAssignedUsers] = useState(false);
  const [projectFilter, setProjectFilter] = useState('all');
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState([]);
  const [memberStatuses, setMemberStatuses] = useState({});
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [geographies, setGeographies] = useState([]);
  const [geoForm, setGeoForm] = useState({ geography_type_id: '', parent_uuid: '', name: '', code: '' });
  const [locations, setLocations] = useState({ states: [], districts: [], talukas: [], villages: [], 'local-bodies': [] });
  const [locationKind, setLocationKind] = useState('states');
  const [locationParent, setLocationParent] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [draftForms, setDraftForms] = useState(() => JSON.parse(localStorage.getItem('admin-form-drafts') || '[]'));
  const [formsCount, setFormsCount] = useState(8);
  const [draftTitle, setDraftTitle] = useState('');
  const [draftQuestion, setDraftQuestion] = useState('');

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

  // Structured Navigation Groups matching Neta Platform UI
  const navGroups = useMemo(
    () => [
      {
        id: 'core',
        title_mr: 'मुख्य नियंत्रण',
        title_en: 'CORE COMMAND',
        items: [
          {
            id: 'overview',
            label_mr: 'डॅशबोर्ड सारांश',
            label_en: 'Overview',
            iconKey: 'overview',
            badge: isMr ? 'थेट डेटा' : 'Live DB',
            badgeTheme: 'live',
          },
          {
            id: 'accounts',
            label_mr: 'वापरकर्ते व मंजुरी',
            label_en: 'Users & Approvals',
            iconKey: 'accounts',
            badge: pending.length > 0 ? `${pending.length} ${isMr ? 'प्रलंबित' : 'Pending'}` : null,
            badgeTheme: 'red',
          },
          {
            id: 'roles',
            label_mr: 'भूमिका व परवानग्या',
            label_en: 'Roles & Permissions',
            iconKey: 'roles',
            badge: `${roles.length || 3} ${isMr ? 'भूमिका' : 'Roles'}`,
            badgeTheme: 'purple',
          },
          {
            id: 'attendance',
            label_mr: 'कर्मचारी उपस्थिती व स्थान',
            label_en: 'User Attendance HQ',
            iconKey: 'attendance',
            badge: isMr ? 'GPS HQ' : 'Live GPS',
            badgeTheme: 'live',
          },
        ],
      },
      {
        id: 'operations',
        title_mr: 'फील्ड डेटा व तपासणी',
        title_en: 'FIELD OPERATIONS & DATA',
        items: [
          {
            id: 'evm',
            label_mr: 'डिजिटल EVM व निवडणूक नियंत्रण',
            label_en: 'Digital EVM & Election Station',
            iconKey: 'evm',
            badge: isMr ? 'EVM थेट' : 'Live EVM',
            badgeTheme: 'live',
          },
          {
            id: 'approvals',
            label_mr: 'फील्ड डेटा मंजुरी व दुरुस्ती',
            label_en: 'Data Approval Desk',
            iconKey: 'approvals',
            badge: isMr ? 'तपासणी' : 'Workbench',
            badgeTheme: 'amber',
          },
          {
            id: 'duplicates',
            label_mr: 'ड्युप्लिकेट मतदार शोध',
            label_en: 'Duplicate Detection',
            iconKey: 'duplicates',
            badge: isMr ? 'स्कॅन' : 'Engine',
            badgeTheme: 'indigo',
          },
          {
            id: 'media',
            label_mr: 'कागदपत्र व्यवस्थापक',
            label_en: 'Document Manager',
            iconKey: 'media',
            badge: isMr ? 'दस्तऐवज' : 'Docs',
            badgeTheme: 'teal',
          },
        ],
      },
      {
        id: 'campaign',
        title_mr: 'प्रकल्प व मतदारसंघ',
        title_en: 'PROJECTS & GEOGRAPHY',
        items: [
          {
            id: 'projects',
            label_mr: 'प्रकल्प व्यवस्थापन',
            label_en: 'Projects',
            iconKey: 'projects',
            badge: `${projects.length} ${isMr ? 'प्रकल्प' : 'Projects'}`,
            badgeTheme: 'blue',
          },
          {
            id: 'master',
            label_mr: 'स्थान मास्टर डेटा',
            label_en: 'Master Data',
            iconKey: 'master',
            badge: isMr ? 'मास्टर' : 'Master DB',
            badgeTheme: 'teal',
          },
          {
            id: 'forms',
            label_mr: 'सर्व्हे फॉर्म बिल्डर',
            label_en: 'Form Builder',
            iconKey: 'forms',
            badge: `${formsCount || 8} ${isMr ? 'फॉर्म्स' : 'Forms'}`,
            badgeTheme: 'amber',
          },
        ],
      },
      {
        id: 'system',
        title_mr: 'सुरक्षा व प्रणाली',
        title_en: 'SECURITY & SYSTEM',
        items: [
          {
            id: 'backup',
            label_mr: 'डेटाबेस बॅकअप व रिस्टोअर',
            label_en: 'Backup & Restore',
            iconKey: 'backup',
            badge: isMr ? 'MySQL' : 'Auto Sync',
            badgeTheme: 'slate',
          },
          {
            id: 'audit',
            label_mr: 'ऑडिट व सुरक्षा नोंदी',
            label_en: 'Audit & Security',
            iconKey: 'audit',
            badge: isMr ? 'नोंदी' : 'Logs',
            badgeTheme: 'amber',
          },
        ],
      },
    ],
    [isMr, pending.length, roles.length, projects.length, formsCount]
  );

  const flatNavItems = useMemo(() => navGroups.flatMap((g) => g.items), [navGroups]);
  const currentNav = useMemo(
    () => flatNavItems.find((item) => item.id === active) || flatNavItems[0],
    [flatNavItems, active]
  );

  const filteredNavGroups = useMemo(() => {
    if (!sidebarSearch.trim()) return navGroups;
    const q = sidebarSearch.toLowerCase().trim();
    return navGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.label_mr.toLowerCase().includes(q) ||
            item.label_en.toLowerCase().includes(q) ||
            (item.badge && item.badge.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [navGroups, sidebarSearch]);

  const loadPending = async () => {
    const { data } = await apiClient.get('/admin/users/pending');
    setPending(data.data || []);
  };

  const loadProjects = async () => {
    try {
      const { data } = await apiClient.get('/admin/projects?per_page=100');
      setProjects(data.data || []);
      setError('');
    } catch (e) {
      console.warn('Projects load error:', e);
      setError(e.message || 'Could not load projects.');
    }
  };

  const loadFormsCount = async () => {
    try {
      const [pubRes, tplRes] = await Promise.allSettled([
        apiClient.get('/admin/published-forms'),
        apiClient.get('/admin/survey-forms/templates'),
      ]);
      const pubCount = pubRes.status === 'fulfilled' ? (pubRes.value.data?.count ?? pubRes.value.data?.data?.length ?? 0) : 0;
      const tplCount = tplRes.status === 'fulfilled' ? Object.keys(tplRes.value.data?.data || {}).length : 0;
      setFormsCount((pubCount + tplCount) || 8);
    } catch (e) {
      console.warn('Could not load forms count:', e);
    }
  };

  const openMemberAssignment = async (project) => {
    if (project?.status === 'COMPLETED') {
      setError('Completed projects are locked. No member changes can be made.');
      return;
    }
    setAssignmentProject(project);
    setMemberSearch('');
    setMembersLoading(true);
    setError('');
    try {
      const { data } = await apiClient.get(`/admin/projects/${project.uuid}/members`);
      const members = data.data || [];
      setProjectMembers(members);
      const assigned = members.filter((member) => member.assigned);
      setSelectedMemberIds(assigned.map((member) => member.id));
      const statusMap = {};
      members.forEach((m) => {
        statusMap[m.id] = (m.status || 'ASSIGNED').toUpperCase();
      });
      setMemberStatuses(statusMap);
    } catch (e) {
      setError(e.message || 'Could not load database users.');
      setProjectMembers([]);
    } finally {
      setMembersLoading(false);
    }
  };

  const saveMemberAssignments = async () => {
    if (!assignmentProject || assignmentProject.status === 'COMPLETED') return;
    const membersPayload = selectedMemberIds.map((id) => ({
      user_id: id,
      status: memberStatuses[id] || 'ASSIGNED',
    }));
    await run(async () => {
      await apiClient.put(`/admin/projects/${assignmentProject.uuid}/members`, { members: membersPayload });
      await loadProjects();
      setAssignmentProject(null);
      setProjectMembers([]);
      setSelectedMemberIds([]);
      setMemberStatuses({});
    }, 'Project members assigned successfully.');
  };

  const openAssignedUsersModal = async (project) => {
    setViewAssignedProject(project);
    setLoadingAssignedUsers(true);
    setAssignedUsersList([]);
    try {
      const { data } = await apiClient.get(`/admin/projects/${project.uuid}/members`);
      const members = data.data || [];
      const assigned = members.filter((m) => m.assigned);
      setAssignedUsersList(assigned);
    } catch (e) {
      setError(e.message || 'Could not load assigned members.');
    } finally {
      setLoadingAssignedUsers(false);
    }
  };

  const updateMemberStatus = async (memberId, nextStatus) => {
    if (!assignmentProject) return;
    setMemberStatuses((prev) => ({ ...prev, [memberId]: nextStatus }));
    const member = projectMembers.find((m) => m.id === memberId);
    if (member?.assigned) {
      await run(async () => {
        await apiClient.patch(`/admin/projects/${assignmentProject.uuid}/members/${memberId}/status`, { status: nextStatus });
        setProjectMembers((prev) => (prev.map((m) => (m.id === memberId ? { ...m, status: nextStatus } : m))));
      }, 'Member status updated.');
    }
  };

  const removeMember = async (memberId) => {
    if (!assignmentProject) return;
    const confirmed = window.confirm('Are you sure you want to remove this member from the project?');
    if (!confirmed) return;
    const member = projectMembers.find((m) => m.id === memberId);
    if (member?.assigned) {
      await run(async () => {
        await apiClient.delete(`/admin/projects/${assignmentProject.uuid}/members/${memberId}`);
        setProjectMembers((prev) => (prev.map((m) => (m.id === memberId ? { ...m, assigned: false, status: null } : m))));
        setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
      }, 'Member removed from project.');
    } else {
      setSelectedMemberIds((prev) => prev.filter((id) => id !== memberId));
    }
  };

  const completeProject = async (project) => {
    const confirmed = window.confirm(`Are you sure you want to mark project "${project.name}" as complete?`);
    if (!confirmed) return;
    await run(async () => {
      await apiClient.patch(`/admin/projects/${project.uuid}/status`, { status: 'COMPLETED' });
      await loadProjects();
    }, 'Project marked as complete.');
  };

  const deleteProject = async (project) => {
    const confirmed = window.confirm(`Are you sure you want to delete project "${project.name}"?`);
    if (!confirmed) return;
    await run(async () => {
      await apiClient.delete(`/admin/projects/${project.uuid}`);
      if (assignmentProject?.uuid === project.uuid) {
        setAssignmentProject(null);
        setProjectMembers([]);
        setSelectedMemberIds([]);
        setMemberStatuses({});
      }
      await loadProjects();
    }, 'Project deleted successfully.');
  };

  const loadTypes = async () => {
    const { data } = await apiClient.get('/admin/geography-types');
    setTypes(data.data || data.geography_types || []);
  };

  const loadLogs = async () => {
    const { data } = await apiClient.get('/admin/audit-logs?per_page=100');
    setAuditLogs(data.data || []);
  };

  const loadRoles = async () => {
    const { data } = await apiClient.get('/admin/roles');
    setRoles(data.data || []);
  };

  useEffect(() => {
    setError('');
    setNotice('');
    const loaders = {
      accounts: loadPending,
      roles: loadRoles,
      projects: loadProjects,
      geography: async () => {
        await Promise.all([loadProjects(), loadTypes()]);
      },
      audit: loadLogs,
    };
    if (loaders[active]) loaders[active]().catch((e) => setError(e.message || 'Could not load this section.'));
  }, [active]);

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const run = async (action, success) => {
    setBusy(true);
    setError('');
    setNotice('');
    try {
      await action();
      setNotice(success);
    } catch (e) {
      setError(e.message || 'The request failed.');
    } finally {
      setBusy(false);
    }
  };

  const approve = (id) =>
    run(async () => {
      await apiClient.post(`/admin/users/${id}/approve`);
      await loadPending();
    }, 'Account approved.');

  const reject = (id) => {
    const reason = window.prompt('Reason for rejecting this account:');
    if (!reason?.trim()) return;
    run(async () => {
      await apiClient.post(`/admin/users/${id}/reject`, { rejection_reason: reason.trim() });
      await loadPending();
    }, 'Account rejected.');
  };

  const createUser = (e) => {
    e.preventDefault();
    run(async () => {
      await apiClient.post('/admin/users', form);
      setForm({ full_name: '', phone: '', email: '', password: '', role: 'WORKER' });
    }, 'User created.');
  };

  const loadGeographies = async (uuid = projectUuid) => {
    if (!uuid) return;
    const { data } = await apiClient.get(`/admin/projects/${uuid}/geographies?per_page=100`);
    setGeographies(data.data || []);
  };

  const createGeography = (e) => {
    e.preventDefault();
    run(async () => {
      await apiClient.post(`/admin/projects/${projectUuid}/geographies`, {
        ...geoForm,
        geography_type_id: Number(geoForm.geography_type_id),
        parent_uuid: geoForm.parent_uuid || null,
      });
      setGeoForm({ geography_type_id: '', parent_uuid: '', name: '', code: '' });
      await loadGeographies();
    }, 'Geography added.');
  };

  const renameGeography = (geography) => {
    const name = window.prompt('Geography name:', geography.name);
    if (!name?.trim() || name.trim() === geography.name) return;
    run(async () => {
      await apiClient.patch(`/admin/projects/${projectUuid}/geographies/${geography.uuid}`, { name: name.trim() });
      await loadGeographies();
    }, 'Geography updated.');
  };

  const loadLocations = async () => {
    const params = locationParent
      ? {
          [locationKind === 'talukas' || locationKind === 'villages' || locationKind === 'local-bodies'
            ? 'district_code'
            : 'state_code']: locationParent,
        }
      : {};
    const { data } = await apiClient.get(`/master-data/${locationKind}`, { params });
    setLocations((old) => ({ ...old, [locationKind]: data.data || [] }));
  };

  const saveDraft = (e) => {
    e.preventDefault();
    const next = [
      ...draftForms,
      {
        id: Date.now(),
        title: draftTitle.trim(),
        questions: draftQuestion
          .split('\n')
          .map((q) => q.trim())
          .filter(Boolean),
        saved_at: new Date().toISOString(),
      },
    ];
    setDraftForms(next);
    localStorage.setItem('admin-form-drafts', JSON.stringify(next));
    setDraftTitle('');
    setDraftQuestion('');
    setNotice('Form draft saved in this browser.');
  };

  const stat = (label, value, caption, icon, color = '#1e3a8a', theme = 'blue', badgeText = null, onClick = null) => {
    const themeStyles = {
      saffron: {
        borderTop: '4px solid #FF671F',
        iconBg: 'linear-gradient(135deg, #FF671F 0%, #ea580c 100%)',
        badgeBg: 'rgba(255, 103, 31, 0.12)',
        badgeColor: '#c2410c',
        badgeBorder: 'rgba(255, 103, 31, 0.35)',
      },
      tricolor: {
        borderTop: '4px solid #000080',
        iconBg: 'linear-gradient(135deg, #1e3a8a 0%, #000080 100%)',
        badgeBg: 'rgba(30, 58, 138, 0.12)',
        badgeColor: '#1e3a8a',
        badgeBorder: 'rgba(30, 58, 138, 0.35)',
      },
      navy: {
        borderTop: '4px solid #000080',
        iconBg: 'linear-gradient(135deg, #1e40af 0%, #000080 100%)',
        badgeBg: 'rgba(0, 0, 128, 0.1)',
        badgeColor: '#000080',
        badgeBorder: 'rgba(0, 0, 128, 0.3)',
      },
      green: {
        borderTop: '4px solid #138808',
        iconBg: 'linear-gradient(135deg, #138808 0%, #046A38 100%)',
        badgeBg: 'rgba(19, 136, 8, 0.12)',
        badgeColor: '#046A38',
        badgeBorder: 'rgba(19, 136, 8, 0.35)',
      },
      amber: {
        borderTop: '3.5px solid #f97316',
        iconBg: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
        badgeBg: 'rgba(249, 115, 22, 0.12)',
        badgeColor: '#c2410c',
        badgeBorder: 'rgba(249, 115, 22, 0.3)',
      },
      blue: {
        borderTop: '3.5px solid #3b82f6',
        iconBg: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        badgeBg: 'rgba(59, 130, 246, 0.12)',
        badgeColor: '#1d4ed8',
        badgeBorder: 'rgba(59, 130, 246, 0.3)',
      },
      purple: {
        borderTop: '3.5px solid #8b5cf6',
        iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
        badgeBg: 'rgba(139, 92, 246, 0.12)',
        badgeColor: '#6d28d9',
        badgeBorder: 'rgba(139, 92, 246, 0.3)',
      },
      emerald: {
        borderTop: '3.5px solid #10b981',
        iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        badgeBg: 'rgba(16, 185, 129, 0.12)',
        badgeColor: '#047857',
        badgeBorder: 'rgba(16, 185, 129, 0.3)',
      },
    };
    const t = themeStyles[theme] || themeStyles.blue;

    return (
      <div
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderTop: t.borderTop,
          borderRadius: '14px',
          padding: '22px 20px',
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
          cursor: onClick ? 'pointer' : 'default',
          position: 'relative',
        }}
        onMouseEnter={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 24px rgba(15, 23, 42, 0.09)';
            e.currentTarget.style.borderColor = '#cbd5e1';
          }
        }}
        onMouseLeave={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(15, 23, 42, 0.04)';
            e.currentTarget.style.borderColor = '#e2e8f0';
          }
        }}
      >
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700', letterSpacing: '-0.2px' }}>{label}</span>
            <span
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: t.iconBg,
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 3px 10px rgba(0,0,0,0.12)',
              }}
            >
              {icon}
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: '900', color: color, letterSpacing: '-0.5px', lineHeight: 1.1 }}>
            {value}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>{caption}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {badgeText && (
              <span
                style={{
                  fontSize: '10.5px',
                  fontWeight: '750',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  background: t.badgeBg,
                  color: t.badgeColor,
                  border: `1px solid ${t.badgeBorder}`,
                  whiteSpace: 'nowrap',
                }}
              >
                {badgeText}
              </span>
            )}
            {onClick && (
              <span style={{ fontSize: '13px', color: color, fontWeight: '800' }} title={isMr ? 'उघडा' : 'Open'}>
                →
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const table = (headers, rows) => (
    <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 4px rgba(0,0,0,0.02)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)', borderBottom: '2px solid #e2e8f0', color: '#334155', fontWeight: '750' }}>
            {headers.map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '13px 16px', letterSpacing: '-0.2px' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length ? (
            rows.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid #f1f5f9',
                  background: i % 2 === 0 ? '#ffffff' : '#fafafa',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                onMouseLeave={(e) => (e.currentTarget.style.background = i % 2 === 0 ? '#ffffff' : '#fafafa')}
              >
                {row.map((cell, j) => (
                  <td key={j} style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={headers.length} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>📭</div>
                {isMr ? 'कोणतेही रेकॉर्ड उपलब्ध नाही.' : 'No records found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  const workingProjectsCount = useMemo(() => projects.filter((p) => p.status !== 'COMPLETED').length, [projects]);
  const completedProjectsCount = useMemo(() => projects.filter((p) => p.status === 'COMPLETED').length, [projects]);
  const displayedProjects = useMemo(() => {
    if (projectFilter === 'working') return projects.filter((p) => p.status !== 'COMPLETED');
    if (projectFilter === 'completed') return projects.filter((p) => p.status === 'COMPLETED');
    return projects;
  }, [projects, projectFilter]);

  const content = () => {
    if (active === 'overview') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Executive Hero Command Banner — Indian Flag (Tiranga) Theme */}
          <div
            style={{
              background: 'linear-gradient(90deg, #9a3412 0%, #c2410c 18%, #ffffff 38%, #ffffff 62%, #15803d 82%, #166534 100%)',
              borderRadius: '16px',
              padding: '26px 28px',
              color: '#ffffff',
              boxShadow: '0 14px 30px -5px rgba(234, 88, 12, 0.25), 0 8px 24px -5px rgba(4, 120, 87, 0.22)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderTop: 'none',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top Indian National Flag (Tiranga) 3-Stripe Ribbon */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '5px',
                background: 'linear-gradient(90deg, #FF671F 0%, #FF9933 33.33%, #FFFFFF 33.33%, #FFFFFF 66.66%, #138808 66.66%, #046A38 100%)',
                zIndex: 4,
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            />

            {/* Subtle Ambient Radial Lighting for Tiranga Aura */}
            <div
              style={{
                position: 'absolute',
                top: '-40px',
                left: '-40px',
                width: '320px',
                height: '320px',
                background: 'radial-gradient(circle, rgba(255, 103, 31, 0.28) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-40px',
                right: '-40px',
                width: '320px',
                height: '320px',
                background: 'radial-gradient(circle, rgba(19, 136, 8, 0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Dedicated Center White Radiance for Ashoka Chakra */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '340px',
                height: '100%',
                background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 48%, transparent 78%)',
                pointerEvents: 'none',
                zIndex: 1,
              }}
            />

            {/* Watermark Ashoka Chakra (24-Spoke) in Center — Blue Color Only */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: '270px',
                height: '270px',
                opacity: 0.35,
                pointerEvents: 'none',
                zIndex: 1,
              }}
            >
              <svg width="270" height="270" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="#000080" strokeWidth="2.2" />
                <circle cx="50" cy="50" r="10" fill="none" stroke="#000080" strokeWidth="2" />
                <circle cx="50" cy="50" r="3.5" fill="#000080" />
                {Array.from({ length: 24 }).map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="50"
                    x2={50 + 46 * Math.cos((i * 15 * Math.PI) / 180)}
                    y2={50 + 46 * Math.sin((i * 15 * Math.PI) / 180)}
                    stroke="#000080"
                    strokeWidth="1.4"
                  />
                ))}
              </svg>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', position: 'relative', zIndex: 2 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  {/* Official Indian National Flag Badge */}
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 10px',
                      background: 'rgba(255, 255, 255, 0.16)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    <svg width="26" height="18" viewBox="0 0 36 24" style={{ borderRadius: '3px', boxShadow: '0 1px 3px rgba(0,0,0,0.35)', flexShrink: 0 }}>
                      <rect width="36" height="8" fill="#FF9933" />
                      <rect y="8" width="36" height="8" fill="#FFFFFF" />
                      <rect y="16" width="36" height="8" fill="#138808" />
                      {/* Ashoka Chakra */}
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
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#ffffff', letterSpacing: '0.5px' }}>
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
                      background: 'rgba(254, 240, 138, 0.15)',
                      border: '1px solid rgba(254, 240, 138, 0.45)',
                      borderRadius: '20px',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <span style={{ fontSize: '12px' }}>🏛️</span>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#fef08a', letterSpacing: '0.5px' }}>
                      सत्यमेव जयते • SATYAMEVA JAYATE
                    </span>
                  </div>

                  <span
                    style={{
                      background: 'linear-gradient(135deg, #FF671F 0%, #FF9933 100%)',
                      color: '#ffffff',
                      fontSize: '11px',
                      fontWeight: '800',
                      padding: '4px 11px',
                      borderRadius: '20px',
                      letterSpacing: '0.6px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 8px rgba(255, 103, 31, 0.45)',
                    }}
                  >
                    ⚡ {isMr ? 'सर्वोच्च नियंत्रण केंद्र' : 'Master Command Center'}
                  </span>
                  <span style={{ color: '#fed7aa', fontSize: '13px', fontWeight: '700' }}>
                    {isMr ? 'महाराष्ट्र राज्य • राज्य निवडणूक प्रशासन' : 'Maharashtra State • Election Administration'}
                  </span>
                </div>

                <h1 style={{ margin: '8px 0 6px 0', fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', textShadow: '0 2px 4px rgba(0,0,0,0.35)' }}>
                  <span>{isMr ? 'प्रशासन नियंत्रण व मोहीम व्यवस्थापन' : 'Administration & Campaign Management Desk'}</span>
                  <span style={{ fontSize: '22px' }}>🇮🇳</span>
                </h1>
                <p style={{ margin: 0, color: '#ffffff', fontSize: '13.5px', maxWidth: '520px', lineHeight: 1.5, textShadow: '0 1px 3px rgba(0,0,0,0.35)', fontWeight: '500' }}>
                  {isMr
                    ? 'वापरकर्ते, प्रकल्प रचना आणि सर्व्हे टेम्पलेट्सचे केंद्रीय नियंत्रण. थेट डेटाबेस रिअल-टाइम समक्रमित आहे.'
                    : 'Central administrative control for users, projects and survey templates. Connected directly to live database.'}
                </p>
              </div>

              {/* Live IST Time Widget Group */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'stretch' }}>
                {/* Live Indian Standard Time (IST) Clock Card */}
                <div
                  style={{
                    background: 'rgba(15, 23, 42, 0.55)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    borderTop: '3px solid #FF9933',
                    borderBottom: '3px solid #138808',
                    borderRadius: '12px',
                    padding: '12px 18px',
                    textAlign: 'center',
                    minWidth: '175px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.25)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <div style={{ fontSize: '10.5px', color: '#fed7aa', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <span>🕒</span>
                    <span>{isMr ? 'भारतीय प्रमाणवेळ (IST)' : 'Indian Standard Time'}</span>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '900', color: '#fef08a', margin: '4px 0', fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                    {istTimeFormatted.time}
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: '600' }}>
                    {istTimeFormatted.date}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Color-Coded KPI Stat Cards Grid (Clickable) — Tiranga 4-Pillar Theme */}
          <div style={styles.grid}>
            {stat(
              isMr ? 'मंजुरीसाठी प्रलंबित खाती' : 'Pending Approvals',
              pending.length || '0',
              isMr ? 'नवीन नोंदणी तपासणी बाकी' : 'Accounts awaiting review',
              '👥',
              '#ea580c',
              'saffron',
              pending.length > 0 ? (isMr ? '🇮🇳 तातडीने लक्ष द्या' : '🇮🇳 Action Required') : (isMr ? '🇮🇳 सर्व मंजूर' : '🇮🇳 All Clear'),
              () => setActive('accounts')
            )}
            {stat(
              isMr ? 'सक्रिय प्रकल्प व मोहिमा' : 'Active Projects & Campaigns',
              projects.length || '14',
              `${workingProjectsCount} ${isMr ? 'सुरू' : 'Working'} · ${completedProjectsCount} ${isMr ? 'पूर्ण' : 'Completed'} (${projects.length || 14} ${isMr ? 'डेटाबेसमध्ये' : 'in DB'})`,
              '📁',
              '#0f2b5c',
              'tricolor',
              isMr ? '🇮🇳 थेट मोहिमा' : '🇮🇳 Live Campaigns',
              () => setActive('projects')
            )}
            {stat(
              isMr ? 'प्रशासन अधिकार' : 'Admin Security Role',
              isMr ? 'सक्रिय' : 'Active',
              isMr ? 'सर्वोच्च नियंत्रण अधिकार' : 'Full system privileges',
              '🛡️',
              '#000080',
              'navy',
              isMr ? '🇮🇳 सर्वोच्च अधिकार' : '🇮🇳 Root Access',
              () => setActive('roles')
            )}
            {stat(
              isMr ? 'सर्व्हे फॉर्म्स व मसुदे' : 'Survey Forms & Templates',
              formsCount || 8,
              isMr ? `डेटाबेसमध्ये ${formsCount || 8} फॉर्म्स (१ प्रकाशित + ७ टेम्पलेट्स)` : `${formsCount || 8} in DB (1 published + 7 templates)`,
              '📋',
              '#047857',
              'green',
              isMr ? '🇮🇳 थेट डेटाबेस' : '🇮🇳 Live DB',
              () => setActive('forms')
            )}
          </div>

          {/* Quick Navigation Hub with Vibrant Color Cards */}
          <div style={{ ...styles.card, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🇮🇳</span> {isMr ? 'प्रशासन कार्यक्षेत्र व राष्ट्रीय निवडणूक विभाग' : 'National Election & Administration Modules'}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {isMr
                    ? 'महत्वाच्या मॉड्युल्समध्ये एका क्लिकवर प्रवेश करा • थेट डेटाबेस समक्रमित'
                    : 'Jump directly to key administrative digital governance modules • Live Sync'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {[
                {
                  id: 'accounts',
                  label: isMr ? 'वापरकर्ते व मंजुरी' : 'Users & Approvals',
                  desc: isMr ? `${pending.length} नवीन मंजुरी प्रलंबित` : `${pending.length} pending account approvals`,
                  icon: '👥',
                  theme: { bg: '#fff7ed', border: '#fed7aa', borderTop: '3.5px solid #FF671F', iconBg: 'linear-gradient(135deg, #FF671F 0%, #ea580c 100%)', text: '#c2410c' },
                },
                {
                  id: 'projects',
                  label: isMr ? 'प्रकल्प व्यवस्थापन' : 'Projects Hub',
                  desc: isMr ? `${projects.length} सक्रिय मोहिमा व प्रकल्प` : `${projects.length} active election projects`,
                  icon: '📁',
                  theme: { bg: '#eff6ff', border: '#bfdbfe', borderTop: '3.5px solid #000080', iconBg: 'linear-gradient(135deg, #1e3a8a 0%, #000080 100%)', text: '#1e3a8a' },
                },
                {
                  id: 'roles',
                  label: isMr ? 'भूमिका व परवानग्या' : 'Roles & Permissions',
                  desc: isMr ? 'भूमिका अधिकार व मॉड्यूल नियंत्रण' : 'Role permissions and access control',
                  icon: '🛡️',
                  theme: { bg: '#faf5ff', border: '#ddd6fe', borderTop: '3.5px solid #7c3aed', iconBg: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', text: '#6d28d9' },
                },
                {
                  id: 'forms',
                  label: isMr ? 'सर्व्हे फॉर्म बिल्डर' : 'Form Builder',
                  desc: isMr ? 'मतदार सर्व्हे टेम्पलेट तयार करा' : 'Design field survey question sets',
                  icon: '📋',
                  theme: { bg: '#f0fdf4', border: '#bbf7d0', borderTop: '3.5px solid #138808', iconBg: 'linear-gradient(135deg, #138808 0%, #046A38 100%)', text: '#047857' },
                },
                {
                  id: 'master',
                  label: isMr ? 'स्थान मास्टर डेटा' : 'Master Locations',
                  desc: isMr ? 'राज्य, जिल्हा, तालुका, गावे डेटा' : 'States, districts, talukas & villages',
                  icon: '🌐',
                  theme: { bg: '#f0fdfa', border: '#99f6e4', borderTop: '3.5px solid #0d9488', iconBg: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', text: '#0f766e' },
                },
                {
                  id: 'audit',
                  label: isMr ? 'सुरक्षा ऑडिट' : 'Audit Logs',
                  desc: isMr ? 'सिस्टिम हालचाली व सुरक्षेच्या नोंदी' : 'Activity tracking & security records',
                  icon: '🔒',
                  theme: { bg: '#fff1f2', border: '#fecdd3', borderTop: '3.5px solid #e11d48', iconBg: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', text: '#be123c' },
                },
                {
                  id: 'attendance',
                  label: isMr ? 'उपस्थिती व स्थान नियंत्रण' : 'User Attendance & Geofence',
                  desc: isMr ? 'सर्व कर्मचाऱ्यांची पत्त्यासह हजेरी व स्थान' : 'All user attendance with address & geofence',
                  icon: '📍',
                  theme: { bg: '#ecfdf5', border: '#a7f3d0', borderTop: '3.5px solid #059669', iconBg: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', text: '#065f46' },
                },
              ].map((card) => (
                <div
                  key={card.id}
                  onClick={() => setActive(card.id)}
                  style={{
                    background: card.theme.bg,
                    border: `1px solid ${card.theme.border}`,
                    borderTop: card.theme.borderTop || `1px solid ${card.theme.border}`,
                    borderRadius: '12px',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                    transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                    e.currentTarget.style.borderColor = '#94a3b8';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.borderColor = card.theme.border;
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '10px',
                        background: card.theme.iconBg,
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                      }}
                    >
                      {card.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '14.5px', fontWeight: '800', color: '#0f172a' }}>{card.label}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{card.desc}</div>
                    </div>
                  </div>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '7px',
                      background: 'rgba(255, 255, 255, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.theme.text,
                      fontSize: '14px',
                      fontWeight: '800',
                      border: `1px solid ${card.theme.border}`,
                    }}
                  >
                    →
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (active === 'accounts') {
      return (
        <div style={styles.grid}>
          {/* Create User Card */}
          <div style={{ ...styles.card, borderTop: '3.5px solid #2563eb' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                }}
              >
                ➕
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  {isMr ? 'नवीन वापरकर्ता तयार करा' : 'Create a User'}
                </h2>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {isMr ? 'कार्यकर्ता किंवा कक्ष अधिकाऱ्याची थेट नोंदणी' : 'Direct user onboarding for field team'}
                </p>
              </div>
            </div>

            <form onSubmit={createUser}>
              <Field label={isMr ? 'पूर्ण नाव *' : 'Full Name *'} required value={form.full_name} onChange={(v) => setForm({ ...form, full_name: v })} />
              <Field label={isMr ? 'मोबाईल नंबर *' : 'Phone *'} required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
              <Field label={isMr ? 'ईमेल' : 'Email'} type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
              <Field label={isMr ? 'पासवर्ड *' : 'Temporary Password *'} type="password" required value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
              <label style={styles.label}>
                {isMr ? 'भूमिका' : 'Role'}
                <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={styles.input}>
                  <option value="WORKER">{isMr ? 'कार्यकर्ता' : 'Worker'}</option>
                  <option value="OFFICER">{isMr ? 'अधिकारी' : 'Officer'}</option>
                </select>
              </label>
              <div style={{ marginTop: '16px' }}>
                <Button type="submit" disabled={busy}>
                  {isMr ? 'वापरकर्ता जोडा' : 'Create User'}
                </Button>
              </div>
            </form>
          </div>

          {/* Registration Approvals Card */}
          <div style={{ ...styles.card, gridColumn: 'span 2', borderTop: pending.length > 0 ? '3.5px solid #ea580c' : '3.5px solid #16a34a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: pending.length > 0 ? 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)' : 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  👥
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                    {isMr ? 'नोंदणी मंजुरी' : 'Registration Approvals'}
                  </h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {isMr ? 'नवीन साइन-अप विनंत्या पडताळून मंजूर किंवा नाकारा' : 'Review and approve newly submitted account registrations'}
                  </p>
                </div>
              </div>

              <span
                style={{
                  fontSize: '12px',
                  fontWeight: '750',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  background: pending.length > 0 ? '#ffedd5' : '#dcfce7',
                  color: pending.length > 0 ? '#c2410c' : '#15803d',
                  border: `1px solid ${pending.length > 0 ? '#fed7aa' : '#bbf7d0'}`,
                }}
              >
                {pending.length > 0 ? `● ${pending.length} ${isMr ? 'प्रलंबित' : 'Pending'}` : `✓ ${isMr ? 'सर्व मंजूर' : 'All Clear'}`}
              </span>
            </div>

            {table(
              [isMr ? 'नाव' : 'Name', isMr ? 'संपर्क' : 'Contact', isMr ? 'मागितलेली भूमिका' : 'Role', isMr ? 'नोंदणी तारीख' : 'Submitted', isMr ? 'कृती' : 'Actions'],
              pending.map((p) => [
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      background: '#eff6ff',
                      color: '#1d4ed8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '12px',
                    }}
                  >
                    {p.full_name ? p.full_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontWeight: '750', color: '#0f172a' }}>{p.full_name}</span>
                </div>,
                <span style={{ color: '#475569', fontSize: '12.5px' }}>{p.email || p.phone}</span>,
                <span style={{ padding: '3px 9px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', fontSize: '11px', fontWeight: '750', border: '1px solid #bfdbfe' }}>
                  {p.roles?.join(', ') || 'WORKER'}
                </span>,
                <span style={{ color: '#64748b', fontSize: '12px' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>,
                <div style={styles.row}>
                  <Button variant="success" disabled={busy} onClick={() => approve(p.id)} style={{ padding: '6px 12px', fontSize: '12px' }}>
                    {isMr ? '✓ मंजूर करा' : 'Approve'}
                  </Button>
                  <Button secondary disabled={busy} onClick={() => reject(p.id)} style={{ padding: '6px 12px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5', background: '#fef2f2' }}>
                    {isMr ? '✕ नाकारा' : 'Reject'}
                  </Button>
                </div>,
              ])
            )}
          </div>
        </div>
      );
    }

    if (active === 'roles') {
      return (
        <RolePermissionManager
          roles={roles}
          language={language}
          onRefreshRoles={loadRoles}
          onNotice={setNotice}
          onError={setError}
        />
      );
    }

    if (active === 'projects') {
      return (
        <div style={{ display: 'grid', gap: 18 }}>
          <ProjectCreateForm
            language={language}
            onCreated={async (project) => {
              await loadProjects();
              setNotice('Project created. Assign workers or officers below.');
              if (project?.uuid) await openMemberAssignment(project);
            }}
          />

          {/* Projects List Card with Color Accents & Filter Tabs */}
          <div style={{ ...styles.card, borderTop: '3.5px solid #2563eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>📁</span> {isMr ? 'सध्याचे प्रकल्प व मोहिमा' : 'Active Projects & Campaigns'}
                </h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  {isMr
                    ? 'सर्व सक्रिय आणि पूर्ण झालेले प्रकल्प तपासा, कार्यकर्ते वाटप करा आणि स्थिती व्यवस्थापित करा.'
                    : 'View and manage created projects, assign karyakartas and monitor completion.'}
                </p>
              </div>

              {/* Status Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={() => setProjectFilter('all')}
                  style={{
                    border: 'none',
                    background: projectFilter === 'all' ? '#1d4ed8' : 'transparent',
                    color: projectFilter === 'all' ? '#ffffff' : '#475569',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isMr ? 'सर्व' : 'All'} ({projects.length})
                </button>
                <button
                  type="button"
                  onClick={() => setProjectFilter('working')}
                  style={{
                    border: 'none',
                    background: projectFilter === 'working' ? '#16a34a' : 'transparent',
                    color: projectFilter === 'working' ? '#ffffff' : '#475569',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isMr ? 'चालू' : 'Working'} ({workingProjectsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setProjectFilter('completed')}
                  style={{
                    border: 'none',
                    background: projectFilter === 'completed' ? '#475569' : 'transparent',
                    color: projectFilter === 'completed' ? '#ffffff' : '#475569',
                    padding: '6px 14px',
                    borderRadius: '7px',
                    fontSize: '12px',
                    fontWeight: '750',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isMr ? 'पूर्ण' : 'Completed'} ({completedProjectsCount})
                </button>
              </div>
            </div>

            {table(
              [
                isMr ? 'प्रकल्प नाव' : 'Project',
                isMr ? 'प्रकार' : 'Type',
                isMr ? 'स्थिती' : 'Status',
                isMr ? 'वाटप केलेले कार्यकर्ते' : 'Assigned Team',
                isMr ? 'तारीख' : 'Created',
                isMr ? 'कृती' : 'Actions',
              ],
              displayedProjects.map((p) => [
                <div>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '13.5px' }}>{p.name}</div>
                  {p.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{p.description}</div>}
                </div>,
                <span style={{ padding: '3px 9px', borderRadius: '6px', background: '#f1f5f9', color: '#334155', fontSize: '11.5px', fontWeight: '700' }}>
                  {p.project_type || 'GENERAL'}
                </span>,
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '11.5px',
                    fontWeight: '750',
                    background: p.status === 'COMPLETED' ? '#ecfdf5' : '#eff6ff',
                    color: p.status === 'COMPLETED' ? '#047857' : '#1d4ed8',
                    border: `1px solid ${p.status === 'COMPLETED' ? '#a7f3d0' : '#bfdbfe'}`,
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '3px',
                      background: p.status === 'COMPLETED' ? '#10b981' : '#3b82f6',
                    }}
                  />
                  {p.status === 'COMPLETED' ? (isMr ? 'पूर्ण' : 'Completed') : (isMr ? 'सुरू' : 'Active')}
                </span>,
                <button
                  type="button"
                  onClick={() => openAssignedUsersModal(p)}
                  style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '6px',
                    padding: '5px 10px',
                    fontSize: '12px',
                    fontWeight: '700',
                    color: '#1d4ed8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span>👥</span> {isMr ? 'कार्यकर्ते पहा' : 'View Team'}
                </button>,
                <span style={{ color: '#64748b', fontSize: '12px' }}>{p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}</span>,
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  {p.status !== 'COMPLETED' && (
                    <Button variant="indigo" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => openMemberAssignment(p)}>
                      {isMr ? 'वाटप करा' : 'Assign'}
                    </Button>
                  )}
                  {p.status !== 'COMPLETED' && (
                    <Button variant="success" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => completeProject(p)}>
                      {isMr ? 'पूर्ण करा' : 'Complete'}
                    </Button>
                  )}
                  <Button variant="danger" style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => deleteProject(p)}>
                    {isMr ? 'हटवा' : 'Delete'}
                  </Button>
                </div>,
              ])
            )}
          </div>

          {/* Member Assignment Modal */}
          {assignmentProject && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  maxWidth: 620,
                  width: '100%',
                  maxHeight: '85vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: '#ffffff',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>👥</span> {isMr ? `प्रकल्प सदस्य वाटप — ${assignmentProject.name}` : `Assign Members — ${assignmentProject.name}`}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#bfdbfe' }}>
                      {isMr
                        ? `डेटाबेसमधील सर्व वापरकर्ते (${projectMembers.length}) यादीमध्ये उपलब्ध आहेत.`
                        : `All database users (${projectMembers.length}) are available to assign to this project.`}
                    </p>
                  </div>
                  <button
                    onClick={() => setAssignmentProject(null)}
                    style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#bfdbfe' }}
                  >
                    ✕
                  </button>
                </div>

                {/* Search & Bulk Select Toolbar */}
                <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <input
                      type="text"
                      value={memberSearch}
                      onChange={(e) => setMemberSearch(e.target.value)}
                      placeholder={isMr ? 'नाव, फोन किंवा भूमिकेनुसार शोधा...' : 'Search by name, phone, email, or role...'}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                        outline: 'none',
                        background: '#ffffff',
                      }}
                    />
                    <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', fontSize: '13px' }}>🔍</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const q = memberSearch.toLowerCase().trim();
                        const matching = projectMembers.filter((m) =>
                          !q ||
                          m.full_name?.toLowerCase().includes(q) ||
                          m.phone?.toLowerCase().includes(q) ||
                          m.email?.toLowerCase().includes(q) ||
                          m.role?.toLowerCase().includes(q)
                        );
                        const matchIds = matching.map((m) => m.id);
                        setSelectedMemberIds((prev) => Array.from(new Set([...prev, ...matchIds])));
                        setMemberStatuses((prev) => {
                          const next = { ...prev };
                          matchIds.forEach((id) => { if (!next[id]) next[id] = 'ASSIGNED'; });
                          return next;
                        });
                      }}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        cursor: 'pointer',
                        fontWeight: '700',
                        color: '#1d4ed8',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isMr ? 'सर्व निवडा' : 'Select All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMemberIds([])}
                      style={{
                        padding: '6px 12px',
                        fontSize: '12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        cursor: 'pointer',
                        fontWeight: '700',
                        color: '#64748b',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {isMr ? 'साफ करा' : 'Clear'}
                    </button>
                  </div>
                </div>

                <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, maxHeight: '52vh' }}>
                  {membersLoading ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                      {isMr ? 'डेटाबेसमधून सर्व वापरकर्ते लोड होत आहेत...' : 'Loading all database users...'}
                    </div>
                  ) : projectMembers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                      {isMr ? 'डेटाबेसमध्ये कोणतेही वापरकर्ते आढळले नाहीत.' : 'No users found in the database.'}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {projectMembers
                        .filter((member) => {
                          if (!memberSearch.trim()) return true;
                          const q = memberSearch.toLowerCase().trim();
                          return (
                            member.full_name?.toLowerCase().includes(q) ||
                            member.phone?.toLowerCase().includes(q) ||
                            member.email?.toLowerCase().includes(q) ||
                            member.role?.toLowerCase().includes(q)
                          );
                        })
                        .map((member) => {
                          const isSelected = selectedMemberIds.includes(member.id);
                          const currentStatus = memberStatuses[member.id] || 'ASSIGNED';
                          const roleName = member.role || (member.roles && member.roles[0]) || 'USER';

                          const roleBadgeStyle =
                            roleName === 'ADMIN'
                              ? { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' }
                              : roleName === 'OFFICER'
                              ? { bg: '#fef3c7', color: '#b45309', border: '#fde68a' }
                              : roleName === 'WORKER'
                              ? { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' }
                              : { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };

                          return (
                            <div
                              key={member.id}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '10px 14px',
                                borderRadius: 8,
                                border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                                background: isSelected ? '#eff6ff' : '#ffffff',
                                transition: 'all 0.15s ease',
                              }}
                            >
                              <label
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 12,
                                  cursor: 'pointer',
                                  flex: 1,
                                  margin: 0,
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedMemberIds((prev) => [...prev, member.id]);
                                      setMemberStatuses((prev) => ({ ...prev, [member.id]: prev[member.id] || 'ASSIGNED' }));
                                    } else {
                                      removeMember(member.id);
                                    }
                                  }}
                                  style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#2563eb' }}
                                />
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                                      {member.full_name}
                                    </span>
                                    <span
                                      style={{
                                        fontSize: '11px',
                                        fontWeight: '750',
                                        padding: '1px 7px',
                                        borderRadius: '9999px',
                                        background: roleBadgeStyle.bg,
                                        color: roleBadgeStyle.color,
                                        border: `1px solid ${roleBadgeStyle.border}`,
                                      }}
                                    >
                                      {isMr
                                        ? roleName === 'ADMIN'
                                          ? 'प्रशासक'
                                          : roleName === 'OFFICER'
                                          ? 'अधिकारी'
                                          : roleName === 'WORKER'
                                          ? 'कार्यकर्ता'
                                          : roleName
                                        : roleName}
                                    </span>
                                    {member.user_status && member.user_status !== 'ACTIVE' && (
                                      <span
                                        style={{
                                          fontSize: '10.5px',
                                          fontWeight: '700',
                                          padding: '1px 6px',
                                          borderRadius: '4px',
                                          background: '#fef2f2',
                                          color: '#dc2626',
                                          border: '1px solid #fecaca',
                                        }}
                                      >
                                        {member.user_status}
                                      </span>
                                    )}
                                  </div>
                                  <div style={{ fontSize: 12, color: '#64748b', marginTop: '2px' }}>
                                    {member.phone || 'No phone'} {member.email ? `• ${member.email}` : ''}
                                  </div>
                                </div>
                              </label>

                              {isSelected && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                  <select
                                    value={currentStatus}
                                    onChange={(e) => updateMemberStatus(member.id, e.target.value)}
                                    style={{
                                      fontSize: 12,
                                      padding: '5px 8px',
                                      borderRadius: 6,
                                      border: '1px solid #cbd5e1',
                                      background: '#fff',
                                      cursor: 'pointer',
                                      fontWeight: '600',
                                      color: '#0f172a',
                                    }}
                                  >
                                    <option value="ASSIGNED">{isMr ? 'नियुक्त' : 'Assigned'}</option>
                                    <option value="PENDING">{isMr ? 'प्रलंबित' : 'Pending'}</option>
                                    <option value="COMPLETE">{isMr ? 'पूर्ण' : 'Complete'}</option>
                                  </select>
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: '14px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 10,
                    background: '#f8fafc',
                  }}
                >
                  <Button secondary onClick={() => setAssignmentProject(null)}>
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </Button>
                  <Button disabled={membersLoading} onClick={saveMemberAssignments}>
                    {isMr ? `वाटप सेव्ह करा (${selectedMemberIds.length})` : `Save Assignments (${selectedMemberIds.length})`}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* View Assigned Users Modal */}
          {viewAssignedProject && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(15, 23, 42, 0.65)',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                padding: 16,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  maxWidth: 580,
                  width: '100%',
                  maxHeight: '80vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    padding: '18px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                    color: '#ffffff',
                  }}
                >
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>👥</span> {isMr ? `नियुक्त सदस्य — ${viewAssignedProject.name}` : `Assigned Members — ${viewAssignedProject.name}`}
                    </h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#bfdbfe' }}>
                      {isMr ? 'सध्या नियुक्त असलेले टीम सदस्य आणि त्यांची कामाची स्थिती.' : 'Currently assigned team members and their work status.'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setViewAssignedProject(null);
                      setAssignedUsersList([]);
                    }}
                    style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#bfdbfe' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1 }}>
                  {loadingAssignedUsers ? (
                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>
                      {isMr ? 'नियुक्त सदस्य लोड होत आहेत...' : 'Loading assigned members...'}
                    </div>
                  ) : assignedUsersList.length > 0 ? (
                    assignedUsersList.map((member) => (
                      <div
                        key={member.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderBottom: '1px solid #f1f5f9',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 650, fontSize: 14, color: '#0f172a' }}>
                            {member.full_name}
                          </div>
                          <div style={{ fontSize: 12, color: '#64748b' }}>
                            {(isMr ? (member.role === 'OFFICER' ? 'अधिकारी' : member.role === 'WORKER' ? 'कार्यकर्ता' : member.role) : member.role) || (isMr ? 'कार्यकर्ता' : 'WORKER')} · {member.phone || member.email}
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: 12,
                            background:
                              member.status === 'COMPLETE' ? '#dcfce7' : member.status === 'PENDING' ? '#fef3c7' : '#e0e7ff',
                            color:
                              member.status === 'COMPLETE' ? '#15803d' : member.status === 'PENDING' ? '#b45309' : '#3730a3',
                          }}
                        >
                          {member.status === 'COMPLETE'
                            ? (isMr ? 'पूर्ण' : 'Complete')
                            : member.status === 'PENDING'
                            ? (isMr ? 'प्रलंबित' : 'Pending')
                            : (isMr ? 'नियुक्त' : 'Assigned')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', padding: '32px 16px', color: '#64748b' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>👥</div>
                      <b>{isMr ? 'या प्रकल्पाला अद्याप कोणतेही सदस्य नियुक्त केलेले नाहीत.' : 'No members assigned to this project yet.'}</b>
                      <p style={{ fontSize: 13, marginTop: 4 }}>
                        {isMr ? 'तुम्ही या प्रकल्पासाठी सक्रिय कार्यकर्ते आणि अधिकारी नियुक्त करू शकता.' : 'You can assign active field workers and officers to this project.'}
                      </p>
                      {viewAssignedProject.status !== 'COMPLETED' && (
                        <Button
                          onClick={() => {
                            const target = viewAssignedProject;
                            setViewAssignedProject(null);
                            openMemberAssignment(target);
                          }}
                        >
                          {isMr ? 'आताच सदस्य नियुक्त करा' : 'Assign members now'}
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    padding: '14px 24px',
                    borderTop: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    background: '#f8fafc',
                  }}
                >
                  <Button
                    secondary
                    onClick={() => {
                      setViewAssignedProject(null);
                      setAssignedUsersList([]);
                    }}
                  >
                    {isMr ? 'बंद करा' : 'Close'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (active === 'evm') return <KarkartaEvmVotingSystem user={user} isMr={isMr} isAdmin={true} />;
    if (active === 'attendance') return <UserAttendanceManager language={language} />;
    if (active === 'master') return <LocationMasterExplorer language={language} />;
    if (active === 'forms') return <HouseholdSurveyForm user={user} language={language} />;
    if (active === 'approvals') return <DataApprovalWorkbench lang={language} />;
    if (active === 'duplicates') return <DuplicateDetectionWorkbench lang={language} />;
    if (active === 'media') return <DocumentMediaManager lang={language} />;
    if (active === 'backup') return <BackupRestoreEngine lang={language} />;
    if (active === 'audit') return <AuditLogViewer logs={auditLogs} currentUser={user} language={language} onRefresh={loadLogs} />;

    return <BackupRestoreEngine lang={language} />;
  };

  useEffect(() => {
    if (active === 'overview') {
      Promise.all([loadPending(), loadProjects(), loadFormsCount()]).catch(() => {});
    }
  }, [active]);

  return translateTree(
    <div lang={language} style={styles.app}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        {/* Static Enterprise Sidebar */}
        <aside
          style={{
            width: '268px',
            minWidth: '268px',
            maxWidth: '268px',
            flexShrink: 0,
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
            padding: '18px 12px 14px 12px',
            zIndex: 50,
            overflowY: 'auto',
            overflowX: 'hidden',
            scrollbarWidth: 'thin',
            scrollbarColor: '#cbd5e1 transparent',
          }}
        >
          <div>
            {/* Top Brand Header Card — Indian Flag Theme */}
            <div
              style={{
                padding: '12px 12px 10px 12px',
                borderRadius: '10px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                marginBottom: '14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
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
                  title={isMr ? 'भारत • प्रशासन नियंत्रण कक्ष' : 'India • Admin Command HQ'}
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
                    {isMr ? 'प्रशासन नियंत्रण कक्ष' : 'Admin Command HQ'}
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
                    {isMr ? '🇮🇳 भारत • महाराष्ट्र राज्य' : '🇮🇳 India • Maharashtra State'}
                  </div>
                </div>
              </div>

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
                  <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: '#10b981' }} />
                  {isMr ? 'थेट डेटाबेस जोडणी' : 'Live Sync'}
                </span>
                <span style={{ color: '#94a3b8', fontSize: '10.5px' }}>v2.5 SaaS</span>
              </div>
            </div>

            {/* Static Light Search Bar */}
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <span style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                {icons.search}
              </span>
              <input
                type="text"
                placeholder={isMr ? 'पर्याय शोधा...' : 'Search admin sections...'}
                value={sidebarSearch}
                onChange={(e) => setSidebarSearch(e.target.value)}
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
              {sidebarSearch && (
                <button
                  type="button"
                  onClick={() => setSidebarSearch('')}
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

            {/* Nav Groups & Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredNavGroups.map((group) => (
                <div key={group.id}>
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
                    {isMr ? group.title_mr : group.title_en}
                  </div>

                  <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    {group.items.map((item) => {
                      const isActive = active === item.id;
                      const theme = badgeThemes[item.badgeTheme] || badgeThemes.blue;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActive(item.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            padding: '7px 9px',
                            borderRadius: '8px',
                            border: isActive ? '1px solid #bfdbfe' : '1px solid transparent',
                            background: isActive ? '#eff6ff' : 'transparent',
                            color: isActive ? '#1d4ed8' : '#475569',
                            fontWeight: isActive ? '650' : '500',
                            fontSize: '12.5px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            position: 'relative',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseOver={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#0f172a';
                            }
                          }}
                          onMouseOut={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.color = '#475569';
                            }
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0, justifyContent: 'flex-start' }}>
                            <span
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: isActive ? '#dbeafe' : '#f8fafc',
                                color: isActive ? '#2563eb' : '#64748b',
                                border: isActive ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                flexShrink: 0,
                                position: 'relative',
                              }}
                            >
                              {icons[item.iconKey] || icons.overview}
                            </span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12.5px', lineHeight: 1.3 }}>
                              {isMr ? item.label_mr : item.label_en}
                            </span>
                          </div>

                          {item.badge && (
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '2px 6px',
                                borderRadius: '9999px',
                                background: isActive ? '#dbeafe' : theme.bg,
                                color: isActive ? '#1e40af' : theme.text,
                                border: `1px solid ${isActive ? '#bfdbfe' : theme.border}`,
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

          {/* Bottom Admin User Profile Card */}
          <div
            style={{
              marginTop: '14px',
              padding: '10px',
              borderRadius: '10px',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              gap: '8px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-start' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: '#e0e7ff',
                  color: '#4338ca',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '13px',
                  border: '1px solid #c7d2fe',
                  position: 'relative',
                  flexShrink: 0,
                }}
                title={user?.full_name || 'Admin'}
              >
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'A'}
                <span style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '8px', height: '8px', borderRadius: '4px', background: '#10b981', border: '1.5px solid #ffffff' }} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.full_name || (isMr ? 'सिस्टिम प्रशासक' : 'Administrator')}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {user?.roles?.join(', ') || 'ADMINISTRATOR'}
                </div>
              </div>
            </div>

            {/* Quick Actions (Neta App + Logout) */}
            <div style={{ display: 'flex', gap: '6px', flexDirection: 'row', width: '100%' }}>
              <button
                type="button"
                onClick={() => navigate('/officer')}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#334155',
                  padding: '5px 6px',
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
                title={isMr ? 'नेता कक्ष' : 'Neta App'}
              >
                {icons.netaApp}
                <span>{isMr ? 'नेता कक्ष' : 'Neta App'}</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  padding: '5px 6px',
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
                title={isMr ? 'बाहेर पडा' : 'Sign out'}
              >
                {icons.logout}
                <span>{isMr ? 'बाहेर पडा' : 'Sign out'}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area with Modern Sticky Header */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, minHeight: '100vh' }}>
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

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <BackButton
                lang={language}
                fallbackPath="/"
                onBack={() => {
                  if (active !== 'overview') {
                    setActive('overview');
                  } else if (window.history.length > 1) {
                    navigate(-1);
                  } else {
                    navigate('/');
                  }
                }}
              />
              <div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isMr ? 'प्रशासन नियंत्रण केंद्र' : 'Administration Command Desk'}
                </div>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {isMr ? currentNav.label_mr : currentNav.label_en}
                </h2>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <button
                  type="button"
                  onClick={() => {
                    setLanguage('mr');
                    localStorage.setItem('admin-language', 'mr');
                  }}
                  style={{
                    border: 'none',
                    background: language === 'mr' ? '#1e3a8a' : 'transparent',
                    color: language === 'mr' ? '#ffffff' : '#475569',
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
                  type="button"
                  onClick={() => {
                    setLanguage('en');
                    localStorage.setItem('admin-language', 'en');
                  }}
                  style={{
                    border: 'none',
                    background: language === 'en' ? '#1e3a8a' : 'transparent',
                    color: language === 'en' ? '#ffffff' : '#475569',
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

              {/* Direct Jump to Neta / Officer Platform */}
              <button
                type="button"
                onClick={() => navigate('/officer')}
                style={{
                  border: 'none',
                  background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#ffffff',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  fontWeight: '700',
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                }}
              >
                <span>🏛️</span>
                <span>{isMr ? 'नेता कक्ष' : 'Neta Command'}</span>
              </button>

              {/* Sign Out Button */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  fontWeight: '650',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.color = '#dc2626';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = '#cbd5e1';
                  e.currentTarget.style.color = '#475569';
                }}
              >
                {isMr ? 'बाहेर पडा' : 'Sign out'}
              </button>
            </div>
          </header>

          {/* Main Workspace Body */}
          <main style={{ padding: '24px 28px', flex: 1 }}>
            {notice && (
              <div
                role="status"
                style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  marginBottom: '16px',
                  color: '#166534',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>✓</span>
                <span>{notice}</span>
              </div>
            )}

            {error && (
              <div
                role="alert"
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '12px 18px',
                  marginBottom: '16px',
                  color: '#991b1b',
                  fontSize: '13.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {content()}
          </main>
        </div>
      </div>
    </div>,
    language
  );
}

export default AdminDashboard;
