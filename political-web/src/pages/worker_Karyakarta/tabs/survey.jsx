import React from 'react';
import {
  ClipboardCheck,
  Shield,
  CheckCircle2,
  Save,
  Target,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  Lock,
  ClipboardList
} from 'lucide-react';

export default function SurveyTab({
  isMr,
  language = 'en',
  t,
  surveysList = [],
  surveyStats = { allocatedForms: 0, savedToBackend: 0, totalTarget: 0, pendingTarget: 0 },
  savedSubmissionsList = [],
  surveyActiveView = 'forms',
  setSurveyActiveView,
  activeSurveyToFill,
  setActiveSurveyToFill,
  surveyFormData,
  setSurveyFormData,
  handleSurveySubmit,
  handleWorkerAddMember,
  handleWorkerRemoveMember,
  handleWorkerMemberChange,
  handleCustomAnswerChange,
  handleMultiChoiceToggle,
  handleOpenSurveyModal,
  submittingSurvey,
  checkDuplicateField,
  surveyDuplicateWarning,
  setSurveyDuplicateWarning,
}) {
  const activeSurveys = surveysList;

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardCheck size={28} color="#2563eb" />
            {language === 'mr' ? 'मतदार कुटुंब सर्वेक्षण डेस्क' : 'Household Survey Desk'}
          </h1>
          <div className="page-subtitle">
            {language === 'mr'
              ? 'प्रशासनाकडून तुम्हाला केवळ अधिकृत वाटप केलेले फॉर्म. बॅकएंडमध्ये जमा झालेले व शिल्लक राहिलेले फॉर्म येथे थेट तपासू शकता.'
              : 'Survey forms strictly allocated to your account. Track forms saved to backend and pending target allocations.'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{
            background: '#eff6ff',
            color: '#1d4ed8',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '13px',
            border: '1px solid #bfdbfe',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Shield size={14} />
            {language === 'mr' ? `वाटप केलेले फॉर्म: ${surveyStats.allocatedForms}` : `Allocated Forms: ${surveyStats.allocatedForms}`}
          </span>
          <span style={{
            background: '#f0fdf4',
            color: '#16a34a',
            padding: '6px 14px',
            borderRadius: '20px',
            fontWeight: 700,
            fontSize: '13px',
            border: '1px solid #bbf7d0',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <CheckCircle2 size={14} />
            {language === 'mr' ? `बॅकएंडमध्ये जतन: ${surveyStats.savedToBackend}` : `Saved in Backend: ${surveyStats.savedToBackend}`}
          </span>
        </div>
      </div>

      {/* Real-time KPI Stats: Allocated to this user & Saved to backend */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        {/* 1. Allocated Survey Forms to this User */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #bfdbfe',
          borderRadius: '14px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            color: '#1d4ed8',
            borderRadius: '12px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ClipboardCheck size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isMr ? 'वाटप केलेले फॉर्म' : 'Allocated Forms'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#1e3a8a', lineHeight: 1.2 }}>
              {surveyStats.allocatedForms}
            </div>
            <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: '700', marginTop: '2px' }}>
              ✓ {isMr ? 'केवळ तुम्हाला अधिकृत वाटप' : 'Allocated to this user'}
            </div>
          </div>
        </div>

        {/* 2. Saved to Backend DB by this User */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #bbf7d0',
          borderRadius: '14px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 8px rgba(22, 163, 74, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            color: '#16a34a',
            borderRadius: '12px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Save size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isMr ? 'बॅकएंडमध्ये जतन झालेले फॉर्म' : 'Saved to Backend DB'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#14532d', lineHeight: 1.2 }}>
              {surveyStats.savedToBackend}
            </div>
            <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', marginTop: '2px' }}>
              ✓ {isMr ? 'डेटाबेसमध्ये सुरक्षित जतन' : 'Saved in backend database'}
            </div>
          </div>
        </div>

        {/* 3. Total Target Households */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #fed7aa',
          borderRadius: '14px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 8px rgba(234, 88, 12, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
            color: '#ea580c',
            borderRadius: '12px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Target size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isMr ? 'एकूण कुटुंब उद्दिष्ट' : 'Allocated Target'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#7c2d12', lineHeight: 1.2 }}>
              {surveyStats.totalTarget}
            </div>
            <div style={{ fontSize: '11px', color: '#c2410c', fontWeight: '600', marginTop: '2px' }}>
              {isMr ? 'मतदार कुटुंब नोंदणी उद्दिष्ट' : 'Target households count'}
            </div>
          </div>
        </div>

        {/* 4. Remaining / Pending to Complete */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '14px',
          padding: '1.1rem 1.25rem',
          boxShadow: '0 2px 8px rgba(100, 116, 139, 0.06)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            color: '#64748b',
            borderRadius: '12px',
            width: '46px',
            height: '46px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <Clock size={24} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '11.5px', fontWeight: '750', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {isMr ? 'शिल्लक उद्दिष्ट' : 'Remaining Target'}
            </div>
            <div style={{ fontSize: '26px', fontWeight: '900', color: '#334155', lineHeight: 1.2 }}>
              {Math.max(0, surveyStats.totalTarget - surveyStats.savedToBackend)}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '2px' }}>
              {isMr ? 'उर्वरित फॉर्म भरणे बाकी' : 'Remaining to complete'}
            </div>
          </div>
        </div>
      </div>

      {/* View Switcher: Allocated Forms vs Saved in Backend */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => setSurveyActiveView('forms')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '10px',
            fontWeight: 750,
            fontSize: '13.5px',
            cursor: 'pointer',
            border: 'none',
            background: surveyActiveView === 'forms' ? '#2563eb' : '#f1f5f9',
            color: surveyActiveView === 'forms' ? '#ffffff' : '#475569',
            boxShadow: surveyActiveView === 'forms' ? '0 2px 6px rgba(37,99,235,0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <ClipboardCheck size={16} />
          <span>{isMr ? `वाटप केलेले अधिकृत फॉर्म (${surveysList.length})` : `Allocated Forms (${surveysList.length})`}</span>
        </button>

        <button
          type="button"
          onClick={() => setSurveyActiveView('saved_history')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '10px',
            fontWeight: 750,
            fontSize: '13.5px',
            cursor: 'pointer',
            border: 'none',
            background: surveyActiveView === 'saved_history' ? '#16a34a' : '#f1f5f9',
            color: surveyActiveView === 'saved_history' ? '#ffffff' : '#475569',
            boxShadow: surveyActiveView === 'saved_history' ? '0 2px 6px rgba(22,163,74,0.25)' : 'none',
            transition: 'all 0.2s ease',
          }}
        >
          <Save size={16} />
          <span>{isMr ? `बॅकएंडमध्ये जतन झालेले फॉर्म (${surveyStats.savedToBackend})` : `Saved in Backend (${surveyStats.savedToBackend})`}</span>
        </button>
      </div>

      {/* Access Policy Info Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
        border: '1px solid #bae6fd',
        borderRadius: '12px',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '13px',
        color: '#0369a1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>ℹ</div>
          <span>
            <strong>{language === 'mr' ? 'केवळ फॉर्म भरण्याची परवानगी:' : 'Fill-only Access:'}</strong>{' '}
            {language === 'mr'
              ? 'तुम्हाला केवळ प्रशासनाने (Admin) अधिकृत केलेल्या फॉर्ममध्ये नवीन मतदारांची माहिती भरण्याची परवानगी आहे. फॉर्मचे स्वरूप बदलता येत नाही.'
              : 'You have read and fill-only permissions for these assigned forms. Form schema cannot be altered.'}
          </span>
        </div>
      </div>

      {/* Survey Fill Modal - Only for Assigned Forms */}
      {activeSurveyToFill && (
        <div className="responsive-modal-overlay">
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            maxWidth: '820px',
            width: '96%',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            overflow: 'hidden',
            border: '1px solid #cbd5e1'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '18px 24px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #334155'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px' }}>📋</span>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#ffffff' }}>
                    {activeSurveyToFill.title_mr || activeSurveyToFill.title_en}
                  </h3>
                  <span style={{
                    background: 'rgba(255,255,255,0.15)',
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 600
                  }}>
                    v{activeSurveyToFill.version || '1.0'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span>🏷️ प्रकल्प: <strong>{activeSurveyToFill.project_name || 'सांगली'}</strong></span>
                  <span>📍 व्याप्ती: <strong>{activeSurveyToFill.scope || 'GENERAL'}</strong></span>
                  <span style={{ color: '#4ade80' }}>✓ अधिकृत फॉर्म (Fill Only)</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSurveyToFill(null)}
                style={{
                  border: 'none',
                  background: 'rgba(255,255,255,0.1)',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Scrollable Form */}
            <form onSubmit={handleSurveySubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '22px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '22px' }}>

                {/* SECTION 1: कुटुंब प्रमुख व घर तपशील */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <span style={{ background: '#3b82f6', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>१</span>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                      कुटुंब प्रमुख व संपर्क तपशील (Family Head Details)
                    </h4>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        कुटुंब प्रमुखाचे पूर्ण नाव (Family Pramukh Name) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        placeholder="उदा. सतीश विठ्ठल खोत"
                        value={surveyFormData.pramukh_name}
                        onChange={(e) => {
                          const val = e.target.value;
                          setSurveyFormData((prev) => {
                            const nextMembers = [...prev.members];
                            if (nextMembers.length > 0 && (!nextMembers[0].full_name || nextMembers[0].full_name === prev.pramukh_name)) {
                              nextMembers[0].full_name = val;
                            }
                            return { ...prev, pramukh_name: val, members: nextMembers };
                          });
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        एकूण मतदार संख्या (Total Matdar) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        className="form-input"
                        placeholder="उदा. ३"
                        value={surveyFormData.total_matdar}
                        onChange={(e) => setSurveyFormData({ ...surveyFormData, total_matdar: parseInt(e.target.value) || 1 })}
                      />
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        (ओळखपत्र YES असलेल्या सदस्यांनुसार आपोआप मोजले जाते)
                      </span>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        मोबाईल नंबर (Mobile Number)
                      </label>
                      <input
                        type="tel"
                        maxLength="10"
                        className="form-input"
                        placeholder="उदा. ९८XXXXXXXX"
                        value={surveyFormData.phone}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '');
                          setSurveyFormData({ ...surveyFormData, phone: val });
                          if (val.length >= 10) {
                            checkDuplicateField('phone', val, setSurveyDuplicateWarning);
                          } else {
                            setSurveyDuplicateWarning(null);
                          }
                        }}
                      />
                      {surveyDuplicateWarning && (
                        <div style={{ marginTop: '5px', padding: '6px 10px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                          <span>⚠️ {surveyDuplicateWarning}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        घराचा पत्ता / परिसर (Address / Lane / Ward)
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="उदा. घर क्र. २४, मेन रोड, वॉर्ड ३"
                        value={surveyFormData.address}
                        onChange={(e) => setSurveyFormData({ ...surveyFormData, address: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: सर्व कुटुंब सदस्यांची माहिती */}
                <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ background: '#10b981', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>२</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                          सर्व कुटुंब सदस्यांची माहिती (All Family Members Details)
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          प्रत्येक सदस्याचे नाव, जन्मतारीख, वय व मतदार ओळखपत्र (EPIC) माहिती भरा.
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleWorkerAddMember}
                      style={{
                        background: '#10b981',
                        color: '#ffffff',
                        border: 'none',
                        padding: '6px 14px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Plus size={16} /> + सदस्य जोडा
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {surveyFormData.members.map((member, idx) => (
                      <div
                        key={member.id}
                        style={{
                          background: '#ffffff',
                          borderRadius: '10px',
                          padding: '14px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13px', color: '#0f172a' }}>
                            #{idx + 1} {idx === 0 ? 'कुटुंब प्रमुख (Family Head)' : `सदस्य (Member ${idx + 1})`}
                          </span>
                          {surveyFormData.members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleWorkerRemoveMember(member.id)}
                              style={{
                                border: 'none',
                                background: '#fee2e2',
                                color: '#ef4444',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}
                            >
                              <Trash2 size={12} /> काढा
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                              सदस्याचे पूर्ण नाव *
                            </label>
                            <input
                              type="text"
                              required
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '13px' }}
                              placeholder="उदा. अनिता सतीश खोत"
                              value={member.full_name}
                              onChange={(e) => handleWorkerMemberChange(member.id, 'full_name', e.target.value)}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                              नातेसंबंध (Relation)
                            </label>
                            <select
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '13px' }}
                              value={member.relation}
                              onChange={(e) => handleWorkerMemberChange(member.id, 'relation', e.target.value)}
                            >
                              <option value="कुटुंब प्रमुख (Self)">कुटुंब प्रमुख (Self)</option>
                              <option value="पत्नी (Wife)">पत्नी (Wife)</option>
                              <option value="पती (Husband)">पती (Husband)</option>
                              <option value="मुलगा (Son)">मुलगा (Son)</option>
                              <option value="मुलगी (Daughter)">मुलगी (Daughter)</option>
                              <option value="वडील (Father)">वडील (Father)</option>
                              <option value="आई (Mother)">आई (Mother)</option>
                              <option value="भाऊ (Brother)">भाऊ (Brother)</option>
                              <option value="बहीण (Sister)">बहीण (Sister)</option>
                              <option value="सून (Daughter-in-law)">सून (Daughter-in-law)</option>
                              <option value="जावई (Son-in-law)">जावई (Son-in-law)</option>
                              <option value="इतर (Other)">इतर (Other)</option>
                            </select>
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                              जन्मतारीख (DOB)
                            </label>
                            <input
                              type="date"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '13px' }}
                              value={member.dob}
                              onChange={(e) => handleWorkerMemberChange(member.id, 'dob', e.target.value)}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                              वय (Age)
                            </label>
                            <input
                              type="number"
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '13px', background: '#f8fafc' }}
                              placeholder="आपोआप वय"
                              value={member.age}
                              onChange={(e) => handleWorkerMemberChange(member.id, 'age', e.target.value)}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                              मतदार ओळखपत्र आहे का नाही?
                            </label>
                            <select
                              className="form-input"
                              style={{ padding: '6px 10px', fontSize: '13px' }}
                              value={member.has_voter_id}
                              onChange={(e) => handleWorkerMemberChange(member.id, 'has_voter_id', e.target.value)}
                            >
                              <option value="YES">होय - आहे (YES)</option>
                              <option value="NO">नाही (NO)</option>
                            </select>
                          </div>

                          {member.has_voter_id === 'YES' && (
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '3px' }}>
                                EPIC मतदार ओळखपत्र क्र.
                              </label>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '6px 10px', fontSize: '13px' }}
                                placeholder="उदा. MH/44/282/..."
                                value={member.voter_id_no}
                                onChange={(e) => handleWorkerMemberChange(member.id, 'voter_id_no', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECTION 3: अतिरिक्त सर्वेक्षण प्रश्न (कस्टम प्रश्न) */}
                {activeSurveyToFill.custom_questions && activeSurveyToFill.custom_questions.length > 0 && (
                  <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '18px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
                      <span style={{ background: '#8b5cf6', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 800 }}>३</span>
                      <div>
                        <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#1e293b' }}>
                          अतिरिक्त सर्वेक्षण प्रश्न (Custom Project Questions)
                        </h4>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>
                          या मोहिमेसाठी विचारलेले विशिष्ट प्रश्न खाली उत्तरे निवडा.
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {activeSurveyToFill.custom_questions.map((q, qIdx) => (
                        <div
                          key={q.id || qIdx}
                          style={{
                            background: '#ffffff',
                            borderRadius: '10px',
                            padding: '14px',
                            border: '1px solid #e2e8f0'
                          }}
                        >
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: 800, color: '#1e293b', marginBottom: '4px' }}>
                            प्रश्न {qIdx + 1}: {q.title_mr || q.title_en} {q.required && <span style={{ color: '#ef4444' }}>*</span>}
                          </label>
                          {q.title_en && q.title_mr && (
                            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                              ({q.title_en})
                            </span>
                          )}

                          {/* Single Choice / Radio */}
                          {q.type === 'single_choice' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                              {(q.options || ['होय', 'नाही']).map((opt, oIdx) => (
                                <label
                                  key={oIdx}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px',
                                    padding: '7px 14px',
                                    borderRadius: '8px',
                                    background: surveyFormData.custom_answers?.[q.id] === opt ? '#eff6ff' : '#f8fafc',
                                    border: surveyFormData.custom_answers?.[q.id] === opt ? '2px solid #2563eb' : '1px solid #cbd5e1',
                                    color: surveyFormData.custom_answers?.[q.id] === opt ? '#1e40af' : '#334155',
                                    cursor: 'pointer',
                                    fontWeight: 600,
                                    fontSize: '13px'
                                  }}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${q.id}`}
                                    checked={surveyFormData.custom_answers?.[q.id] === opt}
                                    onChange={() => handleCustomAnswerChange(q.id, opt)}
                                    style={{ accentColor: '#2563eb' }}
                                  />
                                  {opt}
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Multiple Choice / Checkbox */}
                          {q.type === 'multi_choice' && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '6px' }}>
                              {(q.options || []).map((opt, oIdx) => {
                                const isChecked = Array.isArray(surveyFormData.custom_answers?.[q.id]) && surveyFormData.custom_answers[q.id].includes(opt);
                                return (
                                  <label
                                    key={oIdx}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px',
                                      padding: '7px 14px',
                                      borderRadius: '8px',
                                      background: isChecked ? '#f0fdf4' : '#f8fafc',
                                      border: isChecked ? '2px solid #16a34a' : '1px solid #cbd5e1',
                                      color: isChecked ? '#15803d' : '#334155',
                                      cursor: 'pointer',
                                      fontWeight: 600,
                                      fontSize: '13px'
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleMultiChoiceToggle(q.id, opt)}
                                      style={{ accentColor: '#16a34a' }}
                                    />
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>
                          )}

                          {/* Yes / No Toggle */}
                          {q.type === 'yes_no' && (
                            <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                              {['होय (Yes)', 'नाही (No)'].map((opt) => (
                                <button
                                  type="button"
                                  key={opt}
                                  onClick={() => handleCustomAnswerChange(q.id, opt)}
                                  style={{
                                    flex: 1,
                                    padding: '8px 14px',
                                    borderRadius: '8px',
                                    border: surveyFormData.custom_answers?.[q.id] === opt ? '2px solid #0284c7' : '1px solid #cbd5e1',
                                    background: surveyFormData.custom_answers?.[q.id] === opt ? '#e0f2fe' : '#ffffff',
                                    color: surveyFormData.custom_answers?.[q.id] === opt ? '#0369a1' : '#334155',
                                    fontWeight: 700,
                                    fontSize: '13px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {opt}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Rating 1 to 5 */}
                          {q.type === 'rating' && (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                              {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                  type="button"
                                  key={num}
                                  onClick={() => handleCustomAnswerChange(q.id, num)}
                                  style={{
                                    flex: 1,
                                    padding: '8px',
                                    borderRadius: '8px',
                                    border: (surveyFormData.custom_answers?.[q.id] || 5) === num ? '2px solid #f97316' : '1px solid #cbd5e1',
                                    background: (surveyFormData.custom_answers?.[q.id] || 5) === num ? '#fff7ed' : '#ffffff',
                                    color: (surveyFormData.custom_answers?.[q.id] || 5) === num ? '#ea580c' : '#64748b',
                                    fontWeight: 800,
                                    fontSize: '14px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ★ {num}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Text Input */}
                          {q.type === 'text' && (
                            <input
                              type="text"
                              className="form-input"
                              style={{ marginTop: '6px' }}
                              placeholder="उत्तर येथे लिहा..."
                              value={surveyFormData.custom_answers?.[q.id] || ''}
                              onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                            />
                          )}

                          {/* Textarea */}
                          {q.type === 'textarea' && (
                            <textarea
                              rows="2"
                              className="form-input"
                              style={{ marginTop: '6px' }}
                              placeholder="सविस्तर अभिप्राय येथे लिहा..."
                              value={surveyFormData.custom_answers?.[q.id] || ''}
                              onChange={(e) => handleCustomAnswerChange(q.id, e.target.value)}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '16px 24px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  सर्व माहिती अचूक असल्याची खात्री करून सबमिट करा.
                </span>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => setActiveSurveyToFill(null)}
                    disabled={submittingSurvey}
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn-success"
                    disabled={submittingSurvey}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 20px',
                      fontWeight: 700
                    }}
                  >
                    {submittingSurvey ? 'जमा होत आहे...' : '✓ सर्व्हे पूर्ण व जमा करा'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content Views: Allocated Forms vs Saved in Backend History */}
      {surveyActiveView === 'forms' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {activeSurveys.length > 0 ? (
            activeSurveys.map((survey) => {
              const savedCount = survey.saved_to_backend_count ?? survey.completed_voters ?? 0;
              const targetCount = survey.allocated_target || survey.total_voters || 100;
              const progressPct = Math.min(100, Math.round((savedCount / (targetCount || 1)) * 100));

              return (
                <div
                  key={survey.id}
                  className="card"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    padding: '1.5rem',
                    border: '1px solid #bfdbfe',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(37,99,235,0.06)',
                    background: '#ffffff',
                    position: 'relative',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ backgroundColor: '#eff6ff', color: '#2563eb', padding: '0.65rem', borderRadius: '12px' }}>
                      <ClipboardCheck size={26} />
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 750, padding: '3px 8px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                        ✓ {isMr ? 'तुम्हाला वाटप' : 'Allocated to You'}
                      </span>
                      <span style={{ backgroundColor: '#dcfce7', color: '#16a34a', fontSize: '0.75rem', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                        ✓ {isMr ? 'अधिकृत' : 'Authorized'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                        {survey.title_mr || survey.title_en}
                      </h3>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                        v{survey.version || '1.0'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '8px', fontSize: '0.85rem', color: '#475569' }}>
                      <div>🏷️ {isMr ? 'प्रकल्प' : 'Project'}: <strong>{survey.project_name || 'सांगली'}</strong></div>
                      <div>📍 {isMr ? 'भौगोलिक व्याप्ती' : 'Scope'}: <strong>{survey.scope || 'विधानसभा'}</strong></div>
                      <div style={{ color: '#059669', fontWeight: 600 }}>
                        ✓ {isMr ? 'कुटुंब प्रमुख + सदस्य + अतिरिक्त प्रश्न' : 'Head + Members + Custom Questions'}
                      </div>
                    </div>

                    {/* Allocated Target & Saved to Backend Block */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      padding: '12px 14px',
                      borderRadius: '12px',
                      marginTop: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#64748b', fontWeight: '600' }}>
                          🎯 {isMr ? 'वाटप केलेले उद्दिष्ट (Allocated Target):' : 'Allocated Target:'}
                        </span>
                        <strong style={{ color: '#ea580c', fontWeight: '800' }}>
                          {targetCount} {isMr ? 'कुटुंबे' : 'Households'}
                        </strong>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                        <span style={{ color: '#64748b', fontWeight: '600' }}>
                          💾 {isMr ? 'बॅकएंडमध्ये जतन (Saved in DB):' : 'Saved in DB:'}
                        </span>
                        <strong style={{ color: '#16a34a', fontWeight: '850' }}>
                          {savedCount} {isMr ? 'फॉर्म जमा' : 'Forms Saved'}
                        </strong>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ marginTop: '2px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '3px' }}>
                          <span>{isMr ? 'प्रगती' : 'Progress'}</span>
                          <span style={{ fontWeight: '750', color: '#2563eb' }}>{progressPct}%</span>
                        </div>
                        <div style={{ height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${progressPct}%`,
                            height: '100%',
                            background: 'linear-gradient(90deg, #3b82f6 0%, #16a34a 100%)',
                            borderRadius: '4px',
                            transition: 'width 0.4s ease'
                          }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} /> {isMr ? 'पाहणे व भरणे अधिकृत' : 'Fill-only Access'}
                    </span>
                    <button
                      className="btn-primary"
                      style={{
                        padding: '0.55rem 1.35rem',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
                      }}
                      onClick={() => handleOpenSurveyModal(survey)}
                    >
                      {isMr ? 'फॉर्म भरा (Fill Form) →' : 'Fill Form →'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem', background: '#ffffff', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <div style={{ background: '#f1f5f9', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem auto' }}>
                <ClipboardList size={32} color="#94a3b8" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                {language === 'mr' ? 'सध्या तुम्हाला कोणतेही सर्व्हे फॉर्म वाटप केलेले नाहीत' : 'No Survey Forms Allocated to Your Account'}
              </h3>
              <p style={{ color: '#64748b', fontSize: '14px', maxWidth: '480px', margin: '0 auto', lineHeight: 1.6 }}>
                {language === 'mr'
                  ? 'केवळ प्रशासनाने (Admin) तुमच्या खात्याला अधिकृत वाटप केलेले फॉर्मच येथे दिसतात. नवीन फॉर्म वाटपासाठी कृपया तुमच्या ॲडमिनशी संपर्क साधा.'
                  : 'Only published survey forms assigned to your specific user account by an Administrator appear here. Contact your campaign administrator for form allocation.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* View 2: Saved Forms in Backend DB History */
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            padding: '16px 20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Save size={20} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {isMr ? 'बॅकएंड डेटाबेसमध्ये जतन झालेले फॉर्म' : 'Forms Saved in Backend Database'}
              </h3>
              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
                {savedSubmissionsList.length} {isMr ? 'नोंदी' : 'Records'}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              🔒 {isMr ? 'केवळ या युझरने भरलेले फॉर्म' : 'Only forms submitted by your account'}
            </div>
          </div>

          {savedSubmissionsList.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '750' }}>
                    <th style={{ padding: '12px 16px' }}>#</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'कुटुंब प्रमुख (Pramukh Name)' : 'Family Head'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'मोबाईल / Voter ID' : 'Contact / Voter ID'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'एकूण मतदार' : 'Matdar'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'पत्ता (Address)' : 'Address'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'जतन दिनांक' : 'Saved At'}</th>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'स्थिती (Status)' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {savedSubmissionsList.map((item, idx) => (
                    <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}>
                      <td style={{ padding: '12px 16px', fontWeight: '700', color: '#64748b' }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: '800', color: '#0f172a' }}>
                        {item.citizen_name || '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: '600', color: '#0284c7' }}>{item.phone || '-'}</div>
                        {item.voter_id && (
                          <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                            🪪 {item.voter_id}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontWeight: '750', fontSize: '12px' }}>
                          👥 {item.total_matdar || 1} {isMr ? 'सदस्य' : 'members'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.address || 'सांगली'}
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '12px' }}>
                        {item.submitted_at ? new Date(item.submitted_at).toLocaleString('mr-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{
                          background: '#dcfce7',
                          color: '#15803d',
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '11.5px',
                          fontWeight: '750',
                          border: '1px solid #bbf7d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <CheckCircle2 size={12} />
                          {isMr ? 'बॅकएंडमध्ये जतन' : 'Saved in DB'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <div style={{ background: '#f8fafc', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                <Save size={28} color="#94a3b8" />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#334155' }}>
                {isMr ? 'अद्याप कोणताही फॉर्म बॅकएंडमध्ये जमा केलेला नाही' : 'No forms saved to backend yet'}
              </h4>
              <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '13px' }}>
                {isMr ? 'वरील \'वाटप केलेले अधिकृत फॉर्म\' टॅबमधून नवीन मतदारांची माहिती भरून जतन करा.' : 'Fill and submit an allocated survey form to view your saved records here.'}
              </p>
              <button
                type="button"
                onClick={() => setSurveyActiveView('forms')}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700 }}
              >
                {isMr ? '← वाटप केलेले फॉर्म पहा' : '← View Allocated Forms'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
