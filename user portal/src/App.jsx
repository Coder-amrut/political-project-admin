import React, { useState, useEffect, useRef } from 'react';
import './App.css';
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
  Headphones
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
import surveyData from './survey_data.json';
import Webcam from 'react-webcam';

function App() {
  const [voterData, setVoterData] = useState([
    { name: 'Jan', value1: 40, value2: 30 },
    { name: 'Feb', value1: 25, value2: 45 },
    { name: 'Mar', value1: 60, value2: 25 },
    { name: 'May', value1: 45, value2: 30 },
    { name: 'Jun', value1: 58, value2: 40 },
    { name: 'Jul', value1: 40, value2: 35 },
    { name: 'Aug', value1: 52, value2: 28 },
  ]);

  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    if (language === 'mr' || language === 'hi') {
      document.body.style.fontFamily = "'Devgiri', 'Inter', sans-serif";
    } else {
      document.body.style.fontFamily = "'Inter', sans-serif";
    }
  }, [language]);

  const t = (key) => translations[language]?.[key] || key;

  const [hasVoted, setHasVoted] = useState(false);
  const [votedCandidate, setVotedCandidate] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');
  const [selectedPartyFilter, setSelectedPartyFilter] = useState('All');
  const [candidateTab, setCandidateTab] = useState('About');

  const navItems = [
    { name: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
    { name: 'User Profile', key: 'userProfile', icon: User },
    { name: 'Contact & Meetings', key: 'contactMeetings', icon: Calendar },
    { name: 'Complaints', key: 'complaints', icon: AlertTriangle },
    { name: 'Survey', key: 'survey', icon: ClipboardCheck },
    { name: 'Attendance', key: 'attendance', icon: CalendarCheck },
    { name: 'Follow ups', key: 'followUps', icon: PhoneForwarded },
    { name: 'Tasks', key: 'tasks', icon: ClipboardList },
    { name: 'Voting', key: 'voting', icon: CheckSquare },
  ];

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: 'Rahul Dev Sharma',
    dob: '1988-08-14',
    phone: '+91 98765 43210',
    email: 'rahul.sharma@party.com',
    address: '102, Sankalp Heights, Linking Road, Andheri West, Mumbai 400053',
    assignedWard: 'Ward 42 - Andheri West',
    primaryBooths: '104, 105, 106, 112',
    joinDate: '2023-01-15',
    epic: 'ABC1234567'
  });

  const [contactTab, setContactTab] = useState('contacts');
  const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
  const [meetingsList, setMeetingsList] = useState([
    { title: 'Booth Strategy Planning', time: 'Today, 4:00 PM', location: 'Ward 42 Office', attendees: '4 People', type: 'In-person' },
    { title: 'Weekly Campaign Sync', time: 'Tomorrow, 10:30 AM', location: 'Google Meet', attendees: '12 People', type: 'Virtual' },
    { title: 'Volunteer Training', time: 'Oct 5, 2:00 PM', location: 'Community Hall', attendees: '25 People', type: 'In-person' }
  ]);
  const [newMeeting, setNewMeeting] = useState({ title: '', time: '', location: '', attendees: '', type: 'Virtual' });

  const [complaintFilter, setComplaintFilter] = useState('All');

  const [complaintsData, setComplaintsData] = useState([
    { id: 'C-1001', name: 'Rajesh Kumar', phone: '+91 98765 12345', category: 'Water Supply', desc: 'No water supply in block 4 for 2 days', date: 'Oct 02, 2026', status: 'Pending' },
    { id: 'C-1002', name: 'Sneha Joshi', phone: '+91 87654 23456', category: 'Street Light', desc: 'Street light near main gate is broken', date: 'Oct 01, 2026', status: 'Resolved' },
    { id: 'C-1003', name: 'Vikas Singh', phone: '+91 76543 34567', category: 'Garbage', desc: 'Garbage not collected since Monday', date: 'Sep 30, 2026', status: 'In Progress' },
    { id: 'C-1004', name: 'Pooja Rane', phone: '+91 99887 45678', category: 'Road Repair', desc: 'Pothole needs filling near school', date: 'Sep 28, 2026', status: 'Pending' },
  ]);

  const [attendanceState, setAttendanceState] = useState('Not Started');
  const [attendanceHistory, setAttendanceHistory] = useState([]);

  const [votersList, setVotersList] = useState([
    { id: 1, name: 'Anjali Verma', phone: '9876543210', status: 'Supportive', contacted: true, ward: 'Ward 42' },
    { id: 2, name: 'R. K. Singh', phone: '9876543211', status: 'Needs Info', contacted: true, ward: 'Ward 42' },
    { id: 3, name: 'Priya Sharma', phone: '9876543212', status: 'Undecided', contacted: false, ward: 'Ward 42' },
    { id: 4, name: 'Amit Kumar', phone: '9876543213', status: 'Supportive', contacted: true, ward: 'Ward 42' },
    { id: 5, name: 'Neha Gupta', phone: '9876543214', status: 'Opposed', contacted: true, ward: 'Ward 42' },
    { id: 6, name: 'Vikram Singh', phone: '9876543215', status: 'Unknown', contacted: false, ward: 'Ward 42' },
    { id: 7, name: 'Sneha Patel', phone: '9876543216', status: 'Supportive', contacted: true, ward: 'Ward 42' },
    { id: 8, name: 'Rahul Desai', phone: '9876543217', status: 'Needs Info', contacted: true, ward: 'Ward 42' },
    { id: 9, name: 'Sanjay Patil', phone: '9876543218', status: 'Supportive', contacted: true, ward: 'Ward 42' },
    { id: 10, name: 'Pooja Rane', phone: '9876543219', status: 'Unknown', contacted: false, ward: 'Ward 42' },
    { id: 11, name: 'Meena Kapoor', phone: '9876543220', status: 'Supportive', contacted: true, ward: 'Ward 42' },
    { id: 12, name: 'Rajesh Khanna', phone: '9876543221', status: 'Undecided', contacted: false, ward: 'Ward 42' }
  ]);

  const dashboardStats = {
    totalAssigned: votersList.length,
    contacted: votersList.filter(v => v.contacted).length,
    supportive: votersList.filter(v => v.status === 'Supportive').length,
  };

  const [activities, setActivities] = useState([
    { id: 1, type: 'users', bgColor: '#E0E7FF', color: 'var(--primary)', title: 'Marked Anjali Verma as Supportive', time: '2 hours ago • Ward 42' },
    { id: 2, type: 'clock', bgColor: '#FEF3C7', color: 'var(--warning)', title: 'Scheduled follow-up with R. K. Singh', time: '4 hours ago • Needs Info' },
    { id: 3, type: 'clipboard', bgColor: '#DCFCE7', color: 'var(--success)', title: 'Completed Booth Level Meeting', time: 'Yesterday at 5:00 PM' }
  ]);

  const pendingFollowUps = complaintsData.filter(c => c.status === 'Pending' || c.status === 'In Progress').length + meetingsList.length;

  const addActivity = (type, title, bgColor, color) => {
    setActivities(prev => [
      { id: Date.now(), type, bgColor, color, title, time: 'Just now' },
      ...prev.slice(0, 4) // Keep only recent 5
    ]);
  };

  const [isScanningFace, setIsScanningFace] = useState(false);
  const webcamRef = useRef(null);

  const startFaceScan = () => {
    setIsScanningFace(true);
  };

  const confirmPunch = () => {
    let photoSrc = null;
    if (webcamRef.current) {
      photoSrc = webcamRef.current.getScreenshot();
    }

    setIsScanningFace(false);
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  
    if (attendanceState === 'Not Started') {
      setAttendanceState('Punched In');
      setAttendanceHistory([{ date: today, punchIn: time, punchOut: '-', status: 'Present', punchInPhoto: photoSrc, punchOutPhoto: null }, ...attendanceHistory]);
      addActivity('clock', 'Punched In for the day', '#E0E7FF', 'var(--primary)');
    } else if (attendanceState === 'Punched In') {
      setAttendanceState('Completed');
      const newHistory = [...attendanceHistory];
      if (newHistory.length > 0 && newHistory[0].date === today) {
        newHistory[0] = { ...newHistory[0], punchOut: time, punchOutPhoto: photoSrc };
        setAttendanceHistory(newHistory);
      }
    }
  };

  const handleUpdateComplaintStatus = (id, newStatus) => {
    const complaint = complaintsData.find(c => c.id === id);
    setComplaintsData(complaintsData.map(c => c.id === id ? { ...c, status: newStatus } : c));
    addActivity('clipboard', `Updated complaint ${id} to ${newStatus}`, '#DCFCE7', 'var(--success)');
    // Stats derived dynamically from data arrays
  };

  const handleScheduleMeeting = () => {
    if(newMeeting.title) {
      setMeetingsList([{...newMeeting, attendees: newMeeting.attendees || '1 Person'}, ...meetingsList]);
      setIsSchedulingMeeting(false);
      addActivity('users', `Scheduled meeting: ${newMeeting.title}`, '#FEF3C7', 'var(--warning)');
      setNewMeeting({ title: '', time: '', location: '', attendees: '', type: 'Virtual' });
      // Stats derived dynamically from data arrays
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveProfile = () => {
    // Save logic
    setIsEditingProfile(false);
  };

  // Helper to render content based on active tab
  const renderContent = () => {
    if (activeTab === 'Dashboard') {
      return (
        <>
          <div className="page-header">
            <div>
              <h1 className="page-title">{t('dashboardOverview')}</h1>
              <div className="page-subtitle">{t('campaignProgress')}</div>
            </div>
          </div>

          {/* Top Layout */}
          <div className="top-layout">
            <div className="top-left-section">
              {/* Stats Row */}
              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-blue">
                    <Users size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{dashboardStats.totalAssigned.toLocaleString()}</div>
                    <div className="stat-label">{t('totalAssigned')}</div>
                    <div className="stat-trend trend-up">
                      <TrendingUp size={12} /> <span>+12%</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-green">
                    <PhoneCall size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{dashboardStats.contacted.toLocaleString()}</div>
                    <div className="stat-label">{t('contacted')}</div>
                    <div className="stat-trend trend-up">
                      <TrendingUp size={12} /> <span>+5%</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-orange">
                    <Clock size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{pendingFollowUps}</div>
                    <div className="stat-label">{t('pendingFollowUps')}</div>
                    <div className="stat-trend trend-down">
                      <AlertCircle size={12} /> <span>Needs attention</span>
                    </div>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-icon-wrapper stat-icon-blue">
                    <BarChart2 size={20} />
                  </div>
                  <div className="stat-info">
                    <div className="stat-value">{dashboardStats.supportive.toLocaleString()}</div>
                    <div className="stat-label">{t('supportiveVoters')}</div>
                    <div className="stat-trend trend-up">
                      <TrendingUp size={12} /> <span>+18%</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Banner Right */}
            <div className="banner-card">
              <div className="banner-content">
                <h2 className="banner-title">{t('strongerCommunities')}</h2>
                <p className="banner-subtitle">{t('brighterTomorrow')}</p>
              </div>
              <svg className="banner-illustration" viewBox="0 0 200 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M140 10 L140 60 L180 60 Z" fill="#FF5722"/>
                <rect x="135" y="10" width="4" height="140" fill="#475569"/>
                <circle cx="110" cy="80" r="12" fill="#F97316"/>
                <path d="M90 150 C90 110, 130 110, 130 150 Z" fill="#F97316"/>
                <circle cx="150" cy="90" r="10" fill="#F97316"/>
                <path d="M135 150 C135 120, 165 120, 165 150 Z" fill="#F97316"/>
                <circle cx="70" cy="110" r="8" fill="#16A34A"/>
                <path d="M55 150 C55 130, 85 130, 85 150 Z" fill="#16A34A"/>
              </svg>
            </div>
          </div>

          {/* Bottom Layout */}
          <div className="bottom-layout">
            {/* Chart Section */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <h2 className="card-title">{t('voterOutreachTrends')}</h2>
                <div className="chart-header">
                  <div className="chart-legend">
                    <div className="legend-dot"></div>
                    <span>{t('contacted')}</span>
                  </div>
                  <select className="select-dropdown">
                    <option>{t('last6Months')}</option>
                  </select>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: '220px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={voterData} barGap={0}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} />
                    <Tooltip 
                      cursor={{fill: '#f1f5f9'}}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value1" fill="#F97316" radius={[4, 4, 0, 0]} barSize={24} name="Contacted" />
                    <Bar dataKey="value2" fill="#FED7AA" radius={[4, 4, 0, 0]} barSize={24} name="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Activities Section */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title" style={{color: 'var(--text-primary)'}}>{t('recentActivities')}</h2>
                <button className="card-action">{t('viewAll')}</button>
              </div>
              <div className="activity-list">
                {activities.map(activity => (
                  <div className="activity-item" key={activity.id}>
                    <div className="activity-icon" style={{ backgroundColor: activity.bgColor, color: activity.color }}>
                      {activity.type === 'users' && <Users size={16} />}
                      {activity.type === 'clock' && <Clock size={16} />}
                      {activity.type === 'clipboard' && <ClipboardList size={16} />}
                    </div>
                    <div className="activity-details">
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-time">{activity.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }
    
    if (activeTab === 'User Profile') {
      return (
        <div className="profile-container">
          <div className="page-header">
            <div>
              <h1 className="page-title">User Profile</h1>
              <div className="page-subtitle">Manage your personal and campaign details.</div>
            </div>
            {isEditingProfile ? (
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="btn-outline" onClick={() => setIsEditingProfile(false)}>
                  <X size={16} />
                  <span>Cancel</span>
                </button>
                <button className="btn-success" onClick={saveProfile}>
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            ) : (
              <button className="btn-primary" onClick={() => setIsEditingProfile(true)}>
                <Edit2 size={16} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <div className="profile-header-card">
            <div className="profile-cover"></div>
            <div className="profile-header-content">
              <div className="profile-avatar-section">
                <div className="profile-avatar-large">
                  <div className="avatar-inner">R</div>
                </div>
                <div className="profile-title">
                  <h2>{profileData.fullName.split(' ')[0]} {profileData.fullName.split(' ').slice(-1)}</h2>
                  <p><MapPin size={16} /> Mumbai, Maharashtra</p>
                  <span className="badge-role">Ward Coordinator</span>
                </div>
              </div>
              <button className="btn-outline" style={{marginTop: '1rem'}}>
                <Shield size={16} />
                <span>Change Password</span>
              </button>
            </div>
          </div>

          <div className="profile-grid">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Personal Information</h2>
              </div>
              <div className="info-row">
                <div className="info-group">
                  <div className="info-label">Full Name</div>
                  {isEditingProfile ? (
                    <input type="text" name="fullName" className="form-input" value={profileData.fullName} onChange={handleProfileChange} />
                  ) : (
                    <div className="info-value">{profileData.fullName}</div>
                  )}
                </div>
                <div className="info-group">
                  <div className="info-label">Date of Birth</div>
                  {isEditingProfile ? (
                    <input type="date" name="dob" className="form-input" value={profileData.dob} onChange={handleProfileChange} />
                  ) : (
                    <div className="info-value">{new Date(profileData.dob).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  )}
                </div>
                <div className="info-group">
                  <div className="info-label">Phone Number</div>
                  {isEditingProfile ? (
                    <input type="text" name="phone" className="form-input" value={profileData.phone} onChange={handleProfileChange} />
                  ) : (
                    <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Phone size={14} color="var(--text-secondary)" />
                      {profileData.phone}
                    </div>
                  )}
                </div>
                <div className="info-group">
                  <div className="info-label">Email Address</div>
                  {isEditingProfile ? (
                    <input type="email" name="email" className="form-input" value={profileData.email} onChange={handleProfileChange} />
                  ) : (
                    <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={14} color="var(--text-secondary)" />
                      {profileData.email}
                    </div>
                  )}
                </div>
                <div className="info-group" style={{ gridColumn: '1 / -1' }}>
                  <div className="info-label">Residential Address</div>
                  {isEditingProfile ? (
                    <textarea name="address" className="form-input" value={profileData.address} onChange={handleProfileChange} rows="2"></textarea>
                  ) : (
                    <div className="info-value">{profileData.address}</div>
                  )}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Campaign Details</h2>
              </div>
              <div className="info-group">
                <div className="info-label">Assigned Ward</div>
                {isEditingProfile ? (
                  <input type="text" name="assignedWard" className="form-input" value={profileData.assignedWard} onChange={handleProfileChange} />
                ) : (
                  <div className="info-value">{profileData.assignedWard}</div>
                )}
              </div>
              <div className="info-group">
                <div className="info-label">Primary Booths</div>
                {isEditingProfile ? (
                  <input type="text" name="primaryBooths" className="form-input" value={profileData.primaryBooths} onChange={handleProfileChange} />
                ) : (
                  <div className="info-value">{profileData.primaryBooths}</div>
                )}
              </div>
              <div className="info-group">
                <div className="info-label">Join Date</div>
                {isEditingProfile ? (
                  <input type="date" name="joinDate" className="form-input" value={profileData.joinDate} onChange={handleProfileChange} />
                ) : (
                  <div className="info-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CalendarDays size={14} color="var(--text-secondary)" />
                    {new Date(profileData.joinDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </div>
                )}
              </div>
              <div className="info-group">
                <div className="info-label">Voter ID (EPIC)</div>
                {isEditingProfile ? (
                  <input type="text" name="epic" className="form-input" value={profileData.epic} onChange={handleProfileChange} />
                ) : (
                  <div className="info-value">{profileData.epic}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Contact & Meetings') {
      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="page-title">Contact & Meetings</h1>
              <div className="page-subtitle">Manage your network and schedule campaign meetings.</div>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem', backgroundColor: 'white', padding: '0.25rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setContactTab('contacts')}
                style={{ 
                  padding: '0.5rem 1.25rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: 'none', 
                  background: contactTab === 'contacts' ? 'var(--bg-light-blue)' : 'transparent', 
                  color: contactTab === 'contacts' ? 'var(--primary)' : 'var(--text-secondary)', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Contacts
              </button>
              <button 
                onClick={() => setContactTab('meetings')}
                style={{ 
                  padding: '0.5rem 1.25rem', 
                  borderRadius: 'var(--radius-sm)', 
                  border: 'none', 
                  background: contactTab === 'meetings' ? 'var(--bg-light-blue)' : 'transparent', 
                  color: contactTab === 'meetings' ? 'var(--primary)' : 'var(--text-secondary)', 
                  fontWeight: 500, 
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Meetings
              </button>
            </div>
          </div>

          {contactTab === 'contacts' && (
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <h2 className="card-title">My Contacts</h2>
                  <div className="header-search" style={{ width: '250px', padding: '0.35rem 1rem' }}>
                    <Search size={14} color="#94a3b8" />
                    <input type="text" placeholder="Search contacts..." style={{ fontSize: '0.75rem' }} />
                  </div>
                </div>
              </div>
              
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Role / Info</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Sanjay Patil', phone: '+91 91234 56780', role: 'Booth Adhyaksh', status: 'Active' },
                      { name: 'Priya Sharma', phone: '+91 87654 32109', role: 'Voter', status: 'Pending' },
                      { name: 'Amit Desai', phone: '+91 76543 21098', role: 'Volunteer', status: 'Active' },
                      { name: 'Sunita Verma', phone: '+91 99887 76655', role: 'Voter', status: 'Follow Up' }
                    ].map((contact, i) => (
                      <tr key={i}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--bg-light-blue)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '0.75rem' }}>
                              {contact.name.charAt(0)}
                            </div>
                            <span style={{ fontWeight: 500 }}>{contact.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{contact.phone}</td>
                        <td>{contact.role}</td>
                        <td>
                          <span className={`badge-status ${contact.status === 'Active' ? 'status-completed' : contact.status === 'Pending' ? 'status-pending' : 'status-progress'}`}>
                            {contact.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <button className="icon-btn icon-btn-primary" title="Call">
                              <PhoneCall size={16} color="var(--primary)" />
                            </button>
                            <button className="icon-btn icon-btn-success" title="Message">
                              <MessageCircle size={16} color="var(--success)" />
                            </button>
                            <button className="icon-btn">
                              <MoreVertical size={16} color="var(--text-secondary)" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {contactTab === 'meetings' && (
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">{isSchedulingMeeting ? 'Schedule New Meeting' : 'Upcoming Meetings'}</h2>
                {!isSchedulingMeeting && (
                  <button className="btn-primary" onClick={() => setIsSchedulingMeeting(true)}>
                    <Plus size={16} />
                    <span>Schedule Meeting</span>
                  </button>
                )}
              </div>
              
              {isSchedulingMeeting ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
                  <div className="info-group">
                    <label className="info-label">Meeting Title</label>
                    <input type="text" className="form-input" placeholder="e.g. Ward Sync" value={newMeeting.title} onChange={(e) => setNewMeeting({...newMeeting, title: e.target.value})} />
                  </div>
                  <div className="info-row">
                    <div className="info-group">
                      <label className="info-label">Date & Time</label>
                      <input type="text" className="form-input" placeholder="e.g. Oct 10, 5:00 PM" value={newMeeting.time} onChange={(e) => setNewMeeting({...newMeeting, time: e.target.value})} />
                    </div>
                    <div className="info-group">
                      <label className="info-label">Meeting Type</label>
                      <select className="form-input" value={newMeeting.type} onChange={(e) => setNewMeeting({...newMeeting, type: e.target.value})}>
                        <option value="Virtual">Virtual</option>
                        <option value="In-person">In-person</option>
                      </select>
                    </div>
                  </div>
                  <div className="info-row">
                    <div className="info-group">
                      <label className="info-label">Location / Link</label>
                      <input type="text" className="form-input" placeholder="Address or URL" value={newMeeting.location} onChange={(e) => setNewMeeting({...newMeeting, location: e.target.value})} />
                    </div>
                    <div className="info-group">
                      <label className="info-label">Attendees</label>
                      <input type="text" className="form-input" placeholder="e.g. 5 People" value={newMeeting.attendees} onChange={(e) => setNewMeeting({...newMeeting, attendees: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button className="btn-outline" onClick={() => setIsSchedulingMeeting(false)}>Cancel</button>
                    <button className="btn-success" onClick={handleScheduleMeeting}>Schedule Meeting</button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {meetingsList.map((meeting, i) => (
                    <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ padding: '0.5rem', backgroundColor: meeting.type === 'Virtual' ? '#E0E7FF' : '#FEF3C7', color: meeting.type === 'Virtual' ? 'var(--primary)' : 'var(--warning)', borderRadius: 'var(--radius-sm)' }}>
                          {meeting.type === 'Virtual' ? <Video size={20} /> : <Users size={20} />}
                        </div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: '9999px' }}>
                          {meeting.type}
                        </span>
                      </div>
                      
                      <div>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{meeting.title}</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          <Clock size={14} /> {meeting.time}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          <MapPin size={14} /> {meeting.location}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{meeting.attendees}</span>
                        <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>Manage</button>
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
    
    if (activeTab === 'Complaints') {
      const filteredComplaints = complaintFilter === 'All' ? complaintsData : complaintsData.filter(c => c.status === complaintFilter);
      
      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="page-title">Complaints Management</h1>
              <div className="page-subtitle">Track and resolve issues reported by citizens.</div>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div className="header-search" style={{ width: '250px', padding: '0.35rem 1rem' }}>
                <Search size={14} color="#94a3b8" />
                <input type="text" placeholder="Search ID, Name or Category" style={{ fontSize: '0.75rem' }} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '1.5rem' }}>
                {['All', 'Pending', 'Action Taken', 'In Progress', 'Resolved'].map(filter => (
                  <button 
                    key={filter}
                    onClick={() => setComplaintFilter(filter)}
                    style={{ 
                      padding: '0.25rem 0', 
                      border: 'none', 
                      background: 'transparent',
                      color: complaintFilter === filter ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: complaintFilter === filter ? 600 : 500,
                      borderBottom: complaintFilter === filter ? '2px solid var(--primary)' : '2px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      marginBottom: '-1rem'
                    }}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Citizen Details</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{complaint.id}</td>
                      <td>
                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{complaint.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{complaint.phone}</div>
                      </td>
                      <td>
                        <span style={{ backgroundColor: 'var(--bg-main)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
                          {complaint.category}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px' }}>
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={complaint.desc}>
                          {complaint.desc}
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-secondary)' }}>{complaint.date}</td>
                      <td>
                        <span className={`badge-status ${complaint.status === 'Resolved' ? 'status-completed' : complaint.status === 'In Progress' ? 'status-progress' : complaint.status === 'Action Taken' ? 'status-completed' : 'status-pending'}`} style={complaint.status === 'Action Taken' ? {backgroundColor: '#DBEAFE', color: 'var(--primary)'} : {}}>
                          {complaint.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button 
                            className="icon-btn icon-btn-primary" 
                            title="Action Taken"
                            onClick={() => handleUpdateComplaintStatus(complaint.id, 'Action Taken')}
                          >
                            <Play size={16} color="var(--primary)" />
                          </button>
                          <button 
                            className="icon-btn icon-btn-warning" 
                            title="In Progress"
                            onClick={() => handleUpdateComplaintStatus(complaint.id, 'In Progress')}
                          >
                            <Clock size={16} color="var(--warning)" />
                          </button>
                          <button 
                            className="icon-btn icon-btn-success" 
                            title="Mark as Resolved"
                            onClick={() => handleUpdateComplaintStatus(complaint.id, 'Resolved')}
                          >
                            <CheckCheck size={16} color="var(--success)" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'Attendance') {
      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="page-title">Attendance Tracking</h1>
              <div className="page-subtitle">Mark your daily attendance and view your history.</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', gap: '2rem' }}>
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Current Status</h3>
                <span className={`badge-status ${attendanceState === 'Punched In' ? 'status-progress' : attendanceState === 'Completed' ? 'status-completed' : 'status-pending'}`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                  {attendanceState === 'Punched In' ? 'On Duty (Punched In)' : attendanceState === 'Completed' ? 'Shift Completed' : 'Off Duty (Not Started)'}
                </span>
              </div>
              
              {isScanningFace ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ position: 'relative', width: '220px', height: '220px', borderRadius: '50%', overflow: 'hidden', border: '8px solid var(--primary)', boxShadow: '0 4px 15px rgba(249, 115, 22, 0.3)' }}>
                    <Webcam 
                      ref={webcamRef}
                      audio={false} 
                      screenshotFormat="image/jpeg"
                      width="100%" 
                      height="100%" 
                      style={{ objectFit: 'cover' }} 
                    />
                    {/* Scanning Animation Overlay */}
                    <div style={{
                      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                      background: 'linear-gradient(to bottom, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.3) 50%, rgba(249, 115, 22, 0.1) 100%)',
                      animation: 'scanLine 1.5s infinite linear', zIndex: 10
                    }}></div>
                    <style>{`
                      @keyframes scanLine {
                        0% { transform: translateY(-100%); }
                        100% { transform: translateY(100%); }
                      }
                    `}</style>
                  </div>
                  <button 
                    onClick={confirmPunch}
                    style={{ padding: '0.875rem 3rem', fontSize: '1.1rem', fontWeight: 600, backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)', transition: 'all 0.2s ease' }}
                    onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 15px rgba(249, 115, 22, 0.35)'; }}
                    onMouseOut={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.25)'; }}
                  >
                    {attendanceState === 'Punched In' ? 'Punch Out' : 'Punch In'}
                  </button>
                </div>
              ) : attendanceState === 'Completed' ? (
                <div style={{ width: '180px', height: '180px', borderRadius: '50%', backgroundColor: '#F3F4F6', color: '#9CA3AF', border: '8px solid #E5E7EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', fontSize: '1.25rem', fontWeight: 600 }}>
                  <UserCheck size={48} />
                  <span>Done for Today</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem 0' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {attendanceState === 'Punched In' ? 'Ready to Punch Out?' : 'Ready to Punch In?'}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button 
                      onClick={startFaceScan}
                      style={{ padding: '0.875rem 3rem', fontSize: '1.1rem', fontWeight: 600, backgroundColor: 'var(--success)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)', transition: 'all 0.2s ease' }}
                      onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 15px rgba(22, 163, 74, 0.35)'; }}
                      onMouseOut={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(22, 163, 74, 0.25)'; }}
                    >
                      Yes
                    </button>
                    <button 
                      onClick={() => {}}
                      style={{ padding: '0.875rem 3rem', fontSize: '1.1rem', fontWeight: 600, backgroundColor: 'var(--error)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)', transition: 'all 0.2s ease' }}
                      onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 15px rgba(220, 38, 38, 0.35)'; }}
                      onMouseOut={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.25)'; }}
                    >
                      No
                    </button>
                  </div>
                </div>
              )}
              
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', textAlign: 'center' }}>
                {attendanceState === 'Completed' ? 'Great job today! See you tomorrow.' : attendanceState === 'Punched In' ? 'Remember to punch out when your shift ends.' : 'Punch in to start your work day.'}
              </p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Attendance History</h3>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Punch In</th>
                      <th>Punch Out</th>
                      <th>Photo</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceHistory.map((record, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{record.date}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{record.punchIn}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{record.punchOut}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {record.punchInPhoto ? (
                              <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }} title="Punch In Photo">
                                <img src={record.punchInPhoto} alt="Punch In" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.6rem', textAlign: 'center' }}>IN</span>
                              </div>
                            ) : (
                              <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#F1F5F9', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>
                            )}
                            {record.punchOutPhoto ? (
                              <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border)' }} title="Punch Out Photo">
                                <img src={record.punchOutPhoto} alt="Punch Out" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: '0.6rem', textAlign: 'center' }}>OUT</span>
                              </div>
                            ) : (
                              <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#F1F5F9', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>-</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status ${record.status === 'Present' ? 'status-completed' : 'status-progress'}`} style={record.status === 'Absent' ? {backgroundColor: '#FEE2E2', color: '#DC2626'} : {}}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'Voting') {
      const candidates = [
        { 
          id: 1, 
          name: 'Ramesh Patil', 
          party: 'Congress', 
          symbol: '✋', 
          description: 'Experienced leader with vision for development and transparency.',
          photo: 'https://images.unsplash.com/photo-1555848962-6e79363ec58f?auto=format&fit=crop&w=150&q=80',
          about: 'Ramesh Patil is a dedicated leader with years of experience in organizational development. His focus is on transparency, digital transformation, and youth empowerment. He believes in a people-first approach and sustainable growth.',
          vision: 'A transparent, digital-first administration focusing on sustainable development, local business growth, and comprehensive youth welfare programs.',
          experience: '20+ years in public service, 2 terms as District President, successfully led 5 major statewide outreach campaigns.',
          supporters: 'Endorsed by the State Youth Wing, Local Farmers Association, and 150+ community leaders.',
          keyPoints: ['Transparency', 'Youth Development', 'Digital Growth', 'Strong Organization']
        },
        { 
          id: 2, 
          name: 'Suresh Deshmukh', 
          party: 'Bhajap', 
          symbol: '🪷', 
          description: 'Working for a stronger and united organization.',
          photo: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=150&q=80',
          about: 'Suresh Deshmukh has been a prominent figure in grassroot level operations. His main goal is to unify the various factions and work towards a common goal of prosperity and unity.',
          vision: 'To build a robust infrastructure, support small businesses, and ensure basic amenities reach every household in the district.',
          experience: '15 years of grassroots activism. Served as Ward Member for 3 consecutive terms and improved local water supply.',
          supporters: 'Backed by the local Vyapari Mandal, Women\'s Cooperative, and various community self-help groups.',
          keyPoints: ['Unity', 'Grassroot Work', 'Prosperity', 'Strong Leadership']
        },
        { 
          id: 3, 
          name: 'Arun Munde', 
          party: 'Shivsena', 
          symbol: '🏹', 
          description: 'Committed to youth empowerment and digital growth.',
          photo: 'https://images.unsplash.com/photo-1523287562758-66c7fc58967f?auto=format&fit=crop&w=150&q=80',
          about: 'Arun Munde brings a fresh perspective to the table. He is highly focused on modernizing the approach and empowering the youth to take up leadership roles.',
          vision: 'Empowering the next generation with modern education hubs, tech parks, and dedicated skill development centers.',
          experience: 'Former student union leader and founder of a statewide youth empowerment NGO affecting over 10,000 students.',
          supporters: 'Strongly supported by college student unions, local tech startups, and young entrepreneurs.',
          keyPoints: ['Youth Empowerment', 'Modernization', 'Education', 'Job Creation']
        },
        { 
          id: 4, 
          name: 'Vishal Pawar', 
          party: 'Rashtravadi', 
          symbol: '⏰', 
          description: 'Focusing on agriculture, youth welfare and rural development.',
          photo: 'https://images.unsplash.com/photo-1512314889357-e157c22f938d?auto=format&fit=crop&w=150&q=80',
          about: 'Vishal Pawar has a strong background in rural development and agriculture. He aims to bring better policies for farmers and improve the overall infrastructure in rural areas.',
          vision: 'Ensuring fair prices for farmers, modernized irrigation, and better road connectivity for all rural areas.',
          experience: 'Served on the State Agricultural Board for 8 years. Successfully implemented drip irrigation schemes in 50+ villages.',
          supporters: 'Widely endorsed by the State Farmers Union, Rural Cooperatives, and Agricultural Associations.',
          keyPoints: ['Agriculture', 'Rural Development', 'Farmers Welfare', 'Infrastructure']
        },
        { 
          id: 5, 
          name: 'Rajesh Kumar', 
          party: 'Other Party', 
          symbol: '🐘', 
          description: 'Independent thinker bringing fresh ideas for community welfare.',
          photo: 'https://images.unsplash.com/photo-1525011268546-bf3f9b007f6a?auto=format&fit=crop&w=150&q=80',
          about: 'Rajesh Kumar represents alternative voices in the political landscape. He stands for equal rights, social justice, and immediate action on local issues.',
          vision: 'A corruption-free local governance model with direct citizen participation in major budget allocations.',
          experience: '10 years as a social activist and lawyer fighting for marginalized communities and human rights.',
          supporters: 'Supported by various independent NGOs, civil rights groups, and grassroots organizers.',
          keyPoints: ['Social Justice', 'Equal Rights', 'Local Issues', 'Community First']
        }
      ];

      const filteredCandidates = candidates.filter(candidate => {
        const matchesSearch = candidate.name.toLowerCase().includes(candidateSearchQuery.toLowerCase());
        const matchesParty = selectedPartyFilter === 'All' || candidate.party === selectedPartyFilter;
        return matchesSearch && matchesParty;
      });

      if (viewingCandidate) {
        return (
          <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'transparent' }}>
            <button 
              onClick={() => setViewingCandidate(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#F97316', background: 'none', border: 'none', fontSize: '1rem', fontWeight: '600', cursor: 'pointer', padding: '0.5rem 0', width: 'max-content', transition: 'color 0.2s' }}
            >
              <ArrowLeft size={20} /> Back to Candidates
            </button>
            
            <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '3.5rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)', border: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <div style={{ position: 'relative' }}>
                  <img src={viewingCandidate.photo} alt={viewingCandidate.name} style={{ width: '220px', height: '220px', borderRadius: '28px', objectFit: 'cover', boxShadow: '0 15px 35px -5px rgba(0, 0, 0, 0.15)', border: '4px solid white' }} />
                  <div style={{ position: 'absolute', bottom: '-15px', right: '-15px', background: 'white', borderRadius: '50%', padding: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <span style={{ fontSize: '2.5rem', display: 'block', transform: 'translateY(-2px)' }}>{viewingCandidate.symbol}</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingTop: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <h1 style={{ fontSize: '2.75rem', fontWeight: '800', color: '#0F172A', margin: '0 0 0.75rem 0', letterSpacing: '-0.02em' }}>{viewingCandidate.name}</h1>
                    <div style={{ display: 'inline-block', backgroundColor: '#FFF7ED', color: '#F97316', padding: '0.4rem 1.25rem', borderRadius: '24px', fontWeight: '700', fontSize: '1rem', letterSpacing: '0.02em' }}>
                      {viewingCandidate.party}
                    </div>
                  </div>
                  <p style={{ color: '#475569', fontSize: '1.15rem', marginBottom: '2.5rem', maxWidth: '650px', lineHeight: '1.7' }}>
                    {viewingCandidate.description}
                  </p>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                    <button 
                      onClick={() => {
                        if (!hasVoted) {
                          setHasVoted(true);
                          setVotedCandidate(viewingCandidate.name);
                          addActivity('clipboard', `Cast a vote`, '#DCFCE7', 'var(--success)');
                          setViewingCandidate(null);
                        }
                      }}
                      style={{ padding: '1rem 3rem', fontSize: '1.1rem', background: hasVoted ? '#94a3b8' : 'linear-gradient(135deg, #F97316 0%, #F97316 100%)', color: 'white', border: 'none', borderRadius: '30px', fontWeight: '700', cursor: hasVoted ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', boxShadow: hasVoted ? 'none' : '0 10px 20px -5px rgba(249, 115, 22, 0.4)', transform: hasVoted ? 'none' : 'translateY(0)' }}
                      onMouseOver={(e) => { if(!hasVoted) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseOut={(e) => { if(!hasVoted) e.currentTarget.style.transform = 'translateY(0)'; }}
                      disabled={hasVoted}
                    >
                      {hasVoted ? 'Already Voted' : 'Vote Now'}
                    </button>
                    <button 
                      style={{ padding: '1rem 2rem', background: 'white', border: '2px solid #E2E8F0', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#475569', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', fontSize: '1.05rem' }}
                      onMouseOver={(e) => { e.currentTarget.style.borderColor = '#94A3B8'; e.currentTarget.style.color = '#0F172A'; }}
                      onMouseOut={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.color = '#475569'; }}
                    >
                      <Share2 size={20} /> Share
                    </button>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '4rem' }}>
                <div style={{ display: 'flex', gap: '3rem', borderBottom: '2px solid #F1F5F9', marginBottom: '2.5rem', overflowX: 'auto' }}>
                  <button onClick={() => setCandidateTab('About')} style={{ background: 'none', border: 'none', borderBottom: candidateTab === 'About' ? '3px solid #F97316' : 'none', padding: '0.75rem 0', color: candidateTab === 'About' ? '#0F172A' : '#64748B', fontWeight: candidateTab === 'About' ? '800' : '600', fontSize: '1.1rem', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: candidateTab === 'About' ? '-2px' : '0' }}>About</button>
                  <button onClick={() => setCandidateTab('Vision & Plans')} style={{ background: 'none', border: 'none', borderBottom: candidateTab === 'Vision & Plans' ? '3px solid #F97316' : 'none', padding: '0.75rem 0', color: candidateTab === 'Vision & Plans' ? '#0F172A' : '#64748B', fontWeight: candidateTab === 'Vision & Plans' ? '800' : '600', fontSize: '1.1rem', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: candidateTab === 'Vision & Plans' ? '-2px' : '0' }}>Vision & Plans</button>
                  <button onClick={() => setCandidateTab('Experience')} style={{ background: 'none', border: 'none', borderBottom: candidateTab === 'Experience' ? '3px solid #F97316' : 'none', padding: '0.75rem 0', color: candidateTab === 'Experience' ? '#0F172A' : '#64748B', fontWeight: candidateTab === 'Experience' ? '800' : '600', fontSize: '1.1rem', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: candidateTab === 'Experience' ? '-2px' : '0' }}>Experience</button>
                  <button onClick={() => setCandidateTab('Supporters')} style={{ background: 'none', border: 'none', borderBottom: candidateTab === 'Supporters' ? '3px solid #F97316' : 'none', padding: '0.75rem 0', color: candidateTab === 'Supporters' ? '#0F172A' : '#64748B', fontWeight: candidateTab === 'Supporters' ? '800' : '600', fontSize: '1.1rem', cursor: 'pointer', whiteSpace: 'nowrap', marginBottom: candidateTab === 'Supporters' ? '-2px' : '0' }}>Supporters</button>
                </div>
                
                <div style={{ display: 'flex', gap: '5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: '350px' }}>
                    <p style={{ color: '#334155', lineHeight: '1.8', fontSize: '1.1rem', letterSpacing: '0.01em' }}>
                      {candidateTab === 'About' && viewingCandidate.about}
                      {candidateTab === 'Vision & Plans' && viewingCandidate.vision}
                      {candidateTab === 'Experience' && viewingCandidate.experience}
                      {candidateTab === 'Supporters' && viewingCandidate.supporters}
                    </p>
                  </div>
              </div>
            </div>
          </div>
        </div>
        );
      }

      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="page-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#1E293B', textTransform: 'capitalize', fontWeight: '800' }}>{t('candidates')}</h1>
              <div className="page-subtitle" style={{ fontSize: '1rem', color: '#64748B' }}>{t('votingDesc')}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <div className="header-search" style={{ flex: 1, minWidth: '250px', maxWidth: '500px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                value={candidateSearchQuery}
                onChange={(e) => setCandidateSearchQuery(e.target.value)}
                style={{ width: '100%', border: 'none', outline: 'none', padding: '0.75rem 0.5rem', background: 'transparent' }} 
              />
            </div>
            <select 
              value={selectedPartyFilter}
              onChange={(e) => setSelectedPartyFilter(e.target.value)}
              style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', color: 'var(--text-primary)', backgroundColor: 'white', cursor: 'pointer' }}
            >
              <option value="All">All Parties</option>
              <option value="Congress">Congress</option>
              <option value="Bhajap">Bhajap</option>
              <option value="Shivsena">Shivsena</option>
              <option value="Rashtravadi">Rashtravadi</option>
              <option value="Other Party">Other Party</option>
            </select>
          </div>
          
          {hasVoted && (
            <div className="success-banner">
              <CheckSquare size={24} />
              {t('voteSuccess')} You voted for {votedCandidate}.
            </div>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
            {filteredCandidates.length > 0 ? (
              filteredCandidates.map(candidate => (
                <div key={candidate.id} className="candidate-card" onClick={() => setViewingCandidate(candidate)}>
                <div className="candidate-img-wrapper">
                  <img src={candidate.photo} alt={candidate.name} className="candidate-img" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1E293B', margin: 0 }}>{candidate.name}</h3>
                  <span style={{ fontSize: '1.25rem' }}>{candidate.symbol}</span>
                </div>
                <div style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.25rem', fontWeight: '500' }}>{candidate.party}</div>
                <p style={{ color: '#64748B', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: '1.5', flex: 1 }}>
                  {candidate.description}
                </p>
                <button 
                  className="candidate-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingCandidate(candidate);
                  }}
                >
                  View Details
                </button>
              </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', color: '#64748B' }}>
                <Search size={48} color="#CBD5E1" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', color: '#334155', marginBottom: '0.5rem' }}>No candidates found</h3>
                <p>Try adjusting your search or party filter to find what you're looking for.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
    
    if (activeTab === 'Survey') {
      const activeSurveys = surveyData.filter(s => s.status === 'ACTIVE');
      return (
        <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="page-header" style={{ marginBottom: 0 }}>
            <div>
              <h1 className="page-title">Active Surveys</h1>
              <div className="page-subtitle">Select a survey to fill out and submit.</div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {activeSurveys.length > 0 ? activeSurveys.map(survey => (
              <div key={survey.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '12px', transition: 'all 0.2s', cursor: 'pointer' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ backgroundColor: '#E0E7FF', color: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
                    <ClipboardCheck size={24} />
                  </div>
                  <span className="badge-status status-progress" style={{ backgroundColor: '#D1FAE5', color: '#059669', fontSize: '0.75rem' }}>Active</span>
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {language === 'mr' && survey.title_mr ? survey.title_mr : survey.title_en}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    Target: {survey.target_audience} | Record: {survey.record_type}
                  </p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#94A3B8' }}>{new Date(survey.created_at).toLocaleDateString()}</span>
                  <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>Fill Survey</button>
                </div>
              </div>
            )) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: '#64748B' }}>
                <ClipboardList size={48} color="#CBD5E1" style={{ margin: '0 auto 1rem auto' }} />
                <h3>No active surveys found</h3>
              </div>
            )}
          </div>
        </div>
      );
    }
    

    // Default placeholder for other tabs
    return (
      <div className="card" style={{ marginTop: '2rem', textAlign: 'center', padding: '4rem 2rem' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--secondary)', marginBottom: '1rem' }}>
          {activeTab} Module
        </h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          This section is currently under development. Content for {activeTab} will appear here.
        </p>
      </div>
    );
  };

  // Main Render
  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', backgroundColor: '#FFF9F5', fontFamily: "'Inter', sans-serif" }}>
        
        {/* Left Side - Visual */}
        <div className="login-left-panel" style={{ 
          flex: '1', 
          display: 'flex',
          flexDirection: 'column',
          padding: '4rem 4rem 4rem 6rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          
          {/* Decorative Landscape SVG Background */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '60%', zIndex: 0, pointerEvents: 'none' }}>
            {/* Sun */}
            <div style={{ position: 'absolute', bottom: '20%', left: '45%', width: '180px', height: '180px', background: 'linear-gradient(to bottom, #FDBA74, #FED7AA)', borderRadius: '50%', opacity: 0.9 }}></div>
            {/* Background Hills */}
            <div style={{ position: 'absolute', bottom: '0', left: '0', width: '200%', height: '40%', background: '#FFEDD5', borderRadius: '100% 100% 0 0 / 100% 100% 0 0', transform: 'translateX(-25%)' }}></div>
            {/* Mid Hills */}
            <div style={{ position: 'absolute', bottom: '-10%', right: '-20%', width: '150%', height: '45%', background: '#FED7AA', borderRadius: '100% 100% 0 0 / 100% 100% 0 0' }}></div>
            {/* Foreground Hills */}
            <div style={{ position: 'absolute', bottom: '-20%', left: '-20%', width: '120%', height: '50%', background: '#F97316', borderRadius: '100% 100% 0 0 / 100% 100% 0 0' }}></div>
          </div>

          <div style={{ position: 'relative', zIndex: 10 }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={32} color="#F97316" strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '0.02em', color: '#111827' }}>
                KARYAKARTA <span style={{ color: '#F97316' }}>PORTAL</span>
              </span>
            </div>
            
            {/* Heading */}
            <h1 style={{ fontSize: '3.75rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem', color: '#111827', letterSpacing: '-0.02em' }}>
              Together<br/>for a Stronger<br/><span style={{ color: '#F97316' }}>Community</span>
            </h1>
            
            {/* Subheading */}
            <p style={{ fontSize: '1.15rem', color: '#4B5563', maxWidth: '450px', lineHeight: '1.6', marginBottom: '3rem' }}>
              Manage campaigns, connect with voters, and drive real change at the booth level.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', gap: '2.5rem' }}>
              {/* Feature 1 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '130px' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#FFEDD5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={28} color="#F97316" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Organize</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: '1.4' }}>Manage your campaigns easily</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '130px' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#FFEDD5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BarChart2 size={28} color="#F97316" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Engage</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: '1.4' }}>Connect with voters effectively</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '130px' }}>
                <div style={{ width: '56px', height: '56px', backgroundColor: '#FFEDD5', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={28} color="#F97316" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#111827', marginBottom: '0.25rem' }}>Impact</h3>
                  <p style={{ fontSize: '0.85rem', color: '#6B7280', lineHeight: '1.4' }}>Track progress & drive change</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem', position: 'relative', zIndex: 20 }}>
          <div style={{ maxWidth: '480px', width: '100%', backgroundColor: 'white', padding: '3.5rem', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }}>
            <div style={{ marginBottom: '2.5rem' }}>
              <div style={{ color: '#F97316', fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem', position: 'relative', display: 'inline-block' }}>
                WELCOME BACK
                <div style={{ position: 'absolute', top: '-15px', left: '0', width: '40px', height: '3px', backgroundColor: '#F97316', borderRadius: '2px' }}></div>
              </div>
              <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Sign in to your account</h2>
              <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Enter your credentials to continue to Karyakarta Portal.</p>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); setIsLoggedIn(true); }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#374151', fontWeight: '600', fontSize: '0.9rem' }}>Mobile Number or Email</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" placeholder="Enter your mobile number or email" required style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem 0.875rem 2.75rem', 
                    borderRadius: '12px', 
                    border: '1px solid #D1D5DB', 
                    backgroundColor: 'white',
                    fontSize: '0.95rem', 
                    outline: 'none', 
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    color: '#111827'
                  }} 
                  onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                  />
                  <User size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <label style={{ color: '#374151', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
                  <a href="#" style={{ color: '#F97316', fontSize: '0.85rem', textDecoration: 'none', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={e => e.target.style.color = '#EA580C'} onMouseOut={e => e.target.style.color = '#F97316'}>Forgot Password?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input type="password" placeholder="Enter your password" required style={{ 
                    width: '100%', 
                    padding: '0.875rem 2.75rem 0.875rem 2.75rem', 
                    borderRadius: '12px', 
                    border: '1px solid #D1D5DB', 
                    backgroundColor: 'white',
                    fontSize: '0.95rem', 
                    outline: 'none', 
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    color: '#111827'
                  }} 
                  onFocus={(e) => { e.target.style.borderColor = '#F97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.1)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#D1D5DB'; e.target.style.boxShadow = 'none'; }}
                  />
                  <Lock size={18} color="#9CA3AF" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <EyeOff size={18} color="#9CA3AF" style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }} />
                </div>
              </div>
              <button type="submit" style={{ 
                width: '100%', 
                background: 'linear-gradient(to right, #F97316, #D97706)', 
                color: 'white', 
                padding: '0.875rem', 
                borderRadius: '12px', 
                fontWeight: '600', 
                fontSize: '1rem', 
                border: 'none', 
                cursor: 'pointer', 
                transition: 'all 0.3s ease', 
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={e => { e.target.style.transform = 'translateY(-2px)'; e.target.style.boxShadow = '0 6px 15px rgba(249, 115, 22, 0.3)'; }}
              onMouseOut={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 12px rgba(249, 115, 22, 0.25)'; }}
              >
                Sign In <ArrowRight size={18} />
              </button>
            </form>
            
            <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <div style={{ height: '1px', backgroundColor: '#F3F4F6', flex: 1 }}></div>
              <span style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>OR</span>
              <div style={{ height: '1px', backgroundColor: '#F3F4F6', flex: 1 }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: '#FFF7ED', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Headphones size={20} color="#F97316" />
              </div>
              <div>
                <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>Need help?</p>
                <a href="#" style={{ color: '#F97316', fontWeight: '700', fontSize: '0.95rem', textDecoration: 'none', borderBottom: '2px solid #F97316', paddingBottom: '2px' }}>Contact Administrator</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon">
            <Users size={28} />
          </div>
          <div className="logo-text">
            {t('karyakartaPortal').split(' ')[0]}<br />{t('karyakartaPortal').split(' ').slice(1).join(' ')}
          </div>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button 
                key={item.name}
                className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
                onClick={() => setActiveTab(item.name)}
              >
                <div className="nav-item-left">
                  <Icon className="nav-icon" />
                  <span>{t(item.key)}</span>
                </div>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>


      </aside>

      {/* Main Content Wrapper */}
      <main className="main-wrapper">
        {/* Top Header */}
        <header className="header">
          <div className="flex items-center gap-4">
            <button 
              className="icon-btn lg:hidden" 
              onClick={() => setSidebarOpen(!isSidebarOpen)}
              style={{ display: 'none' /* Handled via media queries normally */ }}
            >
              <Menu size={20} />
            </button>
            <div className="header-search">
              <Search size={18} color="#94a3b8" />
              <input type="text" placeholder={t('searchPlaceholder')} />
            </div>
          </div>

          <div className="header-actions">
            <div style={{ display: 'flex', alignItems: 'center', background: 'white', borderRadius: 'var(--radius-sm)', border: '1px solid var(--accent)', padding: '0.25rem 0.5rem', boxShadow: 'var(--shadow-sm)' }}>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.875rem', color: 'var(--secondary)', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                <option value="en">English</option>
                <option value="mr">मराठी</option>
                <option value="hi">हिंदी</option>
              </select>
            </div>
            <button 
              onClick={() => setIsLoggedIn(false)}
              style={{
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: '700',
                cursor: 'pointer',
                fontSize: '0.875rem',
                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)'
              }}
            >
              {t('signout')}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="content">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
