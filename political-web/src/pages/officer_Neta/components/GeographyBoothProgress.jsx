import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';
import ResponsiveSelect from '../../../components/ResponsiveSelect';

const formatBoothNo = (boothNo, isMr) => {
  if (!boothNo) return '';
  if (isMr) return boothNo;
  const devanagariDigits = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };
  let formatted = String(boothNo).replace(/[०-९]/g, (d) => devanagariDigits[d] || d);
  formatted = formatted.replace(/बूथ\s*क्र\.?\s*/i, 'Booth No. ');
  return formatted;
};

export default function GeographyBoothProgress({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  // Filters state (all values fetched from MySQL tables)
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedAssembly, setSelectedAssembly] = useState('all');
  const [selectedTaluka, setSelectedTaluka] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedIncharge, setSelectedIncharge] = useState('all');
  const [coverageFilter, setCoverageFilter] = useState('all'); // all, high, medium, low, sensitive
  const [searchQuery, setSearchQuery] = useState('');
  
  // Database data states
  const [booths, setBooths] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [selectedBoothModal, setSelectedBoothModal] = useState(null);

  // 1. Fetch dynamic dropdown filter options from DB
  const loadGeographyFilters = async (district = null, assembly = null, taluka = null) => {
    try {
      setLoadingFilters(true);
      const params = {};
      if (district && district !== 'all') params.district = district;
      if (assembly && assembly !== 'all') params.assembly = assembly;
      if (taluka && taluka !== 'all') params.taluka = taluka;
      const res = await netaApi.getGeographyFilters(params);
      if (res.success) {
        setGeoData(res.data);
      }
    } catch (err) {
      console.error('Failed to load geography filters from DB:', err);
    } finally {
      setLoadingFilters(false);
    }
  };

  // 2. Fetch booths matching user's selected dropdowns from DB
  const fetchBooths = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedDistrict !== 'all') params.district = selectedDistrict;
      if (selectedAssembly !== 'all') params.assembly = selectedAssembly;
      if (selectedTaluka !== 'all') params.taluka = selectedTaluka;
      if (selectedVillage !== 'all') params.village = selectedVillage;
      if (selectedIncharge !== 'all') params.incharge = selectedIncharge;
      if (coverageFilter !== 'all') params.coverage_filter = coverageFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await netaApi.getBooths(params);
      if (res.success) {
        setBooths(res.data || []);
      }
    } catch (err) {
      console.error('Failed to load booths from DB:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load geography dropdown options when district, assembly or taluka changes
  useEffect(() => {
    loadGeographyFilters(selectedDistrict, selectedAssembly, selectedTaluka);
  }, [selectedDistrict, selectedAssembly, selectedTaluka]);

  // Load filtered booths whenever any dropdown or search changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooths();
    }, 200);
    return () => clearTimeout(timer);
  }, [
    selectedDistrict,
    selectedAssembly,
    selectedTaluka,
    selectedVillage,
    selectedIncharge,
    coverageFilter,
    searchQuery,
  ]);

  const handleResetFilters = () => {
    setSelectedDistrict('all');
    setSelectedAssembly('all');
    setSelectedTaluka('all');
    setSelectedVillage('all');
    setSelectedIncharge('all');
    setCoverageFilter('all');
    setSearchQuery('');
  };

  // Process distinct options from DB
  const districtList = [];
  const seenDistricts = new Set();
  (geoData?.booth_districts || []).forEach((d) => {
    const val = d.district_mr || d.district_en;
    if (val && !seenDistricts.has(val)) {
      seenDistricts.add(val);
      districtList.push({ value: val, label_mr: d.district_mr || val, label_en: d.district_en || val });
    }
  });
  (geoData?.master_districts || []).forEach((d) => {
    const val = d.name_mr || d.name_en;
    if (val && !seenDistricts.has(val)) {
      seenDistricts.add(val);
      districtList.push({ value: val, label_mr: d.name_mr || val, label_en: d.name_en || val });
    }
  });

  const assemblyList = [];
  const seenAssemblies = new Set();
  (geoData?.booth_assemblies || []).forEach((a) => {
    const val = a.assembly_mr || a.assembly_en;
    if (val && !seenAssemblies.has(val)) {
      seenAssemblies.add(val);
      assemblyList.push({ value: val, label_mr: a.assembly_mr || val, label_en: a.assembly_en || val });
    }
  });
  (geoData?.master_assemblies || []).forEach((a) => {
    const val = a.name_mr || a.name_en || (a.no ? `${a.no} - ${a.name_en}` : null);
    if (val && !seenAssemblies.has(val)) {
      seenAssemblies.add(val);
      assemblyList.push({ value: val, label_mr: a.name_mr || val, label_en: a.name_en || val });
    }
  });

  const talukaList = [];
  const seenTalukas = new Set();
  (geoData?.booth_talukas || []).forEach((t) => {
    const val = t.taluka_mr || t.taluka_en;
    if (val && !seenTalukas.has(val)) {
      seenTalukas.add(val);
      talukaList.push({ value: val, label_mr: t.taluka_mr || val, label_en: t.taluka_en || val });
    }
  });
  (geoData?.master_talukas || []).forEach((t) => {
    const val = t.name_mr || t.name_en || t.taluka_name;
    if (val && !seenTalukas.has(val)) {
      seenTalukas.add(val);
      talukaList.push({ value: val, label_mr: t.name_mr || val, label_en: t.name_en || val });
    }
  });

  const villageList = [];
  const seenVillages = new Set();
  (geoData?.booth_villages || []).forEach((v) => {
    const val = v.village_mr || v.village_en;
    if (val && !seenVillages.has(val)) {
      seenVillages.add(val);
      villageList.push({ value: val, label_mr: v.village_mr || val, label_en: v.village_en || val });
    }
  });

  const inchargeList = (geoData?.incharges || []).filter(
    (item, index, self) =>
      Boolean(item.incharge_name) &&
      index === self.findIndex((t) => t.incharge_name === item.incharge_name)
  );

  // Prepared option arrays for touch-friendly ResponsiveSelect
  const districtOptions = [
    { value: 'all', label: isMr ? 'सर्व जिल्हे' : 'All Districts' },
    ...districtList.map((d) => ({
      value: d.value,
      label: isMr ? (d.label_mr || d.value) : (d.label_en || d.value),
    })),
  ];

  const assemblyOptions = [
    { value: 'all', label: isMr ? 'सर्व विधानसभा' : 'All Assemblies' },
    ...assemblyList.map((a) => ({
      value: a.value,
      label: isMr ? (a.label_mr || a.value) : (a.label_en || a.value),
    })),
  ];

  const talukaOptions = [
    { value: 'all', label: isMr ? 'सर्व तालुके व प्रभाग' : 'All Talukas & Wards' },
    ...talukaList.map((t) => ({
      value: t.value,
      label: isMr ? (t.label_mr || t.value) : (t.label_en || t.value),
    })),
  ];

  const villageOptions = [
    { value: 'all', label: isMr ? 'सर्व गावे व प्रभाग' : 'All Villages & Wards' },
    ...villageList.map((v) => ({
      value: v.value,
      label: isMr ? (v.label_mr || v.value) : (v.label_en || v.value),
    })),
  ];

  const inchargeOptions = [
    { value: 'all', label: isMr ? 'सर्व बूथ प्रमुख' : 'All Incharges' },
    ...inchargeList.map((inc) => ({
      value: inc.incharge_name,
      label: `${isMr ? inc.incharge_name : (inc.incharge_name_en || inc.incharge_name)} (${formatBoothNo(inc.booth_no, isMr)})`,
    })),
  ];

  return (
    <div className="geo-progress-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .geo-filter-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 20px 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.04);
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
        }
        .geo-filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
          gap: 14px;
          box-sizing: border-box;
          width: 100%;
        }
        .geo-desktop-table {
          display: block;
        }
        .geo-mobile-cards {
          display: none;
        }

        @media (max-width: 640px) {
          .geo-filter-card {
            padding: 14px 12px !important;
            border-radius: 10px !important;
          }
          .geo-filter-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .geo-desktop-table {
            display: none !important;
          }
          .geo-mobile-cards {
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            padding: 12px !important;
          }
          .geo-modal-body {
            padding: 16px 14px !important;
            max-height: 88vh !important;
          }
        }
      `}</style>

      {/* Title & Database Connected Status */}
      <div className="geo-filter-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '16px', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#475569',
              fontSize: '12px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            title={isMr ? 'सर्व फिल्टर्स पूर्ववत करा' : 'Reset all filters'}
          >
            🔄 {isMr ? 'रीसेट' : 'Reset'}
          </button>
          <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
            {isMr ? 'उपलब्ध बूथ:' : 'Booths:'} <strong style={{ color: '#2563eb' }}>{booths.length}</strong>
          </span>
        </div>

        {/* Database-Driven Dynamic Dropdowns Grid */}
        <div className="geo-filter-grid">
          {/* Level 1: District Dropdown from DB (Touch-Friendly ResponsiveSelect) */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
              {isMr ? '१. जिल्हा' : '1. District'}
            </label>
            <ResponsiveSelect
              value={selectedDistrict}
              options={districtOptions}
              isMr={isMr}
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedAssembly('all');
                setSelectedTaluka('all');
                setSelectedVillage('all');
              }}
            />
          </div>

          {/* Level 2: Assembly Dropdown from DB */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
              {isMr ? '२. विधानसभा' : '2. Vidhan Sabha'}
            </label>
            <ResponsiveSelect
              value={selectedAssembly}
              options={assemblyOptions}
              isMr={isMr}
              onChange={(e) => {
                setSelectedAssembly(e.target.value);
                setSelectedTaluka('all');
                setSelectedVillage('all');
              }}
            />
          </div>

          {/* Level 3: Taluka / Sub-region Dropdown from DB */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
              {isMr ? '३. तालुका / प्रभाग' : '3. Taluka / Sub-region'}
            </label>
            <ResponsiveSelect
              value={selectedTaluka}
              options={talukaOptions}
              isMr={isMr}
              onChange={(e) => {
                setSelectedTaluka(e.target.value);
                setSelectedVillage('all');
              }}
            />
          </div>

          {/* Level 4: Village / Ward Dropdown from DB */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
              {isMr ? '४. गाव / वॉर्ड' : '4. Village / Ward'}
            </label>
            <ResponsiveSelect
              value={selectedVillage}
              options={villageOptions}
              isMr={isMr}
              onChange={(e) => setSelectedVillage(e.target.value)}
            />
          </div>

          {/* Level 5: Incharge / Booth Select Dropdown from DB */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
              {isMr ? '५. बूथ प्रमुख' : '5. Booth In-charge'}
            </label>
            <ResponsiveSelect
              value={selectedIncharge}
              options={inchargeOptions}
              isMr={isMr}
              onChange={(e) => setSelectedIncharge(e.target.value)}
            />
          </div>

          {/* Level 6: Live Search Input */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '5px' }}>
              {isMr ? '६. थेट शोध' : '6. Search Booth / Incharge'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder={isMr ? 'उदा. क्र. १, सचिन, माधवनगर...' : 'e.g. No. 1, Sachin...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '9px 32px 9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontWeight: '500',
                  background: '#f8fafc',
                  minHeight: '40px',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '15px',
                    padding: 0,
                  }}
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booths Grid / Table */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}
      >
        {loading ? (
          <div style={{ padding: '36px', textAlign: 'center', color: '#1e3a8a', fontWeight: '700' }}>
            ⏳ {isMr ? 'डेटाबेसमधून बूथ माहिती आणली जात आहे...' : 'Fetching booths from database...'}
          </div>
        ) : (
          <>
            {/* Desktop View Table (Screens > 640px) */}
            <div className="geo-desktop-table" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'बूथ क्रमांक व नाव' : 'Booth No & Center Name'}</th>
                    <th style={{ padding: '12px 14px' }}>{isMr ? 'तालुका / गाव' : 'Taluka / Village'}</th>
                    <th style={{ padding: '12px 14px' }}>{isMr ? 'पूर्ण मोजणी' : 'Completed Count'}</th>
                    <th style={{ padding: '12px 14px' }}>{isMr ? 'बूथ प्रमुख व संपर्क' : 'Booth In-charge'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>{isMr ? 'कृती' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {booths.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                        {isMr ? 'कोणतेही बूथ सापडले नाही. कृपया फिल्टर बदला.' : 'No booths found matching your filter.'}
                      </td>
                    </tr>
                  ) : (
                    booths.map((b) => (
                      <tr
                        key={b.id}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          background: b.is_sensitive ? '#fffbf5' : '#ffffff',
                        }}
                      >
                        {/* Booth Name & Tag */}
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '13px' }}>{formatBoothNo(b.booth_no, isMr)}</span>
                            {b.is_sensitive ? (
                              <span
                                style={{
                                  background: '#fee2e2',
                                  color: '#991b1b',
                                  fontSize: '10px',
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontWeight: '700',
                                }}
                              >
                                {isMr ? 'संवेदनशील' : 'Sensitive'}
                              </span>
                            ) : null}
                          </div>
                          <div style={{ fontSize: '12px', color: '#334155', marginTop: '3px' }}>
                            {isMr ? b.booth_name_mr : (b.booth_name_en || b.booth_name_mr)}
                          </div>
                        </td>

                        {/* Geography */}
                        <td style={{ padding: '14px 14px', color: '#475569' }}>
                          <div style={{ fontWeight: '600' }}>{isMr ? b.village_mr : (b.village_en || b.village_mr)}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{isMr ? b.taluka_mr : (b.taluka_en || b.taluka_mr)}</div>
                        </td>

                        {/* Completed Count */}
                        <td style={{ padding: '14px 14px' }}>
                          <span
                            style={{
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              fontWeight: '800',
                              fontSize: '13px',
                              padding: '4px 12px',
                              borderRadius: '6px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            ✓ {b.surveyed_voters}
                          </span>
                        </td>

                        {/* In-charge */}
                        <td style={{ padding: '14px 14px' }}>
                          <div style={{ fontWeight: '600', color: '#0f172a' }}>
                            {isMr ? b.incharge_name : (b.incharge_name_en || b.incharge_name)}
                          </div>
                          <a
                            href={`tel:${b.incharge_phone}`}
                            style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                          >
                            📞 {b.incharge_phone}
                          </a>
                        </td>

                        {/* Action Button */}
                        <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                          <button
                            onClick={() => setSelectedBoothModal(b)}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              color: '#1e293b',
                              padding: '6px 12px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600',
                              cursor: 'pointer',
                            }}
                          >
                            {isMr ? 'तपशील' : 'Details'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile View Cards (Screens <= 640px) */}
            <div className="geo-mobile-cards">
              {booths.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                  {isMr ? 'कोणतेही बूथ सापडले नाही. कृपया फिल्टर बदला.' : 'No booths found matching your filter.'}
                </div>
              ) : (
                booths.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: b.is_sensitive ? '#fffbf5' : '#ffffff',
                      border: b.is_sensitive ? '1px solid #fecaca' : '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '13px' }}>
                          {formatBoothNo(b.booth_no, isMr)}
                        </span>
                        {b.is_sensitive && (
                          <span
                            style={{
                              background: '#fee2e2',
                              color: '#991b1b',
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '700',
                            }}
                          >
                            {isMr ? 'संवेदनशील' : 'Sensitive'}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedBoothModal(b)}
                        style={{
                          background: '#eff6ff',
                          border: '1px solid #bfdbfe',
                          color: '#1d4ed8',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '750',
                          cursor: 'pointer',
                        }}
                      >
                        {isMr ? 'तपशील' : 'Details'}
                      </button>
                    </div>

                    <div style={{ fontSize: '13px', fontWeight: '650', color: '#1e293b', lineHeight: 1.35 }}>
                      {isMr ? b.booth_name_mr : (b.booth_name_en || b.booth_name_mr)}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
                      <div>
                        <span>📍 {isMr ? b.village_mr : (b.village_en || b.village_mr)}</span>
                        <span style={{ margin: '0 4px', color: '#cbd5e1' }}>•</span>
                        <span style={{ color: '#94a3b8' }}>{isMr ? b.taluka_mr : (b.taluka_en || b.taluka_mr)}</span>
                      </div>
                      <span
                        style={{
                          background: '#ecfdf5',
                          color: '#059669',
                          border: '1px solid #a7f3d0',
                          fontWeight: '800',
                          fontSize: '12px',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        ✓ {b.surveyed_voters}
                      </span>
                    </div>

                    {b.incharge_name && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '4px' }}>
                        <span style={{ color: '#475569', fontWeight: '600' }}>
                          👤 {isMr ? b.incharge_name : (b.incharge_name_en || b.incharge_name)}
                        </span>
                        {b.incharge_phone && (
                          <a
                            href={`tel:${b.incharge_phone}`}
                            style={{
                              color: '#2563eb',
                              textDecoration: 'none',
                              fontWeight: '700',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              background: '#f1f5f9',
                              padding: '3px 8px',
                              borderRadius: '6px',
                            }}
                          >
                            📞 {b.incharge_phone}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* Booth Detail Modal Popup */}
      {selectedBoothModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
          }}
          onClick={() => setSelectedBoothModal(null)}
        >
          <div
            className="geo-modal-body"
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
              boxSizing: 'border-box',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: '700' }}>
                  {formatBoothNo(selectedBoothModal.booth_no, isMr)}
                </span>
                <h3 style={{ margin: '6px 0 0 0', fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                  {isMr ? selectedBoothModal.booth_name_mr : (selectedBoothModal.booth_name_en || selectedBoothModal.booth_name_mr)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBoothModal(null)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{isMr ? 'एकूण मतदार' : 'Total Voters'}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{selectedBoothModal.total_voters}</div>
              </div>
              <div style={{ padding: '12px', background: '#f0fdf4', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: '#16a34a' }}>{isMr ? 'कव्हरेज टक्केवारी' : 'Coverage %'}</div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#16a34a' }}>{selectedBoothModal.coverage_pct}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#334155' }}>
              <div>
                <strong>📍 {isMr ? 'गाव / प्रभाग:' : 'Village / Ward:'}</strong> {isMr ? selectedBoothModal.village_mr : (selectedBoothModal.village_en || selectedBoothModal.village_mr)}
              </div>
              <div>
                <strong>👤 {isMr ? 'बूथ प्रमुख:' : 'In-charge:'}</strong> {isMr ? selectedBoothModal.incharge_name : (selectedBoothModal.incharge_name_en || selectedBoothModal.incharge_name)}
              </div>
              <div>
                <strong>📞 {isMr ? 'मोबाईल नंबर:' : 'Mobile:'}</strong>{' '}
                <a href={`tel:${selectedBoothModal.incharge_phone}`} style={{ color: '#2563eb', fontWeight: '600' }}>
                  {selectedBoothModal.incharge_phone}
                </a>
              </div>
              <div>
                <strong>🚩 {isMr ? 'नेमलेले कार्यकर्ते:' : 'Assigned Workers:'}</strong> {selectedBoothModal.workers_assigned} {isMr ? 'कार्यकर्ते' : 'workers'}
              </div>
              <div>
                <strong>⚠️ {isMr ? 'स्थानिक प्रमुख मागणी/समस्या:' : 'Key Issue:'}</strong>{' '}
                <span style={{ color: '#dc2626', fontWeight: '600' }}>
                  {isMr ? selectedBoothModal.key_issue_mr : (selectedBoothModal.key_issue_en || selectedBoothModal.key_issue_mr)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <a
                href={`https://wa.me/91${selectedBoothModal.incharge_phone}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: '#25d366',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                }}
              >
                💬 {isMr ? 'व्हॉट्सॲपवर संपर्क' : 'WhatsApp'}
              </a>
              <a
                href={`tel:${selectedBoothModal.incharge_phone}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: '#2563eb',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                }}
              >
                📞 {isMr ? 'थेट कॉल करा' : 'Call Now'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

