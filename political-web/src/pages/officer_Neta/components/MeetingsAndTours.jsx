import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';

export default function MeetingsAndTours({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, scheduled, completed
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newMeetingForm, setNewMeetingForm] = useState({
    title_mr: '',
    title_en: '',
    date: new Date().toISOString().split('T')[0],
    time: 'सकाळी १०:०० ते १२:००',
    venue_mr: '',
    venue_en: '',
    type_mr: 'नागरिक संवाद दौरा',
    type_en: 'Public Townhall Tour',
    expected_attendees: '२५०+ नागरिक',
    incharge: '',
    agenda_mr: '',
    agenda_en: '',
  });

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await netaApi.getMeetings();
      if (res.success) {
        setMeetings(res.data);
      }
    } catch (err) {
      console.error('Failed to load meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const filteredMeetings = meetings.filter((m) => {
    if (activeTab === 'scheduled') return m.status === 'scheduled';
    if (activeTab === 'completed') return m.status === 'completed';
    return true;
  });

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...newMeetingForm,
        title_en: newMeetingForm.title_en || newMeetingForm.title_mr,
        venue_en: newMeetingForm.venue_en || newMeetingForm.venue_mr,
        agenda_en: newMeetingForm.agenda_en || newMeetingForm.agenda_mr,
      };
      const res = await netaApi.createMeeting(payload);
      if (res.success) {
        setShowAddModal(false);
        setNewMeetingForm({
          title_mr: '',
          title_en: '',
          date: new Date().toISOString().split('T')[0],
          time: 'सकाळी १०:०० ते १२:००',
          venue_mr: '',
          venue_en: '',
          type_mr: 'नागरिक संवाद दौरा',
          type_en: 'Public Townhall Tour',
          expected_attendees: '२५०+ नागरिक',
          incharge: '',
          agenda_mr: '',
          agenda_en: '',
        });
        await fetchMeetings();
      }
    } catch (err) {
      console.error('Failed to create meeting:', err);
      alert(err?.message || 'दौरा सेव्ह करताना त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const next = currentStatus === 'scheduled' ? 'completed' : 'scheduled';
    try {
      const res = await netaApi.updateMeetingStatus(id, next);
      if (res.success) {
        setMeetings((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: next } : m))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Add Button */}
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
            📅 {isMr ? 'बैठका व मतदारसंघ दौरे' : 'Meetings & Constituency Tours'}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'नेत्यांचे सर्व विधानसभा दौरे, कोपरा सभा व बैठक वेळापत्रक'
              : 'Directly synced with backend database for scheduled and completed visits.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="btn-3d-blue"
        >
          <span style={{ fontSize: '15px', fontWeight: '900' }}>＋</span> {isMr ? 'नवीन बैठक / दौरा जोडा' : 'Add New Tour / Meeting'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="meetings-filter-pills-row">
        {[
          { key: 'all', label_mr: `सर्व कार्यक्रम (${meetings.length})`, label_en: `All (${meetings.length})` },
          {
            key: 'scheduled',
            label_mr: `आगामी व नियोजित (${meetings.filter((m) => m.status === 'scheduled').length})`,
            label_en: `Upcoming (${meetings.filter((m) => m.status === 'scheduled').length})`,
          },
          {
            key: 'completed',
            label_mr: `संपन्न झालेले (${meetings.filter((m) => m.status === 'completed').length})`,
            label_en: `Completed (${meetings.filter((m) => m.status === 'completed').length})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`pill-3d-box ${activeTab === tab.key ? 'active' : 'inactive'}`}
          >
            {isMr ? tab.label_mr : tab.label_en}
          </button>
        ))}
      </div>

      {/* Meetings List Cards */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#1e3a8a', fontWeight: '700' }}>
          ⏳ {isMr ? 'डेटाबेसमधून दौरे व बैठका लोड होत आहेत...' : 'Loading tours from database...'}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {filteredMeetings.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#94a3b8', gridColumn: '1 / -1' }}>
              {isMr ? 'कोणतेही कार्यक्रम उपलब्ध नाहीत.' : 'No meetings found.'}
            </div>
          ) : (
            filteredMeetings.map((meet) => (
              <div
                key={meet.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: meet.status === 'scheduled' ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Header Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                    <span
                      style={{
                        background: meet.status === 'scheduled' ? '#dbeafe' : '#f1f5f9',
                        color: meet.status === 'scheduled' ? '#1d4ed8' : '#64748b',
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {isMr ? meet.type_mr : (meet.type_en || meet.type_mr)}
                    </span>

                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '20px',
                        background: meet.status === 'scheduled' ? '#fef3c7' : '#dcfce7',
                        color: meet.status === 'scheduled' ? '#b45309' : '#15803d',
                      }}
                    >
                      {meet.status === 'scheduled' ? (isMr ? '● नियोजित' : '● Scheduled') : (isMr ? '✓ संपन्न' : '✓ Completed')}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: 1.4 }}>
                    {isMr ? meet.title_mr : (meet.title_en || meet.title_mr)}
                  </h3>

                  {/* Info details */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#475569' }}>
                    <div>
                      📅 <strong>{isMr ? 'दिनांक व वेळ:' : 'Date & Time:'}</strong> {meet.date} ({meet.time})
                    </div>
                    <div>
                      🏛️ <strong>{isMr ? 'ठिकाण:' : 'Venue:'}</strong> {isMr ? meet.venue_mr : (meet.venue_en || meet.venue_mr)}
                    </div>
                    <div>
                      👥 <strong>{isMr ? 'अपेक्षित उपस्थिती:' : 'Expected Crowd:'}</strong> {meet.expected_attendees}
                    </div>
                    {meet.incharge && (
                      <div>
                        👤 <strong>{isMr ? 'समन्वयक:' : 'In-charge:'}</strong> {meet.incharge}
                      </div>
                    )}
                  </div>

                  {/* Agenda Box */}
                  {meet.agenda_mr && (
                    <div
                      style={{
                        marginTop: '14px',
                        padding: '10px 12px',
                        background: '#f8fafc',
                        borderRadius: '8px',
                        borderLeft: '3px solid #3b82f6',
                        fontSize: '12px',
                        color: '#334155',
                        whiteSpace: 'pre-line',
                      }}
                    >
                      <strong>{isMr ? 'अजेंडा व प्रमुख मुद्दे:' : 'Agenda:'}</strong>
                      <div style={{ marginTop: '4px' }}>{isMr ? meet.agenda_mr : (meet.agenda_en || meet.agenda_mr)}</div>
                    </div>
                  )}
                </div>

                {/* Actions Bar */}
                <div
                  style={{
                    marginTop: '18px',
                    paddingTop: '12px',
                    borderTop: '1px solid #f1f5f9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <button
                    onClick={() => handleToggleStatus(meet.id, meet.status)}
                    style={{
                      background: meet.status === 'scheduled' ? '#16a34a' : '#f1f5f9',
                      color: meet.status === 'scheduled' ? '#ffffff' : '#475569',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    {meet.status === 'scheduled'
                      ? isMr
                        ? '✓ संपन्न झाले'
                        : 'Mark Completed'
                      : isMr
                      ? 'पुन्हा नियोजित करा'
                      : 'Reopen'}
                  </button>

                  {/* WhatsApp Share Button */}
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                      `*${isMr ? meet.title_mr : (meet.title_en || meet.title_mr)}*\n📅 ${meet.date} (${meet.time})\n🏛️ ${
                        isMr ? meet.venue_mr : (meet.venue_en || meet.venue_mr)
                      }\n👥 उपस्थिती: ${meet.expected_attendees}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      background: '#25d366',
                      color: '#ffffff',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    💬 {isMr ? 'शेअर करा' : 'Share'}
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Add New Meeting Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                📅 {isMr ? 'नवीन बैठक किंवा दौरा नोंदवा (DB Save)' : 'Schedule New Tour or Meeting'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'कार्यक्रमाचे नाव / विषय *' : 'Event / Meeting Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. विश्रामबाग व्यापारी व नागरिक संवाद दौरा' : 'e.g. Traders Townhall'}
                  value={newMeetingForm.title_mr}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, title_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'प्रकार' : 'Category'}
                  </label>
                  <select
                    value={newMeetingForm.type_mr}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, type_mr: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="नागरिक संवाद दौरा">{isMr ? 'नागरिक संवाद दौरा' : 'Citizen Outreach Tour'}</option>
                    <option value="पक्ष संघटना बैठक">{isMr ? 'पक्ष संघटना बैठक' : 'Party Organization Meeting'}</option>
                    <option value="महिला मेळावा">{isMr ? 'महिला मेळावा' : 'Women Gathering'}</option>
                    <option value="शेतकरी संवाद">{isMr ? 'शेतकरी संवाद' : 'Farmers Outreach'}</option>
                    <option value="युवा मेळावा">{isMr ? 'युवा मेळावा' : 'Youth Conference'}</option>
                    <option value="जनता दरबार">{isMr ? 'जनता दरबार' : 'Public Grievance Hearing'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'दिनांक *' : 'Date *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newMeetingForm.date}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, date: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'वेळ' : 'Time'}
                  </label>
                  <input
                    type="text"
                    value={newMeetingForm.time}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, time: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'अपेक्षित उपस्थिती' : 'Expected Crowd'}
                  </label>
                  <input
                    type="text"
                    value={newMeetingForm.expected_attendees}
                    onChange={(e) => setNewMeetingForm({ ...newMeetingForm, expected_attendees: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'ठिकाण *' : 'Venue *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. छत्रपती शिवाजी हॉल, सांगली' : 'Venue address'}
                  value={newMeetingForm.venue_mr}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, venue_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'स्थानिक प्रमुख समन्वयक व संपर्क' : 'Local In-charge & Contact'}
                </label>
                <input
                  type="text"
                  placeholder={isMr ? 'उदा. सचिन पाटील (९८२२०१४५२१)' : 'Name & Phone'}
                  value={newMeetingForm.incharge}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, incharge: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'अजेंडा व प्रमुख मुद्दे' : 'Agenda & Discussion Points'}
                </label>
                <textarea
                  rows={3}
                  placeholder={isMr ? '१. रस्त्यांची समस्या\n२. लाडकी बहीण आढावा...' : 'Agenda notes...'}
                  value={newMeetingForm.agenda_mr}
                  onChange={(e) => setNewMeetingForm({ ...newMeetingForm, agenda_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1e3a8a', color: '#ffffff', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer' }}
                >
                  {submitting ? (isMr ? 'जतन होत आहे...' : 'Saving...') : (isMr ? 'दौरा जतन करा' : 'Save Meeting')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
