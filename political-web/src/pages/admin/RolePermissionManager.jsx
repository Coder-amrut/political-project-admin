import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/axios';

// 10 Simple Permissions Metadata
const SIMPLE_PERMISSIONS_CONFIG = {
  admin_panel: {
    code: 'admin_panel',
    icon: '🏛️',
    title_en: 'Admin Panel',
    title_mr: 'ॲडमिन पॅनेल (मुख्य नियंत्रण)',
    desc_en: 'Full access to Admin Command HQ, master settings, database, and system control.',
    desc_mr: 'ॲडमिन कमांड मुख्यालय, मुख्य सेटिंग्ज, डेटाबेस आणि संपूर्ण प्रशासकीय नियंत्रण.',
    color: '#1e3a8a',
  },
  political_command: {
    code: 'political_command',
    icon: '⚡',
    title_en: 'Political Command',
    title_mr: 'राजकीय नियंत्रण कक्ष (नेता डेस्क)',
    desc_en: 'Access to Political Command HQ, Executive Dashboard, and Leader Desk.',
    desc_mr: 'राजकीय कमांड मुख्यालय, सर्वोच्च नेतृत्व डॅशबोर्ड व नेता कक्ष प्रवेश.',
    color: '#ea580c',
  },
  user_management: {
    code: 'user_management',
    icon: '👥',
    title_en: 'User Management',
    title_mr: 'वापरकर्ते व्यवस्थापन',
    desc_en: 'Create, approve, and manage user accounts, staff, and access rights.',
    desc_mr: 'वापरकर्ते खाती व्यवस्थापित करा, नवीन नोंदणी मंजूर/नामंजूर करा व परवानग्या द्या.',
    color: '#4f46e5',
  },
  project_management: {
    code: 'project_management',
    icon: '📁',
    title_en: 'Project Management',
    title_mr: 'प्रकल्प व्यवस्थापन',
    desc_en: 'Create, configure, and monitor political election projects.',
    desc_mr: 'निवडणूक व राजकीय प्रचार प्रकल्प तयार करा, संपादित करा आणि देखरेख करा.',
    color: '#0284c7',
  },
  geography_booths: {
    code: 'geography_booths',
    icon: '🗺️',
    title_en: 'Geography & Booths',
    title_mr: 'भौगोलिक व मतदान केंद्र रचना',
    desc_en: 'Manage constituencies, talukas, villages, wards, and polling booths.',
    desc_mr: 'विधानसभा मतदारसंघ, तालुके, गावे, वॉर्ड आणि मतदान केंद्र रचना व्यवस्थापन.',
    color: '#059669',
  },
  voter_surveys: {
    code: 'voter_surveys',
    icon: '📋',
    title_en: 'Voter Surveys',
    title_mr: 'मतदार व कुटुंब सर्व्हे',
    desc_en: 'Conduct household surveys and record ground voter data.',
    desc_mr: 'घरोघरी जाऊन कुटुंब सर्वेक्षण करणे व प्रत्यक्ष ऑन-फील्ड मतदार डेटा नोंदवणे.',
    color: '#d97706',
  },
  citizen_crm: {
    code: 'citizen_crm',
    icon: '🤝',
    title_en: 'Citizen CRM 360°',
    title_mr: 'नागरिक CRM व तक्रारी',
    desc_en: 'Manage 360° citizen voter profiles, voter contacts, and grievances.',
    desc_mr: 'नागरिक ३६०° मतदार प्रोफाईल्स, संपर्क इतिहास व समस्या निवारण व्यवस्थापन.',
    color: '#0d9488',
  },
  meetings_tours: {
    code: 'meetings_tours',
    icon: '📅',
    title_en: 'Tour & Meetings',
    title_mr: 'दौरे, सभा व बैठका',
    desc_en: 'Schedule and manage rallies, leader visits, and cadre meetings.',
    desc_mr: 'राजकीय सभा, नेत्यांचे क्षेत्रीय दौरे आणि कार्यकर्ता बैठका नियोजन.',
    color: '#7c3aed',
  },
  strategic_reports: {
    code: 'strategic_reports',
    icon: '📊',
    title_en: 'Strategic Reports',
    title_mr: 'व्यूहरचना व विश्लेषण अहवाल',
    desc_en: 'Access ground pulse reports, voter trend analytics, and data exports.',
    desc_mr: 'मतदार कल विश्लेषण, ग्राउंड पल्स रिपोर्ट्स आणि एक्सेल/पीडीएफ डेटा एक्सपोर्ट.',
    color: '#dc2626',
  },
  ai_chatbot: {
    code: 'ai_chatbot',
    icon: '🤖',
    title_en: 'AI Campaign Assistant',
    title_mr: 'AI प्रचार व निवडणूक सहाय्यक',
    desc_en: 'Access AI Campaign Assistant, strategic talking points, and Q&A desk.',
    desc_mr: 'AI प्रचार सहाय्यक, भाषण मुद्दे आणि मतदार संवाद मार्गदर्शन.',
    color: '#2563eb',
  },
};

function getPermMeta(perm) {
  if (!perm) return null;
  const cfg = SIMPLE_PERMISSIONS_CONFIG[perm.name];
  if (cfg) return cfg;
  const cleanName = (perm.name || '').replace(/_/g, ' ').replace(/\./g, ' ');
  return {
    code: perm.name,
    icon: '🛡️',
    title_en: cleanName.charAt(0).toUpperCase() + cleanName.slice(1),
    title_mr: cleanName,
    desc_en: perm.description || '',
    desc_mr: perm.description || '',
    color: '#64748b',
  };
}

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

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick Worker Assignment Modal
  const [assignModal, setAssignModal] = useState(null); // { permId, permName }
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

  // Sync default role
  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      // Default to WORKER or first role
      const workerRole = roles.find((r) => r.name === 'WORKER') || roles[0];
      setSelectedRoleId(workerRole.id);
    }
  }, [roles, selectedRoleId]);

  const currentRole = useMemo(() => {
    return roles.find((r) => r.id === selectedRoleId) || null;
  }, [roles, selectedRoleId]);

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
      // Load worker permissions from API
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

  // Filtered list of 10 permissions
  const displayedPermissions = useMemo(() => {
    if (!searchQuery.trim()) return availablePermissions;
    const q = searchQuery.toLowerCase().trim();
    return availablePermissions.filter((p) => {
      const meta = getPermMeta(p);
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (meta?.title_en || '').toLowerCase().includes(q) ||
        (meta?.title_mr || '').toLowerCase().includes(q) ||
        (meta?.desc_en || '').toLowerCase().includes(q) ||
        (meta?.desc_mr || '').toLowerCase().includes(q)
      );
    });
  }, [availablePermissions, searchQuery]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif" }}>

      {/* ============================================================== */}
      {/* 1. TOP SELECTION HUB: ROLE OR FIELD WORKER DROPDOWN            */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Tricolor Accent Top Bar */}
        <div
          style={{
            height: 4,
            background: 'linear-gradient(90deg, #FF671F 0%, #FF9933 33.3%, #FFFFFF 33.3%, #FFFFFF 66.6%, #138808 66.6%, #046A38 100%)',
          }}
        />

        <div style={{ padding: '18px 22px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>🛡️</span>
                <h2 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: '#0f172a' }}>
                  {isMr ? 'सोपे भूमिका व परवानग्या व्यवस्थापन' : 'Simple Roles & Permissions Manager'}
                </h2>
                <span style={{ fontSize: 11, fontWeight: 750, background: '#eff6ff', color: '#1e40af', padding: '3px 9px', borderRadius: 20, border: '1px solid #bfdbfe' }}>
                  {isMr ? '१० मुख्य परवानग्या' : '10 Simple Permissions'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#64748b' }}>
                {isMr
                  ? 'भूमिका निवडा किंवा खालील ड्रॉपडाऊनमधून थेट क्षेत्रीय कार्यकर्ता निवडून परवानग्या चालू/बंद करा.'
                  : 'Select a role or choose any Field Worker from the dropdown to turn permissions ON or OFF.'}
              </p>
            </div>

            {/* Save Changes Floating Status */}
            {hasChanges && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fffbeb', border: '1px solid #fcd34d', padding: '6px 14px', borderRadius: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>
                  ⚠️ {isMr ? 'बदल सेव्ह करणे बाकी आहे' : 'Unsaved Changes'}
                </span>
                <button
                  onClick={handleDiscard}
                  disabled={isSaving}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    padding: '5px 10px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {isMr ? 'रद्द करा' : 'Discard'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  style={{
                    background: '#16a34a',
                    border: 'none',
                    padding: '5px 14px',
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 750,
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(22, 163, 74, 0.3)',
                  }}
                >
                  {isSaving ? '...' : (isMr ? '💾 सेव्ह करा' : '💾 Save')}
                </button>
              </div>
            )}
          </div>

          {/* TWO PRIMARY SELECTION CONTROLS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 16, background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0' }}>

            {/* Option 1: Pick by Role */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👑</span>
                <span>{isMr ? '१. भूमिकेनुसार परवानग्या (By Role):' : '1. Configure By Role:'}</span>
              </label>

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {roles.map((r) => {
                  const isSelected = targetType === 'ROLE' && selectedRoleId === r.id;
                  const icon = r.name === 'ADMIN' ? '👑' : r.name === 'OFFICER' ? '👔' : '👷';
                  const badgeColor = r.name === 'ADMIN' ? '#4f46e5' : r.name === 'OFFICER' ? '#0284c7' : '#059669';

                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setTargetType('ROLE');
                        setSelectedRoleId(r.id);
                        setSelectedWorkerId('');
                      }}
                      style={{
                        flex: '1 1 120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: isSelected ? `2px solid ${badgeColor}` : '1px solid #cbd5e1',
                        background: isSelected ? '#ffffff' : '#f1f5f9',
                        color: isSelected ? badgeColor : '#334155',
                        fontWeight: isSelected ? 800 : 600,
                        fontSize: 13,
                        cursor: 'pointer',
                        boxShadow: isSelected ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span style={{ fontSize: 16 }}>{icon}</span>
                      <span>{r.display_name || r.name}</span>
                      <span style={{ fontSize: 11, background: isSelected ? `${badgeColor}15` : '#e2e8f0', color: isSelected ? badgeColor : '#64748b', padding: '1px 6px', borderRadius: 10 }}>
                        {r.permissions?.length || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Option 2: PROMINENT FIELD WORKER DROPDOWN */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 750, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>👷</span>
                <span>{isMr ? '२. थेट क्षेत्रीय कार्यकर्ता निवडा (Field Worker Dropdown):' : '2. Select Field Worker Directly:'}</span>
                <span style={{ fontSize: 11, color: '#059669', background: '#ecfdf5', padding: '1px 7px', borderRadius: 4, fontWeight: 700 }}>
                  {fieldWorkers.length} {isMr ? 'कार्यकर्ते' : 'Workers'}
                </span>
              </label>

              <div style={{ position: 'relative' }}>
                <select
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
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: targetType === 'WORKER' ? '2px solid #059669' : '1px solid #cbd5e1',
                    background: targetType === 'WORKER' ? '#ffffff' : '#f8fafc',
                    color: targetType === 'WORKER' ? '#065f46' : '#1e293b',
                    fontSize: 13.5,
                    fontWeight: targetType === 'WORKER' ? 750 : 500,
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: targetType === 'WORKER' ? '0 0 0 3px rgba(5, 150, 105, 0.15)' : 'none',
                  }}
                >
                  <option value="">
                    {isMr ? '▼ येथे क्लिक करून क्षेत्रीय कार्यकर्ता निवडा...' : '▼ Click here to select a Field Worker...'}
                  </option>

                  {/* Field Workers Group */}
                  <optgroup label={isMr ? '👷 क्षेत्रीय कार्यकर्ते (Field Workers)' : '👷 Field Workers'}>
                    {fieldWorkers.map((u) => (
                      <option key={u.id} value={u.id}>
                        👤 {u.full_name} (Field Worker · 📞 {u.phone || 'N/A'})
                      </option>
                    ))}
                  </optgroup>

                  {/* Officers Group */}
                  {otherUsers.length > 0 && (
                    <optgroup label={isMr ? '👔 इतर अधिकारी / वापरकर्ते' : '👔 Officers & Staff'}>
                      {otherUsers.map((u) => {
                        const rName = u.roles?.map((r) => r.display_name || r.name).join(', ') || 'User';
                        return (
                          <option key={u.id} value={u.id}>
                            👤 {u.full_name} ({rName} · 📞 {u.phone || 'N/A'})
                          </option>
                        );
                      })}
                    </optgroup>
                  )}
                </select>
              </div>
            </div>

          </div>

          {/* ACTIVE TARGET BANNER */}
          <div
            style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 8,
              background: targetType === 'ROLE' ? '#f0f9ff' : '#ecfdf5',
              border: `1px solid ${targetType === 'ROLE' ? '#bae6fd' : '#a7f3d0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>{targetType === 'ROLE' ? '👔' : '👤'}</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: targetType === 'ROLE' ? '#0369a1' : '#047857' }}>
                  {isMr ? 'सध्याच्या परवानग्या व्यवस्थापन:' : 'Currently Configuring Permissions For:'}
                </span>{' '}
                <strong style={{ fontSize: 14, color: '#0f172a' }}>
                  {targetType === 'ROLE'
                    ? (currentRole?.display_name || currentRole?.name)
                    : `${selectedWorker?.full_name} (Field Worker · ${selectedWorker?.phone || ''})`}
                </strong>
              </div>
            </div>

            <div style={{ fontSize: 12, color: '#475569', fontWeight: 600 }}>
              {isMr ? 'सक्रिय परवानग्या:' : 'Active Permissions:'}{' '}
              <strong style={{ color: '#16a34a', fontSize: 13 }}>{stagedPermIds.size} / 10</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE 10 SIMPLE PERMISSIONS TABLE                             */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 14,
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Table Top Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>📋</span>
            <span style={{ fontSize: 14, fontWeight: 750, color: '#0f172a' }}>
              {isMr ? '१० सोप्या परवानग्यांची यादी' : 'List of 10 Simple Permissions'}
            </span>
            <span style={{ fontSize: 12, color: '#64748b' }}>
              ({displayedPermissions.length} {isMr ? 'दिसत आहेत' : 'shown'})
            </span>
          </div>

          {/* Quick Search Box */}
          <div style={{ position: 'relative', width: 280 }}>
            <input
              type="text"
              placeholder={isMr ? 'परवानगी शोधा...' : 'Search permission...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 30px 7px 10px',
                borderRadius: 6,
                border: '1px solid #cbd5e1',
                fontSize: 12.5,
                outline: 'none',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* The Clean Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 750, color: '#475569', width: 80, textAlign: 'center' }}>
                  {isMr ? 'स्थिती' : 'Status'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 750, color: '#475569', width: 340 }}>
                  {isMr ? 'परवानगी (Simple Permission)' : 'Simple Permission'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 750, color: '#475569' }}>
                  {isMr ? 'क्षेत्रीय कार्यकर्ते (Field Workers Dropdown)' : 'Field Workers Assigned (Dropdown)'}
                </th>
                <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 750, color: '#475569', width: 140, textAlign: 'right' }}>
                  {isMr ? 'चालू / बंद' : 'Toggle'}
                </th>
              </tr>
            </thead>
            <tbody>
              {displayedPermissions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 30, textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', fontSize: 13 }}>
                    {loadingPerms ? 'Loading...' : (isMr ? 'कोणतीही परवानगी सापडली नाही.' : 'No permissions found.')}
                  </td>
                </tr>
              ) : (
                displayedPermissions.map((perm, index) => {
                  const meta = getPermMeta(perm);
                  const isGranted = stagedPermIds.has(perm.id);
                  const isInherited = workerInheritedIds.has(perm.id);
                  const isModified = isGranted !== originalPermIds.has(perm.id);

                  // Users in current role who have this permission
                  const roleUsersWithPerm = (currentRole?.users || []).filter(() => isGranted);

                  return (
                    <tr
                      key={perm.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        background: isModified
                          ? (isGranted ? '#f0fdf4' : '#fef2f2')
                          : (isGranted ? '#fafcff' : '#ffffff'),
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {/* Column 1: Status Icon */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: isGranted ? '#dcfce7' : '#f1f5f9',
                            color: isGranted ? '#15803d' : '#94a3b8',
                            fontSize: 14,
                            fontWeight: 800,
                          }}
                        >
                          {isGranted ? '✓' : '—'}
                        </span>
                      </td>

                      {/* Column 2: 10 Simple Permission Details */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 10,
                              background: isGranted ? `${meta.color}15` : '#f1f5f9',
                              border: `1px solid ${isGranted ? `${meta.color}40` : '#e2e8f0'}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 20,
                              flexShrink: 0,
                            }}
                          >
                            {meta.icon}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                              <strong style={{ fontSize: 14, color: isGranted ? '#0f172a' : '#475569', fontWeight: 800 }}>
                                #{index + 1}. {isMr ? meta.title_mr : meta.title_en}
                              </strong>
                              <code
                                style={{
                                  fontSize: 11,
                                  background: isGranted ? '#eff6ff' : '#f1f5f9',
                                  color: isGranted ? '#1e40af' : '#64748b',
                                  padding: '2px 7px',
                                  borderRadius: 4,
                                  fontWeight: 600,
                                }}
                              >
                                {perm.name}
                              </code>
                              {isModified && (
                                <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4, background: isGranted ? '#dcfce7' : '#fee2e2', color: isGranted ? '#15803d' : '#b91c1c' }}>
                                  {isGranted ? '+New' : '-Revoked'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: 12, color: '#64748b', marginTop: 3, lineHeight: 1.4 }}>
                              {isMr ? meta.desc_mr : meta.desc_en}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Column 3: FIELD WORKER NAME DROPDOWN */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          {targetType === 'ROLE' ? (
                            /* When viewing by Role: Dropdown of workers who have this role permission */
                            <div style={{ width: '100%', maxWidth: 320 }}>
                              <select
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'ADD_WORKER') {
                                    setAssignModal({ permId: perm.id, permName: isMr ? meta.title_mr : meta.title_en });
                                    setAssignTargetUserId(fieldWorkers[0]?.id || '');
                                    e.target.value = '';
                                  } else if (val) {
                                    // Jump directly to customize this worker!
                                    setTargetType('WORKER');
                                    setSelectedWorkerId(val);
                                  }
                                }}
                                defaultValue=""
                                style={{
                                  width: '100%',
                                  padding: '7px 10px',
                                  borderRadius: 6,
                                  border: '1px solid #cbd5e1',
                                  fontSize: 12.5,
                                  color: isGranted ? '#0f172a' : '#64748b',
                                  background: isGranted ? '#ffffff' : '#f8fafc',
                                  cursor: 'pointer',
                                }}
                              >
                                <option value="" disabled>
                                  {isGranted
                                    ? `👥 ${isMr ? 'कार्यकर्त्यांची नावे पहा' : 'View Assigned Workers'} (${roleUsersWithPerm.length}) ▼`
                                    : `⚪ ${isMr ? 'या भूमिकेत परवानगी बंद आहे' : 'Disabled for this role'} ▼`}
                                </option>

                                {roleUsersWithPerm.map((u) => (
                                  <option key={u.id} value={u.id}>
                                    👤 {u.full_name} ({currentRole?.name} · 📞 {u.phone || 'N/A'})
                                  </option>
                                ))}

                                <option disabled>──────────────────────────</option>
                                <option value="ADD_WORKER">
                                  ➕ {isMr ? 'विशिष्ट कार्यकर्त्यास ही परवानगी द्या...' : 'Assign to particular worker...'}
                                </option>
                              </select>
                            </div>
                          ) : (
                            /* When viewing by a Specific Field Worker */
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  padding: '5px 12px',
                                  borderRadius: 6,
                                  fontSize: 12,
                                  fontWeight: 700,
                                  background: isGranted
                                    ? '#dcfce7'
                                    : (isInherited ? '#eff6ff' : '#f1f5f9'),
                                  color: isGranted
                                    ? '#15803d'
                                    : (isInherited ? '#1e40af' : '#64748b'),
                                  border: `1px solid ${isGranted ? '#bbf7d0' : (isInherited ? '#bfdbfe' : '#e2e8f0')}`,
                                }}
                              >
                                👤 {selectedWorker?.full_name} :{' '}
                                {isGranted
                                  ? (isMr ? '⭐ थेट दिली आहे (Direct)' : '⭐ Granted Directly')
                                  : (isInherited ? (isMr ? '👔 भूमिकेद्वारे चालू (Role)' : '👔 Active via Role') : (isMr ? 'काढून घेतली (Revoked)' : 'Not Granted'))}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Column 4: SIMPLE ON / OFF TOGGLE SWITCH */}
                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => handleToggle(perm.id)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '6px 14px',
                            borderRadius: 20,
                            border: isGranted ? '1px solid #16a34a' : '1px solid #cbd5e1',
                            background: isGranted ? '#16a34a' : '#f1f5f9',
                            color: isGranted ? '#ffffff' : '#475569',
                            fontSize: 12,
                            fontWeight: 750,
                            cursor: 'pointer',
                            boxShadow: isGranted ? '0 2px 6px rgba(22, 163, 74, 0.25)' : 'none',
                            transition: 'all 0.15s ease',
                          }}
                          title={isGranted ? 'Click to revoke' : 'Click to grant'}
                        >
                          <span
                            style={{
                              display: 'inline-block',
                              width: 8,
                              height: 8,
                              borderRadius: '50%',
                              background: isGranted ? '#ffffff' : '#94a3b8',
                            }}
                          />
                          <span>{isGranted ? (isMr ? 'चालू (ON)' : 'ON') : (isMr ? 'बंद (OFF)' : 'OFF')}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Save Bar */}
        {hasChanges && (
          <div
            style={{
              padding: '14px 20px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                {isMr
                  ? `${stagedPermIds.size} परवानग्या निश्चित केल्या आहेत. बदल लागू करण्यासाठी सेव्ह करा.`
                  : `${stagedPermIds.size} permissions configured. Click Save to apply changes.`}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleDiscard}
                disabled={isSaving}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#475569',
                  cursor: 'pointer',
                }}
              >
                {isMr ? '↺ पूर्ववत करा' : '↺ Discard'}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                  border: 'none',
                  padding: '7px 20px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#ffffff',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)',
                }}
              >
                {isSaving ? '...' : (isMr ? '💾 बदल सेव्ह करा' : '💾 Save Permissions')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 3. QUICK ASSIGN MODAL (WHEN CHOOSING "ADD WORKER" IN DROPDOWN)  */}
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
              borderRadius: 12,
              padding: 24,
              maxWidth: 440,
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '1px solid #e2e8f0',
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
                {isMr ? 'कार्यकर्ता निवडा (Select Worker):' : 'Select Worker:'}
              </label>
              <select
                value={assignTargetUserId}
                onChange={(e) => setAssignTargetUserId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: 6,
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
