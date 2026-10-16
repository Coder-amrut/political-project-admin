import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/axios';

const I18N = {
  en: {
    title: 'Location Master Data Explorer',
    subtitle: 'Official government reference hierarchy for administrative states, districts, talukas, villages, and local bodies.',
    stateLabel: 'State *',
    districtLabel: 'District *',
    talukaLabel: 'Taluka / Block',
    allTalukas: 'All Talukas in District',
    selectDistrictFirst: 'Select a District first',
    viewCategory: 'View Data Category:',
    catDistricts: '📍 Districts',
    catTalukas: '🏢 Talukas',
    catVillages: '🌾 Villages',
    catLocalBodies: '🏛️ Local Bodies (Gram Panchayats)',
    searchPlaceholder: 'Search by name or code...',
    recordsFound: 'records found',
    showing: 'Showing',
    loading: 'Loading master data…',
    noRecords: 'No records found matching the selected filters.',
    colCode: 'Code',
    colName: 'Name',
    colDistrict: 'District',
    colTaluka: 'Taluka',
    colType: 'Type',
    colAction: 'Quick Action',
    viewVillagesBtn: 'View Villages →',
    viewLocalBodiesBtn: 'View Local Bodies →',
    exportCsv: 'Export CSV',
  },
  mr: {
    title: 'स्थान संदर्भ मास्टर डेटा',
    subtitle: 'राज्य, जिल्हे, तालुके, गावे आणि स्थानिक संस्था (ग्रामपंचायती) यांचा अधिकृत शासकीय संदर्भ डेटाबेस.',
    stateLabel: 'राज्य *',
    districtLabel: 'जिल्हा *',
    talukaLabel: 'तालुका',
    allTalukas: 'जिल्ह्यातील सर्व तालुके',
    selectDistrictFirst: 'प्रथम जिल्हा निवडा',
    viewCategory: 'माहिती प्रकार पहा:',
    catDistricts: '📍 जिल्हे',
    catTalukas: '🏢 तालुके',
    catVillages: '🌾 गावे',
    catLocalBodies: '🏛️ स्थानिक संस्था / ग्रामपंचायती',
    searchPlaceholder: 'नाव किंवा कोडनुसार शोधा...',
    recordsFound: 'नोंदी आढळल्या',
    showing: 'दाखवत आहे',
    loading: 'मास्टर डेटा लोड होत आहे…',
    noRecords: 'निवडलेल्या फिल्टरनुसार कोणत्याही नोंदी आढळल्या नाहीत.',
    colCode: 'कोड',
    colName: 'नाव',
    colDistrict: 'जिल्हा',
    colTaluka: 'तालुका',
    colType: 'प्रकार',
    colAction: 'कृती',
    viewVillagesBtn: 'गावे पहा →',
    viewLocalBodiesBtn: 'स्थानिक संस्था पहा →',
    exportCsv: 'CSV डाऊनलोड',
  },
};

function LocationMasterExplorer({ language = 'en' }) {
  const t = I18N[language] || I18N.en;

  // Selected hierarchy
  const [states, setStates] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState('27'); // 27 = Maharashtra

  const [districts, setDistricts] = useState([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('494'); // Default Sangli / or first

  const [talukas, setTalukas] = useState([]);
  const [selectedTalukaCode, setSelectedTalukaCode] = useState('');

  // Active view: 'districts' | 'talukas' | 'villages' | 'local_bodies'
  const [activeCategory, setActiveCategory] = useState('talukas');

  // Loaded data for table
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // 1. Load States on mount
  useEffect(() => {
    apiClient.get('/master-data/states')
      .then(({ data }) => {
        const list = data.data || [];
        setStates(list);
        if (list.length > 0 && !selectedStateCode) {
          setSelectedStateCode(list[0].state_code || '27');
        }
      })
      .catch(() => {});
  }, []);

  // 2. Load Districts when State is selected
  useEffect(() => {
    if (!selectedStateCode) {
      setDistricts([]);
      return;
    }
    apiClient.get('/master-data/districts')
      .then(({ data }) => {
        const list = data.data || [];
        setDistricts(list);
        // If current district not in list, pick default Sangli (494) or first
        if (list.length > 0) {
          const sangli = list.find((d) => String(d.district_code) === '494');
          if (!selectedDistrictCode) {
            setSelectedDistrictCode(sangli ? '494' : String(list[0].district_code));
          }
        }
      })
      .catch((err) => setError(err.message || 'Could not load districts'));
  }, [selectedStateCode]);

  // 3. Load Talukas when District is selected
  useEffect(() => {
    if (!selectedDistrictCode) {
      setTalukas([]);
      setSelectedTalukaCode('');
      return;
    }
    apiClient.get('/master-data/talukas', { params: { district_code: selectedDistrictCode } })
      .then(({ data }) => {
        const list = data.data || [];
        setTalukas(list);
        setSelectedTalukaCode(''); // Reset taluka selection to All
      })
      .catch((err) => setError(err.message || 'Could not load talukas'));
  }, [selectedDistrictCode]);

  // 4. Fetch Table Data based on Active Category & Hierarchy
  const fetchData = async () => {
    setLoading(true);
    setError('');
    setPage(1);

    try {
      if (activeCategory === 'districts') {
        const { data } = await apiClient.get('/master-data/districts');
        setTableData(data.data || []);
      } else if (activeCategory === 'talukas') {
        if (!selectedDistrictCode) {
          setTableData([]);
          setLoading(false);
          return;
        }
        const { data } = await apiClient.get('/master-data/talukas', {
          params: { district_code: selectedDistrictCode },
        });
        setTableData(data.data || []);
      } else if (activeCategory === 'villages') {
        if (!selectedDistrictCode) {
          setTableData([]);
          setLoading(false);
          return;
        }
        const params = { district_code: selectedDistrictCode };
        if (selectedTalukaCode) params.taluka_code = selectedTalukaCode;
        const { data } = await apiClient.get('/master-data/villages', { params });
        setTableData(data.data || []);
      } else if (activeCategory === 'local_bodies') {
        if (!selectedDistrictCode) {
          setTableData([]);
          setLoading(false);
          return;
        }
        const params = { district_code: selectedDistrictCode };
        if (selectedTalukaCode) params.taluka_code = selectedTalukaCode;
        const { data } = await apiClient.get('/master-data/local-bodies', { params });
        setTableData(data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load master data');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeCategory, selectedDistrictCode, selectedTalukaCode]);

  // Filtered Data based on Search Term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return tableData;
    const term = searchTerm.toLowerCase().trim();
    return tableData.filter((item) => {
      const name = (item.village_name || item.taluka_name || item.local_body_name || item.district_name || item.name_en || '').toLowerCase();
      const code = String(item.village_code || item.taluka_code || item.local_body_code || item.district_code || item.code || '').toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [tableData, searchTerm]);

  // Paginated Rows
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;

  // Selected names for breadcrumbs
  const selectedDistrictName = useMemo(() => {
    const d = districts.find((x) => String(x.district_code) === String(selectedDistrictCode));
    return d ? (d.district_name || d.name_en) : '';
  }, [districts, selectedDistrictCode]);

  const selectedTalukaName = useMemo(() => {
    const t = talukas.find((x) => String(x.taluka_code) === String(selectedTalukaCode));
    return t ? t.taluka_name : '';
  }, [talukas, selectedTalukaCode]);

  // Quick Action Handler to Drill Down
  const handleDrillDownToVillages = (talukaCode) => {
    setSelectedTalukaCode(String(talukaCode));
    setActiveCategory('villages');
  };

  const handleDrillDownToLocalBodies = (talukaCode) => {
    setSelectedTalukaCode(String(talukaCode));
    setActiveCategory('local_bodies');
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!filteredData.length) return;
    const headers = Object.keys(filteredData[0]).filter((k) => typeof filteredData[0][k] !== 'object');
    const csvContent = [
      headers.join(','),
      ...filteredData.map((row) =>
        headers.map((h) => `"${String(row[h] || '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${activeCategory}_${selectedDistrictName || 'data'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Styles
  const styles = {
    card: {
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '22px 24px',
      marginBottom: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', -apple-system, sans-serif",
    },
    filterBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: 14,
      background: '#f8fafc',
      padding: '16px 18px',
      borderRadius: 10,
      border: '1px solid #e2e8f0',
      marginBottom: 18,
    },
    label: {
      display: 'block',
      fontSize: 12.5,
      fontWeight: 700,
      color: '#334155',
      marginBottom: 6,
    },
    select: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: 8,
      fontSize: 13.5,
      color: '#0f172a',
      background: '#fff',
      boxSizing: 'border-box',
      cursor: 'pointer',
      outline: 'none',
    },
    input: {
      width: '100%',
      padding: '9px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: 8,
      fontSize: 13.5,
      color: '#0f172a',
      background: '#fff',
      boxSizing: 'border-box',
      outline: 'none',
    },
    categoryTab: (isActive) => ({
      padding: '8px 16px',
      borderRadius: 8,
      border: '1px solid',
      borderColor: isActive ? '#2563eb' : '#cbd5e1',
      background: isActive ? '#2563eb' : '#fff',
      color: isActive ? '#fff' : '#475569',
      fontWeight: 700,
      fontSize: 13,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      transition: 'all 0.15s ease',
    }),
    badge: (bg, col) => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontSize: 12,
      fontWeight: 650,
      padding: '3px 10px',
      borderRadius: 999,
      background: bg,
      color: col,
    }),
    btnPrimary: {
      padding: '9px 16px',
      background: '#2563eb',
      color: '#fff',
      border: 0,
      borderRadius: 8,
      fontWeight: 650,
      fontSize: 13,
      cursor: 'pointer',
    },
    btnSecondary: {
      padding: '7px 12px',
      background: '#f1f5f9',
      color: '#334155',
      border: '1px solid #cbd5e1',
      borderRadius: 6,
      fontWeight: 600,
      fontSize: 12,
      cursor: 'pointer',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: 12,
      fontSize: 13,
    },
    th: {
      textAlign: 'left',
      padding: '10px 14px',
      background: '#f8fafc',
      color: '#475569',
      fontWeight: 700,
      borderBottom: '2px solid #e2e8f0',
      fontSize: 12.5,
    },
    td: {
      padding: '10px 14px',
      borderBottom: '1px solid #f1f5f9',
      color: '#1e293b',
    },
  };

  return (
    <div style={styles.card}>
      {/* Title & Info Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            {t.title}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Breadcrumb Indicators */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={styles.badge('#f1f5f9', '#334155')}>
            {language === 'mr' ? 'राज्य:' : 'State:'} <b>{language === 'mr' ? 'महाराष्ट्र (२७)' : 'Maharashtra (27)'}</b>
          </span>
          {selectedDistrictName && (
            <span style={styles.badge('#eff6ff', '#1d4ed8')}>
              {language === 'mr' ? 'जिल्हा:' : 'District:'} <b>{selectedDistrictName} ({selectedDistrictCode})</b>
            </span>
          )}
          {selectedTalukaName && (
            <span style={styles.badge('#ecfdf5', '#047857')}>
              {language === 'mr' ? 'तालुका:' : 'Taluka:'} <b>{selectedTalukaName} ({selectedTalukaCode})</b>
            </span>
          )}
        </div>
      </div>

      {/* CASCADING FILTER BAR (State -> District -> Taluka) */}
      <div style={styles.filterBar}>
        {/* 1. STATE SELECTOR */}
        <div>
          <label style={styles.label}>{t.stateLabel}</label>
          <select
            value={selectedStateCode}
            onChange={(e) => setSelectedStateCode(e.target.value)}
            style={styles.select}
          >
            {states.length > 0 ? (
              states.map((s) => (
                <option key={s.state_code || s.id} value={s.state_code || s.id}>
                  {s.state_name || s.name || (language === 'mr' ? 'महाराष्ट्र' : 'Maharashtra')} ({s.state_code || '27'})
                </option>
              ))
            ) : (
              <option value="27">{language === 'mr' ? 'महाराष्ट्र (२७)' : 'Maharashtra (27)'}</option>
            )}
          </select>
        </div>

        {/* 2. DISTRICT SELECTOR */}
        <div>
          <label style={styles.label}>{t.districtLabel}</label>
          <select
            value={selectedDistrictCode}
            onChange={(e) => setSelectedDistrictCode(e.target.value)}
            style={styles.select}
          >
            <option value="">{language === 'mr' ? '-- जिल्हा निवडा --' : '-- Select District --'}</option>
            {districts.map((d) => (
              <option key={d.district_code} value={d.district_code}>
                {d.district_name || d.name_en} ({d.district_code})
              </option>
            ))}
          </select>
        </div>

        {/* 3. TALUKA SELECTOR */}
        <div>
          <label style={styles.label}>{t.talukaLabel}</label>
          <select
            disabled={!selectedDistrictCode}
            value={selectedTalukaCode}
            onChange={(e) => setSelectedTalukaCode(e.target.value)}
            style={{
              ...styles.select,
              background: !selectedDistrictCode ? '#f1f5f9' : '#fff',
              cursor: !selectedDistrictCode ? 'not-allowed' : 'pointer',
            }}
          >
            <option value="">{selectedDistrictCode ? t.allTalukas : t.selectDistrictFirst}</option>
            {talukas.map((tk) => (
              <option key={tk.taluka_code} value={tk.taluka_code}>
                {tk.taluka_name} ({tk.taluka_code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* CATEGORY SWITCHER TABS & SEARCH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setActiveCategory('talukas')}
            style={styles.categoryTab(activeCategory === 'talukas')}
          >
            {t.catTalukas} ({talukas.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('villages')}
            style={styles.categoryTab(activeCategory === 'villages')}
          >
            {t.catVillages}
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('local_bodies')}
            style={styles.categoryTab(activeCategory === 'local_bodies')}
          >
            {t.catLocalBodies}
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('districts')}
            style={styles.categoryTab(activeCategory === 'districts')}
          >
            {t.catDistricts} ({districts.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{ ...styles.input, width: 230, padding: '7px 11px', fontSize: 13 }}
          />
          {filteredData.length > 0 && (
            <button
              type="button"
              onClick={handleExportCsv}
              style={{ ...styles.btnSecondary, padding: '7px 12px' }}
            >
              📥 {t.exportCsv}
            </button>
          )}
        </div>
      </div>

      {/* COUNTER & STATUS BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #edf2f7', fontSize: 12.5, color: '#64748b', marginBottom: 8 }}>
        <div>
          📊 <b>{filteredData.length}</b> {t.recordsFound}
          {searchTerm && <span> ({language === 'mr' ? `एकूण ${tableData.length} पैकी शोधलेले` : `filtered from ${tableData.length}`})</span>}
          {activeCategory === 'villages' && selectedTalukaName && (
            <span style={{ color: '#0f172a', fontWeight: 600 }}>
              {language === 'mr' ? ` (${selectedTalukaName} तालुका)` : ` in ${selectedTalukaName} Taluka`}
            </span>
          )}
          {activeCategory === 'local_bodies' && selectedTalukaName && (
            <span style={{ color: '#0f172a', fontWeight: 600 }}>
              {language === 'mr' ? ` (${selectedTalukaName} तालुका)` : ` in ${selectedTalukaName} Taluka`}
            </span>
          )}
        </div>
        {filteredData.length > pageSize && (
          <div>
            {t.showing} {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, filteredData.length)} {language === 'mr' ? 'पैकी' : 'of'} {filteredData.length}
          </div>
        )}
      </div>

      {error && (
        <div role="alert" style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* DATA TABLE */}
      {loading ? (
        <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
          ⏳ {t.loading}
        </div>
      ) : filteredData.length === 0 ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', background: '#fafafa', borderRadius: 8, border: '1px dashed #cbd5e1', color: '#64748b', fontSize: 13 }}>
          {t.noRecords}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 60 }}>#</th>
                <th style={styles.th}>{t.colCode}</th>
                <th style={styles.th}>{t.colName}</th>
                {activeCategory !== 'districts' && <th style={styles.th}>{t.colDistrict}</th>}
                {(activeCategory === 'villages' || activeCategory === 'local_bodies') && (
                  <th style={styles.th}>{t.colTaluka}</th>
                )}
                {activeCategory === 'local_bodies' && <th style={styles.th}>{t.colType}</th>}
                {activeCategory === 'talukas' && <th style={styles.th}>{t.colAction}</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedRows.map((row, idx) => {
                const rowNum = (page - 1) * pageSize + idx + 1;
                return (
                  <tr key={row.id || row.code || row.village_code || row.taluka_code || row.district_code || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ ...styles.td, color: '#94a3b8', fontSize: 12 }}>{rowNum}</td>

                    {/* CODE */}
                    <td style={styles.td}>
                      <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a', fontWeight: 600 }}>
                        {row.local_body_code || row.village_code || row.taluka_code || row.district_code || row.code || '—'}
                      </code>
                    </td>

                    {/* NAME */}
                    <td style={{ ...styles.td, fontWeight: 650, color: '#0f172a' }}>
                      {row.local_body_name || row.village_name || row.taluka_name || row.district_name || row.name_en || row.name || '—'}
                      {row.name_mr && <span style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 400 }}>{row.name_mr}</span>}
                    </td>

                    {/* DISTRICT */}
                    {activeCategory !== 'districts' && (
                      <td style={styles.td}>
                        {selectedDistrictName} <span style={{ fontSize: 11, color: '#94a3b8' }}>({row.district_code || selectedDistrictCode})</span>
                      </td>
                    )}

                    {/* TALUKA */}
                    {(activeCategory === 'villages' || activeCategory === 'local_bodies') && (
                      <td style={styles.td}>
                        {(() => {
                          const tCode = row.taluka_code || row.parent_code;
                          const tObj = talukas.find((x) => String(x.taluka_code) === String(tCode));
                          return tObj ? `${tObj.taluka_name} (${tCode})` : (tCode || '—');
                        })()}
                      </td>
                    )}

                    {/* LOCAL BODY TYPE */}
                    {activeCategory === 'local_bodies' && (
                      <td style={styles.td}>
                        <span style={styles.badge(row.local_body_type === 'G' ? '#ecfdf5' : '#f0f9ff', row.local_body_type === 'G' ? '#047857' : '#0369a1')}>
                          {row.local_body_type === 'G' ? (language === 'mr' ? 'ग्रामपंचायत' : 'Gram Panchayat (G)') : (row.local_body_type || (language === 'mr' ? 'स्थानिक संस्था' : 'Local Body'))}
                        </span>
                      </td>
                    )}

                    {/* TALUKA QUICK DRILL-DOWN ACTIONS */}
                    {activeCategory === 'talukas' && (
                      <td style={styles.td}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleDrillDownToVillages(row.taluka_code)}
                            style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11.5 }}
                          >
                            {t.viewVillagesBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDrillDownToLocalBodies(row.taluka_code)}
                            style={{ ...styles.btnSecondary, padding: '4px 8px', fontSize: 11.5 }}
                          >
                            {t.viewLocalBodiesBtn}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 10, borderTop: '1px solid #e2e8f0', fontSize: 13 }}>
          <div style={{ color: '#64748b' }}>
            {language === 'mr' ? (
              <>पान क्र. <b>{page}</b> / <b>{totalPages}</b></>
            ) : (
              <>Page <b>{page}</b> of <b>{totalPages}</b></>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{ ...styles.btnSecondary, opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
            >
              {language === 'mr' ? '← मागील' : '← Previous'}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{ ...styles.btnSecondary, opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? 'not-allowed' : 'pointer' }}
            >
              {language === 'mr' ? 'पुढील →' : 'Next →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationMasterExplorer;
