import React, { useState, useEffect, useMemo, useRef } from 'react';
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

export const INDIAN_STATES_ALL = [
  { state_code: '27', state_name: 'Maharashtra', state_name_mr: 'महाराष्ट्र' },
  { state_code: '28', state_name: 'Andhra Pradesh', state_name_mr: 'आंध्र प्रदेश' },
  { state_code: '12', state_name: 'Arunachal Pradesh', state_name_mr: 'अरुणाचल प्रदेश' },
  { state_code: '18', state_name: 'Assam', state_name_mr: 'आसाम' },
  { state_code: '10', state_name: 'Bihar', state_name_mr: 'बिहार' },
  { state_code: '22', state_name: 'Chhattisgarh', state_name_mr: 'छत्तीसगड' },
  { state_code: '30', state_name: 'Goa', state_name_mr: 'गोवा' },
  { state_code: '24', state_name: 'Gujarat', state_name_mr: 'गुजरात' },
  { state_code: '06', state_name: 'Haryana', state_name_mr: 'हरियाणा' },
  { state_code: '02', state_name: 'Himachal Pradesh', state_name_mr: 'हिमाचल प्रदेश' },
  { state_code: '20', state_name: 'Jharkhand', state_name_mr: 'झारखंड' },
  { state_code: '29', state_name: 'Karnataka', state_name_mr: 'कर्नाटक' },
  { state_code: '32', state_name: 'Kerala', state_name_mr: 'केरळ' },
  { state_code: '23', state_name: 'Madhya Pradesh', state_name_mr: 'मध्य प्रदेश' },
  { state_code: '14', state_name: 'Manipur', state_name_mr: 'मणिपूर' },
  { state_code: '17', state_name: 'Meghalaya', state_name_mr: 'मेघालय' },
  { state_code: '15', state_name: 'Mizoram', state_name_mr: 'मिझोराम' },
  { state_code: '13', state_name: 'Nagaland', state_name_mr: 'नागालँड' },
  { state_code: '21', state_name: 'Odisha', state_name_mr: 'ओडिशा' },
  { state_code: '03', state_name: 'Punjab', state_name_mr: 'पंजाब' },
  { state_code: '08', state_name: 'Rajasthan', state_name_mr: 'राजस्थान' },
  { state_code: '11', state_name: 'Sikkim', state_name_mr: 'सिक्कीम' },
  { state_code: '33', state_name: 'Tamil Nadu', state_name_mr: 'तमिळनाडू' },
  { state_code: '36', state_name: 'Telangana', state_name_mr: 'तेलंगणा' },
  { state_code: '16', state_name: 'Tripura', state_name_mr: 'त्रिपुरा' },
  { state_code: '09', state_name: 'Uttar Pradesh', state_name_mr: 'उत्तर प्रदेश' },
  { state_code: '05', state_name: 'Uttarakhand', state_name_mr: 'उत्तराखंड' },
  { state_code: '19', state_name: 'West Bengal', state_name_mr: 'पश्चिम बंगाल' },
  { state_code: '35', state_name: 'Andaman and Nicobar Islands', state_name_mr: 'अंदमान आणि निकोबार' },
  { state_code: '04', state_name: 'Chandigarh', state_name_mr: 'चंदिगढ' },
  { state_code: '26', state_name: 'Dadra and Nagar Haveli and Daman and Diu', state_name_mr: 'दादरा व नगर हवेली आणि दमण व दीव' },
  { state_code: '07', state_name: 'Delhi', state_name_mr: 'दिल्ली' },
  { state_code: '01', state_name: 'Jammu and Kashmir', state_name_mr: 'जम्मू आणि काश्मीर' },
  { state_code: '37', state_name: 'Ladakh', state_name_mr: 'लडाख' },
  { state_code: '31', state_name: 'Lakshadweep', state_name_mr: 'लक्षद्वीप' },
  { state_code: '34', state_name: 'Puducherry', state_name_mr: 'पुद्दुचेरी' },
];

function SearchableSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = '-- Select --',
  disabled = false,
  language = 'en',
  emptyText = 'No options found',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close on outside click (mouse & touch)
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when open
  useEffect(() => {
    if (isOpen) {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter options
  const filteredOptions = useMemo(() => {
    if (!search.trim()) return options;
    const term = search.toLowerCase().trim();
    return options.filter((opt) =>
      String(opt.label || opt.name || '').toLowerCase().includes(term) ||
      String(opt.value || opt.code || '').toLowerCase().includes(term)
    );
  }, [options, search]);

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value));
  }, [options, value]);

  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div
      ref={wrapperRef}
      style={{
        position: 'relative',
        width: '100%',
        minWidth: 0,
        zIndex: isOpen ? 50 : 1,
      }}
    >
      {label && (
        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        style={{
          width: '100%',
          padding: '9.5px 12px',
          border: isOpen ? '1.5px solid #2563eb' : '1.5px solid #cbd5e1',
          borderRadius: 9,
          fontSize: 13.5,
          color: disabled ? '#94a3b8' : selectedOption && selectedOption.value !== '' ? '#0f172a' : '#64748b',
          background: disabled ? '#f1f5f9' : '#ffffff',
          boxSizing: 'border-box',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          textAlign: 'left',
          fontFamily: 'inherit',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: selectedOption && selectedOption.value !== '' ? 650 : 400 }}>
          {displayLabel}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke={isOpen ? '#2563eb' : '#64748b'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            transition: 'transform 0.2s ease',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            right: 0,
            zIndex: 9999,
            background: '#ffffff',
            border: '1.5px solid #93c5fd',
            borderRadius: 10,
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.22), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '260px',
            animation: 'fadeInDropdown 0.15s ease-out',
          }}
        >
          {/* Search Box inside dropdown */}
          {options.length > 5 && (
            <div
              style={{
                padding: '8px 10px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: 13, color: '#94a3b8' }}>🔍</span>
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={language === 'mr' ? 'नाव किंवा कोडने शोधा...' : 'Search by name or code...'}
                style={{
                  width: '100%',
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: 12.5,
                  color: '#0f172a',
                  fontFamily: 'inherit',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          )}

          {/* Scrollable list */}
          <div
            style={{
              overflowY: 'auto',
              padding: '4px',
              flex: 1,
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px 14px', fontSize: 12.5, color: '#94a3b8', textAlign: 'center' }}>
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '8.5px 12px',
                      borderRadius: 7,
                      fontSize: 13,
                      color: isSelected ? '#1e40af' : '#1e293b',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      fontWeight: isSelected ? 750 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      transition: 'background 0.12s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {opt.label}
                    </span>
                    {isSelected && (
                      <span style={{ color: '#2563eb', fontWeight: 800, fontSize: 13 }}>✓</span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LocationMasterExplorer({ language = 'en' }) {
  const t = I18N[language] || I18N.en;

  // Selected hierarchy
  const [states, setStates] = useState(INDIAN_STATES_ALL);
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

  // 1. Load States on mount from backend API and merge Marathi names
  useEffect(() => {
    apiClient.get('/master-data/states')
      .then(({ data }) => {
        const list = data.data || [];
        if (list.length > 0) {
          const merged = list.map((st) => {
            const match = INDIAN_STATES_ALL.find((x) => String(x.state_code) === String(st.state_code));
            return {
              ...st,
              state_name_mr: match?.state_name_mr || st.state_name_mr || st.state_name,
            };
          });
          setStates(merged);
        }
      })
      .catch(() => {});
  }, []);

  // 2. Load Districts when State is selected
  useEffect(() => {
    if (!selectedStateCode) {
      setDistricts([]);
      setSelectedDistrictCode('');
      setTalukas([]);
      setSelectedTalukaCode('');
      setTableData([]);
      return;
    }

    if (String(selectedStateCode) !== '27') {
      // Non-Maharashtra state selected - clear sub-hierarchies
      setDistricts([]);
      setSelectedDistrictCode('');
      setTalukas([]);
      setSelectedTalukaCode('');
      setTableData([]);
      return;
    }

    apiClient.get('/master-data/districts')
      .then(({ data }) => {
        const list = data.data || [];
        setDistricts(list);
        if (list.length > 0) {
          const sangli = list.find((d) => String(d.district_code) === '494');
          setSelectedDistrictCode(sangli ? '494' : String(list[0].district_code));
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
  const selectedStateName = useMemo(() => {
    const s = states.find((x) => String(x.state_code) === String(selectedStateCode));
    if (!s) return language === 'mr' ? 'महाराष्ट्र' : 'Maharashtra';
    return language === 'mr' && s.state_name_mr ? s.state_name_mr : (s.state_name || s.name);
  }, [states, selectedStateCode, language]);

  const selectedDistrictName = useMemo(() => {
    const d = districts.find((x) => String(x.district_code) === String(selectedDistrictCode));
    return d ? (d.district_name || d.name_en) : '';
  }, [districts, selectedDistrictCode]);

  const selectedTalukaName = useMemo(() => {
    const t = talukas.find((x) => String(x.taluka_code) === String(selectedTalukaCode));
    return t ? t.taluka_name : '';
  }, [talukas, selectedTalukaCode]);

  // Formatted Options for Custom Searchable Selects
  const stateOptions = useMemo(() => {
    return states.map((s) => {
      const label = language === 'mr' && s.state_name_mr ? s.state_name_mr : (s.state_name || s.name);
      return {
        value: String(s.state_code || s.id),
        label: `${label} (${s.state_code})`,
      };
    });
  }, [states, language]);

  const districtOptions = useMemo(() => {
    const defaultPlaceholder = String(selectedStateCode) !== '27'
      ? (language === 'mr' ? '-- इतर राज्यांचा डेटा उपलब्ध नाही --' : '-- No District Data for Selected State --')
      : (language === 'mr' ? '-- जिल्हा निवडा --' : '-- Select District --');

    const list = [
      { value: '', label: defaultPlaceholder }
    ];

    districts.forEach((d) => {
      list.push({
        value: String(d.district_code),
        label: `${d.district_name || d.name_en} (${d.district_code})`,
      });
    });

    return list;
  }, [districts, selectedStateCode, language]);

  const talukaOptions = useMemo(() => {
    const defaultPlaceholder = selectedDistrictCode ? t.allTalukas : t.selectDistrictFirst;
    const list = [
      { value: '', label: defaultPlaceholder }
    ];

    talukas.forEach((tk) => {
      list.push({
        value: String(tk.taluka_code),
        label: `${tk.taluka_name} (${tk.taluka_code})`,
      });
    });

    return list;
  }, [talukas, selectedDistrictCode, t]);

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
      border: '1px solid #cbd5e1',
      borderRadius: 14,
      padding: '24px 26px',
      marginBottom: 20,
      boxShadow: '0 4px 20px rgba(23, 84, 190, 0.05)',
      fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', -apple-system, sans-serif",
    },
    filterBar: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: 14,
      background: '#f8fafc',
      padding: '16px 18px',
      borderRadius: 12,
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
      padding: '9.5px 12px',
      border: '1.5px solid #cbd5e1',
      borderRadius: 9,
      fontSize: 13.5,
      color: '#0f172a',
      background: '#fff',
      boxSizing: 'border-box',
      cursor: 'pointer',
      outline: 'none',
      transition: 'all 0.15s ease',
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
    <div className="admin-card-responsive loc-master-card" style={{ ...styles.card, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {/* 3D Animations & Royal Blue Dashboard-Matched Theme */}
      <style>{`
        @keyframes fadeInDropdown {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 640px) {
          .loc-master-card {
            padding: 14px 10px !important;
          }
        }
        .loc-tab-3d-active {
          background: linear-gradient(180deg, #2b74f0 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.4) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.7) !important;
          border-bottom: 3.5px solid #0f3a88 !important;
          box-shadow: 0 4px 14px rgba(23, 84, 190, 0.45), 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.65) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 10px !important;
          transform-style: preserve-3d;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
        }
        .loc-tab-3d-active:hover {
          transform: translateY(-2.5px) scale(1.02) !important;
          box-shadow: 0 8px 22px rgba(23, 84, 190, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.85) !important;
        }
        .loc-tab-3d-active:active {
          transform: translateY(2px) scale(0.98) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
          box-shadow: 0 2px 6px rgba(23, 84, 190, 0.35) !important;
        }

        .loc-tab-3d-inactive {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 3px solid #94a3b8 !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff !important;
          border-radius: 10px !important;
          transform-style: preserve-3d;
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
        }
        .loc-tab-3d-inactive:hover {
          transform: translateY(-2px) !important;
          color: #1e60d5 !important;
          border-color: #93c5fd !important;
          border-bottom-color: #3b82f6 !important;
          box-shadow: 0 6px 16px rgba(30, 96, 213, 0.18), inset 0 1px 1px #ffffff !important;
        }
        .loc-tab-3d-inactive:active {
          transform: translateY(1.5px) !important;
          border-bottom: 1.5px solid #94a3b8 !important;
        }

        .loc-btn-3d-sm {
          background: linear-gradient(180deg, #ffffff 0%, #f1f5f9 100%) !important;
          color: #1e60d5 !important;
          border: 1px solid #bfdbfe !important;
          border-bottom: 2.5px solid #93c5fd !important;
          box-shadow: 0 2px 4px rgba(30, 96, 213, 0.08) !important;
          border-radius: 6px !important;
          transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 750 !important;
        }
        .loc-btn-3d-sm:hover {
          transform: translateY(-1.5px) !important;
          background: #eff6ff !important;
          border-color: #60a5fa !important;
          border-bottom-color: #2563eb !important;
          box-shadow: 0 4px 10px rgba(30, 96, 213, 0.2) !important;
        }
        .loc-btn-3d-sm:active {
          transform: translateY(1px) !important;
          border-bottom: 1px solid #2563eb !important;
        }

        .btn-3d-export {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #0f172a !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 3px solid #94a3b8 !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06), inset 0 1px 1px #ffffff !important;
          border-radius: 8px !important;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 700 !important;
        }
        .btn-3d-export:hover {
          transform: translateY(-2px) !important;
          color: #1e60d5 !important;
          border-color: #93c5fd !important;
          border-bottom-color: #3b82f6 !important;
          box-shadow: 0 6px 14px rgba(30, 96, 213, 0.18) !important;
        }
        .btn-3d-export:active {
          transform: translateY(1.5px) !important;
          border-bottom: 1.5px solid #94a3b8 !important;
        }
      `}</style>

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

        {/* Breadcrumb Indicators with Royal Blue Symmetry */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={styles.badge('#f1f5f9', '#1e293b')}>
            {language === 'mr' ? 'राज्य:' : 'State:'} <b>{selectedStateName} ({selectedStateCode})</b>
          </span>
          {selectedDistrictName && (
            <span style={styles.badge('#eff6ff', '#1754be')}>
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
      <div style={{ ...styles.filterBar, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', position: 'relative' }}>
        {/* 1. STATE SELECTOR */}
        <SearchableSelect
          label={t.stateLabel}
          value={selectedStateCode}
          onChange={(val) => setSelectedStateCode(val)}
          options={stateOptions}
          language={language}
          placeholder={language === 'mr' ? 'राज्य निवडा' : 'Select State'}
          emptyText={language === 'mr' ? 'राज्य आढळले नाही' : 'No state found'}
        />

        {/* 2. DISTRICT SELECTOR */}
        <SearchableSelect
          label={t.districtLabel}
          value={selectedDistrictCode}
          onChange={(val) => setSelectedDistrictCode(val)}
          options={districtOptions}
          language={language}
          placeholder={language === 'mr' ? '-- जिल्हा निवडा --' : '-- Select District --'}
          disabled={districts.length === 0}
          emptyText={language === 'mr' ? 'जिल्हा आढळला नाही' : 'No district found'}
        />

        {/* 3. TALUKA SELECTOR */}
        <SearchableSelect
          label={t.talukaLabel}
          value={selectedTalukaCode}
          onChange={(val) => setSelectedTalukaCode(val)}
          options={talukaOptions}
          language={language}
          placeholder={selectedDistrictCode ? t.allTalukas : t.selectDistrictFirst}
          disabled={!selectedDistrictCode}
          emptyText={language === 'mr' ? 'तालुका आढळला नाही' : 'No taluka found'}
        />
      </div>

      {/* CATEGORY SWITCHER TABS & SEARCH */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            className={activeCategory === 'talukas' ? 'loc-tab-3d-active' : 'loc-tab-3d-inactive'}
            onClick={() => setActiveCategory('talukas')}
            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
          >
            {t.catTalukas} ({talukas.length})
          </button>
          <button
            type="button"
            className={activeCategory === 'villages' ? 'loc-tab-3d-active' : 'loc-tab-3d-inactive'}
            onClick={() => setActiveCategory('villages')}
            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
          >
            {t.catVillages}
          </button>
          <button
            type="button"
            className={activeCategory === 'local_bodies' ? 'loc-tab-3d-active' : 'loc-tab-3d-inactive'}
            onClick={() => setActiveCategory('local_bodies')}
            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
          >
            {t.catLocalBodies}
          </button>
          <button
            type="button"
            className={activeCategory === 'districts' ? 'loc-tab-3d-active' : 'loc-tab-3d-inactive'}
            onClick={() => setActiveCategory('districts')}
            style={{ padding: '8px 18px', fontSize: 13, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
          >
            {t.catDistricts} ({districts.length})
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            style={{
              ...styles.input,
              width: 240,
              padding: '8px 14px',
              fontSize: 13,
              borderRadius: 9,
              border: '1.5px solid #cbd5e1',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1e60d5';
              e.target.style.boxShadow = '0 0 0 3px rgba(30, 96, 213, 0.15)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#cbd5e1';
              e.target.style.boxShadow = 'none';
            }}
          />
          {filteredData.length > 0 && (
            <button
              type="button"
              className="btn-3d-export"
              onClick={handleExportCsv}
              style={{ padding: '8px 16px', fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6, userSelect: 'none' }}
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
      ) : String(selectedStateCode) !== '27' ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', background: '#f8fafc', borderRadius: 8, border: '1px dashed #94a3b8', color: '#475569', fontSize: 13 }}>
          ℹ️ {language === 'mr'
            ? `निवडलेले राज्य "${selectedStateName}" चे स्थानिक जिल्हे, तालुके व गावे या प्रणालीमध्ये समाविष्ट नाहीत. सध्या फक्त महाराष्ट्र (२७) चे सर्व ३६ जिल्हे उपलब्ध आहेत.`
            : `Districts, talukas and villages for "${selectedStateName}" are not configured yet. Currently only Maharashtra (27) full master data is loaded.`}
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
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            type="button"
                            className="loc-btn-3d-sm"
                            onClick={() => handleDrillDownToVillages(row.taluka_code)}
                            style={{ padding: '5px 12px', fontSize: 12, userSelect: 'none' }}
                          >
                            {t.viewVillagesBtn}
                          </button>
                          <button
                            type="button"
                            className="loc-btn-3d-sm"
                            onClick={() => handleDrillDownToLocalBodies(row.taluka_code)}
                            style={{ padding: '5px 12px', fontSize: 12, userSelect: 'none' }}
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
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              className="loc-tab-3d-inactive"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                opacity: page <= 1 ? 0.45 : 1,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                userSelect: 'none'
              }}
            >
              {language === 'mr' ? '← मागील' : '← Previous'}
            </button>
            <button
              type="button"
              className="loc-tab-3d-inactive"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 700,
                opacity: page >= totalPages ? 0.45 : 1,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                userSelect: 'none'
              }}
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
