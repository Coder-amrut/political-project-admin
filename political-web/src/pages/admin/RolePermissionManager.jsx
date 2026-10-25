import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/axios';
import {
  Shield,
  User,
  Crown,
  ChevronDown,
  Check,
  LayoutGrid,
  Zap,
  FileText,
  Settings,
  Folder,
  MapPin,
  ClipboardList,
  Handshake,
  Calendar,
  Bot,
} from 'lucide-react';

// Metadata and visual styling for permissions to match the exact design
const PERMISSION_CONFIG = {
  admin_panel: {
    key: 'admin_panel',
    title_en: 'Admin Panel',
    title_mr: 'ॲडमिन पॅनेल',
    desc_en: 'Full access to admin dashboard and settings.',
    desc_mr: 'ॲडमिन डॅशबोर्ड आणि मुख्य प्रशासकीय सेटिंग्जचे संपूर्ण नियंत्रण.',
    Icon: LayoutGrid,
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  political_command: {
    key: 'political_command',
    title_en: 'Political Command',
    title_mr: 'राजकीय नियंत्रण कक्ष',
    desc_en: 'Access to political command features.',
    desc_mr: 'राजकीय कमांड मुख्यालय व नेता डेस्क वापरण्याची परवानगी.',
    Icon: Zap,
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
  },
  user_management: {
    key: 'user_management',
    title_en: 'User Management',
    title_mr: 'वापरकर्ते व्यवस्थापन',
    desc_en: 'Manage users and roles.',
    desc_mr: 'वापरकर्ते खाती आणि परवानग्या व्यवस्थापित करा.',
    Icon: User,
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
  },
  strategic_reports: {
    key: 'strategic_reports',
    title_en: 'Reports',
    title_mr: 'अहवाल (Reports)',
    desc_en: 'View and download reports.',
    desc_mr: 'मतदार कल आणि निवडणूक विश्लेषण अहवाल पहा व डाऊनलोड करा.',
    Icon: FileText,
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  reports: {
    key: 'reports',
    title_en: 'Reports',
    title_mr: 'अहवाल (Reports)',
    desc_en: 'View and download reports.',
    desc_mr: 'मतदार कल आणि निवडणूक विश्लेषण अहवाल पहा व डाऊनलोड करा.',
    Icon: FileText,
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  settings: {
    key: 'settings',
    title_en: 'Settings',
    title_mr: 'सेटिंग्ज',
    desc_en: 'Access to system settings.',
    desc_mr: 'सिस्टम सेटिंग्ज व कॉन्फिगरेशन ॲक्सेस.',
    Icon: Settings,
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  project_management: {
    key: 'project_management',
    title_en: 'Project Management',
    title_mr: 'प्रकल्प व्यवस्थापन',
    desc_en: 'Create, configure, and monitor political projects.',
    desc_mr: 'निवडणूक व प्रचार प्रकल्प तयार करा, संपादित करा आणि देखरेख करा.',
    Icon: Folder,
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
  },
  geography_booths: {
    key: 'geography_booths',
    title_en: 'Geography & Booths',
    title_mr: 'भौगोलिक व मतदान केंद्र',
    desc_en: 'Manage constituencies, talukas, wards, and polling booths.',
    desc_mr: 'विधानसभा मतदारसंघ, तालुके, गावे, वॉर्ड आणि मतदान केंद्र व्यवस्थापन.',
    Icon: MapPin,
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  voter_surveys: {
    key: 'voter_surveys',
    title_en: 'Voter Surveys',
    title_mr: 'मतदार व कुटुंब सर्व्हे',
    desc_en: 'Conduct household surveys and record ground voter data.',
    desc_mr: 'घरोघरी जाऊन कुटुंब सर्वेक्षण करणे व प्रत्यक्ष मतदार डेटा नोंदवणे.',
    Icon: ClipboardList,
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  citizen_crm: {
    key: 'citizen_crm',
    title_en: 'Citizen CRM',
    title_mr: 'नागरिक CRM व तक्रारी',
    desc_en: 'Manage 360° citizen voter profiles, voter contacts, and grievances.',
    desc_mr: 'नागरिक ३६०° मतदार प्रोफाईल्स, संपर्क इतिहास व समस्या निवारण.',
    Icon: Handshake,
    color: '#0d9488',
    bgColor: '#f0fdfa',
    borderColor: '#99f6e4',
  },
  meetings_tours: {
    key: 'meetings_tours',
    title_en: 'Meetings & Tours',
    title_mr: 'दौरे, सभा व बैठका',
    desc_en: 'Schedule and manage rallies, leader visits, and cadre meetings.',
    desc_mr: 'राजकीय सभा, नेत्यांचे क्षेत्रीय दौरे आणि कार्यकर्ता बैठका नियोजन.',
    Icon: Calendar,
    color: '#7c3aed',
    bgColor: '#faf5ff',
    borderColor: '#ddd6fe',
  },
  ai_chatbot: {
    key: 'ai_chatbot',
    title_en: 'AI Assistant',
    title_mr: 'AI प्रचार सहाय्यक',
    desc_en: 'Access AI campaign assistant, talking points, and Q&A desk.',
    desc_mr: 'AI प्रचार सहाय्यक, भाषण मुद्दे आणि मतदार संवाद मार्गदर्शन.',
    Icon: Bot,
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
};

// Priority ordering to match the exact visual layout from the user design
const PREFERRED_ORDER = [
  'admin_panel',
  'political_command',
  'user_management',
  'strategic_reports',
  'reports',
  'settings',
  'project_management',
  'geography_booths',
  'voter_surveys',
  'citizen_crm',
  'meetings_tours',
  'ai_chatbot',
];

function getPermMeta(perm) {
  if (!perm) return null;
  const cfg = PERMISSION_CONFIG[perm.name];
  if (cfg) return cfg;
  const cleanName = (perm.name || '').replace(/_/g, ' ').replace(/\./g, ' ');
  return {
    key: perm.name,
    title_en: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    title_mr: cleanName,
    desc_en: perm.description || 'Access to this system feature.',
    desc_mr: perm.description || 'या सिस्टीम फिचरचा वापर.',
    Icon: Shield,
    color: '#64748b',
    bgColor: '#f1f5f9',
    borderColor: '#e2e8f0',
  };
}

const getAssignedSelectTheme = (assignedVal) => {
  if (assignedVal === 'ROLE_OFFICER') {
    return {
      bg: '#eff6ff',
      border: '1.5px solid #bfdbfe',
      color: '#1d4ed8',
      chevron: '#2563eb',
    };
  }
  if (assignedVal === 'ROLE_WORKER' || assignedVal?.startsWith('WORKER_')) {
    return {
      bg: '#ecfdf5',
      border: '1.5px solid #a7f3d0',
      color: '#047857',
      chevron: '#059669',
    };
  }
  if (assignedVal === 'ROLE_ADMIN') {
    return {
      bg: '#faf5ff',
      border: '1.5px solid #e9d5ff',
      color: '#6d28d9',
      chevron: '#7c3aed',
    };
  }
  return {
    bg: '#f8fafc',
    border: '1.5px solid #e2e8f0',
    color: '#64748b',
    chevron: '#94a3b8',
  };
};

export default function RolePermissionManager({
  roles = [],
  language = 'en',
  onRefreshRoles,
  onNotice,
  onError,
}) {
  const isMr = language === 'mr';

  // Target Selection:
  // targetType: 'ROLE' | 'WORKER'
  const [targetType, setTargetType] = useState('ROLE');
  const [selectedRoleId, setSelectedRoleId] = useState(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState('');

  // Data States
  const [availablePermissions, setAvailablePermissions] = useState([]);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Staged changes
  const [stagedPermIds, setStagedPermIds] = useState(new Set());
  const [originalPermIds, setOriginalPermIds] = useState(new Set());
  const [workerInheritedIds, setWorkerInheritedIds] = useState(new Set());

  const [isSaving, setIsSaving] = useState(false);

  // Quick Worker Assignment Modal
  const [assignModal, setAssignModal] = useState(null);
  const [assignTargetUserId, setAssignTargetUserId] = useState('');

  // 1. Load Permissions & Users
  const loadMasterPermissions = async () => {
    setLoadingPerms(true);
    try {
      const { data } = await apiClient.get('/admin/permissions');
      setAvailablePermissions(data.data || []);
    } catch (err) {
      if (onError) onError(err.response?.data?.message || err.message || 'Failed to load permissions.');
    } finally {
      setLoadingPerms(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data } = await apiClient.get('/admin/users-list');
      setUsersList(data.data || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadMasterPermissions();
    loadUsers();
  }, []);

  // Sync default role to WORKER
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      const workerRole = roles.find((r) => r.name === 'WORKER') || roles[0];
      setSelectedRoleId(workerRole.id);
    }
  }, [roles, selectedRoleId]);

  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

  // Specific Roles
  const workerRole = useMemo(() => roles.find((r) => r.name === 'WORKER') || null, [roles]);
  const officerRole = useMemo(() => roles.find((r) => r.name === 'OFFICER') || null, [roles]);
  const adminRole = useMemo(() => roles.find((r) => r.name === 'ADMIN') || null, [roles]);

  // List of Field Workers specifically
  const fieldWorkers = useMemo(() => {
    return usersList.filter((u) => u.roles?.some((r) => r.name === 'WORKER'));
  }, [usersList]);

  // Other users (Officers / Admins)
  const otherUsers = useMemo(() => {
    return usersList.filter((u) => !u.roles?.some((r) => r.name === 'WORKER'));
  }, [usersList]);

  const selectedWorker = useMemo(() => {
    if (!selectedWorkerId) return null;
    return usersList.find((u) => u.id === Number(selectedWorkerId)) || null;
  }, [usersList, selectedWorkerId]);

  // 2. Load Permissions for selected target (Role or Worker)
  useEffect(() => {
    if (targetType === 'ROLE' && currentRole) {
      const ids = new Set((currentRole.permissions || []).map((p) => p.id));
      setStagedPermIds(ids);
      setOriginalPermIds(new Set(ids));
      setWorkerInheritedIds(new Set());
    } else if (targetType === 'WORKER' && selectedWorkerId) {
      const fetchWorkerPerms = async () => {
        try {
          const { data } = await apiClient.get(`/admin/users/${selectedWorkerId}/permissions`);
          const payload = data.data || {};
          const directIds = new Set((payload.direct_permissions || []).map((p) => p.id));
          const inherited = new Set((payload.role_permissions || []).map((p) => p.id));
          setWorkerInheritedIds(inherited);
          setStagedPermIds(directIds);
          setOriginalPermIds(new Set(directIds));
        } catch (err) {
          if (onError) onError('Failed to load permissions for worker.');
        }
      };
      fetchWorkerPerms();
    }
  }, [targetType, selectedRoleId, currentRole, selectedWorkerId]);

  // Check if staged changes exist
  const hasChanges = useMemo(() => {
    if (stagedPermIds.size !== originalPermIds.size) return true;
    for (const id of stagedPermIds) {
      if (!originalPermIds.has(id)) return true;
    }
    return false;
  }, [stagedPermIds, originalPermIds]);

  // Toggle permission
  const handleToggle = (permId) => {
    setStagedPermIds((prev) => {
      const next = new Set(prev);
      if (next.has(permId)) {
        next.delete(permId);
      } else {
        next.add(permId);
      }
      return next;
    });
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (targetType === 'ROLE') {
        await apiClient.put(`/admin/roles/${selectedRoleId}/permissions`, {
          permission_ids: Array.from(stagedPermIds),
        });
        if (onRefreshRoles) await onRefreshRoles();
        if (onNotice) {
          onNotice(isMr
            ? `${currentRole?.display_name || currentRole?.name} या भूमिकेच्या परवानग्या सेव्ह झाल्या.`
            : `Permissions for role "${currentRole?.display_name || currentRole?.name}" saved successfully.`);
        }
        setOriginalPermIds(new Set(stagedPermIds));
      } else if (targetType === 'WORKER') {
        await apiClient.put(`/admin/users/${selectedWorkerId}/permissions`, {
          permission_ids: Array.from(stagedPermIds),
        });
        await loadUsers();
        if (onNotice) {
          onNotice(isMr
            ? `${selectedWorker?.full_name} या कार्यकर्त्याच्या परवानग्या सेव्ह झाल्या.`
            : `Permissions for worker "${selectedWorker?.full_name}" saved successfully.`);
        }
        setOriginalPermIds(new Set(stagedPermIds));
      }
    } catch (err) {
      if (onError) onError(err.response?.data?.message || err.message || 'Failed to save permissions.');
    } finally {
      setIsSaving(false);
    }
  };

  // Discard changes
  const handleDiscard = () => {
    setStagedPermIds(new Set(originalPermIds));
  };

  // Quick Assign from row dropdown
  const handleQuickAssignToWorker = async () => {
    if (!assignModal?.permId || !assignTargetUserId) return;
    setIsSaving(true);
    try {
      await apiClient.post(`/admin/users/${assignTargetUserId}/permissions/give`, {
        permission_id: assignModal.permId,
      });
      await loadUsers();
      if (onRefreshRoles) await onRefreshRoles();
      const targetUser = usersList.find((u) => u.id === Number(assignTargetUserId));
      if (onNotice) {
        onNotice(isMr
          ? `"${assignModal.permName}" ही परवानगी ${targetUser?.full_name} यांना देण्यात आली.`
          : `Permission "${assignModal.permName}" granted to ${targetUser?.full_name}.`);
      }
      setAssignModal(null);
      setAssignTargetUserId('');
    } catch (err) {
      if (onError) onError(err.response?.data?.message || err.message || 'Failed to assign permission.');
    } finally {
      setIsSaving(false);
    }
  };

  // Sorted list of permissions to match exact sequence in user screenshot
  const sortedPermissions = useMemo(() => {
    if (!availablePermissions || availablePermissions.length === 0) return [];
    return [...availablePermissions].sort((a, b) => {
      const idxA = PREFERRED_ORDER.indexOf(a.name);
      const idxB = PREFERRED_ORDER.indexOf(b.name);
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      return posA - posB;
    });
  }, [availablePermissions]);

  // Determine label for "Assigned To" dropdown
  const getAssignedToValue = (perm) => {
    const isGranted = stagedPermIds.has(perm.id);
    if (!isGranted) {
      // Check if another role has this permission
      if (officerRole?.permissions?.some((p) => p.id === perm.id)) {
        return 'ROLE_OFFICER';
      }
      if (adminRole?.permissions?.some((p) => p.id === perm.id)) {
        return 'ROLE_ADMIN';
      }
      return 'NONE';
    }

    if (targetType === 'ROLE') {
      if (currentRole?.name === 'WORKER') return 'ROLE_WORKER';
      if (currentRole?.name === 'OFFICER') return 'ROLE_OFFICER';
      if (currentRole?.name === 'ADMIN') return 'ROLE_ADMIN';
    } else if (targetType === 'WORKER') {
      return `WORKER_${selectedWorkerId}`;
    }
    return 'ROLE_WORKER';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        color: '#1e293b',
        maxWidth: 1200,
        margin: '0 auto',
        padding: '8px 4px 40px 4px',
        perspective: '1200px',
      }}
    >
      {/* 3D Animations and Micro-interactions Stylesheet */}
      <style>{`
        @keyframes floatShield3D {
          0%, 100% {
            transform: perspective(600px) translateY(0px) rotateY(0deg) rotateX(0deg);
            box-shadow: 0 4px 12px rgba(22, 163, 74, 0.18), inset 0 1px 2px rgba(255, 255, 255, 0.6);
          }
          50% {
            transform: perspective(600px) translateY(-5px) rotateY(10deg) rotateX(4deg);
            box-shadow: 0 10px 20px rgba(22, 163, 74, 0.28), inset 0 1px 3px rgba(255, 255, 255, 0.8);
          }
        }

        @keyframes pulseDot3D {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6), 0 1px 3px rgba(16, 185, 129, 0.5);
            transform: scale(1);
          }
          50% {
            box-shadow: 0 0 0 5px rgba(16, 185, 129, 0), 0 2px 6px rgba(16, 185, 129, 0.7);
            transform: scale(1.15);
          }
        }

        @keyframes bannerFloat3D {
          0%, 100% {
            transform: translateY(0px) perspective(800px) rotateX(0deg);
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.22);
          }
          50% {
            transform: translateY(-3px) perspective(800px) rotateX(2deg);
            box-shadow: 0 8px 22px rgba(245, 158, 11, 0.32);
          }
        }

        @keyframes cardEntrance3D {
          from {
            opacity: 0;
            transform: perspective(1000px) rotateX(6deg) translateY(18px);
          }
          to {
            opacity: 1;
            transform: perspective(1000px) rotateX(0deg) translateY(0);
          }
        }

        @keyframes shimmerGlow {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .header-shield-3d {
          animation: floatShield3D 4s ease-in-out infinite;
          transform-style: preserve-3d;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .header-shield-3d:hover {
          transform: perspective(600px) scale(1.12) rotateY(18deg) rotateX(6deg) !important;
        }

        .role-tab-btn-3d {
          transform-style: preserve-3d;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          will-change: transform, box-shadow;
          position: relative;
        }
        .role-tab-btn-3d:hover {
          transform: perspective(800px) translateY(-3px) translateZ(8px) rotateX(3deg) !important;
        }
        .role-tab-btn-3d:active {
          transform: perspective(800px) translateY(1px) translateZ(-2px) scale(0.98) !important;
        }

        .status-card-3d {
          transform-style: preserve-3d;
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          will-change: transform, box-shadow;
        }
        .status-card-3d:hover {
          transform: perspective(800px) translateY(-3px) translateZ(6px) rotateX(2deg) !important;
          box-shadow: 0 10px 24px -2px rgba(16, 185, 129, 0.48), inset 0 1px 1px rgba(255, 255, 255, 0.5) !important;
        }

        .perm-row-3d {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .perm-row-3d:hover {
          transform: translateZ(6px) scale(1.002);
          box-shadow: 0 6px 18px -3px rgba(15, 23, 42, 0.08);
          z-index: 2;
        }
        .perm-row-3d:hover .perm-avatar-3d {
          transform: perspective(600px) scale(1.12) rotateY(8deg) translateZ(8px) !important;
          box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.8) !important;
        }

        .perm-avatar-3d {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
          transform-style: preserve-3d;
        }

        .toggle-btn-3d {
          transform-style: preserve-3d;
          transition: all 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          will-change: transform, box-shadow;
        }
        .toggle-btn-3d:hover {
          transform: scale(1.08) translateY(-1.5px) translateZ(4px) !important;
        }
        .toggle-btn-3d:active {
          transform: scale(0.94) translateY(1px) translateZ(-2px) !important;
        }

        .assigned-select-3d {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .assigned-select-3d:hover {
          transform: translateY(-1.5px) translateZ(3px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.07) !important;
        }
        .assigned-select-3d:focus {
          transform: translateY(-1px) translateZ(4px);
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.15) !important;
        }

        .worker-select-3d {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .worker-select-3d:hover {
          transform: translateY(-1.5px) translateZ(3px);
          box-shadow: 0 6px 14px rgba(5, 150, 105, 0.12) !important;
        }

        .active-dot-pulsing {
          animation: pulseDot3D 2s infinite ease-in-out;
        }
      `}</style>

      {/* ============================================================== */}
      {/* 1. TOP HEADER: ROLES & PERMISSIONS TITLE & ICON                 */}
      {/* ============================================================== */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            className="header-shield-3d"
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              backgroundColor: '#e6f9ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer',
              border: '2px solid #bbf7d0',
            }}
          >
            <Shield size={28} color="#16a34a" fill="#16a34a" fillOpacity={0.25} />
          </div>
          <div>
            <h1
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {isMr ? 'भूमिका व परवानग्या (Roles & Permissions)' : 'Roles & Permissions'}
            </h1>
            <p
              style={{
                fontSize: 14,
                color: '#64748b',
                margin: '4px 0 0 0',
                fontWeight: 450,
              }}
            >
              {isMr
                ? 'प्रत्येक भूमिका किंवा क्षेत्रीय कार्यकर्त्यास कोणत्या गोष्टींचा प्रवेश असेल ते ठरवा.'
                : 'Manage what each role or field worker can access.'}
            </p>
          </div>
        </div>

        {/* Unsaved Changes Action Banner (Header) */}
        {hasChanges && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: '#fffbeb',
              border: '1px solid #fef08a',
              padding: '6px 14px',
              borderRadius: 10,
              animation: 'bannerFloat3D 3s ease-in-out infinite',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.22)',
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: '#b45309' }}>
              ⚠️ {isMr ? 'बदल सेव्ह करणे बाकी आहे' : 'Unsaved changes'}
            </span>
            <button
              type="button"
              onClick={handleDiscard}
              disabled={isSaving}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                padding: '5px 12px',
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {isMr ? 'रद्द करा' : 'Discard'}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: '#16a34a',
                border: 'none',
                padding: '6px 16px',
                borderRadius: 7,
                fontSize: 12.5,
                fontWeight: 750,
                color: '#ffffff',
                cursor: 'pointer',
                boxShadow: '0 3px 8px rgba(22, 163, 74, 0.38), inset 0 1px 1px rgba(255,255,255,0.4)',
                transition: 'all 0.15s ease',
              }}
            >
              {isSaving ? '...' : (isMr ? '💾 सेव्ह करा' : '💾 Save')}
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 2. TOP FILTER HUB: 1. SELECT ROLE | 2. SELECT WORKER | ACTIVE   */}
      {/* ============================================================== */}
      <div
        style={{
          background: 'linear-gradient(180deg, #ffffff 0%, #fcfdfe 100%)',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(0,0,0,0.02)',
          padding: '18px 22px',
          animation: 'cardEntrance3D 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(520px, 2.3fr) minmax(260px, 1.2fr) minmax(170px, 0.8fr)',
            gap: 18,
            alignItems: 'flex-start',
          }}
        >
          {/* Section 1: 1. Select Role */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ height: 21, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #2563eb 100%)',
                  boxShadow: '0 0 6px rgba(37,99,235,0.4)',
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                {isMr ? '१. भूमिका निवडा (1. Select Role)' : '1. Select Role'}
              </span>
            </div>

            {/* Exactly 3 equal columns in ONE SINGLE ROW - never wraps */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 8,
                width: '100%',
              }}
            >
              {/* 1. Field Worker Card */}
              {workerRole && (() => {
                const isSelected = targetType === 'ROLE' && selectedRoleId === workerRole.id;
                return (
                  <button
                    type="button"
                    className={`role-tab-btn-3d ${isSelected ? 'tab-btn-3d-blue' : 'tab-btn-3d-inactive'}`}
                    onClick={() => {
                      setTargetType('ROLE');
                      setSelectedRoleId(workerRole.id);
                      setSelectedWorkerId('');
                    }}
                    style={{
                      width: '100%',
                      height: 48,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid #cbd5e1',
                      borderTop: isSelected ? '1.5px solid rgba(255, 255, 255, 0.65)' : '1px solid #cbd5e1',
                      borderBottom: isSelected ? '3.5px solid #1743a4' : '2.5px solid #94a3b8',
                      background: isSelected
                        ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 52%, #1d4ed8 100%)'
                        : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      color: isSelected ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 8px 20px -2px rgba(37, 99, 235, 0.55), 0 3px 6px rgba(0, 0, 0, 0.14), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)'
                        : '0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff',
                      textShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.28)' : 'none',
                      transform: isSelected ? 'perspective(800px) translateY(-2px) translateZ(6px)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isSelected ? 'inset 0 1px 1px rgba(255,255,255,0.4)' : '0 1px 3px rgba(37,99,235,0.12)',
                          flexShrink: 0,
                          transform: 'translateZ(10px)',
                        }}
                      >
                        <User size={16} color={isSelected ? '#ffffff' : '#2563eb'} strokeWidth={2.5} />
                      </div>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          transform: 'translateZ(8px)',
                        }}
                      >
                        {isMr ? 'क्षेत्रीय कार्यकर्ता' : 'Field Worker'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        background: isSelected ? '#ffffff' : '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: 12,
                        flexShrink: 0,
                        border: isSelected ? 'none' : '1px solid #bfdbfe',
                        boxShadow: isSelected ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                        transform: 'translateZ(12px)',
                      }}
                    >
                      {workerRole.permissions?.length || 4}
                    </span>
                  </button>
                );
              })()}

              {/* 2. Leader / Officer Card */}
              {officerRole && (() => {
                const isSelected = targetType === 'ROLE' && selectedRoleId === officerRole.id;
                return (
                  <button
                    type="button"
                    className={`role-tab-btn-3d ${isSelected ? 'tab-btn-3d-blue' : 'tab-btn-3d-inactive'}`}
                    onClick={() => {
                      setTargetType('ROLE');
                      setSelectedRoleId(officerRole.id);
                      setSelectedWorkerId('');
                    }}
                    style={{
                      width: '100%',
                      height: 48,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid #cbd5e1',
                      borderTop: isSelected ? '1.5px solid rgba(255, 255, 255, 0.65)' : '1px solid #cbd5e1',
                      borderBottom: isSelected ? '3.5px solid #1743a4' : '2.5px solid #94a3b8',
                      background: isSelected
                        ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 52%, #1d4ed8 100%)'
                        : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      color: isSelected ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 8px 20px -2px rgba(37, 99, 235, 0.55), 0 3px 6px rgba(0, 0, 0, 0.14), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)'
                        : '0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff',
                      textShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.28)' : 'none',
                      transform: isSelected ? 'perspective(800px) translateY(-2px) translateZ(6px)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isSelected ? 'inset 0 1px 1px rgba(255,255,255,0.4)' : '0 1px 3px rgba(37,99,235,0.12)',
                          flexShrink: 0,
                          transform: 'translateZ(10px)',
                        }}
                      >
                        <User size={16} color={isSelected ? '#ffffff' : '#2563eb'} strokeWidth={2.5} />
                      </div>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          transform: 'translateZ(8px)',
                        }}
                      >
                        {isMr ? 'नेता / अधिकारी' : 'Leader / Officer'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        background: isSelected ? '#ffffff' : '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: 12,
                        flexShrink: 0,
                        border: isSelected ? 'none' : '1px solid #bfdbfe',
                        boxShadow: isSelected ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                        transform: 'translateZ(12px)',
                      }}
                    >
                      {officerRole.permissions?.length || 8}
                    </span>
                  </button>
                );
              })()}

              {/* 3. Administrator Card */}
              {adminRole && (() => {
                const isSelected = targetType === 'ROLE' && selectedRoleId === adminRole.id;
                return (
                  <button
                    type="button"
                    className={`role-tab-btn-3d ${isSelected ? 'tab-btn-3d-blue' : 'tab-btn-3d-inactive'}`}
                    onClick={() => {
                      setTargetType('ROLE');
                      setSelectedRoleId(adminRole.id);
                      setSelectedWorkerId('');
                    }}
                    style={{
                      width: '100%',
                      height: 48,
                      boxSizing: 'border-box',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 12,
                      border: isSelected ? '1px solid rgba(255, 255, 255, 0.35)' : '1px solid #cbd5e1',
                      borderTop: isSelected ? '1.5px solid rgba(255, 255, 255, 0.65)' : '1px solid #cbd5e1',
                      borderBottom: isSelected ? '3.5px solid #1743a4' : '2.5px solid #94a3b8',
                      background: isSelected
                        ? 'linear-gradient(180deg, #3b82f6 0%, #2563eb 52%, #1d4ed8 100%)'
                        : 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
                      color: isSelected ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected
                        ? '0 8px 20px -2px rgba(37, 99, 235, 0.55), 0 3px 6px rgba(0, 0, 0, 0.14), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65)'
                        : '0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff',
                      textShadow: isSelected ? '0 1px 2px rgba(0, 0, 0, 0.28)' : 'none',
                      transform: isSelected ? 'perspective(800px) translateY(-2px) translateZ(6px)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 8,
                          background: isSelected ? 'rgba(255, 255, 255, 0.25)' : '#eff6ff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: isSelected ? 'inset 0 1px 1px rgba(255,255,255,0.4)' : '0 1px 3px rgba(37,99,235,0.12)',
                          flexShrink: 0,
                          transform: 'translateZ(10px)',
                        }}
                      >
                        <Crown size={16} color={isSelected ? '#ffffff' : '#2563eb'} strokeWidth={2.5} />
                      </div>
                      <span
                        style={{
                          fontSize: 12.5,
                          fontWeight: 800,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          transform: 'translateZ(8px)',
                        }}
                      >
                        {isMr ? 'ॲडमिन' : 'Administrator'}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 900,
                        background: isSelected ? '#ffffff' : '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 8px',
                        borderRadius: 12,
                        flexShrink: 0,
                        border: isSelected ? 'none' : '1px solid #bfdbfe',
                        boxShadow: isSelected ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                        transform: 'translateZ(12px)',
                      }}
                    >
                      {adminRole.permissions?.length || 10}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Section 2: 2. Select Field Worker */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ height: 21, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: targetType === 'WORKER' ? '#10b981' : '#64748b',
                  boxShadow: targetType === 'WORKER' ? '0 0 6px rgba(16,185,129,0.5)' : 'none',
                }}
              />
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#0f172a',
                  letterSpacing: '-0.01em',
                }}
              >
                {isMr ? '२. कार्यकर्ता निवडा (2. Select Field Worker)' : '2. Select Field Worker'}
              </span>
            </div>

            <div style={{ position: 'relative', width: '100%' }}>
              <div
                style={{
                  position: 'absolute',
                  left: 9,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  background: targetType === 'WORKER' ? '#10b981' : '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                  boxShadow: targetType === 'WORKER' ? '0 2px 4px rgba(16,185,129,0.3)' : 'none',
                  transition: 'all 0.2s ease',
                }}
              >
                <User size={14} color={targetType === 'WORKER' ? '#ffffff' : '#64748b'} strokeWidth={2.5} />
              </div>

              <select
                className="worker-select-3d"
                value={targetType === 'WORKER' ? selectedWorkerId : ''}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val) {
                    setTargetType('WORKER');
                    setSelectedWorkerId(val);
                  } else {
                    setTargetType('ROLE');
                    setSelectedWorkerId('');
                  }
                }}
                style={{
                  width: '100%',
                  height: 46,
                  boxSizing: 'border-box',
                  paddingLeft: 42,
                  paddingRight: 32,
                  borderRadius: 12,
                  border: targetType === 'WORKER' ? '1.5px solid #059669' : '1.5px solid #cbd5e1',
                  background: targetType === 'WORKER' ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : '#ffffff',
                  color: targetType === 'WORKER' ? '#065f46' : '#1e293b',
                  fontSize: 13,
                  fontWeight: targetType === 'WORKER' ? 800 : 600,
                  appearance: 'none',
                  outline: 'none',
                  cursor: 'pointer',
                  boxShadow: targetType === 'WORKER'
                    ? '0 6px 16px rgba(5, 150, 105, 0.18)'
                    : '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <option value="">
                  {isMr ? '👤 येथे क्लिक करून कार्यकर्ता निवडा...' : '👤 Choose a field worker...'}
                </option>
                {fieldWorkers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.full_name} {u.phone ? `(📞 ${u.phone})` : ''}
                  </option>
                ))}
                {otherUsers.length > 0 && (
                  <optgroup label={isMr ? '👔 इतर अधिकारी / कर्मचारी' : '👔 Other Staff'}>
                    {otherUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.full_name} ({u.roles?.map((r) => r.name).join(', ')})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <ChevronDown
                size={15}
                color={targetType === 'WORKER' ? '#059669' : '#64748b'}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none',
                }}
              />
            </div>
          </div>

          {/* Section 3: Active Permissions Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ height: 21, display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 750, color: '#047857' }}>
                {isMr ? '📊 सद्यस्थिती' : '📊 Status'}
              </span>
            </div>

            <div
              className="status-card-3d"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #047857 100%)',
                border: '1.5px solid #059669',
                borderRadius: 12,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                height: 46,
                boxSizing: 'border-box',
                boxShadow: '0 8px 20px -2px rgba(16, 185, 129, 0.42), inset 0 1px 1px rgba(255, 255, 255, 0.45)',
                cursor: 'default',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                  }}
                >
                  <Check size={11} color="#047857" strokeWidth={3.5} />
                </div>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 750,
                    color: '#ffffff',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isMr ? 'सक्रिय' : 'Active'}
                </span>
              </div>
              <div
                style={{
                  fontSize: 19,
                  fontWeight: 900,
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                {stagedPermIds.size} / {availablePermissions.length || 10}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. MAIN PERMISSIONS TABLE CARD                                 */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 18,
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.07), 0 3px 8px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          animation: 'cardEntrance3D 0.45s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
            }}
          >
            <thead>
              <tr
                style={{
                  borderBottom: '1.5px solid #e2e8f0',
                  background: '#f8fafc',
                }}
              >
                <th
                  style={{
                    padding: '14px 22px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    width: 140,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'स्थिती' : 'Status'}
                </th>
                <th
                  style={{
                    padding: '14px 22px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'परवानगी' : 'Permission'}
                </th>
                <th
                  style={{
                    padding: '14px 22px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    width: 250,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'कोणास दिली आहे' : 'Assigned To'}
                </th>
                <th
                  style={{
                    padding: '14px 22px',
                    fontSize: 12,
                    fontWeight: 800,
                    color: '#475569',
                    width: 120,
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  {isMr ? 'चालू/बंद' : 'Toggle'}
                </th>
              </tr>
            </thead>
            <tbody>
              {loadingPerms ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    Loading permissions...
                  </td>
                </tr>
              ) : sortedPermissions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    {isMr ? 'कोणतीही परवानगी सापडली नाही.' : 'No permissions available.'}
                  </td>
                </tr>
              ) : (
                sortedPermissions.map((perm) => {
                  const meta = getPermMeta(perm);
                  const isGranted = stagedPermIds.has(perm.id);
                  const IconComp = meta.Icon || Shield;
                  const assignedVal = getAssignedToValue(perm);
                  const selectTheme = getAssignedSelectTheme(assignedVal);

                  return (
                    <tr
                      key={perm.id}
                      className="perm-row-3d"
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isGranted ? '#fcfffd' : '#ffffff',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isGranted ? '#f0fdf4' : '#f8fafc';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isGranted ? '#fcfffd' : '#ffffff';
                      }}
                    >
                      {/* Column 1: Status Pill Badge matching image 1 */}
                      <td style={{ padding: '16px 22px', verticalAlign: 'middle' }}>
                        {isGranted ? (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 11px',
                              borderRadius: 20,
                              background: '#ecfdf5',
                              border: '1px solid #a7f3d0',
                              color: '#047857',
                              fontSize: 12,
                              fontWeight: 800,
                              boxShadow: '0 2px 4px rgba(16,185,129,0.12)',
                            }}
                          >
                            <span
                              className="active-dot-pulsing"
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#10b981',
                              }}
                            />
                            <span>{isMr ? 'सक्रिय' : 'Active'}</span>
                          </span>
                        ) : (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '4px 11px',
                              borderRadius: 20,
                              background: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              color: '#64748b',
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            <span
                              style={{
                                width: 7,
                                height: 7,
                                borderRadius: '50%',
                                background: '#94a3b8',
                              }}
                            />
                            <span>{isMr ? 'बंद' : 'Inactive'}</span>
                          </span>
                        )}
                      </td>

                      {/* Column 2: Permission Avatar + Title + Desc */}
                      <td style={{ padding: '16px 22px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <div
                            className="perm-avatar-3d"
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: '50%',
                              backgroundColor: meta.bgColor,
                              border: `1px solid ${meta.borderColor || '#e2e8f0'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              boxShadow: '0 3px 8px rgba(0,0,0,0.04), inset 0 1px 1px rgba(255,255,255,0.7)',
                            }}
                          >
                            <IconComp size={20} color={meta.color} />
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 800,
                                color: '#0f172a',
                                lineHeight: 1.25,
                              }}
                            >
                              {isMr ? meta.title_mr : meta.title_en}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: '#64748b',
                                marginTop: 3,
                                lineHeight: 1.35,
                              }}
                            >
                              {isMr ? meta.desc_mr : meta.desc_en}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: Assigned To Styled Dropdown Pill */}
                      <td style={{ padding: '16px 22px', verticalAlign: 'middle' }}>
                        <div style={{ position: 'relative', width: 230 }}>
                          <select
                            className="assigned-select-3d"
                            value={assignedVal}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'NONE') {
                                if (stagedPermIds.has(perm.id)) {
                                  handleToggle(perm.id);
                                }
                              } else if (val === 'ROLE_WORKER') {
                                setTargetType('ROLE');
                                if (workerRole) setSelectedRoleId(workerRole.id);
                                setSelectedWorkerId('');
                                if (!stagedPermIds.has(perm.id)) {
                                  handleToggle(perm.id);
                                }
                              } else if (val === 'ROLE_OFFICER') {
                                setTargetType('ROLE');
                                if (officerRole) setSelectedRoleId(officerRole.id);
                                setSelectedWorkerId('');
                                if (!stagedPermIds.has(perm.id)) {
                                  handleToggle(perm.id);
                                }
                              } else if (val === 'ROLE_ADMIN') {
                                setTargetType('ROLE');
                                if (adminRole) setSelectedRoleId(adminRole.id);
                                setSelectedWorkerId('');
                                if (!stagedPermIds.has(perm.id)) {
                                  handleToggle(perm.id);
                                }
                              } else if (val.startsWith('WORKER_')) {
                                const wId = val.replace('WORKER_', '');
                                setTargetType('WORKER');
                                setSelectedWorkerId(wId);
                                if (!stagedPermIds.has(perm.id)) {
                                  handleToggle(perm.id);
                                }
                              } else if (val === 'CUSTOM_ASSIGN') {
                                setAssignModal({
                                  permId: perm.id,
                                  permName: isMr ? meta.title_mr : meta.title_en,
                                });
                                setAssignTargetUserId(fieldWorkers[0]?.id || '');
                              }
                            }}
                            style={{
                              width: '100%',
                              height: 38,
                              paddingLeft: 12,
                              paddingRight: 32,
                              borderRadius: 8,
                              border: selectTheme.border,
                              background: selectTheme.bg,
                              fontSize: 12.5,
                              fontWeight: 750,
                              color: selectTheme.color,
                              appearance: 'none',
                              outline: 'none',
                              cursor: 'pointer',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                            }}
                          >
                            <option value="ROLE_WORKER">
                              {isMr ? 'सर्व कार्यकर्ते (All Field Workers)' : 'All Field Workers'}
                            </option>
                            <option value="ROLE_OFFICER">
                              {isMr ? 'नेता / अधिकारी (Leader / Officer)' : 'Leader / Officer'}
                            </option>
                            <option value="ROLE_ADMIN">
                              {isMr ? 'ॲडमिनिस्ट्रेटर (Administrator)' : 'Administrator'}
                            </option>
                            <option value="NONE">
                              {isMr ? 'कोणीही नाही (None)' : 'None'}
                            </option>

                            {fieldWorkers.length > 0 && (
                              <optgroup label={isMr ? 'विशिष्ट कार्यकर्ता निवडा' : 'Specific Field Worker'}>
                                {fieldWorkers.map((w) => (
                                  <option key={w.id} value={`WORKER_${w.id}`}>
                                    {w.full_name}
                                  </option>
                                ))}
                              </optgroup>
                            )}

                            <option value="CUSTOM_ASSIGN">
                              ➕ {isMr ? 'इतर कार्यकर्त्यास जोडा...' : 'Assign to particular worker...'}
                            </option>
                          </select>
                          <ChevronDown
                            size={14}
                            color={selectTheme.chevron}
                            style={{
                              position: 'absolute',
                              right: 12,
                              top: '50%',
                              transform: 'translateY(-50%)',
                              pointerEvents: 'none',
                            }}
                          />
                        </div>
                      </td>

                      {/* Column 4: Toggle Switch matching image 1 colors with 3D tactile switch */}
                      <td style={{ padding: '16px 22px', verticalAlign: 'middle', textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
                          <button
                            type="button"
                            className="toggle-btn-3d"
                            onClick={() => handleToggle(perm.id)}
                            style={{
                              width: 50,
                              height: 27,
                              borderRadius: 9999,
                              border: isGranted ? '1.5px solid #059669' : '2px solid #cbd5e1',
                              background: isGranted
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
                              position: 'relative',
                              cursor: 'pointer',
                              outline: 'none',
                              padding: 0,
                              boxShadow: isGranted
                                ? 'inset 0 2px 4px rgba(0,0,0,0.2), 0 3px 8px rgba(16, 185, 129, 0.4)'
                                : 'inset 0 1px 3px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.03)',
                            }}
                            title={isGranted ? 'Click to deactivate' : 'Click to activate'}
                          >
                            <span
                              style={{
                                width: 19,
                                height: 19,
                                borderRadius: '50%',
                                background: isGranted ? '#ffffff' : '#94a3b8',
                                position: 'absolute',
                                top: 2.5,
                                left: isGranted ? 25 : 3,
                                transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                boxShadow: isGranted
                                  ? '0 3px 6px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.9)'
                                  : '0 2px 4px rgba(0,0,0,0.15)',
                              }}
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. QUICK ASSIGN MODAL                                          */}
      {/* ============================================================== */}
      {assignModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: 16,
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              padding: '24px 20px',
              maxWidth: 'min(440px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20 }}>➕</span>
                <strong style={{ fontSize: 16, color: '#0f172a' }}>
                  {isMr ? 'विशिष्ट कार्यकर्त्यास परवानगी द्या' : 'Assign Permission to Worker'}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: 13, color: '#64748b' }}>
              {isMr
                ? `खालील कार्यकर्त्यास "${assignModal.permName}" ही परवानगी थेट दिली जाईल:`
                : `Grant permission "${assignModal.permName}" directly to the selected worker:`}
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                {isMr ? 'कार्यकर्ता निवडा:' : 'Select Worker:'}
              </label>
              <select
                value={assignTargetUserId}
                onChange={(e) => setAssignTargetUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid #cbd5e1',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                {fieldWorkers.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.full_name} (Field Worker · 📞 {u.phone || 'N/A'})
                  </option>
                ))}
                {otherUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    👤 {u.full_name} ({u.roles?.map((r) => r.name).join(', ')})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setAssignModal(null)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 6,
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#475569',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={handleQuickAssignToWorker}
                disabled={isSaving}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#16a34a',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 750,
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                }}
              >
                {isSaving ? '...' : (isMr ? '＋ परवानगी द्या' : '＋ Grant Permission')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
