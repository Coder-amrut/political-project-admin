import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';
import ResponsiveSelect from '../../../components/ResponsiveSelect';

export default function Citizen360CRM({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [citizens, setCitizens] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [boothFilter, setBoothFilter] = useState('all');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Selected Citizen for 360 Drawer/Modal
  const [selectedCitizenId, setSelectedCitizenId] = useState(null);
  const [citizenDetail, setCitizenDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeProfileTab, setActiveProfileTab] = useState('info'); // 'info', 'interactions', 'issues', 'meetings'

  // Modals
  const [showAddCitizenModal, setShowAddCitizenModal] = useState(false);
  const [showAddInteractionModal, setShowAddInteractionModal] = useState(false);
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);

  // Booth Options with Add Custom Booth support
  const [availableBooths, setAvailableBooths] = useState([
    'बूथ क्र. १ (माधवनगर पूर्व)',
    'बूथ क्र. २ (माधवनगर पश्चिम)',
    'बूथ क्र. ३ (वसंत कॉलनी)',
    'बूथ क्र. ४ (गावभाग)',
    'बूथ क्र. ५ (कुपवाड)',
  ]);
  const [isAddingCustomBooth, setIsAddingCustomBooth] = useState(false);
  const [customBoothInput, setCustomBoothInput] = useState('');

  // Form states
  const [newCitizen, setNewCitizen] = useState({
    full_name_mr: '',
    phone: '',
    voter_id_number: '',
    age: 35,
    gender: 'male',
    occupation_mr: '',
    family_head_name: '',
    family_members_count: 4,
    address_mr: '',
    booth_no: 'बूथ क्र. १',
    voter_category: 'loyal_supporter',
    sentiment: 'anukul',
    assigned_worker_name: 'सचिन दत्तात्रय पाटील',
    notes_mr: '',
    initial_interaction: '',
  });

  const [newInteraction, setNewInteraction] = useState({
    interaction_type: 'home_visit',
    interaction_date: new Date().toISOString().split('T')[0],
    conducted_by: 'सचिन दत्तात्रय पाटील',
    summary_mr: '',
    outcome: 'positive',
    next_action_mr: '',
    follow_up_date: '',
  });

  const [newIssue, setNewIssue] = useState({
    title_mr: '',
    category: 'water_drainage',
    priority: 'high',
    description_mr: '',
    assigned_worker: 'सचिन दत्तात्रय पाटील',
    follow_up_date: '',
  });

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const fetchCitizens = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (boothFilter !== 'all') params.booth_no = boothFilter;
      if (sentimentFilter !== 'all') params.sentiment = sentimentFilter;
      if (categoryFilter !== 'all') params.voter_category = categoryFilter;

      const res = await netaApi.getCrmCitizens(params);
      if (res.success) {
        setCitizens(res.data);
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load CRM data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [search, boothFilter, sentimentFilter, categoryFilter]);

  const loadCitizenProfile = async (id) => {
    setSelectedCitizenId(id);
    setDetailLoading(true);
    try {
      const res = await netaApi.getCrmCitizen(id);
      if (res.success) {
        setCitizenDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to load citizen profile:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCreateCitizen = async (e) => {
    e.preventDefault();
    if (!newCitizen.full_name_mr.trim() || !newCitizen.address_mr.trim()) {
      alert(isMr ? 'कृपया नाव आणि पत्ता प्रविष्ट करा' : 'Please provide name and address');
      return;
    }
    try {
      const res = await netaApi.createCrmCitizen(newCitizen);
      if (res.success) {
        showToast(isMr ? 'नागरिक यशस्वीरित्या नोंदवला गेला!' : 'Citizen registered successfully!');
        setShowAddCitizenModal(false);
        setNewCitizen({
          full_name_mr: '',
          phone: '',
          voter_id_number: '',
          age: 35,
          gender: 'male',
          occupation_mr: '',
          family_head_name: '',
          family_members_count: 4,
          address_mr: '',
          booth_no: 'बूथ क्र. १',
          voter_category: 'loyal_supporter',
          sentiment: 'anukul',
          assigned_worker_name: 'सचिन दत्तात्रय पाटील',
          notes_mr: '',
          initial_interaction: '',
        });
        fetchCitizens();
      }
    } catch (err) {
      console.error('Create error:', err);
      alert(err?.response?.data?.message || 'नोंदणी करताना त्रुटी आली.');
    }
  };

  const handleAddInteraction = async (e) => {
    e.preventDefault();
    if (!newInteraction.summary_mr.trim()) return;
    try {
      const res = await netaApi.addCrmInteraction(selectedCitizenId, newInteraction);
      if (res.success) {
        showToast(isMr ? 'संपर्क नोंद जतन केली!' : 'Interaction logged successfully!');
        setShowAddInteractionModal(false);
        setNewInteraction({
          interaction_type: 'home_visit',
          interaction_date: new Date().toISOString().split('T')[0],
          conducted_by: 'सचिन दत्तात्रय पाटील',
          summary_mr: '',
          outcome: 'positive',
          next_action_mr: '',
          follow_up_date: '',
        });
        loadCitizenProfile(selectedCitizenId);
        fetchCitizens();
      }
    } catch (err) {
      console.error('Interaction save error:', err);
    }
  };

  const handleAddIssue = async (e) => {
    e.preventDefault();
    if (!newIssue.title_mr.trim() || !newIssue.description_mr.trim()) return;
    try {
      const res = await netaApi.addCrmIssue(selectedCitizenId, newIssue);
      if (res.success) {
        showToast(isMr ? 'नागरी समस्या / मागणी नोंदवली!' : 'Grievance ticket created!');
        setShowAddIssueModal(false);
        setNewIssue({
          title_mr: '',
          category: 'water_drainage',
          priority: 'high',
          description_mr: '',
          assigned_worker: 'सचिन दत्तात्रय पाटील',
          follow_up_date: '',
        });
        loadCitizenProfile(selectedCitizenId);
        fetchCitizens();
      }
    } catch (err) {
      console.error('Issue save error:', err);
    }
  };

  const handleUpdateIssueStatus = async (issueId, newStatus) => {
    try {
      const res = await netaApi.updateCrmIssueStatus(issueId, { status: newStatus });
      if (res.success) {
        showToast(isMr ? 'स्थिती अद्ययावत केली!' : 'Status updated!');
        loadCitizenProfile(selectedCitizenId);
        fetchCitizens();
      }
    } catch (err) {
      console.error('Failed to update issue status:', err);
    }
  };

  const getSentimentBadge = (sentiment) => {
    if (sentiment === 'anukul') {
      return (
        <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
          🟢 {isMr ? 'अनुकूल' : 'Supportive'}
        </span>
      );
    }
    if (sentiment === 'tatstha') {
      return (
        <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
          🟡 {isMr ? 'तटस्थ' : 'Neutral'}
        </span>
      );
    }
    return (
      <span style={{ background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca', padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700' }}>
        🔴 {isMr ? 'विरोधी' : 'Opposition'}
      </span>
    );
  };

  const getCategoryBadge = (cat) => {
    const map = {
      influencer: { label_mr: 'स्थानिक वजनदार व्यक्ती', label_en: 'Influencer', bg: '#f5f3ff', color: '#7c3aed' },
      loyal_supporter: { label_mr: 'निष्ठावान मतदार', label_en: 'Loyal Supporter', bg: '#eff6ff', color: '#1d4ed8' },
      youth: { label_mr: 'युवा / प्रथम मतदार', label_en: 'Youth Voter', bg: '#ecfeff', color: '#0891b2' },
      senior: { label_mr: 'ज्येष्ठ नागरिक', label_en: 'Senior Citizen', bg: '#fdf4ff', color: '#c026d3' },
      fence_sitter: { label_mr: 'संवाद आवश्यक', label_en: 'Requires Outreach', bg: '#fff7ed', color: '#c2410c' },
      general: { label_mr: 'सामान्य मतदार', label_en: 'General Citizen', bg: '#f1f5f9', color: '#475569' },
    };
    const c = map[cat] || map.general;
    return (
      <span style={{ background: c.bg, color: c.color, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '600' }}>
        {isMr ? c.label_mr : c.label_en}
      </span>
    );
  };

  const boothOptions = [
    { value: 'all', label: isMr ? 'सर्व बूथ' : 'All Booths' },
    { value: 'बूथ क्र. १', label: isMr ? 'बूथ क्र. १ (माधवनगर पूर्व)' : 'Booth No. 1 (Madhavnagar East)' },
    { value: 'बूथ क्र. २', label: isMr ? 'बूथ क्र. २ (माधवनगर पश्चिम)' : 'Booth No. 2 (Madhavnagar West)' },
    { value: 'बूथ क्र. ३', label: isMr ? 'बूथ क्र. ३ (वसंत कॉलनी)' : 'Booth No. 3 (Vasant Colony)' },
    { value: 'बूथ क्र. ४', label: isMr ? 'बूथ क्र. ४ (गावभाग)' : 'Booth No. 4 (Gavbhag)' },
    { value: 'बूथ क्र. ५', label: isMr ? 'बूथ क्र. ५ (कुपवाड)' : 'Booth No. 5 (Kupwad)' },
  ];

  const sentimentOptions = [
    { value: 'all', label: isMr ? 'सर्व राजकीय कल' : 'All Sentiments' },
    { value: 'anukul', label: `🟢 ${isMr ? 'अनुकूल' : 'Supportive'}` },
    { value: 'tatstha', label: `🟡 ${isMr ? 'तटस्थ' : 'Neutral'}` },
    { value: 'virodhak', label: `🔴 ${isMr ? 'विरोधी' : 'Opposition'}` },
  ];

  const categoryOptions = [
    { value: 'all', label: isMr ? 'सर्व प्रवर्ग' : 'All Categories' },
    { value: 'influencer', label: isMr ? 'स्थानिक वजनदार व्यक्ती' : 'Influencers' },
    { value: 'loyal_supporter', label: isMr ? 'निष्ठावान कार्यकर्ते व समर्थक' : 'Loyal Supporters' },
    { value: 'youth', label: isMr ? 'युवा व प्रथम मतदार' : 'Youth Voters' },
    { value: 'senior', label: isMr ? 'ज्येष्ठ नागरिक' : 'Senior Citizens' },
  ];

  return (
    <div className="crm-container" style={{ display: 'flex', flexDirection: 'column', gap: '22px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <style>{`
        /* Modal Overlay & Responsive Boxes */
        .crm-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.65);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(2px);
          box-sizing: border-box;
        }
        .crm-profile-modal-box {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 850px;
          max-height: 90vh;
          overflow-y: auto;
          overflow-x: hidden;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          position: relative;
          display: flex;
          flex-direction: column;
          box-sizing: border-box;
        }
        .crm-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
          background: #f8fafc;
          border-top-left-radius: 16px;
          border-top-right-radius: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          box-sizing: border-box;
          width: 100%;
        }
        .crm-avatar {
          width: 54px;
          height: 54px;
          border-radius: 27px;
          background: #dbeafe;
          color: #1d4ed8;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 800;
          border: 2px solid #bfdbfe;
          flex-shrink: 0;
        }
        .crm-profile-tabs {
          display: flex;
          border-bottom: 1px solid #e2e8f0;
          background: #ffffff;
          padding: 0 20px;
          overflow-x: auto;
          overflow-y: hidden;
          -webkit-overflow-scrolling: touch;
          white-space: nowrap;
          scrollbar-width: none;
          box-sizing: border-box;
          width: 100%;
        }
        .crm-profile-tabs::-webkit-scrollbar {
          display: none;
        }
        .crm-tab-btn {
          padding: 13px 18px;
          background: none;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          white-space: nowrap;
          flex-shrink: 0;
          user-select: none;
        }
        .crm-info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 14px;
          box-sizing: border-box;
          width: 100%;
        }
        .crm-info-col-span-2 {
          grid-column: span 2;
        }
        .crm-tab-body {
          padding: 22px 24px;
          flex: 1;
          box-sizing: border-box;
          width: 100%;
          overflow-x: hidden;
        }
        .crm-desktop-table {
          display: block;
        }
        .crm-mobile-cards {
          display: none;
        }
        .crm-form-modal-box {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 620px;
          max-height: 90vh;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
          box-sizing: border-box;
        }
        .crm-form-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
        }

        /* Mobile & Tablet Breakpoint (<= 768px) */
        @media (max-width: 768px) {
          .crm-modal-overlay {
            padding: 8px !important;
            align-items: center !important;
          }
          .crm-profile-modal-box {
            max-height: 95vh !important;
            border-radius: 14px !important;
            width: 100% !important;
            margin: 0 !important;
          }
          .crm-modal-header {
            padding: 14px 12px !important;
            gap: 10px !important;
          }
          .crm-avatar {
            width: 44px !important;
            height: 44px !important;
            border-radius: 22px !important;
            font-size: 18px !important;
          }
          .crm-modal-title {
            font-size: 16px !important;
            line-height: 1.3 !important;
          }
          .crm-profile-tabs {
            padding: 0 4px !important;
          }
          .crm-tab-btn {
            padding: 10px 12px !important;
            font-size: 12px !important;
            gap: 4px !important;
          }
          .crm-tab-body {
            padding: 14px 10px !important;
          }
          .crm-info-grid {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
          }
          .crm-info-col-span-2 {
            grid-column: span 1 !important;
          }
          .crm-desktop-table {
            display: none !important;
          }
          .crm-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            padding: 10px !important;
          }
          .crm-filter-bar {
            padding: 12px 10px !important;
            gap: 8px !important;
          }
          .crm-filter-bar > * {
            width: 100% !important;
            flex: 1 1 100% !important;
          }
          .crm-form-modal-box {
            padding: 16px 12px !important;
            max-height: 94vh !important;
            border-radius: 14px !important;
          }
          .crm-form-2col {
            grid-template-columns: 1fr !important;
            gap: 10px !important;
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

      {/* Filter & Search Bar (Streamlined - 'सर्व बूथ', 'सर्व राजकीय कल', 'सर्व प्रवर्ग' removed as requested) */}
      <div
        className="crm-filter-bar"
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '14px 18px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          boxSizing: 'border-box',
          width: '100%',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <span
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              fontSize: '15px',
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder={isMr ? 'नाव, फोन, EPIC मतदार ओळखपत्र किंवा पत्त्याने नागरिक शोधा...' : 'Search by name, phone, voter ID or address...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 38px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13.5px',
              outline: 'none',
              boxSizing: 'border-box',
              background: '#f8fafc',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#2563eb';
              e.target.style.background = '#ffffff';
              e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.background = '#f8fafc';
              e.target.style.boxShadow = 'none';
            }}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#94a3b8',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Citizens Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
              {isMr ? 'नागरिक व मतदार संपर्क यादी' : 'Citizen Contact Directory'} ({citizens.length})
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isMr ? '३६०° प्रोफाइल पाहण्यासाठी कोणत्याही नावावर क्लिक करा' : 'Click any voter to open 360° profile'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowAddCitizenModal(true)}
            className="btn-3d-blue"
          >
            <span style={{ fontSize: '15px', fontWeight: '900' }}>＋</span> {isMr ? 'नवीन नागरिक / मतदार जोडा' : 'Add New Citizen'}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '600' }}>
            ⏳ {isMr ? 'नागरिक डेटा लोड होत आहे...' : 'Loading citizen data...'}
          </div>
        ) : citizens.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            {isMr ? 'कोणतेही संपर्क सापडले नाहीत.' : 'No citizen contacts match filters.'}
          </div>
        ) : (
          <>
            {/* Desktop Table View (Screens > 640px) */}
            <div className="crm-desktop-table" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px' }}>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'नाव व ओळख' : 'Name & Identity'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'मोबाईल / संपर्क' : 'Mobile / Contact'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'बूथ व परिसर' : 'Booth & Area'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'जबाबदार कार्यकर्ता' : 'Assigned Worker'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>{isMr ? 'कृती' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {citizens.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => loadCitizenProfile(c.id)}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = '#ffffff')}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '700', color: '#0f172a' }}>{c.full_name_mr}</div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          EPIC: <span style={{ fontFamily: 'monospace', fontWeight: '600' }}>{c.voter_id_number || 'N/A'}</span> • {c.age} {isMr ? 'वर्षे' : 'yrs'}, {c.gender === 'male' ? (isMr ? 'पुरुष' : 'Male') : (isMr ? 'महिला' : 'Female')}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>📞 {c.phone || '-'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          {isMr ? `कुटुंब: ${c.family_members_count} सदस्य` : `Family: ${c.family_members_count} members`}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>{c.booth_no}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{c.village_mr}</div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#334155' }}>👤 {c.assigned_worker_name || (isMr ? 'नेमलेला नाही' : 'Unassigned')}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{c.assigned_worker_phone || ''}</div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            loadCitizenProfile(c.id);
                          }}
                          style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          {isMr ? '३६०° प्रोफाइल' : 'View 360°'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View (Screens <= 640px) */}
            <div className="crm-mobile-cards">
              {citizens.map((c) => (
                <div
                  key={c.id}
                  onClick={() => loadCitizenProfile(c.id)}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: '750', color: '#0f172a', fontSize: '14px' }}>{c.full_name_mr}</span>
                      {getSentimentBadge(c.sentiment)}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadCitizenProfile(c.id);
                      }}
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        border: '1px solid #bfdbfe',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      {isMr ? '३६०° प्रोफाइल' : '360°'}
                    </button>
                  </div>

                  <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                    EPIC: <span style={{ fontFamily: 'monospace', fontWeight: '600', color: '#1e293b' }}>{c.voter_id_number || 'N/A'}</span> • {c.age} {isMr ? 'वर्षे' : 'yrs'}, {c.gender === 'male' ? (isMr ? 'पुरुष' : 'Male') : (isMr ? 'महिला' : 'Female')}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '4px', borderTop: '1px solid #f8fafc' }}>
                    <a
                      href={c.phone ? `tel:${c.phone}` : undefined}
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      📞 {c.phone || (isMr ? 'फोन नाही' : 'No Phone')}
                    </a>
                    <span style={{ color: '#64748b' }}>
                      📍 {c.booth_no}
                    </span>
                  </div>

                  {c.assigned_worker_name && (
                    <div style={{ fontSize: '11.5px', color: '#475569', paddingTop: '2px' }}>
                      👤 {isMr ? 'कार्यकर्ता:' : 'Worker:'} <strong>{c.assigned_worker_name}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* CITIZEN 360° PROFILE MODAL / DRAWER */}
      {selectedCitizenId && (
        <div
          className="crm-modal-overlay"
          onClick={() => setSelectedCitizenId(null)}
        >
          <div
            className="crm-profile-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            {citizenDetail ? (
              <>
                <div className="crm-modal-header">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: 0, flex: 1 }}>
                    <div className="crm-avatar">
                      {citizenDetail.citizen.full_name_mr.charAt(0)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h2 className="crm-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a', wordBreak: 'break-word' }}>
                          {citizenDetail.citizen.full_name_mr}
                        </h2>
                        {getSentimentBadge(citizenDetail.citizen.sentiment)}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', wordBreak: 'break-word', lineHeight: 1.4 }}>
                        EPIC: <strong style={{ color: '#1e293b' }}>{citizenDetail.citizen.voter_id_number}</strong> •{' '}
                        {citizenDetail.citizen.booth_no} • {citizenDetail.citizen.village_mr}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                    {citizenDetail.citizen.phone && (
                      <a
                        href={`tel:${citizenDetail.citizen.phone}`}
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          padding: '7px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        📞 {isMr ? 'कॉल करा' : 'Call'}
                      </a>
                    )}
                    <button
                      onClick={() => setSelectedCitizenId(null)}
                      style={{
                        background: '#f1f5f9',
                        border: 'none',
                        color: '#64748b',
                        width: '32px',
                        height: '32px',
                        borderRadius: '16px',
                        fontSize: '16px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                      title={isMr ? 'बंद करा' : 'Close'}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Profile Tabs (Horizontally Scrollable on Mobile) */}
                <div className="crm-profile-tabs">
                  {[
                    { key: 'info', label: isMr ? 'मूलभूत माहिती व कुटुंब' : 'Basic Info & Family', icon: '👤' },
                    { key: 'interactions', label: isMr ? `संपर्क व भेटी इतिहास (${citizenDetail.interactions.length})` : `Interactions (${citizenDetail.interactions.length})`, icon: '📋' },
                    { key: 'issues', label: isMr ? `समस्या व मागण्या (${citizenDetail.issues.length})` : `Grievances (${citizenDetail.issues.length})`, icon: '⚠️' },
                    { key: 'meetings', label: isMr ? `सभा व मेळावे (${citizenDetail.meetings.length})` : `Meetings & Rallies (${citizenDetail.meetings.length})`, icon: '🎤' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      className="crm-tab-btn"
                      onClick={() => setActiveProfileTab(tab.key)}
                      style={{
                        borderBottom: activeProfileTab === tab.key ? '2px solid #1d4ed8' : '2px solid transparent',
                        color: activeProfileTab === tab.key ? '#1d4ed8' : '#64748b',
                        fontWeight: activeProfileTab === tab.key ? '700' : '600',
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="crm-tab-body">
                  {/* TAB 1: BASIC INFO */}
                  {activeProfileTab === 'info' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div className="crm-info-grid">
                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{isMr ? 'मोबाईल नंबर' : 'Mobile Number'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px', wordBreak: 'break-word' }}>
                            {citizenDetail.citizen.phone || (isMr ? 'नोंद नाही' : 'Not Recorded')}
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{isMr ? 'वय व लिंग' : 'Age & Gender'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px', wordBreak: 'break-word' }}>
                            {citizenDetail.citizen.age} {isMr ? 'वर्षे' : 'yrs'} • {citizenDetail.citizen.gender === 'male' ? (isMr ? 'पुरुष' : 'Male') : (isMr ? 'महिला' : 'Female')}
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{isMr ? 'व्यवसाय / संवर्ग' : 'Occupation / Category'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px', wordBreak: 'break-word' }}>
                            {citizenDetail.citizen.occupation_mr || (isMr ? 'नागरिक' : 'Citizen')}
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{isMr ? 'कुटुंब प्रमुख व सदस्य' : 'Family Head & Members'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px', wordBreak: 'break-word' }}>
                            {citizenDetail.citizen.family_head_name} ({citizenDetail.citizen.family_members_count} {isMr ? 'सदस्य' : 'members'})
                          </div>
                        </div>

                        <div className="crm-info-col-span-2" style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{isMr ? 'पत्ता व मतदारसंघ' : 'Address & Constituency'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#0f172a', marginTop: '2px', wordBreak: 'break-word', lineHeight: 1.4 }}>
                            📍 {citizenDetail.citizen.address_mr}, {citizenDetail.citizen.village_mr}, {citizenDetail.citizen.assembly_mr}
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{isMr ? 'जबाबदार कार्यकर्ता' : 'Assigned Worker'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', marginTop: '2px', wordBreak: 'break-word' }}>
                            👤 {citizenDetail.citizen.assigned_worker_name || (isMr ? 'नेमलेला नाही' : 'Unassigned')}
                          </div>
                        </div>

                        <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{isMr ? 'पुढील संपर्क तारीख' : 'Next Follow-up Date'}</span>
                          <div style={{ fontSize: '14px', fontWeight: '700', color: '#1d4ed8', marginTop: '2px', wordBreak: 'break-word' }}>
                            📅 {citizenDetail.citizen.follow_up_date || (isMr ? 'नियोजित नाही' : 'Not Scheduled')}
                          </div>
                        </div>
                      </div>

                      {/* Government Schemes Benefitted */}
                      <div>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '13px', fontWeight: '700', color: '#334155' }}>
                          {isMr ? '🎯 शासकीय योजनांचा लाभ' : '🎯 Government Scheme Benefits'}
                        </h4>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {citizenDetail.citizen.schemes_benefitted && citizenDetail.citizen.schemes_benefitted.length > 0 ? (
                            citizenDetail.citizen.schemes_benefitted.map((sc, i) => (
                              <span key={i} style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '5px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700' }}>
                                ✓ {sc}
                              </span>
                            ))
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '13px' }}>
                              {isMr ? 'सध्या कोणत्याही शासकीय योजनेचा थेट लाभ नोंदवलेला नाही.' : 'No direct government scheme benefits recorded currently.'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes */}
                      {citizenDetail.citizen.notes_mr && (
                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '14px' }}>
                          <span style={{ fontSize: '11px', color: '#b45309', fontWeight: '700' }}>{isMr ? '📌 विशेष राजकीय टिपणी' : '📌 Political Intelligence Note'}</span>
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#92400e' }}>{citizenDetail.citizen.notes_mr}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: INTERACTIONS */}
                  {activeProfileTab === 'interactions' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                          {isMr ? 'संपर्क व भेटींचा कालानुक्रम' : 'Interactions Timeline'}
                        </h4>
                        <button
                          onClick={() => setShowAddInteractionModal(true)}
                          style={{
                            background: '#1d4ed8',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          ➕ {isMr ? 'नवीन संपर्क नोंदवा' : 'Log Interaction'}
                        </button>
                      </div>

                      {citizenDetail.interactions.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                          {isMr ? 'अद्याप कोणताही संपर्क इतिहास नोंदवलेला नाही.' : 'No interaction history recorded yet.'}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {citizenDetail.interactions.map((int) => (
                            <div key={int.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                    {int.interaction_type === 'home_visit'
                                      ? (isMr ? '🏡 प्रत्यक्ष भेट' : '🏡 Home Visit')
                                      : int.interaction_type === 'phone_call'
                                      ? (isMr ? '📞 दूरध्वनी' : '📞 Phone Call')
                                      : (isMr ? '🏛️ कार्यालय भेट' : '🏛️ Office Visit')}
                                  </span>
                                  <strong style={{ fontSize: '13px', color: '#1e293b' }}>{int.conducted_by}</strong>
                                </div>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>📅 {int.interaction_date}</span>
                              </div>
                              <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#334155' }}>{int.summary_mr}</p>
                              {int.next_action_mr && (
                                <div style={{ marginTop: '6px', fontSize: '12px', color: '#1d4ed8', fontWeight: '600' }}>
                                  {isMr ? '👉 पुढील कृती:' : '👉 Next Action:'} {int.next_action_mr}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: ISSUES & GRIEVANCES */}
                  {activeProfileTab === 'issues' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                          {isMr ? 'नागरी समस्या व मागण्यांची नोंद' : 'Grievance Ledger'}
                        </h4>
                        <button
                          onClick={() => setShowAddIssueModal(true)}
                          style={{
                            background: '#dc2626',
                            color: '#ffffff',
                            border: 'none',
                            padding: '7px 14px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          ➕ {isMr ? 'नवीन तक्रार / मागणी नोंदवा' : 'Lodge Grievance'}
                        </button>
                      </div>

                      {citizenDetail.issues.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                          {isMr ? 'कोणतीही प्रलंबित तक्रार किंवा मागणी नाही.' : 'No pending complaints or requests.'}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {citizenDetail.issues.map((iss) => (
                            <div key={iss.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                                <div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: '700', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }}>
                                      {iss.tracking_no}
                                    </span>
                                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{iss.title_mr}</strong>
                                    <span
                                      style={{
                                        background: iss.priority === 'urgent' ? '#fef2f2' : '#eff6ff',
                                        color: iss.priority === 'urgent' ? '#dc2626' : '#2563eb',
                                        fontSize: '11px',
                                        fontWeight: '700',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                      }}
                                    >
                                      {iss.priority === 'urgent' ? (isMr ? '🚨 तातडीचे' : '🚨 Urgent') : (isMr ? 'उच्च प्राधान्य' : 'High Priority')}
                                    </span>
                                  </div>
                                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#475569' }}>{iss.description_mr}</p>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <select
                                    value={iss.status}
                                    onChange={(e) => handleUpdateIssueStatus(iss.id, e.target.value)}
                                    style={{
                                      padding: '5px 10px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      fontWeight: '700',
                                      border: '1px solid #cbd5e1',
                                      background: iss.status === 'resolved' ? '#ecfdf5' : iss.status === 'in_progress' ? '#eff6ff' : '#fef2f2',
                                      color: iss.status === 'resolved' ? '#059669' : iss.status === 'in_progress' ? '#1d4ed8' : '#b91c1c',
                                    }}
                                  >
                                    <option value="pending">{isMr ? '⏳ प्रलंबित' : '⏳ Pending'}</option>
                                    <option value="in_progress">{isMr ? '⚙️ प्रगतीपथावर' : '⚙️ In Progress'}</option>
                                    <option value="resolved">{isMr ? '✓ सोडवली' : '✓ Resolved'}</option>
                                  </select>
                                </div>
                              </div>

                              {iss.resolution_notes_mr && (
                                <div style={{ marginTop: '10px', background: '#f0fdf4', padding: '8px 12px', borderRadius: '6px', border: '1px solid #bbf7d0', fontSize: '12px', color: '#166534' }}>
                                  {isMr ? '✓ निराकरण टिपणी:' : '✓ Resolution Note:'} {iss.resolution_notes_mr}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 4: MEETINGS ATTENDED */}
                  {activeProfileTab === 'meetings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                        {isMr ? 'नागरिकाने उपस्थित राहिलेल्या सभा व दौरे' : 'Townhalls & Rallies Attended'}
                      </h4>

                      {citizenDetail.meetings.length === 0 ? (
                        <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
                          {isMr ? 'कोणत्याही सभेची उपस्थिती नोंदवलेली नाही.' : 'No meeting attendance recorded.'}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {citizenDetail.meetings.map((m) => (
                            <div key={m.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <strong style={{ fontSize: '13px', color: '#1e293b' }}>🎤 {m.meeting_title_mr}</strong>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>📅 {m.meeting_date}</span>
                              </div>
                              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                                {isMr ? '📍 ठिकाण:' : '📍 Venue:'} {m.venue_mr}
                              </div>
                              {m.feedback_mr && (
                                <div style={{ fontSize: '12px', color: '#0f766e', marginTop: '6px', background: '#f0fdfa', padding: '6px 10px', borderRadius: '6px' }}>
                                  {isMr ? '💬 मत / अभिप्राय:' : '💬 Feedback:'} {m.feedback_mr}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : detailLoading ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
                ⏳ {isMr ? '३६०° प्रोफाइल माहिती लोड होत आहे...' : 'Loading full profile...'}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW CITIZEN */}
      {showAddCitizenModal && (
        <div
          className="crm-modal-overlay"
          onClick={() => setShowAddCitizenModal(false)}
        >
          <div
            className="crm-form-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                ➕ {isMr ? 'नवीन नागरिक / मतदार नोंदणी' : 'Add New Citizen Contact'}
              </h3>
              <button onClick={() => setShowAddCitizenModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCitizen} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'पूर्ण नाव *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. रमेश विठ्ठल पाटील' : 'e.g. Ramesh Vithal Patil'}
                  value={newCitizen.full_name_mr}
                  onChange={(e) => setNewCitizen({ ...newCitizen, full_name_mr: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="crm-form-2col">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'मोबाईल नंबर' : 'Mobile Number'}</label>
                  <input
                    type="text"
                    placeholder="98XXXXXXXX"
                    value={newCitizen.phone}
                    onChange={(e) => setNewCitizen({ ...newCitizen, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'EPIC मतदार ओळखपत्र क्र.' : 'EPIC Voter ID No.'}</label>
                  <input
                    type="text"
                    placeholder="MH/44/282/XXXXXX"
                    value={newCitizen.voter_id_number}
                    onChange={(e) => setNewCitizen({ ...newCitizen, voter_id_number: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div className="crm-form-2col">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'वय' : 'Age'}</label>
                  <input
                    type="number"
                    value={newCitizen.age}
                    onChange={(e) => setNewCitizen({ ...newCitizen, age: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'लिंग' : 'Gender'}</label>
                  <select
                    value={newCitizen.gender}
                    onChange={(e) => setNewCitizen({ ...newCitizen, gender: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="male">{isMr ? 'पुरुष' : 'Male'}</option>
                    <option value="female">{isMr ? 'महिला' : 'Female'}</option>
                    <option value="other">{isMr ? 'इतर' : 'Other'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'पत्ता *' : 'Address *'}</label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. घर क्र. ४५, गल्ली नं. २, सांगली' : 'e.g. House No. 45, Lane 2, Sangli'}
                  value={newCitizen.address_mr}
                  onChange={(e) => setNewCitizen({ ...newCitizen, address_mr: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="crm-form-2col">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>
                      {isMr ? 'बूथ क्रमांक / नाव' : 'Booth Number / Name'}
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAddingCustomBooth(!isAddingCustomBooth)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#2563eb',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        padding: '0 4px',
                        textDecoration: 'underline',
                      }}
                    >
                      {isAddingCustomBooth ? (isMr ? '✕ यादीतून निवडा' : '✕ Select from list') : (isMr ? '＋ नवीन बूथ जोडा' : '＋ Add Booth')}
                    </button>
                  </div>

                  {!isAddingCustomBooth ? (
                    <select
                      value={newCitizen.booth_no}
                      onChange={(e) => {
                        if (e.target.value === '__ADD_NEW__') {
                          setIsAddingCustomBooth(true);
                        } else {
                          setNewCitizen({ ...newCitizen, booth_no: e.target.value });
                        }
                      }}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box', background: '#fff' }}
                    >
                      {availableBooths.map((b) => (
                        <option key={b} value={b}>{b}</option>
                      ))}
                      <option value="__ADD_NEW__">＋ {isMr ? 'नवीन बूथ जोडा (Add New Booth)' : 'Add New Booth'}</option>
                    </select>
                  ) : (
                    <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                      <input
                        type="text"
                        placeholder={isMr ? 'नवीन बूथचे नाव किंवा क्रमांक...' : 'Enter new booth name / no...'}
                        value={customBoothInput}
                        onChange={(e) => setCustomBoothInput(e.target.value)}
                        style={{ flex: 1, padding: '9px 12px', borderRadius: '8px', border: '1.5px solid #2563eb', boxSizing: 'border-box', fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const val = customBoothInput.trim();
                          if (val) {
                            if (!availableBooths.includes(val)) {
                              setAvailableBooths([...availableBooths, val]);
                            }
                            setNewCitizen({ ...newCitizen, booth_no: val });
                            setCustomBoothInput('');
                            setIsAddingCustomBooth(false);
                          }
                        }}
                        style={{
                          background: '#2563eb',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          padding: '0 14px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                        }}
                      >
                        {isMr ? 'जोडा' : 'Add'}
                      </button>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'राजकीय कल' : 'Political Sentiment'}</label>
                  <select
                    value={newCitizen.sentiment}
                    onChange={(e) => setNewCitizen({ ...newCitizen, sentiment: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="anukul">🟢 {isMr ? 'अनुकूल' : 'Supportive'}</option>
                    <option value="tatstha">🟡 {isMr ? 'तटस्थ' : 'Neutral'}</option>
                    <option value="virodhak">🔴 {isMr ? 'विरोधी' : 'Opposition'}</option>
                  </select>
                </div>
              </div>

              <div className="crm-form-2col">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'मतदार प्रवर्ग' : 'Voter Category'}</label>
                  <select
                    value={newCitizen.voter_category}
                    onChange={(e) => setNewCitizen({ ...newCitizen, voter_category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box', background: '#fff' }}
                  >
                    <option value="loyal_supporter">{isMr ? 'निष्ठावान समर्थक' : 'Loyal Supporter'}</option>
                    <option value="influencer">{isMr ? 'स्थानिक वजनदार व्यक्ती' : 'Influencer'}</option>
                    <option value="youth">{isMr ? 'युवा / प्रथम मतदार' : 'Youth / First-time'}</option>
                    <option value="senior">{isMr ? 'ज्येष्ठ नागरिक' : 'Senior Citizen'}</option>
                    <option value="fence_sitter">{isMr ? 'संवाद आवश्यक' : 'Requires Outreach'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'जबाबदार कार्यकर्ता' : 'Assigned Worker'}</label>
                  <input
                    type="text"
                    value={newCitizen.assigned_worker_name}
                    onChange={(e) => setNewCitizen({ ...newCitizen, assigned_worker_name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'प्रथम संवादाची टिपणी' : 'Initial Interaction Note'}</label>
                <textarea
                  rows={2}
                  placeholder={isMr ? 'नागरिकाशी झालेल्या पहिल्या संवादाची नोंद...' : 'Record initial interaction notes...'}
                  value={newCitizen.initial_interaction}
                  onChange={(e) => setNewCitizen({ ...newCitizen, initial_interaction: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddCitizenModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}
                >
                  ✓ {isMr ? 'जतन करा' : 'Save Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD INTERACTION LOG */}
      {showAddInteractionModal && (
        <div
          className="crm-modal-overlay"
          onClick={() => setShowAddInteractionModal(false)}
        >
          <div
            className="crm-form-modal-box"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                📋 {isMr ? 'नवीन संपर्क नोंद' : 'Log New Interaction'}
              </h3>
              <button onClick={() => setShowAddInteractionModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddInteraction} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="crm-form-2col">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'संपर्क प्रकार' : 'Interaction Type'}</label>
                  <select
                    value={newInteraction.interaction_type}
                    onChange={(e) => setNewInteraction({ ...newInteraction, interaction_type: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="home_visit">🏡 {isMr ? 'प्रत्यक्ष भेट' : 'Home Visit'}</option>
                    <option value="phone_call">📞 {isMr ? 'दूरध्वनी' : 'Phone Call'}</option>
                    <option value="office_visit">🏛️ {isMr ? 'कार्यालय भेट' : 'Office Visit'}</option>
                    <option value="tea_discussion">☕ {isMr ? 'चहा चर्चा' : 'Informal Discussion'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'तारीख' : 'Date'}</label>
                  <input
                    type="date"
                    value={newInteraction.interaction_date}
                    onChange={(e) => setNewInteraction({ ...newInteraction, interaction_date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'संवाद सारांश *' : 'Discussion Summary *'}</label>
                <textarea
                  required
                  rows={3}
                  placeholder={isMr ? 'चर्चेचा तपशील व नागरिकांचा कल...' : 'Discussion details and citizen feedback...'}
                  value={newInteraction.summary_mr}
                  onChange={(e) => setNewInteraction({ ...newInteraction, summary_mr: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="crm-form-2col">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'निकाल' : 'Outcome'}</label>
                  <select
                    value={newInteraction.outcome}
                    onChange={(e) => setNewInteraction({ ...newInteraction, outcome: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="positive">🟢 {isMr ? 'सकारात्मक' : 'Positive'}</option>
                    <option value="neutral">🟡 {isMr ? 'तटस्थ' : 'Neutral'}</option>
                    <option value="negative">🔴 {isMr ? 'नकारात्मक' : 'Negative'}</option>
                    <option value="follow_up_required">⚠️ {isMr ? 'पुढील पाठपुरावा आवश्यक' : 'Follow-up Required'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'पुढील संपर्क तारीख' : 'Next Follow-up Date'}</label>
                  <input
                    type="date"
                    value={newInteraction.follow_up_date}
                    onChange={(e) => setNewInteraction({ ...newInteraction, follow_up_date: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddInteractionModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '12px', fontWeight: '700' }}
                >
                  ✓ {isMr ? 'जतन करा' : 'Save Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD GRIEVANCE / ISSUE */}
      {showAddIssueModal && (
        <div
          className="crm-modal-overlay"
          onClick={() => setShowAddIssueModal(false)}
        >
          <div
            className="crm-form-modal-box"
            style={{ maxWidth: '520px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                ⚠️ {isMr ? 'नवीन नागरी समस्या नोंद' : 'Lodge New Grievance'}
              </h3>
              <button onClick={() => setShowAddIssueModal(false)} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <form onSubmit={handleAddIssue} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'समस्येचे नाव / शीर्षक *' : 'Issue Title *'}</label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. गल्लीतील ड्रेनेज लाईन तुंबणे' : 'e.g. Drainage blockage in lane'}
                  value={newIssue.title_mr}
                  onChange={(e) => setNewIssue({ ...newIssue, title_mr: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div className="crm-form-2col">
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'प्रवर्ग (कॅटेगरी)' : 'Category'}</label>
                  <select
                    value={newIssue.category}
                    onChange={(e) => setNewIssue({ ...newIssue, category: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="water_drainage">{isMr ? 'पाणी व ड्रेनेज' : 'Water & Drainage'}</option>
                    <option value="roads">{isMr ? 'रस्ते व खड्डे' : 'Roads & Potholes'}</option>
                    <option value="street_lights">{isMr ? 'पथदिवे / विद्युत' : 'Street Lights & Electricity'}</option>
                    <option value="sanitation">{isMr ? 'कचरा व स्वच्छता' : 'Waste & Sanitation'}</option>
                    <option value="pension_ration">{isMr ? 'पेन्शन व रेशन' : 'Pension & Ration'}</option>
                    <option value="health">{isMr ? 'आरोग्य व दवाखाना' : 'Health & Clinic'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'प्राधान्य' : 'Priority'}</label>
                  <select
                    value={newIssue.priority}
                    onChange={(e) => setNewIssue({ ...newIssue, priority: e.target.value })}
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="urgent">🚨 {isMr ? 'तातडीचे' : 'Urgent'}</option>
                    <option value="high">{isMr ? 'उच्च प्राधान्य' : 'High Priority'}</option>
                    <option value="normal">{isMr ? 'सामान्य' : 'Normal'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'तपशीलवार वर्णन *' : 'Detailed Description *'}</label>
                <textarea
                  required
                  rows={3}
                  placeholder={isMr ? 'समस्येचा तपशील व काय कारवाई करावी लागेल...' : 'Issue details and suggested resolution...'}
                  value={newIssue.description_mr}
                  onChange={(e) => setNewIssue({ ...newIssue, description_mr: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155' }}>{isMr ? 'जबाबदार कार्यकर्ता' : 'Assigned Worker'}</label>
                <input
                  type="text"
                  value={newIssue.assigned_worker}
                  onChange={(e) => setNewIssue({ ...newIssue, assigned_worker: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddIssueModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '12px' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#dc2626', color: '#fff', fontSize: '12px', fontWeight: '700' }}
                >
                  ✓ {isMr ? 'तक्रार नोंदवा' : 'Lodge Grievance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
