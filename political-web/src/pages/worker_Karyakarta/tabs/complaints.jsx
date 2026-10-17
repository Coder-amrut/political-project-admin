import React from 'react';
import {
  AlertCircle,
  Plus,
  Search,
  MessageCircle,
  AlertTriangle,
  MapPin
} from 'lucide-react';

export default function ComplaintsTab({
  isMr,
  t,
  complaintsData = [],
  complaintFilter = 'All',
  setComplaintFilter,
  complaintSearchQuery = '',
  setComplaintSearchQuery,
  handleUpdateComplaintStatus,
  isAddingComplaint,
  setIsAddingComplaint,
  complaintFormData,
  setComplaintFormData,
  checkDuplicateField,
  complaintDuplicateWarning,
  setComplaintDuplicateWarning,
  handleComplaintSubmit,
  currentCoords,
  submittingComplaint,
}) {
  const filteredComplaints = complaintsData.filter((c) => {
    const matchesStatus = complaintFilter === 'All' || c.status === complaintFilter;
    if (!matchesStatus) return false;
    if (!complaintSearchQuery.trim()) return true;
    const q = complaintSearchQuery.toLowerCase();
    return (
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.category && c.category.toLowerCase().includes(q)) ||
      (c.complaint_code && c.complaint_code.toLowerCase().includes(q)) ||
      (c.desc && c.desc.toLowerCase().includes(q))
    );
  });

  const totalCount = complaintsData.length;
  const pendingCount = complaintsData.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaintsData.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaintsData.filter((c) => c.status === 'Resolved' || c.status === 'Action Taken').length;

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '2rem' }}>
      {/* Header */}
      <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={28} color="#ea580c" />
            <span>{isMr ? 'नागरिकांच्या समस्या व विनंत्या' : 'Citizen Grievances & Service Requests'}</span>
          </h1>
          <div className="page-subtitle">
            {isMr ? 'प्रभागातील नागरिकांनी मांडलेल्या समस्यांची नोंद करा, फोटो जोडा आणि जलद निवारणाचा पाठपुरावा करा.' : 'Register citizen civic issues, capture geotagged field photos, and monitor fast resolution.'}
          </div>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsAddingComplaint(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', fontWeight: 750, fontSize: '13px' }}
        >
          <Plus size={18} />
          <span>{isMr ? '+ नवीन तक्रार नोंदवा' : '+ Register New Grievance'}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1.5px solid #e2e8f0', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'All', label: isMr ? 'सर्व समस्या' : 'All Grievances', count: totalCount },
            { key: 'Pending', label: isMr ? '⏳ प्रलंबित' : '⏳ Pending', count: pendingCount },
            { key: 'In Progress', label: isMr ? '🔄 कार्यवाही सुरू' : '🔄 In Progress', count: inProgressCount },
            { key: 'Resolved', label: isMr ? '✓ सोडवलेल्या' : '✓ Resolved', count: resolvedCount },
          ].map((st) => (
            <button
              key={st.key}
              type="button"
              onClick={() => setComplaintFilter(st.key)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: complaintFilter === st.key ? '#ea580c' : '#f1f5f9',
                color: complaintFilter === st.key ? '#ffffff' : '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{st.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  padding: '1px 6px',
                  borderRadius: '6px',
                  background: complaintFilter === st.key ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  color: complaintFilter === st.key ? '#ffffff' : '#475569',
                  fontWeight: 800,
                }}
              >
                {st.count}
              </span>
            </button>
          ))}
        </div>

        <div className="worker-filter-input-wrap">
          <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder={isMr ? "नागरिकाचे नाव, फोन किंवा विषय शोधा..." : "Search by code, citizen name, phone, or issue..."}
            value={complaintSearchQuery}
            onChange={(e) => setComplaintSearchQuery(e.target.value)}
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
          {complaintSearchQuery && (
            <button
              type="button"
              onClick={() => setComplaintSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '12px' }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Complaints Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{isMr ? 'तक्रार क्र.' : 'Grievance Code'}</th>
                <th>{isMr ? 'नागरिकाचे नाव व फोन' : 'Citizen Name & Contact'}</th>
                <th>{isMr ? 'समस्येचा वर्ग' : 'Issue Category'}</th>
                <th>{isMr ? 'तपशील व स्थान' : 'Description & Location'}</th>
                <th>{isMr ? 'नोंद तारीख' : 'Reported Date'}</th>
                <th>{isMr ? 'स्थिती' : 'Resolution Status'}</th>
                <th style={{ textAlign: 'right' }}>{isMr ? 'कृती' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c) => (
                  <tr key={c.id || c.complaint_code}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 800, color: '#0f172a', fontSize: '12px', background: '#f1f5f9', padding: '3px 7px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
                        {c.complaint_code || `GRV-${c.id}`}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{c.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>📞 {c.phone || '-'}</div>
                    </td>
                    <td>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe'
                      }}>
                        {c.category}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontSize: '12.5px', color: '#334155', lineHeight: 1.4 }}>{c.desc}</div>
                      {c.notes && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          📍 {c.notes}
                        </div>
                      )}
                    </td>
                    <td style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {c.date_reported || (isMr ? 'आज' : 'Today')}
                    </td>
                    <td>
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateComplaintStatus(c.id, e.target.value)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          border: c.status === 'Resolved' ? '1px solid #86efac' : c.status === 'In Progress' ? '1px solid #93c5fd' : '1px solid #fed7aa',
                          background: c.status === 'Resolved' ? '#f0fdf4' : c.status === 'In Progress' ? '#eff6ff' : '#fff7ed',
                          color: c.status === 'Resolved' ? '#15803d' : c.status === 'In Progress' ? '#1d4ed8' : '#c2410c'
                        }}
                      >
                        <option value="Pending">{isMr ? '⏳ प्रलंबित (Pending)' : '⏳ Pending'}</option>
                        <option value="In Progress">{isMr ? '🔄 कार्यवाही सुरू (In Progress)' : '🔄 In Progress'}</option>
                        <option value="Resolved">{isMr ? '✓ सोडवली (Resolved)' : '✓ Resolved'}</option>
                      </select>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {c.phone && (
                        <button
                          type="button"
                          className="icon-btn icon-btn-success"
                          title={isMr ? "व्हॉट्सॲप संवाद" : "WhatsApp Chat"}
                          onClick={() => alert(`Opening WhatsApp chat for ${c.phone}...`)}
                        >
                          <MessageCircle size={15} color="#16a34a" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    {isMr ? 'कोणतीही तक्रार आढळली नाही.' : 'No grievances found matching criteria.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Complaint Registration Modal matching screenshot */}
      {isAddingComplaint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddingComplaint(false);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '22px 24px',
              boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxSizing: 'border-box',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e2e8f0',
                paddingBottom: '12px',
                marginBottom: '16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    border: '2px solid #ea580c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ea580c',
                    fontWeight: 900,
                    fontSize: '14px',
                    lineHeight: 1,
                    flexShrink: 0,
                  }}
                >
                  !
                </div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: '17px',
                    fontWeight: 850,
                    color: '#0f172a',
                    lineHeight: 1.25,
                  }}
                >
                  {isMr ? 'नवीन समस्या किंवा विनंती नोंदवा' : 'Register New Grievance or Citizen Request'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingComplaint(false)}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  fontSize: '19px',
                  color: '#64748b',
                  padding: '2px 6px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Field 1: Citizen Full Name */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 750, color: '#1e293b', marginBottom: '4px' }}>
                  {isMr ? 'नागरिकाचे पूर्ण नाव *' : 'Citizen Full Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? "नागरिकाचे नाव प्रविष्ट करा" : "Enter citizen name"}
                  value={complaintFormData.name}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Field 2: Phone / Mobile Number */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 750, color: '#1e293b', marginBottom: '4px' }}>
                  {isMr ? 'फोन / मोबाईल नंबर' : 'Phone / Mobile Number'}
                </label>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="98XXXXXXXX"
                  value={complaintFormData.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setComplaintFormData({ ...complaintFormData, phone: val });
                    if (val.length >= 10) {
                      checkDuplicateField('phone', val, setComplaintDuplicateWarning);
                    } else {
                      setComplaintDuplicateWarning(null);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                {complaintDuplicateWarning && (
                  <div style={{ marginTop: '5px', padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>⚠️ {complaintDuplicateWarning}</span>
                  </div>
                )}
              </div>

              {/* Field 3: Grievance Category */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 750, color: '#1e293b', marginBottom: '4px' }}>
                  {isMr ? 'समस्येचा वर्ग *' : 'Grievance Category *'}
                </label>
                <select
                  value={complaintFormData.category}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="पाणी पुरवठा (Water Supply)">💧 {isMr ? 'पाणी पुरवठा व पिण्याचे पाणी' : 'Water Supply & Drinking Water'}</option>
                  <option value="रस्ते व गटार (Roads & Drainage)">🛣️ {isMr ? 'रस्ते व गटार' : 'Roads & Drainage'}</option>
                  <option value="वीज व पथदिवे (Street Lights)">💡 {isMr ? 'वीज व पथदिवे' : 'Street Lights & Electricity'}</option>
                  <option value="कचरा व स्वच्छता (Sanitation)">🧹 {isMr ? 'कचरा व स्वच्छता' : 'Garbage & Sanitation'}</option>
                  <option value="आरोग्य व रुग्णालय (Healthcare)">🏥 {isMr ? 'आरोग्य व वैद्यकीय मदत' : 'Healthcare & Hospital Aid'}</option>
                  <option value="शासकीय योजना / पेन्शन (Schemes)">📄 {isMr ? 'शासकीय योजना / पेन्शन' : 'Government Welfare Schemes / Pension'}</option>
                  <option value="इतर समस्या (Others)">📌 {isMr ? 'इतर नागरी समस्या' : 'Other Civic Grievances'}</option>
                </select>
              </div>

              {/* Field 4: Priority / Urgency Level */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 750, color: '#1e293b', marginBottom: '4px' }}>
                  {isMr ? 'तातडीची पातळी' : 'Priority / Urgency Level'}
                </label>
                <select
                  value={complaintFormData.urgency}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, urgency: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="मध्यम (Medium)">🟡 {isMr ? 'मध्यम (३ दिवसांत)' : 'Medium (Within 3 Days)'}</option>
                  <option value="तातडीचे (Urgent)">🔴 {isMr ? 'तातडीचे (२४ तासांत)' : 'Urgent (Within 24 Hours)'}</option>
                  <option value="सामान्य (Normal)">🟢 {isMr ? 'सामान्य पातळी' : 'Normal Priority'}</option>
                </select>
              </div>

              {/* Field 5: Detailed Description */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 750, color: '#1e293b', marginBottom: '4px' }}>
                  {isMr ? 'समस्येचे सविस्तर वर्णन *' : 'Detailed Description *'}
                </label>
                <textarea
                  rows="3"
                  required
                  placeholder={isMr ? "समस्येचा तपशील, विशिष्ट गल्ली/रस्ता, महत्त्वाचे ठिकाण लिहा..." : "Describe the grievance details, specific street, landmark, and citizen"}
                  value={complaintFormData.desc}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, desc: e.target.value })}
                  style={{
                    width: '100%',
                    minHeight: '75px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '13px',
                    color: '#0f172a',
                    outline: 'none',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Field 6: Attach Field Photo or Document */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 750, color: '#1e293b', marginBottom: '4px' }}>
                  📷 {isMr ? 'समस्येचा फोटो / कागदपत्र जोडा' : 'Attach Field Photo or Document'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setComplaintFormData({ ...complaintFormData, photo: file.name });
                      }
                    }}
                    style={{
                      fontSize: '12px',
                      color: '#475569',
                      width: '100%',
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Attach</span>
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                  {isMr ? 'स्थळाचा फोटो, खराब भाग किंवा अर्जाचा फोटो जोडा.' : 'site photo, damaged spot, or application letter for quick resolution.'}
                </div>
              </div>

              {/* Field 7: GPS Location Strip */}
              <div
                style={{
                  background: '#e0f2fe',
                  border: '1px solid #bae6fd',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px',
                  color: '#0369a1',
                }}
              >
                <MapPin size={15} color="#0284c7" style={{ flexShrink: 0 }} />
                <span>
                  📍 {isMr ? 'GPS स्थान' : 'GPS Location'}: <strong>{currentCoords?.address || (isMr ? 'स्थान आपोआप टॅग होईल' : 'GPS will tag automatically on submission')}</strong>
                </span>
              </div>

              {/* Bottom Buttons Row */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsAddingComplaint(false)}
                  disabled={submittingComplaint}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '6px',
                    border: '1.5px solid #94a3b8',
                    background: '#f1f5f9',
                    color: '#1e293b',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: '95px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isMr ? 'रद्द करा (Cancel)' : 'Cancel'}
                </button>

                <button
                  type="submit"
                  disabled={submittingComplaint}
                  style={{
                    padding: '9px 24px',
                    borderRadius: '6px',
                    border: '1.5px solid #475569',
                    background: '#f1f5f9',
                    color: '#0f172a',
                    fontSize: '13.5px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>✓</span>
                  <span>
                    {submittingComplaint
                      ? (isMr ? 'नोंद होत आहे...' : 'Registering...')
                      : (isMr ? 'तक्रार नोंदवा (Register Grievance)' : 'Register Grievance')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
