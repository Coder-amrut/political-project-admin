import React, { useEffect, useState, useRef } from 'react';
import apiClient from '../../api/axios';
import { translateTree } from '../../i18n/adminTranslations';
import InteractiveGeographicMap from '../../components/InteractiveGeographicMap';

const scopes = [
  { value: 'DISTRICT', title: 'District', description: 'Target an administrative district', icon: '▤' },
  { value: 'LOK_SABHA', title: 'Lok Sabha', description: 'Target a parliamentary constituency', icon: '⌂' },
  { value: 'ASSEMBLY', title: 'Assembly', description: 'Target an assembly constituency', icon: '⌖' },
  { value: 'POLLING_STATION', title: 'Polling Station', description: 'Target a polling part or booth', icon: '▦' },
  { value: 'GRADUATE_CONSTITUENCY', title: 'Graduate Constituency Election', description: 'Target a graduate council constituency', icon: '🎓' },
  { value: 'TEACHER_CONSTITUENCY', title: 'Teacher Constituency Election', description: 'Target a teacher council constituency', icon: '📚' },
];

const style = {
  card: { background: '#fff', border: '1px solid #e3e8ef', borderRadius: 12, padding: 22, boxSizing: 'border-box', width: '100%', maxWidth: '100%', minWidth: 0 },
  label: { display: 'block', marginBottom: 14, color: '#334155', fontWeight: 650, fontSize: 13, width: '100%', maxWidth: '100%', boxSizing: 'border-box' },
  input: { display: 'block', boxSizing: 'border-box', width: '100%', maxWidth: '100%', minWidth: 0, marginTop: 6, padding: '10px 12px', border: '1px solid #cfd8e3', borderRadius: 8, font: 'inherit', color: '#142033' },
  muted: { color: '#64748b', fontSize: 13 },
  button: { border: 0, borderRadius: 8, padding: '11px 17px', background: '#2457d6', color: '#fff', cursor: 'pointer', fontWeight: 700 },
};

function SearchPicker({ label, endpoint, value, onSelect, onClear, disabled = false, placeholder, noResultsText = 'No matching records found.', language = 'en', onViewMap = null }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const itemTitle = (item) => item.part_no ? `Part No. ${item.part_no}` : item.code ? `${item.code} — ${item.name_en || item.name}` : (item.name_en || item.name);

  useEffect(() => {
    if (disabled || !endpoint) {
      setResults([]);
      setError('');
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      setError('');
      try {
        const params = search.trim() ? { search: search.trim() } : {};
        const { data } = await apiClient.get(endpoint, { params });
        if (!cancelled) setResults(data.data || []);
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || 'Could not load options.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [endpoint, search, disabled]);

  return translateTree(<div style={{ marginBottom: 18 }}>
    <label style={style.label}>{label}</label>
    {value ? (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '12px 14px', border: '1px solid #8da9e8', borderRadius: 9, background: '#f7f9ff', flexWrap: 'wrap' }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 700, color: '#17253c', fontSize: 14, wordBreak: 'break-word' }}>{itemTitle(value)}</div>
          {value.part_no && <div style={style.muted}>{value.name_en}{value.election_year ? ` · Election ${value.election_year}` : ''}</div>}
          {value.name_mr && <div lang="mr" style={{ color: '#516074', marginTop: 3, fontSize: 13, wordBreak: 'break-word' }}>{value.name_mr}</div>}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
          {onViewMap && (
            <button
              type="button"
              onClick={() => onViewMap(value)}
              title={language === 'mr' ? 'हा भाग नकाशावर पहा' : 'View on Map'}
              style={{
                border: '1px solid #93c5fd',
                background: '#eff6ff',
                borderRadius: 6,
                padding: '6px 12px',
                color: '#1d4ed8',
                fontSize: 12.5,
                cursor: 'pointer',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                boxShadow: '0 1px 2px rgba(29, 78, 216, 0.1)'
              }}
            >
              <span>🗺️</span>
              <span>{language === 'mr' ? 'नकाशा पहा' : 'View Map'}</span>
            </button>
          )}
          <button type="button" onClick={() => { onClear?.(); setSearch(''); }} aria-label={`Clear ${label}`} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, padding: '6px 12px', color: '#334155', fontSize: 13, cursor: 'pointer', fontWeight: 650 }}>Change</button>
        </div>
      </div>
    ) : (
      <div style={{ border: '1px solid #d7deea', borderRadius: 9, background: '#fff', overflow: 'hidden' }}>
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #edf0f5', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>🔍</span>
          <input
            disabled={disabled}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={disabled ? 'Choose the required filters first' : (placeholder || 'Search or filter options...')}
            style={{ ...style.input, margin: 0, padding: '7px 9px', background: disabled ? '#f1f5f9' : '#fff', border: '1px solid #cfd8e3', flex: 1, fontSize: 13 }}
            autoComplete="off"
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: '0 4px' }} title="Clear filter">×</button>
          )}
        </div>
        <div role="listbox" style={{ maxHeight: 230, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: 14, ...style.muted, textAlign: 'center' }}>Loading options…</div>
          ) : error ? (
            <div role="alert" style={{ padding: 14, color: '#b42318', fontSize: 13 }}>{error}</div>
          ) : results.length ? (
            results.map((item) => (
              <button
                key={`${item.code}-${item.election_year || ''}`}
                type="button"
                role="option"
                aria-selected="false"
                onClick={() => { onSelect(item); setSearch(''); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '10px 14px',
                  border: 0,
                  borderBottom: '1px solid #edf0f5',
                  background: '#fff',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f5f8ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
              >
                <div>
                  <span style={{ display: 'block', fontWeight: 650, color: '#17253c', fontSize: 13 }}>{itemTitle(item)}</span>
                  {item.name_mr && <span lang="mr" style={{ display: 'block', color: '#64748b', fontSize: 12, marginTop: 2 }}>{item.name_mr}</span>}
                  {item.part_no && <span style={{ display: 'block', color: '#64748b', fontSize: 12, marginTop: 2 }}>{item.name_en}</span>}
                </div>
                <span style={{ color: '#2457d6', fontSize: 12, fontWeight: 700 }}>Select →</span>
              </button>
            ))
          ) : (
            <div style={{ padding: 16, ...style.muted, textAlign: 'center' }}>{noResultsText}</div>
          )}
        </div>
        <div style={{ padding: '6px 12px', background: '#f8fafc', borderTop: '1px solid #edf0f5', fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
          <span>{results.length} option{results.length === 1 ? '' : 's'} available</span>
          <span>Click any option to select</span>
        </div>
      </div>
    )}
  </div>, language);
}

function MultiSearchPicker({ label, endpoint, params = {}, value = [], onChange, disabled = false, placeholder, noResultsText = 'No matching records found.', language = 'en', onViewMap = null, pickerType = '' }) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const paramsKey = JSON.stringify(params);
  const normalize = (item) => {
    const code = String(item.local_body_code ?? item.village_code ?? item.taluka_code ?? item.code ?? item.district_code ?? item.part_no ?? item.id ?? '');
    const name_en = item.local_body_name || item.village_name || item.taluka_name || item.district_name || item.name_en || item.name || (item.part_no ? `Part No. ${item.part_no}` : code);
    return { ...item, code, name_en };
  };

  useEffect(() => {
    if (disabled || !endpoint) {
      setResults([]);
      setError('');
      return undefined;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get(endpoint, { params: { ...JSON.parse(paramsKey), per_page: 2000, ...(search.trim() ? { search: search.trim() } : {}) } });
        if (!cancelled) setResults((data.data || []).map(normalize));
        if (!cancelled) setError('');
      } catch (requestError) {
        if (!cancelled) setError(requestError.message || 'Could not load records.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, search.trim() ? 250 : 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [endpoint, paramsKey, search, disabled]);

  const toggle = (item) => {
    if (value.some((selected) => selected.code === item.code)) {
      onChange(value.filter((selected) => selected.code !== item.code));
    } else {
      onChange([...value, item]);
    }
  };

  return translateTree(<div style={{ marginBottom: 18 }}>
    <label style={style.label}>{label}</label>
    {value.length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 8, alignItems: 'center' }}>
      {value.map((item, idx) => <span key={item.code || item.id || `sel_${idx}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 9px', borderRadius: 20, background: '#eaf0ff', color: '#24469a', fontSize: 12.5, fontWeight: 600 }}>
        <span>{item.part_no ? `Part No. ${item.part_no}` : item.name_en}</span>
        {item.type_label ? <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>({item.type_label})</span> : null}
        {onViewMap && (
          <button
            type="button"
            onClick={() => onViewMap(item, pickerType)}
            title={language === 'mr' ? 'हा भाग नकाशावर पहा' : 'View on Map'}
            style={{
              border: '1px solid #bfdbfe',
              background: '#ffffff',
              color: '#1d4ed8',
              borderRadius: '50%',
              width: 19,
              height: 19,
              padding: 0,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            🗺️
          </button>
        )}
        <button type="button" onClick={() => onChange(value.filter((selected) => selected.code !== item.code))} aria-label={`Remove ${item.name_en}`} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', fontSize: 15, lineHeight: 1 }}>×</button>
      </span>)}
      {onViewMap && value.length > 0 && (
        <button
          type="button"
          onClick={() => onViewMap(value[value.length - 1], pickerType)}
          title={language === 'mr' ? 'नकाशावर पहा' : 'View on Map'}
          style={{
            border: '1px solid #93c5fd',
            background: '#f0fdf4',
            color: '#15803d',
            borderRadius: 6,
            padding: '3px 8px',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <span>🗺️</span>
          <span>{language === 'mr' ? 'नकाशा पहा' : 'View Map'}</span>
        </button>
      )}
      {value.length > 1 && (
        <button
          type="button"
          onClick={() => onChange([])}
          style={{ border: 0, background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 600, padding: '2px 6px', textDecoration: 'underline' }}
        >
          Clear All
        </button>
      )}
    </div>}
    <div style={{ border: '1px solid #d7deea', borderRadius: 9, background: '#fff', overflow: 'hidden' }}>
      <div style={{ padding: '8px 10px', borderBottom: '1px solid #edf0f5', background: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ color: '#94a3b8', fontSize: 13 }}>🔍</span>
        <input
          disabled={disabled}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={disabled ? 'Choose the required filters first' : (placeholder || 'Filter options...')}
          style={{ ...style.input, margin: 0, padding: '7px 9px', background: disabled ? '#f1f5f9' : '#fff', border: '1px solid #cfd8e3', flex: 1, fontSize: 13 }}
          autoComplete="off"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: 16, padding: '0 4px' }} title="Clear filter">×</button>
        )}
      </div>
      <div role="listbox" aria-multiselectable="true" style={{ maxHeight: 200, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 13, ...style.muted, textAlign: 'center' }}>Loading…</div>
        ) : error ? (
          <div role="alert" style={{ padding: 13, color: '#b42318', fontSize: 13 }}>{error}</div>
        ) : results.length ? (
          results.map((item, idx) => {
            const selected = value.some((existing) => existing.code === item.code);
            return (
              <button
                key={item.code || item.id || `opt_${idx}`}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => toggle(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  textAlign: 'left',
                  width: '100%',
                  padding: '9px 12px',
                  border: 0,
                  borderBottom: '1px solid #edf0f5',
                  background: selected ? '#f3f6ff' : '#fff',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => { if (!selected) e.currentTarget.style.background = '#f9fafb'; }}
                onMouseLeave={(e) => { if (!selected) e.currentTarget.style.background = '#fff'; }}
              >
                <span aria-hidden="true" style={{ width: 16, height: 16, flex: '0 0 16px', display: 'grid', placeItems: 'center', borderRadius: 4, border: selected ? '1px solid #315fce' : '1px solid #9aa8bb', background: selected ? '#315fce' : '#fff', color: '#fff', fontSize: 11, fontWeight: 700 }}>{selected ? '✓' : ''}</span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                    <b style={{ color: '#17253c', fontSize: 13 }}>{item.part_no ? `Part No. ${item.part_no} — ${item.name_en || ''}` : `${item.code} — ${item.name_en}`}</b>
                    {item.type_label && (
                      <span style={{ fontSize: 11, fontWeight: 650, padding: '1px 6px', borderRadius: 4, background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {item.type_label}
                      </span>
                    )}
                  </span>
                  {item.name_mr && <span lang="mr" style={{ color: '#64748b', fontSize: 12 }}>{item.name_mr}</span>}
                </span>
              </button>
            );
          })
        ) : (
          <div style={{ padding: 13, ...style.muted, textAlign: 'center' }}>{noResultsText}</div>
        )}
      </div>
      <div style={{ padding: '6px 12px', background: '#f8fafc', borderTop: '1px solid #edf0f5', fontSize: 12, color: '#64748b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>{results.length} available · {value.length} selected</span>
        <div style={{ display: 'flex', gap: 10 }}>
          {results.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const map = new Map(value.map((v) => [v.code, v]));
                results.forEach((r) => map.set(r.code, r));
                onChange(Array.from(map.values()));
              }}
              style={{ border: 0, background: 'transparent', color: '#2457d6', cursor: 'pointer', fontSize: 12, fontWeight: 650, padding: 0 }}
            >
              Select All
            </button>
          )}
          {value.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              style={{ border: 0, background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 12, fontWeight: 650, padding: 0 }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>
    </div>
  </div>, language);
}

function ProjectCreateForm({ onCreated, language = 'en' }) {
  const [form, setForm] = useState({ name: '', description: '', start_date: '', end_date: '' });
  const [scope, setScope] = useState('');
  const [target, setTarget] = useState(null);
  const [filterDistrict, setFilterDistrict] = useState(null);
  const [filterAssembly, setFilterAssembly] = useState(null);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [relatedAssemblies, setRelatedAssemblies] = useState([]);
  const [selectedAssemblies, setSelectedAssemblies] = useState([]);
  const [selectedTalukas, setSelectedTalukas] = useState([]);
  const [selectedVillages, setSelectedVillages] = useState([]);
  const [selectedStations, setSelectedStations] = useState([]);
  const [relatedAssembliesLoading, setRelatedAssembliesLoading] = useState(false);
  const [relatedAssembliesError, setRelatedAssembliesError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Map Feature States & Helpers
  const [activeMapTarget, setActiveMapTarget] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapMode, setMapMode] = useState('roadmap'); // 'roadmap' | 'satellite'
  const [mapZoom, setMapZoom] = useState(13); // Zoom level: 6 (State) to 19 (Street)
  const [debouncedZoom, setDebouncedZoom] = useState(13);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapProvider, setMapProvider] = useState('google'); // 'google' | 'osm'
  const lastWheelTimeRef = useRef(0);

  useEffect(() => {
    setMapLoading(true);
    const t = setTimeout(() => {
      setDebouncedZoom(mapZoom);
    }, 250);
    return () => clearTimeout(t);
  }, [mapZoom]);

  const getTargetDefaultZoom = (mTarget) => {
    if (!mTarget) return 13;
    if (mTarget.type === 'DISTRICT') return 11;
    if (mTarget.type === 'ASSEMBLY' || mTarget.type === 'LOK_SABHA') return 12;
    if (mTarget.type === 'TALUKA') return 13;
    if (mTarget.type === 'VILLAGE') return 15;
    if (mTarget.type === 'POLLING_STATION') return 17;
    return 13;
  };

  const handleZoomIn = () => setMapZoom((prev) => Math.min(19, prev + 1));
  const handleZoomOut = () => setMapZoom((prev) => Math.max(6, prev - 1));
  const handleWheelZoom = (e) => {
    const now = Date.now();
    if (now - lastWheelTimeRef.current < 180) return;
    lastWheelTimeRef.current = now;
    if (e.deltaY < 0) {
      handleZoomIn();
    } else if (e.deltaY > 0) {
      handleZoomOut();
    }
  };

  const activeDistrictName = (selectedDistricts[0]?.name_mr || selectedDistricts[0]?.name_en || selectedDistricts[0]?.name || filterDistrict?.name_mr || filterDistrict?.name_en || filterDistrict?.name || 'सांगली');

  const getMapQuery = (mTarget) => {
    if (!mTarget) return 'Sangli, Maharashtra, India';
    const nameEn = mTarget.name_en || mTarget.name || '';
    const nameMr = mTarget.name_mr || '';
    const place = nameEn || nameMr || 'Sangli';
    const dist = mTarget.district_name || (activeDistrictName.includes('सांगली') ? 'Sangli' : activeDistrictName) || 'Sangli';

    if (mTarget.type === 'TALUKA') return `${place} Taluka, ${dist}, Maharashtra, India`;
    if (mTarget.type === 'DISTRICT') return `${place} District, Maharashtra, India`;
    if (mTarget.type === 'ASSEMBLY' || mTarget.type === 'LOK_SABHA') return `${place} Constituency, Maharashtra, India`;
    if (mTarget.type === 'VILLAGE') return `${place}, ${dist}, Maharashtra, India`;
    if (mTarget.type === 'POLLING_STATION') return `${place}, ${dist}, Maharashtra, India`;
    return `${place}, ${dist}, Maharashtra, India`;
  };

  const handleOpenMap = (item, openModal = false) => {
    setActiveMapTarget(item);
    setMapLoading(true);
    if (item) {
      setMapZoom(getTargetDefaultZoom(item));
    }
    if (openModal) {
      setShowMapModal(true);
    }
  };

  const resetScope = (nextScope) => {
    setScope(nextScope);
    setTarget(null);
    setFilterDistrict(null);
    setFilterAssembly(null);
    setSelectedDistricts([]);
    setDistrictOptions([]);
    setSelectedAssemblies([]);
    setSelectedTalukas([]);
    setSelectedVillages([]);
    setSelectedStations([]);
    setError('');
    setRelatedAssemblies([]);
    setRelatedAssembliesError('');
    setActiveMapTarget(null);
    setShowMapModal(false);
  };

  const selectRootTarget = (item) => {
    setTarget(item);
    setSelectedDistricts([]);
    setDistrictOptions([]);
    setSelectedAssemblies([]);
    setSelectedTalukas([]);
    setSelectedVillages([]);
    setSelectedStations([]);
    if (item) {
      setActiveMapTarget({
        type: scope,
        name_en: item.name_en || item.name,
        name_mr: item.name_mr,
      });
    } else {
      setActiveMapTarget(null);
    }
  };

  useEffect(() => {
    if (!target?.code) {
      setRelatedAssemblies([]);
      setRelatedAssembliesError('');
      setDistrictOptions([]);
      setSelectedDistricts([]);
      setRelatedAssembliesLoading(false);
      return undefined;
    }
    if (!['LOK_SABHA', 'ASSEMBLY', 'GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY'].includes(scope)) {
      setRelatedAssemblies([]);
      setDistrictOptions([]);
      setSelectedDistricts([]);
      setRelatedAssembliesError('');
      setRelatedAssembliesLoading(false);
      return undefined;
    }

    let cancelled = false;
    const loadRelated = async () => {
      try {
        if (scope === 'LOK_SABHA') {
          setRelatedAssembliesLoading(true);
          setRelatedAssembliesError('');
          const { data } = await apiClient.get(`/admin/project-geography/lok-sabha/${encodeURIComponent(target.code)}/assemblies`);
          if (!cancelled) {
            const assemblies = data.data || [];
            setRelatedAssemblies(assemblies);
            setSelectedAssemblies(assemblies);
          }
        } else {
          let districtUrl = null;
          if (scope === 'ASSEMBLY') {
            districtUrl = `/admin/project-geography/assemblies/${encodeURIComponent(target.code)}/districts`;
          } else if (scope === 'GRADUATE_CONSTITUENCY') {
            districtUrl = `/admin/project-geography/graduate-constituencies/${encodeURIComponent(target.code)}/districts`;
          } else if (scope === 'TEACHER_CONSTITUENCY') {
            districtUrl = `/admin/project-geography/teacher-constituencies/${encodeURIComponent(target.code)}/districts`;
          }
          if (districtUrl) {
            const { data: districtData } = await apiClient.get(districtUrl);
            if (!cancelled) {
              const options = districtData.data || [];
              setDistrictOptions(options);
              // Default to selecting all districts covered by this constituency/assembly
              setSelectedDistricts(options);
            }
          }
        }
      } catch (requestError) {
        if (!cancelled && scope === 'LOK_SABHA') setRelatedAssembliesError(requestError.message || 'Could not load related constituencies.');
      } finally {
        if (!cancelled) setRelatedAssembliesLoading(false);
      }
    };
    loadRelated();

    return () => { cancelled = true; };
  }, [scope, target?.code]);

  // Dynamically update districts for Lok Sabha based on selected Vidhan Sabha constituencies
  useEffect(() => {
    if (scope !== 'LOK_SABHA' || !target?.code) return;

    if (!selectedAssemblies.length) {
      setDistrictOptions([]);
      setSelectedDistricts([]);
      setSelectedTalukas([]);
      setSelectedVillages([]);
      setSelectedStations([]);
      return;
    }

    const districtMap = new Map();
    selectedAssemblies.forEach((assembly) => {
      const code = String(assembly.district_code || '');
      if (!code) return;
      if (!districtMap.has(code)) {
        districtMap.set(code, {
          code,
          name_en: assembly.district_name || `District ${code}`,
          name_mr: assembly.district_name_mr || '',
          assembly_count: 1,
        });
      } else {
        const item = districtMap.get(code);
        item.assembly_count += 1;
      }
    });

    if (districtMap.size > 0) {
      const options = Array.from(districtMap.values()).sort((a, b) => a.name_en.localeCompare(b.name_en));
      setDistrictOptions(options);
      setSelectedDistricts((prev) => {
        const stillValid = prev.filter((d) => options.some((opt) => opt.code === d.code));
        return stillValid.length > 0 ? stillValid : options;
      });
    } else {
      let cancelled = false;
      const asmNos = selectedAssemblies.map((a) => a.code).join(',');
      apiClient.get(`/admin/project-geography/lok-sabha/${encodeURIComponent(target.code)}/districts?assembly_nos=${asmNos}`)
        .then(({ data }) => {
          if (cancelled) return;
          const options = data.data || [];
          setDistrictOptions(options);
          setSelectedDistricts((prev) => {
            const stillValid = prev.filter((d) => options.some((opt) => opt.code === d.code));
            return stillValid.length > 0 ? stillValid : options;
          });
        })
        .catch(() => {});
      return () => { cancelled = true; };
    }
  }, [scope, target?.code, selectedAssemblies]);

  const activeDistrictCodes = scope === 'POLLING_STATION'
    ? (filterDistrict?.code ? [String(filterDistrict.code)] : [])
    : selectedDistricts.map((item) => String(item.code));

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Please enter a project name.');
    if (!scope) return setError('Select a geographic scope to continue.');

    const assemblyContext = scope === 'LOK_SABHA'
      ? selectedAssemblies.map((item) => Number(item.code)).filter((n) => !isNaN(n) && n > 0)
      : scope === 'ASSEMBLY' ? (target?.code && !isNaN(Number(target.code)) ? [Number(target.code)] : [])
        : scope === 'POLLING_STATION' ? (filterAssembly?.code && !isNaN(Number(filterAssembly.code)) ? [Number(filterAssembly.code)] : []) : [];

    const context = {
      district_code: activeDistrictCodes[0] || null,
      district_codes: activeDistrictCodes,
      ...(scope === 'POLLING_STATION' ? {
        assembly_no: filterAssembly?.code && !isNaN(Number(filterAssembly.code)) ? Number(filterAssembly.code) : null,
        election_year: selectedStations[0]?.election_year ? Number(selectedStations[0].election_year) : null,
      } : {}),
      assembly_codes: assemblyContext,
      taluka_codes: selectedTalukas.map((item) => String(item.code || item.taluka_code)),
      village_codes: selectedVillages.map((item) => String(item.code || item.village_code)),
      polling_stations: selectedStations.map((item) => ({
        code: String(item.code || item.part_no || ''),
        name: item.name_en || item.name || '',
        name_en: item.name_en || item.name || '',
        local_body_type: item.local_body_type || null,
        type_label: item.type_label || null,
        taluka_code: item.taluka_code ? String(item.taluka_code) : null,
        district_code: item.district_code ? String(item.district_code) : null,
        part_no: item.part_no ? String(item.part_no) : null,
        election_year: item.election_year ? Number(item.election_year) : null,
      })),
    };

    let geoCode = '';
    let geoNameEn = '';
    let geoNameMr = null;

    if (scope === 'DISTRICT') {
      geoCode = selectedDistricts.map((d) => d.code).filter(Boolean).join(',');
      geoNameEn = selectedDistricts.map((d) => d.name_en || d.name).filter(Boolean).join(', ');
      geoNameMr = selectedDistricts.map((d) => d.name_mr || d.name_en || d.name).filter(Boolean).join(', ') || null;
    } else if (scope === 'POLLING_STATION') {
      geoCode = selectedStations.map((s) => s.part_no || s.code).filter(Boolean).join(',');
      geoNameEn = selectedStations.map((s) => s.part_no ? `Part No. ${s.part_no}` : (s.name_en || s.name || s.code)).filter(Boolean).join(', ');
      geoNameMr = selectedStations.map((s) => s.name_mr || s.name_en || s.name).filter(Boolean).join(', ') || null;
    } else {
      geoCode = target?.code ? String(target.code) : (scope || 'GENERAL');
      geoNameEn = target?.name_en || target?.name || form.name.trim();
      geoNameMr = target?.name_mr || null;
    }

    if (!geoCode) geoCode = scope || 'GENERAL';
    if (!geoNameEn) geoNameEn = form.name.trim();

    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/admin/projects', {
        name: form.name.trim(),
        description: form.description.trim() || null,
        project_type: scope || 'GENERAL',
        status: 'DRAFT',
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        geographic_scope: scope || null,
        geographic_code: geoCode,
        geographic_name_en: geoNameEn,
        geographic_name_mr: geoNameMr,
        geographic_context: context,
      });
      setForm({ name: '', description: '', start_date: '', end_date: '' });
      resetScope('');
      onCreated?.(data.project);
    } catch (requestError) {
      let errorMsg = 'Project could not be created.';
      if (requestError.errors && typeof requestError.errors === 'object') {
        const errorList = Object.values(requestError.errors).flat();
        if (errorList.length > 0) {
          errorMsg = errorList.join(' ');
        }
      } else if (requestError.message) {
        errorMsg = requestError.message;
      }
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const targetEndpoint = {
    DISTRICT: '/admin/project-geography/districts',
    LOK_SABHA: '/admin/project-geography/lok-sabha',
    ASSEMBLY: '/admin/project-geography/assemblies',
    POLLING_STATION: '/admin/project-geography/polling-stations',
    GRADUATE_CONSTITUENCY: '/admin/project-geography/graduate-constituencies',
    TEACHER_CONSTITUENCY: '/admin/project-geography/teacher-constituencies',
  }[scope];

  const stationParams = {
    ...(activeDistrictCodes.length ? { district_codes: activeDistrictCodes.join(',') } : {}),
    ...(scope === 'LOK_SABHA' && selectedAssemblies.length ? { assembly_nos: selectedAssemblies.map((item) => item.code).join(',') } : {}),
    ...(scope === 'ASSEMBLY' && target?.code ? { assembly_no: target.code } : {}),
    ...(scope === 'POLLING_STATION' && filterAssembly?.code ? { assembly_no: filterAssembly.code } : {}),
    ...(selectedTalukas.length ? { taluka_codes: selectedTalukas.map((item) => item.code).join(',') } : {}),
    ...(selectedVillages.length ? { village_codes: selectedVillages.map((item) => item.code).join(',') } : {}),
  };

  const talukaEndpoint = scope === 'ASSEMBLY' && target?.code
    ? `/admin/project-geography/assemblies/${encodeURIComponent(target.code)}/talukas`
    : '/master-data/talukas';

  const talukaParams = scope === 'ASSEMBLY'
    ? { load_all: true }
    : { district_codes: activeDistrictCodes.join(','), load_all: true };

  const villageParams = {
    district_codes: activeDistrictCodes.join(','),
    taluka_codes: selectedTalukas.map((item) => item.taluka_code || item.code),
    taluka_code: selectedTalukas.map((item) => item.taluka_code || item.code).join(','),
  };

  const isFormReady = Boolean(form.name.trim()) && (
    scope === 'DISTRICT'
      ? selectedDistricts.length > 0
      : scope === 'POLLING_STATION'
        ? selectedStations.length > 0
        : Boolean(target)
  );

  return translateTree(<form onSubmit={submit} className="project-create-card" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box', overflowX: 'hidden', margin: 0 }}>
    <div className="project-create-header" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
        <h2 style={{ margin: '0 0 4px', fontSize: 'clamp(16px, 4vw, 19px)', fontWeight: 800, color: '#0f172a' }}>
          {language === 'mr' ? 'नवीन प्रकल्प तयार करा' : 'Create New Project'}
        </h2>
        <p style={{ ...style.muted, margin: 0, fontSize: 12.5 }}>
          {language === 'mr' ? 'या प्रकल्पासाठी भौगोलिक स्तर व कार्यक्षेत्र निवडा.' : 'Choose the geographic level this project targets.'}
        </p>
      </div>

      {/* Quick Map Access Button */}
      <button
        type="button"
        onClick={() => setShowMapModal(true)}
        className="project-header-map-btn"
        title={language === 'mr' ? 'नकाशा पहा (सांगली / निवडलेले क्षेत्र)' : 'Watch Map (Sangli / Selected Area)'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
          color: '#ffffff',
          border: 'none',
          borderRadius: 8,
          padding: '9px 14px',
          fontSize: 13.5,
          fontWeight: 700,
          cursor: 'pointer',
          boxSizing: 'border-box',
          maxWidth: '100%',
        }}
      >
        <span style={{ fontSize: 16 }}>🗺️</span>
        <span style={{ fontWeight: 800 }}>{language === 'mr' ? 'नकाशा पहा' : 'Watch Map'}</span>
        {activeDistrictName && (
          <span className="project-header-map-badge" style={{ background: 'rgba(255, 255, 255, 0.22)', padding: '2px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700 }}>
            {activeDistrictName}
          </span>
        )}
      </button>
    </div>

    <div style={{ maxWidth: '100%', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <label style={style.label}>Project Name *<input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ ...style.input, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} placeholder={language === 'mr' ? 'उदा. सांगली मतदार नोंदणी मोहीम' : 'e.g. Sangli Voter Outreach Campaign'} /></label>
      <label style={style.label}>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} style={{ ...style.input, resize: 'vertical', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} placeholder={language === 'mr' ? 'प्रकल्पाचे थोडक्यात वर्णन...' : 'Brief project description...'} /></label>
    </div>

    <section aria-labelledby="scope-heading" style={{ marginTop: 20, width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div id="scope-heading" style={{ fontSize: 13.5, fontWeight: 750, marginBottom: 8, letterSpacing: '0.2px' }}>
        PROJECT GEOGRAPHY <span style={{ color: '#d92d20' }}>*</span>
      </div>
      <p style={{ ...style.muted, marginTop: 0, marginBottom: 10, fontSize: 12 }}>What area does this project cover?</p>
      <div role="radiogroup" aria-label="Geographic scope" className="project-geo-grid" style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        {scopes.map((option) => {
          const isWide = ['GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY'].includes(option.value);
          const isSelected = scope === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => resetScope(option.value)}
              className={`project-geo-card ${isSelected ? 'selected' : ''} ${isWide ? 'project-geo-wide' : ''}`}
            >
              <span className="project-geo-card-top">
                <span
                  aria-hidden="true"
                  className={`project-geo-radio ${isSelected ? 'selected' : ''}`}
                />
                <span className="project-geo-title">
                  {option.title}
                </span>
              </span>
              <span className="project-geo-desc">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </section>

    {scope && <div style={{ maxWidth: 780, marginTop: 22 }}>
      {scope === 'POLLING_STATION' ? (
        <>
          <SearchPicker
            language={language}
            label="District *"
            endpoint="/admin/project-geography/districts"
            value={filterDistrict}
            onViewMap={(item) => handleOpenMap({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={(item) => { setFilterDistrict(item); setFilterAssembly(null); setSelectedStations([]); setSelectedTalukas([]); setSelectedVillages([]); setActiveMapTarget({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr }); }}
            onClear={() => { setFilterDistrict(null); setFilterAssembly(null); setSelectedStations([]); setSelectedTalukas([]); setSelectedVillages([]); setActiveMapTarget(null); }}
            placeholder="Search district (उदा. सांगली / Sangli)..."
          />

          {/* Dedicated District Map Action Banner */}
          {filterDistrict && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: -8,
              marginBottom: 16,
              padding: '11px 15px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1.5px solid #93c5fd',
              borderRadius: 10,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
            }}>
              <div style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 650, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18 }}>📍</span>
                <span>
                  {language === 'mr' ? 'निवडलेला जिल्हा:' : 'Selected District:'}{' '}
                  <strong style={{ color: '#0f172a' }}>{filterDistrict.name_mr || filterDistrict.name_en}</strong>
                </span>
                <span style={{ fontSize: 11.5, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                  {language === 'mr' ? 'नकाशा उपलब्ध' : 'Map Ready'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenMap({ type: 'DISTRICT', name_en: filterDistrict.name_en || filterDistrict.name, name_mr: filterDistrict.name_mr }, true)}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 7,
                  padding: '7px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 5px rgba(37, 99, 235, 0.25)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🗺️</span>
                <span>{language === 'mr' ? 'जिल्हा नकाशा पहा' : 'Watch District Map'}</span>
              </button>
            </div>
          )}

          <SearchPicker
            language={language}
            label="Assembly Constituency *"
            endpoint="/admin/project-geography/assemblies"
            value={filterAssembly}
            onViewMap={(item) => handleOpenMap({ type: 'ASSEMBLY', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onSelect={(item) => { setFilterAssembly(item); setSelectedStations([]); setActiveMapTarget({ type: 'ASSEMBLY', name_en: item.name_en || item.name, name_mr: item.name_mr }); }}
            onClear={() => { setFilterAssembly(null); setSelectedStations([]); }}
            placeholder="Search assembly..."
          />
        </>
      ) : scope === 'DISTRICT' ? (
        <>
          <MultiSearchPicker
            language={language}
            pickerType="DISTRICT"
            label="Districts * (select one or multiple)"
            endpoint="/admin/project-geography/districts"
            value={selectedDistricts}
            onViewMap={(item) => handleOpenMap({ type: 'DISTRICT', name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
            onChange={(items) => {
              setSelectedDistricts(items);
              setSelectedTalukas([]);
              setSelectedVillages([]);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({ type: 'DISTRICT', name_en: latest.name_en || latest.name, name_mr: latest.name_mr });
              }
            }}
            placeholder="Search and select one or more districts in English or Marathi (उदा. सांगली / Sangli)..."
          />

          {/* Dedicated District Map View Action Banner (prominently shown when Sangli or any district is chosen) */}
          {selectedDistricts.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: -6,
              marginBottom: 18,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
              border: '1.5px solid #93c5fd',
              borderRadius: 10,
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
            }}>
              <div style={{ fontSize: 13, color: '#1e3a8a', fontWeight: 650, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 18 }}>📍</span>
                <span>
                  {language === 'mr' ? 'निवडलेला जिल्हा:' : 'Selected District:'}{' '}
                  <strong style={{ color: '#0f172a' }}>
                    {selectedDistricts.filter(Boolean).map(d => typeof d === 'object' ? (d.name_mr || d.name_en || d.name || '') : String(d)).filter(Boolean).join(', ')}
                  </strong>
                </span>
                <span style={{ fontSize: 11.5, background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: 12, fontWeight: 700 }}>
                  {language === 'mr' ? 'नकाशा उपलब्ध' : 'Map Ready'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  const latest = selectedDistricts[selectedDistricts.length - 1];
                  if (latest) {
                    handleOpenMap({
                      type: 'DISTRICT',
                      name_en: typeof latest === 'object' ? (latest.name_en || latest.name || 'Sangli') : String(latest),
                      name_mr: typeof latest === 'object' ? (latest.name_mr || 'सांगली') : 'सांगली',
                    }, true);
                  }
                }}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 7,
                  padding: '8px 15px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.28)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1d4ed8'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#2563eb'; }}
              >
                <span>🗺️</span>
                <span>{language === 'mr' ? 'जिल्हा नकाशा पहा' : 'Watch District Map'}</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <SearchPicker
          language={language}
          key={scope}
          label={`Select ${scopes.find((item) => item.value === scope)?.title} *`}
          endpoint={targetEndpoint}
          value={target}
          onViewMap={(item) => handleOpenMap({ type: scope, name_en: item.name_en || item.name, name_mr: item.name_mr }, true)}
          onSelect={selectRootTarget}
          onClear={() => selectRootTarget(null)}
          placeholder={`Search ${scopes.find((item) => item.value === scope)?.title.toLowerCase()} in English or Marathi...`}
        />
      )}

      {scope === 'LOK_SABHA' && target && <section aria-label="Related Assembly constituencies" style={{ marginBottom: 17, padding: 15, border: '1px solid #dbe4f0', borderRadius: 9, background: '#f8faff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontWeight: 750, color: '#17253c', fontSize: 14 }}>
            Vidhan Sabha Constituencies under {target.name_en || target.name} ({relatedAssemblies.length} assemblies)
          </div>
          {relatedAssemblies.length > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                onClick={() => { setSelectedAssemblies(relatedAssemblies); setSelectedStations([]); }}
                style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#2457d6', cursor: 'pointer' }}
              >
                Select All ({relatedAssemblies.length})
              </button>
              <button
                type="button"
                onClick={() => { setSelectedAssemblies([]); setSelectedStations([]); }}
                style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <p style={{ ...style.muted, margin: '0 0 11px' }}>Select one or more Vidhan Sabha constituencies to show the district(s) and talukas under them.</p>
        {relatedAssembliesLoading ? (
          <div style={style.muted}>Loading related constituencies…</div>
        ) : relatedAssembliesError ? (
          <div role="alert" style={{ color: '#b42318', fontSize: 13 }}>{relatedAssembliesError}</div>
        ) : relatedAssemblies.length ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 8 }}>
            {relatedAssemblies.map((assembly) => {
              const isChecked = selectedAssemblies.some((item) => String(item.code) === String(assembly.code));
              return (
                <div
                  key={assembly.code}
                  onClick={() => {
                    setSelectedAssemblies((items) =>
                      isChecked ? items.filter((item) => String(item.code) !== String(assembly.code)) : [...items, assembly]
                    );
                    setSelectedStations([]);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '9px 12px',
                    borderRadius: 8,
                    background: isChecked ? '#eff6ff' : '#fff',
                    border: isChecked ? '1.5px solid #3b82f6' : '1px solid #e2e8f0',
                    cursor: 'pointer',
                    boxShadow: isChecked ? '0 1px 3px rgba(59, 130, 246, 0.12)' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', margin: 0, flex: 1 }}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // click handled by parent container
                      style={{ cursor: 'pointer', width: 16, height: 16 }}
                    />
                    <div>
                      <span style={{ fontWeight: isChecked ? 700 : 550, fontSize: 13, color: isChecked ? '#1e40af' : '#1e293b' }}>
                        {assembly.code ? `${assembly.code} — ` : ''}{assembly.name_en}
                      </span>
                      {assembly.name_mr && (
                        <span lang="mr" style={{ display: 'block', fontSize: 11.5, color: '#64748b' }}>
                          {assembly.name_mr}
                        </span>
                      )}
                    </div>
                  </label>
                  {assembly.district_name && (
                    <span style={{ fontSize: 11, fontWeight: 650, padding: '2px 8px', borderRadius: 999, background: isChecked ? '#dbeafe' : '#f1f5f9', color: isChecked ? '#1d4ed8' : '#475569', border: isChecked ? '1px solid #bfdbfe' : '1px solid #e2e8f0', whiteSpace: 'nowrap' }}>
                      📍 {assembly.district_name}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div style={style.muted}>No linked assembly constituencies are available for this Lok Sabha.</div>
        )}
      </section>}

      {scope === 'LOK_SABHA' && target && !selectedAssemblies.length && (
        <div style={{ marginBottom: 18, padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#92400e', fontSize: 13 }}>
          ⚠️ Please select at least one Vidhan Sabha constituency above to display the districts and talukas.
        </div>
      )}

      {['LOK_SABHA', 'ASSEMBLY', 'GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY'].includes(scope) && target && <>
        {districtOptions.length > 0 ? (
          <div style={{ marginBottom: 18, padding: '14px 16px', background: '#f8fafc', border: '1px solid #dbe4f0', borderRadius: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <span style={{ fontWeight: 750, color: '#17253c', fontSize: 14 }}>
                  {scope === 'LOK_SABHA'
                    ? `Districts under selected Vidhan Sabha (${districtOptions.length} district${districtOptions.length === 1 ? '' : 's'})`
                    : `Districts under ${target.name_en || target.name} (${districtOptions.length} district${districtOptions.length === 1 ? '' : 's'})`}
                </span>
                <span style={{ marginLeft: 8, fontSize: 12, fontWeight: 650, padding: '2px 8px', borderRadius: 12, background: selectedDistricts.length ? '#e0f2fe' : '#fee2e2', color: selectedDistricts.length ? '#0369a1' : '#b91c1c' }}>
                  {selectedDistricts.length} of {districtOptions.length} selected
                </span>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDistricts(districtOptions);
                    setSelectedTalukas([]);
                    setSelectedVillages([]);
                    setSelectedStations([]);
                  }}
                  style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#2457d6', cursor: 'pointer' }}
                >
                  Select All ({districtOptions.length})
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDistricts([]);
                    setSelectedTalukas([]);
                    setSelectedVillages([]);
                    setSelectedStations([]);
                  }}
                  style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 5, padding: '4px 9px', fontSize: 12, fontWeight: 600, color: '#64748b', cursor: 'pointer' }}
                >
                  Clear
                </button>
              </div>
            </div>
            <p style={{ ...style.muted, margin: '0 0 10px', fontSize: 12.5 }}>
              Choose one or multiple districts to load their talukas and villages below.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 9 }}>
              {districtOptions.map((district) => {
                const isSelected = selectedDistricts.some((d) => String(d.code) === String(district.code));
                return (
                  <div
                    key={district.code}
                    onClick={() => {
                      const next = isSelected
                        ? selectedDistricts.filter((d) => String(d.code) !== String(district.code))
                        : [...selectedDistricts, district];
                      setSelectedDistricts(next);
                      setSelectedTalukas([]);
                      setSelectedVillages([]);
                      setSelectedStations([]);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '10px 13px',
                      borderRadius: 8,
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #cfd8e3',
                      background: isSelected ? '#eff6ff' : '#ffffff',
                      color: isSelected ? '#1e3a8a' : '#334155',
                      cursor: 'pointer',
                      boxShadow: isSelected ? '0 1px 3px rgba(37, 99, 235, 0.12)' : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <label style={{ display: 'flex', gap: 9, alignItems: 'center', cursor: 'pointer', margin: 0, flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ cursor: 'pointer', width: 16, height: 16, accentColor: '#2563eb' }}
                      />
                      <div>
                        <span style={{ display: 'block', fontWeight: isSelected ? 700 : 600, fontSize: 13 }}>
                          📍 {district.name_en}
                        </span>
                        {district.name_mr && (
                          <span lang="mr" style={{ display: 'block', color: isSelected ? '#2563eb' : '#64748b', fontSize: 12, marginTop: 2 }}>
                            {district.name_mr}
                          </span>
                        )}
                        {district.assembly_count ? (
                          <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, padding: '2px 7px', borderRadius: 4, background: isSelected ? '#dbeafe' : '#f1f5f9', color: isSelected ? '#1d4ed8' : '#475569', fontWeight: 650 }}>
                            {district.assembly_count} Vidhan Sabha{district.assembly_count === 1 ? '' : 's'}
                          </span>
                        ) : null}
                      </div>
                    </label>
                  </div>
                );
              })}
            </div>

            {/* If any district like Sangli is selected from districtOptions, show prominent Watch Map banner */}
            {selectedDistricts.length > 0 && (() => {
              const activeDist = selectedDistricts[selectedDistricts.length - 1];
              const distNameEn = activeDist?.name_en || activeDist?.name || 'Sangli';
              const distNameMr = activeDist?.name_mr || 'सांगली';
              return (
                <div style={{
                  marginTop: 12,
                  padding: '12px 14px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%)',
                  border: '1px solid #bfdbfe',
                  borderRadius: 9,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 20 }}>🗺️</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 750, color: '#1e3a8a' }}>
                        {language === 'mr' ? `निवडलेला जिल्हा: ${distNameMr} (${distNameEn})` : `Selected District: ${distNameEn} (${distNameMr})`}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#475569' }}>
                        {language === 'mr' ? 'या जिल्ह्याचा संपूर्ण भौगोलिक नकाशा पहा' : 'View complete district geographical map'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleOpenMap({ type: 'DISTRICT', name_en: distNameEn, name_mr: distNameMr }, true)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 0,
                      borderRadius: 7,
                      padding: '7px 13px',
                      fontSize: 12.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(37,99,235,0.2)'
                    }}
                  >
                    🗺️ {language === 'mr' ? `${distNameMr} नकाशा पहा` : `Watch ${distNameEn} Map`}
                  </button>
                </div>
              );
            })()}
          </div>
        ) : (['LOK_SABHA', 'ASSEMBLY'].includes(scope) && (scope !== 'LOK_SABHA' || selectedAssemblies.length > 0) ? (
          <MultiSearchPicker
            language={language}
            label="Districts * (select multiple)"
            endpoint="/admin/project-geography/districts"
            value={selectedDistricts}
            onChange={(items) => {
              setSelectedDistricts(items);
              setSelectedTalukas([]);
              setSelectedVillages([]);
              setSelectedStations([]);
            }}
            placeholder="Search districts..."
          />
        ) : null)}
      </>}

      {['LOK_SABHA', 'GRADUATE_CONSTITUENCY', 'TEACHER_CONSTITUENCY'].includes(scope) && target && districtOptions.length > 0 && !selectedDistricts.length && (
        <div style={{ marginBottom: 18, padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, color: '#92400e', fontSize: 13 }}>
          ⚠️ Please select at least one district above to display talukas and villages.
        </div>
      )}

      {activeDistrictCodes.length > 0 && scope !== 'POLLING_STATION' && (
        <>
          <MultiSearchPicker
            language={language}
            pickerType="TALUKA"
            label="Taluka (select multiple)"
            endpoint={talukaEndpoint}
            params={talukaParams}
            value={selectedTalukas}
            onViewMap={(item) => handleOpenMap({
              type: 'TALUKA',
              name_en: item.name_en || item.taluka_name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedTalukas(items);
              setSelectedVillages([]);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'TALUKA',
                  name_en: latest.name_en || latest.taluka_name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            placeholder="Select Taluka"
          />

          {/* Dedicated Taluka Map View Action Banner */}
          {selectedTalukas.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: -8,
              marginBottom: 16,
              padding: '10px 14px',
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: 9,
              boxShadow: '0 1px 3px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ fontSize: 13, color: '#166534', fontWeight: 650, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📍</span>
                <span>
                  {language === 'mr' ? 'निवडलेला तालुका:' : 'Selected Taluka:'} <strong>{selectedTalukas.map(t => t.name_mr || t.name_en || t.taluka_name).join(', ')}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const latest = selectedTalukas[selectedTalukas.length - 1];
                  handleOpenMap({
                    type: 'TALUKA',
                    name_en: latest.name_en || latest.taluka_name,
                    name_mr: latest.name_mr,
                    district_name: activeDistrictName,
                  }, true);
                }}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#16a34a'; }}
              >
                <span>🗺️</span>
                <span>{language === 'mr' ? 'तालुका नकाशावर पहा' : 'View Taluka on Map'}</span>
              </button>
            </div>
          )}

          <MultiSearchPicker
            language={language}
            pickerType="VILLAGE"
            label="Village (select multiple)"
            endpoint="/master-data/villages"
            params={villageParams}
            value={selectedVillages}
            onViewMap={(item) => handleOpenMap({
              type: 'VILLAGE',
              name_en: item.name_en || item.village_name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedVillages(items);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'VILLAGE',
                  name_en: latest.name_en || latest.village_name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            disabled={!selectedTalukas.length}
            placeholder="Search Village"
          />
          <MultiSearchPicker
            language={language}
            pickerType="POLLING_STATION"
            label="Polling Station / Local Body (select multiple)"
            endpoint="/admin/project-geography/polling-stations"
            params={stationParams}
            value={selectedStations}
            onViewMap={(item) => handleOpenMap({
              type: 'POLLING_STATION',
              name_en: item.name_en || item.name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedStations(items);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'POLLING_STATION',
                  name_en: latest.name_en || latest.name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            placeholder="Search Polling Station or Local Body"
            noResultsText="No local body or polling station records match these selected filters."
          />
        </>
      )}

      {scope === 'POLLING_STATION' && filterDistrict && (
        <>
          <MultiSearchPicker
            language={language}
            pickerType="TALUKA"
            label="Taluka (optional, multiple)"
            endpoint={talukaEndpoint}
            params={talukaParams}
            value={selectedTalukas}
            onViewMap={(item) => handleOpenMap({
              type: 'TALUKA',
              name_en: item.name_en || item.taluka_name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedTalukas(items);
              setSelectedVillages([]);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'TALUKA',
                  name_en: latest.name_en || latest.taluka_name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            placeholder="Select Taluka"
          />

          {/* Dedicated Taluka Map View Action Banner */}
          {selectedTalukas.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              marginTop: -8,
              marginBottom: 16,
              padding: '10px 14px',
              background: '#f0fdf4',
              border: '1.5px solid #bbf7d0',
              borderRadius: 9,
              boxShadow: '0 1px 3px rgba(22, 163, 74, 0.08)'
            }}>
              <div style={{ fontSize: 13, color: '#166534', fontWeight: 650, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📍</span>
                <span>
                  {language === 'mr' ? 'निवडलेला तालुका:' : 'Selected Taluka:'} <strong>{selectedTalukas.map(t => t.name_mr || t.name_en || t.taluka_name).join(', ')}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  const latest = selectedTalukas[selectedTalukas.length - 1];
                  handleOpenMap({
                    type: 'TALUKA',
                    name_en: latest.name_en || latest.taluka_name,
                    name_mr: latest.name_mr,
                    district_name: activeDistrictName,
                  }, true);
                }}
                style={{
                  background: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 14px',
                  fontSize: 12.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#15803d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#16a34a'; }}
              >
                <span>🗺️</span>
                <span>{language === 'mr' ? 'तालुका नकाशावर पहा' : 'View Taluka on Map'}</span>
              </button>
            </div>
          )}

          <MultiSearchPicker
            language={language}
            pickerType="VILLAGE"
            label="Village (optional, multiple)"
            endpoint="/master-data/villages"
            params={villageParams}
            value={selectedVillages}
            onViewMap={(item) => handleOpenMap({
              type: 'VILLAGE',
              name_en: item.name_en || item.village_name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedVillages(items);
              setSelectedStations([]);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'VILLAGE',
                  name_en: latest.name_en || latest.village_name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            disabled={!selectedTalukas.length}
            placeholder="Search Village"
          />
          <MultiSearchPicker
            language={language}
            pickerType="POLLING_STATION"
            label="Polling Station / Local Body * (select multiple)"
            endpoint="/admin/project-geography/polling-stations"
            params={stationParams}
            value={selectedStations}
            onViewMap={(item) => handleOpenMap({
              type: 'POLLING_STATION',
              name_en: item.name_en || item.name,
              name_mr: item.name_mr,
              district_name: activeDistrictName,
            }, true)}
            onChange={(items) => {
              setSelectedStations(items);
              if (items.length > 0) {
                const latest = items[items.length - 1];
                setActiveMapTarget({
                  type: 'POLLING_STATION',
                  name_en: latest.name_en || latest.name,
                  name_mr: latest.name_mr,
                  district_name: activeDistrictName,
                });
              }
            }}
            disabled={!filterAssembly}
            placeholder="Search Polling Station or Local Body"
            noResultsText="No local body or polling station records match these selected filters."
          />
        </>
      )}
    </div>}
    {!scope && <p style={{ ...style.muted, marginTop: 19 }}>Select a geographic scope to continue.</p>}

    {/* ============================================================== */}
    {/* GEOGRAPHIC LIVE MAP PREVIEW SECTION                            */}
    {/* ============================================================== */}
    {scope && (activeMapTarget || selectedDistricts.length > 0 || selectedTalukas.length > 0 || target || filterDistrict) && (() => {
      const currentTarget = activeMapTarget || (
        selectedTalukas.length > 0
          ? { type: 'TALUKA', name_en: selectedTalukas[selectedTalukas.length - 1].name_en || selectedTalukas[selectedTalukas.length - 1].taluka_name, name_mr: selectedTalukas[selectedTalukas.length - 1].name_mr, district_name: activeDistrictName }
          : selectedDistricts.length > 0
            ? { type: 'DISTRICT', name_en: selectedDistricts[0].name_en, name_mr: selectedDistricts[0].name_mr }
            : filterDistrict
              ? { type: 'DISTRICT', name_en: filterDistrict.name_en, name_mr: filterDistrict.name_mr }
              : target
                ? { type: scope, name_en: target.name_en || target.name, name_mr: target.name_mr }
                : null
      );

      if (!currentTarget) return null;
      const query = getMapQuery(currentTarget);
      const embedUrl = mapProvider === 'osm'
        ? `https://www.openstreetmap.org/export/embed.html?bbox=74.1,16.65,74.9,17.25&layer=mapnik&marker=16.8524,74.5815`
        : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${mapMode === 'satellite' ? 'k' : ''}&z=${debouncedZoom}&ie=UTF8&iwloc=&output=embed`;
      const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

      return (
        <div style={{ marginTop: 26, marginBottom: 20, maxWidth: 780 }}>
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 4px 14px rgba(0,0,0,0.06)'
          }}>
            {/* Header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 20 }}>🗺️</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#f8fafc' }}>
                    {language === 'mr' ? 'भौगोलिक नकाशा थेट पूर्वावलोकन' : 'Geographic Map Live Preview'}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1 }}>
                    📍 {currentTarget.name_mr || currentTarget.name_en} ({currentTarget.type === 'TALUKA' ? (language === 'mr' ? 'तालुका' : 'Taluka') : currentTarget.type === 'DISTRICT' ? (language === 'mr' ? 'जिल्हा' : 'District') : currentTarget.type === 'VILLAGE' ? (language === 'mr' ? 'गाव' : 'Village') : currentTarget.type === 'POLLING_STATION' ? (language === 'mr' ? 'मतदान केंद्र' : 'Polling Station') : (language === 'mr' ? 'मतदारसंघ' : 'Constituency')})
                  </div>
                </div>
              </div>

              {/* Action Buttons & Zoom Bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Header Zoom In/Out Toolbar */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#334155', borderRadius: 8, padding: '2px 4px', gap: 4 }}>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम कमी करा (-)' : 'Zoom Out (-)'}
                    onClick={handleZoomOut}
                    disabled={mapZoom <= 6}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom <= 6 ? '#64748b' : '#ffffff',
                      fontSize: 15,
                      fontWeight: 800,
                      width: 26,
                      height: 26,
                      borderRadius: 4,
                      cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: '#38bdf8', minWidth: 28, textAlign: 'center' }}>
                    {mapZoom}x
                  </span>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम वाढवा (+)' : 'Zoom In (+)'}
                    onClick={handleZoomIn}
                    disabled={mapZoom >= 19}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom >= 19 ? '#64748b' : '#ffffff',
                      fontSize: 15,
                      fontWeight: 800,
                      width: 26,
                      height: 26,
                      borderRadius: 4,
                      cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Mode Switcher */}
                <div style={{ display: 'inline-flex', background: '#334155', borderRadius: 8, padding: 2 }}>
                  <button
                    type="button"
                    onClick={() => setMapMode('roadmap')}
                    style={{
                      border: 0,
                      background: mapMode === 'roadmap' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 9px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'रस्ता' : 'Map'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('satellite')}
                    style={{
                      border: 0,
                      background: mapMode === 'satellite' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 9px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'उपग्रह' : 'Satellite'}
                  </button>
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setShowMapModal(true)}
                  style={{
                    border: '1px solid #475569',
                    background: '#1e293b',
                    color: '#38bdf8',
                    borderRadius: 8,
                    padding: '5px 11px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 5
                  }}
                >
                  <span>⛶</span>
                  <span>{language === 'mr' ? 'पूर्ण पडदा' : 'Fullscreen'}</span>
                </button>

                {/* Open in Google Maps */}
                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: '1px solid #475569',
                    background: '#1e293b',
                    color: '#e2e8f0',
                    borderRadius: 8,
                    padding: '5px 10px',
                    fontSize: 12,
                    fontWeight: 650,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <span>Google Maps ↗</span>
                </a>
              </div>
            </div>

            {/* Zoom Presets & Location Switcher Row */}
            <div style={{
              padding: '7px 12px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              {/* Zoom Preset Shortcuts */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, overflowX: 'auto' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {language === 'mr' ? 'झूम स्तर:' : 'Zoom Level:'}
                </span>
                {[
                  { lvl: 10, labelMr: 'जिल्हा', labelEn: 'District', icon: '🏛️' },
                  { lvl: 13, labelMr: 'तालुका', labelEn: 'Taluka', icon: '📍' },
                  { lvl: 15, labelMr: 'गाव', labelEn: 'Village', icon: '🏡' },
                  { lvl: 17, labelMr: 'रस्ता/बूथ', labelEn: 'Street', icon: '🎯' },
                ].map((p) => (
                  <button
                    key={p.lvl}
                    type="button"
                    onClick={() => setMapZoom(p.lvl)}
                    style={{
                      border: mapZoom === p.lvl ? '1px solid #2563eb' : '1px solid #cbd5e1',
                      background: mapZoom === p.lvl ? '#dbeafe' : '#ffffff',
                      color: mapZoom === p.lvl ? '#1d4ed8' : '#475569',
                      borderRadius: 14,
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: mapZoom === p.lvl ? 750 : 600,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {p.icon} {language === 'mr' ? p.labelMr : p.labelEn} ({p.lvl}x)
                  </button>
                ))}
              </div>

              {/* Quick Area Switchers */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {language === 'mr' ? 'क्षेत्र:' : 'Area:'}
                </span>

                {/* District pill */}
                {selectedDistricts.length > 0 && selectedDistricts.map((d) => (
                  <button
                    key={d.code}
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: 'DISTRICT', name_en: d.name_en, name_mr: d.name_mr });
                      setMapZoom(11);
                    }}
                    style={{
                      border: currentTarget.type === 'DISTRICT' && (currentTarget.name_en === d.name_en || currentTarget.name_mr === d.name_mr) ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: currentTarget.type === 'DISTRICT' && (currentTarget.name_en === d.name_en || currentTarget.name_mr === d.name_mr) ? '#dbeafe' : '#ffffff',
                      color: currentTarget.type === 'DISTRICT' && (currentTarget.name_en === d.name_en || currentTarget.name_mr === d.name_mr) ? '#1d4ed8' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    🏢 {d.name_mr || d.name_en}
                  </button>
                ))}

                {/* Target / Assembly / Lok Sabha pill */}
                {target && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: scope, name_en: target.name_en || target.name, name_mr: target.name_mr });
                      setMapZoom(scope === 'ASSEMBLY' ? 12 : 11);
                    }}
                    style={{
                      border: currentTarget.type === scope ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: currentTarget.type === scope ? '#dbeafe' : '#ffffff',
                      color: currentTarget.type === scope ? '#1d4ed8' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    🏛️ {target.name_mr || target.name_en}
                  </button>
                )}

                {/* Talukas pills */}
                {selectedTalukas.length > 0 && selectedTalukas.map((t) => (
                  <button
                    key={t.code || t.id}
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: 'TALUKA', name_en: t.name_en || t.taluka_name, name_mr: t.name_mr, district_name: activeDistrictName });
                      setMapZoom(13);
                    }}
                    style={{
                      border: currentTarget.type === 'TALUKA' && (currentTarget.name_en === (t.name_en || t.taluka_name) || currentTarget.name_mr === t.name_mr) ? '1.5px solid #16a34a' : '1px solid #cbd5e1',
                      background: currentTarget.type === 'TALUKA' && (currentTarget.name_en === (t.name_en || t.taluka_name) || currentTarget.name_mr === t.name_mr) ? '#dcfce7' : '#ffffff',
                      color: currentTarget.type === 'TALUKA' && (currentTarget.name_en === (t.name_en || t.taluka_name) || currentTarget.name_mr === t.name_mr) ? '#15803d' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    📍 {t.name_mr || t.name_en || t.taluka_name}
                  </button>
                ))}

                {/* Villages pills */}
                {selectedVillages.length > 0 && selectedVillages.map((v) => (
                  <button
                    key={v.code || v.id}
                    type="button"
                    onClick={() => {
                      setActiveMapTarget({ type: 'VILLAGE', name_en: v.name_en || v.village_name, name_mr: v.name_mr, district_name: activeDistrictName });
                      setMapZoom(15);
                    }}
                    style={{
                      border: currentTarget.type === 'VILLAGE' && (currentTarget.name_en === (v.name_en || v.village_name) || currentTarget.name_mr === v.name_mr) ? '1.5px solid #7c3aed' : '1px solid #cbd5e1',
                      background: currentTarget.type === 'VILLAGE' && (currentTarget.name_en === (v.name_en || v.village_name) || currentTarget.name_mr === v.name_mr) ? '#f3e8ff' : '#ffffff',
                      color: currentTarget.type === 'VILLAGE' && (currentTarget.name_en === (v.name_en || v.village_name) || currentTarget.name_mr === v.name_mr) ? '#6d28d9' : '#334155',
                      borderRadius: 20,
                      padding: '3px 9px',
                      fontSize: 11.5,
                      fontWeight: 650,
                      cursor: 'pointer'
                    }}
                  >
                    🏡 {v.name_mr || v.name_en || v.village_name}
                  </button>
                ))}
              </div>
            </div>

            {/* Embedded Iframe Container with onWheel zoom and floating on-map controls */}
            <div
              onWheel={handleWheelZoom}
              style={{ position: 'relative', width: '100%', height: 350, background: '#e2e8f0', overflow: 'hidden' }}
            >
              {/* Floating on-map zoom widget */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  zIndex: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 9,
                  padding: '5px 4px',
                  boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम इन करा (+)' : 'Zoom In (+)'}
                  onClick={handleZoomIn}
                  disabled={mapZoom >= 19}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    border: 0,
                    background: mapZoom >= 19 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 17,
                    fontWeight: 800,
                    cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  +
                </button>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', padding: '2px 0', userSelect: 'none' }}>
                  {mapZoom}x
                </div>
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम आउट करा (-)' : 'Zoom Out (-)'}
                  onClick={handleZoomOut}
                  disabled={mapZoom <= 6}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 6,
                    border: 0,
                    background: mapZoom <= 6 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 17,
                    fontWeight: 800,
                    cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  −
                </button>
                <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.15)', margin: '2px 0' }} />
                <button
                  type="button"
                  title={language === 'mr' ? 'मूळ झूम रीसेट करा' : 'Reset Default Zoom'}
                  onClick={() => setMapZoom(getTargetDefaultZoom(currentTarget))}
                  style={{
                    width: 28,
                    height: 22,
                    borderRadius: 5,
                    border: 0,
                    background: 'rgba(255,255,255,0.12)',
                    color: '#94a3b8',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  ⟲
                </button>
              </div>

              <InteractiveGeographicMap
                target={currentTarget}
                zoom={mapZoom}
                onZoomChange={(newZoom) => setMapZoom(newZoom)}
                mapMode={mapMode}
                language={language}
                height="100%"
              />
            </div>

            {/* Scroll / Pan & Zoom Helper Bar */}
            <div style={{
              padding: '7px 14px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 11.5,
              color: '#64748b'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>👆</span>
                <span>
                  {language === 'mr'
                    ? 'नकाशा हलवण्यासाठी ड्रॅग (Scroll/Pan) करा • झूमसाठी [ + ] / [ − ] बटणे किंवा Mouse Wheel वापरा'
                    : 'Click & drag to scroll/pan map • Use [ + ] / [ − ] buttons or mouse wheel to zoom'}
                </span>
              </span>
              <span style={{ fontWeight: 650, color: '#1e40af', background: '#eff6ff', padding: '2px 8px', borderRadius: 6 }}>
                {language === 'mr'
                  ? `झूम: ${mapZoom}x (${mapZoom >= 16 ? 'तपशीलवार/रस्ता' : mapZoom >= 14 ? 'गाव/शहर' : mapZoom >= 12 ? 'तालुका' : 'जिल्हा स्तर'})`
                  : `Zoom: ${mapZoom}x (${mapZoom >= 16 ? 'Street Level' : mapZoom >= 14 ? 'Village' : mapZoom >= 12 ? 'Taluka' : 'District Level'})`}
              </span>
            </div>
          </div>
        </div>
      );
    })()}

    <hr style={{ border: 0, borderTop: '1px solid #e8edf3', margin: '20px 0', width: '100%' }} />
    <div style={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      <div style={{ fontSize: 13, fontWeight: 750, marginBottom: 12 }}>PROJECT PERIOD</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: 12, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
        <label style={style.label}>Start Date<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} style={{ ...style.input, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} /></label>
        <label style={style.label}>End Date<input type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={{ ...style.input, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }} /></label>
      </div>
    </div>

    {error && <div role="alert" style={{ marginTop: 8, marginBottom: 14, padding: 12, background: '#fff2f0', color: '#b42318', border: '1px solid #fecdca', borderRadius: 8, width: '100%', boxSizing: 'border-box' }}>{error}</div>}
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 12, flexWrap: 'wrap', width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
      <button type="button" onClick={() => { setForm({ name: '', description: '', start_date: '', end_date: '' }); resetScope(''); }} style={{ ...style.button, background: '#eef2f8', color: '#334155' }}>Clear</button>
      <button type="submit" disabled={submitting || !scope || !isFormReady} style={{ ...style.button, opacity: submitting || !scope || !isFormReady ? .55 : 1, cursor: submitting || !scope || !isFormReady ? 'not-allowed' : 'pointer' }}>{submitting ? 'Creating…' : 'Create Project'}</button>
    </div>

    {/* ============================================================== */}
    {/* FLOATING QUICK MAP BUTTON (Always Accessible in Every Session) */}
    {/* ============================================================== */}
    <div className="project-floating-map-btn">
      <button
        type="button"
        onClick={() => {
          const currentTarget = (
            selectedTalukas.length > 0
              ? { type: 'TALUKA', name_en: selectedTalukas[selectedTalukas.length - 1].name_en || selectedTalukas[selectedTalukas.length - 1].taluka_name, name_mr: selectedTalukas[selectedTalukas.length - 1].name_mr, district_name: activeDistrictName }
              : selectedDistricts.length > 0
                ? { type: 'DISTRICT', name_en: selectedDistricts[0].name_en || selectedDistricts[0].name, name_mr: selectedDistricts[0].name_mr }
                : filterDistrict
                  ? { type: 'DISTRICT', name_en: filterDistrict.name_en || filterDistrict.name, name_mr: filterDistrict.name_mr }
                  : target
                    ? { type: scope, name_en: target.name_en || target.name, name_mr: target.name_mr }
                    : { type: 'DISTRICT', name_en: 'Sangli', name_mr: 'सांगली' }
          );
          handleOpenMap(currentTarget, true);
        }}
        title={language === 'mr' ? 'नकाशा पहा (सांगली / निवडलेले क्षेत्र)' : 'Watch Map (Sangli / Selected Region)'}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
          color: '#ffffff',
          border: '2px solid rgba(255,255,255,0.9)',
          borderRadius: 999,
          padding: '10px 16px',
          fontSize: 13,
          fontWeight: 750,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37,99,235,0.4)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          backdropFilter: 'blur(8px)'
        }}
      >
        <span style={{ fontSize: 18 }}>🗺️</span>
        <span>{language === 'mr' ? 'नकाशा पहा' : 'Watch Map'}</span>
        <span style={{
          fontSize: 11,
          padding: '2px 7px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.25)',
          color: '#ffffff',
          fontWeight: 700,
          maxWidth: 95,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {activeDistrictName || (language === 'mr' ? 'सांगली' : 'Sangli')}
        </span>
      </button>
    </div>

    {/* ============================================================== */}
    {/* FULLSCREEN GEOGRAPHIC MAP MODAL                                */}
    {/* ============================================================== */}
    {showMapModal && (() => {
      const currentTarget = activeMapTarget || (
        selectedTalukas.length > 0
          ? { type: 'TALUKA', name_en: selectedTalukas[selectedTalukas.length - 1].name_en || selectedTalukas[selectedTalukas.length - 1].taluka_name, name_mr: selectedTalukas[selectedTalukas.length - 1].name_mr, district_name: activeDistrictName }
          : selectedDistricts.length > 0
            ? { type: 'DISTRICT', name_en: selectedDistricts[0].name_en || selectedDistricts[0].name, name_mr: selectedDistricts[0].name_mr }
            : filterDistrict
              ? { type: 'DISTRICT', name_en: filterDistrict.name_en || filterDistrict.name, name_mr: filterDistrict.name_mr }
              : target
                ? { type: scope, name_en: target.name_en || target.name, name_mr: target.name_mr }
                : { type: 'DISTRICT', name_en: 'Sangli', name_mr: 'सांगली' }
      );
      const query = getMapQuery(currentTarget);
      const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=${mapMode === 'satellite' ? 'k' : ''}&z=${mapZoom}&ie=UTF8&iwloc=&output=embed`;
      const googleMapsExternalUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

      return (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.78)',
            backdropFilter: 'blur(5px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'min(14px, 2.5vw)',
            boxSizing: 'border-box'
          }}
          onClick={() => setShowMapModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 14,
              width: '100%',
              maxWidth: 'min(1040px, 96vw)',
              height: 'min(720px, 94vh)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
              boxSizing: 'border-box'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              gap: 10,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🗺️</span>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 'clamp(14px, 3.5vw, 16px)', fontWeight: 800, color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentTarget.name_mr || currentTarget.name_en} {language === 'mr' ? 'भौगोलिक नकाशा' : 'Geographic Map'}
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: 11.5, color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {query}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {/* Modal Zoom Toolbar */}
                <div style={{ display: 'inline-flex', alignItems: 'center', background: '#334155', borderRadius: 8, padding: '2px 4px', gap: 4 }}>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम कमी करा (-)' : 'Zoom Out (-)'}
                    onClick={handleZoomOut}
                    disabled={mapZoom <= 6}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom <= 6 ? '#64748b' : '#ffffff',
                      fontSize: 16,
                      fontWeight: 800,
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    −
                  </button>
                  <span style={{ fontSize: 12, fontWeight: 750, color: '#38bdf8', minWidth: 32, textAlign: 'center' }}>
                    {mapZoom}x
                  </span>
                  <button
                    type="button"
                    title={language === 'mr' ? 'झूम वाढवा (+)' : 'Zoom In (+)'}
                    onClick={handleZoomIn}
                    disabled={mapZoom >= 19}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: mapZoom >= 19 ? '#64748b' : '#ffffff',
                      fontSize: 16,
                      fontWeight: 800,
                      width: 28,
                      height: 28,
                      borderRadius: 4,
                      cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    +
                  </button>
                </div>

                {/* Mode Switcher */}
                <div style={{ display: 'inline-flex', background: '#334155', borderRadius: 8, padding: 2 }}>
                  <button
                    type="button"
                    onClick={() => setMapMode('roadmap')}
                    style={{
                      border: 0,
                      background: mapMode === 'roadmap' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 10px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'रस्ता' : 'Map'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapMode('satellite')}
                    style={{
                      border: 0,
                      background: mapMode === 'satellite' ? '#2563eb' : 'transparent',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 650,
                      padding: '5px 10px',
                      borderRadius: 6,
                      cursor: 'pointer'
                    }}
                  >
                    {language === 'mr' ? 'उपग्रह' : 'Satellite'}
                  </button>
                </div>

                <a
                  href={googleMapsExternalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    border: '1px solid #475569',
                    background: '#1e293b',
                    color: '#38bdf8',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 650,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  Google Maps ↗
                </a>

                <button
                  type="button"
                  onClick={() => setShowMapModal(false)}
                  style={{
                    border: 0,
                    background: 'rgba(255,255,255,0.1)',
                    color: '#ffffff',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Zoom Presets Sub-bar */}
            <div style={{
              padding: '6px 14px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, overflowX: 'auto' }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                  {language === 'mr' ? 'त्वरित झूम निवडा:' : 'Quick Zoom:'}
                </span>
                {[
                  { lvl: 10, labelMr: 'जिल्हा स्तर', labelEn: 'District', icon: '🏛️' },
                  { lvl: 13, labelMr: 'तालुका स्तर', labelEn: 'Taluka', icon: '📍' },
                  { lvl: 15, labelMr: 'गाव/शहर', labelEn: 'Village', icon: '🏡' },
                  { lvl: 17, labelMr: 'रस्ता/बूथ स्तर', labelEn: 'Street/Booth', icon: '🎯' },
                ].map((p) => (
                  <button
                    key={p.lvl}
                    type="button"
                    onClick={() => setMapZoom(p.lvl)}
                    style={{
                      border: mapZoom === p.lvl ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
                      background: mapZoom === p.lvl ? '#dbeafe' : '#ffffff',
                      color: mapZoom === p.lvl ? '#1d4ed8' : '#475569',
                      borderRadius: 14,
                      padding: '3px 9px',
                      fontSize: 11,
                      fontWeight: mapZoom === p.lvl ? 750 : 600,
                      cursor: 'pointer'
                    }}
                  >
                    {p.icon} {language === 'mr' ? p.labelMr : p.labelEn} ({p.lvl}x)
                  </button>
                ))}
              </div>

              <span style={{ fontSize: 11.5, color: '#64748b' }}>
                {language === 'mr' ? `सध्याचे क्षेत्र: ${currentTarget.name_mr || currentTarget.name_en}` : `Current target: ${currentTarget.name_en}`}
              </span>
            </div>

            {/* Map Iframe with onWheel zoom and floating on-map controls */}
            <div
              onWheel={handleWheelZoom}
              style={{ flex: 1, position: 'relative', width: '100%', background: '#e2e8f0', overflow: 'hidden' }}
            >
              {/* Floating on-map zoom widget */}
              <div
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  zIndex: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(15, 23, 42, 0.88)',
                  backdropFilter: 'blur(6px)',
                  borderRadius: 10,
                  padding: '6px 5px',
                  boxShadow: '0 6px 18px rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}
              >
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम इन करा (+)' : 'Zoom In (+)'}
                  onClick={handleZoomIn}
                  disabled={mapZoom >= 19}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: 0,
                    background: mapZoom >= 19 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: mapZoom >= 19 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  +
                </button>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', padding: '2px 0', userSelect: 'none' }}>
                  {mapZoom}x
                </div>
                <button
                  type="button"
                  title={language === 'mr' ? 'झूम आउट करा (-)' : 'Zoom Out (-)'}
                  onClick={handleZoomOut}
                  disabled={mapZoom <= 6}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    border: 0,
                    background: mapZoom <= 6 ? '#334155' : '#2563eb',
                    color: '#ffffff',
                    fontSize: 18,
                    fontWeight: 800,
                    cursor: mapZoom <= 6 ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  −
                </button>
                <div style={{ width: '80%', height: 1, background: 'rgba(255,255,255,0.15)', margin: '2px 0' }} />
                <button
                  type="button"
                  title={language === 'mr' ? 'मूळ झूम रीसेट करा' : 'Reset Default Zoom'}
                  onClick={() => setMapZoom(getTargetDefaultZoom(currentTarget))}
                  style={{
                    width: 30,
                    height: 24,
                    borderRadius: 5,
                    border: 0,
                    background: 'rgba(255,255,255,0.12)',
                    color: '#94a3b8',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  ⟲
                </button>
              </div>

              <InteractiveGeographicMap
                target={currentTarget}
                zoom={mapZoom}
                onZoomChange={(newZoom) => setMapZoom(newZoom)}
                mapMode={mapMode}
                language={language}
                height="100%"
              />
            </div>

            {/* Scroll / Pan & Zoom Helper Bar */}
            <div style={{
              padding: '8px 16px',
              background: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 12,
              color: '#64748b'
            }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span>👆</span>
                <span>
                  {language === 'mr'
                    ? 'नकाशा हलवण्यासाठी ड्रॅग (Scroll/Pan) करा • झूमसाठी [ + ] / [ − ] किंवा Mouse Wheel वापरा'
                    : 'Click & drag to scroll/pan map • Use [ + ] / [ − ] buttons or mouse wheel to zoom'}
                </span>
              </span>
              <span style={{ fontWeight: 650, color: '#1e40af', background: '#eff6ff', padding: '3px 10px', borderRadius: 6 }}>
                {language === 'mr'
                  ? `सध्याचा झूम स्तर: ${mapZoom}x (${mapZoom >= 16 ? 'तपशीलवार/रस्ता स्तर' : mapZoom >= 14 ? 'गाव/शहर स्तर' : mapZoom >= 12 ? 'तालुका स्तर' : 'जिल्हा स्तर'})`
                  : `Current Zoom: ${mapZoom}x (${mapZoom >= 16 ? 'Street Level' : mapZoom >= 14 ? 'Village Level' : mapZoom >= 12 ? 'Taluka Level' : 'District Level'})`}
              </span>
            </div>
          </div>
        </div>
      );
    })()}
  </form>, language);
}

export default ProjectCreateForm;
