import React, { useState, useEffect } from 'react';
import apiClient from '../../api/axios';

export default function DuplicateDetectionWorkbench({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [flags, setFlags] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionBusyId, setActionBusyId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;

      const res = await apiClient.get('/admin/duplicates', { params });
      if (res.data.success) {
        setFlags(res.data.data);
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to load duplicate flags:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, [statusFilter]);

  const handleRunScan = async () => {
    setScanning(true);
    try {
      const res = await apiClient.post('/admin/duplicates/scan');
      if (res.data.success) {
        showToast(res.data.message || (isMr ? 'ड्युप्लिकेट तपासणी पूर्ण झाली!' : 'Duplicate scan complete!'));
        fetchFlags();
      }
    } catch (err) {
      console.error('Scan error:', err);
      alert(isMr ? 'तपासणी करताना त्रुटी आली.' : 'Failed to run duplicate scan.');
    } finally {
      setScanning(false);
    }
  };

  const handleResolve = async (id, action) => {
    setActionBusyId(id);
    try {
      const res = await apiClient.post(`/admin/duplicates/${id}/resolve`, { action });
      if (res.data.success) {
        showToast(res.data.message || (isMr ? 'कारवाई पूर्ण झाली!' : 'Resolution saved!'));
        fetchFlags();
      }
    } catch (err) {
      console.error('Resolve error:', err);
      alert(isMr ? 'कारवाई करताना त्रुटी आली.' : 'Failed to resolve duplicate.');
    } finally {
      setActionBusyId(null);
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'RESOLVED_MERGED') {
      return (
        <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
          ✓ {isMr ? 'एकत्र केलेले' : 'Merged'}
        </span>
      );
    }
    if (status === 'DISMISSED_VALID') {
      return (
        <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
          ✓ {isMr ? 'वैध नोंद' : 'Valid'}
        </span>
      );
    }
    return (
      <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
        ⚠️ {isMr ? 'ड्युप्लिकेट आढळले' : 'Conflict Detected'}
      </span>
    );
  };

  const getDetectionTypeBadge = (type) => {
    if (type === 'VOTER_ID_DUPLICATE') {
      return (
        <span style={{ background: '#fef2f2', color: '#dc2626', fontWeight: '800', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
          🪪 {isMr ? 'मतदार ओळखपत्र डुप्लिकेशन' : 'Voter ID Duplicate'}
        </span>
      );
    }
    if (type === 'PHONE_DUPLICATE') {
      return (
        <span style={{ background: '#fffbeb', color: '#b45309', fontWeight: '800', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
          📞 {isMr ? 'फोन नंबर डुप्लिकेशन' : 'Phone Duplicate'}
        </span>
      );
    }
    return (
      <span style={{ background: '#eff6ff', color: '#1d4ed8', fontWeight: '800', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
        👤 {isMr ? 'नावातील साम्य' : 'Name Similarity'}
      </span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 3D Animations & Tactile Stylesheet */}
      <style>{`
        /* 3D Active Filter Tab (Royal Blue matching Sidebar) */
        .dup-tab-3d-active {
          background: linear-gradient(180deg, #2b74f0 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 3.5px solid #0f3a88 !important;
          box-shadow: 0 4px 14px rgba(23, 84, 190, 0.45), 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.6) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 9px !important;
          transform-style: preserve-3d;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 800 !important;
        }
        .dup-tab-3d-active:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 20px rgba(23, 84, 190, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.8) !important;
        }
        .dup-tab-3d-active:active {
          transform: translateY(2px) scale(0.98) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
          box-shadow: 0 2px 6px rgba(23, 84, 190, 0.35) !important;
        }

        /* 3D Inactive Filter Tab */
        .dup-tab-3d-inactive {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 3px solid #94a3b8 !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff !important;
          border-radius: 9px !important;
          transform-style: preserve-3d;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 750 !important;
        }
        .dup-tab-3d-inactive:hover {
          transform: translateY(-2px) !important;
          color: #1e60d5 !important;
          border-color: #93c5fd !important;
          border-bottom-color: #3b82f6 !important;
          box-shadow: 0 6px 14px rgba(30, 96, 213, 0.18), inset 0 1px 1px #ffffff !important;
        }
        .dup-tab-3d-inactive:active {
          transform: translateY(1.5px) !important;
          border-bottom: 1.5px solid #94a3b8 !important;
        }

        /* 3D Scan Button (Punchy Royal Blue Action) */
        .dup-btn-3d-scan {
          background: linear-gradient(180deg, #2563eb 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 3.5px solid #0f3a88 !important;
          box-shadow: 0 4px 16px rgba(23, 84, 190, 0.42), 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.5) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 9px !important;
          transform-style: preserve-3d;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 800 !important;
        }
        .dup-btn-3d-scan:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 24px rgba(23, 84, 190, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .dup-btn-3d-scan:active:not(:disabled) {
          transform: translateY(2px) scale(0.98) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
          box-shadow: 0 2px 6px rgba(23, 84, 190, 0.3) !important;
        }

        /* 3D Action Secondary (Dismiss/Valid Button) */
        .dup-btn-3d-secondary {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #475569 !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 2.5px solid #94a3b8 !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff !important;
          border-radius: 7px !important;
          transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 750 !important;
        }
        .dup-btn-3d-secondary:hover:not(:disabled) {
          transform: translateY(-1.5px) !important;
          color: #1e293b !important;
          border-color: #94a3b8 !important;
          border-bottom-color: #64748b !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
        }
        .dup-btn-3d-secondary:active:not(:disabled) {
          transform: translateY(1.5px) !important;
          border-bottom: 1px solid #94a3b8 !important;
        }

        /* 3D Action Merge Button */
        .dup-btn-3d-merge {
          background: linear-gradient(180deg, #2563eb 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.6) !important;
          border-bottom: 3px solid #0f3a88 !important;
          box-shadow: 0 3px 10px rgba(23, 84, 190, 0.35), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.5) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 7px !important;
          transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 800 !important;
        }
        .dup-btn-3d-merge:hover:not(:disabled) {
          transform: translateY(-1.5px) !important;
          box-shadow: 0 6px 16px rgba(23, 84, 190, 0.5), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .dup-btn-3d-merge:active:not(:disabled) {
          transform: translateY(1.5px) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
          box-shadow: 0 2px 4px rgba(23, 84, 190, 0.25) !important;
        }

        /* 3D Card Hover Lift */
        .dup-kpi-card-3d {
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .dup-kpi-card-3d:hover {
          transform: translateY(-2.5px) !important;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08) !important;
        }
      `}</style>

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

      {/* KPI Cards with 3D Hover Depth */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px' }}>
        <div className="dup-kpi-card-3d" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3.5px solid #ef4444', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '750' }}>{isMr ? 'एकूण संशयास्पद नोंदी' : 'Detected Conflicts'}</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#dc2626', marginTop: '4px' }}>{stats?.total_detected ?? '-'}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'तात्काळ कारवाई आवश्यक' : 'Requires review'}</div>
        </div>

        <div className="dup-kpi-card-3d" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3.5px solid #f97316', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '750' }}>{isMr ? 'ओळखपत्र डुप्लिकेट्स' : 'Voter ID Overlaps'}</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#c2410c', marginTop: '4px' }}>{stats?.voter_id_duplicates ?? '-'}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'वेगवेगळ्या बुथांवर आढळले' : 'Cross-booth clashes'}</div>
        </div>

        <div className="dup-kpi-card-3d" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3.5px solid #f59e0b', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '750' }}>{isMr ? 'फोन नंबर डुप्लिकेट्स' : 'Phone Duplicates'}</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>{stats?.phone_duplicates ?? '-'}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'एकाच नंबरवर अनेक मतदार' : 'Repeated mobile numbers'}</div>
        </div>

        <div className="dup-kpi-card-3d" style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3.5px solid #10b981', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '750' }}>{isMr ? 'एकत्रित व सोडवलेल्या' : 'Resolved & Merged'}</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#059669', marginTop: '4px' }}>{stats?.resolved ?? '-'}</div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'डेटाबेस शुद्धीकरण पूर्ण' : 'Cleaned records'}</div>
        </div>
      </div>

      {/* Filter Tabs & Scan Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label_mr: 'सर्व नोंदी', label_en: 'All Records' },
            { key: 'DETECTED', label_mr: '⚠️ प्रलंबित', label_en: '⚠️ Pending Action' },
            { key: 'RESOLVED_MERGED', label_mr: '✓ एकत्र केलेले', label_en: '✓ Merged' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={statusFilter === tab.key ? 'dup-tab-3d-active' : 'dup-tab-3d-inactive'}
              style={{
                padding: '8px 18px',
                fontSize: '12.5px',
              }}
            >
              {isMr ? tab.label_mr : tab.label_en}
            </button>
          ))}
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="dup-btn-3d-scan"
          style={{
            padding: '9px 20px',
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>{scanning ? '⏳' : '⚡'}</span>
          {scanning
            ? isMr
              ? 'स्कॅनिंग चालू आहे...'
              : 'Scanning entire DB...'
            : isMr
            ? 'संपूर्ण मतदारसंघ डुप्लिकेट स्कॅन सुरू करा'
            : 'Run Duplicate Detection Scan'}
        </button>
      </div>

      {/* Duplicate Cards / List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', color: '#64748b' }}>
            ⏳ {isMr ? 'ड्युप्लिकेट तपासणी नोंदी लोड होत आहेत...' : 'Loading duplicate logs...'}
          </div>
        ) : flags.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px', color: '#94a3b8' }}>
            {isMr ? 'कोणतेही ड्युप्लिकेट रेकॉर्ड्स आढळले नाहीत. डेटाबेस १००% स्वच्छ आहे.' : 'No duplicates found. Database is clean.'}
          </div>
        ) : (
          flags.map((flag) => (
            <div
              key={flag.id}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                padding: '20px 22px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    {getDetectionTypeBadge(flag.detection_type)}
                    <span style={{ fontSize: '12px', fontFamily: 'monospace', fontWeight: '800', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                      {flag.identifier_value}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {isMr ? 'साम्य प्रमाण:' : 'Match Score:'} <strong>{flag.similarity_score}%</strong>
                    </span>
                  </div>

                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {flag.record_title_mr}
                  </h3>

                  <div style={{ fontSize: '12px', color: '#dc2626', fontWeight: '600', marginTop: '4px' }}>
                    {isMr ? '📍 संघर्षित क्षेत्र:' : '📍 Conflicting Area:'} {flag.booth_conflict_mr}
                  </div>
                </div>

                <div>{getStatusBadge(flag.status)}</div>
              </div>

              {flag.notes_mr && (
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', color: '#475569' }}>
                  ℹ️ {flag.notes_mr}
                </div>
              )}

              {flag.status === 'DETECTED' && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', flexWrap: 'wrap' }}>
                  <button
                    disabled={actionBusyId === flag.id}
                    onClick={() => handleResolve(flag.id, 'DISMISS')}
                    className="dup-btn-3d-secondary"
                    style={{
                      padding: '7px 16px',
                      fontSize: '12px',
                    }}
                  >
                    {isMr ? 'वैध नोंद म्हणून ठेवा' : 'Mark Valid (Dismiss)'}
                  </button>

                  <button
                    disabled={actionBusyId === flag.id}
                    onClick={() => handleResolve(flag.id, 'MERGE')}
                    className="dup-btn-3d-merge"
                    style={{
                      padding: '7px 20px',
                      fontSize: '12px',
                    }}
                  >
                    {actionBusyId === flag.id
                      ? isMr
                        ? 'प्रक्रिया सुरू आहे...'
                        : 'Processing...'
                      : isMr
                      ? '✓ नोंदी एकत्र करा'
                      : '✓ Merge Records'}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
