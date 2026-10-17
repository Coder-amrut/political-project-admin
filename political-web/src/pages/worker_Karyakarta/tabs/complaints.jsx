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

      {/* Quick Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderTop: '3.5px solid #64748b', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
            {isMr ? 'एकूण समस्या (Total)' : 'Total Grievances Logged'}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{totalCount}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #fed7aa', borderTop: '3.5px solid #ea580c', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', color: '#c2410c', fontWeight: '700' }}>
            {isMr ? 'प्रलंबित समस्या (Pending)' : 'Pending Resolution'}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#c2410c', marginTop: '4px' }}>{pendingCount}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bfdbfe', borderTop: '3.5px solid #2563eb', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', color: '#1d4ed8', fontWeight: '700' }}>
            {isMr ? 'कार्यवाही सुरू (In Progress)' : 'Under Action (In Progress)'}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#1d4ed8', marginTop: '4px' }}>{inProgressCount}</div>
        </div>

        <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderTop: '3.5px solid #16a34a', borderRadius: '12px', padding: '14px 18px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '700' }}>
            {isMr ? 'सोडवलेल्या समस्या (Resolved)' : 'Resolved & Closed'}
          </div>
          <div style={{ fontSize: '26px', fontWeight: '900', color: '#15803d', marginTop: '4px' }}>{resolvedCount}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', background: '#ffffff', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Pending', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setComplaintFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: 'none',
                background: complaintFilter === st ? '#ea580c' : '#f1f5f9',
                color: complaintFilter === st ? '#ffffff' : '#475569',
                transition: 'all 0.15s ease'
              }}
            >
              {st === 'All' ? (isMr ? 'सर्व समस्या' : 'All Grievances') : st === 'Pending' ? (isMr ? '⏳ प्रलंबित' : '⏳ Pending') : st === 'In Progress' ? (isMr ? '🔄 कार्यवाही सुरू' : '🔄 In Progress') : (isMr ? '✓ सोडवलेल्या' : '✓ Resolved')}
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

      {/* New Complaint Registration Modal with Photo & GPS */}
      {isAddingComplaint && (
        <div className="responsive-modal-overlay">
          <div className="responsive-modal-content" style={{ maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={22} color="#ea580c" />
                <span>{isMr ? 'नवीन नागरिक समस्या / विनंती नोंदवा' : 'Register New Grievance or Citizen Request'}</span>
              </h3>
              <button type="button" onClick={() => setIsAddingComplaint(false)} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '18px', color: '#94a3b8' }}>✕</button>
            </div>

            <form onSubmit={handleComplaintSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isMr ? 'नागरिकाचे पूर्ण नाव *' : 'Citizen Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder={isMr ? "उदा. रमेश बापू पाटील" : "Enter citizen name"}
                    value={complaintFormData.name}
                    onChange={(e) => setComplaintFormData({ ...complaintFormData, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isMr ? 'मोबाईल नंबर' : 'Phone / Mobile Number'}
                  </label>
                  <input
                    type="tel"
                    maxLength="10"
                    className="form-input"
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
                  />
                  {complaintDuplicateWarning && (
                    <div style={{ marginTop: '5px', padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                      <span>⚠️ {complaintDuplicateWarning}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isMr ? 'समस्येचा वर्ग (Category) *' : 'Grievance Category *'}
                  </label>
                  <select
                    className="form-input"
                    value={complaintFormData.category}
                    onChange={(e) => setComplaintFormData({ ...complaintFormData, category: e.target.value })}
                  >
                    <option value="पाणी पुरवठा (Water Supply)">💧 {isMr ? 'पाणी पुरवठा (Water Supply)' : 'Water Supply & Drinking Water'}</option>
                    <option value="रस्ते व गटार (Roads & Drainage)">🛣️ {isMr ? 'रस्ते व गटार (Roads & Drainage)' : 'Roads & Drainage'}</option>
                    <option value="वीज व पथदिवे (Street Lights)">💡 {isMr ? 'वीज व पथदिवे (Street Lights)' : 'Street Lights & Electricity'}</option>
                    <option value="कचरा व स्वच्छता (Sanitation)">🧹 {isMr ? 'कचरा व स्वच्छता (Sanitation)' : 'Garbage & Sanitation'}</option>
                    <option value="आरोग्य व रुग्णालय (Healthcare)">🏥 {isMr ? 'आरोग्य व रुग्णालय (Healthcare)' : 'Healthcare & Hospital Aid'}</option>
                    <option value="शासकीय योजना / पेन्शन (Schemes)">📄 {isMr ? 'शासकीय योजना / पेन्शन (Schemes)' : 'Government Welfare Schemes / Pension'}</option>
                    <option value="इतर समस्या (Others)">📌 {isMr ? 'इतर समस्या (Others)' : 'Other Civic Grievances'}</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    {isMr ? 'तातडीची पातळी (Urgency)' : 'Priority / Urgency Level'}
                  </label>
                  <select
                    className="form-input"
                    value={complaintFormData.urgency}
                    onChange={(e) => setComplaintFormData({ ...complaintFormData, urgency: e.target.value })}
                  >
                    <option value="तातडीचे (Urgent)">🔴 {isMr ? 'तातडीचे (Urgent - 24 hours)' : 'Urgent (Within 24 Hours)'}</option>
                    <option value="मध्यम (Medium)">🟡 {isMr ? 'मध्यम (Medium - 3 days)' : 'Medium (Within 3 Days)'}</option>
                    <option value="सामान्य (Normal)">🟢 {isMr ? 'सामान्य (Normal)' : 'Normal Priority'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  {isMr ? 'समस्येचे सविस्तर वर्णन *' : 'Detailed Description *'}
                </label>
                <textarea
                  rows="3"
                  required
                  className="form-input"
                  placeholder={isMr ? "समस्येचे सविस्तर कारण व मागणी येथे लिहा..." : "Describe the grievance details, specific street, landmark, and citizen request..."}
                  value={complaintFormData.desc}
                  onChange={(e) => setComplaintFormData({ ...complaintFormData, desc: e.target.value })}
                />
              </div>

              {/* Photo / Document Upload Section */}
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                  📷 {isMr ? 'समस्येचा फोटो / कागदपत्र जोडा' : 'Attach Field Photo or Document'}
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  className="form-input"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setComplaintFormData({ ...complaintFormData, photo: file.name });
                    }
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  {isMr ? 'खराब रस्ता, तुंबलेली गटार किंवा अर्जाचा फोटो जोडा.' : 'Attach site photo, damaged spot, or application letter for quick resolution.'}
                </span>
              </div>

              {/* Auto Geotag Strip */}
              <div style={{ fontSize: '12px', color: '#0369a1', background: '#e0f2fe', padding: '10px 14px', borderRadius: '8px', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} color="#0284c7" />
                <span>
                  📍 {isMr ? 'GPS स्थान' : 'GPS Location'}: <strong>{currentCoords?.address || (isMr ? 'स्थान आपोआप टॅग होईल' : 'GPS will tag automatically on submission')}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsAddingComplaint(false)} disabled={submittingComplaint}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn-success" disabled={submittingComplaint} style={{ fontWeight: 750, padding: '9px 22px' }}>
                  {submittingComplaint ? (isMr ? 'नोंद होत आहे...' : 'Saving...') : (isMr ? '✓ तक्रार नोंदवा' : '✓ Register Grievance')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
