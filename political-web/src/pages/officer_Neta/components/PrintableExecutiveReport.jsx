import React from 'react';

/**
 * PrintableExecutiveReport
 * Renders an official, beautifully styled election briefing dossier
 * optimized for standard A4 printing and native browser "Save as PDF" vector output.
 * Preserves 100% authentic Devanagari (Marathi) typography without glyph corruption.
 */
export default function PrintableExecutiveReport({
  title = 'निवडणूक व्यवस्थापन अहवाल',
  subtitle = '२८२ - सांगली विधानसभा मतदारसंघ',
  filters = {},
  summaryStats = [],
  headers = [],
  rows = [],
  sections = null,
  onClose,
  lang = 'mr',
}) {
  const isMr = lang === 'mr';
  const printTimestamp = new Date().toLocaleString(isMr ? 'mr-IN' : 'en-US', {
    dateStyle: 'full',
    timeStyle: 'medium',
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="printable-report-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      {/* Floating Control Bar (Hidden on Print) */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '900px',
          background: '#1e293b',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '12px 12px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px' }}>📄</span>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800' }}>
              {isMr ? 'अधिकृत PDF अहवाल प्रिव्ह्यू' : 'Official PDF Report Preview'}
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              {isMr ? 'ब्राउझरच्या Print संवादात "Save as PDF" निवडा' : 'Select "Save as PDF" in browser print dialog'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrint}
            style={{
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            🖨️ {isMr ? 'प्रिंट / PDF म्हणून सेव्ह करा' : 'Print / Save as PDF'}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: '#475569',
                color: '#ffffff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              ✕ {isMr ? 'बंद करा' : 'Close'}
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet (Standard A4 Simulation) */}
      <div
        id="printable-report-sheet"
        style={{
          width: '100%',
          maxWidth: '900px',
          background: '#ffffff',
          color: '#0f172a',
          padding: '40px',
          boxSizing: 'border-box',
          boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
          fontFamily: "'Noto Sans Devanagari', 'Mukta', 'Inter', -apple-system, sans-serif",
          borderRadius: '0 0 12px 12px',
        }}
      >
        {/* CSS Rules for Clean PDF Print Output */}
        <style>
          {`
            @media print {
              body * {
                visibility: hidden;
              }
              .no-print {
                display: none !important;
              }
              .printable-report-overlay {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 0 !important;
                background: #ffffff !important;
              }
              #printable-report-sheet, #printable-report-sheet * {
                visibility: visible;
              }
              #printable-report-sheet {
                position: absolute;
                left: 0;
                top: 0;
                width: 100% !important;
                max-width: 100% !important;
                padding: 20mm !important;
                box-shadow: none !important;
                border-radius: 0 !important;
              }
              @page {
                size: A4 portrait;
                margin: 10mm;
              }
              tr {
                page-break-inside: avoid;
              }
            }
          `}
        </style>

        {/* Letterhead Header */}
        <div
          style={{
            borderBottom: '2.5px solid #1e3a8a',
            paddingBottom: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px', color: '#dc2626', textTransform: 'uppercase' }}>
              ✦ {isMr ? 'निवडणूक अभियान व क्षेत्रीय नियंत्रण कक्ष' : 'ELECTION WAR ROOM DOSSIER'} ✦
            </div>
            <h1 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '900', color: '#1e3a8a', lineHeight: 1.2 }}>
              {title}
            </h1>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#475569', marginTop: '4px' }}>
              📍 {subtitle}
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                display: 'inline-block',
                background: '#fef2f2',
                color: '#991b1b',
                border: '1px solid #f87171',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: '800',
                letterSpacing: '0.5px',
              }}
            >
              🔒 {isMr ? 'अंतर्गत विश्लेषणासाठी' : 'CONFIDENTIAL / INTERNAL'}
            </div>
            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
              <strong>{isMr ? 'निर्मिती दिनांक:' : 'Generated:'}</strong>
              <br />
              {printTimestamp}
            </div>
          </div>
        </div>

        {/* Applied Filters Metadata Strip */}
        {Object.keys(filters).length > 0 && (
          <div
            style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '18px',
              fontSize: '11px',
              color: '#334155',
              display: 'flex',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <strong style={{ color: '#0f172a' }}>🔍 {isMr ? 'निवडलेले निकष:' : 'Active Filters:'}</strong>
            {Object.entries(filters).map(([k, v]) => (
              <span key={k}>
                <strong>{k}:</strong> {v || (isMr ? 'सर्व' : 'All')}
              </span>
            ))}
          </div>
        )}

        {/* Executive Summary Metrics Strip */}
        {summaryStats && summaryStats.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${Math.min(summaryStats.length, 4)}, 1fr)`,
              gap: '12px',
              marginBottom: '22px',
            }}
          >
            {summaryStats.map((st, i) => (
              <div
                key={i}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>{st.label}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a', marginTop: '2px' }}>{st.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Multi-Section Dossier Tables (if sections provided) or Standard Single Table */}
        {sections && sections.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '30px' }}>
            {sections.map((sec, sIdx) => (
              <div key={sIdx} style={{ pageBreakInside: 'avoid' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: '#f1f5f9',
                    borderLeft: '4px solid #1e3a8a',
                    marginBottom: '10px',
                    borderRadius: '0 6px 6px 0',
                  }}
                >
                  <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: '800', color: '#1e3a8a' }}>
                    {sec.title}
                  </h3>
                  {sec.rows && (
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                      {sec.rows.length} {isMr ? 'नोंदी' : 'records'}
                    </span>
                  )}
                </div>

                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '10.5px',
                  }}
                >
                  <thead>
                    <tr style={{ background: '#1e3a8a', color: '#ffffff', textAlign: 'left' }}>
                      <th style={{ padding: '7px 8px', width: '30px', textAlign: 'center' }}>#</th>
                      {sec.headers.map((h, i) => (
                        <th key={i} style={{ padding: '7px 8px', fontWeight: '700' }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sec.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        style={{
                          borderBottom: '1px solid #cbd5e1',
                          background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                        }}
                      >
                        <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                          {rIdx + 1}
                        </td>
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} style={{ padding: '6px 8px', color: '#1e293b' }}>
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '11px',
              marginBottom: '30px',
            }}
          >
            <thead>
              <tr style={{ background: '#1e3a8a', color: '#ffffff', textAlign: 'left' }}>
                <th style={{ padding: '8px 10px', width: '35px', textAlign: 'center' }}>#</th>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: '8px 10px', fontWeight: '700' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  style={{
                    borderBottom: '1px solid #cbd5e1',
                    background: rIdx % 2 === 0 ? '#ffffff' : '#f8fafc',
                  }}
                >
                  <td style={{ padding: '7px 10px', textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                    {rIdx + 1}
                  </td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '7px 10px', color: '#1e293b' }}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Official Footer & Verification Sign-off */}
        <div
          style={{
            marginTop: '40px',
            paddingTop: '16px',
            borderTop: '1.5px solid #cbd5e1',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            fontSize: '11px',
            color: '#64748b',
          }}
        >
          <div>
            <div>{isMr ? 'प्रणाली: राजकीय व निवडणूक व्यवस्थापन प्रणाली' : 'System: Political & Election Management Suite'}</div>
            <div>{isMr ? 'डेटा स्रोत: थेट डेटाबेस सिंक • पान १/१' : 'Data Source: Direct Database Sync • Page 1/1'}</div>
          </div>

          <div style={{ textAlign: 'center', minWidth: '180px' }}>
            <div style={{ height: '35px' }} />
            <div style={{ borderTop: '1px dashed #64748b', paddingTop: '4px', fontWeight: '700', color: '#1e293b' }}>
              {isMr ? 'स्वाक्षरी: निवडणूक प्रमुख / जनसेवक' : 'Signature / Authorized Officer'}
            </div>
            <div style={{ fontSize: '10px' }}>{isMr ? '२८२ - सांगली विधानसभा क्षेत्र' : '282 - Sangli Assembly Constituency'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
