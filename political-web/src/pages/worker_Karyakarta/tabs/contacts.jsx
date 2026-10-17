import React, { useState } from 'react';
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
  Clock,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
  LayoutGrid,
  List,
  Phone,
  UserCheck
} from 'lucide-react';

export default function ContactsTab({
  isMr,
  t,
  votersList = [],
  meetingsList = [],
  contactTab = 'contacts',
  setContactTab,
  contactSentimentFilter,
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
  const [selectedContactForOptions, setSelectedContactForOptions] = useState(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' (default modern) or 'table'
  const [contactStatusFilter, setContactStatusFilter] = useState('All'); // 'All' | 'Contacted' | 'Pending'

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
            {isMr ? 'मतदार संपर्क यादी, थेट फोन/व्हॉट्सॲप संवाद आणि मोहिमेच्या बैठकांचे नियोजन.' : 'Voter directory, direct phone & WhatsApp communication, and campaign meeting coordination.'}
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
          if (contactStatusFilter === 'Contacted' && !contact.contacted) return false;
          if (contactStatusFilter === 'Pending' && contact.contacted) return false;
          if (!contactSearchQuery.trim()) return true;
          const q = contactSearchQuery.toLowerCase();
          return (
            (contact.name && contact.name.toLowerCase().includes(q)) ||
            (contact.phone && contact.phone.includes(q)) ||
            (contact.ward && contact.ward.toLowerCase().includes(q))
          );
        });

        return (
          <>
            {/* Filter, Search Bar, and View Mode Switcher */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '14px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                {[
                  { key: 'All', label: isMr ? 'सर्व मतदार' : 'All Voters' },
                  { key: 'Contacted', label: isMr ? '✓ संपर्क झालेले' : '✓ Contacted' },
                  { key: 'Pending', label: isMr ? '⏳ संपर्क बाकी' : '⏳ Pending' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setContactStatusFilter(item.key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: 'none',
                      background: contactStatusFilter === item.key ? '#0284c7' : '#f1f5f9',
                      color: contactStatusFilter === item.key ? '#ffffff' : '#475569',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {/* Search Input */}
                <div className="worker-filter-input-wrap" style={{ position: 'relative', minWidth: '220px' }}>
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder={isMr ? "नाव, फोन किंवा प्रभाग शोधा..." : "Search voters by name, phone..."}
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

                {/* View Switcher: Cards vs Table */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f1f5f9', padding: '3px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <button
                    type="button"
                    onClick={() => setViewMode('cards')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: viewMode === 'cards' ? '#ffffff' : 'transparent',
                      color: viewMode === 'cards' ? '#0284c7' : '#64748b',
                      fontWeight: 750,
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      boxShadow: viewMode === 'cards' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={isMr ? 'कार्ड व्ह्यू' : 'Cards View'}
                  >
                    <LayoutGrid size={13} />
                    <span>{isMr ? 'कार्ड' : 'Cards'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('table')}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      background: viewMode === 'table' ? '#ffffff' : 'transparent',
                      color: viewMode === 'table' ? '#0284c7' : '#64748b',
                      fontWeight: 750,
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      boxShadow: viewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                    title={isMr ? 'टेबल व्ह्यू' : 'Table View'}
                  >
                    <List size={13} />
                    <span>{isMr ? 'टेबल' : 'Table'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 1. CARDS VIEW (CLEAN, SPACIOUS, NO OVERLAPPING COLUMNS) */}
            {viewMode === 'cards' && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '14px' }}>
                {filteredContacts.length > 0 ? (
                  filteredContacts.map((contact, i) => (
                    <div
                      key={contact.id || i}
                      style={{
                        background: '#ffffff',
                        border: '1.5px solid #e2e8f0',
                        borderRadius: '16px',
                        padding: '16px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {/* Top Row: Avatar + Name + Contact Status Tag */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '42px',
                              height: '42px',
                              borderRadius: '50%',
                              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                              color: '#1d4ed8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 800,
                              fontSize: '1rem',
                              border: '1.5px solid #bfdbfe',
                              flexShrink: 0
                            }}
                          >
                            {contact.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 850, fontSize: '15px', color: '#0f172a', lineHeight: 1.2 }}>
                              {contact.name}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                              <span style={{ background: '#f8fafc', padding: '2px 8px', borderRadius: '6px', fontSize: '11px', color: '#475569', fontWeight: 650, border: '1px solid #e2e8f0' }}>
                                📍 {contact.ward}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Contact Status Badge */}
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '11px',
                            fontWeight: 750,
                            background: contact.contacted ? '#ecfdf5' : '#fff7ed',
                            color: contact.contacted ? '#15803d' : '#c2410c',
                            border: contact.contacted ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          {contact.contacted ? (isMr ? '✓ संपर्क पूर्ण' : '✓ Contacted') : (isMr ? '⏳ संपर्क बाकी' : '⏳ Pending')}
                        </span>
                      </div>

                      {/* Middle Details: Mobile Phone with Clickable Call */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                        <a
                          href={`tel:${contact.phone}`}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284c7', fontWeight: 750, fontSize: '13.5px', textDecoration: 'none' }}
                          title={isMr ? "कॉल करा" : "Call voter"}
                        >
                          <PhoneCall size={15} color="#0284c7" />
                          <span>{contact.phone}</span>
                        </a>

                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                          {isMr ? 'थेट संपर्क' : 'Direct Line'}
                        </span>
                      </div>

                      {/* Bottom Action: Big Contact Options Trigger */}
                      <button
                        type="button"
                        onClick={() => setSelectedContactForOptions(contact)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          padding: '10px 14px',
                          background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '10px',
                          fontSize: '13px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <PhoneCall size={15} />
                        <span>{isMr ? 'संपर्क पर्याय (Contact Options)' : 'Contact Options'}</span>
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
                    {isMr ? 'कोणताही मतदार संपर्क आढळला नाही.' : 'No voter contacts found matching criteria.'}
                  </div>
                )}
              </div>
            )}

            {/* 2. TABLE VIEW (CLEAN, PROPER MIN-WIDTH, NO OVERLAPPING COLUMNS) */}
            {viewMode === 'table' && (
              <div className="card" style={{ padding: 0, overflow: 'hidden', border: '1.5px solid #e2e8f0', borderRadius: '14px' }}>
                <div style={{ overflowX: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1.5px solid #e2e8f0' }}>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          {isMr ? 'मतदाराचे नाव' : 'Voter / Citizen Name'}
                        </th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          {isMr ? 'मोबाईल नंबर' : 'Mobile Number'}
                        </th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          {isMr ? 'बूथ / प्रभाग' : 'Booth / Ward'}
                        </th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase' }}>
                          {isMr ? 'संपर्क स्थिती' : 'Contact Status'}
                        </th>
                        <th style={{ padding: '12px 16px', fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>
                          {isMr ? 'संपर्क पर्याय' : 'Contact Action'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContacts.length > 0 ? (
                        filteredContacts.map((contact, i) => (
                          <tr key={contact.id || i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.85rem', border: '1px solid #bfdbfe' }}>
                                  {contact.name.charAt(0)}
                                </div>
                                <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '13.5px' }}>{contact.name}</div>
                              </div>
                            </td>
                            <td style={{ padding: '12px 16px', color: '#0284c7', fontWeight: 700, fontSize: '13px', whiteSpace: 'nowrap' }}>
                              <a href={`tel:${contact.phone}`} style={{ color: '#0284c7', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <PhoneCall size={14} />
                                <span>{contact.phone}</span>
                              </a>
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '6px', fontSize: '11.5px', border: '1px solid #e2e8f0', color: '#475569', fontWeight: 650 }}>
                                📍 {contact.ward}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
                              <span
                                style={{
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '11.5px',
                                  fontWeight: 750,
                                  background: contact.contacted ? '#ecfdf5' : '#fff7ed',
                                  color: contact.contacted ? '#15803d' : '#c2410c',
                                  border: contact.contacted ? '1px solid #bbf7d0' : '1px solid #fed7aa',
                                  whiteSpace: 'nowrap',
                                  display: 'inline-block'
                                }}
                              >
                                {contact.contacted ? (isMr ? '✓ संपर्क पूर्ण' : '✓ Contacted') : (isMr ? '⏳ संपर्क बाकी' : '⏳ Pending')}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                onClick={() => setSelectedContactForOptions(contact)}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '7px 14px',
                                  background: '#0284c7',
                                  color: '#ffffff',
                                  border: 'none',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 750,
                                  cursor: 'pointer',
                                  boxShadow: '0 2px 4px rgba(2, 132, 199, 0.2)'
                                }}
                              >
                                <PhoneCall size={13} />
                                <span>{isMr ? 'संपर्क पर्याय' : 'Contact Options'}</span>
                                <ChevronDown size={12} />
                              </button>
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
            )}

            {/* 3. DEDICATED "CONTACT OPTIONS" MODAL (POPUP WITH ALL OPTIONS) */}
            {selectedContactForOptions && (
              <div className="responsive-modal-overlay" style={{ zIndex: 1100 }}>
                <div className="responsive-modal-content" style={{ maxWidth: '440px', padding: '20px', borderRadius: '20px' }}>
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', border: '1.5px solid #bfdbfe' }}>
                        {selectedContactForOptions.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 850, color: '#0f172a' }}>
                          {selectedContactForOptions.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>📍 {selectedContactForOptions.ward}</span>
                          <span>•</span>
                          <span style={{ fontWeight: 700, color: '#0284c7' }}>📞 {selectedContactForOptions.phone}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedContactForOptions(null)}
                      style={{ border: 'none', background: '#f1f5f9', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', color: '#64748b' }}
                    >
                      ✕
                    </button>
                  </div>

                  <div style={{ fontSize: '12px', fontWeight: 750, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: '12px' }}>
                    {isMr ? 'उपलब्ध संपर्क पर्याय (Choose Contact Option):' : 'Available Contact Actions:'}
                  </div>

                  {/* All Contact Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Option 1: Direct Phone Call */}
                    <a
                      href={`tel:${selectedContactForOptions.phone}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        background: '#ecfdf5',
                        border: '1.5px solid #a7f3d0',
                        color: '#065f46',
                        textDecoration: 'none',
                        fontWeight: 750,
                        fontSize: '13.5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
                          <PhoneCall size={18} />
                        </div>
                        <div>
                          <div>{isMr ? 'फोन कॉल' : ' Calling'}</div>
                          <div style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>{selectedContactForOptions.phone}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', background: '#059669', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontWeight: 750 }}>
                        {isMr ? 'कॉल' : 'Call'}
                      </span>
                    </a>

                    {/* Option 2: WhatsApp Chat */}
                    <a
                      href={`https://wa.me/91${(selectedContactForOptions.phone || '').replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '13px 16px',
                        borderRadius: '12px',
                        background: '#f0fdf4',
                        border: '1.5px solid #86efac',
                        color: '#14532d',
                        textDecoration: 'none',
                        fontWeight: 750,
                        fontSize: '13.5px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                          <MessageCircle size={18} />
                        </div>
                        <div>
                          <div>{isMr ? 'व्हॉट्सॲप संवाद' : 'WhatsApp Message'}</div>
                          <div style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: 600 }}>{isMr ? 'थेट संदेश पाठवा' : 'Send WhatsApp Message'}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '12px', background: '#16a34a', color: '#fff', padding: '4px 10px', borderRadius: '8px', fontWeight: 750 }}>
                        WhatsApp
                      </span>
                    </a>


                    {/* Option 6: Copy Phone Number */}
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedContactForOptions.phone) {
                          navigator.clipboard.writeText(selectedContactForOptions.phone);
                          setCopiedPhone(true);
                          setTimeout(() => setCopiedPhone(false), 2000);
                        }
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        padding: '10px',
                        borderRadius: '10px',
                        background: copiedPhone ? '#dcfce7' : '#f1f5f9',
                        border: copiedPhone ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                        color: copiedPhone ? '#15803d' : '#475569',
                        fontSize: '12.5px',
                        fontWeight: 750,
                        cursor: 'pointer',
                        marginTop: '4px'
                      }}
                    >
                      {copiedPhone ? <Check size={16} /> : <Copy size={16} />}
                      <span>{copiedPhone ? (isMr ? '✓ नंबर कॉपी झाला!' : '✓ Number Copied!') : (isMr ? 'मोबाईल नंबर कॉपी करा' : 'Copy Mobile Number')}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

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
