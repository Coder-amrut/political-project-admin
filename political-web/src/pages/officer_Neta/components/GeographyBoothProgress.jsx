import React, { useState, useEffect, useMemo } from 'react';
import { netaApi } from '../api/netaApi';
import ResponsiveSelect from '../../../components/ResponsiveSelect';

const cleanLabel = (text, isMr) => {
  if (!text) return '';
  const str = String(text);
  if (isMr) {
    // In Marathi mode: strip English words in brackets like (District), (All Talukas), etc.
    return str.replace(/\s*\([A-Za-z0-9\s\/\-_.]+\)/g, '').trim();
  } else {
    // In English mode: if text contains (English), extract English; else remove Devanagari
    const match = str.match(/\(([A-Za-z0-9\s\/\-_.]+)\)/);
    if (match && match[1]) {
      return match[1].trim();
    }
    const englishOnly = str.replace(/[^\x00-\x7F]+/g, '').replace(/^[-\s/]+|[-\s/]+$/g, '').trim();
    return englishOnly || str;
  }
};

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

  // 5-Level Cascading Hierarchy Filters
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [selectedTaluka, setSelectedTaluka] = useState('all');
  const [selectedVillage, setSelectedVillage] = useState('all');
  const [selectedWard, setSelectedWard] = useState('all');
  const [selectedBooth, setSelectedBooth] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active / Selected Booth state (stored in localStorage)
  const [activeBoothId, setActiveBoothId] = useState(() => {
    return localStorage.getItem('neta_active_booth_id') || null;
  });
  const [toastMessage, setToastMessage] = useState('');

  // Database data states
  const [booths, setBooths] = useState([]);
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [selectedBoothModal, setSelectedBoothModal] = useState(null);

  // 1. Fetch cascading geography options from DB based on active hierarchy
  const loadGeographyFilters = async (district = null, taluka = null, village = null, ward = null) => {
    try {
      setLoadingFilters(true);
      const params = {};
      if (district && district !== 'all') params.district = district;
      if (taluka && taluka !== 'all') params.taluka = taluka;
      if (village && village !== 'all') params.village = village;
      if (ward && ward !== 'all') params.ward = ward;
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
      if (selectedTaluka !== 'all') params.taluka = selectedTaluka;
      if (selectedVillage !== 'all') params.village = selectedVillage;
      if (selectedWard !== 'all') params.ward = selectedWard;
      if (selectedBooth !== 'all') params.booth_no = selectedBooth;
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

  // Trigger geography filters reload when higher levels change
  useEffect(() => {
    loadGeographyFilters(selectedDistrict, selectedTaluka, selectedVillage, selectedWard);
  }, [selectedDistrict, selectedTaluka, selectedVillage, selectedWard]);

  // Trigger booth list fetch whenever filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBooths();
    }, 200);
    return () => clearTimeout(timer);
  }, [
    selectedDistrict,
    selectedTaluka,
    selectedVillage,
    selectedWard,
    selectedBooth,
    searchQuery,
  ]);

  // Set selected booth as active
  const handleSetActiveBooth = async (booth) => {
    try {
      const res = await netaApi.setActiveBooth(booth.id);
      if (res.success) {
        setActiveBoothId(String(booth.id));
        localStorage.setItem('neta_active_booth_id', String(booth.id));
        localStorage.setItem('neta_active_booth_no', String(booth.booth_no));
        setToastMessage(
          isMr
            ? `✅ ${formatBoothNo(booth.booth_no, true)} हे सक्रिय (Active) बूथ म्हणून यशस्वीरीत्या सेट केले!`
            : `✅ ${formatBoothNo(booth.booth_no, false)} set as Active Booth successfully!`
        );
        setTimeout(() => setToastMessage(''), 4000);
      }
    } catch (err) {
      console.error('Failed to set active booth:', err);
    }
  };

  const handleResetFilters = () => {
    setSelectedDistrict('all');
    setSelectedTaluka('all');
    setSelectedVillage('all');
    setSelectedWard('all');
    setSelectedBooth('all');
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

  const talukaList = [];
  const seenTalukas = new Set();
  (geoData?.booth_talukas || []).forEach((t) => {
    const val = t.taluka_mr || t.taluka_en;
    if (val && !seenTalukas.has(val)) {
      seenTalukas.add(val);
      talukaList.push({ value: val, label_mr: t.taluka_mr || val, label_en: t.taluka_en || val });
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

  const wardList = [];
  const seenWards = new Set();
  (geoData?.booth_wards || []).forEach((w) => {
    const val = w.ward_mr || w.ward_en;
    if (val && !seenWards.has(val)) {
      seenWards.add(val);
      wardList.push({ value: val, label_mr: w.ward_mr || val, label_en: w.ward_en || val });
    }
  });

  // Level 1: District Options
  const districtOptions = [
    { value: 'all', label: isMr ? 'सर्व जिल्हे' : 'All Districts' },
    ...districtList.map((d) => ({
      value: d.value,
      label: isMr ? cleanLabel(d.label_mr || d.value, true) : cleanLabel(d.label_en || d.value, false),
    })),
  ];

  // Level 2: Taluka Options
  const talukaOptions = [
    { value: 'all', label: isMr ? 'सर्व तालुके' : 'All Talukas' },
    ...talukaList.map((t) => ({
      value: t.value,
      label: isMr ? cleanLabel(t.label_mr || t.value, true) : cleanLabel(t.label_en || t.value, false),
    })),
  ];

  // Level 3: Village Options
  const villageOptions = [
    { value: 'all', label: isMr ? 'सर्व गावे' : 'All Villages' },
    ...villageList.map((v) => ({
      value: v.value,
      label: isMr ? cleanLabel(v.label_mr || v.value, true) : cleanLabel(v.label_en || v.value, false),
    })),
  ];

  // Level 4: Ward Options
  const wardOptions = [
    { value: 'all', label: isMr ? 'सर्व प्रभाग' : 'All Wards' },
    ...wardList.map((w) => ({
      value: w.value,
      label: isMr ? cleanLabel(w.label_mr || w.value, true) : cleanLabel(w.label_en || w.value, false),
    })),
  ];

  // Level 5: Booth Options
  const boothOptions = [
    { value: 'all', label: isMr ? 'सर्व बूथ' : 'All Booths' },
    ...booths.map((b) => ({
      value: b.booth_no,
      label: `${formatBoothNo(b.booth_no, isMr)} - ${isMr ? cleanLabel(b.booth_name_mr || b.booth_name_en, true) : cleanLabel(b.booth_name_en || b.booth_name_mr, false)}`,
    })),
  ];

  // Regional Hierarchy Breakdown for "सर्व माहिती" View
  const districtBreakdown = useMemo(() => {
    return districtList.map((dist) => {
      const distTalukas = (geoData?.booth_talukas || []).filter(
        (t) => t.district_mr === dist.value || t.district_en === dist.value
      );
      const distBooths = booths.filter(
        (b) => b.district_mr === dist.value || b.district_en === dist.value
      );
      const distVoters = distBooths.reduce((acc, curr) => acc + (Number(curr.total_voters) || 0), 0);
      return {
        ...dist,
        talukas_count: distTalukas.length,
        booths_count: distBooths.length,
        voters_count: distVoters,
      };
    });
  }, [districtList, geoData, booths]);

  const talukaBreakdown = useMemo(() => {
    if (selectedDistrict === 'all') return [];
    return talukaList.map((tal) => {
      const talBooths = booths.filter(
        (b) => b.taluka_mr === tal.value || b.taluka_en === tal.value
      );
      const talVoters = talBooths.reduce((acc, curr) => acc + (Number(curr.total_voters) || 0), 0);
      return {
        ...tal,
        booths_count: talBooths.length,
        voters_count: talVoters,
      };
    });
  }, [talukaList, selectedDistrict, booths]);

  // Summary counts from DB
  const stats = geoData?.summary_stats || {
    total_districts: districtList.length || 3,
    total_talukas: talukaList.length,
    total_villages: villageList.length,
    total_wards: wardList.length,
    total_booths: booths.length,
    total_voters: booths.reduce((acc, curr) => acc + (Number(curr.total_voters) || 0), 0),
    total_population: booths.reduce((acc, curr) => acc + (Number(curr.total_population) || 0), 0),
  };

  return (
    <div className="geo-progress-container" style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <style>{`
        .geo-filter-card {
          background: #ffffff;
          border-radius: 14px;
          padding: 20px 24px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 2px 6px rgba(0,0,0,0.04);
          box-sizing: border-box;
          width: 100%;
        }
        .geo-flow-header {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          margin-bottom: 16px;
          flex-wrap: wrap;
          gap: 10px;
          border-bottom: 1px solid #f1f5f9;
          padding-bottom: 12px;
        }
        .geo-filter-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
          box-sizing: border-box;
          width: 100%;
        }
        .geo-stats-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 12px;
          width: 100%;
          box-sizing: border-box;
        }
        .geo-desktop-table {
          display: block;
        }
        .geo-mobile-cards {
          display: none;
        }

        /* Tablet View (iPad / Tablets 641px - 1024px) */
        @media (min-width: 641px) and (max-width: 1024px) {
          .geo-filter-card {
            padding: 16px 18px !important;
          }
          .geo-filter-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 12px !important;
          }
          .geo-stats-grid {
            grid-template-columns: repeat(4, 1fr) !important;
            gap: 10px !important;
          }
          .geo-desktop-table {
            display: block !important;
            overflow-x: auto !important;
          }
        }

        /* Mobile View (Screens <= 640px) */
        @media (max-width: 640px) {
          .geo-filter-card {
            padding: 14px 12px !important;
            border-radius: 10px !important;
          }
          .geo-filter-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .geo-stats-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
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

      {/* Floating Toast Notification on Set Booth */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontWeight: '700',
            fontSize: '13.5px',
            boxShadow: '0 8px 24px rgba(5, 150, 105, 0.35)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* 5-Level Cascading Hierarchy Filter Card */}
      <div className="geo-filter-card">
        {/* Header with Title and Reset */}
        <div className="geo-flow-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🗺️</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                {isMr ? '१. जिल्हा ➔ २. तालुका ➔ ३. गाव ➔ ४. प्रभाग ➔ ५. बूथ' : '1. District ➔ 2. Taluka ➔ 3. Village ➔ 4. Ward ➔ 5. Booth'}
              </h2>
              <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                {isMr ? 'जिल्हा किंवा तालुका निवडल्यास त्याखालील सर्व घटक व संख्या त्वरित फिल्टर होतात' : 'Cascading real-time geographic hierarchy'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                transition: 'all 0.15s ease',
              }}
              title={isMr ? 'सर्व फिल्टर्स पूर्ववत करा' : 'Reset all filters'}
            >
              🔄 {isMr ? 'सर्व रीसेट' : 'Reset All'}
            </button>
            <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e3a8a', background: '#eff6ff', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              {isMr ? 'बूथ संख्या:' : 'Booths:'} {booths.length}
            </span>
          </div>
        </div>

        {/* 5-Level Cascade Controls Grid */}
        <div className="geo-filter-grid">
          {/* 1. जिल्हा */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>
              {isMr ? '१. जिल्हा' : '1. District'}
            </label>
            <ResponsiveSelect
              value={selectedDistrict}
              options={districtOptions}
              isMr={isMr}
              menuMaxHeight="65vh"
              onChange={(e) => {
                setSelectedDistrict(e.target.value);
                setSelectedTaluka('all');
                setSelectedVillage('all');
                setSelectedWard('all');
                setSelectedBooth('all');
              }}
            />
          </div>

          {/* 2. तालुका */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>
              {isMr ? '२. तालुका' : '2. Taluka'}
            </label>
            <ResponsiveSelect
              value={selectedTaluka}
              options={talukaOptions}
              isMr={isMr}
              menuMaxHeight="65vh"
              onChange={(e) => {
                setSelectedTaluka(e.target.value);
                setSelectedVillage('all');
                setSelectedWard('all');
                setSelectedBooth('all');
              }}
            />
          </div>

          {/* 3. गाव */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>
              {isMr ? '३. गाव' : '3. Village'}
            </label>
            <ResponsiveSelect
              value={selectedVillage}
              options={villageOptions}
              isMr={isMr}
              menuMaxHeight="65vh"
              onChange={(e) => {
                setSelectedVillage(e.target.value);
                setSelectedWard('all');
                setSelectedBooth('all');
              }}
            />
          </div>

          {/* 4. प्रभाग */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>
              {isMr ? '४. प्रभाग' : '4. Ward'}
            </label>
            <ResponsiveSelect
              value={selectedWard}
              options={wardOptions}
              isMr={isMr}
              menuMaxHeight="65vh"
              onChange={(e) => {
                setSelectedWard(e.target.value);
                setSelectedBooth('all');
              }}
            />
          </div>

          {/* 5. बूथ */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#1e293b', marginBottom: '5px' }}>
              {isMr ? '५. बूथ' : '5. Booth'}
            </label>
            <ResponsiveSelect
              value={selectedBooth}
              options={boothOptions}
              isMr={isMr}
              menuMaxHeight="65vh"
              onChange={(e) => {
                const val = e.target.value;
                setSelectedBooth(val);
                if (val !== 'all') {
                  const targetBooth = booths.find((b) => b.booth_no === val || String(b.id) === val);
                  if (targetBooth) {
                    handleSetActiveBooth(targetBooth);
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Live Search Input Bar */}
        <div style={{ marginTop: '14px', position: 'relative' }}>
          <input
            type="text"
            placeholder={isMr ? '🔍 थेट शोध: बूथ क्रमांक, नाव, गाव, प्रभाग, प्रमुख...' : '🔍 Search booth, village, ward, incharge...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '9px 34px 9px 12px',
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
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '16px',
                padding: 0,
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Cascading Hierarchy Summary Stat Cards (Live Count Cards) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>📊</span>
            <span>
              {selectedDistrict !== 'all' ? `📍 ${selectedDistrict} जिल्हा अंतर्गत तपशील` : (isMr ? 'सर्व भूगोल सारांश' : 'Geography Overview')}
              {selectedTaluka !== 'all' ? ` ➔ ${selectedTaluka}` : ''}
              {selectedVillage !== 'all' ? ` ➔ ${selectedVillage}` : ''}
              {selectedWard !== 'all' ? ` ➔ ${selectedWard}` : ''}
            </span>
          </div>
          {activeBoothId && (
            <span style={{ fontSize: '11.5px', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 10px', borderRadius: '12px', fontWeight: '750' }}>
              🎯 {isMr ? 'सध्याचे ॲक्टिव्ह बूथ:' : 'Active Booth:'} {localStorage.getItem('neta_active_booth_no') || `#${activeBoothId}`}
            </span>
          )}
        </div>

        <div className="geo-stats-grid">
          {/* Card 0: Districts */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'एकूण जिल्हे' : 'Districts'}</div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#1e3a8a', marginTop: '2px' }}>{stats.total_districts}</div>
          </div>

          {/* Card 1: Talukas */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'तालुके' : 'Talukas'}</div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>{stats.total_talukas}</div>
          </div>

          {/* Card 2: Villages */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'गावे' : 'Villages'}</div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#0f766e', marginTop: '2px' }}>{stats.total_villages}</div>
          </div>

          {/* Card 3: Wards */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'प्रभाग' : 'Wards'}</div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#7c3aed', marginTop: '2px' }}>{stats.total_wards}</div>
          </div>

          {/* Card 4: Booths */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'एकूण बूथ' : 'Booths'}</div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>{stats.total_booths}</div>
          </div>

          {/* Card 5: Voters */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'एकूण मतदार' : 'Voters'}</div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
              {Number(stats.total_voters || 0).toLocaleString('en-IN')}
            </div>
          </div>

          {/* Card 6: Population */}
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
            <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>{isMr ? 'अंदाजे लोकसंख्या' : 'Population'}</div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#d97706', marginTop: '2px' }}>
              {Number(stats.total_population || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>
      </div>

      {/* Regional Hierarchy Breakdown Section (Displays all info clearly before any filter is chosen, and dynamically adapts) */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🏛️</span>
              <span>
                {selectedDistrict === 'all'
                  ? (isMr ? 'सर्व जिल्ह्यांची संपूर्ण रचना व माहिती' : 'All Districts Hierarchy & Summary')
                  : (isMr ? `${cleanLabel(selectedDistrict, true)} जिल्हा अंतर्गत सर्व तालुके` : `All Talukas in ${cleanLabel(selectedDistrict, false)}`)}
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
              {selectedDistrict === 'all'
                ? (isMr ? 'कोणताही पर्याय न निवडता सर्व जिल्ह्यांचा थेट तपशील खाली दिलेला आहे. एका क्लिकवर निवडून फिल्टर करू शकता.' : 'Complete regional overview. Click any district to filter instantly.')
                : (isMr ? 'या जिल्ह्याखालील तालुक्यांचा तपशील व बूथ संख्या खालीलप्रमाणे आहे.' : 'Detailed taluka breakdown and booth counts under this district.')}
            </div>
          </div>
          {selectedDistrict !== 'all' && (
            <button
              type="button"
              onClick={() => {
                setSelectedDistrict('all');
                setSelectedTaluka('all');
                setSelectedVillage('all');
                setSelectedWard('all');
                setSelectedBooth('all');
              }}
              style={{
                fontSize: '11.5px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '5px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '700',
              }}
            >
              ← {isMr ? 'सर्व जिल्हे दाखवा' : 'Show All Districts'}
            </button>
          )}
        </div>

        {/* Regional Cards Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '12px',
          }}
        >
          {selectedDistrict === 'all'
            ? districtBreakdown.map((dist) => {
                const isDistActive = selectedDistrict === dist.value;
                return (
                  <div
                    key={dist.value}
                    onClick={() => {
                      setSelectedDistrict(dist.value);
                      setSelectedTaluka('all');
                      setSelectedVillage('all');
                      setSelectedWard('all');
                      setSelectedBooth('all');
                    }}
                    style={{
                      background: isDistActive ? '#eff6ff' : '#f8fafc',
                      border: isDistActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isDistActive) e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      if (!isDistActive) e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: '800', color: '#1e3a8a' }}>
                        📍 {isMr ? cleanLabel(dist.label_mr, true) : cleanLabel(dist.label_en, false)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: '800', background: '#dbeafe', padding: '2px 8px', borderRadius: '4px' }}>
                        {isMr ? 'तपशील' : 'Details'} ➔
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11.5px', marginTop: '2px' }}>
                      <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', color: '#0284c7', fontWeight: '700' }}>
                        🏛️ {dist.talukas_count} {isMr ? 'तालुके' : 'Talukas'}
                      </span>
                      <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', color: '#2563eb', fontWeight: '700' }}>
                        🎯 {dist.booths_count} {isMr ? 'बूथ' : 'Booths'}
                      </span>
                      <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', color: '#059669', fontWeight: '700' }}>
                        👥 {Number(dist.voters_count).toLocaleString('en-IN')} {isMr ? 'मतदार' : 'Voters'}
                      </span>
                    </div>
                  </div>
                );
              })
            : talukaBreakdown.map((tal) => {
                const isTalActive = selectedTaluka === tal.value;
                return (
                  <div
                    key={tal.value}
                    onClick={() => {
                      setSelectedTaluka(tal.value);
                      setSelectedVillage('all');
                      setSelectedWard('all');
                      setSelectedBooth('all');
                    }}
                    style={{
                      background: isTalActive ? '#eff6ff' : '#f8fafc',
                      border: isTalActive ? '2px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isTalActive) e.currentTarget.style.borderColor = '#93c5fd';
                    }}
                    onMouseLeave={(e) => {
                      if (!isTalActive) e.currentTarget.style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f766e' }}>
                        🏛️ {isMr ? cleanLabel(tal.label_mr, true) : cleanLabel(tal.label_en, false)}
                      </span>
                      <span style={{ fontSize: '11px', color: '#0f766e', fontWeight: '800', background: '#ccfbf1', padding: '2px 8px', borderRadius: '4px' }}>
                        {isMr ? 'निवडा' : 'Select'} ➔
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', fontSize: '11.5px', marginTop: '2px' }}>
                      <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', color: '#2563eb', fontWeight: '700' }}>
                        🎯 {tal.booths_count} {isMr ? 'बूथ' : 'Booths'}
                      </span>
                      <span style={{ background: '#ffffff', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', color: '#059669', fontWeight: '700' }}>
                        👥 {Number(tal.voters_count).toLocaleString('en-IN')} {isMr ? 'मतदार' : 'Voters'}
                      </span>
                    </div>
                  </div>
                );
              })}
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
            {/* Desktop Table View (Screens > 640px and Tablets) */}
            <div className="geo-desktop-table" style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{ width: '100%', minWidth: '760px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontWeight: '700' }}>
                    <th style={{ padding: '12px 16px' }}>{isMr ? 'बूथ क्रमांक व नाव' : 'Booth No & Center Name'}</th>
                    <th style={{ padding: '12px 14px' }}>{isMr ? 'तालुका, गाव व प्रभाग' : 'Taluka, Village & Ward'}</th>
                    <th style={{ padding: '12px 14px' }}>{isMr ? 'पूर्ण मोजणी' : 'Completed Count'}</th>
                    <th style={{ padding: '12px 14px' }}>{isMr ? 'बूथ प्रमुख व संपर्क' : 'Booth In-charge'}</th>
                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>{isMr ? 'कृती / बूथ सेट' : 'Action / Set Booth'}</th>
                  </tr>
                </thead>
                <tbody>
                  {booths.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                        {isMr ? 'कोणतेही बूथ सापडले नाही. कृपया फिल्टर तपासा.' : 'No booths found matching your filter.'}
                      </td>
                    </tr>
                  ) : (
                    booths.map((b) => {
                      const isActive = activeBoothId && String(activeBoothId) === String(b.id);

                      return (
                        <tr
                          key={b.id}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: isActive ? '#f0fdf4' : (b.is_sensitive ? '#fffbf5' : '#ffffff'),
                          }}
                        >
                          {/* Booth Name & Tag */}
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '13px' }}>
                                {formatBoothNo(b.booth_no, isMr)}
                              </span>
                              {isActive && (
                                <span
                                  style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    fontSize: '10.5px',
                                    padding: '2px 8px',
                                    borderRadius: '10px',
                                    fontWeight: '800',
                                    border: '1px solid #86efac',
                                  }}
                                >
                                  ✓ {isMr ? 'सक्रिय बूथ' : 'Active'}
                                </span>
                              )}
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
                            <div style={{ fontWeight: '700', color: '#0f172a' }}>
                              {isMr ? b.village_mr : (b.village_en || b.village_mr)}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                              <span>{isMr ? b.taluka_mr : (b.taluka_en || b.taluka_mr)}</span>
                              {b.ward_mr && (
                                <>
                                  <span style={{ margin: '0 4px', color: '#cbd5e1' }}>•</span>
                                  <span style={{ color: '#7c3aed', fontWeight: '600' }}>{isMr ? b.ward_mr : (b.ward_en || b.ward_mr)}</span>
                                </>
                              )}
                            </div>
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
                            {b.incharge_phone && (
                              <a
                                href={`tel:${b.incharge_phone}`}
                                style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                              >
                                📞 {b.incharge_phone}
                              </a>
                            )}
                          </td>

                          {/* Action Buttons: Set Booth & Details */}
                          <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleSetActiveBooth(b)}
                                style={{
                                  background: isActive ? '#10b981' : '#2563eb',
                                  color: '#ffffff',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: '700',
                                  cursor: 'pointer',
                                  boxShadow: isActive ? '0 2px 6px rgba(16, 185, 129, 0.3)' : '0 2px 6px rgba(37, 99, 235, 0.3)',
                                  transition: 'all 0.15s ease',
                                }}
                                title={isMr ? 'हे बूथ ॲक्टिव्ह म्हणून सेट करा' : 'Set as Active Booth'}
                              >
                                {isActive ? (isMr ? '✓ सेट आहे' : 'Active') : (isMr ? '🎯 सेट बूथ' : 'Set Booth')}
                              </button>
                              <button
                                type="button"
                                onClick={() => setSelectedBoothModal(b)}
                                style={{
                                  background: '#f1f5f9',
                                  border: '1px solid #cbd5e1',
                                  color: '#1e293b',
                                  padding: '6px 10px',
                                  borderRadius: '6px',
                                  fontSize: '11.5px',
                                  fontWeight: '600',
                                  cursor: 'pointer',
                                }}
                              >
                                {isMr ? 'तपशील' : 'Details'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
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
                booths.map((b) => {
                  const isActive = activeBoothId && String(activeBoothId) === String(b.id);

                  return (
                    <div
                      key={b.id}
                      style={{
                        background: isActive ? '#f0fdf4' : (b.is_sensitive ? '#fffbf5' : '#ffffff'),
                        border: isActive ? '2px solid #86efac' : (b.is_sensitive ? '1px solid #fecaca' : '1px solid #e2e8f0'),
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
                          {isActive && (
                            <span
                              style={{
                                background: '#dcfce7',
                                color: '#15803d',
                                fontSize: '10px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: '800',
                              }}
                            >
                              ✓ {isMr ? 'सक्रिय' : 'Active'}
                            </span>
                          )}
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
                          {b.ward_mr && (
                            <>
                              <span style={{ margin: '0 4px', color: '#cbd5e1' }}>•</span>
                              <span style={{ color: '#7c3aed', fontWeight: '600' }}>{isMr ? b.ward_mr : (b.ward_en || b.ward_mr)}</span>
                            </>
                          )}
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

                      {/* Incharge & Set Booth Button Row */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', paddingTop: '4px', gap: '8px' }}>
                        <span style={{ color: '#475569', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          👤 {isMr ? b.incharge_name : (b.incharge_name_en || b.incharge_name)}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleSetActiveBooth(b)}
                          style={{
                            background: isActive ? '#10b981' : '#2563eb',
                            color: '#ffffff',
                            border: 'none',
                            padding: '5px 12px',
                            borderRadius: '6px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          {isActive ? (isMr ? '✓ सेट आहे' : 'Active') : (isMr ? '🎯 सेट बूथ' : 'Set Booth')}
                        </button>
                      </div>
                    </div>
                  );
                })
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
                <strong>📍 {isMr ? 'गाव व प्रभाग:' : 'Village & Ward:'}</strong> {isMr ? selectedBoothModal.village_mr : (selectedBoothModal.village_en || selectedBoothModal.village_mr)} ({selectedBoothModal.ward_mr || 'वॉर्ड'})
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

            {/* Set Active Booth in Modal */}
            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => {
                  handleSetActiveBooth(selectedBoothModal);
                  setSelectedBoothModal(null);
                }}
                style={{
                  width: '100%',
                  background: activeBoothId && String(activeBoothId) === String(selectedBoothModal.id) ? '#10b981' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: '750',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                }}
              >
                {activeBoothId && String(activeBoothId) === String(selectedBoothModal.id)
                  ? (isMr ? '✓ हे बूथ आधीच सक्रिय (Active) सेट आहे' : '✓ Already Active Booth')
                  : (isMr ? '🎯 हे बूथ ॲक्टिव्ह सेट करा (Set as Active Booth)' : 'Set as Active Booth')}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
                💬 {isMr ? 'व्हॉट्सॲप' : 'WhatsApp'}
              </a>
              <a
                href={`tel:${selectedBoothModal.incharge_phone}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  background: '#1e293b',
                  color: '#ffffff',
                  padding: '10px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: '13px',
                }}
              >
                📞 {isMr ? 'कॉल करा' : 'Call'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
