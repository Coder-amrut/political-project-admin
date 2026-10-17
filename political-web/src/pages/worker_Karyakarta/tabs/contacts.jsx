import React from 'react';
import {
  Calendar,
  Search,
  CalendarCheck,
  PhoneCall,
  MessageCircle,
  MapPin,
  Plus,
  Video,
  Users,
  Clock
} from 'lucide-react';

export default function ContactsTab({
  isMr,
  t,
  votersList = [],
  meetingsList = [],
  contactTab = 'contacts',
  setContactTab,
  contactSentimentFilter = 'All',
  setContactSentimentFilter,
  contactSearchQuery = '',
  setContactSearchQuery,
  activeVisitContact,
  setActiveVisitContact,
  visitFormData,
  setVisitFormData,
  handleSaveVisitLog,
  currentCoords,
  isSchedulingMeeting,
  setIsSchedulingMeeting,
  newMeeting,
  setNewMeeting,
  handleScheduleMeeting,
}) {
  const supportiveCount = votersList.filter((c) => c.status === 'Supportive').length;
  const undecidedCount = votersList.filter((c) => c.status === 'Undecided').length;
  const needsInfoCount = votersList.filter((c) => c.status === 'Needs Info').length;

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={26} color="#0284c7" />
            <span>{isMr ? 'नागरिक संपर्क व बैठका' : 'Citizen Contacts & Outreach Meetings'}</span>
          </h1>
          <div className="page-subtitle">
            {isMr ? 'मतदार संपर्क यादी, प्रत्यक्ष भेट नोंद आणि मोहिमेच्या बैठकांचे नियोजन.' : 'Voter directory, doorstep visit logging, voter sentiment tracking, and campaign meeting coordination.'}
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div style={{ display: 'flex', gap: '4px', backgroundColor: '#ffffff', padding: '4px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
          <button
            type="button"
            onClick={() => setContactTab('contacts')}
            style={{
              padding: '7px 18px',
              borderRadius: '7px',
              border: 'none',
              background: contactTab === 'contacts' ? '#0284c7' : 'transparent',
              color: contactTab === 'contacts' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            👥 {isMr ? 'मतदार संपर्क यादी' : 'Voter Directory'} ({votersList.length})
          </button>
          <button
            type="button"
            onClick={() => setContactTab('meetings')}
            style={{
              padding: '7px 18px',
              borderRadius: '7px',
              border: 'none',
              background: contactTab === 'meetings' ? '#0284c7' : 'transparent',
              color: contactTab === 'meetings' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            🗓️ {isMr ? 'आगामी बैठका' : 'Meetings & Gatherings'} ({meetingsList.length})
          </button>
        </div>
      </div>

      {contactTab === 'contacts' && (() => {
        const filteredContacts = votersList.filter((contact) => {
          const matchesSentiment = contactSentimentFilter === 'All' || contact.status === contactSentimentFilter;
          if (!matchesSentiment) return false;
          if (!contactSearchQuery.trim()) return true;
          const q = contactSearchQuery.toLowerCase();
          return (
            (contact.name && contact.name.toLowerCase().includes(q)) ||
            (contact.phone && contact.phone.includes(q)) ||
            (contact.ward && contact.ward.toLowerCase().includes(q)) ||
            (contact.status && contact.status.toLowerCase().includes(q))
          );
        });

        return (
          <>
            {/* 4 Quick Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #0284c7', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'एकूण नोंदवलेले मतदार' : 'Total Voters in Directory'}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>
                  {votersList.length}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderTop: '3.5px solid #16a34a', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
                  {isMr ? 'अनुकूल मतदार (Supportive)' : 'Supportive Voters'}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>
                  {supportiveCount}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderTop: '3.5px solid #ea580c', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '700' }}>
                  {isMr ? 'अनिर्णित मतदार (Undecided)' : 'Undecided / Swing'}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#c2410c', marginTop: '4px' }}>
                  {undecidedCount}
                </div>
              </div>

              <div style={{ background: '#ffffff', border: '1px solid #fef08a', borderTop: '3.5px solid #ca8a04', borderRadius: '12px', padding: '14px 18px' }}>
                <div style={{ fontSize: '12px', color: '#a16207', fontWeight: '700' }}>
                  {isMr ? 'माहिती / भेट आवश्यक (Needs Info)' : 'Needs Follow-Up'}
                </div>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#a16207', marginTop: '4px' }}>
                  {needsInfoCount}
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {['All', 'Supportive', 'Undecided', 'Needs Info'].map((filterVal) => (
                  <button
                    key={filterVal}
                    type="button"
                    onClick={() => setContactSentimentFilter(filterVal)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: contactSentimentFilter === filterVal ? '#0284c7' : '#f1f5f9',
                      color: contactSentimentFilter === filterVal ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {filterVal === 'All' ? (isMr ? 'सर्व मतदार' : 'All Voters') : filterVal === 'Supportive' ? (isMr ? '🟢 अनुकूल' : '🟢 Supportive') : filterVal === 'Undecided' ? (isMr ? '⚪ अनिर्णित' : '⚪ Undecided') : (isMr ? '🟡 माहिती आवश्यक' : '🟡 Needs Info')}
                  </button>
                ))}
              </div>

              <div className="worker-filter-input-wrap">
                <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder={isMr ? "नाव, फोन किंवा प्रभाग शोधा..." : "Search voters by name, phone, or ward..."}
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '7px 24px 7px 30px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
                {contactSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setContactSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Table Container */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{isMr ? 'मतदाराचे नाव' : 'Voter / Citizen Name'}</th>
                      <th>{isMr ? 'मोबाईल नंबर' : 'Mobile Number'}</th>
                      <th>{isMr ? 'बूथ / प्रभाग' : 'Booth / Ward'}</th>
                      <th>{isMr ? 'राजकीय कल / स्थिती' : 'Political Sentiment'}</th>
                      <th style={{ textAlign: 'right' }}>{isMr ? 'कृती' : 'Actions'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact, i) => (
                        <tr key={contact.id || i}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem' }}>
                                {contact.name.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{contact.name}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {contact.contacted ? (isMr ? '✓ संपर्क पूर्ण' : '✓ Contacted') : (isMr ? 'संपर्क बाकी' : 'Pending Contact')}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td style={{ color: '#334155', fontWeight: 600 }}>📞 {contact.phone}</td>
                          <td>
                            <span style={{ background: '#f8fafc', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 600 }}>
                              {contact.ward}
                            </span>
                          </td>
                          <td>
                            <span className={`badge-status ${contact.status === 'Supportive' ? 'status-completed' : contact.status === 'Undecided' ? 'status-pending' : 'status-progress'}`}>
                              {contact.status === 'Supportive' ? (isMr ? '🟢 अनुकूल' : '🟢 Supportive') : contact.status === 'Needs Info' ? (isMr ? '🟡 माहिती आवश्यक' : '🟡 Needs Info') : contact.status === 'Opposed' ? (isMr ? '🔴 प्रतिकूल' : '🔴 Opposed') : (isMr ? '⚪ अनिर्णित' : '⚪ Undecided')}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                              <button
                                className="icon-btn"
                                title={isMr ? "मतदार प्रत्यक्ष भेट नोंदवा" : "Record Doorstep Visit Log"}
                                style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}
                                onClick={() => {
                                  setActiveVisitContact(contact);
                                  setVisitFormData({
                                    name: contact.name,
                                    phone: contact.phone || '',
                                    status: contact.status || 'Supportive',
                                    notes: '',
                                    location: currentCoords?.address || '',
                                  });
                                }}
                              >
                                <CalendarCheck size={16} />
                              </button>
                              <button
                                className="icon-btn icon-btn-primary"
                                title={isMr ? "कॉल करा" : "Call Voter"}
                                onClick={() => alert(`Calling ${contact.name} (${contact.phone})...`)}
                              >
                                <PhoneCall size={16} color="var(--primary)" />
                              </button>
                              <button
                                className="icon-btn icon-btn-success"
                                title={isMr ? "व्हॉट्सॲप संवाद" : "WhatsApp Chat"}
                                onClick={() => alert(`Opening WhatsApp chat for ${contact.phone}...`)}
                              >
                                <MessageCircle size={16} color="var(--success)" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                          {isMr ? 'कोणताही मतदार संपर्क आढळला नाही.' : 'No voter contacts found matching criteria.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visit Log Recording Modal */}
            {activeVisitContact && (
              <div className="responsive-modal-overlay">
                <div className="responsive-modal-content" style={{ maxWidth: '500px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>🤝</span>
                      <span>{isMr ? 'मतदार प्रत्यक्ष भेट नोंद (Visit Log)' : 'Record Doorstep Voter Visit Log'}</span>
                    </h3>
                    <button type="button" onClick={() => setActiveVisitContact(null)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
                  </div>

                  <form onSubmit={handleSaveVisitLog} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                        {isMr ? 'मतदाराची माहिती' : 'Voter Information'}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                        {activeVisitContact.name} ({activeVisitContact.phone || (isMr ? 'फोन नाही' : 'No Phone')})
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                        {activeVisitContact.ward}
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        {isMr ? 'राजकीय कल / मतदाराची भावना *' : 'Voter Political Sentiment / Response *'}
                      </label>
                      <select
                        className="form-input"
                        value={visitFormData.status}
                        onChange={(e) => setVisitFormData({ ...visitFormData, status: e.target.value })}
                      >
                        <option value="Supportive">🟢 {isMr ? 'अनुकूल / पाठीराखा (Supportive)' : 'Supportive (In Favor)'}</option>
                        <option value="Undecided">⚪ {isMr ? 'अनिर्णित / विचार करत आहेत (Undecided)' : 'Undecided / Neutral'}</option>
                        <option value="Needs Info">🟡 {isMr ? 'माहिती / भेट आवश्यक (Needs Info)' : 'Needs Info / Follow-Up Visit'}</option>
                        <option value="Opposed">🔴 {isMr ? 'प्रतिकूल (Opposed)' : 'Opposed (Leaning Elsewhere)'}</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        {isMr ? 'भेटीतील चर्चेचे महत्त्वाचे मुद्दे / अभिप्राय *' : 'Discussion Notes & Feedback *'}
                      </label>
                      <textarea
                        rows="3"
                        required
                        className="form-input"
                        placeholder={isMr ? "उदा. पाणी पुरवठ्याची समस्या मांडली, उमेदवाराला मत देण्याचे आश्वासन दिले..." : "Enter key voter issues, discussions, commitments..."}
                        value={visitFormData.notes}
                        onChange={(e) => setVisitFormData({ ...visitFormData, notes: e.target.value })}
                      />
                    </div>

                    <div style={{ fontSize: '11.5px', color: '#0369a1', background: '#e0f2fe', padding: '10px 12px', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={15} color="#0284c7" />
                      <span>📍 {currentCoords?.address || (isMr ? 'सांगली प्रभाग (GPS स्थान आपोआप जोडले जाईल)' : 'GPS Coordinates will be tagged automatically')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                      <button type="button" className="btn-outline" onClick={() => setActiveVisitContact(null)}>
                        {t('cancel')}
                      </button>
                      <button type="submit" className="btn-success" style={{ fontWeight: 750, padding: '8px 20px' }}>
                        ✓ {isMr ? 'भेट जतन करा' : 'Save Visit Log'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        );
      })()}

      {contactTab === 'meetings' && (
        <div className="card">
          <div className="card-header">
            <div>
              <h2 className="card-title">
                {isSchedulingMeeting ? (isMr ? 'नवीन बैठक निश्चित करा' : 'Schedule New Campaign Meeting') : (isMr ? 'आगामी बैठका व संवाद' : 'Upcoming Campaign Meetings')}
              </h2>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {isMr ? 'अधिकारी व मतदार बैठकांचे नियोजन करा.' : 'Plan, coordinate, and review local booth gathering sessions.'}
              </div>
            </div>
            {!isSchedulingMeeting && (
              <button className="btn-primary" onClick={() => setIsSchedulingMeeting(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Plus size={16} />
                <span>{isMr ? '+ नवीन बैठक निश्चित करा' : '+ Schedule Meeting'}</span>
              </button>
            )}
          </div>

          {isSchedulingMeeting ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '650px', marginTop: '10px' }}>
              <div className="info-group">
                <label className="info-label">{isMr ? 'बैठकीचा विषय *' : 'Meeting Title *'}</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={isMr ? "उदा. बूथ क्र. २ मतदार बैठक" : "e.g., Booth 2 Citizens Consultation"}
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                />
              </div>
              <div className="info-row">
                <div className="info-group">
                  <label className="info-label">{isMr ? 'तारीख व वेळ *' : 'Date & Time *'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isMr ? "उदा. उद्या, सायं ५:००" : "e.g., Tomorrow, 5:00 PM"}
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                  />
                </div>
                <div className="info-group">
                  <label className="info-label">{isMr ? 'बैठकीचा प्रकार' : 'Meeting Format'}</label>
                  <select className="form-input" value={newMeeting.type} onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value })}>
                    <option value="In-person">{isMr ? 'प्रत्यक्ष भेट (In-person)' : 'In-person Gathering'}</option>
                    <option value="Virtual">{isMr ? 'व्हर्च्युअल / ऑनलाइन (Virtual)' : 'Virtual / Video Call'}</option>
                  </select>
                </div>
              </div>
              <div className="info-row">
                <div className="info-group">
                  <label className="info-label">{isMr ? 'ठिकाण / पत्ता / लिंक' : 'Location or Meeting Link'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isMr ? "पत्ता किंवा Google Meet लिंक" : "Address or video link"}
                    value={newMeeting.location}
                    onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                  />
                </div>
                <div className="info-group">
                  <label className="info-label">{isMr ? 'अपेक्षित उपस्थिती' : 'Expected Attendees'}</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={isMr ? "उदा. १५ मतदार" : "e.g., 15 Citizens"}
                    value={newMeeting.attendees}
                    onChange={(e) => setNewMeeting({ ...newMeeting, attendees: e.target.value })}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button className="btn-outline" onClick={() => setIsSchedulingMeeting(false)}>
                  {t('cancel')}
                </button>
                <button className="btn-success" onClick={handleScheduleMeeting}>
                  ✓ {isMr ? 'बैठक सेव्ह करा' : 'Save Meeting'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.25rem', marginTop: '12px' }}>
              {meetingsList.map((meeting, i) => (
                <div key={i} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', background: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ padding: '8px', backgroundColor: meeting.type === 'Virtual' ? '#E0E7FF' : '#FEF3C7', color: meeting.type === 'Virtual' ? '#2563eb' : '#d97706', borderRadius: '8px' }}>
                      {meeting.type === 'Virtual' ? <Video size={20} /> : <Users size={20} />}
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569', backgroundColor: '#f1f5f9', padding: '3px 8px', borderRadius: '9999px' }}>
                      {meeting.type}
                    </span>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>{meeting.title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12.5px', marginBottom: '4px' }}>
                      <Clock size={14} color="#0284c7" /> {meeting.time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b', fontSize: '12.5px' }}>
                      <MapPin size={14} color="#ea580c" /> {meeting.location}
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>👥 {meeting.attendees}</span>
                    <span style={{ color: '#0284c7', fontWeight: 700, fontSize: '12px' }}>
                      {isMr ? 'नियोजित' : 'Scheduled'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
