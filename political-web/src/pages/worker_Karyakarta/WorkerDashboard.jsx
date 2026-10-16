import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import BackButton from '../../components/BackButton';
import AdminChatbotDesk from '../admin/AdminChatbotDesk';
import './worker.css';
import { 
  LayoutDashboard, 
  User, 
  Users, 
  ClipboardList, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell, 
  Menu,
  TrendingUp,
  UserCheck,
  Clock,
  AlertCircle,
  Plus,
  BarChart2,
  FileText,
  Target,
  Send,
  PhoneCall,
  Calendar,
  AlertTriangle,
  ClipboardCheck,
  CalendarCheck,
  PhoneForwarded,
  Edit2,
  MapPin,
  Mail,
  Phone,
  Shield,
  CalendarDays,
  Save,
  X,
  Video,
  MessageCircle,
  MoreVertical,
  Play,
  CheckCheck,
  CheckSquare,
  ArrowLeft,
  Share2,
  Check,
  ArrowRight,
  Lock,
  EyeOff,
  Headphones,
  CheckCircle2,
  Trash2,
  LogIn,
  LogOut,
  Camera,
  RefreshCw,
  Navigation,
  Compass,
  ShieldCheck,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { translations } from './translations';
import Webcam from 'react-webcam';
import { workerApi } from './workerApi';
import KarkartaEvmVotingSystem from './components/KarkartaEvmVotingSystem';
import { 
  isNetworkOnline, 
  getOfflineQueue, 
  enqueueOfflineItem, 
  syncOfflineQueue, 
  cacheWorkerData, 
  getWorkerCache 
} from './offlineSyncManager';

// Self-contained Live Clock component: ticks every second in its own micro-lifecycle
// preventing the entire 4,000-line WorkerDashboard from re-rendering every 1,000ms.
const LiveClock = React.memo(function LiveClock({ isMr, variant = 'header' }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatted = useMemo(() => {
    try {
      const timeStr = time.toLocaleTimeString(isMr ? 'mr-IN' : 'en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      const dateStr = time.toLocaleDateString(isMr ? 'mr-IN' : 'en-IN', {
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      return { time: timeStr, date: dateStr };
    } catch {
      return { time: time.toTimeString().split(' ')[0], date: '' };
    }
  }, [time, isMr]);

  if (variant === 'header') {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '5px 10px',
          borderRadius: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          fontSize: '11.5px',
          color: '#334155',
          fontWeight: '600',
        }}
        title={isMr ? 'भारतीय प्रमाणवेळ (IST)' : 'Indian Standard Time'}
      >
        <span>🇮🇳</span>
        <span style={{ fontFamily: 'monospace', fontWeight: '750', color: '#0f172a' }}>
          {formatted.time}
        </span>
        <span style={{ color: '#94a3b8', fontSize: '11px' }}>({formatted.date})</span>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div>
        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
          {formatted.date}
        </div>
        <div style={{ fontSize: '16px', fontWeight: '900', color: '#0f172a', letterSpacing: '0.5px', fontFamily: 'monospace' }}>
          {formatted.time}
        </div>
      </div>
    );
  }

  // inline
  return (
    <span style={{ fontWeight: '800', color: '#0f172a', fontFamily: 'monospace' }}>
      {formatted.time} ({formatted.date})
    </span>
  );
});

export default function WorkerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [voterData, setVoterData] = useState([]);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('karyakarta_lang') || 'en';
    } catch {
      return 'en';
    }
  }); // Default English (Primary), toggleable to Marathi / Hindi
  const changeLanguage = (lang) => {
    setLanguage(lang);
    try {
      localStorage.setItem('karyakarta_lang', lang);
    } catch (e) {
      console.warn('localStorage error:', e);
    }
  };
  const [loading, setLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFloatingChat, setShowFloatingChat] = useState(false);

  // Offline & Auto-Sync State
  const [isOnline, setIsOnline] = useState(() => isNetworkOnline());
  const [offlineQueueCount, setOfflineQueueCount] = useState(() => getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('');

  const isMr = language === 'mr';

  const t = (key) => translations[language]?.[key] || key;

  // Candidate Voting State
  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [candidatesList, setCandidatesList] = useState([]);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('All');
  const [candidateTab, setCandidateTab] = useState('About');

  // Active Survey Filling Modal State (Only for Allowed Published Forms)
  const [activeSurveyToFill, setActiveSurveyToFill] = useState(null);
  const [surveysList, setSurveysList] = useState([]);
  const [submittingSurvey, setSubmittingSurvey] = useState(false);
  const [surveyStats, setSurveyStats] = useState({
    allocatedForms: 0,
    savedToBackend: 0,
    totalTarget: 0,
    pendingTarget: 0,
  });
  const [savedSubmissionsList, setSavedSubmissionsList] = useState([]);
  const [surveyActiveView, setSurveyActiveView] = useState('forms'); // 'forms' | 'saved_history'
  const [surveyFormData, setSurveyFormData] = useState({
    pramukh_name: '',
    total_matdar: 1,
    phone: '',
    address: '',
    members: [
      {
        id: 'mem_1',
        full_name: '',
        dob: '',
        age: '',
        has_voter_id: 'YES',
        voter_id_no: '',
        relation: 'कुटुंब प्रमुख (Self)',
      },
    ],
    custom_answers: {},
  });

  const navItems = [
    { name: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
    { name: 'Attendance', key: 'attendance', icon: CalendarCheck },
    { name: 'User Profile', key: 'userProfile', icon: User },
    { name: 'Survey', key: 'survey', icon: ClipboardCheck },
    { name: 'Contact & Meetings', key: 'contactMeetings', icon: Calendar },
    { name: 'Voting', key: 'voting', icon: CheckSquare },
  ];

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.full_name || '',
    dob: '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    assignedWard: '',
    primaryBooths: '',
    joinDate: '',
    epic: '',
    responsibility: '',
    employeeCode: '',
  });

  const [contactTab, setContactTab] = useState('contacts');
  const [contactSearchQuery, setContactSearchQuery] = useState('');
  const [contactSentimentFilter, setContactSentimentFilter] = useState('All');
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
  const [meetingsList, setMeetingsList] = useState([]);
  const [newMeeting, setNewMeeting] = useState({ title: '', time: '', location: '', attendees: '', type: 'Virtual' });

  const [complaintFilter, setComplaintFilter] = useState('All');
  const [complaintSearchQuery, setComplaintSearchQuery] = useState('');
  const [complaintsData, setComplaintsData] = useState([]);

  const [attendanceState, setAttendanceState] = useState('Not Started');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [votersList, setVotersList] = useState([]);
  const [tasksList, setTasksList] = useState([]);
  const [followUpsList, setFollowUpsList] = useState([]);

  // Citizen Grievances / Complaints State
  const [isAddingComplaint, setIsAddingComplaint] = useState(false);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [complaintDuplicateWarning, setComplaintDuplicateWarning] = useState(null);
  const [complaintFormData, setComplaintFormData] = useState({
    name: '',
    phone: '',
    category: 'पाणी पुरवठा (Water Supply)',
    desc: '',
    urgency: 'मध्यम (Medium)',
    photo: null,
    location: '',
  });

  // Tasks & Follow-ups State
  const [taskActiveTab, setTaskActiveTab] = useState('tasks'); // 'tasks' | 'followups'
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: '',
    deadline: '',
    priority: 'Medium',
    category: 'बूथ प्रचार (Booth Outreach)',
  });
  const [isAddingFollowUp, setIsAddingFollowUp] = useState(false);
  const [newFollowUpData, setNewFollowUpData] = useState({
    citizen_name: '',
    phone: '',
    topic: '',
    next_date: '',
    notes: '',
  });

  // 6-Level Geographic Hierarchy State
  const [hierarchyData, setHierarchyData] = useState(null);
  const [loadingHierarchy, setLoadingHierarchy] = useState(false);
  const [selectedHierarchyLevel, setSelectedHierarchyLevel] = useState(6);

  // Visit Log State
  const [activeVisitContact, setActiveVisitContact] = useState(null);
  const [visitFormData, setVisitFormData] = useState({
    name: '',
    phone: '',
    status: 'Supportive',
    notes: '',
    location: '',
  });

  // Inline Survey Duplicate Warning State
  const [surveyDuplicateWarning, setSurveyDuplicateWarning] = useState(null);

  const [dashboardStats, setDashboardStats] = useState({
    totalAssigned: 0,
    contacted: 0,
    supportive: 0,
    pendingFollowUps: 0,
    surveysCompleted: 0,
    surveysTarget: 0,
  });

  const [activities, setActivities] = useState([]);

  // Data Fetching Functions
  const loadOverview = async () => {
    try {
      const data = await workerApi.getOverview();
      if (data) {
        if (data.stats) setDashboardStats(data.stats);
        if (data.voterData) setVoterData(data.voterData);
        if (data.activities) setActivities(data.activities);
        cacheWorkerData('overview', data);
      }
    } catch (e) {
      console.warn('Overview load issue:', e);
      const cached = getWorkerCache('overview');
      if (cached) {
        if (cached.stats) setDashboardStats(cached.stats);
        if (cached.voterData) setVoterData(cached.voterData);
        if (cached.activities) setActivities(cached.activities);
      }
    }
  };

  const loadProfile = async () => {
    try {
      const data = await workerApi.getProfile();
      if (data) {
        setProfileData(data);
      }
    } catch (e) {
      console.warn('Profile load issue:', e);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await workerApi.getTasks();
      if (Array.isArray(data)) setTasksList(data);
    } catch (e) {
      console.warn('Tasks load issue:', e);
    }
  };

  const loadFollowUps = async () => {
    try {
      const data = await workerApi.getFollowUps();
      if (Array.isArray(data)) setFollowUpsList(data);
    } catch (e) {
      console.warn('Follow-ups load issue:', e);
    }
  };

  const loadSurveys = async () => {
    try {
      const res = await workerApi.getSurveys();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setSurveysList(list);

      const allocatedForms = res?.allocated_forms_count ?? list.length;
      const savedToBackend = res?.total_saved_to_backend ?? list.reduce((acc, s) => acc + (s.completed_voters || 0), 0);
      const totalTarget = res?.total_allocated_target ?? list.reduce((acc, s) => acc + (s.allocated_target || s.total_voters || 50), 0);
      const pendingTarget = res?.pending_target ?? Math.max(0, totalTarget - savedToBackend);

      setSurveyStats({
        allocatedForms,
        savedToBackend,
        totalTarget,
        pendingTarget,
      });

      if (Array.isArray(res?.recent_submissions)) {
        setSavedSubmissionsList(res.recent_submissions);
      }
      cacheWorkerData('surveys', { list, stats: { allocatedForms, savedToBackend, totalTarget, pendingTarget }, submissions: res?.recent_submissions || [] });
    } catch (e) {
      console.warn('Surveys load issue:', e);
      const cached = getWorkerCache('surveys');
      if (cached) {
        if (Array.isArray(cached)) {
          setSurveysList(cached);
        } else if (cached.list) {
          setSurveysList(cached.list || []);
          if (cached.stats) setSurveyStats(cached.stats);
          if (cached.submissions) setSavedSubmissionsList(cached.submissions);
        }
      } else {
        setSurveysList([]);
      }
    }
  };

  const loadComplaints = async () => {
    try {
      const data = await workerApi.getComplaints();
      if (Array.isArray(data)) setComplaintsData(data);
    } catch (e) {
      console.warn('Complaints load issue:', e);
    }
  };

  const [attendancePolicy, setAttendancePolicy] = useState(null);

  const loadAttendance = async () => {
    try {
      const data = await workerApi.getAttendance();
      if (data) {
        if (data.currentState) setAttendanceState(data.currentState);
        if (Array.isArray(data.history)) setAttendanceHistory(data.history);
        cacheWorkerData('attendance', data);
      }
    } catch (e) {
      console.warn('Attendance load issue:', e);
      const cached = getWorkerCache('attendance');
      if (cached) {
        if (cached.currentState) setAttendanceState(cached.currentState);
        if (Array.isArray(cached.history)) setAttendanceHistory(cached.history);
      }
    }
  };

  const loadAttendancePolicy = async () => {
    try {
      const data = await workerApi.getAttendancePolicy();
      if (data) setAttendancePolicy(data);
    } catch (e) {
      console.warn('Attendance policy load issue:', e);
    }
  };

  const loadContacts = async () => {
    try {
      const data = await workerApi.getContacts();
      if (Array.isArray(data)) {
        setVotersList(data);
        cacheWorkerData('contacts', data);
      }
    } catch (e) {
      console.warn('Contacts load issue:', e);
      const cached = getWorkerCache('contacts');
      if (cached && Array.isArray(cached)) setVotersList(cached);
    }
  };

  const loadMeetings = async () => {
    try {
      const data = await workerApi.getMeetings();
      if (Array.isArray(data)) {
        setMeetingsList(data);
        cacheWorkerData('meetings', data);
      }
    } catch (e) {
      console.warn('Meetings load issue:', e);
      const cached = getWorkerCache('meetings');
      if (cached && Array.isArray(cached)) setMeetingsList(cached);
    }
  };

  const loadCandidates = async () => {
    try {
      const data = await workerApi.getCandidates();
      if (data) {
        if (Array.isArray(data.candidates)) setCandidatesList(data.candidates);
        if (data.hasVoted !== undefined) setHasVoted(data.hasVoted);
        if (data.votedCandidate) setVotedCandidate(data.votedCandidate);
      }
    } catch (e) {
      console.warn('Candidates load issue:', e);
    }
  };

  const loadHierarchy = async () => {
    try {
      setLoadingHierarchy(true);
      const data = await workerApi.getGeographyHierarchy();
      if (data) setHierarchyData(data);
    } catch (e) {
      console.warn('Hierarchy load issue:', e);
    } finally {
      setLoadingHierarchy(false);
    }
  };

  // Check Duplicate helper
  const checkDuplicateField = async (field, val, setWarning) => {
    if (!val || val.trim().length < 6) {
      setWarning(null);
      return;
    }
    try {
      const res = await workerApi.checkDuplicate(field === 'phone' ? { phone: val } : { voter_id: val });
      if (res?.is_duplicate && res?.matches?.length > 0) {
        setWarning(res.matches[0]);
      } else {
        setWarning(null);
      }
    } catch (e) {
      console.warn('Duplicate check error:', e);
    }
  };

  // Complaint Submit Handler
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintFormData.name.trim() || !complaintFormData.desc.trim()) {
      alert(isMr ? 'कृपया नागरिकाचे नाव आणि समस्येचे वर्णन भरा.' : 'Please enter citizen name and description.');
      return;
    }

    const payload = {
      ...complaintFormData,
      location: complaintFormData.location || currentCoords?.address || 'सांगली (Sangli)',
    };

    if (!isNetworkOnline()) {
      enqueueOfflineItem({
        type: 'COMPLAINT',
        label_mr: `नागरिक तक्रार - ${complaintFormData.name} (${complaintFormData.category})`,
        label_en: `Citizen Complaint - ${complaintFormData.name}`,
        payload,
      });

      alert(isMr 
        ? '📶 इंटरनेट जोडणी नाही.\nतक्रार डिव्हाइसवर सुरक्षित साठवली आहे!\nनेटवर्क येताच ती आपोआप सर्व्हरवर सिंक होईल.'
        : '📶 Offline.\nComplaint saved locally on device!\nIt will automatically sync when online.');
      
      setIsAddingComplaint(false);
      setComplaintFormData({
        name: '',
        phone: '',
        category: 'पाणी पुरवठा (Water Supply)',
        desc: '',
        urgency: 'मध्यम (Medium)',
        photo: null,
        location: '',
      });
      setComplaintDuplicateWarning(null);
      return;
    }

    setSubmittingComplaint(true);
    try {
      await workerApi.storeComplaint(payload);
      alert(isMr ? '✓ तक्रार / समस्या यशस्वीरीत्या नोंदवली गेली!' : '✓ Citizen complaint registered successfully!');
      setIsAddingComplaint(false);
      setComplaintFormData({
        name: '',
        phone: '',
        category: 'पाणी पुरवठा (Water Supply)',
        desc: '',
        urgency: 'मध्यम (Medium)',
        photo: null,
        location: '',
      });
      setComplaintDuplicateWarning(null);
      loadComplaints();
      loadOverview();
    } catch (err) {
      console.error('Failed to submit complaint:', err);
      alert(isMr ? 'तक्रार नोंदवताना त्रुटी आली.' : 'Failed to register complaint.');
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // Task Toggle & Create
  const handleToggleTask = async (id) => {
    try {
      await workerApi.toggleTask(id);
      loadTasks();
      loadOverview();
    } catch (e) {
      console.error('Failed to toggle task:', e);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskData.title.trim()) return;
    try {
      await workerApi.createTask(newTaskData);
      setIsAddingTask(false);
      setNewTaskData({ title: '', deadline: '', priority: 'Medium', category: 'बूथ प्रचार (Booth Outreach)' });
      loadTasks();
      loadOverview();
    } catch (e) {
      console.error('Failed to create task:', e);
    }
  };

  // Follow-up Update & Create
  const handleUpdateFollowUpStatus = async (id, status) => {
    try {
      await workerApi.updateFollowUpStatus(id, status);
      loadFollowUps();
      loadOverview();
    } catch (e) {
      console.error('Failed to update follow-up:', e);
    }
  };

  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    if (!newFollowUpData.citizen_name.trim()) return;
    try {
      await workerApi.createFollowUp(newFollowUpData);
      setIsAddingFollowUp(false);
      setNewFollowUpData({ citizen_name: '', phone: '', topic: '', next_date: '', notes: '' });
      loadFollowUps();
      loadOverview();
    } catch (e) {
      console.error('Failed to create follow-up:', e);
    }
  };

  // Visit Log Handler
  const handleSaveVisitLog = async (e) => {
    e.preventDefault();
    if (!visitFormData.name.trim()) return;
    try {
      await workerApi.recordVisitLog({
        ...visitFormData,
        location: visitFormData.location || currentCoords?.address || 'सांगली (Sangli)',
      });
      alert(isMr ? '✓ भेट यशस्वीरीत्या नोंदवली गेली!' : '✓ Visit log recorded successfully!');
      setActiveVisitContact(null);
      loadContacts();
      loadOverview();
    } catch (e) {
      console.error('Failed to record visit log:', e);
    }
  };

  // Sync and fetch all data on mount or when user changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      loadOverview(),
      loadProfile(),
      loadTasks(),
      loadFollowUps(),
      loadSurveys(),
      loadComplaints(),
      loadAttendance(),
      loadAttendancePolicy(),
      loadContacts(),
      loadMeetings(),
      loadCandidates(),
      loadHierarchy(),
    ]).finally(() => setLoading(false));
  }, [user]);

  // Handle manual or automatic queue sync
  const handleSyncQueue = useCallback(async (isAuto = false) => {
    if (!isNetworkOnline()) {
      if (!isAuto) {
        alert(isMr ? '📶 इंटरनेट जोडणी उपलब्ध नाही. कृपया नेटवर्क उपलब्ध झाल्यावर प्रयत्न करा.' : '📶 No internet connection. Please try again when online.');
      }
      return;
    }

    const currentQueue = getOfflineQueue();
    if (currentQueue.length === 0) {
      if (!isAuto) {
        alert(isMr ? 'सर्व माहिती आधीच डेटाबेसमध्ये अद्ययावत आहे!' : 'All offline data is already synced!');
      }
      return;
    }

    setIsSyncing(true);
    setSyncStatusMsg(isMr ? 'माहिती सिंक होत आहे...' : 'Syncing data...');
    try {
      const result = await syncOfflineQueue(workerApi);
      if (result.synced > 0) {
        const msg = isMr 
          ? `✓ ${result.synced} ऑफलाइन नोंदी डेटाबेसमध्ये यशस्वीरीत्या सिंक झाल्या!` 
          : `✓ ${result.synced} offline records successfully synced to database!`;
        setSyncStatusMsg(msg);
        alert(msg);
        // Refresh all dashboard live data
        Promise.all([
          loadOverview(),
          loadAttendance(),
          loadSurveys(),
          loadMeetings(),
          loadComplaints()
        ]);
      }
    } catch (e) {
      console.error('Queue sync error:', e);
    } finally {
      setIsSyncing(false);
      setOfflineQueueCount(getOfflineQueue().length);
      setTimeout(() => setSyncStatusMsg(''), 5000);
    }
  }, [isMr]);

  // Network listener & auto-sync trigger
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Automatically sync pending items when network reconnects
      handleSyncQueue(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueChange = (e) => {
      setOfflineQueueCount(e.detail?.count ?? getOfflineQueue().length);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('karyakarta:offline-queue-changed', handleQueueChange);

    // Initial check: if online and pending items exist, trigger auto-sync
    if (isNetworkOnline() && getOfflineQueue().length > 0) {
      handleSyncQueue(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('karyakarta:offline-queue-changed', handleQueueChange);
    };
  }, [handleSyncQueue]);

  const pendingFollowUps = complaintsData.filter((c) => c.status === 'Pending' || c.status === 'In Progress').length + meetingsList.length;

  const badgeConfig = {
    live: { bg: '#ecfdf5', border: '#a7f3d0', text: '#059669' },
    blue: { bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8' },
    amber: { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
    purple: { bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce' },
    red: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
    indigo: { bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca' },
    teal: { bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e' },
  };

  const navSections = [
    {
      id: 'core_ops',
      title_mr: 'मुख्य नियंत्रण व उपस्थिती',
      title_en: 'COMMAND & ATTENDANCE',
      items: [
        {
          id: 'Dashboard',
          label_mr: 'कार्यकर्ता डॅशबोर्ड',
          label_en: 'Field Overview Dashboard',
          icon: LayoutDashboard,
          badge: isMr ? 'थेट डेटा' : 'Live DB',
          badgeTheme: 'live',
        },
        {
          id: 'Attendance',
          label_mr: 'डिजिटल उपस्थिती व सेल्फी पंच',
          label_en: 'Geo Attendance Desk',
          icon: CalendarCheck,
          badge: attendanceState === 'Punched In' ? (isMr ? 'हजर' : 'Punched In') : isMr ? 'GPS थेट' : 'GPS Live',
          badgeTheme: attendanceState === 'Punched In' ? 'live' : 'blue',
        },
        {
          id: 'User Profile',
          label_mr: 'कार्यकर्ता प्रोफाइल व माहिती',
          label_en: 'Karyakarta Profile',
          icon: User,
          badge: isMr ? 'सक्रिय' : 'Active',
          badgeTheme: 'amber',
        },
        {
          id: 'Hierarchy',
          label_mr: '६-स्तरीय क्षेत्ररचना दर्शक',
          label_en: 'Geography Hierarchy (State to Booth)',
          icon: Compass,
          badge: isMr ? '६ स्तर' : '6 Levels',
          badgeTheme: 'teal',
        },
      ],
    },
    {
      id: 'voter_engagement',
      title_mr: 'मतदार संपर्क, पाहणी व कृती',
      title_en: 'VOTER ENGAGEMENT & FIELD ACTION',
      items: [
        {
          id: 'Survey',
          label_mr: 'कुटुंब व मतदार सर्वेक्षण',
          label_en: 'Household Survey Desk',
          icon: ClipboardCheck,
          badge: surveysList.length > 0 ? `${surveysList.length} ${isMr ? 'फॉर्म' : 'Forms'}` : (isMr ? 'थेट' : 'Live'),
          badgeTheme: 'purple',
        },
        {
          id: 'Contact & Meetings',
          label_mr: 'नागरिक संपर्क व बैठका',
          label_en: 'Citizen Connect & Meetings',
          icon: Calendar,
        },
        {
          id: 'Complaints',
          label_mr: 'नागरिकांच्या समस्या व विनंत्या',
          label_en: 'Citizen Grievances & Requests',
          icon: AlertCircle,
          badge: complaintsData.filter((c) => c.status === 'Pending').length > 0 ? `${complaintsData.filter((c) => c.status === 'Pending').length} ${isMr ? 'बाकी' : 'Pending'}` : (isMr ? 'थेट' : 'Live'),
          badgeTheme: 'amber',
        },
        {
          id: 'Tasks',
          label_mr: 'कार्ये व मतदार पाठपुरावा',
          label_en: 'Tasks & Citizen Follow-ups',
          icon: CheckSquare,
          badge: tasksList.filter((t) => !t.completed).length > 0 ? `${tasksList.filter((t) => !t.completed).length} ${isMr ? 'कामे' : 'Tasks'}` : null,
          badgeTheme: 'blue',
        },
      ],
    },
    {
      id: 'election_voting',
      title_mr: 'निवडणूक व मतदान कक्ष',
      title_en: 'ELECTION & VOTING',
      items: [
        {
          id: 'Voting',
          label_mr: 'डेमो EVM मतदान यंत्र',
          label_en: 'Digital EVM Voting Machine',
          icon: CheckSquare,
          badge: isMr ? 'EVM थेट' : 'Live EVM',
          badgeTheme: 'live',
        },
      ],
    },
  ];

  const addActivity = (type, title, bgColor, color) => {
    setActivities((prev) => [
      { id: Date.now(), type, bgColor, color, title, time: 'आत्ताच (Just now)' },
      ...prev.slice(0, 5),
    ]);
  };

  // Webcam Attendance & Dedicated Punch In / Punch Out
  const [isScanningFace, setIsScanningFace] = useState(false);
  const [punchMode, setPunchMode] = useState('IN'); // 'IN' or 'OUT'
  const [webcamError, setWebcamError] = useState(false);
  const [locationDetecting, setLocationDetecting] = useState(false);
  const [currentCoords, setCurrentCoords] = useState(null);
  const webcamRef = useRef(null);

  const startPunchIn = () => {
    setPunchMode('IN');
    setIsScanningFace(true);
    setWebcamError(false);
    detectCurrentLocation();
  };

  const startPunchOut = () => {
    setPunchMode('OUT');
    setIsScanningFace(true);
    setWebcamError(false);
    detectCurrentLocation();
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocationDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        let addr = `अक्षांश: ${lat}, रेखांश: ${lng} (सांगली)`;
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
          if (res.ok) {
            const d = await res.json();
            if (d.display_name) addr = d.display_name;
          }
        } catch (e) {}
        setCurrentCoords({ latitude: lat, longitude: lng, address: addr });
        setLocationDetecting(false);
      },
      () => setLocationDetecting(false),
      { timeout: 7000, enableHighAccuracy: true }
    );
  };

  const confirmPunch = async () => {
    let photoSrc = null;
    try {
      if (webcamRef.current) {
        photoSrc = webcamRef.current.getScreenshot();
      }
    } catch (e) {
      console.warn('Webcam screenshot capture issue:', e);
    }

    setIsScanningFace(false);

    // Retrieve current geolocation if not already cached
    const getLocationData = () =>
      new Promise((resolve) => {
        if (currentCoords) {
          resolve(currentCoords);
          return;
        }
        if (!navigator.geolocation) {
          resolve(null);
          return;
        }
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            const lat = Number(pos.coords.latitude.toFixed(6));
            const lng = Number(pos.coords.longitude.toFixed(6));
            let addr = `अक्षांश: ${lat}, रेखांश: ${lng} (सांगली)`;
            try {
              const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18`);
              if (res.ok) {
                const d = await res.json();
                if (d.display_name) addr = d.display_name;
              }
            } catch (e) {}
            resolve({ latitude: lat, longitude: lng, address: addr });
          },
          () => resolve(null),
          { timeout: 7000, enableHighAccuracy: true }
        );
      });

    const locationData = (await getLocationData()) || {};

    // 1. Direct offline check
    if (!isNetworkOnline()) {
      enqueueOfflineItem({
        type: punchMode === 'IN' ? 'ATTENDANCE_IN' : 'ATTENDANCE_OUT',
        label_mr: punchMode === 'IN' ? 'सकाळची उपस्थिती (Punch In)' : 'कर्तव्य समाप्ती (Punch Out)',
        label_en: punchMode === 'IN' ? 'Punch In Attendance' : 'Punch Out Attendance',
        payload: {
          photo: photoSrc,
          locationData
        }
      });

      if (punchMode === 'IN') {
        setAttendanceState('Punched In');
        addActivity('clock', 'सकाळची उपस्थिती (Offline Punch In) नोंदवली', '#ecfdf5', '#059669');
        alert(isMr 
          ? '📶 ऑफलाइन हजेरी (Punch In) डिव्हाइसवर नोंदवली गेली आहे!\nनेटवर्क उपलब्ध होताच ती आपोआप डेटाबेसमध्ये सिंक होईल.' 
          : '📶 Punched In offline! Will automatically sync to database when online.');
      } else {
        setAttendanceState('Completed');
        addActivity('clock', 'कर्तव्य समाप्ती (Offline Punch Out) नोंदवली', '#fff7ed', '#ea580c');
        alert(isMr 
          ? '📶 ऑफलाइन निर्गमन (Punch Out) डिव्हाइसवर नोंदवले गेले आहे!\nनेटवर्क उपलब्ध होताच ते आपोआप डेटाबेसमध्ये सिंक होईल.' 
          : '📶 Punched Out offline! Will automatically sync to database when online.');
      }
      return;
    }

    try {
      if (punchMode === 'IN') {
        await workerApi.punchIn(photoSrc, locationData);
        setAttendanceState('Punched In');
        addActivity('clock', 'सकाळची उपस्थिती (Punch In) नोंदवली', '#ecfdf5', '#059669');
        alert(isMr ? 'हजेरी (Punch In) यशस्वीरीत्या नोंदवली!' : 'Punched In successfully!');
      } else {
        await workerApi.punchOut(photoSrc, locationData);
        setAttendanceState('Completed');
        addActivity('clock', 'कर्तव्य समाप्ती (Punch Out) नोंदवली', '#fff7ed', '#ea580c');
        alert(isMr ? 'निर्गमन (Punch Out) यशस्वीरीत्या नोंदवले!' : 'Punched Out successfully!');
      }
      await Promise.all([
        loadAttendance(),
        loadOverview(),
        loadAttendancePolicy()
      ]);
    } catch (err) {
      console.error('Attendance error:', err);
      // Fallback to offline queue on network failures
      if (!isNetworkOnline() || err?.code === 'ERR_NETWORK' || !err?.response) {
        enqueueOfflineItem({
          type: punchMode === 'IN' ? 'ATTENDANCE_IN' : 'ATTENDANCE_OUT',
          label_mr: punchMode === 'IN' ? 'सकाळची उपस्थिती (Punch In)' : 'कर्तव्य समाप्ती (Punch Out)',
          label_en: punchMode === 'IN' ? 'Punch In Attendance' : 'Punch Out Attendance',
          payload: { photo: photoSrc, locationData }
        });
        if (punchMode === 'IN') setAttendanceState('Punched In');
        else setAttendanceState('Completed');
        alert(isMr 
          ? '📶 नेटवर्क उपलब्ध नसल्यामुळे हजेरी ऑफलाइन साठवली आहे. इंटरनेट आल्यावर आपोआप सिंक होईल.' 
          : '📶 Network unavailable. Attendance saved offline and will auto-sync when online.');
        return;
      }
      const msg = err.response?.data?.message || err.message || 'उपस्थिती नोंदवताना त्रुटी आली.';
      alert(msg);
    }
  };

  const handleUpdateComplaintStatus = async (id, newStatus) => {
    try {
      await workerApi.updateComplaintStatus(id, newStatus);
      setComplaintsData((prev) => prev.map((c) => (c.id === id || c.complaint_code === id ? { ...c, status: newStatus } : c)));
      loadOverview();
    } catch (err) {
      console.error('Complaint status update error:', err);
    }
  };

  const handleScheduleMeeting = async () => {
    if (newMeeting.title) {
      if (!isNetworkOnline()) {
        enqueueOfflineItem({
          type: 'MEETING',
          label_mr: `बैठक - ${newMeeting.title}`,
          label_en: `Meeting - ${newMeeting.title}`,
          payload: newMeeting,
        });
        setMeetingsList(prev => [{ ...newMeeting, id: `offline_${Date.now()}`, time: newMeeting.time || 'आज' }, ...prev]);
        setIsSchedulingMeeting(false);
        setNewMeeting({ title: '', time: '', location: '', attendees: '', type: 'Virtual' });
        alert(isMr ? '📶 बैठक ऑफलाइन साठवली! इंटरनेट उपलब्ध झाल्यावर आपोआप डेटाबेसमध्ये जोडली जाईल.' : '📶 Meeting saved offline! Will auto-sync when online.');
        return;
      }

      try {
        await workerApi.scheduleMeeting(newMeeting);
        setIsSchedulingMeeting(false);
        setNewMeeting({ title: '', time: '', location: '', attendees: '', type: 'Virtual' });
        loadMeetings();
        loadOverview();
      } catch (err) {
        console.error('Meeting schedule error:', err);
        if (!isNetworkOnline() || err?.code === 'ERR_NETWORK' || !err?.response) {
          enqueueOfflineItem({
            type: 'MEETING',
            label_mr: `बैठक - ${newMeeting.title}`,
            label_en: `Meeting - ${newMeeting.title}`,
            payload: newMeeting,
          });
          setMeetingsList(prev => [{ ...newMeeting, id: `offline_${Date.now()}`, time: newMeeting.time || 'आज' }, ...prev]);
          setIsSchedulingMeeting(false);
          setNewMeeting({ title: '', time: '', location: '', attendees: '', type: 'Virtual' });
          alert(isMr ? '📶 नेटवर्क खंडित झाले. बैठक ऑफलाइन साठवली आहे.' : '📶 Network error. Meeting saved offline.');
        }
      }
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveProfile = async () => {
    try {
      await workerApi.updateProfile(profileData);
      setIsEditingProfile(false);
      loadProfile();
      loadOverview();
      alert(language === 'mr' ? 'कार्यकर्ता माहिती यशस्वीरीत्या जतन झाली!' : 'Profile updated successfully!');
    } catch (err) {
      console.error('Save profile error:', err);
      alert('माहिती जतन करताना त्रुटी आली.');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  // Toggle Task Completion in Backend
  const toggleTask = async (taskId) => {
    try {
      const res = await workerApi.toggleTask(taskId);
      setTasksList((prev) => prev.map((t) => (t.id === taskId ? { ...t, completed: res.completed } : t)));
      loadOverview();
    } catch (err) {
      console.error('Task toggle error:', err);
    }
  };

  // Follow-up Completion in Backend
  const handleFollowUpDone = async (id, name) => {
    try {
      await workerApi.updateFollowUpStatus(id, 'Completed');
      setFollowUpsList((prev) => prev.map((item) => (item.id === id ? { ...item, status: 'Completed' } : item)));
      addActivity('clipboard', `${name} यांचा पाठपुरावा पूर्ण केला`, '#DCFCE7', 'var(--success)');
      loadOverview();
    } catch (err) {
      console.error('Follow-up error:', err);
    }
  };

  // Helpers for Family Members in Published Survey
  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const bDate = new Date(dobString);
    if (isNaN(bDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--;
    return age >= 0 ? age : '';
  };

  const handleWorkerMemberChange = (id, field, value) => {
    setSurveyFormData((prev) => {
      const updatedMembers = prev.members.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: value };
        if (field === 'dob') {
          const autoAge = calculateAge(value);
          if (autoAge !== '') updated.age = autoAge;
        }
        return updated;
      });
      const voterCount = updatedMembers.filter((m) => m.has_voter_id === 'YES').length;
      return {
        ...prev,
        members: updatedMembers,
        total_matdar: voterCount > 0 ? voterCount : prev.total_matdar,
      };
    });
  };

  const handleWorkerAddMember = () => {
    setSurveyFormData((prev) => {
      const nextMembers = [
        ...prev.members,
        {
          id: `mem_${Date.now()}`,
          full_name: '',
          dob: '',
          age: '',
          has_voter_id: 'YES',
          voter_id_no: '',
          relation: '',
        },
      ];
      return {
        ...prev,
        members: nextMembers,
        total_matdar: nextMembers.filter((m) => m.has_voter_id === 'YES').length,
      };
    });
  };

  const handleWorkerRemoveMember = (id) => {
    if (surveyFormData.members.length <= 1) return;
    setSurveyFormData((prev) => {
      const nextMembers = prev.members.filter((m) => m.id !== id);
      return {
        ...prev,
        members: nextMembers,
        total_matdar: nextMembers.filter((m) => m.has_voter_id === 'YES').length,
      };
    });
  };

  // Open survey filling modal and prepare default and custom answers
  const handleOpenSurveyModal = (survey) => {
    setActiveSurveyToFill(survey);
    const initialAnswers = {};
    if (Array.isArray(survey.custom_questions)) {
      survey.custom_questions.forEach((q) => {
        if (q.type === 'multi_choice') {
          initialAnswers[q.id] = [];
        } else if (q.type === 'rating') {
          initialAnswers[q.id] = 5;
        } else {
          initialAnswers[q.id] = '';
        }
      });
    }
    setSurveyFormData({
      pramukh_name: '',
      total_matdar: 1,
      phone: '',
      address: '',
      members: [
        {
          id: 'mem_1',
          full_name: '',
          dob: '',
          age: '',
          has_voter_id: 'YES',
          voter_id_no: '',
          relation: 'कुटुंब प्रमुख (Self)',
        },
      ],
      custom_answers: initialAnswers,
    });
  };

  const handleCustomAnswerChange = (questionId, value) => {
    setSurveyFormData((prev) => ({
      ...prev,
      custom_answers: {
        ...prev.custom_answers,
        [questionId]: value,
      },
    }));
  };

  const handleMultiChoiceToggle = (questionId, option) => {
    setSurveyFormData((prev) => {
      const currentList = Array.isArray(prev.custom_answers?.[questionId]) ? prev.custom_answers[questionId] : [];
      const nextList = currentList.includes(option)
        ? currentList.filter((item) => item !== option)
        : [...currentList, option];
      return {
        ...prev,
        custom_answers: {
          ...prev.custom_answers,
          [questionId]: nextList,
        },
      };
    });
  };

  // Submit filled published survey form to backend
  const handleSurveySubmit = async (e) => {
    e.preventDefault();
    if (!surveyFormData.pramukh_name.trim()) {
      alert(language === 'mr' ? 'कृपया कुटुंब प्रमुखाचे नाव भरा.' : 'Please enter Family Head Name.');
      return;
    }

    // Ensure first member has the family head name if left blank
    const sanitizedMembers = [...surveyFormData.members];
    if (sanitizedMembers.length > 0 && !sanitizedMembers[0].full_name?.trim()) {
      sanitizedMembers[0].full_name = surveyFormData.pramukh_name;
    }

    // 1. Direct offline check
    if (!isNetworkOnline()) {
      enqueueOfflineItem({
        type: 'SURVEY',
        label_mr: `मतदार सर्व्हे - ${surveyFormData.pramukh_name}`,
        label_en: `Survey - ${surveyFormData.pramukh_name}`,
        payload: {
          published_form_id: activeSurveyToFill?.id,
          surveyId: activeSurveyToFill?.id,
          pramukh_name: surveyFormData.pramukh_name,
          citizenName: surveyFormData.pramukh_name,
          total_matdar: surveyFormData.total_matdar,
          phone: surveyFormData.phone,
          address: surveyFormData.address,
          members: sanitizedMembers,
          custom_answers: surveyFormData.custom_answers,
        }
      });

      alert(language === 'mr' 
        ? '📶 इंटरनेट जोडणी उपलब्ध नाही.\nसर्व्हे फॉर्म या डिव्हाइसवर स्थानिक पातळीवर सुरक्षित साठवला आहे!\nइंटरनेट सुरू होताच तो आपोआप डेटाबेसमध्ये सिंक होईल.' 
        : '📶 No internet connection.\nSurvey form saved locally on device!\nIt will automatically sync to database when online.');

      setActiveSurveyToFill(null);
      setSurveyFormData({
        pramukh_name: '',
        total_matdar: 1,
        phone: '',
        address: '',
        members: [
          {
            id: 'mem_1',
            full_name: '',
            dob: '',
            age: '',
            has_voter_id: 'YES',
            voter_id_no: '',
            relation: 'कुटुंब प्रमुख (Self)',
          },
        ],
        custom_answers: {},
      });
      return;
    }

    setSubmittingSurvey(true);
    try {
      await workerApi.submitSurvey({
        published_form_id: activeSurveyToFill?.id,
        surveyId: activeSurveyToFill?.id,
        pramukh_name: surveyFormData.pramukh_name,
        citizenName: surveyFormData.pramukh_name,
        total_matdar: surveyFormData.total_matdar,
        phone: surveyFormData.phone,
        address: surveyFormData.address,
        members: sanitizedMembers,
        custom_answers: surveyFormData.custom_answers,
      });

      alert(language === 'mr' ? '✓ मतदार सर्वेक्षण फॉर्म यशस्वीरित्या जमा झाला!' : '✓ Survey submitted successfully!');
      setActiveSurveyToFill(null);
      setSurveyFormData({
        pramukh_name: '',
        total_matdar: 1,
        phone: '',
        address: '',
        members: [
          {
            id: 'mem_1',
            full_name: '',
            dob: '',
            age: '',
            has_voter_id: 'YES',
            voter_id_no: '',
            relation: 'कुटुंब प्रमुख (Self)',
          },
        ],
        custom_answers: {},
      });
      loadSurveys();
      loadOverview();
    } catch (err) {
      console.error('Survey submission error:', err);
      // Fallback: If network failed during submission, save offline safely
      if (!isNetworkOnline() || err?.code === 'ERR_NETWORK' || !err?.response) {
        enqueueOfflineItem({
          type: 'SURVEY',
          label_mr: `मतदार सर्व्हे - ${surveyFormData.pramukh_name}`,
          label_en: `Survey - ${surveyFormData.pramukh_name}`,
          payload: {
            published_form_id: activeSurveyToFill?.id,
            surveyId: activeSurveyToFill?.id,
            pramukh_name: surveyFormData.pramukh_name,
            citizenName: surveyFormData.pramukh_name,
            total_matdar: surveyFormData.total_matdar,
            phone: surveyFormData.phone,
            address: surveyFormData.address,
            members: sanitizedMembers,
            custom_answers: surveyFormData.custom_answers,
          }
        });
        alert(language === 'mr' 
          ? '📶 नेटवर्क खंडित झाले. सर्व्हे माहिती डिव्हाइसवर सुरक्षित साठवली आहे. इंटरनेट आल्यावर आपोआप सिंक होईल.' 
          : '📶 Network disconnected. Survey saved locally and will auto-sync when online.');
        setActiveSurveyToFill(null);
      } else {
        alert(language === 'mr' ? 'सर्व्हे जमा करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.' : 'Failed to submit survey. Please try again.');
      }
    } finally {
      setSubmittingSurvey(false);
    }
  };

  // Cast Live Mock Vote in Backend
  const handleCastVote = async (cand) => {
    if (!hasVoted) {
      try {
        await workerApi.castVote(cand.id, cand.name);
        setHasVoted(true);
        setVotedCandidate(cand.name);
        setViewingCandidate(null);
        loadCandidates();
        loadOverview();
      } catch (err) {
        console.error('Vote error:', err);
        alert(err?.response?.data?.message || 'मतदान नोंदवताना अडचण आली.');
      }
    }
  };

  // Helper to render content based on active tab
  const renderContent = () => {
    if (activeTab === 'Dashboard') {
      const pendingComplaintsCount = complaintsData.filter((c) => c.status === 'Pending').length;
      const pendingTasksCount = tasksList.filter((t) => !t.completed).length;

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
          {/* Executive Subheader / Context Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>🚩 {isMr ? 'कार्यकर्ता व बूथ डॅशबोर्ड' : 'Karyakarta Field Overview Dashboard'}</span>
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  {isMr ? 'थेट माहिती' : 'Live DB Sync'}
                </span>
                <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  🇮🇳 {profileData.assignedWard ? `${isMr ? 'प्रभाग' : 'Ward'} ${profileData.assignedWard}` : 'Sangli Central'}
                </span>
              </div>
              <div style={{ fontSize: '13.5px', color: '#64748b', marginTop: '4px' }}>
                {isMr ? 'तुमच्या प्रभागातील मतदार संपर्क, उपस्थिती आणि दैनंदिन कार्य प्रगती.' : 'Real-time monitoring of booth voter coverage, field tasks, attendance, and civic grievances.'}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <LiveClock isMr={isMr} variant="header" />
              {user?.roles?.some((r) => r === 'ADMIN' || r === 'OFFICER') && (
                <BackButton fallbackPath="/admin" text={isMr ? 'मुख्य प्रशासकीय डॅशबोर्ड' : 'Back to HQ'} />
              )}
            </div>
          </div>

          {/* 4 Crisp SaaS Metric Cards Matching Officer/Admin Design */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {/* 1. Total Assigned */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #3b82f6', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'एकूण नियुक्त मतदार' : 'Total Assigned Voters'}
                </span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={18} />
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
                {dashboardStats.totalAssigned.toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                <span>{dashboardStats.contactRate ? `${dashboardStats.contactRate}% ${isMr ? 'संपर्क पूर्ण' : 'Contact Rate'}` : (isMr ? 'बूथ मतदार' : 'Booth Network')}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8' }}>
                  {isMr ? 'नियुक्त' : 'Assigned'}
                </span>
              </div>
            </div>

            {/* 2. Contacted */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #10b981', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'थेट संपर्क साधलेले' : 'Contacted Voters'}
                </span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <PhoneCall size={18} />
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
                {dashboardStats.contacted.toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                <span>{dashboardStats.supportiveRate ? `${dashboardStats.supportiveRate}% ${isMr ? 'अनुकूल प्रतिसाद' : 'Positive Response'}` : (isMr ? 'प्रत्यक्ष संवाद' : 'Doorstep & Calls')}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#ecfdf5', color: '#059669' }}>
                  {isMr ? 'संपर्कित' : 'Reached'}
                </span>
              </div>
            </div>

            {/* 3. Completed Surveys */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #f97316', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'कुटुंब सर्वेक्षण नोंद' : 'Household Surveys Completed'}
                </span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ClipboardCheck size={18} />
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
                {dashboardStats.surveysCompleted.toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                <span>{isMr ? `उद्दिष्ट: ${dashboardStats.surveysTarget || 100} कुटुंबे` : `Target: ${dashboardStats.surveysTarget || 100} Families`}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c' }}>
                  {isMr ? 'सक्रिय' : 'Active'}
                </span>
              </div>
            </div>

            {/* 4. Supportive Voters */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #8b5cf6', borderRadius: '14px', padding: '18px 20px', boxShadow: '0 2px 6px rgba(15, 23, 42, 0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'अनुकूल मतदार आधार' : 'Supportive Voter Base'}
                </span>
                <span style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={18} />
                </span>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#0f172a', lineHeight: 1.1 }}>
                {dashboardStats.supportive.toLocaleString()}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                <span>{dashboardStats.totalAssigned > 0 ? `${Math.round((dashboardStats.supportive / dashboardStats.totalAssigned) * 100)}% ${isMr ? 'समर्थक कल' : 'Base Sentiment'}` : (isMr ? 'सकारात्मक कल' : 'Positive Base')}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', background: '#faf5ff', color: '#7e22ce' }}>
                  {isMr ? 'अनुकूल' : 'Positive'}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Cross-Module Status Strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
            {/* Quick Grievance Pill */}
            <div
              onClick={() => setActiveTab('Complaints')}
              style={{
                cursor: 'pointer',
                background: '#ffffff',
                border: '1px solid #fed7aa',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#ea580c')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#fed7aa')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <AlertCircle size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    {isMr ? 'नागरिकांच्या समस्या व विनंत्या' : 'Citizen Grievances Desk'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#c2410c' }}>
                    {pendingComplaintsCount > 0 ? `${pendingComplaintsCount} ${isMr ? 'तक्रारी प्रलंबित' : 'Pending Resolution'}` : (isMr ? 'सर्व तक्रारी निकाली' : 'All Grievances Resolved')}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            {/* Quick Contacts Pill */}
            <div
              onClick={() => setActiveTab('Contact & Meetings')}
              style={{
                cursor: 'pointer',
                background: '#ffffff',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#16a34a')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#bbf7d0')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdf4', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Calendar size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    {isMr ? 'नागरिक संपर्क व बैठका' : 'Citizen Contacts & Meetings'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#15803d' }}>
                    {votersList.length} {isMr ? 'मतदार नोंद • भेटींचे नियोजन' : 'Voters in Directory'}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            {/* Quick Tasks Pill */}
            <div
              onClick={() => setActiveTab('Tasks')}
              style={{
                cursor: 'pointer',
                background: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#2563eb')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#bfdbfe')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckSquare size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    {isMr ? 'कार्ये व मतदार पाठपुरावा' : 'Field Tasks & Follow-ups'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#1d4ed8' }}>
                    {pendingTasksCount} {isMr ? 'कार्ये अपूर्ण' : 'Pending Checklist Items'}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>

            {/* Quick Attendance Pill */}
            <div
              onClick={() => setActiveTab('Attendance')}
              style={{
                cursor: 'pointer',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#64748b')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f8fafc', color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarCheck size={17} />
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>
                    {isMr ? 'उपस्थिती व सेल्फी पंच' : 'Geo Attendance Status'}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {attendanceState === 'Punched In' ? (isMr ? '🟢 ड्युटी सुरू (हजर)' : '🟢 On Duty (Punched In)') : (isMr ? 'हजेरी नोंद आवश्यक' : 'Check-In Required')}
                  </div>
                </div>
              </div>
              <ChevronRight size={16} color="#94a3b8" />
            </div>
          </div>

          {/* Tiranga Hero Card */}
          <div
            style={{
              position: 'relative',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #0f2b5c 0%, #000080 50%, #0a192f 100%)',
              color: '#ffffff',
              padding: '24px 26px',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(0, 0, 128, 0.15)',
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
                <span style={{ fontSize: '11px', fontWeight: '800', background: 'rgba(255, 255, 255, 0.18)', padding: '3px 9px', borderRadius: '10px', letterSpacing: '0.5px' }}>
                  🇮🇳 {isMr ? 'बूथ कार्य संचालन कक्ष' : 'BOOTH FIELD COMMAND CENTER'}
                </span>
                <span style={{ fontSize: '12px', color: '#93c5fd' }}>
                  • {profileData.assignedWard ? `${isMr ? 'प्रभाग' : 'Ward'} ${profileData.assignedWard}` : 'Sangli Central Ward'}
                </span>
              </div>
              <h2 style={{ fontSize: '21px', fontWeight: '800', margin: '0 0 6px 0', color: '#ffffff', lineHeight: 1.25 }}>
                {isMr ? 'सशक्त समाज • उज्ज्वल भविष्य • अविरत जनसेवा' : 'Stronger Communities • Brighter Tomorrow • Public Service'}
              </h2>
              <p style={{ margin: 0, fontSize: '13px', color: '#e2e8f0', lineHeight: 1.5 }}>
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
                  background: 'rgba(255, 255, 255, 0.15)',
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
              <button
                type="button"
                onClick={() => setActiveTab('Contact & Meetings')}
                style={{
                  background: 'rgba(255, 255, 255, 0.15)',
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
                <Calendar size={16} />
                <span>{isMr ? 'नागरिक संपर्क' : 'Voter Directory'}</span>
              </button>
            </div>
          </div>

          {/* Bottom Layout */}
          <div className="bottom-layout">
            {/* Chart Section */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <h2 className="card-title">
                  {isMr ? 'मतदार संपर्क कल' : 'Voter Outreach Trends'}
                </h2>
                <div className="chart-header">
                  <div className="chart-legend">
                    <div className="legend-dot"></div>
                    <span>{isMr ? 'संपर्क साधलेले' : 'Contacted'}</span>
                  </div>
                  <select className="select-dropdown">
                    <option>{isMr ? 'गेले ६ महिने' : 'Last 6 Months'}</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={voterData} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Bar dataKey="value1" fill="#F97316" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="value2" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activities List Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">
                  {isMr ? 'अलीकडील घडामोडी' : 'Recent Field Activities'}
                </h2>
                <button className="btn-outline">
                  {isMr ? 'सर्व पहा' : 'View All'}
                </button>
              </div>
              <div className="activity-list">
                {activities.map((item) => (
                  <div key={item.id} className="activity-item">
                    <div className="activity-icon" style={{ backgroundColor: item.bg_color || item.bgColor || '#E0E7FF', color: item.color || '#F97316' }}>
                      {item.type === 'users' ? <Users size={16} /> : item.type === 'clock' ? <Clock size={16} /> : <ClipboardCheck size={16} />}
                    </div>
                    <div className="activity-content">
                      <div className="activity-title">{item.title}</div>
                      <div className="activity-time">{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'User Profile') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Subheader & Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>👤 {isMr ? 'अधिकृत कार्यकर्ता प्रोफाइल व ओळखपत्र' : 'Official Karyakarta Profile & ID'}</span>
                <span style={{ fontSize: '11px', background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                  {isMr ? 'सक्रिय व अधिकृत' : 'Verified'}
                </span>
              </div>
              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                {isMr ? 'वैयक्तिक तपशील, नियुक्त प्रभाग, मतदान केंद्र आणि पक्ष कार्य अहवाल.' : 'Personal information, assigned ward & booth, and service record.'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isEditingProfile ? (
                <>
                  <button
                    type="button"
                    className="karyakarta-btn karyakarta-btn-outline"
                    onClick={() => setIsEditingProfile(false)}
                  >
                    <X size={15} />
                    <span>{t('cancel')}</span>
                  </button>
                  <button
                    type="button"
                    className="karyakarta-btn karyakarta-btn-success"
                    onClick={saveProfile}
                  >
                    <Save size={15} />
                    <span>{t('saveChanges')}</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="karyakarta-btn karyakarta-btn-primary"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit2 size={15} />
                    <span>{t('editProfile')}</span>
                  </button>
                  <button
                    type="button"
                    className="karyakarta-btn karyakarta-btn-outline"
                    onClick={() => window.print()}
                    title={isMr ? 'ओळखपत्र प्रिंट करा' : 'Print ID Card'}
                  >
                    <span>🖨️</span>
                    <span>{isMr ? 'प्रिंट / डाउनलोड' : 'Print ID'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* OFFICIAL DIGITAL ID CARD (डिजिटल ओळखपत्र) */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
              position: 'relative',
            }}
          >
            {/* Top Indian Tricolor Stripe */}
            <div
              style={{
                height: '4px',
                background: 'linear-gradient(90deg, #FF671F 0%, #FFFFFF 50%, #138808 100%)',
              }}
            />

            {/* Card Header Background */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f2b5c 0%, #000080 60%, #1e3a8a 100%)',
                padding: '24px 28px',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '16px',
                position: 'relative',
              }}
            >
              {/* Ashoka Chakra Background Watermark */}
              <div
                style={{
                  position: 'absolute',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  opacity: 0.12,
                  pointerEvents: 'none',
                }}
              >
                <svg width="140" height="140" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="50" cy="50" r="10" fill="none" stroke="#ffffff" strokeWidth="2" />
                  {Array.from({ length: 24 }).map((_, i) => (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 46 * Math.cos((i * 15 * Math.PI) / 180)}
                      y2={50 + 46 * Math.sin((i * 15 * Math.PI) / 180)}
                      stroke="#ffffff"
                      strokeWidth="1.2"
                    />
                  ))}
                </svg>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', position: 'relative', zIndex: 2 }}>
                {/* Avatar with Status Ring */}
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '76px',
                      height: '76px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #FF671F 0%, #ea580c 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      fontWeight: '900',
                      border: '3px solid #ffffff',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                    }}
                  >
                    {(profileData.fullName || user?.full_name || 'K').charAt(0)}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid #ffffff',
                    }}
                    title={isMr ? 'सक्रिय कार्यकर्ता' : 'Active'}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <h2 style={{ fontSize: '22px', fontWeight: '900', margin: 0, color: '#ffffff' }}>
                      {profileData.fullName || user?.full_name || 'कार्यकर्ता'}
                    </h2>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '750',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        border: '1px solid rgba(255, 255, 255, 0.4)',
                        color: '#ffffff',
                      }}
                    >
                      {profileData.employeeCode || 'WRK-0001'}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', color: '#fed7aa', fontWeight: '700', marginTop: '3px' }}>
                    🚩 {profileData.responsibility || (isMr ? 'बूथ समन्वयक व प्रभाग कार्यकर्ता' : 'Ward & Booth Coordinator')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px', color: '#cbd5e1', marginTop: '6px', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} color="#f97316" /> {profileData.address || 'सांगली, महाराष्ट्र'}
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Phone size={13} color="#10b981" /> {profileData.phone || user?.phone || '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Badges Column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end', position: 'relative', zIndex: 2 }}>
                <span
                  style={{
                    fontSize: '11.5px',
                    fontWeight: '800',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                  }}
                >
                  <span>✓</span>
                  <span>{isMr ? 'अधिकृत व सक्रिय' : 'Verified Active'}</span>
                </span>
                <span style={{ fontSize: '11px', color: '#cbd5e1' }}>
                  {isMr ? 'सदस्यता नोंद:' : 'Joined:'} {profileData.joinDate || '01 Jan 2026'}
                </span>
              </div>
            </div>

            {/* Quick Territory Info Strip */}
            <div
              style={{
                background: '#f8fafc',
                padding: '14px 24px',
                borderTop: '1px solid #e2e8f0',
                borderBottom: '1px solid #e2e8f0',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '12px',
                fontSize: '12.5px',
              }}
            >
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{isMr ? 'विधानसभा मतदारसंघ' : 'Assembly Constituency'}</span>
                <span style={{ fontWeight: '750', color: '#0f172a' }}>🏛️ २८२ — सांगली विधानसभा</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{isMr ? 'नियुक्त प्रभाग' : 'Assigned Ward'}</span>
                <span style={{ fontWeight: '750', color: '#0f172a' }}>📍 {profileData.assignedWard || (isMr ? 'प्रभाग क्र. १२' : 'Ward 12')}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{isMr ? 'प्राथमिक बूथ' : 'Primary Booths'}</span>
                <span style={{ fontWeight: '750', color: '#0f172a' }}>🗳️ {profileData.primaryBooths || (isMr ? 'बूथ क्र. १०१, १०२' : 'Booths 101, 102')}</span>
              </div>
              <div>
                <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{isMr ? 'मतदार ओळखपत्र क्र.' : 'Voter ID (EPIC)'}</span>
                <span style={{ fontWeight: '750', color: '#0f172a', fontFamily: 'monospace' }}>🪪 {profileData.epic || 'MH/44/082104'}</span>
              </div>
            </div>
          </div>

          {/* 4 FIELD PERFORMANCE & ACTIVITY METRICS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #3b82f6', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'एकूण नियुक्त मतदार' : 'Assigned Voters'}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{dashboardStats.totalAssigned.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '600', marginTop: '4px' }}>{dashboardStats.contactRate}% {isMr ? 'संपर्क पूर्ण' : 'Done'}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #10b981', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'थेट संपर्क साधलेले' : 'Contacted Voters'}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{dashboardStats.contacted.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', marginTop: '4px' }}>{isMr ? 'थेट घराघरात संवाद' : 'Direct Visits'}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #8b5cf6', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'पूर्ण केलेले सर्व्हे' : 'Surveys Completed'}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{dashboardStats.surveysCompleted.toLocaleString()}</div>
              <div style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '600', marginTop: '4px' }}>{isMr ? 'कुटुंब सर्वेक्षण नोंद' : 'Household Records'}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3px solid #f97316', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.03)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'हजेरी दर्जा' : 'Attendance Score'}</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>१००%</div>
              <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: '600', marginTop: '4px' }}>{isMr ? 'नियमित व समयबद्ध' : 'Punctual & Regular'}</div>
            </div>
          </div>

          {/* 2-COLUMN STRUCTURED FORM & TERRITORY DETAILS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* COLUMN 1: Personal & Contact Information */}
            <div className="karyakarta-card">
              <div className="karyakarta-card-header">
                <span className="karyakarta-card-title">
                  <User size={18} color="#2563eb" />
                  <span>{isMr ? 'वैयक्तिक व संपर्क तपशील' : 'Personal & Contact Information'}</span>
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{isMr ? 'थेट माहिती' : 'Verified'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {t('fullName')} *
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="fullName"
                      className="karyakarta-input"
                      value={profileData.fullName}
                      onChange={handleProfileChange}
                      placeholder={isMr ? 'पूर्ण नाव प्रविष्ट करा' : 'Enter full name'}
                    />
                  ) : (
                    <div style={{ fontSize: '13.5px', fontWeight: '700', color: '#0f172a', padding: '6px 0' }}>
                      {profileData.fullName || '-'}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      {t('dob')}
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="date"
                        name="dob"
                        className="karyakarta-input"
                        value={profileData.dob}
                        onChange={handleProfileChange}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', color: '#0f172a', padding: '6px 0' }}>
                        {profileData.dob ? new Date(profileData.dob).toLocaleDateString() : '-'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      {t('phoneNumber')} *
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="phone"
                        className="karyakarta-input"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder={isMr ? '१० अंकी मोबाइल' : 'Mobile number'}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', color: '#0f172a', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Phone size={14} color="#16a34a" />
                        <span style={{ fontWeight: '700' }}>{profileData.phone || '-'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {t('emailAddress')}
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="email"
                      name="email"
                      className="karyakarta-input"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      placeholder={isMr ? 'ईमेल आयडी' : 'Email address'}
                    />
                  ) : (
                    <div style={{ fontSize: '13px', color: '#0f172a', padding: '6px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Mail size={14} color="#2563eb" />
                      <span>{profileData.email || '-'}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {t('residentialAddress')}
                  </label>
                  {isEditingProfile ? (
                    <textarea
                      name="address"
                      className="karyakarta-input"
                      rows="2"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      placeholder={isMr ? 'संपूर्ण निवासी पत्ता' : 'Residential address'}
                    />
                  ) : (
                    <div style={{ fontSize: '13px', color: '#334155', padding: '6px 0', lineHeight: 1.4 }}>
                      {profileData.address || '-'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* COLUMN 2: Political & Booth Assignment */}
            <div className="karyakarta-card">
              <div className="karyakarta-card-header">
                <span className="karyakarta-card-title">
                  <Shield size={18} color="#ea580c" />
                  <span>{isMr ? 'राजकीय व निवडणूक कार्यक्षेत्र तपशील' : 'Political & Booth Assignment'}</span>
                </span>
                <span style={{ fontSize: '11px', background: '#fff7ed', color: '#ea580c', padding: '2px 8px', borderRadius: '10px', fontWeight: '700' }}>
                  {isMr ? 'अ‍ॅडमिन मान्यताप्राप्त' : 'Admin Assigned'}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {t('assignedWard')}
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="assignedWard"
                      className="karyakarta-input"
                      value={profileData.assignedWard}
                      onChange={handleProfileChange}
                      placeholder={isMr ? 'उदा. प्रभाग क्र. १२' : 'Ward number'}
                    />
                  ) : (
                    <div style={{ fontSize: '13.5px', fontWeight: '750', color: '#0f172a', padding: '6px 0' }}>
                      {profileData.assignedWard || (isMr ? 'प्रभाग क्र. १२ — सांगली' : 'Ward 12 - Sangli')}
                    </div>
                  )}
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                    {t('primaryBooths')}
                  </label>
                  {isEditingProfile ? (
                    <input
                      type="text"
                      name="primaryBooths"
                      className="karyakarta-input"
                      value={profileData.primaryBooths}
                      onChange={handleProfileChange}
                      placeholder={isMr ? 'उदा. बूथ १०१, १०२' : 'Assigned booths'}
                    />
                  ) : (
                    <div style={{ fontSize: '13px', color: '#0f172a', padding: '6px 0' }}>
                      {profileData.primaryBooths || (isMr ? 'बूथ क्र. १०१, बूथ क्र. १०२ (शाळा क्र. ४)' : 'Booths 101, 102')}
                    </div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      {t('epic')}
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="text"
                        name="epic"
                        className="karyakarta-input"
                        value={profileData.epic}
                        onChange={handleProfileChange}
                        placeholder={isMr ? 'मतदार ओळखपत्र क्र.' : 'Voter ID'}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace', padding: '6px 0' }}>
                        {profileData.epic || 'MH/44/082104'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '4px' }}>
                      {t('joinDate')}
                    </label>
                    {isEditingProfile ? (
                      <input
                        type="date"
                        name="joinDate"
                        className="karyakarta-input"
                        value={profileData.joinDate}
                        onChange={handleProfileChange}
                      />
                    ) : (
                      <div style={{ fontSize: '13px', color: '#0f172a', padding: '6px 0' }}>
                        {profileData.joinDate ? new Date(profileData.joinDate).toLocaleDateString() : '-'}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => alert(isMr ? 'पासवर्ड बदलण्याची लिंक आपल्या अधिकृत मोबाइलवर पाठवली आहे.' : 'Password reset link sent to mobile.')}
                    className="karyakarta-btn karyakarta-btn-outline"
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <Shield size={14} />
                    <span>{t('changePassword')}</span>
                  </button>

                  <span style={{ fontSize: '11px', color: '#64748b' }}>
                    🔒 {isMr ? 'सुरक्षित प्रमाणीकरण' : 'Secure Auth'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Contact & Meetings') {
      const supportiveCount = votersList.filter((c) => c.status === 'Supportive').length;
      const undecidedCount = votersList.filter((c) => c.status === 'Undecided').length;
      const needsInfoCount = votersList.filter((c) => c.status === 'Needs Info').length;

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
          {/* Header */}
          <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Calendar size={26} color="#0284c7" />
                <span>{isMr ? 'नागरिक संपर्क व बैठका' : 'Citizen Contacts & Outreach Meetings'}</span>
              </h1>
              <div className="page-subtitle">
                {isMr ? 'मतदार संपर्क यादी, प्रत्यक्ष भेट नोंद आणि मोहिमेच्या बैठकांचे नियोजन.' : 'Voter directory, doorstep visit logging, voter sentiment tracking, and campaign meeting coordination.'}
              </div>
            </div>

            {/* Sub-tab Navigation */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#ffffff', padding: '4px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <button 
                type="button"
                onClick={() => setContactTab('contacts')}
                style={{ 
                  padding: '7px 18px', 
                  borderRadius: '7px', 
                  border: 'none', 
                  background: contactTab === 'contacts' ? '#0284c7' : 'transparent', 
                  color: contactTab === 'contacts' ? '#ffffff' : '#475569', 
                  fontWeight: 700, 
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                👥 {isMr ? 'मतदार संपर्क यादी' : 'Voter Directory'} ({votersList.length})
              </button>
              <button 
                type="button"
                onClick={() => setContactTab('meetings')}
                style={{ 
                  padding: '7px 18px', 
                  borderRadius: '7px', 
                  border: 'none', 
                  background: contactTab === 'meetings' ? '#0284c7' : 'transparent', 
                  color: contactTab === 'meetings' ? '#ffffff' : '#475569', 
                  fontWeight: 700, 
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                🗓️ {isMr ? 'आगामी बैठका' : 'Meetings & Gatherings'} ({meetingsList.length})
              </button>
            </div>
          </div>

          {contactTab === 'contacts' && (() => {
            const filteredContacts = votersList.filter((contact) => {
              const matchesSentiment = contactSentimentFilter === 'All' || contact.status === contactSentimentFilter;
              if (!matchesSentiment) return false;
              if (!contactSearchQuery.trim()) return true;
              const q = contactSearchQuery.toLowerCase();
              return (
                (contact.name && contact.name.toLowerCase().includes(q)) ||
                (contact.phone && contact.phone.includes(q)) ||
                (contact.ward && contact.ward.toLowerCase().includes(q)) ||
                (contact.status && contact.status.toLowerCase().includes(q))
              );
            });

            return (
              <>
                {/* 4 Quick Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
                  <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #0284c7', borderRadius: '12px', padding: '14px 18px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                      {isMr ? 'एकूण नोंदवलेले मतदार' : 'Total Voters in Directory'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                      {votersList.length}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderTop: '3.5px solid #16a34a', borderRadius: '12px', padding: '14px 18px' }}>
                    <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
                      {isMr ? 'अनुकूल मतदार (Supportive)' : 'Supportive Voters'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>
                      {supportiveCount}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderTop: '3.5px solid #ea580c', borderRadius: '12px', padding: '14px 18px' }}>
                    <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '700' }}>
                      {isMr ? 'अनिर्णित मतदार (Undecided)' : 'Undecided / Swing'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#c2410c', marginTop: '4px' }}>
                      {undecidedCount}
                    </div>
                  </div>

                  <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderTop: '3.5px solid #ca8a04', borderRadius: '12px', padding: '14px 18px' }}>
                    <div style={{ fontSize: '12px', color: '#a16207', fontWeight: '700' }}>
                      {isMr ? 'माहिती / भेट आवश्यक (Needs Info)' : 'Needs Follow-Up'}
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#a16207', marginTop: '4px' }}>
                      {needsInfoCount}
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {['All', 'Supportive', 'Undecided', 'Needs Info'].map((filterVal) => (
                      <button
                        key={filterVal}
                        type="button"
                        onClick={() => setContactSentimentFilter(filterVal)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: 'none',
                          background: contactSentimentFilter === filterVal ? '#0284c7' : '#f1f5f9',
                          color: contactSentimentFilter === filterVal ? '#ffffff' : '#475569',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {filterVal === 'All' ? (isMr ? 'सर्व मतदार' : 'All Voters') : filterVal === 'Supportive' ? (isMr ? '🟢 अनुकूल' : '🟢 Supportive') : filterVal === 'Undecided' ? (isMr ? '⚪ अनिर्णित' : '⚪ Undecided') : (isMr ? '🟡 माहिती आवश्यक' : '🟡 Needs Info')}
                      </button>
                    ))}
                  </div>

                  <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                    <input 
                      type="text" 
                      placeholder={isMr ? "नाव, फोन किंवा प्रभाग शोधा..." : "Search voters by name, phone, or ward..."}
                      value={contactSearchQuery}
                      onChange={(e) => setContactSearchQuery(e.target.value)}
                      style={{ 
                        width: '100%', 
                        padding: '7px 24px 7px 30px', 
                        borderRadius: '8px', 
                        border: '1px solid #cbd5e1', 
                        fontSize: '12px', 
                        outline: 'none', 
                        boxSizing: 'border-box' 
                      }} 
                    />
                    {contactSearchQuery && (
                      <button 
                        type="button" 
                        onClick={() => setContactSearchQuery('')} 
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Table Container */}
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>{isMr ? 'मतदाराचे नाव' : 'Voter / Citizen Name'}</th>
                          <th>{isMr ? 'मोबाईल नंबर' : 'Mobile Number'}</th>
                          <th>{isMr ? 'बूथ / प्रभाग' : 'Booth / Ward'}</th>
                          <th>{isMr ? 'राजकीय कल / स्थिती' : 'Political Sentiment'}</th>
                          <th style={{ textAlign: 'right' }}>{isMr ? 'कृती' : 'Actions'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContacts.length > 0 ? (
                          filteredContacts.map((contact, i) => (
                            <tr key={contact.id || i}>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                    {contact.name.charAt(0)}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{contact.name}</div>
                                    <div style={{ fontSize: '11px', color: '#64748b' }}>
                                      {contact.contacted ? (isMr ? '✓ संपर्क पूर्ण' : '✓ Contacted') : (isMr ? 'संपर्क बाकी' : 'Pending Contact')}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ color: '#334155', fontWeight: 600 }}>📞 {contact.phone}</td>
                              <td>
                                <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                                  {contact.ward}
                                </span>
                              </td>
                              <td>
                                <span className={`badge-status ${contact.status === 'Supportive' ? 'status-completed' : contact.status === 'Undecided' ? 'status-pending' : 'status-progress'}`}>
                                  {contact.status === 'Supportive' ? (isMr ? '🟢 अनुकूल' : '🟢 Supportive') : contact.status === 'Needs Info' ? (isMr ? '🟡 माहिती आवश्यक' : '🟡 Needs Info') : contact.status === 'Opposed' ? (isMr ? '🔴 प्रतिकूल' : '🔴 Opposed') : (isMr ? '⚪ अनिर्णित' : '⚪ Undecided')}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                  <button
                                    className="icon-btn"
                                    title={isMr ? "मतदार प्रत्यक्ष भेट नोंदवा" : "Record Doorstep Visit Log"}
                                    style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                                    onClick={() => {
                                      setActiveVisitContact(contact);
                                      setVisitFormData({
                                        name: contact.name,
                                        phone: contact.phone || '',
                                        status: contact.status || 'Supportive',
                                        notes: '',
                                        location: currentCoords?.address || '',
                                      });
                                    }}
                                  >
                                    <CalendarCheck size={16} />
                                  </button>
                                  <button 
                                    className="icon-btn icon-btn-primary" 
                                    title={isMr ? "कॉल करा" : "Call Voter"} 
                                    onClick={() => alert(`Calling ${contact.name} (${contact.phone})...`)}
                                  >
                                    <PhoneCall size={16} color="var(--primary)" />
                                  </button>
                                  <button 
                                    className="icon-btn icon-btn-success" 
                                    title={isMr ? "व्हॉट्सॲप संवाद" : "WhatsApp Chat"} 
                                    onClick={() => alert(`Opening WhatsApp chat for ${contact.phone}...`)}
                                  >
                                    <MessageCircle size={16} color="var(--success)" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                              {isMr ? 'कोणताही मतदार संपर्क आढळला नाही.' : 'No voter contacts found matching criteria.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Visit Log Recording Modal */}
                {activeVisitContact && (
                  <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(15, 23, 42, 0.72)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px'
                  }}>
                    <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '500px', width: '100%', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🤝</span>
                          <span>{isMr ? 'मतदार प्रत्यक्ष भेट नोंद (Visit Log)' : 'Record Doorstep Voter Visit Log'}</span>
                        </h3>
                        <button type="button" onClick={() => setActiveVisitContact(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
                      </div>

                      <form onSubmit={handleSaveVisitLog} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                            {isMr ? 'मतदाराची माहिती' : 'Voter Information'}
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                            {activeVisitContact.name} ({activeVisitContact.phone || (isMr ? 'फोन नाही' : 'No Phone')})
                          </div>
                          <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                            {activeVisitContact.ward}
                          </div>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            {isMr ? 'राजकीय कल / मतदाराची भावना *' : 'Voter Political Sentiment / Response *'}
                          </label>
                          <select 
                            className="form-input" 
                            value={visitFormData.status} 
                            onChange={(e) => setVisitFormData({ ...visitFormData, status: e.target.value })}
                          >
                            <option value="Supportive">🟢 {isMr ? 'अनुकूल / पाठीराखा (Supportive)' : 'Supportive (In Favor)'}</option>
                            <option value="Undecided">⚪ {isMr ? 'अनिर्णित / विचार करत आहेत (Undecided)' : 'Undecided / Neutral'}</option>
                            <option value="Needs Info">🟡 {isMr ? 'माहिती / भेट आवश्यक (Needs Info)' : 'Needs Info / Follow-Up Visit'}</option>
                            <option value="Opposed">🔴 {isMr ? 'प्रतिकूल (Opposed)' : 'Opposed (Leaning Elsewhere)'}</option>
                          </select>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            {isMr ? 'भेटीतील चर्चेचे महत्त्वाचे मुद्दे / अभिप्राय *' : 'Discussion Notes & Feedback *'}
                          </label>
                          <textarea
                            rows="3"
                            required
                            className="form-input"
                            placeholder={isMr ? "उदा. पाणी पुरवठ्याची समस्या मांडली, उमेदवाराला मत देण्याचे आश्वासन दिले..." : "Enter key voter issues, discussions, commitments..."}
                            value={visitFormData.notes}
                            onChange={(e) => setVisitFormData({ ...visitFormData, notes: e.target.value })}
                          />
                        </div>

                        <div style={{ fontSize: '11.5px', color: '#0369a1', background: '#e0f2fe', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={15} color="#0284c7" />
                          <span>📍 {currentCoords?.address || (isMr ? 'सांगली प्रभाग (GPS स्थान आपोआप जोडले जाईल)' : 'GPS Coordinates will be tagged automatically')}</span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                          <button type="button" className="btn-outline" onClick={() => setActiveVisitContact(null)}>
                            {t('cancel')}
                          </button>
                          <button type="submit" className="btn-success" style={{ fontWeight: 750, padding: '8px 20px' }}>
                            ✓ {isMr ? 'भेट जतन करा' : 'Save Visit Log'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {contactTab === 'meetings' && (
            <div className="card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    {isSchedulingMeeting ? (isMr ? 'नवीन बैठक निश्चित करा' : 'Schedule New Campaign Meeting') : (isMr ? 'आगामी बैठका व संवाद' : 'Upcoming Campaign Meetings')}
                  </h2>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {isMr ? 'कार्यकर्ता व मतदार बैठकांचे नियोजन करा.' : 'Plan, coordinate, and review local booth gathering sessions.'}
                  </div>
                </div>
                {!isSchedulingMeeting && (
                  <button className="btn-primary" onClick={() => setIsSchedulingMeeting(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} />
                    <span>{isMr ? '+ नवीन बैठक निश्चित करा' : '+ Schedule Meeting'}</span>
                  </button>
                )}
              </div>
              
              {isSchedulingMeeting ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '650px', marginTop: '10px' }}>
                  <div className="info-group">
                    <label className="info-label">{isMr ? 'बैठकीचा विषय *' : 'Meeting Title *'}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder={isMr ? "उदा. बूथ क्र. २ मतदार बैठक" : "e.g., Booth 2 Citizens Consultation"} 
                      value={newMeeting.title} 
                      onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})} 
                    />
                  </div>
                  <div className="info-row">
                    <div className="info-group">
                      <label className="info-label">{isMr ? 'तारीख व वेळ *' : 'Date & Time *'}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder={isMr ? "उदा. उद्या, सायं ५:००" : "e.g., Tomorrow, 5:00 PM"} 
                        value={newMeeting.time} 
                        onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})} 
                      />
                    </div>
                    <div className="info-group">
                      <label className="info-label">{isMr ? 'बैठकीचा प्रकार' : 'Meeting Format'}</label>
                      <select className="form-input" value={newMeeting.type} onChange={(e) => setNewMeeting({...newMeeting, type: e.target.value})}>
                        <option value="In-person">{isMr ? 'प्रत्यक्ष भेट (In-person)' : 'In-person Gathering'}</option>
                        <option value="Virtual">{isMr ? 'व्हर्च्युअल / ऑनलाइन (Virtual)' : 'Virtual / Video Call'}</option>
                      </select>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-group">
                      <label className="info-label">{isMr ? 'ठिकाण / पत्ता / लिंक' : 'Location or Meeting Link'}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder={isMr ? "पत्ता किंवा Google Meet लिंक" : "Address or video link"} 
                        value={newMeeting.location} 
                        onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})} 
                      />
                    </div>
                    <div className="info-group">
                      <label className="info-label">{isMr ? 'अपेक्षित उपस्थिती' : 'Expected Attendees'}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder={isMr ? "उदा. १५ मतदार" : "e.g., 15 Citizens"} 
                        value={newMeeting.attendees} 
                        onChange={(e) => setNewMeeting({...newMeeting, attendees: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-outline" onClick={() => setIsSchedulingMeeting(false)}>
                      {t('cancel')}
                    </button>
                    <button className="btn-success" onClick={handleScheduleMeeting}>
                      ✓ {isMr ? 'बैठक सेव्ह करा' : 'Save Meeting'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '12px' }}>
                  {meetingsList.map((meeting, i) => (
                    <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ padding: '8px', backgroundColor: meeting.type === 'Virtual' ? '#E0E7FF' : '#FEF3C7', color: meeting.type === 'Virtual' ? '#2563eb' : '#d97706', borderRadius: '8px' }}>
                          {meeting.type === 'Virtual' ? <Video size={20} /> : <Users size={20} />}
                        </div>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '9999px' }}>
                          {meeting.type}
                        </span>
                      </div>
                      
                      <div>
                        <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{meeting.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12.5px', marginBottom: '4px' }}>
                          <Clock size={14} color="#0284c7" /> {meeting.time}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12.5px' }}>
                          <MapPin size={14} color="#ea580c" /> {meeting.location}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>👥 {meeting.attendees}</span>
                        <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '12px' }}>
                          {isMr ? 'नियोजित' : 'Scheduled'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }


    if (activeTab === 'Attendance') {
      const todayRecord = attendanceHistory && attendanceHistory.length > 0 ? attendanceHistory[0] : null;
      const hasPunchedIn = Boolean(todayRecord?.punch_in_time && todayRecord.punch_in_time !== '-');
      const hasPunchedOut = Boolean(todayRecord?.punch_out_time && todayRecord.punch_out_time !== '-');

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header with Title and IST Live Clock */}
          <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 className="page-title">{isMr ? 'डिजिटल उपस्थिती व जिओ पंच' : 'Geo Attendance Desk'}</h1>
                <span className="karyakarta-badge karyakarta-badge-live">
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
                  {isMr ? 'GPS थेट प्रणाली' : 'GPS Live'}
                </span>
              </div>
              <div className="page-subtitle">
                {isMr ? 'GPS स्थान पडताळणी आणि सेल्फी फेस स्कॅनसह दैनंदिन हजेरी (Punch In व Punch Out) नोंदवा.' : 'Daily attendance with GPS location verification and selfie face scan.'}
              </div>
            </div>

            {/* Live IST Clock Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '8px 16px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              }}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
                <Clock size={18} />
              </div>
              <LiveClock isMr={isMr} variant="card" />
            </div>
          </div>

          {/* Location Policy & GPS Status Strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '14px',
            }}
          >
            {/* Admin Policy Notice */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: attendancePolicy?.is_location_required ? '#ecfdf5' : '#f0f9ff',
                border: attendancePolicy?.is_location_required ? '1px solid #a7f3d0' : '1px solid #bae6fd',
                color: attendancePolicy?.is_location_required ? '#065f46' : '#0369a1',
                fontSize: '12.5px',
                lineHeight: '1.5',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <ShieldCheck size={22} style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ display: 'block', fontSize: '12.5px' }}>
                  {attendancePolicy?.is_location_required ? (isMr ? '📍 अ‍ॅडमिन उपस्थिती धोरण (अनिवार्य स्थान)' : 'Admin Designated Location Enforced') : (isMr ? '🌐 लवचिक उपस्थिती धोरण' : 'Flexible Attendance Policy')}
                </strong>
                <span>
                  {attendancePolicy?.is_location_required
                    ? `${attendancePolicy.location_name || 'सांगली कार्यालय'} (${attendancePolicy.address || 'सांगली'}) • जिओफेन्स मर्यादा: ${attendancePolicy.radius_meters || 500} मीटर`
                    : (isMr ? 'आपण कार्यक्षेत्रातून कोणत्याही ठिकाणाहून हजेरी नोंदवू शकता (Anywhere Attendance Allowed).' : 'You can punch attendance from any field location.')}
                </span>
              </div>
            </div>

            {/* Current Detected Coordinates Strip */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                fontSize: '12.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                <MapPin size={20} color="#2563eb" style={{ flexShrink: 0 }} />
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                    {isMr ? 'सध्याचे GPS स्थान (Current Location)' : 'Current GPS Location'}
                  </div>
                  <div style={{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }} title={currentCoords?.address || 'स्थान मिळवत आहे...'}>
                    {locationDetecting
                      ? (isMr ? '🔄 GPS स्थान शोधत आहे...' : 'Detecting GPS...')
                      : currentCoords?.address
                      ? currentCoords.address
                      : currentCoords?.latitude
                      ? `Lat: ${currentCoords.latitude}, Lng: ${currentCoords.longitude}`
                      : (isMr ? 'स्थान उपलब्ध नाही (Detect Location वर क्लिक करा)' : 'GPS not detected yet')}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="karyakarta-btn karyakarta-btn-secondary"
                onClick={detectCurrentLocation}
                disabled={locationDetecting}
                title="रिफ्रेश स्थान"
                style={{ padding: '6px 12px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
              >
                <RefreshCw size={13} className={locationDetecting ? 'animate-spin' : ''} />
                <span>{isMr ? 'रिफ्रेश GPS' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          {/* PROGRESSIVE PUNCH DESK: SHOWS PUNCH IN, AND AFTER PUNCH IN SHOWS PUNCH OUT THERE */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {/* MAIN PROGRESSIVE ACTION CARD */}
            <div
              className={`attendance-punch-card ${!hasPunchedIn ? 'in-card' : attendanceState === 'Completed' ? '' : 'out-card'}`}
              style={{ minHeight: '320px' }}
            >
              {!hasPunchedIn ? (
                /* STATE 1: NOT PUNCHED IN YET -> SHOW PUNCH IN */
                <>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LogIn size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {isMr ? 'सकाळची हजेरी (Morning Punch In)' : 'Morning Punch In'}
                          </h3>
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                            {isMr ? 'ड्युटी प्रारंभ • उपस्थिती नोंदवा' : 'Start Shift • Check In'}
                          </span>
                        </div>
                      </div>

                      <span className="karyakarta-badge karyakarta-badge-amber">
                        {isMr ? '⚪ हजेरी बाकी' : 'Pending'}
                      </span>
                    </div>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                      {isMr
                        ? 'कामावर रुजू होताना सेल्फी फोटो काढून आणि चालू GPS स्थान निश्चित करून पंच इन नोंदवा.'
                        : 'Start your shift by capturing a live selfie photo and verifying your GPS location.'}
                    </p>

                    <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '12px 14px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                      <MapPin size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentCoords?.address || (isMr ? 'चालू GPS स्थान आपोआप जोडले जाईल' : 'Live GPS coordinates will be captured')}
                      </div>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="punch-btn-in"
                      onClick={startPunchIn}
                    >
                      <LogIn size={18} />
                      <span>{isMr ? '🟢 Punch In करा (सकाळची हजेरी)' : 'Punch In (Start Shift)'}</span>
                    </button>
                    <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
                      {isMr ? '📷 कॅमेरा सेल्फी + GPS स्थान तपासणी' : 'Live Camera Selfie + Geotag'}
                    </div>
                  </div>
                </>
              ) : attendanceState !== 'Completed' ? (
                /* STATE 2: ALREADY PUNCHED IN -> SHOW PUNCH OUT RIGHT THERE! */
                <>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <LogOut size={22} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {isMr ? 'संध्याकाळचे निर्गमन (Evening Punch Out)' : 'Evening Punch Out'}
                          </h3>
                          <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600' }}>
                            {isMr ? 'ड्युटी समाप्ती • निर्गमन नोंदवा' : 'End Shift • Check Out'}
                          </span>
                        </div>
                      </div>

                      <span className="karyakarta-badge karyakarta-badge-live">
                        {isMr ? '🟢 ड्युटी सुरू (On Duty)' : 'On Duty'}
                      </span>
                    </div>

                    {/* Today's Punch In Confirmation Strip */}
                    <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {todayRecord?.punch_in_photo ? (
                          <img
                            src={todayRecord.punch_in_photo}
                            alt="Punch In Selfie"
                            style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #86efac' }}
                          />
                        ) : (
                          <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                            <UserCheck size={20} />
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                            {isMr ? '✓ सकाळची हजेरी नोंद झाली' : 'Punched In Successfully'}
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>
                            ⏰ {todayRecord?.punch_in_time}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={startPunchIn}
                        style={{ background: 'transparent', border: 'none', color: '#059669', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                        title="पुन्हा Punch In अपडेट करा"
                      >
                        {isMr ? 'अपडेट' : 'Update'}
                      </button>
                    </div>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                      {isMr
                        ? 'आपण सध्या ड्युटीवर आहात. दिवसाचे क्षेत्रीय कार्य संपल्यावर आता खालील बटनावर क्लिक करून Punch Out नोंदवा.'
                        : 'Your shift is active. When you finish work today, click below to log your exit punch out.'}
                    </p>
                  </div>

                  <div>
                    <button
                      type="button"
                      className="punch-btn-out"
                      onClick={startPunchOut}
                    >
                      <LogOut size={18} />
                      <span>{isMr ? '🟠 Punch Out करा (संध्याकाळचे निर्गमन)' : 'Punch Out (End Shift)'}</span>
                    </button>
                    <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
                      {isMr ? '⏱️ सेल्फी फोटो व निर्गमन वेळेसह कर्तव्य समाप्त' : 'Duty completion time & exit photo'}
                    </div>
                  </div>
                </>
              ) : (
                /* STATE 3: SHIFT COMPLETED -> BOTH RECORDED */
                <>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                            {isMr ? 'आजचे कर्तव्य पूर्ण (Shift Completed)' : "Today's Shift Completed"}
                          </h3>
                          <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                            {isMr ? 'हजेरी व निर्गमन दोन्ही नोंदवले' : 'Punch In & Punch Out Logged'}
                          </span>
                        </div>
                      </div>

                      <span className="karyakarta-badge karyakarta-badge-live">
                        {isMr ? '✓ पूर्ण झाले' : 'Completed'}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {todayRecord?.punch_in_photo && (
                          <img src={todayRecord.punch_in_photo} alt="Punch In" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }} />
                        )}
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: '700' }}>{isMr ? 'पंच इन' : 'Punch In'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{todayRecord?.punch_in_time}</div>
                        </div>
                      </div>

                      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {todayRecord?.punch_out_photo && (
                          <img src={todayRecord.punch_out_photo} alt="Punch Out" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }} />
                        )}
                        <div>
                          <span style={{ fontSize: '10.5px', color: '#ea580c', fontWeight: '700' }}>{isMr ? 'पंच आउट' : 'Punch Out'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{todayRecord?.punch_out_time}</div>
                        </div>
                      </div>
                    </div>

                    <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                      {isMr
                        ? 'आजचे दैनिक क्षेत्रीय कार्य यशस्वीरीत्या पूर्ण झाले आहे. धन्यवाद!'
                        : 'Your daily field operations have been logged successfully for today. Thank you!'}
                    </p>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="karyakarta-btn karyakarta-btn-secondary"
                      onClick={startPunchOut}
                      style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                    >
                      <RefreshCw size={14} />
                      <span>{isMr ? 'पुन्हा Punch Out अपडेट करा' : 'Re-Punch Out'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* CARD 2: DUTY STATUS & TIMELINE SUMMARY */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                    {isMr ? 'आजची उपस्थिती स्थिती' : "Today's Shift Status"}
                  </h3>
                  <span
                    className={`badge-status ${
                      attendanceState === 'Punched In'
                        ? 'status-progress'
                        : attendanceState === 'Completed'
                        ? 'status-completed'
                        : 'status-pending'
                    }`}
                    style={{ fontSize: '12px', padding: '4px 10px' }}
                  >
                    {attendanceState === 'Punched In'
                      ? (isMr ? '🟢 कामावर हजर (On Duty)' : 'On Duty')
                      : attendanceState === 'Completed'
                      ? (isMr ? '✓ कर्तव्य पूर्ण (Completed)' : 'Completed')
                      : (isMr ? '⚪ उपस्थिती बाकी (Not Started)' : 'Not Started')}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                      {isMr ? 'पंच इन वेळ' : 'Punch In'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {todayRecord?.punch_in_time || '--:--'}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                      {isMr ? 'पंच आउट वेळ' : 'Punch Out'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                      {todayRecord?.punch_out_time && todayRecord.punch_out_time !== '-' ? todayRecord.punch_out_time : '--:--'}
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
                  {attendanceState === 'Completed'
                    ? (isMr ? '🎉 आजचे कर्तव्य यशस्वीरीत्या पूर्ण झाले आहे. धन्यवाद!' : 'Shift completed successfully today. Thank you!')
                    : attendanceState === 'Punched In'
                    ? (isMr ? '👍 आपण सध्या ड्युटीवर आहात. कार्य संपल्यावर वरील Punch Out बटनावर क्लिक करा.' : 'You are currently on duty. Use the Punch Out button above when leaving.')
                    : (isMr ? '📌 कृपया दिवसाचे काम सुरू करण्यासाठी प्रथम Punch In करा.' : 'Please punch in first to begin today\'s shift.')}
                </div>
              </div>

              <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                  {isMr ? 'हजेरी धोरण:' : 'Policy:'} <strong>{attendancePolicy?.is_location_required ? 'स्थान आवश्यक' : 'सर्वत्र मान्य'}</strong>
                </span>
                <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '700' }}>
                  {isMr ? '१००% अचूकता' : '100% Accurate'}
                </span>
              </div>
            </div>
          </div>

          {/* ATTENDANCE CAMERA & GEOLOCATION MODAL */}
          {isScanningFace && (
            <div className="attendance-modal-overlay">
              <div className="attendance-modal-content">
                {/* Modal Header */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: punchMode === 'IN' ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: punchMode === 'IN' ? '#10b981' : '#f97316',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {punchMode === 'IN' ? <LogIn size={18} /> : <LogOut size={18} />}
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                        {punchMode === 'IN'
                          ? (isMr ? 'पंच इन पडताळणी (Punch In Verification)' : 'Punch In Verification')
                          : (isMr ? 'पंच आउट पडताळणी (Punch Out Verification)' : 'Punch Out Verification')}
                      </h3>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                        {isMr ? 'सेल्फी चेहरा स्कॅन व GPS स्थान खात्री' : 'Live Face Scan & GPS Verification'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsScanningFace(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Modal Body / Camera Viewport */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
                  <div
                    style={{
                      position: 'relative',
                      width: '240px',
                      height: '240px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: `6px solid ${punchMode === 'IN' ? '#10b981' : '#f97316'}`,
                      boxShadow: `0 8px 24px ${punchMode === 'IN' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(249, 115, 22, 0.25)'}`,
                      background: '#0f172a',
                    }}
                  >
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      screenshotFormat="image/jpeg"
                      width="100%"
                      height="100%"
                      onUserMediaError={() => setWebcamError(true)}
                      style={{ objectFit: 'cover' }}
                    />

                    {webcamError && (
                      <div
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(15, 23, 42, 0.9)',
                          color: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textAlign: 'center',
                          padding: '16px',
                          fontSize: '12px',
                          gap: '8px',
                        }}
                      >
                        <AlertTriangle size={24} color="#f87171" />
                        <span>कॅमेरा परवानगी आवश्यक आहे किंवा उपलब्ध नाही. ब्राउझरमध्ये कॅमेरा अनुमती द्या.</span>
                      </div>
                    )}

                    {/* Scanning Line Overlay */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(to bottom, transparent 0%, ${punchMode === 'IN' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(249, 115, 22, 0.35)'} 50%, transparent 100%)`,
                        animation: 'scanLine 1.8s infinite linear',
                        zIndex: 10,
                        pointerEvents: 'none',
                      }}
                    />
                  </div>

                  {/* Geolocation & IST timestamp info box */}
                  <div
                    style={{
                      width: '100%',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '12px 14px',
                      fontSize: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b', fontWeight: '700' }}>⏰ {isMr ? 'वेळ व तारीख:' : 'Time & Date:'}</span>
                      <LiveClock isMr={isMr} variant="inline" />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ color: '#64748b', fontWeight: '700', flexShrink: 0 }}>📍 {isMr ? 'GPS स्थान:' : 'GPS Location:'}</span>
                      <span style={{ fontWeight: '700', color: '#0f172a', textAlign: 'right', wordBreak: 'break-word' }}>
                        {currentCoords?.address || (currentCoords?.latitude ? `${currentCoords.latitude}, ${currentCoords.longitude}` : (isMr ? 'स्थान तपासत आहे...' : 'Detecting...'))}
                      </span>
                    </div>

                    {attendancePolicy?.is_location_required && (
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>
                        ✓ अ‍ॅडमिन उपस्थिती स्थान: {attendancePolicy.location_name || 'सांगली कार्यालय'}
                      </div>
                    )}
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                    <button
                      type="button"
                      className="karyakarta-btn karyakarta-btn-secondary"
                      onClick={() => setIsScanningFace(false)}
                      style={{ flex: 1, padding: '12px' }}
                    >
                      {t('cancel')}
                    </button>

                    <button
                      type="button"
                      onClick={confirmPunch}
                      style={{
                        flex: 2,
                        padding: '12px 20px',
                        fontSize: '14.5px',
                        fontWeight: '800',
                        backgroundColor: punchMode === 'IN' ? '#10b981' : '#f97316',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        boxShadow: `0 4px 14px ${punchMode === 'IN' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(249, 115, 22, 0.35)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                      }}
                    >
                      {punchMode === 'IN' ? <LogIn size={18} /> : <LogOut size={18} />}
                      <span>
                        {punchMode === 'IN'
                          ? (isMr ? '✓ Punch In निश्चित करा' : 'Confirm Punch In')
                          : (isMr ? '✓ Punch Out निश्चित करा' : 'Confirm Punch Out')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ATTENDANCE HISTORY REGISTER TABLE */}
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
                  {isMr ? 'उपस्थिती नोंदवही (Attendance History)' : 'Attendance History Register'}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {isMr ? 'मागील १५ दिवसांची हजेरी, वेळ व फोटो तपशील' : 'Past 15 days attendance log with photos'}
                </span>
              </div>
              <span className="karyakarta-badge karyakarta-badge-blue">
                {attendanceHistory.length} {isMr ? 'नोंदी' : 'Records'}
              </span>
            </div>

            <div className="karyakarta-table-wrapper">
              <table className="karyakarta-table">
                <thead>
                  <tr>
                    <th>{isMr ? 'तारीख' : 'Date'}</th>
                    <th>{isMr ? 'पंच इन (Punch In)' : 'Punch In'}</th>
                    <th>{isMr ? 'पंच आउट (Punch Out)' : 'Punch Out'}</th>
                    <th>{isMr ? 'सेल्फी फोटो' : 'Photos'}</th>
                    <th>{isMr ? 'स्थान / ठिकाण' : 'Location'}</th>
                    <th>{isMr ? 'उपस्थिती स्थिती' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceHistory && attendanceHistory.length > 0 ? (
                    attendanceHistory.map((record, i) => (
                      <tr key={record.id || i}>
                        <td style={{ fontWeight: '750', color: '#0f172a' }}>{record.date}</td>
                        <td>
                          <span style={{ color: '#059669', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <LogIn size={13} />
                            {record.punch_in_time || record.punchIn || '-'}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#ea580c', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <LogOut size={13} />
                            {record.punch_out_time || record.punchOut || '-'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            {(record.punch_in_photo || record.punchInPhoto) ? (
                              <div
                                style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}
                                title="Punch In Selfie"
                              >
                                <img
                                  src={record.punch_in_photo || record.punchInPhoto}
                                  alt="Punch In"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(5, 150, 105, 0.85)', color: 'white', fontSize: '8px', textAlign: 'center', fontWeight: '700' }}>
                                  IN
                                </span>
                              </div>
                            ) : null}

                            {(record.punch_out_photo || record.punchOutPhoto) ? (
                              <div
                                style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}
                                title="Punch Out Selfie"
                              >
                                <img
                                  src={record.punch_out_photo || record.punchOutPhoto}
                                  alt="Punch Out"
                                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(234, 88, 12, 0.85)', color: 'white', fontSize: '8px', textAlign: 'center', fontWeight: '700' }}>
                                  OUT
                                </span>
                              </div>
                            ) : null}

                            {!record.punch_in_photo && !record.punch_out_photo && (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>-</span>
                            )}
                          </div>
                        </td>
                        <td style={{ maxWidth: '260px' }}>
                          <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#475569' }} title={record.location_note || record.address || 'सांगली परिसर'}>
                            📍 {record.location_note || record.address || 'सांगली परिसर'}
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status ${record.status === 'Present' ? 'status-completed' : 'status-progress'}`}>
                            {record.status === 'Present' ? (isMr ? 'हजर (Present)' : 'Present') : record.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                        {isMr ? 'कोणतीही हजेरी नोंद उपलब्ध नाही' : 'No attendance history records found'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Voting') {
      return <KarkartaEvmVotingSystem user={user} isMr={isMr} isAdmin={false} />;
    }

    if (activeTab === 'Survey') {
      const activeSurveys = surveysList;

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Page Header */}
          <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ClipboardCheck size={28} color="#2563eb" />
                {language === 'mr' ? 'मतदार कुटुंब सर्वेक्षण डेस्क' : 'Household Survey Desk'}
              </h1>
              <div className="page-subtitle">
                {language === 'mr' 
                  ? 'प्रशासनाकडून तुम्हाला केवळ अधिकृत वाटप केलेले फॉर्म. बॅकएंडमध्ये जमा झालेले व शिल्लक राहिलेले फॉर्म येथे थेट तपासू शकता.' 
                  : 'Survey forms strictly allocated to your account. Track forms saved to backend and pending target allocations.'}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ 
                background: '#eff6ff', 
                color: '#1d4ed8', 
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontWeight: 700, 
                fontSize: '13px', 
                border: '1px solid #bfdbfe',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Shield size={14} />
                {language === 'mr' ? `वाटप केलेले फॉर्म: ${surveyStats.allocatedForms}` : `Allocated Forms: ${surveyStats.allocatedForms}`}
              </span>
              <span style={{ 
                background: '#f0fdf4', 
                color: '#16a34a', 
                padding: '6px 14px', 
                borderRadius: '20px', 
                fontWeight: 700, 
                fontSize: '13px', 
                border: '1px solid #bbf7d0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <CheckCircle2 size={14} />
                {language === 'mr' ? `बॅकएंडमध्ये जतन: ${surveyStats.savedToBackend}` : `Saved in Backend: ${surveyStats.savedToBackend}`}
              </span>
            </div>
          </div>

          {/* Real-time KPI Stats: Allocated to this user & Saved to backend */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
            {/* 1. Allocated Survey Forms to this User */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #bfdbfe',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                color: '#1d4ed8',
                borderRadius: '12px',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <ClipboardCheck size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isMr ? 'वाटप केलेले फॉर्म' : 'Allocated Forms'}
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#1e3a8a', lineHeight: 1.2 }}>
                  {surveyStats.allocatedForms}
                </div>
                <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', marginTop: '2px' }}>
                  ✓ {isMr ? 'केवळ तुम्हाला अधिकृत वाटप' : 'Allocated to this user'}
                </div>
              </div>
            </div>

            {/* 2. Saved to Backend DB by this User */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #bbf7d0',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                color: '#16a34a',
                borderRadius: '12px',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Save size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isMr ? 'बॅकएंडमध्ये जतन झालेले फॉर्म' : 'Saved to Backend DB'}
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#14532d', lineHeight: 1.2 }}>
                  {surveyStats.savedToBackend}
                </div>
                <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
                  ✓ {isMr ? 'डेटाबेसमध्ये सुरक्षित जतन' : 'Saved in backend database'}
                </div>
              </div>
            </div>

            {/* 3. Total Target Households */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #fed7aa',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                color: '#ea580c',
                borderRadius: '12px',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Target size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isMr ? 'एकूण कुटुंब उद्दिष्ट' : 'Allocated Target'}
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#7c2d12', lineHeight: 1.2 }}>
                  {surveyStats.totalTarget}
                </div>
                <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: '600', marginTop: '2px' }}>
                  {isMr ? 'मतदार कुटुंब नोंदणी उद्दिष्ट' : 'Target households count'}
                </div>
              </div>
            </div>

            {/* 4. Remaining / Pending to Complete */}
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.1rem 1.25rem',
              boxShadow: '0 2px 8px rgba(100, 116, 139, 0.06)',
              display: 'flex',
              alignItems: 'center',
              gap: '14px'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                color: '#64748b',
                borderRadius: '12px',
                width: '46px',
                height: '46px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={24} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {isMr ? 'शिल्लक उद्दिष्ट' : 'Remaining Target'}
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: '#334155', lineHeight: 1.2 }}>
                  {Math.max(0, surveyStats.totalTarget - surveyStats.savedToBackend)}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
                  {isMr ? 'उर्वरित फॉर्म भरणे बाकी' : 'Remaining to complete'}
                </div>
              </div>
            </div>
          </div>

          {/* View Switcher: Allocated Forms vs Saved in Backend */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
            <button
              type="button"
              onClick={() => setSurveyActiveView('forms')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: 750,
                fontSize: '13.5px',
                cursor: 'pointer',
                border: 'none',
                background: surveyActiveView === 'forms' ? '#2563eb' : '#f1f5f9',
                color: surveyActiveView === 'forms' ? '#ffffff' : '#475569',
                boxShadow: surveyActiveView === 'forms' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <ClipboardCheck size={16} />
              <span>{isMr ? `वाटप केलेले अधिकृत फॉर्म (${surveysList.length})` : `Allocated Forms (${surveysList.length})`}</span>
            </button>

            <button
              type="button"
              onClick={() => setSurveyActiveView('saved_history')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                borderRadius: '10px',
                fontWeight: 750,
                fontSize: '13.5px',
                cursor: 'pointer',
                border: 'none',
                background: surveyActiveView === 'saved_history' ? '#16a34a' : '#f1f5f9',
                color: surveyActiveView === 'saved_history' ? '#ffffff' : '#475569',
                boxShadow: surveyActiveView === 'saved_history' ? '0 2px 6px rgba(22,163,74,0.25)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Save size={16} />
              <span>{isMr ? `बॅकएंडमध्ये जतन झालेले फॉर्म (${surveyStats.savedToBackend})` : `Saved in Backend (${surveyStats.savedToBackend})`}</span>
            </button>
          </div>

          {/* Access Policy Info Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: '12px',
            padding: '12px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '13px',
            color: '#0369a1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>ℹ</div>
              <span>
                <strong>{language === 'mr' ? 'केवळ फॉर्म भरण्याची परवानगी:' : 'Fill-only Access:'}</strong>{' '}
                {language === 'mr' 
                  ? 'तुम्हाला केवळ प्रशासनाने (Admin) अधिकृत केलेल्या फॉर्ममध्ये नवीन मतदारांची माहिती भरण्याची परवानगी आहे. फॉर्मचे स्वरूप बदलता येत नाही.'
                  : 'You have read and fill-only permissions for these assigned forms. Form schema cannot be altered.'}
              </span>
            </div>
          </div>

          {/* Survey Fill Modal - Only for Assigned Forms */}
          {activeSurveyToFill && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                maxWidth: '820px',
                width: '100%',
                maxHeight: '92vh',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden',
                border: '1px solid #cbd5e1'
              }}>
                {/* Modal Header */}
                <div style={{
                  padding: '18px 24px',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#ffffff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #334155'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '18px' }}>📋</span>
                      <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                        {activeSurveyToFill.title_mr || activeSurveyToFill.title_en}
                      </h3>
                      <span style={{
                        background: 'rgba(255,255,255,0.15)',
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 600
                      }}>
                        v{activeSurveyToFill.version || '1.0'}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      <span>🏷️ प्रकल्प: <strong>{activeSurveyToFill.project_name || 'सांगली'}</strong></span>
                      <span>📍 व्याप्ती: <strong>{activeSurveyToFill.scope || 'GENERAL'}</strong></span>
                      <span style={{ color: '#4ade80' }}>✓ अधिकृत फॉर्म (Fill Only)</span>
                    </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setActiveSurveyToFill(null)} 
                    style={{
                      border: 'none',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px'
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Modal Body / Scrollable Form */}
                <form onSubmit={handleSurveySubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                  <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>
                    
                    {/* SECTION 1: कुटुंब प्रमुख व घर तपशील */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>१</span>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                          कुटुंब प्रमुख व संपर्क तपशील (Family Head Details)
                        </h4>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            कुटुंब प्रमुखाचे पूर्ण नाव (Family Pramukh Name) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input 
                            type="text" 
                            required 
                            className="form-input" 
                            placeholder="उदा. सतीश विठ्ठल खोत" 
                            value={surveyFormData.pramukh_name} 
                            onChange={(e) => {
                              const val = e.target.value;
                              setSurveyFormData((prev) => {
                                const nextMembers = [...prev.members];
                                if (nextMembers.length > 0 && (!nextMembers[0].full_name || nextMembers[0].full_name === prev.pramukh_name)) {
                                  nextMembers[0].full_name = val;
                                }
                                return { ...prev, pramukh_name: val, members: nextMembers };
                              });
                            }} 
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            एकूण मतदार संख्या (Total Matdar) <span style={{ color: '#ef4444' }}>*</span>
                          </label>
                          <input 
                            type="number" 
                            min="1" 
                            required 
                            className="form-input" 
                            placeholder="उदा. ३" 
                            value={surveyFormData.total_matdar} 
                            onChange={(e) => setSurveyFormData({ ...surveyFormData, total_matdar: parseInt(e.target.value) || 1 })} 
                          />
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            (ओळखपत्र YES असलेल्या सदस्यांनुसार आपोआप मोजले जाते)
                          </span>
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            मोबाईल नंबर (Mobile Number)
                          </label>
                          <input 
                            type="tel" 
                            maxLength="10"
                            className="form-input" 
                            placeholder="उदा. ९८XXXXXXXX" 
                            value={surveyFormData.phone} 
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setSurveyFormData({ ...surveyFormData, phone: val });
                              if (val.length >= 10) {
                                checkDuplicateField('phone', val, setSurveyDuplicateWarning);
                              } else {
                                setSurveyDuplicateWarning(null);
                              }
                            }} 
                          />
                          {surveyDuplicateWarning && (
                            <div style={{ marginTop: '5px', padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                              <span>⚠️ {surveyDuplicateWarning}</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                            घराचा पत्ता / परिसर (Address / Lane / Ward)
                          </label>
                          <input 
                            type="text" 
                            className="form-input" 
                            placeholder="उदा. घर क्र. २४, मेन रोड, वॉर्ड ३" 
                            value={surveyFormData.address} 
                            onChange={(e) => setSurveyFormData({ ...surveyFormData, address: e.target.value })} 
                          />
                        </div>
                      </div>
                    </div>

                    {/* SECTION 2: सर्व कुटुंब सदस्यांची माहिती */}
                    <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>२</span>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                              सर्व कुटुंब सदस्यांची माहिती (All Family Members Details)
                            </h4>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              प्रत्येक सदस्याचे नाव, जन्मतारीख, वय व मतदार ओळखपत्र (EPIC) माहिती भरा.
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={handleWorkerAddMember}
                          style={{
                            background: '#10b981',
                            color: '#ffffff',
                            border: 'none',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <Plus size={16} /> + सदस्य जोडा
                        </button>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {surveyFormData.members.map((member, idx) => (
                          <div 
                            key={member.id} 
                            style={{ 
                              background: '#ffffff', 
                              borderRadius: '10px', 
                              padding: '14px', 
                              border: '1px solid #e2e8f0',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                                #{idx + 1} {idx === 0 ? 'कुटुंब प्रमुख (Family Head)' : `सदस्य (Member ${idx + 1})`}
                              </span>
                              {surveyFormData.members.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleWorkerRemoveMember(member.id)}
                                  style={{
                                    border: 'none',
                                    background: '#fee2e2',
                                    color: '#ef4444',
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                  }}
                                >
                                  <Trash2 size={12} /> काढा
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                  सदस्याचे पूर्ण नाव *
                                </label>
                                <input
                                  type="text"
                                  required
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                  placeholder="उदा. अनिता सतीश खोत"
                                  value={member.full_name}
                                  onChange={(e) => handleWorkerMemberChange(member.id, 'full_name', e.target.value)}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                  नातेसंबंध (Relation)
                                </label>
                                <select
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                  value={member.relation}
                                  onChange={(e) => handleWorkerMemberChange(member.id, 'relation', e.target.value)}
                                >
                                  <option value="कुटुंब प्रमुख (Self)">कुटुंब प्रमुख (Self)</option>
                                  <option value="पत्नी (Wife)">पत्नी (Wife)</option>
                                  <option value="पती (Husband)">पती (Husband)</option>
                                  <option value="मुलगा (Son)">मुलगा (Son)</option>
                                  <option value="मुलगी (Daughter)">मुलगी (Daughter)</option>
                                  <option value="वडील (Father)">वडील (Father)</option>
                                  <option value="आई (Mother)">आई (Mother)</option>
                                  <option value="भाऊ (Brother)">भाऊ (Brother)</option>
                                  <option value="बहीण (Sister)">बहीण (Sister)</option>
                                  <option value="सून (Daughter-in-law)">सून (Daughter-in-law)</option>
                                  <option value="जावई (Son-in-law)">जावई (Son-in-law)</option>
                                  <option value="इतर (Other)">इतर (Other)</option>
                                </select>
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                  जन्मतारीख (DOB)
                                </label>
                                <input
                                  type="date"
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                  value={member.dob}
                                  onChange={(e) => handleWorkerMemberChange(member.id, 'dob', e.target.value)}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                  वय (Age)
                                </label>
                                <input
                                  type="number"
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '13px', background: '#f8fafc' }}
                                  placeholder="आपोआप वय"
                                  value={member.age}
                                  onChange={(e) => handleWorkerMemberChange(member.id, 'age', e.target.value)}
                                />
                              </div>

                              <div>
                                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                  मतदार ओळखपत्र आहे का नाही?
                                </label>
                                <select
                                  className="form-input"
                                  style={{ padding: '6px 10px', fontSize: '13px' }}
                                  value={member.has_voter_id}
                                  onChange={(e) => handleWorkerMemberChange(member.id, 'has_voter_id', e.target.value)}
                                >
                                  <option value="YES">होय - आहे (YES)</option>
                                  <option value="NO">नाही (NO)</option>
                                </select>
                              </div>

                              {member.has_voter_id === 'YES' && (
                                <div>
                                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                    EPIC मतदार ओळखपत्र क्र.
                                  </label>
                                  <input
                                    type="text"
                                    className="form-input"
                                    style={{ padding: '6px 10px', fontSize: '13px' }}
                                    placeholder="उदा. MH/44/282/..."
                                    value={member.voter_id_no}
                                    onChange={(e) => handleWorkerMemberChange(member.id, 'voter_id_no', e.target.value)}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SECTION 3: अतिरिक्त सर्वेक्षण प्रश्न (कस्टम प्रश्न) */}
                    {activeSurveyToFill.custom_questions && activeSurveyToFill.custom_questions.length > 0 && (
                      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                          <span style={{ background: '#8b5cf6', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>३</span>
                          <div>
                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                              अतिरिक्त सर्वेक्षण प्रश्न (Custom Project Questions)
                            </h4>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                              या मोहिमेसाठी विचारलेले विशिष्ट प्रश्न खाली उत्तरे निवडा.
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {activeSurveyToFill.custom_questions.map((q, qIdx) => (
                            <div 
                              key={q.id || qIdx} 
                              style={{ 
                                background: '#ffffff', 
                                borderRadius: '10px', 
                                padding: '14px', 
                                border: '1px solid #e2e8f0' 
                              }}
                            >
                              <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                                प्रश्न {qIdx + 1}: {q.title_mr || q.title_en} {q.required && <span style={{ color: '#ef4444' }}>*</span>}
                              </label>
                              {q.title_en && q.title_mr && (
                                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                                  ({q.title_en})
                                </span>
                              )}

                              {/* Single Choice / Radio */}
                              {q.type === 'single_choice' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                                  {(q.options || ['होय', 'नाही']).map((opt, oIdx) => (
                                    <label 
                                      key={oIdx} 
                                      style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '7px 14px',
                                        borderRadius: '8px',
                                        background: surveyFormData.custom_answers?.[q.id] === opt ? '#eff6ff' : '#f8fafc',
                                        border: surveyFormData.custom_answers?.[q.id] === opt ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                        color: surveyFormData.custom_answers?.[q.id] === opt ? '#1e40af' : '#334155',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: '13px'
                                      }}
                                    >
                                      <input 
                                        type="radio" 
                                        name={`q_${q.id}`} 
                                        checked={surveyFormData.custom_answers?.[q.id] === opt} 
                                        onChange={() => handleCustomAnswerChange(q.id, opt)} 
                                        style={{ accentColor: '#2563eb' }}
                                      />
                                      {opt}
                                    </label>
                                  ))}
                                </div>
                              )}

                              {/* Multiple Choice / Checkbox */}
                              {q.type === 'multi_choice' && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                                  {(q.options || []).map((opt, oIdx) => {
                                    const isChecked = Array.isArray(surveyFormData.custom_answers?.[q.id]) && surveyFormData.custom_answers[q.id].includes(opt);
                                    return (
                                      <label 
                                        key={oIdx} 
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '6px',
                                          padding: '7px 14px',
                                          borderRadius: '8px',
                                          background: isChecked ? '#f0fdf4' : '#f8fafc',
                                          border: isChecked ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                          color: isChecked ? '#15803d' : '#334155',
                                          cursor: 'pointer',
                                          fontWeight: 600,
                                          fontSize: '13px'
                                        }}
                                      >
                                        <input 
                                          type="checkbox" 
                                          checked={isChecked} 
                                          onChange={() => handleMultiChoiceToggle(q.id, opt)} 
                                          style={{ accentColor: '#16a34a' }}
                                        />
                                        {opt}
                                      </label>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Yes / No Toggle */}
                              {q.type === 'yes_no' && (
                                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                                  {['होय (Yes)', 'नाही (No)'].map((opt) => (
                                    <button
                                      type="button"
                                      key={opt}
                                      onClick={() => handleCustomAnswerChange(q.id, opt)}
                                      style={{
                                        flex: 1,
                                        padding: '8px 14px',
                                        borderRadius: '8px',
                                        border: surveyFormData.custom_answers?.[q.id] === opt ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                        background: surveyFormData.custom_answers?.[q.id] === opt ? '#e0f2fe' : '#ffffff',
                                        color: surveyFormData.custom_answers?.[q.id] === opt ? '#0369a1' : '#334155',
                                        fontWeight: 700,
                                        fontSize: '13px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {opt}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Rating 1 to 5 */}
                              {q.type === 'rating' && (
                                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                                  {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                      type="button"
                                      key={num}
                                      onClick={() => handleCustomAnswerChange(q.id, num)}
                                      style={{
                                        flex: 1,
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: (surveyFormData.custom_answers?.[q.id] || 5) === num ? '2px solid #f97316' : '1px solid #cbd5e1',
                                        background: (surveyFormData.custom_answers?.[q.id] || 5) === num ? '#fff7ed' : '#ffffff',
                                        color: (surveyFormData.custom_answers?.[q.id] || 5) === num ? '#ea580c' : '#64748b',
                                        fontWeight: 800,
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      ★ {num}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Text Input */}
                              {q.type === 'text' && (
                                <input
                                  type="text"
                                  className="form-input"
                                  style={{ marginTop: '6px' }}
                                  placeholder="उत्तर येथे लिहा..."
                                  value={surveyFormData.custom_answers?.[q.id] || ''}
                                  onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                                />
                              )}

                              {/* Textarea */}
                              {q.type === 'textarea' && (
                                <textarea
                                  rows="2"
                                  className="form-input"
                                  style={{ marginTop: '6px' }}
                                  placeholder="सविस्तर अभिप्राय येथे लिहा..."
                                  value={surveyFormData.custom_answers?.[q.id] || ''}
                                  onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div style={{
                    padding: '16px 24px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      सर्व माहिती अचूक असल्याची खात्री करून सबमिट करा.
                    </span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="button"
                        className="btn-outline"
                        onClick={() => setActiveSurveyToFill(null)}
                        disabled={submittingSurvey}
                      >
                        {t('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="btn-success"
                        disabled={submittingSurvey}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 20px',
                          fontWeight: 700
                        }}
                      >
                        {submittingSurvey ? 'जमा होत आहे...' : '✓ सर्व्हे पूर्ण व जमा करा'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}
          
          {/* Content Views: Allocated Forms vs Saved in Backend History */}
          {surveyActiveView === 'forms' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
              {activeSurveys.length > 0 ? (
                activeSurveys.map((survey) => {
                  const savedCount = survey.saved_to_backend_count ?? survey.completed_voters ?? 0;
                  const targetCount = survey.allocated_target || survey.total_voters || 100;
                  const progressPct = Math.min(100, Math.round((savedCount / (targetCount || 1)) * 100));

                  return (
                    <div 
                      key={survey.id} 
                      className="card" 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '1rem', 
                        padding: '1.5rem', 
                        border: '1px solid #bfdbfe', 
                        borderRadius: '16px',
                        boxShadow: '0 4px 12px rgba(37,99,235,0.06)',
                        background: '#ffffff',
                        position: 'relative',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.65rem', borderRadius: '12px' }}>
                          <ClipboardCheck size={26} />
                        </div>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                          <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 750, padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                            ✓ {isMr ? 'तुम्हाला वाटप' : 'Allocated to You'}
                          </span>
                          <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                            ✓ {isMr ? 'अधिकृत' : 'Authorized'}
                          </span>
                        </div>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                            {survey.title_mr || survey.title_en}
                          </h3>
                          <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                            v{survey.version || '1.0'}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '0.85rem', color: '#475569' }}>
                          <div>🏷️ {isMr ? 'प्रकल्प' : 'Project'}: <strong>{survey.project_name || 'सांगली'}</strong></div>
                          <div>📍 {isMr ? 'भौगोलिक व्याप्ती' : 'Scope'}: <strong>{survey.scope || 'विधानसभा'}</strong></div>
                          <div style={{ color: '#059669', fontWeight: 600 }}>
                            ✓ {isMr ? 'कुटुंब प्रमुख + सदस्य + अतिरिक्त प्रश्न' : 'Head + Members + Custom Questions'}
                          </div>
                        </div>

                        {/* Allocated Target & Saved to Backend Block */}
                        <div style={{
                          background: '#f8fafc',
                          border: '1px solid #e2e8f0',
                          padding: '12px 14px',
                          borderRadius: '12px',
                          marginTop: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>
                              🎯 {isMr ? 'वाटप केलेले उद्दिष्ट (Allocated Target):' : 'Allocated Target:'}
                            </span>
                            <strong style={{ color: '#ea580c', fontWeight: '800' }}>
                              {targetCount} {isMr ? 'कुटुंबे' : 'Households'}
                            </strong>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                            <span style={{ color: '#64748b', fontWeight: '600' }}>
                              💾 {isMr ? 'बॅकएंडमध्ये जतन (Saved in DB):' : 'Saved in DB:'}
                            </span>
                            <strong style={{ color: '#16a34a', fontWeight: '850' }}>
                              {savedCount} {isMr ? 'फॉर्म जमा' : 'Forms Saved'}
                            </strong>
                          </div>

                          {/* Progress Bar */}
                          <div style={{ marginTop: '2px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>
                              <span>{isMr ? 'प्रगती' : 'Progress'}</span>
                              <span style={{ fontWeight: '750', color: '#2563eb' }}>{progressPct}%</span>
                            </div>
                            <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                width: `${progressPct}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #3b82f6 0%, #16a34a 100%)',
                                borderRadius: '4px',
                                transition: 'width 0.4s ease'
                              }} />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Lock size={12} /> {isMr ? 'पाहणे व भरणे अधिकृत' : 'Fill-only Access'}
                        </span>
                        <button 
                          className="btn-primary" 
                          style={{ 
                            padding: '0.55rem 1.35rem', 
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                          }} 
                          onClick={() => handleOpenSurveyModal(survey)}
                        >
                          {isMr ? 'फॉर्म भरा (Fill Form) →' : 'Fill Form →'}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ background: '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                    <ClipboardList size={32} color="#94a3b8" />
                  </div>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                    {language === 'mr' ? 'सध्या तुम्हाला कोणतेही सर्व्हे फॉर्म वाटप केलेले नाहीत' : 'No Survey Forms Allocated to Your Account'}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                    {language === 'mr'
                      ? 'केवळ प्रशासनाने (Admin) तुमच्या खात्याला अधिकृत वाटप केलेले फॉर्मच येथे दिसतात. नवीन फॉर्म वाटपासाठी कृपया तुमच्या ॲडमिनशी संपर्क साधा.'
                      : 'Only published survey forms assigned to your specific user account by an Administrator appear here. Contact your campaign administrator for form allocation.'}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* View 2: Saved Forms in Backend DB History */
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
            }}>
              <div style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={20} color="#16a34a" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                    {isMr ? 'बॅकएंड डेटाबेसमध्ये जतन झालेले फॉर्म' : 'Forms Saved in Backend Database'}
                  </h3>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                    {savedSubmissionsList.length} {isMr ? 'नोंदी' : 'Records'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  🔒 {isMr ? 'केवळ या युझरने भरलेले फॉर्म' : 'Only forms submitted by your account'}
                </div>
              </div>

              {savedSubmissionsList.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '750' }}>
                        <th style={{ padding: '12px 16px' }}>#</th>
                        <th style={{ padding: '12px 16px' }}>{isMr ? 'कुटुंब प्रमुख (Pramukh Name)' : 'Family Head'}</th>
                        <th style={{ padding: '12px 16px' }}>{isMr ? 'मोबाईल / Voter ID' : 'Contact / Voter ID'}</th>
                        <th style={{ padding: '12px 16px' }}>{isMr ? 'एकूण मतदार' : 'Matdar'}</th>
                        <th style={{ padding: '12px 16px' }}>{isMr ? 'पत्ता (Address)' : 'Address'}</th>
                        <th style={{ padding: '12px 16px' }}>{isMr ? 'जतन दिनांक' : 'Saved At'}</th>
                        <th style={{ padding: '12px 16px' }}>{isMr ? 'स्थिती (Status)' : 'Status'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedSubmissionsList.map((item, idx) => (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                          <td style={{ padding: '12px 16px', fontWeight: '700', color: '#64748b' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                            {item.citizen_name || '-'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontWeight: '600', color: '#0284c7' }}>{item.phone || '-'}</div>
                            {item.voter_id && (
                              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                🪪 {item.voter_id}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: '750', fontSize: '12px' }}>
                              👥 {item.total_matdar || 1} {isMr ? 'सदस्य' : 'members'}
                            </span>
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.address || 'सांगली'}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                            {item.submitted_at ? new Date(item.submitted_at).toLocaleString('mr-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                          </td>
                          <td style={{ padding: '12px 16px' }}>
                            <span style={{
                              background: '#dcfce7',
                              color: '#15803d',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11.5px',
                              fontWeight: '750',
                              border: '1px solid #bbf7d0',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <CheckCircle2 size={12} />
                              {isMr ? 'बॅकएंडमध्ये जतन' : 'Saved in DB'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                  <div style={{ background: '#f8fafc', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                    <Save size={28} color="#94a3b8" />
                  </div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#334155' }}>
                    {isMr ? 'अद्याप कोणताही फॉर्म बॅकएंडमध्ये जमा केलेला नाही' : 'No forms saved to backend yet'}
                  </h4>
                  <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '13px' }}>
                    {isMr ? 'वरील \'वाटप केलेले अधिकृत फॉर्म\' टॅबमधून नवीन मतदारांची माहिती भरून जतन करा.' : 'Fill and submit an allocated survey form to view your saved records here.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSurveyActiveView('forms')}
                    className="btn-primary"
                    style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
                  >
                    {isMr ? '← वाटप केलेले फॉर्म पहा' : '← View Allocated Forms'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      );
    }


    // -------------------------------------------------------------------------
    // 7. CITIZEN GRIEVANCES & REQUESTS DESK (नागरिकांच्या समस्या व विनंत्या)
    // -------------------------------------------------------------------------
    if (activeTab === 'Complaints') {
      const filteredComplaints = complaintsData.filter((c) => {
        const matchesStatus = complaintFilter === 'All' || c.status === complaintFilter;
        if (!matchesStatus) return false;
        if (!complaintSearchQuery.trim()) return true;
        const q = complaintSearchQuery.toLowerCase();
        return (
          (c.name && c.name.toLowerCase().includes(q)) ||
          (c.phone && c.phone.includes(q)) ||
          (c.category && c.category.toLowerCase().includes(q)) ||
          (c.complaint_code && c.complaint_code.toLowerCase().includes(q)) ||
          (c.desc && c.desc.toLowerCase().includes(q))
        );
      });

      const totalCount = complaintsData.length;
      const pendingCount = complaintsData.filter((c) => c.status === 'Pending').length;
      const inProgressCount = complaintsData.filter((c) => c.status === 'In Progress').length;
      const resolvedCount = complaintsData.filter((c) => c.status === 'Resolved' || c.status === 'Action Taken').length;

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
          {/* Header */}
          <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertCircle size={28} color="#ea580c" />
                <span>{isMr ? 'नागरिकांच्या समस्या व विनंत्या' : 'Citizen Grievances & Service Requests'}</span>
              </h1>
              <div className="page-subtitle">
                {isMr ? 'प्रभागातील नागरिकांनी मांडलेल्या समस्यांची नोंद करा, फोटो जोडा आणि जलद निवारणाचा पाठपुरावा करा.' : 'Register citizen civic issues, capture geotagged field photos, and monitor fast resolution.'}
              </div>
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={() => setIsAddingComplaint(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 750, fontSize: '13px' }}
            >
              <Plus size={18} />
              <span>{isMr ? '+ नवीन तक्रार नोंदवा' : '+ Register New Grievance'}</span>
            </button>
          </div>

          {/* Quick Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #64748b', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                {isMr ? 'एकूण समस्या (Total)' : 'Total Grievances Logged'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderTop: '3.5px solid #ea580c', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '700' }}>
                {isMr ? 'प्रलंबित समस्या (Pending)' : 'Pending Resolution'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#c2410c', marginTop: '4px' }}>{pendingCount}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderTop: '3.5px solid #2563eb', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '700' }}>
                {isMr ? 'कार्यवाही सुरू (In Progress)' : 'Under Action (In Progress)'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#1d4ed8', marginTop: '4px' }}>{inProgressCount}</div>
            </div>

            <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderTop: '3.5px solid #16a34a', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
                {isMr ? 'सोडवलेल्या समस्या (Resolved)' : 'Resolved & Closed'}
              </div>
              <div style={{ fontSize: '26px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>{resolvedCount}</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setComplaintFilter(st)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: 'none',
                    background: complaintFilter === st ? '#ea580c' : '#f1f5f9',
                    color: complaintFilter === st ? '#ffffff' : '#475569',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {st === 'All' ? (isMr ? 'सर्व समस्या' : 'All Grievances') : st === 'Pending' ? (isMr ? '⏳ प्रलंबित' : '⏳ Pending') : st === 'In Progress' ? (isMr ? '🔄 कार्यवाही सुरू' : '🔄 In Progress') : (isMr ? '✓ सोडवलेल्या' : '✓ Resolved')}
                </button>
              ))}
            </div>

            <div style={{ position: 'relative', width: '300px' }}>
              <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="text"
                placeholder={isMr ? "नागरिकाचे नाव, फोन किंवा विषय शोधा..." : "Search by code, citizen name, phone, or issue..."}
                value={complaintSearchQuery}
                onChange={(e) => setComplaintSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 24px 7px 30px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '12px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
              {complaintSearchQuery && (
                <button
                  type="button"
                  onClick={() => setComplaintSearchQuery('')}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Complaints Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isMr ? 'तक्रार क्र.' : 'Grievance Code'}</th>
                    <th>{isMr ? 'नागरिकाचे नाव व फोन' : 'Citizen Name & Contact'}</th>
                    <th>{isMr ? 'समस्येचा वर्ग' : 'Issue Category'}</th>
                    <th>{isMr ? 'तपशील व स्थान' : 'Description & Location'}</th>
                    <th>{isMr ? 'नोंद तारीख' : 'Reported Date'}</th>
                    <th>{isMr ? 'स्थिती' : 'Resolution Status'}</th>
                    <th style={{ textAlign: 'right' }}>{isMr ? 'कृती' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.length > 0 ? (
                    filteredComplaints.map((c) => (
                      <tr key={c.id || c.complaint_code}>
                        <td>
                          <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '12px', background: '#f1f5f9', padding: '3px 7px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                            {c.complaint_code || `GRV-${c.id}`}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>📞 {c.phone || '-'}</div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe'
                          }}>
                            {c.category}
                          </span>
                        </td>
                        <td style={{ maxWidth: '280px' }}>
                          <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>{c.desc}</div>
                          {c.notes && (
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              📍 {c.notes}
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                          {c.date_reported || (isMr ? 'आज' : 'Today')}
                        </td>
                        <td>
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateComplaintStatus(c.id, e.target.value)}
                            style={{
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              border: c.status === 'Resolved' ? '1px solid #86efac' : c.status === 'In Progress' ? '1px solid #93c5fd' : '1px solid #fed7aa',
                              background: c.status === 'Resolved' ? '#f0fdf4' : c.status === 'In Progress' ? '#eff6ff' : '#fff7ed',
                              color: c.status === 'Resolved' ? '#15803d' : c.status === 'In Progress' ? '#1d4ed8' : '#c2410c'
                            }}
                          >
                            <option value="Pending">{isMr ? '⏳ प्रलंबित (Pending)' : '⏳ Pending'}</option>
                            <option value="In Progress">{isMr ? '🔄 कार्यवाही सुरू (In Progress)' : '🔄 In Progress'}</option>
                            <option value="Resolved">{isMr ? '✓ सोडवली (Resolved)' : '✓ Resolved'}</option>
                          </select>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          {c.phone && (
                            <button
                              type="button"
                              className="icon-btn icon-btn-success"
                              title={isMr ? "व्हॉट्सॲप संवाद" : "WhatsApp Chat"}
                              onClick={() => alert(`Opening WhatsApp chat for ${c.phone}...`)}
                            >
                              <MessageCircle size={15} color="#16a34a" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                        {isMr ? 'कोणतीही तक्रार आढळली नाही.' : 'No grievances found matching criteria.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* New Complaint Registration Modal with Photo & GPS */}
          {isAddingComplaint && (
            <div style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.72)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px'
            }}>
              <div style={{
                background: '#ffffff',
                borderRadius: '16px',
                maxWidth: '620px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                border: '1px solid #cbd5e1',
                padding: '24px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={22} color="#ea580c" />
                    <span>{isMr ? 'नवीन नागरिक समस्या / विनंती नोंदवा' : 'Register New Grievance or Citizen Request'}</span>
                  </h3>
                  <button type="button" onClick={() => setIsAddingComplaint(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
                </div>

                <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        {isMr ? 'नागरिकाचे पूर्ण नाव *' : 'Citizen Full Name *'}
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder={isMr ? "उदा. रमेश बापू पाटील" : "Enter citizen name"}
                        value={complaintFormData.name}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, name: e.target.value })}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        {isMr ? 'मोबाईल नंबर' : 'Phone / Mobile Number'}
                      </label>
                      <input
                        type="tel"
                        maxLength="10"
                        className="form-input"
                        placeholder="98XXXXXXXX"
                        value={complaintFormData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setComplaintFormData({ ...complaintFormData, phone: val });
                          if (val.length >= 10) {
                            checkDuplicateField('phone', val, setComplaintDuplicateWarning);
                          } else {
                            setComplaintDuplicateWarning(null);
                          }
                        }}
                      />
                      {complaintDuplicateWarning && (
                        <div style={{ marginTop: '5px', padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                          <span>⚠️ {complaintDuplicateWarning}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        {isMr ? 'समस्येचा वर्ग (Category) *' : 'Grievance Category *'}
                      </label>
                      <select
                        className="form-input"
                        value={complaintFormData.category}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, category: e.target.value })}
                      >
                        <option value="पाणी पुरवठा (Water Supply)">💧 {isMr ? 'पाणी पुरवठा (Water Supply)' : 'Water Supply & Drinking Water'}</option>
                        <option value="रस्ते व गटार (Roads & Drainage)">🛣️ {isMr ? 'रस्ते व गटार (Roads & Drainage)' : 'Roads & Drainage'}</option>
                        <option value="वीज व पथदिवे (Street Lights)">💡 {isMr ? 'वीज व पथदिवे (Street Lights)' : 'Street Lights & Electricity'}</option>
                        <option value="कचरा व स्वच्छता (Sanitation)">🧹 {isMr ? 'कचरा व स्वच्छता (Sanitation)' : 'Garbage & Sanitation'}</option>
                        <option value="आरोग्य व रुग्णालय (Healthcare)">🏥 {isMr ? 'आरोग्य व रुग्णालय (Healthcare)' : 'Healthcare & Hospital Aid'}</option>
                        <option value="शासकीय योजना / पेन्शन (Schemes)">📄 {isMr ? 'शासकीय योजना / पेन्शन (Schemes)' : 'Government Welfare Schemes / Pension'}</option>
                        <option value="इतर समस्या (Others)">📌 {isMr ? 'इतर समस्या (Others)' : 'Other Civic Grievances'}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        {isMr ? 'तातडीची पातळी (Urgency)' : 'Priority / Urgency Level'}
                      </label>
                      <select
                        className="form-input"
                        value={complaintFormData.urgency}
                        onChange={(e) => setComplaintFormData({ ...complaintFormData, urgency: e.target.value })}
                      >
                        <option value="तातडीचे (Urgent)">🔴 {isMr ? 'तातडीचे (Urgent - 24 hours)' : 'Urgent (Within 24 Hours)'}</option>
                        <option value="मध्यम (Medium)">🟡 {isMr ? 'मध्यम (Medium - 3 days)' : 'Medium (Within 3 Days)'}</option>
                        <option value="सामान्य (Normal)">🟢 {isMr ? 'सामान्य (Normal)' : 'Normal Priority'}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      {isMr ? 'समस्येचे सविस्तर वर्णन *' : 'Detailed Description *'}
                    </label>
                    <textarea
                      rows="3"
                      required
                      className="form-input"
                      placeholder={isMr ? "समस्येचे सविस्तर कारण व मागणी येथे लिहा..." : "Describe the grievance details, specific street, landmark, and citizen request..."}
                      value={complaintFormData.desc}
                      onChange={(e) => setComplaintFormData({ ...complaintFormData, desc: e.target.value })}
                    />
                  </div>

                  {/* Photo / Document Upload Section */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      📷 {isMr ? 'समस्येचा फोटो / कागदपत्र जोडा' : 'Attach Field Photo or Document'}
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf,.doc,.docx"
                      className="form-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setComplaintFormData({ ...complaintFormData, photo: file.name });
                        }
                      }}
                    />
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {isMr ? 'खराब रस्ता, तुंबलेली गटार किंवा अर्जाचा फोटो जोडा.' : 'Attach site photo, damaged spot, or application letter for quick resolution.'}
                    </span>
                  </div>

                  {/* Auto Geotag Strip */}
                  <div style={{ fontSize: '12px', color: '#0369a1', background: '#e0f2fe', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} color="#0284c7" />
                    <span>
                      📍 {isMr ? 'GPS स्थान' : 'GPS Location'}: <strong>{currentCoords?.address || (isMr ? 'स्थान आपोआप टॅग होईल' : 'GPS will tag automatically on submission')}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn-outline" onClick={() => setIsAddingComplaint(false)} disabled={submittingComplaint}>
                      {t('cancel')}
                    </button>
                    <button type="submit" className="btn-success" disabled={submittingComplaint} style={{ fontWeight: 750, padding: '9px 22px' }}>
                      {submittingComplaint ? (isMr ? 'नोंद होत आहे...' : 'Saving...') : (isMr ? '✓ तक्रार नोंदवा' : '✓ Register Grievance')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 8. TASKS & CITIZEN FOLLOW-UP DESK (कार्ये व मतदार पाठपुरावा)
    // -------------------------------------------------------------------------
    if (activeTab === 'Tasks') {
      const completedTasksCount = tasksList.filter((t) => t.completed).length;
      const pendingTasksCount = tasksList.length - completedTasksCount;

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckSquare size={28} color="#2563eb" />
                <span>{isMr ? 'कार्ये व मतदार पाठपुरावा' : 'Tasks & Citizen Follow-ups'}</span>
              </h1>
              <div className="page-subtitle">
                {isMr ? 'दैनंदिन कामांचे नियोजन करा, पूर्ण झालेली कामे चिन्हांकित करा आणि नागरिकांशी नियमित संपर्क ठेवा.' : 'Manage daily tasks, mark completions, and follow up with voters.'}
              </div>
            </div>

            {/* View Switcher */}
            <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => setTaskActiveTab('tasks')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  background: taskActiveTab === 'tasks' ? '#2563eb' : 'transparent',
                  color: taskActiveTab === 'tasks' ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                📋 {isMr ? `दैनंदिन कामे (${tasksList.length})` : `Tasks (${tasksList.length})`}
              </button>

              <button
                type="button"
                onClick={() => setTaskActiveTab('followups')}
                style={{
                  padding: '7px 16px',
                  borderRadius: '7px',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  background: taskActiveTab === 'followups' ? '#ea580c' : 'transparent',
                  color: taskActiveTab === 'followups' ? '#ffffff' : '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                🤝 {isMr ? `मतदार पाठपुरावा (${followUpsList.length})` : `Follow-ups (${followUpsList.length})`}
              </button>
            </div>
          </div>

          {/* Section 1: My Daily Tasks */}
          {taskActiveTab === 'tasks' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? `एकूण कामे: ${tasksList.length} | पूर्ण: ${completedTasksCount} | शिल्लक: ${pendingTasksCount}` : `Total: ${tasksList.length} | Done: ${completedTasksCount} | Pending: ${pendingTasksCount}`}
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsAddingTask(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
                >
                  <Plus size={16} />
                  <span>{isMr ? '+ नवीन काम जोडा' : '+ Add Task'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                {tasksList.map((task) => (
                  <div
                    key={task.id}
                    className="card"
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: task.completed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      background: task.completed ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={Boolean(task.completed)}
                        onChange={() => handleToggleTask(task.id)}
                        style={{ width: '18px', height: '18px', accentColor: '#16a34a', marginTop: '2px', cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14.5px',
                          fontWeight: 750,
                          color: task.completed ? '#15803d' : '#0f172a',
                          textDecoration: task.completed ? 'line-through' : 'none'
                        }}>
                          {task.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px' }}>
                          🏷️ {task.category || 'बूथ कार्य'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', fontSize: '11.5px' }}>
                      <span style={{ color: '#64748b' }}>
                        📅 {isMr ? 'मुदत:' : 'Due:'} {task.deadline || 'आज'}
                      </span>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '10.5px',
                        background: task.priority === 'High' ? '#fef2f2' : task.priority === 'Urgent' ? '#fff1f2' : '#eff6ff',
                        color: task.priority === 'High' ? '#b91c1c' : task.priority === 'Urgent' ? '#be123c' : '#1d4ed8',
                        border: '1px solid currentColor'
                      }}>
                        {task.priority || 'Medium'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Citizen Follow-ups */}
          {taskActiveTab === 'followups' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'प्रलंबित मतदार भेटी व संवादाचा पाठपुरावा' : 'Pending voter visits and communication follow-ups'}
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsAddingFollowUp(true)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', fontSize: '13px', fontWeight: 700 }}
                >
                  <Plus size={16} />
                  <span>{isMr ? '+ नवीन पाठपुरावा नोंदवा' : '+ Add Follow-up'}</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                {followUpsList.map((item) => (
                  <div
                    key={item.id}
                    className="card"
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      border: item.status === 'Completed' ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                      background: item.status === 'Completed' ? '#f0fdf4' : '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{item.citizen_name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b' }}>📞 {item.phone || '-'}</div>
                        </div>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          background: item.status === 'Completed' ? '#dcfce7' : '#fff7ed',
                          color: item.status === 'Completed' ? '#15803d' : '#c2410c',
                          border: item.status === 'Completed' ? '1px solid #86efac' : '1px solid #fed7aa'
                        }}>
                          {item.status === 'Completed' ? (isMr ? '✓ पूर्ण' : 'Done') : (isMr ? '⏳ प्रलंबित' : 'Pending')}
                        </span>
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#334155', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '6px' }}>
                        💬 {item.topic}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                        📅 {item.next_date || 'लवकरच'}
                      </span>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {item.phone && (
                          <button
                            type="button"
                            className="icon-btn icon-btn-primary"
                            title="Call"
                            onClick={() => alert(`Calling ${item.citizen_name} (${item.phone})...`)}
                          >
                            <PhoneCall size={14} color="#2563eb" />
                          </button>
                        )}
                        {item.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateFollowUpStatus(item.id, 'Completed')}
                            style={{
                              border: 'none',
                              background: '#16a34a',
                              color: '#ffffff',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            ✓ {isMr ? 'पूर्ण झाले' : 'Mark Done'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Task Modal */}
          {isAddingTask && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '20px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{isMr ? 'नवीन काम जोडा' : 'Add New Task'}</h3>
                  <button type="button" onClick={() => setIsAddingTask(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
                </div>
                <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'कामाचे नाव / शीर्षक *' : 'Task Title *'}</label>
                    <input type="text" required className="form-input" placeholder={isMr ? "उदा. बूथ क्र. ४ मतदार यादी पडताळणी" : "Enter title"} value={newTaskData.title} onChange={(e) => setNewTaskData({ ...newTaskData, title: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'कामाचा वर्ग' : 'Category'}</label>
                    <select className="form-input" value={newTaskData.category} onChange={(e) => setNewTaskData({ ...newTaskData, category: e.target.value })}>
                      <option value="बूथ प्रचार (Booth Outreach)">बूथ प्रचार (Booth Outreach)</option>
                      <option value="मतदार संपर्क (Voter Contact)">मतदार संपर्क (Voter Contact)</option>
                      <option value="पत्रक वाटप (Pamphlet Distribution)">पत्रक वाटप (Pamphlet Distribution)</option>
                      <option value="अहवाल सादर करणे (Reporting)">अहवाल सादर करणे (Reporting)</option>
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'मुदत (Deadline)' : 'Deadline'}</label>
                      <input type="text" className="form-input" placeholder="उदा. उद्या सायं" value={newTaskData.deadline} onChange={(e) => setNewTaskData({ ...newTaskData, deadline: e.target.value })} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'प्राधान्य' : 'Priority'}</label>
                      <select className="form-input" value={newTaskData.priority} onChange={(e) => setNewTaskData({ ...newTaskData, priority: e.target.value })}>
                        <option value="High">🔴 High</option>
                        <option value="Medium">🟡 Medium</option>
                        <option value="Normal">🟢 Normal</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                    <button type="button" className="btn-outline" onClick={() => setIsAddingTask(false)}>{t('cancel')}</button>
                    <button type="submit" className="btn-primary" style={{ fontWeight: 750 }}>✓ {isMr ? 'काम जोडा' : 'Add Task'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Follow-up Modal */}
          {isAddingFollowUp && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(3px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '20px', border: '1px solid #cbd5e1' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800 }}>{isMr ? 'नवीन पाठपुरावा नोंदवा' : 'Add Follow-up'}</h3>
                  <button type="button" onClick={() => setIsAddingFollowUp(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
                </div>
                <form onSubmit={handleCreateFollowUp} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'नागरिकाचे नाव *' : 'Citizen Name *'}</label>
                    <input type="text" required className="form-input" placeholder="उदा. अशोक कदम" value={newFollowUpData.citizen_name} onChange={(e) => setNewFollowUpData({ ...newFollowUpData, citizen_name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'फोन नंबर' : 'Phone'}</label>
                    <input type="tel" maxLength="10" className="form-input" placeholder="९८XXXXXXXX" value={newFollowUpData.phone} onChange={(e) => setNewFollowUpData({ ...newFollowUpData, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'पाठपुराव्याचा विषय *' : 'Topic *'}</label>
                    <input type="text" required className="form-input" placeholder="उदा. रस्ता कामाची पाहणी, मतदार यादी नाव नोंदणी" value={newFollowUpData.topic} onChange={(e) => setNewFollowUpData({ ...newFollowUpData, topic: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>{isMr ? 'पुढील संपर्काची तारीख' : 'Next Follow-up Date'}</label>
                    <input type="text" className="form-input" placeholder="उदा. २० ऑक्टोबर सायं ५ वाजता" value={newFollowUpData.next_date} onChange={(e) => setNewFollowUpData({ ...newFollowUpData, next_date: e.target.value })} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
                    <button type="button" className="btn-outline" onClick={() => setIsAddingFollowUp(false)}>{t('cancel')}</button>
                    <button type="submit" className="btn-success" style={{ fontWeight: 750 }}>✓ {isMr ? 'नोंदवा' : 'Save'}</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      );
    }

    // -------------------------------------------------------------------------
    // 9. 6-LEVEL GEOGRAPHIC HIERARCHY EXPLORER (क्षेत्ररचना दर्शक)
    // -------------------------------------------------------------------------
    if (activeTab === 'Hierarchy') {
      const hierarchyLevels = [
        { level: 1, name_mr: 'राज्य (State)', name_en: 'State', value_mr: 'महाराष्ट्र (Maharashtra)', code: 'MH-27', icon: '🏛️', desc_mr: 'राज्यस्तरीय निवडणूक क्षेत्र' },
        { level: 2, name_mr: 'जिल्हा (District)', name_en: 'District', value_mr: 'सांगली (Sangli)', code: 'DIST-31', icon: '🏢', desc_mr: 'जिल्हा परिषद व मुख्यालय क्षेत्र' },
        { level: 3, name_mr: 'विधानसभा (Assembly)', name_en: 'Assembly', value_mr: '२८२ सांगली विधानसभा मतदारसंघ', code: 'AC-282', icon: '🗳️', desc_mr: 'विधानसभा निवडणूक कार्यक्षेत्र' },
        { level: 4, name_mr: 'तालुका / प्रभाग (Taluka / Ward)', name_en: 'Taluka / Ward', value_mr: 'मिरज तालुका / प्रभाग क्रमांक १२', code: 'TAL-MIRAJ', icon: '📍', desc_mr: 'स्थानिक स्वराज्य संस्था प्रभाग' },
        { level: 5, name_mr: 'गाव / शहर परिसर (Village / Area)', name_en: 'Village / Area', value_mr: 'सांगली शहर मध्य / वॉर्ड परिसर', code: 'VIL-SANGLI', icon: '🏘️', desc_mr: 'नागरी वस्ती व लोकवस्ती कार्यक्षेत्र' },
        { level: 6, name_mr: 'बूथ / भाग (Booth / Part)', name_en: 'Booth / Part', value_mr: 'बूथ क्र. १ ते १४ (प्राथमिक शाळा केंद्र)', code: 'BOOTH-12/1', icon: '🎯', desc_mr: 'कार्यकर्त्याचे प्रत्यक्ष नियुक्त मतदान केंद्र' },
      ];

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Header */}
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={28} color="#0f766e" />
                <span>{isMr ? '६-स्तरीय क्षेत्ररचना दर्शक (Geographic Hierarchy)' : '6-Level Geography Hierarchy'}</span>
              </h1>
              <div className="page-subtitle">
                {isMr
                  ? 'राज्य ➔ जिल्हा ➔ विधानसभा ➔ तालुका ➔ गाव ➔ बूथ/भाग अशी संपूर्ण ६-स्तरीय प्रशासकीय क्षेत्ररचना.'
                  : 'Full 6-level geographic structure: State -> District -> Assembly -> Taluka -> Village -> Booth.'}
              </div>
            </div>
          </div>

          {/* Interactive Breadcrumb Strip */}
          <div style={{
            background: 'linear-gradient(135deg, #0f2b5c 0%, #000080 100%)',
            color: '#ffffff',
            borderRadius: '14px',
            padding: '18px 22px',
            boxShadow: '0 4px 14px rgba(0, 0, 128, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', color: '#93c5fd', fontWeight: 800 }}>
              🇮🇳 {isMr ? 'तुमची नियुक्त क्षेत्र शृंखला (Assigned Hierarchy Chain)' : 'Your Assigned Hierarchy Chain'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>महाराष्ट्र (राज्य)</span>
              <span style={{ color: '#FF9933' }}>➔</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>सांगली (जिल्हा)</span>
              <span style={{ color: '#FF9933' }}>➔</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>२८२ सांगली (विधानसभा)</span>
              <span style={{ color: '#FF9933' }}>➔</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>मिरज / प्रभाग १२</span>
              <span style={{ color: '#FF9933' }}>➔</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '4px 10px', borderRadius: '6px' }}>सांगली शहर</span>
              <span style={{ color: '#10b981' }}>➔</span>
              <span style={{ background: '#10b981', color: '#ffffff', padding: '4px 12px', borderRadius: '6px', boxShadow: '0 2px 6px rgba(16,185,129,0.3)' }}>बूथ क्र. १ ते १४ (नियुक्त)</span>
            </div>
          </div>

          {/* 6 Level Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
            {hierarchyLevels.map((lvl) => (
              <div
                key={lvl.level}
                className="card"
                style={{
                  padding: '18px',
                  borderRadius: '14px',
                  border: lvl.level === 6 ? '2px solid #10b981' : '1px solid #e2e8f0',
                  background: lvl.level === 6 ? '#f0fdf4' : '#ffffff',
                  boxShadow: lvl.level === 6 ? '0 4px 12px rgba(16, 185, 129, 0.12)' : '0 2px 6px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '20px' }}>{lvl.icon}</span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: lvl.level === 6 ? '#15803d' : '#2563eb',
                      background: lvl.level === 6 ? '#dcfce7' : '#eff6ff',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      textTransform: 'uppercase'
                    }}>
                      {isMr ? `स्तर ${lvl.level}` : `Level ${lvl.level}`}
                    </span>
                  </div>

                  <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8', fontWeight: 700 }}>
                    {lvl.code}
                  </span>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>{isMr ? lvl.name_mr : lvl.name_en}</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>{lvl.value_mr}</div>
                </div>

                <div style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4, paddingTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  {lvl.desc_mr}
                </div>

                {lvl.level === 6 && (
                  <div style={{ background: '#dcfce7', color: '#166534', padding: '6px 10px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 750, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>✓</span>
                    <span>{isMr ? 'तुमचे प्रत्यक्ष कार्यक्षेत्र येथे नियुक्त आहे' : 'Your active field duty is assigned here'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
          {activeTab}
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          हा विभाग लवकरच थेट डेटाबेसशी जोडला जाईल.
        </p>
      </div>
    );
  };

  const allItems = navSections.flatMap((s) => s.items);
  const currentNav = allItems.find((item) => item.id === activeTab) || allItems[0];

  // Search Filtering for Navigation
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
      className="worker-shell"
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: isMr ? "'Noto Sans Devanagari', 'Mukta', 'Inter', sans-serif" : "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif",
        display: 'flex',
      }}
    >
      {/* UNIFIED LIGHT SAAS SIDEBAR */}
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
                  title={isMr ? 'भारत • कार्यकर्ता व बूथ कक्ष' : 'India • Karyakarta Field HQ'}
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
                      {isMr ? 'कार्यकर्ता व बूथ कक्ष' : 'Karyakarta Field HQ'}
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
                      {profileData.assignedWard
                        ? `🇮🇳 ${isMr ? 'प्रभाग' : 'Ward'} ${profileData.assignedWard}`
                        : (isMr ? '🇮🇳 प्रत्यक्ष कार्य संचलन' : '🇮🇳 Field Operations')}
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
                title={isCollapsed ? (isMr ? 'विस्तृत करा' : 'Expand Sidebar') : (isMr ? 'संक्षिप्त करा' : 'Collapse Sidebar')}
              >
                {isCollapsed ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
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

          {/* Simple Search Bar (When Expanded) */}
          {!isCollapsed && (
            <div
              style={{
                position: 'relative',
                marginBottom: '12px',
                padding: '0 2px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder={isMr ? 'विभाग किंवा कार्य शोधा...' : 'Filter sections...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '7px 24px 7px 28px',
                  fontSize: '11.5px',
                  borderRadius: '7px',
                  border: '1px solid #cbd5e1',
                  background: '#f8fafc',
                  color: '#0f172a',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '12px',
                    padding: 0,
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Categorized Navigation Sections */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredSections.map((sec) => (
              <div key={sec.id}>
                {!isCollapsed && (
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.6px',
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      padding: '0 8px 4px 8px',
                    }}
                  >
                    {isMr ? sec.title_mr : sec.title_en}
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {sec.items.map((item) => {
                    const isActive = activeTab === item.id;
                    const IconComp = item.icon;
                    const bTheme = item.badgeTheme ? badgeConfig[item.badgeTheme] || badgeConfig.blue : badgeConfig.blue;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveTab(item.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isCollapsed ? 'center' : 'space-between',
                          padding: isCollapsed ? '9px 0' : '8px 10px',
                          borderRadius: '8px',
                          border: isActive ? '1px solid #fed7aa' : '1px solid transparent',
                          background: isActive ? '#fff7ed' : 'transparent',
                          color: isActive ? '#c2410c' : '#334155',
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          fontSize: '12.5px',
                          fontWeight: isActive ? '750' : '550',
                          textAlign: 'left',
                          transition: 'all 0.12s ease',
                          position: 'relative',
                        }}
                        onMouseOver={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = '#f1f5f9';
                            e.currentTarget.style.color = '#0f172a';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = '#334155';
                          }
                        }}
                        title={isMr ? item.label_mr : item.label_en}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', minWidth: 0 }}>
                          <span
                            style={{
                              color: isActive ? '#ea580c' : '#64748b',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconComp size={17} />
                          </span>
                          {!isCollapsed && (
                            <span
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {isMr ? item.label_mr : item.label_en}
                            </span>
                          )}
                        </div>

                        {!isCollapsed && item.badge && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '750',
                              padding: '2px 6px',
                              borderRadius: '9999px',
                              background: bTheme.bg,
                              color: bTheme.text,
                              border: `1px solid ${bTheme.border}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer with Worker Identity Strip */}
        <div
          style={{
            marginTop: '16px',
            paddingTop: '10px',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: isCollapsed ? '4px 0' : '6px 8px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1px solid #f1f5f9',
              justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
          >
            <div
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF671F 0%, #ea580c 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: '800',
                flexShrink: 0,
              }}
            >
              {(profileData.fullName || user?.full_name || 'K').charAt(0)}
            </div>
            {!isCollapsed && (
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: '750',
                    color: '#0f172a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {profileData.fullName || user?.full_name || 'कार्यकर्ता'}
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>
                  {isMr ? 'बूथ कार्यकर्ता' : 'Field Worker'}
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#fef2f2',
              border: '1px solid #fee2e2',
              color: '#dc2626',
              padding: isCollapsed ? '8px 0' : '7px 10px',
              borderRadius: '7px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#fee2e2';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#fef2f2';
            }}
            title={t('signout')}
          >
            <span>🚪</span>
            {!isCollapsed && <span>{t('signout')}</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          background: '#f8fafc',
          position: 'relative',
        }}
      >
        {/* STICKY TOP HEADER BAR */}
        <header
          style={{
            height: '64px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            position: 'sticky',
            top: 0,
            zIndex: 40,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
          }}
        >
          {/* Left: BackButton & Current Tab Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            {user?.roles?.some((r) => r === 'ADMIN' || r === 'OFFICER') ? (
              <BackButton fallbackPath="/admin" text={isMr ? 'परत' : 'Back'} />
            ) : (
              <BackButton fallbackPath="/" text={isMr ? 'मुख्य' : 'Home'} />
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <span style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', whiteSpace: 'nowrap' }}>
                {isMr ? currentNav?.label_mr || activeTab : currentNav?.label_en || activeTab}
              </span>
              <span style={{ color: '#cbd5e1' }}>•</span>
              <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isMr ? 'बूथ कार्य संचलन' : 'Field Operations'}
              </span>
            </div>
          </div>

          {/* Right: Network Status, Sync Button, Clock, Attendance Pill, Language Toggle, Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Live Network & Offline Sync Status Widget */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '5px 10px',
                  borderRadius: '8px',
                  fontSize: '11.5px',
                  fontWeight: '700',
                  background: isOnline ? '#ecfdf5' : '#fff7ed',
                  border: isOnline ? '1px solid #a7f3d0' : '1px solid #fed7aa',
                  color: isOnline ? '#059669' : '#ea580c',
                  transition: 'all 0.2s ease',
                }}
                title={isOnline ? (isMr ? 'इंटरनेट जोडणी सक्रिय (Online)' : 'Connected to server') : (isMr ? 'ऑफलाइन मोड: माहिती डिव्हाइसवर साठवली जात आहे' : 'Offline mode: saving locally')}
              >
                {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
                <span>
                  {isOnline 
                    ? (isMr ? 'ऑनलाइन (Online)' : 'Online') 
                    : (isMr ? 'ऑफलाइन (Offline)' : 'Offline')}
                </span>
              </div>

              {/* Offline Pending Sync Button */}
              {offlineQueueCount > 0 && (
                <button
                  type="button"
                  onClick={() => handleSyncQueue(false)}
                  disabled={isSyncing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    fontSize: '11.5px',
                    fontWeight: '800',
                    background: '#fef3c7',
                    border: '1px solid #fde68a',
                    color: '#b45309',
                    cursor: isSyncing ? 'wait' : 'pointer',
                    boxShadow: '0 1px 3px rgba(180, 83, 9, 0.1)',
                  }}
                  title={isMr ? 'प्रलंबित ऑफलाइन नोंदी डेटाबेसमध्ये पाठवा' : 'Sync pending offline records'}
                >
                  <RefreshCw size={12} style={{ animation: isSyncing ? 'spin 1s linear infinite' : 'none' }} />
                  <span>
                    {isSyncing 
                      ? (isMr ? 'सिंक होत आहे...' : 'Syncing...') 
                      : (isMr ? `⚡ ${offlineQueueCount} सिंक करा` : `⚡ Sync (${offlineQueueCount})`)}
                  </span>
                </button>
              )}
            </div>

            {/* Live Indian Standard Time (IST) Clock */}
            <LiveClock isMr={isMr} variant="header" />

            {/* Live Attendance Status Pill */}
            <div
              onClick={() => setActiveTab('Attendance')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: '700',
                cursor: 'pointer',
                background: attendanceState === 'Punched In' ? '#ecfdf5' : attendanceState === 'Completed' ? '#f0fdf4' : '#fff7ed',
                border: attendanceState === 'Punched In' ? '1px solid #a7f3d0' : attendanceState === 'Completed' ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                color: attendanceState === 'Punched In' ? '#059669' : attendanceState === 'Completed' ? '#15803d' : '#ea580c',
              }}
              title={isMr ? 'हजेरी तपशील पहा' : 'View Attendance Details'}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '3px',
                  background: attendanceState === 'Punched In' ? '#10b981' : attendanceState === 'Completed' ? '#22c55e' : '#f97316',
                }}
              />
              <span>
                {attendanceState === 'Punched In'
                  ? (isMr ? 'हजर (Punched In)' : 'Punched In')
                  : attendanceState === 'Completed'
                  ? (isMr ? 'काम पूर्ण' : 'Completed')
                  : (isMr ? 'उपस्थिती बाकी' : 'Not Checked In')}
              </span>
            </div>

            {/* Language Switcher (English Primary) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '7px',
                padding: '2px',
              }}
            >
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                style={{
                  padding: '3px 9px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  background: language === 'en' ? '#c2410c' : 'transparent',
                  color: language === 'en' ? '#ffffff' : '#475569',
                }}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => changeLanguage('mr')}
                style={{
                  padding: '3px 9px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  background: language === 'mr' ? '#c2410c' : 'transparent',
                  color: language === 'mr' ? '#ffffff' : '#475569',
                }}
              >
                मराठी
              </button>
            </div>

            {/* User Avatar Badge */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #FF671F 0%, #ea580c 100%)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '800',
                fontSize: '13px',
              }}
              title={profileData.fullName}
            >
              {(profileData.fullName || user?.full_name || 'K').charAt(0)}
            </div>
          </div>
        </header>

        {/* PAGE CONTENT CONTAINER */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
            maxWidth: '1600px',
            margin: '0 auto',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {renderContent()}
        </div>

        {/* FLOATING AI CAMPAIGN & FIELD ASSISTANT (MATCHING OFFICER/ADMIN DESK) */}
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
          {showFloatingChat ? (
            <div
              style={{
                width: '420px',
                height: '600px',
                maxHeight: 'calc(100vh - 48px)',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
                border: '1px solid #e2e8f0',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <AdminChatbotDesk
                lang={language}
                isFloating={true}
                onClose={() => setShowFloatingChat(false)}
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
                padding: '11px 18px',
                fontSize: '13px',
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
              title={isMr ? 'AI बूथ सहाय्यक उघडा' : 'Open Field AI Assistant'}
            >
              <span style={{ fontSize: '18px' }}>🤖</span>
              <span>{isMr ? 'AI बूथ सहाय्यक' : 'Field AI Bot'}</span>
              <span style={{ background: '#22c55e', width: '8px', height: '8px', borderRadius: '50%' }} />
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
