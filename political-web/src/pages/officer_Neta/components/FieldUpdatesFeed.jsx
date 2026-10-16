import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';

export default function FieldUpdatesFeed({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all'); // all, positive, grievance, opposition, warning
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newUpdate, setNewUpdate] = useState({
    title_mr: '',
    reporter_name: 'मा. नेता संपर्क कक्ष',
    location: 'सांगली मध्यवर्ती कार्यालय',
    type: 'positive',
    detail_mr: '',
  });

  const fetchUpdates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterType !== 'all') params.type = filterType;
      const res = await netaApi.getFieldUpdates(params);
      if (res.success) {
        setUpdates(res.data);
      }
    } catch (err) {
      console.error('Failed to load field updates from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpdates();
  }, [filterType]);

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...newUpdate,
        title_en: newUpdate.title_mr,
        detail_en: newUpdate.detail_mr,
      };
      const res = await netaApi.createFieldUpdate(payload);
      if (res.success) {
        setShowAddForm(false);
        setNewUpdate({
          title_mr: '',
          reporter_name: 'मा. नेता संपर्क कक्ष',
          location: 'सांगली मध्यवर्ती कार्यालय',
          type: 'positive',
          detail_mr: '',
        });
        await fetchUpdates();
      }
    } catch (err) {
      console.error('Failed to post update:', err);
      alert(err?.message || 'वार्ता नोंदवण्यात त्रुटी आली.');
    } finally {
      setSubmitting(false);
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
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
            📡 {isMr ? 'प्रत्यक्ष क्षेत्रीय वार्ता व फीड' : 'Field Updates & Ground Pulse'}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'डेटाबेसशी थेट जोडलेली थेट राजकीय माहिती, विरोधक हालचाली व नागरिक प्रतिक्रिया'
              : 'Direct from database: Live ground intelligence feeds, opposition moves, and worker notes.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            background: '#1e3a8a',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>✏️</span> {showAddForm ? (isMr ? 'फॉर्म बंद करा' : 'Close Form') : (isMr ? 'नवीन वार्ता नोंदवा' : 'Post Update')}
        </button>
      </div>

      {/* Add Field Update Inline Card */}
      {showAddForm && (
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #cbd5e1',
          }}
        >
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
            📝 {isMr ? 'नवीन क्षेत्रीय वार्ता नोंदवा' : 'Publish Ground Note'}
          </h3>
          <form onSubmit={handlePostUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'वार्ता शीर्षक *' : 'Update Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. विश्रामबाग व्यापारी संघटनेचा पाठिंबा' : 'Enter title'}
                  value={newUpdate.title_mr}
                  onChange={(e) => setNewUpdate({ ...newUpdate, title_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'वार्ता प्रकार' : 'Category'}
                </label>
                <select
                  value={newUpdate.type}
                  onChange={(e) => setNewUpdate({ ...newUpdate, type: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="positive">🟢 {isMr ? 'अनुकूल / सकारात्मक' : 'Positive'}</option>
                  <option value="grievance">🟡 {isMr ? 'नागरी समस्या' : 'Grievance'}</option>
                  <option value="opposition">🔴 {isMr ? 'विरोधक हालचाल' : 'Opposition'}</option>
                  <option value="warning">🟠 {isMr ? 'सावध / सतर्कता सूचना' : 'Warning'}</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'ठिकाण / परिसर' : 'Location'}
                </label>
                <input
                  type="text"
                  value={newUpdate.location}
                  onChange={(e) => setNewUpdate({ ...newUpdate, location: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                {isMr ? 'सविस्तर वृत्तांत *' : 'Detailed Report *'}
              </label>
              <textarea
                rows={3}
                required
                placeholder={isMr ? 'तपशीलवार माहिती लिहा...' : 'Details...'}
                value={newUpdate.detail_mr}
                onChange={(e) => setNewUpdate({ ...newUpdate, detail_mr: e.target.value })}
                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer' }}
              >
                {submitting ? (isMr ? 'नोंद होत आहे...' : 'Posting...') : (isMr ? 'वार्ता प्रसिद्ध करा' : 'Post to Feed')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label_mr: `सर्व वार्ता (${updates.length})`, label_en: `All (${updates.length})` },
          { key: 'positive', label_mr: '🟢 अनुकूल / यश', label_en: '🟢 Positive' },
          { key: 'grievance', label_mr: '🟡 मतदार समस्या', label_en: '🟡 Grievance' },
          { key: 'opposition', label_mr: '🔴 विरोधक हालचाली', label_en: '🔴 Opposition' },
          { key: 'warning', label_mr: '🟠 सतर्कता इशारा', label_en: '🟠 Warning' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
              border: filterType === tab.key ? 'none' : '1px solid #cbd5e1',
              background: filterType === tab.key ? '#1e3a8a' : '#ffffff',
              color: filterType === tab.key ? '#ffffff' : '#475569',
            }}
          >
            {isMr ? tab.label_mr : tab.label_en}
          </button>
        ))}
      </div>

      {/* Feed List */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#1e3a8a', fontWeight: '700' }}>
          ⏳ {isMr ? 'डेटाबेसमधून थेट क्षेत्रीय वार्ता लोड होत आहेत...' : 'Loading field updates from database...'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {updates.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#94a3b8' }}>
              {isMr ? 'या श्रेणीत कोणतीही वार्ता उपलब्ध नाही.' : 'No updates found.'}
            </div>
          ) : (
            updates.map((item) => (
              <div
                key={item.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  border:
                    item.type === 'opposition'
                      ? '1px solid #fecdd3'
                      : item.type === 'grievance'
                      ? '1px solid #fed7aa'
                      : '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        background:
                          item.type === 'positive'
                            ? '#dcfce7'
                            : item.type === 'grievance'
                            ? '#fef9c3'
                            : item.type === 'opposition'
                            ? '#fee2e2'
                            : '#ffedd5',
                        color:
                          item.type === 'positive'
                            ? '#15803d'
                            : item.type === 'grievance'
                            ? '#854d0e'
                            : item.type === 'opposition'
                            ? '#991b1b'
                            : '#c2410c',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {item.type === 'positive'
                        ? isMr
                          ? '🟢 जनसंवाद यश'
                          : 'Positive'
                        : item.type === 'grievance'
                        ? isMr
                          ? '🟡 नागरी समस्या'
                          : 'Grievance'
                        : item.type === 'opposition'
                        ? isMr
                          ? '🔴 विरोधक सतर्कता'
                          : 'Opposition'
                        : isMr
                        ? '🟠 इशारा'
                        : 'Warning'}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>{item.booth_ref}</span>
                  </div>

                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    ⏱️ {item.time_ago} ({item.timestamp})
                  </div>
                </div>

                <h3 style={{ margin: '2px 0 0 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                  {isMr ? item.title_mr : (item.title_en || item.title_mr)}
                </h3>

                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: 1.5 }}>
                  {isMr ? item.detail_mr : (item.detail_en || item.detail_mr)}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '8px', borderTop: '1px solid #f1f5f9', fontSize: '12px', color: '#64748b' }}>
                  <div>
                    👤 <strong>{item.reporter_name}</strong> ({item.reporter_role})
                  </div>
                  <div>
                    📍 {item.location}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
