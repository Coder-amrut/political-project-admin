import React, { useEffect, useState } from 'react';
import apiClient from '../../api/axios';
import { translateTree } from '../../i18n/adminTranslations';

const scopes = [
  { value: 'DISTRICT', title: 'District', description: 'Target an administrative district', icon: '▤' },
  { value: 'LOK_SABHA', title: 'Lok Sabha', description: 'Target a parliamentary constituency', icon: '⌂' },
  { value: 'ASSEMBLY', title: 'Assembly', description: 'Target an assembly constituency', icon: '⌖' },
  { value: 'POLLING_STATION', title: 'Polling Station', description: 'Target a polling part or booth', icon: '▦' },
  { value: 'GRADUATE_CONSTITUENCY', title: 'Graduate Constituency Election', description: 'Target a graduate council constituency', icon: '🎓' },
  { value: 'TEACHER_CONSTITUENCY', title: 'Teacher Constituency Election', description: 'Target a teacher council constituency', icon: '📚' },
];

const style = {
  card: { background: '#fff', border: '1px solid #e3e8ef', borderRadius: 12, padding: 22 },
  label: { display: 'block', marginBottom: 15, color: '#334155', fontWeight: 650, fontSize: 13 },
  input: { display: 'block', boxSizing: 'border-box', width: '100%', marginTop: 6, padding: '11px 12px', border: '1px solid #cfd8e3', borderRadius: 8, font: 'inherit', color: '#142033' },
  muted: { color: '#64748b', fontSize: 13 },
  button: { border: 0, borderRadius: 8, padding: '11px 17px', background: '#2457d6', color: '#fff', cursor: 'pointer', fontWeight: 700 },
};

function SearchPicker({ label, endpoint, value, onSelect, onClear, disabled = false, placeholder, noResultsText = 'No matching records found.', language = 'en' }) {
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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', border: '1px solid #8da9e8', borderRadius: 9, background: '#f7f9ff' }}>
        <div>
          <div style={{ fontWeight: 700, color: '#17253c', fontSize: 14 }}>{itemTitle(value)}</div>
          {value.part_no && <div style={style.muted}>{value.name_en}{value.election_year ? ` · Election ${value.election_year}` : ''}</div>}
          {value.name_mr && <div lang="mr" style={{ color: '#516074', marginTop: 3, fontSize: 13 }}>{value.name_mr}</div>}
        </div>
        <button type="button" onClick={() => { onClear?.(); setSearch(''); }} aria-label={`Clear ${label}`} style={{ border: '1px solid #cbd5e1', background: '#fff', borderRadius: 6, padding: '6px 12px', color: '#334155', fontSize: 13, cursor: 'pointer', fontWeight: 650 }}>Change</button>
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

function MultiSearchPicker({ label, endpoint, params = {}, value = [], onChange, disabled = false, placeholder, noResultsText = 'No matching records found.', language = 'en' }) {
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
      {value.map((item) => <span key={item.code} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 10px', borderRadius: 20, background: '#eaf0ff', color: '#24469a', fontSize: 13, fontWeight: 600 }}>
        {item.part_no ? `Part No. ${item.part_no}` : item.name_en}
        {item.type_label ? <span style={{ fontSize: 11, opacity: 0.8, fontWeight: 500 }}>({item.type_label})</span> : null}
        <button type="button" onClick={() => onChange(value.filter((selected) => selected.code !== item.code))} aria-label={`Remove ${item.name_en}`} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'inherit', fontSize: 16, lineHeight: 1 }}>×</button>
      </span>)}
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
          results.map((item) => {
            const selected = value.some((existing) => existing.code === item.code);
            return (
              <button
                key={item.code}
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
  };

  const selectRootTarget = (item) => {
    setTarget(item);
    setSelectedDistricts([]);
    setDistrictOptions([]);
    setSelectedAssemblies([]);
    setSelectedTalukas([]);
    setSelectedVillages([]);
    setSelectedStations([]);
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

  return translateTree(<form onSubmit={submit} style={style.card}>
    <div style={{ marginBottom: 22 }}><h2 style={{ margin: '0 0 5px', fontSize: 19 }}>Create New Project</h2><p style={{ ...style.muted, margin: 0 }}>Choose the geographic level this project targets.</p></div>
    <div style={{ maxWidth: 760 }}>
      <label style={style.label}>Project Name *<input required maxLength={200} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={style.input} /></label>
      <label style={style.label}>Description<textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...style.input, resize: 'vertical' }} /></label>
    </div>

    <section aria-labelledby="scope-heading" style={{ marginTop: 25 }}>
      <div id="scope-heading" style={{ fontSize: 14, fontWeight: 750, marginBottom: 11 }}>PROJECT GEOGRAPHY <span style={{ color: '#d92d20' }}>*</span></div>
      <p style={{ ...style.muted, marginTop: 0 }}>What area does this project cover?</p>
      <style>{`
        .project-geo-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 11px;
          max-width: 780px;
        }
        .project-geo-wide {
          grid-column: span 2;
        }
        @media (max-width: 720px) {
          .project-geo-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 480px) {
          .project-geo-grid {
            grid-template-columns: 1fr;
          }
          .project-geo-wide {
            grid-column: span 1;
          }
        }
      `}</style>
      <div role="radiogroup" aria-label="Geographic scope" className="project-geo-grid">
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
              className={isWide ? 'project-geo-wide' : ''}
              style={{
                textAlign: 'left',
                padding: '14px 15px',
                minHeight: 88,
                border: isSelected ? '2px solid #315fce' : '1px solid #d7deea',
                borderRadius: 10,
                background: isSelected ? '#f3f6ff' : '#fff',
                cursor: 'pointer',
                color: '#17253c',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: isSelected ? '0 1px 4px rgba(49, 95, 206, 0.12)' : '0 1px 2px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ display: 'flex', gap: 9, alignItems: 'center', fontWeight: 750 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 18,
                    height: 18,
                    flexShrink: 0,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: '50%',
                    border: isSelected ? '5px solid #315fce' : '1.5px solid #94a3b8',
                    fontSize: 0,
                  }}
                >
                  {option.icon}
                </span>
                <span style={{ fontSize: isWide ? 13.5 : 13, lineHeight: 1.3 }}>
                  {option.title}
                </span>
              </span>
              <span
                style={{
                  display: 'block',
                  marginTop: 6,
                  paddingLeft: 27,
                  color: '#64748b',
                  fontSize: 12,
                  lineHeight: 1.35,
                }}
              >
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
          <SearchPicker language={language} label="District *" endpoint="/admin/project-geography/districts" value={filterDistrict} onSelect={(item) => { setFilterDistrict(item); setFilterAssembly(null); setSelectedStations([]); setSelectedTalukas([]); setSelectedVillages([]); }} onClear={() => { setFilterDistrict(null); setFilterAssembly(null); setSelectedStations([]); setSelectedTalukas([]); setSelectedVillages([]); }} placeholder="Search district..." />
          <SearchPicker language={language} label="Assembly Constituency *" endpoint="/admin/project-geography/assemblies" value={filterAssembly} onSelect={(item) => { setFilterAssembly(item); setSelectedStations([]); }} onClear={() => { setFilterAssembly(null); setSelectedStations([]); }} placeholder="Search assembly..." />
        </>
      ) : scope === 'DISTRICT' ? (
        <MultiSearchPicker
          language={language}
          label="Districts * (select one or multiple)"
          endpoint="/admin/project-geography/districts"
          value={selectedDistricts}
          onChange={(items) => {
            setSelectedDistricts(items);
            setSelectedTalukas([]);
            setSelectedVillages([]);
            setSelectedStations([]);
          }}
          placeholder="Search and select one or more districts in English or Marathi..."
        />
      ) : (
        <SearchPicker
          language={language}
          key={scope}
          label={`Select ${scopes.find((item) => item.value === scope)?.title} *`}
          endpoint={targetEndpoint}
          value={target}
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
            label="Taluka (select multiple)"
            endpoint={talukaEndpoint}
            params={talukaParams}
            value={selectedTalukas}
            onChange={(items) => {
              setSelectedTalukas(items);
              setSelectedVillages([]);
              setSelectedStations([]);
            }}
            placeholder="Select Taluka"
          />
          <MultiSearchPicker
            language={language}
            label="Village (select multiple)"
            endpoint="/master-data/villages"
            params={villageParams}
            value={selectedVillages}
            onChange={(items) => {
              setSelectedVillages(items);
              setSelectedStations([]);
            }}
            disabled={!selectedTalukas.length}
            placeholder="Search Village"
          />
          <MultiSearchPicker
            language={language}
            label="Polling Station / Local Body (select multiple)"
            endpoint="/admin/project-geography/polling-stations"
            params={stationParams}
            value={selectedStations}
            onChange={setSelectedStations}
            placeholder="Search Polling Station or Local Body"
            noResultsText="No local body or polling station records match these selected filters."
          />
        </>
      )}

      {scope === 'POLLING_STATION' && filterDistrict && (
        <>
          <MultiSearchPicker
            language={language}
            label="Taluka (optional, multiple)"
            endpoint={talukaEndpoint}
            params={talukaParams}
            value={selectedTalukas}
            onChange={(items) => {
              setSelectedTalukas(items);
              setSelectedVillages([]);
              setSelectedStations([]);
            }}
            placeholder="Select Taluka"
          />
          <MultiSearchPicker
            language={language}
            label="Village (optional, multiple)"
            endpoint="/master-data/villages"
            params={villageParams}
            value={selectedVillages}
            onChange={(items) => {
              setSelectedVillages(items);
              setSelectedStations([]);
            }}
            disabled={!selectedTalukas.length}
            placeholder="Search Village"
          />
          <MultiSearchPicker
            language={language}
            label="Polling Station / Local Body * (select multiple)"
            endpoint="/admin/project-geography/polling-stations"
            params={stationParams}
            value={selectedStations}
            onChange={setSelectedStations}
            disabled={!filterAssembly}
            placeholder="Search Polling Station or Local Body"
            noResultsText="No local body or polling station records match these selected filters."
          />
        </>
      )}
    </div>}
    {!scope && <p style={{ ...style.muted, marginTop: 19 }}>Select a geographic scope to continue.</p>}

    <hr style={{ border: 0, borderTop: '1px solid #e8edf3', margin: '23px 0' }} />
    <div style={{ maxWidth: 780 }}>
      <div style={{ fontSize: 13, fontWeight: 750, marginBottom: 13 }}>PROJECT PERIOD</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 16 }}>
        <label style={style.label}>Start Date<input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} style={style.input} /></label>
        <label style={style.label}>End Date<input type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} style={style.input} /></label>
      </div>
    </div>

    {error && <div role="alert" style={{ marginTop: 5, marginBottom: 14, padding: 12, background: '#fff2f0', color: '#b42318', border: '1px solid #fecdca', borderRadius: 8 }}>{error}</div>}
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
      <button type="button" onClick={() => { setForm({ name: '', description: '', start_date: '', end_date: '' }); resetScope(''); }} style={{ ...style.button, background: '#eef2f8', color: '#334155' }}>Clear</button>
      <button type="submit" disabled={submitting || !scope || !isFormReady} style={{ ...style.button, opacity: submitting || !scope || !isFormReady ? .55 : 1, cursor: submitting || !scope || !isFormReady ? 'not-allowed' : 'pointer' }}>{submitting ? 'Creating…' : 'Create Project'}</button>
    </div>
  </form>, language);
}

export default ProjectCreateForm;
