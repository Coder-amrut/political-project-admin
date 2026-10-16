import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/axios';

const I18N = {
  en: {
    title: 'Project Geography Hierarchy Manager',
    subtitle: 'Assign administrative and electoral geographic boundaries to projects using official Master Data hierarchy.',
    selectProject: 'Select Project *',
    noProjects: 'No active projects available',
    tabBrowseMaster: '📍 Add Geography from State / District / Taluka Master',
    tabProjectNodes: '📋 Current Project Geography Nodes',
    tabCustomNode: '➕ Add Custom Geography Node',
    stateLabel: 'State *',
    districtLabel: 'District *',
    talukaLabel: 'Taluka / Block',
    allTalukas: 'All Talukas in District',
    selectDistrictFirst: 'Select District first',
    viewCategory: 'Category to Add / View:',
    catDistricts: '📍 Districts',
    catTalukas: '🏢 Talukas',
    catVillages: '🌾 Villages',
    catLocalBodies: '🏛️ Local Bodies (Gram Panchayats)',
    searchPlaceholder: 'Search by name or code...',
    addToProjectBtn: '+ Add to Project',
    alreadyAddedBadge: '✓ Added in Project',
    bulkAddBtn: '+ Add All Filtered to Project',
    filterByType: 'Filter by Type:',
    allTypes: 'All Geography Types',
    colCode: 'Code',
    colName: 'Name',
    colType: 'Type',
    colParent: 'Parent Node',
    colStatus: 'Status',
    colAction: 'Actions',
    renameBtn: 'Rename',
    toggleStatusBtn: 'Toggle Status',
    loading: 'Loading geography data…',
    noNodes: 'No geography nodes have been assigned to this project yet.',
    noMasterRecords: 'No records found matching the selected filters.',
    customNodeHeading: 'Add Custom Geography Node to Project',
    customType: 'Geography Type *',
    customParent: 'Parent Node (Optional)',
    customName: 'Node Name *',
    customCode: 'Node Code (Optional)',
    submitCustomBtn: 'Add Geography Node',
  },
  mr: {
    title: 'प्रकल्पाचे भूगोल आणि क्षेत्र व्यवस्थापन',
    subtitle: 'मास्टर डेटाचा वापर करून प्रकल्पासाठी राज्य, जिल्हा, तालुका, गावे आणि स्थानिक संस्थांची रचना तयार करा.',
    selectProject: 'प्रकल्प निवडा *',
    noProjects: 'सक्रिय प्रकल्प उपलब्ध नाहीत',
    tabBrowseMaster: '📍 राज्य / जिल्हा / तालुका मास्टरमधून जोडा',
    tabProjectNodes: '📋 प्रकल्पातील सध्याच्या भौगोलिक नोंदी',
    tabCustomNode: '➕ नवीन सानुकूल घटक जोडा',
    stateLabel: 'राज्य *',
    districtLabel: 'जिल्हा *',
    talukaLabel: 'तालुका',
    allTalukas: 'जिल्ह्यातील सर्व तालुके',
    selectDistrictFirst: 'प्रथम जिल्हा निवडा',
    viewCategory: 'प्रकार निवडा / पहा:',
    catDistricts: '📍 जिल्हे',
    catTalukas: '🏢 तालुके',
    catVillages: '🌾 गावे (Villages)',
    catLocalBodies: '🏛️ स्थानिक संस्था / ग्रामपंचायती',
    searchPlaceholder: 'नाव किंवा कोडनुसार शोधा...',
    addToProjectBtn: '+ प्रकल्पात जोडा',
    alreadyAddedBadge: '✓ प्रकल्पात जोडले आहे',
    bulkAddBtn: '+ सर्व दिसणारे घटक प्रकल्पात जोडा',
    filterByType: 'प्रकारानुसार फिल्टर:',
    allTypes: 'सर्व प्रकार',
    colCode: 'कोड',
    colName: 'नाव',
    colType: 'प्रकार',
    colParent: 'मूळ घटक (Parent)',
    colStatus: 'स्थिती',
    colAction: 'कृती',
    renameBtn: 'नाव बदला',
    toggleStatusBtn: 'स्थिती बदला',
    loading: 'भौगोलिक डेटा लोड होत आहे…',
    noNodes: 'या प्रकल्पासाठी अद्याप कोणतेही भौगोलिक घटक जोडलेले नाहीत.',
    noMasterRecords: 'निवडलेल्या फिल्टरनुसार नोंदी आढळल्या नाहीत.',
    customNodeHeading: 'प्रकल्पात नवीन घटक जोडा',
    customType: 'घटक प्रकार *',
    customParent: 'मूळ घटक (पर्यायी)',
    customName: 'घटकाचे नाव *',
    customCode: 'कोड (पर्यायी)',
    submitCustomBtn: 'घटक जोडा',
  },
};

// Geography type mapping to backend IDs:
// 1: STATE, 2: DISTRICT, 3: CONSTITUENCY, 4: ASSEMBLY, 5: TALUKA, 6: VILLAGE, 7: WARD, 8: BOOTH, 9: AREA
const TYPE_ID_MAP = {
  STATE: 1,
  DISTRICT: 2,
  CONSTITUENCY: 3,
  ASSEMBLY: 4,
  TALUKA: 5,
  VILLAGE: 6,
  WARD: 7,
  BOOTH: 8,
  AREA: 9,
};

function ProjectGeographyManager({ projects = [], language = 'en', onRefreshProjects }) {
  const t = I18N[language] || I18N.en;

  // Selected Project
  const [selectedProjectUuid, setSelectedProjectUuid] = useState(projects[0]?.uuid || '');

  // Sub-tabs: 'browse_master', 'project_nodes', 'custom_node'
  const [subTab, setSubTab] = useState('browse_master');

  // Master Data Cascader State
  const [states, setStates] = useState([]);
  const [selectedStateCode, setSelectedStateCode] = useState('27');

  const [districts, setDistricts] = useState([]);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState('494'); // Default Sangli (494)

  const [talukas, setTalukas] = useState([]);
  const [selectedTalukaCode, setSelectedTalukaCode] = useState('');

  // Active Category: 'talukas' | 'villages' | 'local_bodies' | 'districts'
  const [activeCategory, setActiveCategory] = useState('talukas');

  // Loaded Master Data items
  const [masterItems, setMasterItems] = useState([]);
  const [masterLoading, setMasterLoading] = useState(false);
  const [masterSearch, setMasterSearch] = useState('');

  // Existing Project Geography Nodes
  const [projectNodes, setProjectNodes] = useState([]);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [nodeSearch, setNodeSearch] = useState('');

  // Available Geography Types
  const [types, setTypes] = useState([]);

  // Custom Node Form
  const [customForm, setCustomForm] = useState({
    geography_type_id: '6', // Default Village
    parent_uuid: '',
    name: '',
    code: '',
  });

  // Feedback notifications
  const [toastMessage, setToastMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // Sync selected project if projects change
  useEffect(() => {
    if (!selectedProjectUuid && projects.length > 0) {
      setSelectedProjectUuid(projects[0].uuid);
    }
  }, [projects, selectedProjectUuid]);

  // Load geography types
  useEffect(() => {
    apiClient.get('/admin/geography-types')
      .then(({ data }) => setTypes(data.data || data.geography_types || []))
      .catch(() => {});
  }, []);

  // 1. Load States & Districts on mount
  useEffect(() => {
    apiClient.get('/master-data/states')
      .then(({ data }) => setStates(data.data || []))
      .catch(() => {});

    apiClient.get('/master-data/districts')
      .then(({ data }) => {
        const list = data.data || [];
        setDistricts(list);
        if (!selectedDistrictCode && list.length > 0) {
          const sangli = list.find((d) => String(d.district_code) === '494');
          setSelectedDistrictCode(sangli ? '494' : String(list[0].district_code));
        }
      })
      .catch(() => {});
  }, []);

  // 2. Load Talukas when District is selected
  useEffect(() => {
    if (!selectedDistrictCode) {
      setTalukas([]);
      setSelectedTalukaCode('');
      return;
    }
    apiClient.get('/master-data/talukas', { params: { district_code: selectedDistrictCode } })
      .then(({ data }) => {
        setTalukas(data.data || []);
        setSelectedTalukaCode('');
      })
      .catch(() => {});
  }, [selectedDistrictCode]);

  // 3. Load Master Data items for the selected State/District/Taluka
  const fetchMasterItems = async () => {
    setMasterLoading(true);
    setError('');
    try {
      if (activeCategory === 'districts') {
        const { data } = await apiClient.get('/master-data/districts');
        setMasterItems(data.data || []);
      } else if (activeCategory === 'talukas') {
        if (!selectedDistrictCode) {
          setMasterItems([]);
          setMasterLoading(false);
          return;
        }
        const { data } = await apiClient.get('/master-data/talukas', { params: { district_code: selectedDistrictCode } });
        setMasterItems(data.data || []);
      } else if (activeCategory === 'villages') {
        if (!selectedDistrictCode) {
          setMasterItems([]);
          setMasterLoading(false);
          return;
        }
        const params = { district_code: selectedDistrictCode };
        if (selectedTalukaCode) params.taluka_code = selectedTalukaCode;
        const { data } = await apiClient.get('/master-data/villages', { params });
        setMasterItems(data.data || []);
      } else if (activeCategory === 'local_bodies') {
        if (!selectedDistrictCode) {
          setMasterItems([]);
          setMasterLoading(false);
          return;
        }
        const params = { district_code: selectedDistrictCode };
        if (selectedTalukaCode) params.taluka_code = selectedTalukaCode;
        const { data } = await apiClient.get('/master-data/local-bodies', { params });
        setMasterItems(data.data || []);
      }
    } catch (err) {
      setError(err.message || 'Could not load master reference records.');
      setMasterItems([]);
    } finally {
      setMasterLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterItems();
  }, [activeCategory, selectedDistrictCode, selectedTalukaCode]);

  // 4. Load Existing Project Geography Nodes
  const loadProjectNodes = async () => {
    if (!selectedProjectUuid) {
      setProjectNodes([]);
      return;
    }
    setNodesLoading(true);
    try {
      const { data } = await apiClient.get(`/admin/projects/${selectedProjectUuid}/geographies?per_page=500`);
      setProjectNodes(data.data || []);
    } catch (err) {
      setError(err.message || 'Could not load project geography nodes.');
      setProjectNodes([]);
    } finally {
      setNodesLoading(false);
    }
  };

  useEffect(() => {
    loadProjectNodes();
  }, [selectedProjectUuid]);

  // Selected project details
  const currentProject = useMemo(() => {
    return projects.find((p) => p.uuid === selectedProjectUuid);
  }, [projects, selectedProjectUuid]);

  // Set of node codes already added in this project
  const addedCodesSet = useMemo(() => {
    const s = new Set();
    projectNodes.forEach((n) => {
      if (n.code) s.add(String(n.code));
      if (n.name) s.add(n.name.toLowerCase().trim());
    });
    return s;
  }, [projectNodes]);

  // 5. Add an item from Master Data into Project Geography
  const handleAddMasterItemToProject = async (item) => {
    if (!selectedProjectUuid) return alert('Please select a project first.');
    if (currentProject?.status === 'COMPLETED') {
      return alert('Cannot add geographies to a completed project.');
    }

    setBusy(true);
    try {
      let typeId = TYPE_ID_MAP.VILLAGE; // 6
      if (activeCategory === 'districts') typeId = TYPE_ID_MAP.DISTRICT;
      else if (activeCategory === 'talukas') typeId = TYPE_ID_MAP.TALUKA;
      else if (activeCategory === 'local_bodies') typeId = TYPE_ID_MAP.AREA; // 9

      const name = item.village_name || item.taluka_name || item.local_body_name || item.district_name || item.name_en || item.name;
      const code = String(item.village_code || item.taluka_code || item.local_body_code || item.district_code || item.code || '');

      await apiClient.post(`/admin/projects/${selectedProjectUuid}/geographies`, {
        geography_type_id: typeId,
        parent_uuid: null,
        name,
        code,
      });

      showToast(`Added "${name}" to Project Geography ✓`);
      await loadProjectNodes();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to add geography node');
    } finally {
      setBusy(false);
    }
  };

  // 6. Bulk Add all filtered items to Project Geography
  const handleBulkAddFiltered = async () => {
    if (!selectedProjectUuid) return alert('Please select a project first.');
    const itemsToAdd = filteredMasterItems.filter((item) => {
      const code = String(item.village_code || item.taluka_code || item.local_body_code || item.district_code || item.code || '');
      const name = (item.village_name || item.taluka_name || item.local_body_name || item.district_name || item.name_en || '').toLowerCase().trim();
      return !addedCodesSet.has(code) && !addedCodesSet.has(name);
    });

    if (itemsToAdd.length === 0) return alert('All filtered items are already added to this project.');
    if (!window.confirm(`Add ${itemsToAdd.length} ${activeCategory} into "${currentProject?.name}" project?`)) return;

    setBusy(true);
    let count = 0;
    try {
      for (const item of itemsToAdd) {
        let typeId = TYPE_ID_MAP.VILLAGE;
        if (activeCategory === 'districts') typeId = TYPE_ID_MAP.DISTRICT;
        else if (activeCategory === 'talukas') typeId = TYPE_ID_MAP.TALUKA;
        else if (activeCategory === 'local_bodies') typeId = TYPE_ID_MAP.AREA;

        const name = item.village_name || item.taluka_name || item.local_body_name || item.district_name || item.name_en || item.name;
        const code = String(item.village_code || item.taluka_code || item.local_body_code || item.district_code || item.code || '');

        await apiClient.post(`/admin/projects/${selectedProjectUuid}/geographies`, {
          geography_type_id: typeId,
          parent_uuid: null,
          name,
          code,
        });
        count++;
      }
      showToast(`Added ${count} nodes to ${currentProject?.name} ✓`);
      await loadProjectNodes();
    } catch (err) {
      alert(`Added ${count} items before error: ` + (err.message || ''));
      await loadProjectNodes();
    } finally {
      setBusy(false);
    }
  };

  // 7. Add Custom Node
  const handleCreateCustomNode = async (e) => {
    e.preventDefault();
    if (!selectedProjectUuid) return alert('Please select a project.');
    if (!customForm.name.trim()) return alert('Node name is required.');

    setBusy(true);
    try {
      await apiClient.post(`/admin/projects/${selectedProjectUuid}/geographies`, {
        geography_type_id: Number(customForm.geography_type_id),
        parent_uuid: customForm.parent_uuid || null,
        name: customForm.name.trim(),
        code: customForm.code.trim() || null,
      });

      showToast(`Custom Node "${customForm.name}" Created ✓`);
      setCustomForm({
        geography_type_id: '6',
        parent_uuid: '',
        name: '',
        code: '',
      });
      setSubTab('project_nodes');
      await loadProjectNodes();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to create geography node.');
    } finally {
      setBusy(false);
    }
  };

  // 8. Rename Node
  const handleRenameNode = async (node) => {
    const newName = window.prompt('Enter new name for geography node:', node.name);
    if (!newName?.trim() || newName.trim() === node.name) return;

    try {
      await apiClient.patch(`/admin/projects/${selectedProjectUuid}/geographies/${node.uuid}`, {
        name: newName.trim(),
      });
      showToast(`Renamed to "${newName.trim()}" ✓`);
      await loadProjectNodes();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to rename geography.');
    }
  };

  // 9. Toggle Node Status (ACTIVE / INACTIVE)
  const handleToggleStatus = async (node) => {
    const targetStatus = node.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.patch(`/admin/projects/${selectedProjectUuid}/geographies/${node.uuid}/status`, {
        status: targetStatus,
      });
      showToast(`Node status changed to ${targetStatus} ✓`);
      await loadProjectNodes();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Failed to update status.');
    }
  };

  // Filtered Master Items based on Search
  const filteredMasterItems = useMemo(() => {
    if (!masterSearch.trim()) return masterItems;
    const term = masterSearch.toLowerCase().trim();
    return masterItems.filter((item) => {
      const name = (item.village_name || item.taluka_name || item.local_body_name || item.district_name || item.name_en || '').toLowerCase();
      const code = String(item.village_code || item.taluka_code || item.local_body_code || item.district_code || item.code || '').toLowerCase();
      return name.includes(term) || code.includes(term);
    });
  }, [masterItems, masterSearch]);

  // Filtered Project Nodes based on Type & Search
  const filteredProjectNodes = useMemo(() => {
    return projectNodes.filter((node) => {
      if (typeFilter !== 'all' && String(node.type?.name || node.type?.id) !== typeFilter) return false;
      if (nodeSearch.trim()) {
        const term = nodeSearch.toLowerCase().trim();
        const name = (node.name || '').toLowerCase();
        const code = String(node.code || '').toLowerCase();
        return name.includes(term) || code.includes(term);
      }
      return true;
    });
  }, [projectNodes, typeFilter, nodeSearch]);

  // Selected names for breadcrumbs
  const selectedDistrictName = useMemo(() => {
    const d = districts.find((x) => String(x.district_code) === String(selectedDistrictCode));
    return d ? (d.district_name || d.name_en) : '';
  }, [districts, selectedDistrictCode]);

  const selectedTalukaName = useMemo(() => {
    const t = talukas.find((x) => String(x.taluka_code) === String(selectedTalukaCode));
    return t ? t.taluka_name : '';
  }, [talukas, selectedTalukaCode]);

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
      marginBottom: 16,
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
    tabBtn: (isActive) => ({
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
      padding: '8px 14px',
      background: '#2563eb',
      color: '#fff',
      border: 0,
      borderRadius: 6,
      fontWeight: 650,
      fontSize: 12.5,
      cursor: 'pointer',
    },
    btnSuccess: {
      padding: '6px 12px',
      background: '#16a34a',
      color: '#fff',
      border: 0,
      borderRadius: 6,
      fontWeight: 650,
      fontSize: 12,
      cursor: 'pointer',
    },
    btnSecondary: {
      padding: '6px 12px',
      background: '#f8fafc',
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
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#0f172a', color: '#38bdf8', padding: '12px 20px', borderRadius: 8, fontSize: 13.5, fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 9999 }}>
          ⚡ {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 18 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
            {t.title}
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Project Selector Card */}
        <div style={{ minWidth: 260 }}>
          <label style={styles.label}>{t.selectProject}</label>
          <select
            value={selectedProjectUuid}
            onChange={(e) => setSelectedProjectUuid(e.target.value)}
            style={{ ...styles.select, fontWeight: 650, borderColor: '#3b82f6' }}
          >
            {projects.length === 0 ? (
              <option value="">{t.noProjects}</option>
            ) : (
              projects.map((p) => (
                <option key={p.uuid} value={p.uuid}>
                  {p.name} ({p.status})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        <button
          type="button"
          onClick={() => setSubTab('browse_master')}
          style={styles.tabBtn(subTab === 'browse_master')}
        >
          {t.tabBrowseMaster}
        </button>
        <button
          type="button"
          onClick={() => setSubTab('project_nodes')}
          style={styles.tabBtn(subTab === 'project_nodes')}
        >
          {t.tabProjectNodes} ({projectNodes.length})
        </button>
        <button
          type="button"
          onClick={() => setSubTab('custom_node')}
          style={styles.tabBtn(subTab === 'custom_node')}
        >
          {t.tabCustomNode}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 8, fontSize: 13, marginBottom: 14 }}>
          {error}
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. BROWSE MASTER DATA & ADD TO PROJECT                         */}
      {/* ============================================================== */}
      {subTab === 'browse_master' && (
        <div>
          {/* CASCADING FILTER BAR (State -> District -> Taluka) */}
          <div style={styles.filterBar}>
            {/* STATE */}
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
                      {s.state_name || 'Maharashtra'} ({s.state_code || '27'})
                    </option>
                  ))
                ) : (
                  <option value="27">Maharashtra (27)</option>
                )}
              </select>
            </div>

            {/* DISTRICT */}
            <div>
              <label style={styles.label}>{t.districtLabel}</label>
              <select
                value={selectedDistrictCode}
                onChange={(e) => setSelectedDistrictCode(e.target.value)}
                style={styles.select}
              >
                <option value="">-- Select District --</option>
                {districts.map((d) => (
                  <option key={d.district_code} value={d.district_code}>
                    {d.district_name || d.name_en} ({d.district_code})
                  </option>
                ))}
              </select>
            </div>

            {/* TALUKA */}
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

          {/* CATEGORY SWITCHER & SEARCH */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setActiveCategory('talukas')}
                style={styles.tabBtn(activeCategory === 'talukas')}
              >
                {t.catTalukas} ({talukas.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('villages')}
                style={styles.tabBtn(activeCategory === 'villages')}
              >
                {t.catVillages}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('local_bodies')}
                style={styles.tabBtn(activeCategory === 'local_bodies')}
              >
                {t.catLocalBodies}
              </button>
              <button
                type="button"
                onClick={() => setActiveCategory('districts')}
                style={styles.tabBtn(activeCategory === 'districts')}
              >
                {t.catDistricts} ({districts.length})
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                placeholder={t.searchPlaceholder}
                value={masterSearch}
                onChange={(e) => setMasterSearch(e.target.value)}
                style={{ ...styles.input, width: 230, padding: '7px 11px', fontSize: 13 }}
              />
              {filteredMasterItems.length > 0 && selectedProjectUuid && currentProject?.status !== 'COMPLETED' && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleBulkAddFiltered}
                  style={styles.btnSuccess}
                >
                  {t.bulkAddBtn}
                </button>
              )}
            </div>
          </div>

          {/* Active Breadcrumb info */}
          <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: 8, border: '1px solid #edf2f7', fontSize: 12.5, color: '#64748b', marginBottom: 10 }}>
            <span>Targeting Project: <b style={{ color: '#0f172a' }}>{currentProject?.name || '—'}</b></span>
            {selectedDistrictName && <span> · District: <b>{selectedDistrictName}</b></span>}
            {selectedTalukaName && <span> · Taluka: <b>{selectedTalukaName}</b></span>}
            <span style={{ marginLeft: 8 }}>({filteredMasterItems.length} records available)</span>
          </div>

          {/* MASTER DATA TABLE */}
          {masterLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              ⏳ {t.loading}
            </div>
          ) : filteredMasterItems.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#fafafa', borderRadius: 8, border: '1px dashed #cbd5e1', color: '#64748b', fontSize: 13 }}>
              {t.noMasterRecords}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: 60 }}>#</th>
                    <th style={styles.th}>{t.colCode}</th>
                    <th style={styles.th}>{t.colName}</th>
                    <th style={styles.th}>{t.colType}</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>{t.colAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMasterItems.slice(0, 100).map((item, idx) => {
                    const code = String(item.village_code || item.taluka_code || item.local_body_code || item.district_code || item.code || '');
                    const name = item.village_name || item.taluka_name || item.local_body_name || item.district_name || item.name_en || item.name;
                    const isAdded = addedCodesSet.has(code) || addedCodesSet.has(name.toLowerCase().trim());

                    return (
                      <tr key={item.id || code || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ ...styles.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>
                        <td style={styles.td}>
                          <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a', fontWeight: 600 }}>
                            {code || '—'}
                          </code>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 650, color: '#0f172a' }}>
                          {name}
                          {item.name_mr && <span style={{ display: 'block', fontSize: 12, color: '#64748b', fontWeight: 400 }}>{item.name_mr}</span>}
                        </td>
                        <td style={styles.td}>
                          <span style={styles.badge('#f1f5f9', '#475569')}>
                            {activeCategory.replace('_', ' ').toUpperCase()}
                          </span>
                        </td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          {isAdded ? (
                            <span style={styles.badge('#dcfce7', '#15803d')}>
                              {t.alreadyAddedBadge}
                            </span>
                          ) : (
                            <button
                              type="button"
                              disabled={busy || !selectedProjectUuid || currentProject?.status === 'COMPLETED'}
                              onClick={() => handleAddMasterItemToProject(item)}
                              style={styles.btnPrimary}
                            >
                              {t.addToProjectBtn}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredMasterItems.length > 100 && (
                <div style={{ padding: '8px 12px', background: '#f8fafc', fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                  Showing top 100 records. Use search to narrow down further.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CURRENT PROJECT GEOGRAPHY NODES TABLE                       */}
      {/* ============================================================== */}
      {subTab === 'project_nodes' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 650, color: '#334155' }}>{t.filterByType}</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ ...styles.select, width: 'auto', padding: '6px 12px' }}
              >
                <option value="all">{t.allTypes}</option>
                {types.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.display_name || type.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <input
                placeholder={t.searchPlaceholder}
                value={nodeSearch}
                onChange={(e) => setNodeSearch(e.target.value)}
                style={{ ...styles.input, width: 230, padding: '7px 11px', fontSize: 13 }}
              />
              <button
                type="button"
                onClick={loadProjectNodes}
                style={styles.btnSecondary}
              >
                ⟳ Refresh
              </button>
            </div>
          </div>

          {nodesLoading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b', fontSize: 14 }}>
              ⏳ {t.loading}
            </div>
          ) : filteredProjectNodes.length === 0 ? (
            <div style={{ padding: '36px 20px', textAlign: 'center', background: '#fafafa', borderRadius: 8, border: '1px dashed #cbd5e1', color: '#64748b', fontSize: 13 }}>
              {t.noNodes}
            </div>
          ) : (
            <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={{ ...styles.th, width: 60 }}>#</th>
                    <th style={styles.th}>{t.colName}</th>
                    <th style={styles.th}>{t.colCode}</th>
                    <th style={styles.th}>{t.colType}</th>
                    <th style={styles.th}>{t.colStatus}</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>{t.colAction}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjectNodes.map((node, idx) => (
                    <tr key={node.uuid || node.id || idx} style={{ background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ ...styles.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>
                      <td style={{ ...styles.td, fontWeight: 700, color: '#0f172a' }}>
                        {node.name}
                      </td>
                      <td style={styles.td}>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, color: '#0f172a' }}>
                          {node.code || '—'}
                        </code>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge('#eff6ff', '#1d4ed8')}>
                          {node.type?.display_name || node.type?.name || 'Node'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={styles.badge(node.status === 'ACTIVE' ? '#dcfce7' : '#fee2e2', node.status === 'ACTIVE' ? '#15803d' : '#991b1b')}>
                          {node.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => handleRenameNode(node)}
                            style={styles.btnSecondary}
                          >
                            {t.renameBtn}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(node)}
                            style={styles.btnSecondary}
                          >
                            {t.toggleStatusBtn}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. ADD CUSTOM GEOGRAPHY NODE FORM                              */}
      {/* ============================================================== */}
      {subTab === 'custom_node' && (
        <div style={{ maxWidth: 540 }}>
          <div style={{ fontWeight: 750, fontSize: 14.5, color: '#0f172a', marginBottom: 12 }}>
            {t.customNodeHeading}
          </div>

          <form onSubmit={handleCreateCustomNode} style={{ display: 'grid', gap: 14 }}>
            <div>
              <label style={styles.label}>{t.customType}</label>
              <select
                required
                value={customForm.geography_type_id}
                onChange={(e) => setCustomForm({ ...customForm, geography_type_id: e.target.value })}
                style={styles.select}
              >
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_name || type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>{t.customParent}</label>
              <select
                value={customForm.parent_uuid}
                onChange={(e) => setCustomForm({ ...customForm, parent_uuid: e.target.value })}
                style={styles.select}
              >
                <option value="">No Parent (Root Node)</option>
                {projectNodes.map((n) => (
                  <option key={n.uuid} value={n.uuid}>
                    {n.name} ({n.type?.display_name || n.type?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={styles.label}>{t.customName}</label>
              <input
                required
                placeholder="e.g. Ward 4 / Shaniwar Peth / Booth 12"
                value={customForm.name}
                onChange={(e) => setCustomForm({ ...customForm, name: e.target.value })}
                style={styles.input}
              />
            </div>

            <div>
              <label style={styles.label}>{t.customCode}</label>
              <input
                placeholder="e.g. W-04 / B-12"
                value={customForm.code}
                onChange={(e) => setCustomForm({ ...customForm, code: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={{ marginTop: 8 }}>
              <button
                type="submit"
                disabled={busy || !selectedProjectUuid || currentProject?.status === 'COMPLETED'}
                style={styles.btnPrimary}
              >
                {t.submitCustomBtn}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default ProjectGeographyManager;
