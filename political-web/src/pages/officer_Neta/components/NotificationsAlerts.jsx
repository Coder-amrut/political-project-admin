import React, { useState, useEffect, useRef } from 'react';
import { netaApi } from '../api/netaApi';

export default function NotificationsAlerts({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, critical
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState('warning'); // critical, warning, info, success
  const [broadcastTarget, setBroadcastTarget] = useState('all_workers');
  const [sendNativePush, setSendNativePush] = useState(true);
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastSent, setBroadcastSent] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Web Push & Sound state
  const [pushPermission, setPushPermission] = useState('default');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const lastAlertIdRef = useRef(null);

  // Play synthetic pleasant audio chime using browser Web Audio API
  const playChime = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.warn('Audio chime error:', e);
    }
  };

  // Check native browser notification permission
  useEffect(() => {
    if ('Notification' in window) {
      setPushPermission(Notification.permission);
    }
  }, []);

  const requestPushPermission = async () => {
    if (!('Notification' in window)) {
      alert(isMr ? 'आपल्या ब्राउझरमध्ये डेस्कटॉप नोटिफिकेशन्स समर्थित नाहीत.' : 'Browser does not support notifications.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPushPermission(perm);
    if (perm === 'granted') {
      triggerNativeNotification(
        isMr ? 'पुश नोटिफिकेशन्स सक्रिय!' : 'Push Notifications Enabled!',
        isMr ? 'निवडणूक वॉर रूमचे सर्व महत्त्वाचे इशारे आता थेट स्क्रीनवर दिसतील.' : 'War room priority alerts will now pop up on your desktop.'
      );
    }
  };

  const triggerNativeNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
        });
        playChime();
      } catch (err) {
        console.warn('Notification display error:', err);
      }
    }
  };

  const fetchAlerts = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') params.filter = filter;
      const res = await netaApi.getNotifications(params);
      if (res.success) {
        setAlerts(res.data);
        setUnreadCount(res.unread_count || 0);

        // Check for new incoming alerts to pop push notification
        if (res.data && res.data.length > 0) {
          const newest = res.data[0];
          if (lastAlertIdRef.current !== null && newest.id > lastAlertIdRef.current) {
            triggerNativeNotification(
              newest.title_mr || 'नवीन निवडणूक सतर्कता सूचना',
              newest.detail_mr || 'कार्यकर्त्यांसाठी नवीन आदेश जारी करण्यात आला आहे.'
            );
          }
          lastAlertIdRef.current = newest.id;
        }
      }
    } catch (err) {
      console.error('Failed to load notifications from DB:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  // Real-time auto-poll every 30 seconds for live field push alerts
  useEffect(() => {
    const timer = setInterval(() => {
      fetchAlerts(true);
    }, 30000);
    return () => clearInterval(timer);
  }, [filter]);

  const handleMarkAllRead = async () => {
    try {
      const res = await netaApi.markAllNotificationsRead();
      if (res.success) {
        setAlerts((prev) => prev.map((a) => ({ ...a, is_unread: false })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleToggleRead = async (id) => {
    try {
      const res = await netaApi.toggleNotificationRead(id);
      if (res.success) {
        setAlerts((prev) =>
          prev.map((a) => (a.id === id ? { ...a, is_unread: res.is_unread } : a))
        );
        setUnreadCount((prev) => (res.is_unread ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (err) {
      console.error('Failed to toggle read status:', err);
    }
  };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    setBroadcasting(true);
    try {
      const res = await netaApi.broadcastNotification({
        title_mr: broadcastTitle.trim() || undefined,
        message: broadcastMessage.trim(),
        severity: broadcastSeverity,
        target_group: broadcastTarget,
      });

      if (res.success) {
        // Trigger browser native push if enabled
        if (sendNativePush) {
          triggerNativeNotification(
            broadcastTitle.trim() || (isMr ? '🚨 तातडीचा थेट आदेश' : 'Priority Broadcast Alert'),
            broadcastMessage.trim()
          );
        }

        setBroadcastSent(true);
        setTimeout(() => {
          setBroadcastSent(false);
          setShowBroadcastModal(false);
          setBroadcastMessage('');
          setBroadcastTitle('');
          fetchAlerts();
        }, 1600);
      }
    } catch (err) {
      console.error('Failed to broadcast alert:', err);
      alert(err?.message || 'अलर्ट प्रसारित करताना त्रुटी आली.');
    } finally {
      setBroadcasting(false);
    }
  };

  const testPushNotification = () => {
    if (pushPermission !== 'granted') {
      requestPushPermission();
    } else {
      triggerNativeNotification(
        isMr ? '🚨 चाचणी: तातडीचा वॉर रूम अलर्ट!' : '🚨 Test: War Room Priority Alert!',
        isMr ? 'बूथ क्र. १ ते ५ मधील मतदान केंद्रांवर कार्यकर्त्यांची हजेरी तपासणी सुरू आहे.' : 'Field verification in progress across polling stations.'
      );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
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
            <span style={{ fontSize: '24px' }}>🔔</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              {isMr ? 'सूचना व थेट सतर्कता इशारे' : 'Notifications & Push Alerts'}
            </h2>
            <span style={{ background: '#dbeafe', color: '#1e40af', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '12px' }}>
              {isMr ? 'अहवाल संदर्भ: १, २, ७' : 'Report Ref: 1, 2, 7'}
            </span>
            {unreadCount > 0 && (
              <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '11px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px' }}>
                {unreadCount} {isMr ? 'नवीन' : 'New'}
              </span>
            )}
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'थेट डेटाबेस व पुश प्रणालीद्वारे निवडणूक इशारे, बूथ घटना व तातडीचे आदेश.'
              : 'Direct from MySQL DB & Web Push: Commission notices, risk alerts, and real-time broadcasts.'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? (isMr ? 'ध्वनी सुरू आहे' : 'Sound On') : (isMr ? 'ध्वनी बंद आहे' : 'Sound Off')}
            style={{
              background: soundEnabled ? '#eff6ff' : '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: soundEnabled ? '#1d4ed8' : '#64748b',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            {soundEnabled ? (isMr ? '🔊 ध्वनी चालू' : '🔊 Sound On') : (isMr ? '🔇 मूक' : '🔇 Mute')}
          </button>

          {/* Test Push Button */}
          <button
            onClick={testPushNotification}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#1e293b',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            📲 {isMr ? 'चाचणी अलर्ट पाठवा' : 'Test Push'}
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                color: '#334155',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ✓ {isMr ? 'सर्व वाचले' : 'Mark Read'}
            </button>
          )}

          <button
            onClick={() => setShowBroadcastModal(true)}
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 10px rgba(220, 38, 38, 0.25)',
            }}
          >
            📢 {isMr ? 'तातडीचा अलर्ट पाठवा' : 'Broadcast Alert'}
          </button>
        </div>
      </div>

      {/* Push Permission Prompt if not granted */}
      {pushPermission !== 'granted' && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>🔔</span>
            <div>
              <strong style={{ fontSize: '13px', color: '#92400e' }}>
                {isMr ? 'डेस्कटॉप व मोबाईल पुश नोटिफिकेशन्स सक्रिय करा' : 'Enable Desktop & Mobile Push Notifications'}
              </strong>
              <div style={{ fontSize: '12px', color: '#b45309', marginTop: '2px' }}>
                {isMr
                  ? 'मैदानातील गंभीर घटना किंवा नेत्यांचा तातडीचा आदेश आल्यास तात्काळ स्क्रीनवर नोटिफिकेशन दिसेल.'
                  : 'Receive instant alerts on your screen when critical field incidents occur.'}
              </div>
            </div>
          </div>

          <button
            onClick={requestPushPermission}
            style={{
              background: '#d97706',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
          >
            ✓ {isMr ? 'आता परवानगी द्या' : 'Enable Now'}
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label_mr: `सर्व सूचना (${alerts.length})`, label_en: `All (${alerts.length})` },
          { key: 'unread', label_mr: `न वाचलेल्या (${unreadCount})`, label_en: `Unread (${unreadCount})` },
          {
            key: 'critical',
            label_mr: `🚨 अतिमहत्त्वाचे इशारे`,
            label_en: `Critical`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              padding: '7px 16px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: filter === tab.key ? 'none' : '1px solid #cbd5e1',
              background: filter === tab.key ? (tab.key === 'critical' ? '#dc2626' : '#1d4ed8') : '#ffffff',
              color: filter === tab.key ? '#ffffff' : '#475569',
            }}
          >
            {isMr ? tab.label_mr : tab.label_en}
          </button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#1d4ed8', fontWeight: '700' }}>
          ⏳ {isMr ? 'डेटाबेसमधून सूचना व अलर्ट लोड होत आहेत...' : 'Loading alerts from database...'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {alerts.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#94a3b8' }}>
              {isMr ? 'कोणत्याही सूचना उपलब्ध नाहीत.' : 'No alerts found.'}
            </div>
          ) : (
            alerts.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.is_unread ? '#ffffff' : '#f8fafc',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  borderLeft:
                    item.severity === 'critical'
                      ? '5px solid #ef4444'
                      : item.severity === 'warning'
                      ? '5px solid #f97316'
                      : item.severity === 'success'
                      ? '5px solid #16a34a'
                      : '5px solid #3b82f6',
                  borderTop: '1px solid #e2e8f0',
                  borderRight: '1px solid #e2e8f0',
                  borderBottom: '1px solid #e2e8f0',
                  boxShadow: item.is_unread ? '0 2px 6px rgba(0,0,0,0.05)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '14px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span
                      style={{
                        background:
                          item.severity === 'critical'
                            ? '#fee2e2'
                            : item.severity === 'warning'
                            ? '#ffedd5'
                            : item.severity === 'success'
                            ? '#dcfce7'
                            : '#eff6ff',
                        color:
                          item.severity === 'critical'
                            ? '#991b1b'
                            : item.severity === 'warning'
                            ? '#c2410c'
                            : item.severity === 'success'
                            ? '#15803d'
                            : '#1d4ed8',
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.severity === 'critical'
                        ? isMr
                          ? '🚨 अतितात्काळ इशारा'
                          : 'Critical'
                        : item.severity === 'warning'
                        ? isMr
                          ? '⚠️ सतर्कता सूचना'
                          : 'Warning'
                        : item.severity === 'success'
                        ? isMr
                          ? '✓ यश संपादन'
                          : 'Success'
                        : isMr
                        ? 'ℹ️ प्रशासकीय सूचना'
                        : 'Notice'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>⏱️ {item.time}</span>
                  </div>

                  <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {isMr ? item.title_mr : (item.title_en || item.title_mr)}
                  </h3>

                  <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                    {isMr ? item.detail_mr : (item.detail_en || item.detail_mr)}
                  </p>
                </div>

                <button
                  onClick={() => handleToggleRead(item.id)}
                  style={{
                    background: 'none',
                    border: '1px solid #cbd5e1',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    color: '#64748b',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.is_unread ? (isMr ? 'वाचले' : 'Mark Read') : (isMr ? 'न वाचलेले' : 'Unread')}
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Broadcast Alert Modal */}
      {showBroadcastModal && (
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
          onClick={() => setShowBroadcastModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(540px, 96vw)',
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
                📢 {isMr ? 'कार्यकर्त्यांना तातडीचा पुश अलर्ट प्रसारित करा' : 'Broadcast Priority Push Alert'}
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            {broadcastSent ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#16a34a', fontWeight: '800' }}>
                ✓ {isMr ? 'सर्व कार्यकर्त्यांच्या मोबाईलवर डेटाबेसद्वारे सूचना प्रसारित झाली!' : 'Alert broadcasted successfully!'}
              </div>
            ) : (
              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      {isMr ? 'प्राधान्य पातळी (Severity)' : 'Severity Level'}
                    </label>
                    <select
                      value={broadcastSeverity}
                      onChange={(e) => setBroadcastSeverity(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="critical">{isMr ? '🚨 अतितात्काळ' : '🚨 Critical'}</option>
                      <option value="warning">{isMr ? '⚠️ सतर्कता सूचना' : '⚠️ Warning'}</option>
                      <option value="info">{isMr ? 'ℹ️ प्रशासकीय सूचना' : 'ℹ️ Info'}</option>
                      <option value="success">{isMr ? '✓ यश संपादन' : '✓ Success'}</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                      {isMr ? 'प्राप्तकर्ता गट' : 'Target Audience'}
                    </label>
                    <select
                      value={broadcastTarget}
                      onChange={(e) => setBroadcastTarget(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                    >
                      <option value="all_workers">{isMr ? 'सर्व २४५ कार्यकर्ते व बूथ प्रमुख' : 'All 245 Workers & Booth Heads'}</option>
                      <option value="booth_heads">{isMr ? 'केवळ बूथ प्रमुख (३१८ प्रमुख)' : 'Booth Heads Only (318 Heads)'}</option>
                      <option value="ward_coordinators">{isMr ? 'प्रभाग व तालुका समन्वयक' : 'Ward & Taluka Coordinators'}</option>
                      <option value="sensitive_booths">{isMr ? 'केवळ २८ संवेदनशील बूथ कार्यकर्ते' : '28 Sensitive Booth Workers Only'}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'अलर्ट शीर्षक (पर्यायी)' : 'Alert Title (Optional)'}
                  </label>
                  <input
                    type="text"
                    placeholder={isMr ? 'उदा. २८२ सांगली: सर्व बुथांवर तातडीची सूचना' : 'e.g. Sangli: Urgent Booth Update'}
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
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

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'संदेश मजकूर *' : 'Message Text *'}
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder={
                      isMr
                        ? 'उदा. सर्व बूथ प्रमुखांनी आज संध्याकाळपर्यंत नवीन मतदार नोंदणी फॉर्म जमा करावेत...'
                        : 'Enter alert broadcast message...'
                    }
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
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

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="sendNativePush"
                    checked={sendNativePush}
                    onChange={(e) => setSendNativePush(e.target.checked)}
                  />
                  <label htmlFor="sendNativePush" style={{ fontSize: '12px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>
                    📲 {isMr ? 'डेस्कटॉप व मोबाईल स्क्रीनवर थेट पुश नोटिफिकेशन पाठवा' : 'Send instant screen push alert'}
                  </label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                  >
                    {isMr ? 'रद्द करा' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    disabled={broadcasting}
                    style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#ffffff', fontWeight: '700', cursor: broadcasting ? 'wait' : 'pointer' }}
                  >
                    {broadcasting ? (isMr ? 'प्रसारित होत आहे...' : 'Broadcasting...') : (isMr ? 'अलर्ट पाठवा' : 'Broadcast Now')}
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
