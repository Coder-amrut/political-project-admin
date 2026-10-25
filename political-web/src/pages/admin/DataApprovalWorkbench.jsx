import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';

export default function DataApprovalWorkbench({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [submissions, setSubmissions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL'); // 'all', 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
  const [boothFilter, setBoothFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Selected Submission for Review / Edit
  const [selectedSub, setSelectedSub] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    citizen_name_mr: '',
    voter_id_number: '',
    phone: '',
    booth_no: '',
    village_mr: '',
    correction_notes: '',
  });

  const [actionBusy, setActionBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [approvalSuccessModal, setApprovalSuccessModal] = useState(null);

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (boothFilter !== 'all') params.booth_no = boothFilter;
      if (search.trim()) params.search = search.trim();

      const res = await apiClient.get('/admin/submissions', { params });
      if (res.data.success) {
        setSubmissions(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load field submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, boothFilter, search]);

  const handleApprove = async (id) => {
    setActionBusy(true);
    try {
      const res = await apiClient.post(`/admin/submissions/${id}/approve`);
      if (res.data.success) {
        const approvedItem = res.data.data || selectedSub || submissions.find((s) => s.id === id);
        setApprovalSuccessModal({
          submission: approvedItem,
          message: res.data.message || (isMr ? 'नोंद यशस्वीरित्या मंजूर केली व डेटाबेसमध्ये सिंक केली!' : 'Submission approved successfully!'),
          citizenSynced: res.data.citizen_synced,
        });
        showToast(isMr ? '✓ नोंद यशस्वीरित्या मंजूर केली!' : '✓ Submission approved successfully!');
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Approve error:', err);
      const serverMsg = err.response?.data?.message || (isMr ? 'मंजूर करताना त्रुटी आली.' : 'Failed to approve submission.');
      alert(serverMsg);
    } finally {
      setActionBusy(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setActionBusy(true);
    try {
      const res = await apiClient.post(`/admin/submissions/${selectedSub.id}/reject`, {
        rejection_reason: rejectionReason.trim(),
      });
      if (res.data.success) {
        showToast(isMr ? 'नोंद दुरुस्तीसाठी नामंजूर केली.' : 'Submission rejected.');
        setShowRejectModal(false);
        setRejectionReason('');
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Reject error:', err);
      alert(isMr ? 'नामंजूर करताना त्रुटी आली.' : 'Failed to reject.');
    } finally {
      setActionBusy(false);
    }
  };

  const handleSaveCorrection = async (e) => {
    e.preventDefault();
    setActionBusy(true);
    try {
      const res = await apiClient.post(`/admin/submissions/${selectedSub.id}/correct`, editFormData);
      if (res.data.success) {
        showToast(isMr ? 'डेटा दुरुस्त करून अद्ययावत केला!' : 'Data corrected successfully!');
        setIsEditing(false);
        setSelectedSub(null);
        fetchSubmissions();
      }
    } catch (err) {
      console.error('Correction save error:', err);
      alert(isMr ? 'दुरुस्ती करताना त्रुटी आली.' : 'Failed to save correction.');
    } finally {
      setActionBusy(false);
    }
  };

  const openReview = (sub) => {
    setSelectedSub(sub);
    setIsEditing(false);
    setEditFormData({
      citizen_name_mr: sub.citizen_name_mr,
      voter_id_number: sub.voter_id_number || '',
      phone: sub.phone || '',
      booth_no: sub.booth_no,
      village_mr: sub.village_mr,
      correction_notes: sub.correction_notes || '',
    });
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
          ✓ {isMr ? 'मंजूर' : 'Approved'}
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
          ✕ {isMr ? 'दुरुस्ती आवश्यक' : 'Rejected'}
        </span>
      );
    }
    if (status === 'CORRECTED') {
      return (
        <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
          ✏️ {isMr ? 'दुरुस्त केले' : 'Corrected'}
        </span>
      );
    }
    return (
      <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
        ⏳ {isMr ? 'मंजुरी प्रलंबित' : 'Pending'}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: '#10b981',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 9999,
          }}
        >
          ✓ {toastMsg}
        </div>
      )}



      {/* 3D Animation & Royal Blue Theme Stylesheet Matching Sidebar */}
      <style>{`
        .tab-3d-active {
          background: linear-gradient(180deg, #2b74f0 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 3.5px solid #0f3a88 !important;
          box-shadow: 0 4px 14px rgba(23, 84, 190, 0.45), 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 10px !important;
          transform-style: preserve-3d;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
        }
        .tab-3d-active:hover {
          transform: translateY(-2.5px) scale(1.02) !important;
          box-shadow: 0 8px 22px rgba(23, 84, 190, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.85) !important;
        }
        .tab-3d-active:active {
          transform: translateY(2px) scale(0.98) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
          box-shadow: 0 2px 6px rgba(23, 84, 190, 0.35) !important;
        }

        .tab-3d-inactive {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 3px solid #94a3b8 !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff !important;
          border-radius: 10px !important;
          transform-style: preserve-3d;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
        }
        .tab-3d-inactive:hover {
          transform: translateY(-2px) !important;
          color: #1e60d5 !important;
          border-color: #93c5fd !important;
          border-bottom-color: #3b82f6 !important;
          box-shadow: 0 6px 16px rgba(30, 96, 213, 0.18), inset 0 1px 1px #ffffff !important;
        }
        .tab-3d-inactive:active {
          transform: translateY(1.5px) !important;
          border-bottom: 1.5px solid #94a3b8 !important;
        }

        .btn-3d-royal {
          background: linear-gradient(180deg, #2b74f0 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.65) !important;
          border-bottom: 3px solid #0f3a88 !important;
          box-shadow: 0 4px 12px rgba(23, 84, 190, 0.35), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.5) !important;
          border-radius: 8px !important;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
        }
        .btn-3d-royal:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 7px 18px rgba(23, 84, 190, 0.52), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .btn-3d-royal:active {
          transform: translateY(1.5px) scale(0.98) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
        }

        .btn-3d-green {
          background: linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.65) !important;
          border-bottom: 3.5px solid #045230 !important;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.38), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.5) !important;
          border-radius: 8px !important;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
        }
        .btn-3d-green:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .btn-3d-green:active:not(:disabled) {
          transform: translateY(1.5px) scale(0.98) !important;
          border-bottom: 1.5px solid #045230 !important;
        }

        .btn-3d-red {
          background: linear-gradient(180deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.65) !important;
          border-bottom: 3.5px solid #7f1d1d !important;
          box-shadow: 0 4px 14px rgba(220, 38, 38, 0.38), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.5) !important;
          border-radius: 8px !important;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
        }
        .btn-3d-red:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 20px rgba(220, 38, 38, 0.55), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .btn-3d-red:active {
          transform: translateY(1.5px) scale(0.98) !important;
          border-bottom: 1.5px solid #7f1d1d !important;
        }
      `}</style>

      {/* Filters Bar with Royal Blue Symmetry */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 22px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 4px 18px rgba(23, 84, 190, 0.05)',
          display: 'flex',
          gap: '14px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <div style={{ flex: '1 1 260px' }}>
          <input
            type="text"
            placeholder={isMr ? '🔍 नाव, मतदार ओळखपत्र, फोन किंवा कार्यकर्त्याचे नाव...' : 'Search submissions...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '9px',
              border: '1.5px solid #cbd5e1',
              fontSize: '13px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'all 0.15s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1e60d5';
              e.target.style.boxShadow = '0 0 0 3px rgba(30, 96, 213, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* 3D Animated Tabs Matching Sidebar Royal Blue */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {[
            { key: 'PENDING_APPROVAL', label_mr: 'मंजुरी प्रलंबित', label_en: 'Pending Review' },
            { key: 'APPROVED', label_mr: 'मंजूर झालेले', label_en: 'Approved' },
            { key: 'REJECTED', label_mr: 'नामंजूर', label_en: 'Rejected' },
            { key: 'all', label_mr: 'सर्व नोंदी', label_en: 'All Submissions' },
          ].map((st) => {
            const isActive = statusFilter === st.key;
            return (
              <button
                key={st.key}
                type="button"
                className={isActive ? 'tab-3d-active' : 'tab-3d-inactive'}
                onClick={() => setStatusFilter(st.key)}
                style={{
                  padding: '9px 18px',
                  fontSize: '12.5px',
                  fontWeight: '800',
                  userSelect: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>{isMr ? st.label_mr : st.label_en}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submissions Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            ⏳ {isMr ? 'फील्ड डेटा नोंदी लोड होत आहेत...' : 'Loading submissions...'}
          </div>
        ) : submissions.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            {isMr ? 'कोणत्याही नोंदी उपलब्ध नाहीत.' : 'No submissions found matching criteria.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'कोड व नागरिक' : 'Code & Citizen'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'मतदार ओळखपत्र / फोन' : 'Voter ID / Phone'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'बूथ व परिसर' : 'Booth & Area'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'सादरकर्ता कार्यकर्ता' : 'Submitted By'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'सद्यस्थिती' : 'Status'}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>{isMr ? 'कृती' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: '700', color: '#2563eb' }}>
                        {sub.submission_code}
                      </span>
                      <div style={{ fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>{sub.citizen_name_mr}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{sub.form_title_mr}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{sub.voter_id_number || (isMr ? 'उपलब्ध नाही' : 'N/A')}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>📞 {sub.phone || '-'}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#1e293b' }}>{sub.booth_no}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{sub.village_mr}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '600', color: '#334155' }}>👤 {sub.submitted_by_name}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>
                        {new Date(sub.created_at).toLocaleDateString(isMr ? 'mr-IN' : 'en-IN')}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>{getStatusBadge(sub.status)}</td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        className={sub.status === 'PENDING_APPROVAL' ? 'btn-3d-royal' : 'tab-3d-inactive'}
                        onClick={() => openReview(sub)}
                        style={{
                          padding: '7px 16px',
                          fontSize: '12px',
                          fontWeight: '800',
                          userSelect: 'none'
                        }}
                      >
                        {sub.status === 'PENDING_APPROVAL' ? (isMr ? 'तपासा व मंजूर करा' : 'Review & Approve') : (isMr ? 'तपशील पहा / दुरुस्ती' : 'View / Edit')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REVIEW & APPROVAL DRAWER / MODAL */}
      {selectedSub && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setSelectedSub(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(680px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              padding: '24px 20px',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '800', background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '4px' }}>
                    {selectedSub.submission_code}
                  </span>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                    {selectedSub.citizen_name_mr}
                  </h3>
                  {getStatusBadge(selectedSub.status)}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  {isMr ? 'सादरकर्ता:' : 'Submitted by:'} {selectedSub.submitted_by_name} • {selectedSub.booth_no} ({selectedSub.village_mr})
                </div>
              </div>

              <button onClick={() => setSelectedSub(null)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            {/* If In Edit Mode */}
            {isEditing ? (
              <form onSubmit={handleSaveCorrection} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: '800', color: '#1d4ed8' }}>
                  {isMr ? '✏️ डेटा दुरुस्ती फॉर्म' : '✏️ Data Correction Workbench'}
                </h4>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    {isMr ? 'नागरिकाचे पूर्ण नाव' : "Citizen's Full Name"}
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.citizen_name_mr}
                    onChange={(e) => setEditFormData({ ...editFormData, citizen_name_mr: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {isMr ? 'मतदार ओळखपत्र क्रमांक' : 'Voter ID (EPIC) Number'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.voter_id_number}
                      onChange={(e) => setEditFormData({ ...editFormData, voter_id_number: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {isMr ? 'मोबाईल नंबर' : 'Mobile Number'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {isMr ? 'बूथ क्रमांक' : 'Booth Number'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.booth_no}
                      onChange={(e) => setEditFormData({ ...editFormData, booth_no: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {isMr ? 'गाव / प्रभाग' : 'Village / Ward'}
                    </label>
                    <input
                      type="text"
                      value={editFormData.village_mr}
                      onChange={(e) => setEditFormData({ ...editFormData, village_mr: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                    {isMr ? 'दुरुस्ती टिपणी' : 'Correction Remarks'}
                  </label>
                  <textarea
                    rows={2}
                    placeholder={isMr ? 'दुरुस्तीचे कारण किंवा टिपणी प्रविष्ट करा...' : 'Enter reason for change or remarks...'}
                    value={editFormData.correction_notes}
                    onChange={(e) => setEditFormData({ ...editFormData, correction_notes: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer' }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={actionBusy}
                    style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: '700', cursor: 'pointer' }}
                  >
                    {actionBusy ? (isMr ? 'जतन होत आहे...' : 'Saving...') : (isMr ? '✓ दुरुस्ती सेव्ह करा' : '✓ Save Changes')}
                  </button>
                </div>
              </form>
            ) : (
              /* View / Review Mode */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      {isMr ? 'मतदार ओळखपत्र' : 'Voter ID (EPIC)'}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                      {selectedSub.voter_id_number || (isMr ? 'नाही' : 'None')}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      {isMr ? 'मोबाईल नंबर' : 'Mobile Number'}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                      {selectedSub.phone || (isMr ? 'नाही' : 'None')}
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>
                      {isMr ? 'बूथ व परिसर' : 'Booth & Area'}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a', marginTop: '2px' }}>
                      {selectedSub.booth_no} • {selectedSub.village_mr}
                    </div>
                  </div>
                </div>

                {/* Questionnaire responses */}
                {selectedSub.submission_data && (
                  <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '800', color: '#334155' }}>
                      {isMr ? '📋 सर्व्हे प्रश्नावली प्रतिसाद' : '📋 Submitted Survey Responses'}
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                      <div>
                        <strong>{isMr ? 'वय व व्यवसाय:' : 'Age & Occupation:'}</strong> {selectedSub.submission_data.age || '-'} {isMr ? 'वर्षे' : 'years'}, {selectedSub.submission_data.occupation || '-'}
                      </div>
                      <div>
                        <strong>{isMr ? 'घरातील मतदार संख्या:' : 'Family Voters Count:'}</strong> {selectedSub.submission_data.family_voters_count || '-'} {isMr ? 'मतदार' : 'voters'}
                      </div>
                      <div>
                        <strong>{isMr ? 'राजकीय कल:' : 'Political Sentiment:'}</strong> {selectedSub.submission_data.sentiment || '-'}
                      </div>
                      <div>
                        <strong>{isMr ? 'शासकीय योजना:' : 'Govt Schemes:'}</strong> {selectedSub.submission_data.schemes_benefitted?.join(', ') || (isMr ? 'कोणतीही नाही' : 'None')}
                      </div>
                      <div>
                        <strong>{isMr ? 'प्रमुख नागरी समस्या / मागणी:' : 'Major Civic Issue / Demand:'}</strong>{' '}
                        <span style={{ color: '#dc2626', fontWeight: '600' }}>
                          {selectedSub.submission_data.main_issue || (isMr ? 'नोंद नाही' : 'None reported')}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedSub.rejection_reason && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '12px', borderRadius: '8px', color: '#991b1b', fontSize: '12px' }}>
                    <strong>{isMr ? 'नामंजुरीचे कारण:' : 'Rejection Reason:'}</strong> {selectedSub.rejection_reason}
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '10px' }}>
                  <button
                    type="button"
                    className="tab-3d-inactive"
                    onClick={() => setIsEditing(true)}
                    style={{ padding: '8px 18px', fontSize: '12.5px', fontWeight: '800' }}
                  >
                    {isMr ? '✏️ माहिती दुरुस्त करा' : '✏️ Edit & Correct'}
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      className="btn-3d-red"
                      onClick={() => setShowRejectModal(true)}
                      style={{ padding: '8px 18px', fontSize: '12.5px', fontWeight: '800' }}
                    >
                      {isMr ? '✕ नामंजूर करा' : '✕ Reject'}
                    </button>

                    <button
                      type="button"
                      className="btn-3d-green"
                      disabled={actionBusy}
                      onClick={() => handleApprove(selectedSub.id)}
                      style={{ padding: '8px 22px', fontSize: '12.5px', fontWeight: '800' }}
                    >
                      {actionBusy ? (isMr ? 'मंजूर होत आहे...' : 'Approving...') : (isMr ? '✓ मंजूर करा व सिंक करा' : '✓ Approve & Sync')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REJECTION REASON MODAL */}
      {showRejectModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1100,
            padding: '20px',
          }}
          onClick={() => setShowRejectModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '22px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '800', color: '#b91c1c' }}>
              {isMr ? '✕ सर्व्हे नोंद नामंजूर करा' : '✕ Reject Survey Submission'}
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
              {isMr
                ? 'कार्यकर्त्याला ही नोंद का नाकारली याचे स्पष्ट कारण द्या, जेणेकरून ते दुरुस्त करून पुन्हा पाठवू शकतील.'
                : 'Provide a clear rejection reason so the field worker can correct and resubmit.'}
            </p>

            <form onSubmit={handleReject}>
              <textarea
                required
                rows={3}
                placeholder={isMr ? 'उदा. मतदार ओळखपत्र चुकीचे आहे किंवा पत्ता अपूर्ण आहे...' : 'E.g., Invalid Voter ID or incomplete address...'}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  className="tab-3d-inactive"
                  onClick={() => setShowRejectModal(false)}
                  style={{ padding: '8px 16px', fontSize: '12.5px', fontWeight: '800' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-3d-red"
                  disabled={actionBusy}
                  style={{ padding: '8px 20px', fontSize: '12.5px', fontWeight: '800' }}
                >
                  {actionBusy ? (isMr ? 'नोंद होत आहे...' : 'Processing...') : (isMr ? 'नामंजूर करा' : 'Confirm Rejection')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* APPROVAL SUCCESS POPUP MODAL */}
      {approvalSuccessModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1200,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setApprovalSuccessModal(null)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated / styled Success Icon */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                border: '3px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#15803d',
              }}
            >
              ✓
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
                {isMr ? 'नोंद यशस्वीरित्या मंजूर केली!' : 'Submission Approved Successfully!'}
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.45 }}>
                {isMr
                  ? 'सदर सर्व्हे नोंद डेटाबेसमध्ये अधिकृतपणे "APPROVED" म्हणून नोंदवली गेली असून मास्टर मतदार यादीत समक्रमित करण्यात आली आहे.'
                  : 'This record has been officially marked as "APPROVED" in the database and synced to the master citizen database.'}
              </p>
            </div>

            {/* Details Box */}
            <div
              style={{
                width: '100%',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '12.5px',
                textAlign: 'left',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>{isMr ? 'नोंद कोड:' : 'Submission Code:'}</span>
                <span style={{ fontFamily: 'monospace', fontWeight: '800', color: '#1d4ed8' }}>
                  {approvalSuccessModal.submission?.submission_code}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>{isMr ? 'नागरिकाचे नाव:' : 'Citizen Name:'}</span>
                <span style={{ fontWeight: '750', color: '#0f172a' }}>
                  {approvalSuccessModal.submission?.citizen_name_mr}
                </span>
              </div>

              {approvalSuccessModal.submission?.voter_id_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b', fontWeight: '600' }}>{isMr ? 'मतदार ओळखपत्र (EPIC):' : 'Voter ID (EPIC):'}</span>
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>
                    {approvalSuccessModal.submission?.voter_id_number}
                  </span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>{isMr ? 'बूथ व परिसर:' : 'Booth & Area:'}</span>
                <span style={{ color: '#334155' }}>
                  {approvalSuccessModal.submission?.booth_no} • {approvalSuccessModal.submission?.village_mr}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>{isMr ? 'डेटाबेस स्थिती:' : 'Database Status:'}</span>
                <span style={{ color: '#16a34a', fontWeight: '800' }}>
                  ✓ APPROVED ({isMr ? 'डेटाबेसमध्ये अद्ययावत' : 'Updated in DB'})
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b', fontWeight: '600' }}>{isMr ? 'मास्टर डेटा सिंक:' : 'Master DB Sync:'}</span>
                <span style={{ color: '#2563eb', fontWeight: '750' }}>
                  ✓ {isMr ? 'नागरिक प्रोफाइल तयार / अद्ययावत' : 'Citizen profile synced'}
                </span>
              </div>
            </div>

            {/* OK Button */}
            <button
              type="button"
              className="btn-3d-green"
              onClick={() => setApprovalSuccessModal(null)}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '14px',
                fontWeight: '800',
              }}
            >
              ✓ {isMr ? 'समजले / ठीक आहे' : 'Done / OK'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
