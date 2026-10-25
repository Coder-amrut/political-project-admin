import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/axios';

export default function BackupRestoreEngine({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [restoringId, setRestoringId] = useState(null);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackupForRestore, setSelectedBackupForRestore] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'auto', 'manual'
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/system/backups');
      if (res.data.success) {
        setBackups(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load backups:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await apiClient.post('/admin/system/backups');
      if (res.data.success) {
        showToast(res.data.message || (isMr ? 'नवीन MySQL बॅकअप स्नॅपशॉट तयार झाला!' : 'New backup snapshot generated!'));
        fetchBackups();
      }
    } catch (err) {
      console.error('Create backup error:', err);
      alert(isMr ? 'बॅकअप तयार करताना त्रुटी आली.' : 'Failed to create backup.');
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleDownloadBackup = (id, filename) => {
    window.open(`http://127.0.0.1:8000/api/admin/system/backups/${id}/download`, '_blank');
  };

  const handleExecuteRestore = async () => {
    if (!selectedBackupForRestore) return;
    setRestoringId(selectedBackupForRestore.id);
    try {
      const res = await apiClient.post('/admin/system/restore', {
        backup_id: selectedBackupForRestore.id,
      });
      if (res.data.success) {
        showToast(res.data.message || (isMr ? 'डेटाबेस पूर्ववत (Restored) यशस्वीरीत्या झाला!' : 'Database restored successfully!'));
        setShowRestoreModal(false);
        setSelectedBackupForRestore(null);
        fetchBackups();
      }
    } catch (err) {
      console.error('Restore error:', err);
      alert(isMr ? 'रिस्टोअर करताना त्रुटी आली.' : 'Failed to restore database.');
    } finally {
      setRestoringId(null);
    }
  };

  // Filtered backups based on active tab and search query
  const filteredBackups = useMemo(() => {
    return backups.filter((b) => {
      const isAuto =
        b.created_by_name?.toLowerCase().includes('system') ||
        b.created_by_name?.toLowerCase().includes('auto');

      if (activeTab === 'auto' && !isAuto) return false;
      if (activeTab === 'manual' && isAuto) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesFile = b.filename?.toLowerCase().includes(q);
        const matchesPath = b.file_path?.toLowerCase().includes(q);
        const matchesCreator = b.created_by_name?.toLowerCase().includes(q);
        const matchesType = b.backup_type?.toLowerCase().includes(q);
        return matchesFile || matchesPath || matchesCreator || matchesType;
      }
      return true;
    });
  }, [backups, activeTab, searchQuery]);

  const autoCount = useMemo(() => {
    return backups.filter(
      (b) =>
        b.created_by_name?.toLowerCase().includes('system') ||
        b.created_by_name?.toLowerCase().includes('auto')
    ).length;
  }, [backups]);

  const manualCount = useMemo(() => {
    return backups.length - autoCount;
  }, [backups, autoCount]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      {/* 3D Interactive CSS Stylesheet matching Dashboard / Sidebar */}
      <style>{`
        /* 3D Primary Button (Royal Blue Dashboard Theme) */
        .br-btn-3d-primary {
          background: linear-gradient(135deg, #1e60d5 0%, #2b74f0 100%);
          color: #ffffff !important;
          border: 1px solid #1a56c4;
          border-bottom: 3.5px solid #124199;
          border-radius: 9px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 10px rgba(30, 96, 213, 0.28), 0 1px 2px rgba(0,0,0,0.06);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .br-btn-3d-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          background: linear-gradient(135deg, #246bf2 0%, #3b82f6 100%);
          box-shadow: 0 6px 14px rgba(30, 96, 213, 0.38), 0 2px 4px rgba(0,0,0,0.08);
        }
        .br-btn-3d-primary:active:not(:disabled) {
          transform: translateY(1.5px);
          border-bottom-width: 1.5px;
          box-shadow: 0 2px 4px rgba(30, 96, 213, 0.22);
        }
        .br-btn-3d-primary:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        /* 3D Secondary Button (Tactile White/Slate) */
        .br-btn-3d-secondary {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
          color: #1e293b !important;
          border: 1px solid #cbd5e1;
          border-bottom: 3px solid #94a3b8;
          border-radius: 8px;
          font-weight: 750;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .br-btn-3d-secondary:hover:not(:disabled) {
          transform: translateY(-1.5px);
          background: #ffffff;
          border-color: #94a3b8;
          border-bottom-color: #64748b;
          color: #1e60d5 !important;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
        .br-btn-3d-secondary:active:not(:disabled) {
          transform: translateY(1px);
          border-bottom-width: 1.5px;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        /* 3D Restore Action Button (High-Impact Amber / Orange) */
        .br-btn-3d-restore {
          background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
          color: #ffffff !important;
          border: 1px solid #c2410c;
          border-bottom: 3.5px solid #9a3412;
          border-radius: 8px;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 3px 8px rgba(234, 88, 12, 0.28);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .br-btn-3d-restore:hover:not(:disabled) {
          transform: translateY(-1.5px);
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
          box-shadow: 0 5px 12px rgba(234, 88, 12, 0.38);
        }
        .br-btn-3d-restore:active:not(:disabled) {
          transform: translateY(1.5px);
          border-bottom-width: 1.5px;
          box-shadow: 0 1px 3px rgba(234, 88, 12, 0.2);
        }
        .br-btn-3d-restore:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        /* 3D Active Navigation Tab */
        .br-tab-3d-active {
          background: linear-gradient(135deg, #1e60d5 0%, #2b74f0 100%) !important;
          color: #ffffff !important;
          border: 1px solid #1a56c4 !important;
          border-bottom: 3.5px solid #124199 !important;
          border-radius: 10px;
          font-weight: 850;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 12px rgba(30, 96, 213, 0.32), inset 0 1px 1px rgba(255, 255, 255, 0.3);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }

        /* 3D Inactive Navigation Tab */
        .br-tab-3d-inactive {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 3px solid #94a3b8 !important;
          border-radius: 10px;
          font-weight: 750;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
          user-select: none;
        }
        .br-tab-3d-inactive:hover {
          transform: translateY(-2px);
          background: #ffffff !important;
          color: #1e60d5 !important;
          border-color: #93c5fd !important;
          border-bottom-color: #3b82f6 !important;
          box-shadow: 0 4px 10px rgba(30, 96, 213, 0.12);
        }
        .br-tab-3d-inactive:active {
          transform: translateY(1px);
          border-bottom-width: 1.5px !important;
        }

        /* 3D Tactile Card Container */
        .br-card-3d {
          background: #ffffff;
          border: 1.5px solid #e2e8f0;
          border-radius: 14px;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .br-card-3d:hover {
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
          border-color: #cbd5e1;
        }

        /* 3D Table Row Hover */
        .br-table-row {
          transition: all 0.15s ease;
        }
        .br-table-row:hover {
          background: #f8fafc;
        }

        @media (max-width: 640px) {
          .br-card-3d {
            padding: 14px 10px !important;
            border-radius: 12px !important;
          }
          .br-header-action-btn {
            width: 100% !important;
            justify-content: center !important;
            min-height: 44px !important;
          }
          .br-filter-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 12px !important;
          }
          .br-filter-tabs {
            display: grid !important;
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            width: 100% !important;
          }
          .br-filter-tabs button {
            justify-content: center !important;
            min-height: 42px !important;
            font-size: 11.5px !important;
            padding: 8px 6px !important;
          }
          .br-search-container {
            width: 100% !important;
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .br-search-container > div {
            width: 100% !important;
          }
          .br-search-container button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 42px !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMsg && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '10px',
            fontWeight: '800',
            fontSize: '14px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.35), 0 2px 4px rgba(0,0,0,0.1)',
            border: '1px solid #34d399',
            borderBottom: '3px solid #047857',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✓</span>
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner with 3D Action */}
      <div
        className="br-card-3d"
        style={{
          padding: '22px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '26px' }}>💾</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '850', color: '#0f172a' }}>
              {isMr ? 'डेटाबेस बॅकअप व रिस्टोअर' : 'Database Backup & Restore'}
            </h2>
            <span
              style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)',
                color: '#1e40af',
                fontSize: '11px',
                fontWeight: '800',
                padding: '4px 10px',
                borderRadius: '999px',
                border: '1px solid #bfdbfe',
                borderBottom: '2px solid #93c5fd',
                boxShadow: '0 1px 3px rgba(30, 64, 175, 0.1)',
              }}
            >
              🛡️ {isMr ? 'आपत्कालीन सज्जता' : 'Disaster Recovery'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
            {isMr
              ? 'निवडणूक प्रकल्पाच्या संपूर्ण डेटाबेसचे सुरक्षित स्नॅपशॉट्स तयार करा, डाउनलोड करा आणि आपत्कालीन स्थितीत रिस्टोअर करा.'
              : 'Generate timestamped SQL dumps, download backups to secure storage, and restore databases on-demand.'}
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          className="br-btn-3d-primary br-header-action-btn"
          style={{
            padding: '12px 22px',
            fontSize: '13.5px',
          }}
        >
          <span style={{ fontSize: '16px' }}>{creatingBackup ? '⏳' : '💾'}</span>
          <span>
            {creatingBackup
              ? isMr
                ? 'बॅकअप तयार होत आहे...'
                : 'Dumping MySQL database...'
              : isMr
              ? 'आताच नवीन डेटाबेस बॅकअप तयार करा'
              : 'Create Backup Snapshot'}
          </span>
        </button>
      </div>


      {/* SECTION TABS & SEARCH BAR (3D Animation) */}
      <div
        className="br-card-3d br-filter-container"
        style={{
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        {/* Filter Navigation Tabs */}
        <div className="br-filter-tabs" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={activeTab === 'all' ? 'br-tab-3d-active' : 'br-tab-3d-inactive'}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
            }}
          >
            <span>📂</span>
            <span>{isMr ? 'सर्व स्नॅपशॉट्स (All)' : 'All Snapshots'}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '999px',
                background: activeTab === 'all' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'all' ? '#ffffff' : '#475569',
                fontWeight: '800',
              }}
            >
              {backups.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={activeTab === 'manual' ? 'br-tab-3d-active' : 'br-tab-3d-inactive'}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
            }}
          >
            <span>👤</span>
            <span>{isMr ? 'मॅन्युअल बॅकअप (Manual)' : 'Manual Backups'}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '999px',
                background: activeTab === 'manual' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'manual' ? '#ffffff' : '#475569',
                fontWeight: '800',
              }}
            >
              {manualCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('auto')}
            className={activeTab === 'auto' ? 'br-tab-3d-active' : 'br-tab-3d-inactive'}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
            }}
          >
            <span>⚙️</span>
            <span>{isMr ? 'ऑटोमॅटिक बॅकअप (Auto)' : 'Auto Backups'}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 7px',
                borderRadius: '999px',
                background: activeTab === 'auto' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                color: activeTab === 'auto' ? '#ffffff' : '#475569',
                fontWeight: '800',
              }}
            >
              {autoCount}
            </span>
          </button>
        </div>

        {/* Search & Refresh Toolbar */}
        <div className="br-search-container" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '260px' }}>
            <span style={{ position: 'absolute', left: 10, top: 10, color: '#94a3b8', fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder={isMr ? 'बॅकअप फाईल किंवा नाव शोधा...' : 'Search backup file...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px 9px 32px',
                borderRadius: '8px',
                border: '1.5px solid #cbd5e1',
                fontSize: '12.5px',
                fontWeight: '600',
                outline: 'none',
                background: '#f8fafc',
              }}
            />
          </div>

          <button
            type="button"
            onClick={fetchBackups}
            disabled={loading}
            className="br-btn-3d-secondary"
            style={{
              padding: '9px 14px',
              fontSize: '12.5px',
            }}
          >
            <span style={{ display: 'inline-block', transform: loading ? 'rotate(180deg)' : 'none', transition: 'transform 0.4s ease' }}>
              🔄
            </span>
            <span>{isMr ? 'रिफ्रेश' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Backups List Table */}
      <div className="br-card-3d" style={{ overflow: 'hidden' }}>
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1.5px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#ffffff',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🗄️</span>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '850', color: '#0f172a' }}>
              {isMr ? 'डेटाबेस स्नॅपशॉट्स व बॅकअप आर्काइव्ह' : 'Database Snapshots Archive'} ({filteredBackups.length})
            </h3>
          </div>
          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
            {isMr ? 'थेट डाउनलोड करा किंवा सुरक्षित रिस्टोअर करा' : 'Download .sql dump or restore'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <div style={{ fontWeight: '750', fontSize: '14px' }}>
              {isMr ? 'बॅकअप नोंदी लोड होत आहेत...' : 'Loading backup archives...'}
            </div>
          </div>
        ) : filteredBackups.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center', color: '#94a3b8' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
            <div style={{ fontWeight: '800', fontSize: '15px', color: '#334155', marginBottom: '6px' }}>
              {isMr ? 'कोणतेही बॅकअप स्नॅपशॉट उपलब्ध नाहीत.' : 'No backups found.'}
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b' }}>
              {isMr
                ? 'वर दिलेल्या "आताच नवीन डेटाबेस बॅकअप तयार करा" बटणावर क्लिक करून तात्काळ स्नॅपशॉट तयार करा.'
                : 'Click "Create Backup Snapshot" button above to generate a new database dump.'}
            </p>
            <button
              type="button"
              onClick={handleCreateBackup}
              disabled={creatingBackup}
              className="br-btn-3d-primary"
              style={{
                padding: '10px 20px',
                fontSize: '13px',
              }}
            >
              <span>💾</span>
              <span>{isMr ? 'नवीन बॅकअप तयार करा' : 'Create Backup Snapshot'}</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  <th style={{ padding: '14px 18px', fontWeight: '800' }}>{isMr ? 'बॅकअप फाईल नाव' : 'File Name'}</th>
                  <th style={{ padding: '14px 18px', fontWeight: '800' }}>{isMr ? 'प्रकार' : 'Type'}</th>
                  <th style={{ padding: '14px 18px', fontWeight: '800' }}>{isMr ? 'फाईल साईझ' : 'Size'}</th>
                  <th style={{ padding: '14px 18px', fontWeight: '800' }}>{isMr ? 'तयार केल्याची तारीख' : 'Created Date'}</th>
                  <th style={{ padding: '14px 18px', fontWeight: '800' }}>{isMr ? 'तयारकर्ता' : 'Creator'}</th>
                  <th style={{ padding: '14px 18px', textAlign: 'right', fontWeight: '800' }}>{isMr ? 'कृती' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredBackups.map((b) => (
                  <tr key={b.id} className="br-table-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: '800', color: '#0f172a', fontFamily: 'monospace', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>📄</span>
                        <span>{b.filename}</span>
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                        {b.file_path}
                      </div>
                    </td>

                    <td style={{ padding: '14px 18px' }}>
                      <span
                        style={{
                          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                          color: '#1d4ed8',
                          border: '1px solid #bfdbfe',
                          borderBottom: '2px solid #93c5fd',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: '800',
                          display: 'inline-block',
                          boxShadow: '0 1px 2px rgba(29, 78, 216, 0.08)',
                        }}
                      >
                        {b.backup_type}
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', fontWeight: '800', color: '#1e293b' }}>
                      {b.file_size_formatted}
                    </td>

                    <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '12.5px', fontWeight: '600' }}>
                      {new Date(b.created_at).toLocaleString(isMr ? 'mr-IN' : 'en-IN')}
                    </td>

                    <td style={{ padding: '14px 18px', color: '#334155', fontWeight: '700' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        <span>👤</span>
                        <span>{b.created_by_name}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDownloadBackup(b.id, b.filename)}
                          className="br-btn-3d-secondary"
                          style={{
                            padding: '6px 12px',
                            fontSize: '12px',
                          }}
                        >
                          <span style={{ color: '#1e60d5' }}>📥</span>
                          <span>{isMr ? 'डाऊनलोड' : 'Download'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBackupForRestore(b);
                            setShowRestoreModal(true);
                          }}
                          className="br-btn-3d-restore"
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                          }}
                        >
                          <span>🔄</span>
                          <span>{isMr ? 'रिस्टोअर' : 'Restore'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESTORE CONFIRMATION MODAL (3D Tactile Design) */}
      {showRestoreModal && selectedBackupForRestore && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 100000,
            padding: '20px',
            backdropFilter: 'blur(4px)',
          }}
          onClick={() => setShowRestoreModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(520px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px 20px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
              border: '1.5px solid #cbd5e1',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c2410c', marginBottom: '14px' }}>
              <span style={{ fontSize: '26px' }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                {isMr ? 'डेटाबेस रिस्टोअरची खात्री करा' : 'Confirm Database Restore'}
              </h3>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#334155', lineHeight: 1.6 }}>
              {isMr ? (
                <>
                  तुम्ही <strong>"{selectedBackupForRestore.filename}"</strong> हा बॅकअप स्नॅपशॉट चालू डेटाबेसवर रिस्टोअर करत आहात. चालू डेटा या स्नॅपशॉटच्या वेळेनुसार पूर्ववत केला जाईल.
                </>
              ) : (
                <>
                  You are restoring backup snapshot <strong>"{selectedBackupForRestore.filename}"</strong> to the active database. Current data will be replaced with this snapshot state.
                </>
              )}
            </p>

            <div
              style={{
                background: '#fffbeb',
                border: '1.5px solid #fde68a',
                borderLeft: '4px solid #f59e0b',
                borderRadius: '9px',
                padding: '12px 14px',
                fontSize: '12.5px',
                color: '#92400e',
                marginBottom: '20px',
                fontWeight: '600',
                lineHeight: 1.5,
              }}
            >
              {isMr
                ? '🔒 सुरक्षिततेसाठी ही कृती अ‍ॅडमिन ऑडिट ट्रेल (Audit Log) मध्ये कायमस्वरूपी सुरक्षित नोंदवली जाईल.'
                : '🔒 For audit safety, this operation will be permanently recorded in system audit logs.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="br-btn-3d-secondary"
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={restoringId !== null}
                onClick={handleExecuteRestore}
                className="br-btn-3d-restore"
                style={{
                  padding: '9px 22px',
                  fontSize: '13.5px',
                }}
              >
                <span>{restoringId !== null ? '⏳' : '⚠️'}</span>
                <span>
                  {restoringId !== null
                    ? isMr
                      ? 'रिस्टोअर होत आहे...'
                      : 'Restoring...'
                    : isMr
                    ? 'होय, रिस्टोअर करा'
                    : 'Yes, Restore'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
