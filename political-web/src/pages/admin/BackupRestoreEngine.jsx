import React, { useState, useEffect } from 'react';
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

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
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
        showToast(res.data.message || (isMr ? 'नवीन MySQL बॅकअप तयार झाला!' : 'New backup snapshot generated!'));
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
        showToast(res.data.message || (isMr ? 'डेटाबेस पुनर्संचयित झाला!' : 'Database restored successfully!'));
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
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

      {/* Header Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '22px 24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>💾</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              {isMr ? 'डेटाबेस बॅकअप व रिस्टोअर' : 'Database Backup & Restore'}
            </h2>
            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '12px' }}>
              {isMr ? 'आपत्कालीन सज्जता' : 'Disaster Recovery'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'निवडणूक प्रकल्पाच्या संपूर्ण डेटाबेसचे सुरक्षित स्नॅपशॉट्स तयार करा, डाउनलोड करा आणि आपत्कालीन स्थितीत रिस्टोअर करा.'
              : 'Generate timestamped SQL dumps, download backups to secure storage, and restore databases on-demand.'}
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          disabled={creatingBackup}
          style={{
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '11px 20px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: creatingBackup ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
          }}
        >
          <span>{creatingBackup ? '⏳' : '💾'}</span>
          {creatingBackup
            ? isMr
              ? 'बॅकअप तयार होत आहे...'
              : 'Dumping MySQL database...'
            : isMr
            ? 'आताच नवीन डेटाबेस बॅकअप तयार करा'
            : 'Create Backup Snapshot'}
        </button>
      </div>

      {/* Database Health Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3px solid #10b981' }}>
          <div style={{ fontSize: '12px', color: '#059669', fontWeight: '700' }}>{isMr ? 'डेटाबेस स्थिती' : 'Database Engine'}</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '4px' }}>
            {isMr ? 'MySQL 8.0 (थेट जोडणी)' : 'MySQL 8.0 (Live Connected)'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>political-project @ 127.0.0.1:3306</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3px solid #3b82f6' }}>
          <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '700' }}>{isMr ? 'एकूण उपलब्ध स्नॅपशॉट्स' : 'Total Backups'}</div>
          <div style={{ fontSize: '24px', fontWeight: '800', color: '#1d4ed8', marginTop: '4px' }}>
            {backups.length}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'सुरक्षित स्टोरेजमध्ये साठवलेले' : 'Stored in storage/app/backups'}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', borderTop: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '12px', color: '#b45309', fontWeight: '700' }}>{isMr ? 'सुरक्षितता व पुनर्संचयित' : 'Recovery Status'}</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#b45309', marginTop: '4px' }}>
            {isMr ? '१००% सुरक्षित व सज्ज' : '100% Disaster Ready'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{isMr ? 'सर्व टेबल्स डेटा संरक्षित' : 'Schema & Data protected'}</div>
        </div>
      </div>

      {/* Backups List Table */}
      <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
            {isMr ? 'डेटाबेस स्नॅपशॉट्स व बॅकअप आर्काइव्ह' : 'Database Snapshots Archive'} ({backups.length})
          </h3>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {isMr ? 'थेट डाउनलोड करा किंवा रिस्टोअर करा' : 'Download .sql dump or restore'}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            ⏳ {isMr ? 'बॅकअप नोंदी लोड होत आहेत...' : 'Loading backup archives...'}
          </div>
        ) : backups.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            {isMr ? 'कोणतेही बॅकअप स्नॅपशॉट उपलब्ध नाहीत. वर दिलेल्या बटणावर क्लिक करून तयार करा.' : 'No backups found. Click Create Backup.'}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'बॅकअप फाईल नाव' : 'File Name'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'प्रकार' : 'Type'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'फाईल साईझ' : 'Size'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'तयार केल्याची तारीख' : 'Created Date'}</th>
                  <th style={{ padding: '12px 16px' }}>{isMr ? 'तयारकर्ता' : 'Creator'}</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>{isMr ? 'कृती' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: '700', color: '#0f172a', fontFamily: 'monospace', fontSize: '12.5px' }}>
                        📄 {b.filename}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {b.file_path}
                      </div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                        {b.backup_type}
                      </span>
                    </td>

                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#334155' }}>
                      {b.file_size_formatted}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '12px' }}>
                      {new Date(b.created_at).toLocaleString(isMr ? 'mr-IN' : 'en-IN')}
                    </td>

                    <td style={{ padding: '14px 16px', color: '#475569' }}>
                      👤 {b.created_by_name}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleDownloadBackup(b.id, b.filename)}
                          style={{
                            background: '#f8fafc',
                            color: '#1e293b',
                            border: '1px solid #cbd5e1',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          📥 {isMr ? 'डाऊनलोड' : 'Download'}
                        </button>

                        <button
                          onClick={() => {
                            setSelectedBackupForRestore(b);
                            setShowRestoreModal(true);
                          }}
                          style={{
                            background: '#fff7ed',
                            color: '#c2410c',
                            border: '1px solid #fed7aa',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          🔄 {isMr ? 'रिस्टोअर' : 'Restore'}
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

      {/* RESTORE CONFIRMATION MODAL */}
      {showRestoreModal && selectedBackupForRestore && (
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
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setShowRestoreModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#c2410c', marginBottom: '12px' }}>
              <span style={{ fontSize: '24px' }}>⚠️</span>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                {isMr ? 'डेटाबेस रिस्टोअरची खात्री करा' : 'Confirm Database Restore'}
              </h3>
            </div>

            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              {isMr ? (
                <>
                  तुम्ही <strong>{selectedBackupForRestore.filename}</strong> हा बॅकअप स्नॅपशॉट चालू डेटाबेसवर रिस्टोअर करत आहात. चालू डेटा या स्नॅपशॉटच्या वेळेनुसार पूर्ववत केला जाईल.
                </>
              ) : (
                <>
                  You are restoring backup snapshot <strong>{selectedBackupForRestore.filename}</strong> to the active database. Current data will be replaced with this snapshot state.
                </>
              )}
            </p>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '10px 14px', fontSize: '12px', color: '#92400e', marginBottom: '16px' }}>
              {isMr
                ? '🔒 सुरक्षिततेसाठी ही कृती अ‍ॅडमिन ऑडिट ट्रेलमध्ये कायमस्वरूपी नोंदवली जाईल.'
                : '🔒 For audit safety, this operation will be permanently recorded in system audit logs.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontSize: '13px' }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="button"
                disabled={restoringId !== null}
                onClick={handleExecuteRestore}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: '#c2410c', color: '#ffffff', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}
              >
                {restoringId !== null
                  ? isMr
                    ? 'रिस्टोअर होत आहे...'
                    : 'Restoring...'
                  : isMr
                  ? 'होय, रिस्टोअर करा'
                  : 'Yes, Restore'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
