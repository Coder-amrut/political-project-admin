import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';

export default function KaryakartaPerformance({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, offline
  const [roleFilter, setRoleFilter] = useState('all'); // all, WORKER, OFFICER
  const [workers, setWorkers] = useState([]);
  const [rolesList, setRolesList] = useState([
    { id: 1, name: 'WORKER', display_name: 'Field Worker' },
    { id: 2, name: 'OFFICER', display_name: 'Leader / Officer' },
  ]);
  const [loading, setLoading] = useState(true);

  // Direct Task Assignment State
  const [selectedWorkerForTask, setSelectedWorkerForTask] = useState(null);
  const [taskNote, setTaskNote] = useState('');
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskSubmittedToast, setTaskSubmittedToast] = useState(false);

  // Edit Worker (Users Table) State
  const [editingWorker, setEditingWorker] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    role_id: 1,
    phone: '',
    status: 'active',
    assigned_area_mr: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState(null);

  // Add Worker (Users Table) State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newWorkerData, setNewWorkerData] = useState({
    name: '',
    role_id: 1,
    phone: '',
    status: 'active',
    assigned_area_mr: '',
  });
  const [addSubmitting, setAddSubmitting] = useState(false);
  const [addSuccessMsg, setAddSuccessMsg] = useState(null);

  // Global Alert / Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchRoles = async () => {
    try {
      const res = await netaApi.getRoles();
      if (res.success && res.data && res.data.length > 0) {
        setRolesList(res.data);
      }
    } catch (err) {
      console.warn('Roles fetch fallback to defaults', err);
    }
  };

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (search.trim()) params.search = search.trim();

      const res = await netaApi.getKaryakartas(params);
      if (res.success) {
        setWorkers(res.data);
      }
    } catch (err) {
      console.error('Failed to load karyakartas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchWorkers();
    }, 250);
    return () => clearTimeout(timer);
  }, [statusFilter, roleFilter, search]);

  // Top 3 Stars based on surveys done
  const topStars = [...workers].sort((a, b) => b.total_surveys - a.total_surveys).slice(0, 3);
  const activeCount = workers.filter((w) => w.status === 'active').length;
  const workerCount = workers.filter((w) => w.role_name === 'WORKER').length;
  const officerCount = workers.filter((w) => w.role_name === 'OFFICER').length;

  // Open Edit Modal
  const handleOpenEdit = (worker) => {
    setEditingWorker(worker);
    setEditSuccessMsg(null);
    setEditFormData({
      name: worker.name || '',
      role_id: worker.role_id || (worker.role_name === 'OFFICER' ? 2 : 1),
      phone: worker.phone || '',
      status: worker.status === 'active' ? 'active' : 'offline',
      assigned_area_mr: worker.assigned_area_mr || '',
    });
  };

  // Submit Worker Edit (saves directly to users and user_roles table)
  const handleSaveWorkerEdit = async (e) => {
    e.preventDefault();
    if (!editFormData.name.trim() || !editFormData.phone.trim()) {
      alert(isMr ? 'कृपया नाव आणि फोन नंबर प्रविष्ट करा.' : 'Please enter name and phone number.');
      return;
    }

    setEditSubmitting(true);
    try {
      const res = await netaApi.updateKaryakarta(editingWorker.id, {
        name: editFormData.name.trim(),
        role_id: Number(editFormData.role_id),
        phone: editFormData.phone.trim(),
        status: editFormData.status,
        assigned_area_mr: editFormData.assigned_area_mr.trim(),
      });

      if (res.success) {
        setEditSuccessMsg(
          isMr
            ? '✓ कार्यकर्त्याचे नाव व भूमिका यशस्वीरित्या जतन झाली!'
            : '✓ Worker details saved successfully!'
        );
        showToast(
          isMr
            ? `कार्यकर्ता '${editFormData.name}' यशस्वीरित्या अद्ययावत केला.`
            : `Worker '${editFormData.name}' updated successfully.`
        );
        setTimeout(() => {
          setEditingWorker(null);
          setEditSuccessMsg(null);
          fetchWorkers();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to update worker in user table:', err);
      const errMsg = err?.response?.data?.message || err?.message || (isMr ? 'बदल सेव्ह करताना त्रुटी आली.' : 'Failed to save changes.');
      alert(errMsg);
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setIsAddModalOpen(true);
    setAddSuccessMsg(null);
    setNewWorkerData({
      name: '',
      role_id: 1,
      phone: '',
      status: 'active',
      assigned_area_mr: '',
    });
  };

  // Submit New Worker
  const handleSaveNewWorker = async (e) => {
    e.preventDefault();
    if (!newWorkerData.name.trim() || !newWorkerData.phone.trim()) {
      alert(isMr ? 'कृपया नाव आणि फोन नंबर प्रविष्ट करा.' : 'Please enter name and phone number.');
      return;
    }

    setAddSubmitting(true);
    try {
      const res = await netaApi.createKaryakarta({
        name: newWorkerData.name.trim(),
        role_id: Number(newWorkerData.role_id),
        phone: newWorkerData.phone.trim(),
        status: newWorkerData.status,
        assigned_area_mr: newWorkerData.assigned_area_mr.trim() || (isMr ? 'सांगली कार्यक्षेत्र' : 'Sangli Area'),
      });

      if (res.success) {
        setAddSuccessMsg(
          isMr
            ? '✓ नवीन कार्यकर्ता यशस्वीरित्या नोंदवला गेला!'
            : '✓ New worker registered successfully!'
        );
        showToast(
          isMr
            ? `नवीन कार्यकर्ता '${newWorkerData.name}' तयार केला.`
            : `New worker '${newWorkerData.name}' created.`
        );
        setTimeout(() => {
          setIsAddModalOpen(false);
          setAddSuccessMsg(null);
          fetchWorkers();
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create worker in users table:', err);
      const errMsg = err?.response?.data?.message || err?.message || (isMr ? 'कार्यकर्ता जोडताना त्रुटी आली.' : 'Failed to add worker.');
      alert(errMsg);
    } finally {
      setAddSubmitting(false);
    }
  };

  // Direct Task Assignment
  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!taskNote.trim() || !selectedWorkerForTask) return;
    setTaskSubmitting(true);
    try {
      const res = await netaApi.assignKaryakartaTask(selectedWorkerForTask.id, taskNote.trim());
      if (res.success) {
        setTaskSubmittedToast(true);
        setTimeout(() => {
          setTaskSubmittedToast(false);
          setSelectedWorkerForTask(null);
          setTaskNote('');
        }, 1800);
      }
    } catch (err) {
      console.error('Failed to assign task:', err);
      alert(err?.message || (isMr ? 'टास्क नियुक्त करण्यात त्रुटी आली.' : 'Failed to assign task.'));
    } finally {
      setTaskSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#34d399',
            padding: '12px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
            zIndex: 2000,
            fontSize: '13px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Action Bar: Add New Worker Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '8px' }}>
        <button
          type="button"
          onClick={handleOpenAdd}
          className="btn-3d-blue"
        >
          <span style={{ fontSize: '15px', fontWeight: '900' }}>＋</span> {isMr ? 'नवीन कार्यकर्ता जोडा' : 'Add New Worker'}
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="karyakarta-filter-bar">
        <div className="karyakarta-pills-container">
          {/* Status Tabs - Row 1 on mobile (3 cards) */}
          <div className="karyakarta-pills-row">
            {[
              { key: 'all', label_mr: 'सर्व', label_en: 'All' },
              { key: 'active', label_mr: '🟢 आज सक्रिय', label_en: '🟢 Active' },
              { key: 'offline', label_mr: '⚪ विश्रांतीवर / ऑफलाइन', label_en: '⚪ Offline' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatusFilter(tab.key)}
                className={`pill-3d-box ${statusFilter === tab.key ? 'active' : 'inactive'}`}
                title={isMr ? tab.label_mr : tab.label_en}
              >
                {isMr ? tab.label_mr : tab.label_en}
              </button>
            ))}
          </div>

          {/* Role Filter Divider (desktop only) */}
          <div className="karyakarta-pills-divider" />

          {/* Role Filter Tabs - Row 2 on mobile (3 cards, eka khali ek) */}
          <div className="karyakarta-pills-row">
            {[
              { key: 'all', label_mr: 'सर्व भूमिका', label_en: 'All Roles' },
              { key: 'WORKER', label_mr: '👷 कार्यकर्ते', label_en: 'Workers' },
              { key: 'OFFICER', label_mr: '👔 नेते व अधिकारी', label_en: 'Officers' },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setRoleFilter(tab.key)}
                className={`pill-3d-box ${roleFilter === tab.key ? 'active' : 'inactive'}`}
                title={isMr ? tab.label_mr : tab.label_en}
              >
                {isMr ? tab.label_mr : tab.label_en}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input below on mobile, or right on desktop */}
        <div className="karyakarta-search-wrap">
          <div style={{ position: 'relative', width: '100%' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                fontSize: '13px',
                pointerEvents: 'none',
              }}
            >
              🔍
            </span>
            <input
              type="text"
              placeholder={isMr ? 'नाव, फोन किंवा भूमिका शोधा...' : 'Search worker, phone or role...'}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '8px 12px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
                background: '#f8fafc',
                transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.background = '#f8fafc';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>
      </div>

      {/* Workers Roster Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#1e3a8a', fontWeight: '700' }}>
            ⏳ {isMr ? 'डेटाबेसमधून कार्यकर्त्यांची माहिती लोड होत आहे...' : 'Loading workers from database...'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
            <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'कार्यकर्त्याचे नाव व भूमिका' : 'Worker Name & Role'}</th>
                  <th style={{ padding: '12px 14px' }}>{isMr ? 'संपर्क' : 'Contact'}</th>
                  <th style={{ padding: '12px 14px' }}>{isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Area'}</th>
                  <th style={{ padding: '12px 14px' }}>{isMr ? 'पूर्ण सर्वेक्षण' : 'Surveys Done'}</th>
                  <th style={{ padding: '12px 14px' }}>{isMr ? 'आजचे काम' : "Today's Work"}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center' }}>{isMr ? 'थेट कृती' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {workers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
                      {isMr ? 'कोणतेही कार्यकर्ते आढळले नाहीत.' : 'No workers found.'}
                    </td>
                  </tr>
                ) : (
                  workers.map((worker) => (
                    <tr key={worker.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {/* Name & Role (from Users & Roles table) */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '14px' }}>
                            {worker.name}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontWeight: '600',
                            }}
                            title={isMr ? 'वापरकर्ता आयडी' : 'User ID'}
                          >
                            {isMr ? 'आयडी' : 'ID'} #{worker.user_id || worker.id}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              background: worker.role_name === 'OFFICER' ? '#e0e7ff' : '#ecfdf5',
                              color: worker.role_name === 'OFFICER' ? '#3730a3' : '#065f46',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{worker.role_name === 'OFFICER' ? '👔' : '👷'}</span>
                            <span>{isMr ? worker.role_mr : (worker.role_en || worker.role_mr)}</span>
                          </span>

                          <span
                            style={{
                              fontSize: '10px',
                              background: '#f8fafc',
                              color: '#475569',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              fontWeight: '600',
                            }}
                          >
                            {isMr ? (worker.role_name === 'OFFICER' ? 'अधिकारी' : 'कार्यकर्ता') : worker.role_name}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', marginTop: '5px' }}>
                          {(worker.badges || []).map((b, i) => (
                            <span
                              key={i}
                              style={{
                                fontSize: '10px',
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                fontWeight: '600',
                              }}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Phone / Contact from users.phone */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontWeight: '700', color: '#1e293b' }}>
                          {worker.phone}
                        </div>
                        {worker.email && (
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {worker.email}
                          </div>
                        )}
                      </td>

                      {/* Area */}
                      <td style={{ padding: '14px 14px', color: '#334155' }}>
                        <div style={{ fontWeight: '600' }}>
                          {isMr ? worker.assigned_area_mr : (worker.assigned_area_en || worker.assigned_area_mr)}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {isMr ? 'कव्हरेज दर:' : 'Coverage:'} <strong>{worker.coverage_pct}%</strong>
                        </div>
                      </td>

                      {/* Total Surveys */}
                      <td style={{ padding: '14px 14px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>
                          {worker.total_surveys}
                        </span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{isMr ? 'कुटुंबे' : 'Households'}</div>
                      </td>

                      {/* Today's Surveys */}
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          style={{
                            fontSize: '13px',
                            fontWeight: '700',
                            color: worker.today_surveys > 20 ? '#15803d' : '#ea580c',
                            background: worker.today_surveys > 20 ? '#dcfce7' : '#ffedd5',
                            padding: '3px 8px',
                            borderRadius: '6px',
                          }}
                        >
                          +{worker.today_surveys} {isMr ? 'आज' : 'today'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', alignItems: 'center' }}>
                          {/* Edit Worker Details & Role (User Table Save) */}
                          <button
                            onClick={() => handleOpenEdit(worker)}
                            title={isMr ? 'कार्यकर्त्याचे नाव व भूमिका बदला' : 'Edit Worker Name & Role'}
                            style={{
                              background: '#0284c7',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            ✏️ {isMr ? 'बदला' : 'Edit'}
                          </button>

                          {/* WhatsApp */}
                          <a
                            href={`https://wa.me/91${worker.phone}`}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp"
                            style={{
                              background: '#25d366',
                              color: '#ffffff',
                              padding: '6px 9px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '12px',
                            }}
                          >
                            💬
                          </a>

                          {/* Call */}
                          <a
                            href={`tel:${worker.phone}`}
                            title={isMr ? 'कॉल करा' : 'Call'}
                            style={{
                              background: '#2563eb',
                              color: '#ffffff',
                              padding: '6px 9px',
                              borderRadius: '6px',
                              textDecoration: 'none',
                              fontSize: '12px',
                            }}
                          >
                            📞
                          </a>

                          {/* Assign Task */}
                          <button
                            onClick={() => setSelectedWorkerForTask(worker)}
                            title={isMr ? 'थेट कार्य सोपवा' : 'Assign Direct Task'}
                            style={{
                              background: '#f97316',
                              color: '#ffffff',
                              border: 'none',
                              padding: '6px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '650',
                            }}
                          >
                            ⚡ {isMr ? 'कार्य' : 'Task'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Worker Modal (Saves to Users & User Roles Table) */}
      {editingWorker && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setEditingWorker(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(520px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  ✏️ {isMr ? 'कार्यकर्त्याचे नाव व भूमिका संपादित करा' : 'Edit Worker Name & Role'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {isMr ? 'येथे केलेले सर्व बदल थेट डेटाबेसमध्ये जतन केले जातात.' : 'Changes are saved directly into the database.'}
                </p>
              </div>
              <button
                onClick={() => setEditingWorker(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {editSuccessMsg ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>
                ✓ {editSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveWorkerEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '8px', fontSize: '12px', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                  <span><strong>{isMr ? 'वापरकर्ता आयडी' : 'User ID'}:</strong> #{editingWorker.user_id || editingWorker.id}</span>
                  <span><strong>{isMr ? 'सद्यस्थिती' : 'Status'}:</strong> {isMr ? (editingWorker.status === 'active' ? 'सक्रिय' : 'ऑफलाइन') : (editingWorker.status === 'active' ? 'Active' : 'Offline')}</span>
                </div>

                {/* Worker Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'कार्यकर्त्याचे नाव *' : 'Worker Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    placeholder={isMr ? 'उदा. राहुल प्रभाकर पाटील' : 'e.g. Rahul Prabhakar Patil'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'भूमिका *' : 'Role *'}
                  </label>
                  <select
                    required
                    value={editFormData.role_id}
                    onChange={(e) => setEditFormData({ ...editFormData, role_id: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name === 'WORKER' ? (isMr ? '👷 फील्ड कार्यकर्ता' : '👷 Field Worker') :
                         r.name === 'OFFICER' ? (isMr ? '👔 नेते / अधिकारी' : '👔 Leader / Officer') :
                         (isMr ? (r.display_name || r.name) : r.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'मोबाईल नंबर *' : 'Mobile Phone *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    placeholder={isMr ? 'उदा. ९८२२०११२२१' : 'e.g. 9822011221'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Status & Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'सद्यस्थिती' : 'Status'}
                    </label>
                    <select
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="active">{isMr ? '🟢 सक्रिय' : '🟢 Active'}</option>
                      <option value="offline">{isMr ? '⚪ ऑफलाइन' : '⚪ Offline'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Area'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.assigned_area_mr}
                      onChange={(e) => setEditFormData({ ...editFormData, assigned_area_mr: e.target.value })}
                      placeholder={isMr ? 'उदा. माधवनगर (बूथ १ व २)' : 'e.g. Madhavnagar (Booth 1 & 2)'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditingWorker(null)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      fontWeight: '700',
                      cursor: editSubmitting ? 'wait' : 'pointer',
                    }}
                  >
                    {editSubmitting ? (isMr ? 'जतन करत आहे...' : 'Saving...') : (isMr ? '💾 माहिती जतन करा' : 'Save Changes')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add New Worker Modal (Registers directly into Users & User Roles Table) */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setIsAddModalOpen(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(520px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  ➕ {isMr ? 'नवीन कार्यकर्ता नोंदणी' : 'Add New Worker'}
                </h3>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {isMr ? 'कार्यकर्ता थेट डेटाबेसमध्ये नोंदवला जाईल आणि त्याला भूमिका नेमली जाईल.' : 'Worker will be registered directly into the system.'}
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {addSuccessMsg ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>
                ✓ {addSuccessMsg}
              </div>
            ) : (
              <form onSubmit={handleSaveNewWorker} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'कार्यकर्त्याचे नाव *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newWorkerData.name}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, name: e.target.value })}
                    placeholder={isMr ? 'उदा. राहुल प्रभाकर पाटील' : 'e.g. Rahul Prabhakar Patil'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Role */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'भूमिका *' : 'Role *'}
                  </label>
                  <select
                    required
                    value={newWorkerData.role_id}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, role_id: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      background: '#ffffff',
                    }}
                  >
                    {rolesList.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name === 'WORKER' ? (isMr ? '👷 फील्ड कार्यकर्ता' : '👷 Field Worker') :
                         r.name === 'OFFICER' ? (isMr ? '👔 नेते / अधिकारी' : '👔 Leader / Officer') :
                         (isMr ? (r.display_name || r.name) : r.name)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'मोबाईल नंबर *' : 'Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={newWorkerData.phone}
                    onChange={(e) => setNewWorkerData({ ...newWorkerData, phone: e.target.value })}
                    placeholder={isMr ? 'उदा. ९८२२०११२२१' : 'e.g. 9822011221'}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                    }}
                  />
                </div>

                {/* Status & Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'सद्यस्थिती' : 'Status'}
                    </label>
                    <select
                      value={newWorkerData.status}
                      onChange={(e) => setNewWorkerData({ ...newWorkerData, status: e.target.value })}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        background: '#ffffff',
                      }}
                    >
                      <option value="active">{isMr ? '🟢 सक्रिय' : '🟢 Active'}</option>
                      <option value="offline">{isMr ? '⚪ ऑफलाइन' : '⚪ Offline'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                      {isMr ? 'नेमलेले कार्यक्षेत्र' : 'Assigned Area'}
                    </label>
                    <input
                      type="text"
                      value={newWorkerData.assigned_area_mr}
                      onChange={(e) => setNewWorkerData({ ...newWorkerData, assigned_area_mr: e.target.value })}
                      placeholder={isMr ? 'उदा. माधवनगर (बूथ १ व २)' : 'e.g. Madhavnagar (Booth 1 & 2)'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    style={{
                      padding: '9px 16px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={addSubmitting}
                    style={{
                      padding: '9px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      fontWeight: '700',
                      cursor: addSubmitting ? 'wait' : 'pointer',
                    }}
                  >
                    {addSubmitting ? (isMr ? 'नोंदणी करत आहे...' : 'Registering...') : (isMr ? '➕ कार्यकर्ता नोंदवा' : 'Add Worker')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Direct Task Dispatch Modal */}
      {selectedWorkerForTask && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setSelectedWorkerForTask(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(500px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                ⚡ {isMr ? 'कार्यकर्त्याला थेट कार्य सोपवा' : 'Assign Direct Task to Worker'}
              </h3>
              <button
                onClick={() => setSelectedWorkerForTask(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {taskSubmittedToast ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: '700' }}>
                ✓ {isMr ? 'कार्यकर्त्याला कार्य यशस्वीरित्या पाठवले गेले!' : 'Task assigned and dispatched successfully!'}
              </div>
            ) : (
              <form onSubmit={handleAssignTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>{isMr ? 'कार्यकर्ता:' : 'Worker:'}</strong> {selectedWorkerForTask.name} (
                  {isMr ? selectedWorkerForTask.assigned_area_mr : (selectedWorkerForTask.assigned_area_en || selectedWorkerForTask.assigned_area_mr)})
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                    {isMr ? 'कार्याचे नाव व सूचना *' : 'Task Description *'}
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      isMr
                        ? 'उदा. बूथ क्र. ५ मधील प्रलंबित २० कुटुंबांशी आज संध्याकाळपर्यंत संपर्क साधा व समस्या नोंदवा...'
                        : 'Enter task instructions...'
                    }
                    value={taskNote}
                    onChange={(e) => setTaskNote(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontFamily: 'inherit',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setSelectedWorkerForTask(null)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#475569',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={taskSubmitting}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#1e3a8a',
                      color: '#ffffff',
                      fontWeight: '700',
                      cursor: taskSubmitting ? 'wait' : 'pointer',
                    }}
                  >
                    {taskSubmitting ? (isMr ? 'पाठवत आहे...' : 'Sending...') : (isMr ? 'कार्य पाठवा' : 'Dispatch Task')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
