import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';
import PrintableExecutiveReport from './PrintableExecutiveReport';

export default function ImportantReports({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await netaApi.getReports();
      if (res && res.success && res.data) {
        setReports(res.data);
      } else {
        setError(res?.message || 'Failed to fetch reports');
      }
    } catch (err) {
      console.error('Failed to load reports from backend:', err);
      setError(err?.message || 'Failed to load reports from database');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#1e3a8a', fontWeight: '700', border: '1px solid #e2e8f0' }}>
        ⏳ {isMr ? 'डेटाबेसमधून विश्लेषण अहवाल लोड होत आहेत...' : 'Loading reports from database...'}
      </div>
    );
  }

  if (error || !reports) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', color: '#64748b' }}>
        <p style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#dc2626' }}>
          ⚠️ {error || (isMr ? 'कोणतीही अहवाल माहिती उपलब्ध नाही किंवा लोड होऊ शकली नाही.' : 'No report data available.')}
        </p>
        <button
          onClick={fetchReports}
          style={{
            background: '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            padding: '8px 18px',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          🔄 {isMr ? 'पुन्हा प्रयत्न करा' : 'Retry'}
        </button>
      </div>
    );
  }

  const { demographics, civic_issues, scheme_saturation, booth_classification } = reports;

  // Prepare table data for printable dossier safely
  const pdfHeaders = isMr
    ? ['रणनीतिक निर्देशांक', 'तपशील / वर्गवारी', 'टक्केवारी / प्रमाण', 'प्राधान्य पातळी']
    : ['Strategic Metric', 'Details / Category', 'Percentage / Volume', 'Priority Level'];

  const civicIssuesList = Array.isArray(civic_issues) ? civic_issues : [];
  const civicRows = civicIssuesList.map((c) => [
    isMr ? 'नागरी समस्या प्राधान्य' : 'Civic Issue Priority',
    c.issue_mr || c.issue_en || '-',
    `${c.pct || 0}%`,
    c.trend || (c.pct > 25 ? (isMr ? 'तातडीचे (High)' : 'High Priority') : (isMr ? 'मध्यम' : 'Medium')),
  ]);

  let demographicsRows = [];
  if (demographics && typeof demographics === 'object') {
    if (Array.isArray(demographics.age_groups)) {
      demographics.age_groups.forEach((d) => {
        demographicsRows.push([
          isMr ? 'मतदार वयोगट वर्ग' : 'Age Group',
          d.group || d.group_mr || '-',
          `${d.pct || 0}% (${(d.count || 0).toLocaleString('en-IN')} ${isMr ? 'मतदार' : 'voters'})`,
          isMr ? 'महत्त्वाचा संवर्ग' : 'Key Segment',
        ]);
      });
    }
    if (Array.isArray(demographics.gender)) {
      demographics.gender.forEach((g) => {
        demographicsRows.push([
          isMr ? 'लिंगनिहाय मतदार' : 'Gender Demographic',
          g.label || '-',
          `${g.pct || 0}% (${(g.count || 0).toLocaleString('en-IN')})`,
          isMr ? 'समतोल' : 'Ratio',
        ]);
      });
    }
  } else if (Array.isArray(demographics)) {
    demographics.forEach((d) => {
      demographicsRows.push([
        isMr ? 'मतदार लोकसंख्या वर्ग' : 'Demographics',
        d.group_mr || d.group || '-',
        `${d.pct || 0}%`,
        isMr ? 'महत्त्वाचा संवर्ग' : 'Key Segment',
      ]);
    });
  }

  const schemeList = Array.isArray(scheme_saturation) ? scheme_saturation : [];
  const schemeRows = schemeList.map((s) => [
    isMr ? 'शासकीय योजना व्याप्ती' : 'Govt Scheme Saturation',
    s.name_mr || s.name_en || s.scheme_mr || '-',
    `${s.coverage_pct ?? s.pct ?? 0}% ${isMr ? 'लाभार्थी कव्हरेज' : 'Coverage'}`,
    `${(s.beneficiaries || 0).toLocaleString('en-IN')} / ${(s.target || 0).toLocaleString('en-IN')}`,
  ]);

  let boothRows = [];
  if (booth_classification && typeof booth_classification === 'object' && !Array.isArray(booth_classification)) {
    if (booth_classification.safe_mr) {
      boothRows.push([isMr ? 'बूथ रणनीती - सुरक्षित' : 'Booth Strategy - Safe', booth_classification.safe_mr, '60%+', 'SAFE']);
    }
    if (booth_classification.battleground_mr) {
      boothRows.push([isMr ? 'बूथ रणनीती - चुरशीचे' : 'Booth Strategy - Battleground', booth_classification.battleground_mr, '45-60%', 'SWING']);
    }
    if (booth_classification.weak_mr) {
      boothRows.push([isMr ? 'बूथ रणनीती - लक्ष केंद्रित' : 'Booth Strategy - Focus', booth_classification.weak_mr, '<45%', 'CRITICAL']);
    }
  } else if (Array.isArray(booth_classification)) {
    booth_classification.forEach((b) => {
      boothRows.push([
        isMr ? 'बूथ रणनीती वर्गीकरण' : 'Booth Strategy Classification',
        `${b.label_mr || b.label || ''} (${b.count || 0} ${isMr ? 'बूथ' : 'Booths'})`,
        `${b.pct || 0}%`,
        b.status ? b.status.toUpperCase() : 'ACTIVE',
      ]);
    });
  }

  const pdfRows = [
    ...civicRows,
    ...demographicsRows,
    ...schemeRows,
    ...boothRows,
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Printable Report Modal */}
      {showPdfPreview && (
        <PrintableExecutiveReport
          title={isMr ? 'सर्वसमावेशक रणनीतिक निवडणूक अहवाल (Strategic Intelligence Dossier)' : 'Strategic Electoral Intelligence Report'}
          subtitle="२८२ - सांगली विधानसभा मतदारसंघ | थेट MySQL डेटाबेस विश्लेषण"
          filters={{ 'अहवाल प्रकार': 'सर्व्हे व सांख्यिकी अहवाल', 'मतदारसंघ': '२८२ - सांगली' }}
          summaryStats={[
            { label: isMr ? 'नागरी समस्या घटक' : 'Civic Issues Tracked', value: civicIssuesList.length },
            { label: isMr ? 'लोकसंख्या प्रवर्ग' : 'Demographic Groups', value: demographicsRows.length },
            { label: isMr ? 'शासकीय योजना' : 'Schemes Saturation', value: schemeList.length },
            { label: isMr ? 'बूथ प्रवर्ग' : 'Booth Segments', value: boothRows.length },
          ]}
          headers={pdfHeaders}
          rows={pdfRows}
          onClose={() => setShowPdfPreview(false)}
          lang={lang}
        />
      )}

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
            📊 {isMr ? 'महत्त्वाचे रणनीतिक अहवाल' : 'Important Strategic Reports'}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'मतदार लोकसंख्याशास्त्र, जनसमस्यांची तीव्रता व शासकीय योजनांची व्याप्ती'
              : 'Direct from database: Demographics, civic issues severity, scheme saturation and booth strategy.'}
          </p>
        </div>

        <button
          onClick={() => setShowPdfPreview(true)}
          style={{
            background: '#1d4ed8',
            color: '#ffffff',
            border: 'none',
            padding: '9px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 2px 4px rgba(29, 78, 216, 0.25)',
          }}
        >
          📄 {isMr ? 'अधिकृत PDF अहवाल तयार करा' : 'Generate Official PDF'}
        </button>
      </div>

      {/* Row 1: Civic Issues Matrix & Demographics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Civic Issues Priority Matrix */}
        {civicIssuesList.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                ⚠️ {isMr ? 'नागरी समस्यांची तीव्रता निर्देशांक' : 'Civic Issues Priority Matrix'}
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{isMr ? 'डेटाबेस पाहणी' : 'Survey feedback'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {civicIssuesList.map((issue, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{issue.issue_mr || issue.issue_en}</span>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>{issue.pct}%</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${Math.min(100, (issue.pct || 0) * 2.2)}%`,
                        background: idx === 0 ? '#ef4444' : idx === 1 ? '#f97316' : idx === 2 ? '#eab308' : '#3b82f6',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '3px' }}>
                    <span>{issue.count?.toLocaleString('en-IN')} {isMr ? 'कुटुंबे' : 'families'}</span>
                    <span style={{ color: issue.trend?.includes('+') ? '#dc2626' : '#16a34a' }}>{issue.trend}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voter Demographics Breakdown */}
        {demographics && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                👥 {isMr ? 'वयोगट व लिंगनिहाय मतदार विभागणी' : 'Age & Gender Demographics'}
              </h3>
            </div>

            {/* Age Distribution */}
            {Array.isArray(demographics?.age_groups) && demographics.age_groups.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569' }}>
                  {isMr ? 'वयोगट विभागणी:' : 'Age Groups:'}
                </div>
                {demographics.age_groups.map((ag, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: '#334155', minWidth: '130px' }}>{ag.group}</span>
                    <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, (ag.pct || 0) * 2)}%`,
                          background: '#2563eb',
                          borderRadius: '4px',
                        }}
                      />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#0f172a', minWidth: '40px', textAlign: 'right' }}>
                      {ag.pct}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Gender Ratio */}
            {Array.isArray(demographics?.gender) && demographics.gender.length >= 2 && (
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '8px' }}>
                  {isMr ? 'लिंगनिहाय मतदार प्रमाण:' : 'Gender Ratio:'}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ padding: '10px 12px', background: '#eff6ff', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#1d4ed8' }}>👨 {isMr ? 'पुरुष मतदार' : 'Male Voters'}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#1e3a8a' }}>
                      {demographics.gender[0]?.count?.toLocaleString('en-IN')} ({demographics.gender[0]?.pct}%)
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px', background: '#fdf2f8', borderRadius: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#db2777' }}>👩 {isMr ? 'महिला मतदार' : 'Female Voters'}</div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#9d174d' }}>
                      {demographics.gender[1]?.count?.toLocaleString('en-IN')} ({demographics.gender[1]?.pct}%)
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Row 2: Govt Scheme Saturation & Strategic Booth Classification */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* Scheme Saturation */}
        {schemeList.length > 0 && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                🏛️ {isMr ? 'शासकीय योजनांची व्याप्ती' : 'Scheme Saturation'}
              </h3>
              <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '700' }}>{isMr ? 'उच्च लाभ' : 'High impact'}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {schemeList.map((scheme, idx) => (
                <div key={idx} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                    <span>{scheme.name_mr || scheme.name || scheme.scheme_mr}</span>
                    <span style={{ color: '#16a34a' }}>{scheme.coverage_pct ?? scheme.pct ?? 0}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    <span>
                      {scheme.beneficiaries?.toLocaleString('en-IN')} {isMr ? 'नोंदणीकृत लाभार्थी' : 'beneficiaries'}
                    </span>
                    <span>{isMr ? 'लक्ष्य:' : 'Target:'} {scheme.target?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Strategic Booth Classification */}
        {booth_classification && (
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              padding: '22px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                🎯 {isMr ? 'बूथ वर्गीकरण व रणनीती' : 'Booth Classification Strategy'}
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {booth_classification.safe_mr && (
                <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '10px', borderLeft: '4px solid #16a34a' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#15803d' }}>
                    🟢 {booth_classification.safe_mr}
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                    {isMr
                      ? 'येथे मतदारांशी केवळ नियमित संपर्कात राहावे, मतदान दिनी १००% हजेरीचे नियोजन करावे.'
                      : 'Maintain regular touch, ensure high turnout on voting day.'}
                  </div>
                </div>
              )}

              {booth_classification.battleground_mr && (
                <div style={{ padding: '14px', background: '#fefce8', borderRadius: '10px', borderLeft: '4px solid #eab308' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#854d0e' }}>
                    🟡 {booth_classification.battleground_mr}
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                    {isMr
                      ? 'नेत्यांच्या कोपरा सभा, प्रमुख स्थानिक प्रभावक व्यक्तींच्या भेटी व लाडकी बहीण संवाद आवश्यक.'
                      : 'Requires leader corner sabhas, key influencer visits and direct contact.'}
                  </div>
                </div>
              )}

              {booth_classification.weak_mr && (
                <div style={{ padding: '14px', background: '#fef2f2', borderRadius: '10px', borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b' }}>
                    🔴 {booth_classification.weak_mr}
                  </div>
                  <div style={{ fontSize: '12px', color: '#334155', marginTop: '4px' }}>
                    {isMr
                      ? 'तात्काळ अतिरिक्त अधिकारी पाठवून नागरिकांच्या स्थानिक तक्रारींचे निवारण करावे.'
                      : 'Urgent deployment of reinforcement officers to redress grievances.'}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
