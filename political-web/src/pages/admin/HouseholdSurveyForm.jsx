import React, { useState, useEffect, useMemo } from 'react';
import apiClient from '../../api/axios';

const SCOPES = [
  { value: 'DISTRICT', title: 'District', title_mr: 'जिल्हा', icon: '▤' },
  { value: 'LOK_SABHA', title: 'Lok Sabha', title_mr: 'लोकसभा', icon: '⌂' },
  { value: 'ASSEMBLY', title: 'Assembly', title_mr: 'विधानसभा', icon: '⌖' },
  { value: 'POLLING_STATION', title: 'Polling Station', title_mr: 'मतदान केंद्र / बूथ', icon: '▦' },
  { value: 'GRADUATE_CONSTITUENCY', title: 'Graduate Constituency', title_mr: 'पदवीधर मतदारसंघ', icon: '🎓' },
  { value: 'TEACHER_CONSTITUENCY', title: 'Teacher Constituency', title_mr: 'शिक्षक मतदारसंघ', icon: '📚' },
  { value: 'GENERAL', title: 'General Campaign', title_mr: 'सर्वसाधारण मोहीम', icon: '📋' },
];

function HouseholdSurveyForm({ user, language: appLang = 'en' }) {
  const [lang, setLang] = useState(appLang === 'mr' ? 'mr' : 'en');
  useEffect(() => {
    setLang(appLang === 'mr' ? 'mr' : 'en');
  }, [appLang]);
  const isMr = lang === 'mr';

  // Primary Views:
  // 'builder'   -> Create / Edit Form workspace
  // 'published' -> Published Forms Table & User Access Management (`published_forms` & `published_form_users`)
  // 'all_forms' -> Other Forms / All Projects gallery
  const [activeView, setActiveView] = useState('published');

  // Sub-tab inside Builder view: 'designer' | 'demo'
  const [builderTab, setBuilderTab] = useState('designer');

  // Projects State
  const [projectsList, setProjectsList] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [scopeFilter, setScopeFilter] = useState('ALL');
  const [selectedProject, setSelectedProject] = useState(null);

  // Published Forms Table State (`published_forms` in DB)
  const [publishedFormsList, setPublishedFormsList] = useState([]);
  const [loadingPublishedForms, setLoadingPublishedForms] = useState(true);
  const [publishedSearch, setPublishedSearch] = useState('');
  const [selectedPublishedForm, setSelectedPublishedForm] = useState(null);

  // User Access Modal State (`published_form_users`)
  const [showUserAccessModal, setShowUserAccessModal] = useState(false);
  const [accessModalUsers, setAccessModalUsers] = useState([]);
  const [selectedAccessUserIds, setSelectedAccessUserIds] = useState([]);
  const [loadingAccessUsers, setLoadingAccessUsers] = useState(false);
  const [savingUserAccess, setSavingUserAccess] = useState(false);
  const [accessUserSearch, setAccessUserSearch] = useState('');

  // Format Preview Modal State
  const [showFormatModal, setShowFormatModal] = useState(false);
  const [formatModalForm, setFormatModalForm] = useState(null);

  // Form Builder Configuration State
  const [formStatus, setFormStatus] = useState('DRAFT');
  const [lastPublishedAt, setLastPublishedAt] = useState(null);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [savingForm, setSavingForm] = useState(false);
  const [publishingForm, setPublishingForm] = useState(false);

  // Form Name State (Option for giving the name of form in English & Marathi)
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formTitleMr, setFormTitleMr] = useState('');

  // Dropup state & search for Assigned Workers in Published Forms Table
  const [openWorkersDropupId, setOpenWorkersDropupId] = useState(null);
  const [dropupAnchor, setDropupAnchor] = useState(null);
  const [workerDropupSearch, setWorkerDropupSearch] = useState('');

  // Status updating in DB state
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);

  // Form Builder Active Model State
  const [editingPublishedForm, setEditingPublishedForm] = useState(null);
  const [isNewForm, setIsNewForm] = useState(false);
  const [geographicScope, setGeographicScope] = useState('GENERAL');
  const [campaignName, setCampaignName] = useState('सांगली मोहीम');
  const [targetHouseholds, setTargetHouseholds] = useState(100);
  const [assignAllWorkers, setAssignAllWorkers] = useState(true);
  const [deletingFormId, setDeletingFormId] = useState(null);

  // Close dropup when clicking outside or resizing window
  useEffect(() => {
    const handleDismissDropup = (e) => {
      if (
        openWorkersDropupId &&
        !e.target.closest('[data-dropup-panel="true"]') &&
        !e.target.closest('[data-dropup-btn="true"]')
      ) {
        setOpenWorkersDropupId(null);
        setDropupAnchor(null);
      }
    };
    document.addEventListener('click', handleDismissDropup);
    window.addEventListener('resize', handleDismissDropup);
    return () => {
      document.removeEventListener('click', handleDismissDropup);
      window.removeEventListener('resize', handleDismissDropup);
    };
  }, [openWorkersDropupId]);

  const handleToggleWorkersDropup = (e, formId) => {
    e.stopPropagation();
    if (openWorkersDropupId === formId) {
      setOpenWorkersDropupId(null);
      setDropupAnchor(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUpward = spaceBelow < 340 && rect.top > 340;
      setDropupAnchor({
        top: openUpward ? undefined : rect.bottom + 6,
        bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
        left: Math.max(16, Math.min(rect.left, window.innerWidth - 370)),
      });
      setOpenWorkersDropupId(formId);
      setWorkerDropupSearch('');
    }
  };

  // Publish & Add Question Modals
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);

  // New Question State
  const [newQuestion, setNewQuestion] = useState({
    title_mr: '',
    title_en: '',
    type: 'single_choice',
    options_text: 'होय, नाही',
    required: false,
  });

  // Interactive Live Demo State
  const [demoForm, setDemoForm] = useState({
    pramukh_name: '',
    total_matdar: 1,
    mobile: '',
    address: '',
    members: [
      {
        id: 'mem_1',
        full_name: '',
        dob: '',
        age: '',
        has_voter_id: 'YES',
        voter_id_no: '',
        relation: 'कुटुंब प्रमुख (Self)',
      },
    ],
    customAnswers: {},
  });
  const [demoSubmitted, setDemoSubmitted] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // 1. Fetch All Projects
  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data } = await apiClient.get('/admin/projects?per_page=100');
      const list = data?.data || [];
      setProjectsList(list);

      if (!selectedProject && list.length > 0) {
        setSelectedProject(list[0]);
        loadProjectFormConfig(list[0]);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  // 2. Fetch Published Forms from `published_forms` Table
  const fetchPublishedForms = async () => {
    setLoadingPublishedForms(true);
    try {
      const { data } = await apiClient.get('/admin/published-forms');
      const list = data?.data || [];
      setPublishedFormsList(list);

      // If a project is currently selected, sync form titles if published record exists
      if (selectedProject) {
        const matched = list.find((f) => f.project_uuid === selectedProject.uuid || f.project_id === selectedProject.id);
        if (matched) {
          if (matched.form_title) setFormTitleEn(matched.form_title);
          if (matched.form_title_mr) setFormTitleMr(matched.form_title_mr);
          if (matched.status) setFormStatus(matched.status);
        }
      }
    } catch (err) {
      console.error('Failed to load published forms:', err);
    } finally {
      setLoadingPublishedForms(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchPublishedForms();
  }, []);

  // 3. Load Form Config for Project
  const loadProjectFormConfig = async (project) => {
    if (!project) return;
    const storageKey = `project_form_meta_${project.uuid}`;
    let loadedQuestions = [];
    let loadedStatus = 'DRAFT';
    let loadedPubDate = null;
    let loadedTitleEn = `${project.name} Survey Form`;
    let loadedTitleMr = `${project.name} सर्व्हे फॉर्म`;

    // 3a. Check if this project already has a published form in published_forms
    const existingPub = publishedFormsList.find(
      (f) => f.project_uuid === project.uuid || (project.id && f.project_id === project.id)
    );
    if (existingPub) {
      if (existingPub.form_title) loadedTitleEn = existingPub.form_title;
      if (existingPub.form_title_mr) loadedTitleMr = existingPub.form_title_mr;
      if (existingPub.status) loadedStatus = existingPub.status;
      if (existingPub.published_at) loadedPubDate = existingPub.published_at;
      if (Array.isArray(existingPub.custom_questions) && existingPub.custom_questions.length > 0) {
        loadedQuestions = existingPub.custom_questions;
      }
    }

    try {
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (!existingPub) {
          loadedQuestions = parsed.customQuestions || [];
          loadedStatus = parsed.status || 'DRAFT';
          loadedPubDate = parsed.publishedAt || null;
        }
        if (parsed.formTitleEn) loadedTitleEn = parsed.formTitleEn;
        if (parsed.formTitleMr) loadedTitleMr = parsed.formTitleMr;
      }
    } catch (e) {
      console.warn('Cache read error:', e);
    }

    try {
      const { data } = await apiClient.get('/admin/survey-forms/templates');
      const templates = data?.data || {};
      const projTemplate = templates[`PROJ_${project.uuid}`] || templates[project.geographic_scope];
      if (projTemplate) {
        if (!existingPub && Array.isArray(projTemplate.customQuestions) && projTemplate.customQuestions.length > 0) {
          loadedQuestions = projTemplate.customQuestions;
        }
        if (!existingPub && projTemplate.status) {
          loadedStatus = projTemplate.status;
        }
        if (projTemplate.formTitle?.en) loadedTitleEn = projTemplate.formTitle.en;
        if (projTemplate.formTitle?.mr) loadedTitleMr = projTemplate.formTitle.mr;
      }
    } catch (e) {
      console.warn('Backend templates API fetch error:', e);
    }

    setFormTitleEn(loadedTitleEn);
    setFormTitleMr(loadedTitleMr);
    setCustomQuestions(loadedQuestions);
    setFormStatus(loadedStatus);
    setLastPublishedAt(loadedPubDate);

    // Reset demo
    setDemoForm({
      pramukh_name: '',
      total_matdar: 1,
      mobile: '',
      address: '',
      members: [
        {
          id: 'mem_1',
          full_name: '',
          dob: '',
          age: '',
          has_voter_id: 'YES',
          voter_id_no: '',
          relation: 'कुटुंब प्रमुख (Self)',
        },
      ],
      customAnswers: {},
    });
    setDemoSubmitted(false);
  };

  const handleSelectProject = (project, targetView = 'builder') => {
    setSelectedProject(project);
    setIsNewForm(false);
    setCampaignName(project.name || 'सांगली मोहीम');
    setGeographicScope(project.geographic_scope || 'GENERAL');
    loadProjectFormConfig(project);
    setActiveView(targetView);
  };

  const handleCreateNewForm = () => {
    setEditingPublishedForm(null);
    setIsNewForm(true);
    setSelectedProject(null);
    setFormTitleEn('');
    setFormTitleMr('');
    setGeographicScope('GENERAL');
    setCampaignName('सांगली मोहीम');
    setTargetHouseholds(100);
    setAssignAllWorkers(true);
    setCustomQuestions([]);
    setFormStatus('DRAFT');
    setLastPublishedAt(null);
    setActiveView('builder');
    setBuilderTab('designer');
  };

  const handleEditPublishedForm = (pForm) => {
    setEditingPublishedForm(pForm);
    setIsNewForm(false);
    setFormTitleEn(pForm.form_title || '');
    setFormTitleMr(pForm.form_title_mr || '');
    setGeographicScope(pForm.geographic_scope || 'GENERAL');
    setCampaignName(pForm.project_name || 'सांगली मोहीम');

    let format = {};
    if (pForm.form_format) {
      try {
        format = typeof pForm.form_format === 'string' ? JSON.parse(pForm.form_format) : pForm.form_format;
      } catch (e) {
        format = {};
      }
    }
    setTargetHouseholds(format.target_households || 100);
    setCustomQuestions(Array.isArray(pForm.custom_questions) ? pForm.custom_questions : (format.custom_questions || []));
    setFormStatus(pForm.status || 'ACTIVE');
    setLastPublishedAt(pForm.published_at || null);

    const matchingProj = projectsList.find((p) => p.uuid === pForm.project_uuid || p.id === pForm.project_id);
    setSelectedProject(matchingProj || null);

    setActiveView('builder');
    setBuilderTab('designer');
  };

  const handleDeletePublishedForm = async (pForm) => {
    const confirmMsg = isMr
      ? `तुम्हाला नक्की '${pForm.form_title_mr || pForm.form_title}' हा फॉर्म published_forms टेबलमधून डिलीट करायचा आहे का?`
      : `Are you sure you want to delete '${pForm.form_title}' from the database?`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingFormId(pForm.id);
    try {
      await apiClient.delete(`/admin/published-forms/${pForm.uuid}`);
      showToast(isMr ? '✓ फॉर्म published_forms टेबलमधून यशस्वीरीत्या डिलीट झाला!' : '✓ Form deleted successfully from published_forms table!');
      fetchPublishedForms();
    } catch (err) {
      console.error('Delete form error:', err);
      alert(isMr ? 'फॉर्म डिलीट करताना त्रुटी आली.' : 'Failed to delete form from database.');
    } finally {
      setDeletingFormId(null);
    }
  };

  // 4. Save Form Draft Directly to `published_forms` Table with status = DRAFT
  const handleSaveDraft = async () => {
    setSavingForm(true);
    const finalTitleEn = (formTitleEn && formTitleEn.trim()) ? formTitleEn.trim() : (campaignName ? `${campaignName} Survey Form` : 'Survey Form');
    const finalTitleMr = (formTitleMr && formTitleMr.trim()) ? formTitleMr.trim() : (formTitleEn || `${finalTitleEn} सर्व्हे फॉर्म`);
    const finalProjectName = (campaignName && campaignName.trim())
      ? campaignName.trim()
      : (selectedProject?.name || finalTitleEn || 'सांगली मोहीम');

    try {
      const payload = {
        form_uuid: (!isNewForm && editingPublishedForm) ? editingPublishedForm.uuid : null,
        create_new: isNewForm,
        project_uuid: selectedProject?.uuid || null,
        project_name: finalProjectName,
        form_title: finalTitleEn,
        form_title_mr: finalTitleMr,
        geographic_scope: geographicScope || selectedProject?.geographic_scope || 'GENERAL',
        target_households: Number(targetHouseholds) || 100,
        custom_questions: customQuestions,
        status: 'DRAFT',
        assign_all_workers: assignAllWorkers,
      };

      const { data } = await apiClient.post('/admin/published-forms/publish', payload);

      setFormStatus('DRAFT');
      if (data?.data) {
        setEditingPublishedForm(data.data);
        setIsNewForm(false);
      }
      fetchPublishedForms();

      showToast(
        isMr
          ? `💾 '${finalTitleMr}' फॉर्म published_forms टेबलमध्ये मसुदा (Draft) म्हणून सुरक्षित सेव्ह झाला!`
          : `💾 '${finalTitleEn}' saved directly into published_forms table as Draft!`
      );
    } catch (err) {
      console.error('Save draft error:', err);
      showToast(isMr ? '⚠️ मसुदा सेव्ह करताना त्रुटी आली.' : '⚠️ Failed to save draft to database.');
    } finally {
      setSavingForm(false);
    }
  };

  // 5. Publish Form Action -> Saves to `published_forms` Table & Syncs Users
  const handleConfirmPublish = async () => {
    setPublishingForm(true);
    const finalTitleEn = (formTitleEn && formTitleEn.trim()) ? formTitleEn.trim() : (campaignName ? `${campaignName} Survey Form` : 'Survey Form');
    const finalTitleMr = (formTitleMr && formTitleMr.trim()) ? formTitleMr.trim() : (formTitleEn || `${finalTitleEn} सर्व्हे फॉर्म`);
    const finalProjectName = (campaignName && campaignName.trim())
      ? campaignName.trim()
      : (selectedProject?.name || finalTitleEn || 'सांगली मोहीम');

    try {
      const payload = {
        form_uuid: (!isNewForm && editingPublishedForm) ? editingPublishedForm.uuid : null,
        create_new: isNewForm,
        project_uuid: selectedProject?.uuid || null,
        project_name: finalProjectName,
        form_title: finalTitleEn,
        form_title_mr: finalTitleMr,
        geographic_scope: geographicScope || selectedProject?.geographic_scope || 'GENERAL',
        target_households: Number(targetHouseholds) || 100,
        custom_questions: customQuestions,
        status: 'ACTIVE',
        assign_all_workers: assignAllWorkers,
      };

      const { data } = await apiClient.post('/admin/published-forms/publish', payload);

      const assignedCount = data?.data?.assigned_users_count || 0;
      setFormStatus('ACTIVE');
      setLastPublishedAt(new Date().toISOString());
      if (data?.data) {
        setEditingPublishedForm(data.data);
        setIsNewForm(false);
      }
      fetchPublishedForms();

      showToast(
        isMr
          ? `🚀 '${finalTitleMr}' फॉर्म published_forms टेबलमध्ये यशस्वीरीत्या सेव्ह व प्रकाशित झाला! (${assignedCount} कार्यकर्त्यांना ॲक्सेस मिळाला)`
          : `🚀 '${finalTitleEn}' created and saved into published_forms table! (${assignedCount} workers granted access)`
      );
    } catch (err) {
      console.error('Publish error:', err);
      showToast(isMr ? '⚠️ फॉर्म सेव्ह करताना त्रुटी आली.' : '⚠️ Failed to save form to database.');
    } finally {
      setPublishingForm(false);
    }
  };

  // 5b. Update Form Status Directly in Database (`published_forms` table)
  const handleUpdateFormStatus = async (form, nextStatus) => {
    if (!form || !form.uuid) return;
    setStatusUpdatingId(form.id);
    try {
      const { data } = await apiClient.patch(`/admin/published-forms/${form.uuid}/status`, {
        status: nextStatus,
      });

      // Update state in publishedFormsList
      setPublishedFormsList((prev) =>
        prev.map((item) => (item.id === form.id ? { ...item, status: nextStatus } : item))
      );

      // If currently selected project matches, update formStatus
      if (selectedProject && (selectedProject.uuid === form.project_uuid || selectedProject.id === form.project_id)) {
        setFormStatus(nextStatus);
      }

      showToast(
        isMr
          ? `✓ फॉर्म स्थिती DB मध्ये '${nextStatus}' अशी अपडेट झाली!`
          : `✓ Form status updated to '${nextStatus}' in database!`
      );
    } catch (err) {
      console.error('Error updating status in DB:', err);
      alert(isMr ? 'डेटाबेसमध्ये स्थिती अपडेट करताना त्रुटी आली.' : 'Failed to update status in database.');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // 6. Manage User Access Modal Handlers (`published_form_users`)
  const handleOpenUserAccessModal = async (form) => {
    setSelectedPublishedForm(form);
    setShowUserAccessModal(true);
    setLoadingAccessUsers(true);
    setAccessUserSearch('');
    try {
      const { data } = await apiClient.get(`/admin/published-forms/${form.uuid}/users`);
      const users = data?.data || [];
      setAccessModalUsers(users);
      const assignedIds = users.filter((u) => u.is_assigned).map((u) => u.id);
      setSelectedAccessUserIds(assignedIds);
    } catch (err) {
      console.error('Error loading users for published form:', err);
    } finally {
      setLoadingAccessUsers(false);
    }
  };

  const handleToggleAccessUser = (userId) => {
    setSelectedAccessUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllUsers = () => {
    const allFiltered = accessModalUsers
      .filter((u) => {
        if (!accessUserSearch.trim()) return true;
        const q = accessUserSearch.toLowerCase().trim();
        return u.full_name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q);
      })
      .map((u) => u.id);
    setSelectedAccessUserIds((prev) => Array.from(new Set([...prev, ...allFiltered])));
  };

  const handleDeselectAllUsers = () => {
    setSelectedAccessUserIds([]);
  };

  const handleSaveUserAccess = async () => {
    if (!selectedPublishedForm) return;
    setSavingUserAccess(true);
    try {
      await apiClient.put(`/admin/published-forms/${selectedPublishedForm.uuid}/users`, {
        user_ids: selectedAccessUserIds,
        role: 'WORKER',
        status: 'ACTIVE',
      });

      setShowUserAccessModal(false);
      fetchPublishedForms();
      showToast(isMr ? '✓ कार्यकर्त्यांचे ॲक्सेस अधिकार यशस्वीरित्या सेव्ह झाले!' : '✓ Worker access saved successfully!');
    } catch (err) {
      console.error('Error saving user access:', err);
      alert(isMr ? 'अधिकार सेव्ह करताना त्रुटी आली.' : 'Failed to save access.');
    } finally {
      setSavingUserAccess(false);
    }
  };

  // 7. Add Custom Question
  const handleAddQuestion = (e) => {
    e.preventDefault();
    if (!newQuestion.title_mr.trim() && !newQuestion.title_en.trim()) {
      alert(isMr ? 'कृपया प्रश्नाचे शीर्षक प्रविष्ट करा.' : 'Please enter question title.');
      return;
    }

    const options = (newQuestion.type === 'single_choice' || newQuestion.type === 'multi_choice')
      ? newQuestion.options_text.split(',').map((o) => o.trim()).filter(Boolean)
      : [];

    const questionObj = {
      id: `q_${Date.now()}`,
      title_mr: newQuestion.title_mr.trim() || newQuestion.title_en.trim(),
      title_en: newQuestion.title_en.trim() || newQuestion.title_mr.trim(),
      type: newQuestion.type,
      options,
      required: Boolean(newQuestion.required),
    };

    const nextList = [...customQuestions, questionObj];
    setCustomQuestions(nextList);

    if (selectedProject) {
      localStorage.setItem(
        `project_form_meta_${selectedProject.uuid}`,
        JSON.stringify({ status: formStatus, customQuestions: nextList, publishedAt: lastPublishedAt })
      );
    }

    setNewQuestion({
      title_mr: '',
      title_en: '',
      type: 'single_choice',
      options_text: 'होय, नाही',
      required: false,
    });
    setShowAddQuestionModal(false);
    showToast(isMr ? '✓ नवीन प्रश्न फॉर्ममध्ये जोडला गेला!' : '✓ New question added to form!');
  };

  // Delete Custom Question
  const handleDeleteQuestion = (qId) => {
    const nextList = customQuestions.filter((q) => q.id !== qId);
    setCustomQuestions(nextList);
    if (selectedProject) {
      localStorage.setItem(
        `project_form_meta_${selectedProject.uuid}`,
        JSON.stringify({ status: formStatus, customQuestions: nextList, publishedAt: lastPublishedAt })
      );
    }
    showToast(isMr ? 'प्रश्न हटवला.' : 'Question removed.');
  };

  // Age & Voter Auto-computation
  const calculateAge = (dobString) => {
    if (!dobString) return '';
    const bDate = new Date(dobString);
    if (isNaN(bDate.getTime())) return '';
    const today = new Date();
    let age = today.getFullYear() - bDate.getFullYear();
    const m = today.getMonth() - bDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--;
    return age >= 0 ? age : '';
  };

  const handleMemberChange = (id, field, value) => {
    setDemoForm((prev) => {
      const updatedMembers = prev.members.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, [field]: value };
        if (field === 'dob') {
          const autoAge = calculateAge(value);
          if (autoAge !== '') updated.age = autoAge;
        }
        return updated;
      });

      const voterCount = updatedMembers.filter((m) => m.has_voter_id === 'YES').length;
      return {
        ...prev,
        members: updatedMembers,
        total_matdar: voterCount > 0 ? voterCount : prev.total_matdar,
      };
    });
  };

  const handleAddMember = () => {
    const newId = `mem_${Date.now()}`;
    setDemoForm((prev) => {
      const nextMembers = [
        ...prev.members,
        {
          id: newId,
          full_name: '',
          dob: '',
          age: '',
          has_voter_id: 'YES',
          voter_id_no: '',
          relation: '',
        },
      ];
      return {
        ...prev,
        members: nextMembers,
        total_matdar: nextMembers.filter((m) => m.has_voter_id === 'YES').length,
      };
    });
  };

  const handleRemoveMember = (id) => {
    if (demoForm.members.length <= 1) {
      alert(isMr ? 'किमान एक सदस्य आवश्यक आहे.' : 'At least one family member is required.');
      return;
    }
    setDemoForm((prev) => {
      const nextMembers = prev.members.filter((m) => m.id !== id);
      return {
        ...prev,
        members: nextMembers,
        total_matdar: nextMembers.filter((m) => m.has_voter_id === 'YES').length,
      };
    });
  };

  // Filtered Published Forms
  const filteredPublishedForms = useMemo(() => {
    if (!publishedSearch.trim()) return publishedFormsList;
    const q = publishedSearch.toLowerCase().trim();
    return publishedFormsList.filter(
      (f) =>
        f.form_title?.toLowerCase().includes(q) ||
        f.form_title_mr?.toLowerCase().includes(q) ||
        f.project_name?.toLowerCase().includes(q) ||
        f.geographic_scope?.toLowerCase().includes(q)
    );
  }, [publishedFormsList, publishedSearch]);

  // Filtered Projects for "Other Forms" view
  const filteredProjects = useMemo(() => {
    return projectsList.filter((p) => {
      const matchesSearch = !searchQuery.trim() ||
        p.name?.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        p.geographic_scope?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchesScope = scopeFilter === 'ALL' || p.geographic_scope === scopeFilter;
      return matchesSearch && matchesScope;
    });
  }, [projectsList, searchQuery, scopeFilter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'inherit', color: '#0f172a' }}>
      {/* 3D Animations & Tactile Button / Tab Stylesheet */}
      <style>{`
        /* 3D Primary Active Mode Tab */
        .fb-tab-3d-active {
          background: linear-gradient(180deg, #2b74f0 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.65) !important;
          border-bottom: 3.5px solid #0f3a88 !important;
          box-shadow: 0 4px 14px rgba(23, 84, 190, 0.42), 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.5) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 10px !important;
          transform-style: preserve-3d;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 850 !important;
        }
        .fb-tab-3d-active:hover {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 22px rgba(23, 84, 190, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .fb-tab-3d-active:active {
          transform: translateY(2px) scale(0.98) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
          box-shadow: 0 2px 6px rgba(23, 84, 190, 0.3) !important;
        }

        /* 3D Inactive Mode Tab */
        .fb-tab-3d-inactive {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #334155 !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 3px solid #94a3b8 !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff !important;
          border-radius: 10px !important;
          transform-style: preserve-3d;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 800 !important;
        }
        .fb-tab-3d-inactive:hover {
          transform: translateY(-2px) !important;
          color: #1e60d5 !important;
          border-color: #93c5fd !important;
          border-bottom-color: #3b82f6 !important;
          box-shadow: 0 6px 14px rgba(30, 96, 213, 0.18), inset 0 1px 1px #ffffff !important;
        }
        .fb-tab-3d-inactive:active {
          transform: translateY(1.5px) !important;
          border-bottom: 1.5px solid #94a3b8 !important;
        }

        /* 3D Action / Primary Button (Royal Blue) */
        .fb-btn-3d-primary {
          background: linear-gradient(180deg, #2b74f0 0%, #1e60d5 50%, #1754be 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.65) !important;
          border-bottom: 3.5px solid #0f3a88 !important;
          box-shadow: 0 4px 14px rgba(23, 84, 190, 0.4), 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.45) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 8px !important;
          transform-style: preserve-3d;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 850 !important;
        }
        .fb-btn-3d-primary:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 22px rgba(23, 84, 190, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .fb-btn-3d-primary:active:not(:disabled) {
          transform: translateY(2px) scale(0.98) !important;
          border-bottom: 1.5px solid #0f3a88 !important;
          box-shadow: 0 2px 6px rgba(23, 84, 190, 0.3) !important;
        }

        /* 3D Secondary Button (Slate / White) */
        .fb-btn-3d-secondary {
          background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%) !important;
          color: #475569 !important;
          border: 1px solid #cbd5e1 !important;
          border-bottom: 2.8px solid #94a3b8 !important;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05), inset 0 1px 1px #ffffff !important;
          border-radius: 8px !important;
          transform-style: preserve-3d;
          transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 750 !important;
        }
        .fb-btn-3d-secondary:hover:not(:disabled) {
          transform: translateY(-1.5px) !important;
          color: #1e293b !important;
          border-color: #94a3b8 !important;
          border-bottom-color: #64748b !important;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1) !important;
        }
        .fb-btn-3d-secondary:active:not(:disabled) {
          transform: translateY(1.5px) !important;
          border-bottom: 1.2px solid #94a3b8 !important;
        }

        /* 3D Publish Button (Emerald Green) */
        .fb-btn-3d-publish {
          background: linear-gradient(180deg, #10b981 0%, #059669 50%, #047857 100%) !important;
          color: #ffffff !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
          border-top: 1.5px solid rgba(255, 255, 255, 0.65) !important;
          border-bottom: 3.5px solid #064e3b !important;
          box-shadow: 0 4px 14px rgba(5, 150, 105, 0.42), 0 2px 4px rgba(0, 0, 0, 0.12), inset 0 1.5px 1.5px rgba(255, 255, 255, 0.5) !important;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25) !important;
          border-radius: 10px !important;
          transform-style: preserve-3d;
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 900 !important;
        }
        .fb-btn-3d-publish:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02) !important;
          box-shadow: 0 8px 22px rgba(5, 150, 105, 0.6), inset 0 1.5px 2px rgba(255, 255, 255, 0.75) !important;
        }
        .fb-btn-3d-publish:active:not(:disabled) {
          transform: translateY(2px) scale(0.98) !important;
          border-bottom: 1.5px solid #064e3b !important;
          box-shadow: 0 2px 6px rgba(5, 150, 105, 0.3) !important;
        }

        /* 3D Danger / Delete Button */
        .fb-btn-3d-danger {
          background: linear-gradient(180deg, #ffffff 0%, #fff1f2 100%) !important;
          color: #e11d48 !important;
          border: 1px solid #fecdd3 !important;
          border-bottom: 2.8px solid #be123c !important;
          box-shadow: 0 2px 4px rgba(225, 29, 72, 0.1) !important;
          border-radius: 8px !important;
          transition: all 0.16s ease !important;
          cursor: pointer;
          font-weight: 750 !important;
        }
        .fb-btn-3d-danger:hover:not(:disabled) {
          background: #ffe4e6 !important;
          color: #9f1239 !important;
          transform: translateY(-1.5px) !important;
          box-shadow: 0 4px 10px rgba(225, 29, 72, 0.25) !important;
        }
        .fb-btn-3d-danger:active:not(:disabled) {
          transform: translateY(1.5px) !important;
          border-bottom: 1px solid #be123c !important;
        }

        /* 3D Workers Pill */
        .fb-badge-3d-workers {
          background: linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%) !important;
          color: #1d4ed8 !important;
          border: 1px solid #bfdbfe !important;
          border-bottom: 2.8px solid #3b82f6 !important;
          box-shadow: 0 2px 5px rgba(29, 78, 216, 0.12), inset 0 1px 1px #ffffff !important;
          border-radius: 999px !important;
          transform-style: preserve-3d;
          transition: all 0.16s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
          cursor: pointer;
          font-weight: 800 !important;
        }
        .fb-badge-3d-workers:hover {
          transform: translateY(-1.5px) scale(1.02) !important;
          border-bottom-color: #1d4ed8 !important;
          box-shadow: 0 5px 12px rgba(29, 78, 216, 0.22) !important;
        }
        .fb-badge-3d-workers:active {
          transform: translateY(1.5px) !important;
          border-bottom-width: 1.2px !important;
        }

        /* 3D Card Hover Lift */
        .fb-card-3d {
          transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
        .fb-card-3d:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06) !important;
        }

        /* 2 Tabs Per Line Grid */
        .fb-2tab-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }
        @media (max-width: 640px) {
          .fb-2tab-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="alert"
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 99999,
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: '10px',
            fontSize: '13.5px',
            fontWeight: '750',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid #334155',
          }}
        >
          <span style={{ color: '#22c55e', fontSize: '16px' }}>✓</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. TOP HEADER WITH ACTIVE CONTEXT & LANGUAGE                   */}
      {/* ============================================================== */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          padding: '20px 24px',
          boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>📋</span>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '850', color: '#0f172a', letterSpacing: '-0.3px' }}>
              {isMr ? 'फॉर्म बिल्डर व ॲक्सेस व्यवस्थापन' : 'Field Survey Form Builder & User Access'}
            </h1>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'मतदार सर्व्हे फॉर्म तयार करा, फॉर्म फॉरमॅट पहा आणि कार्यकर्त्यांना थेट ॲक्सेस अधिकार द्या.'
              : 'Design survey forms, view published formats, and seamlessly grant form access to field workers.'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {selectedProject && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '13px',
              }}
            >
              <span style={{ color: '#64748b', fontSize: '12px' }}>{isMr ? 'सक्रिय प्रकल्प:' : 'Project:'}</span>
              <strong style={{ color: '#1e3a8a', fontWeight: '800' }}>{selectedProject.name}</strong>
            </div>
          )}

          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              padding: '7px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '12.5px',
              fontWeight: '750',
              background: '#ffffff',
              color: '#334155',
              cursor: 'pointer',
            }}
          >
            <option value="mr">मराठी (MR)</option>
            <option value="en">English (EN)</option>
          </select>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. THE 3 PROPER BUTTONS BAR                                    */}
      {/*    1) PUBLISHED FORMS & USER ACCESS                            */}
      {/*    2) CREATE / EDIT FORM                                       */}
      {/*    3) OTHER PROJECTS / FORMS                                   */}
      {/* ============================================================== */}
      <div
        className="fb-2tab-grid"
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1.5px solid #e2e8f0',
          padding: '16px 18px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
        }}
      >
        {/* ROW 1 - TAB 1: PUBLISHED FORMS & ACCESS (TABLE VIEW) */}
        <button
          type="button"
          onClick={() => {
            fetchPublishedForms();
            setActiveView('published');
          }}
          className={activeView === 'published' ? 'fb-tab-3d-active' : 'fb-tab-3d-inactive'}
          style={{
            padding: '12px 20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '16px' }}>🚀</span>
          <span>{isMr ? 'प्रकाशित फॉर्म व ॲक्सेस (Published Forms)' : 'Published Forms & Access'}</span>
          <span
            style={{
              background: activeView === 'published' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: activeView === 'published' ? '#ffffff' : '#334155',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11.5px',
              fontWeight: '800',
              marginLeft: '4px',
            }}
          >
            {publishedFormsList.length}
          </span>
        </button>

        {/* ROW 1 - TAB 2: CREATE / EDIT FORM */}
        <button
          type="button"
          onClick={() => {
            if (!selectedProject && !isNewForm && !editingPublishedForm) {
              handleCreateNewForm();
            } else {
              setActiveView('builder');
            }
          }}
          className={activeView === 'builder' ? 'fb-tab-3d-active' : 'fb-tab-3d-inactive'}
          style={{
            padding: '12px 20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '16px' }}>✏️</span>
          <span>{isMr ? 'फॉर्म तयार करा / रचना (Create Form)' : 'Create / Edit Form'}</span>
        </button>

        {/* ROW 2 - TAB 1: OTHER PROJECTS / FORMS */}
        <button
          type="button"
          onClick={() => setActiveView('all_forms')}
          className={activeView === 'all_forms' ? 'fb-tab-3d-active' : 'fb-tab-3d-inactive'}
          style={{
            padding: '12px 20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
          }}
        >
          <span style={{ fontSize: '16px' }}>📂</span>
          <span>{isMr ? 'इतर प्रकल्प फॉर्म (Other Forms)' : 'Other Project Forms'}</span>
          <span
            style={{
              background: activeView === 'all_forms' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
              color: activeView === 'all_forms' ? '#ffffff' : '#334155',
              padding: '2px 8px',
              borderRadius: '999px',
              fontSize: '11.5px',
              fontWeight: '800',
              marginLeft: '4px',
            }}
          >
            {projectsList.length}
          </span>
        </button>

        {/* ROW 2 - TAB 2: ACTION TRIGGER: PUBLISH FORM (3D WHITE BUTTON) */}
        <button
          type="button"
          disabled={!selectedProject || publishingForm}
          onClick={() => {
            if (selectedProject) {
              setShowPublishModal(true);
            } else {
              alert(isMr ? 'कृपया आधी प्रकल्प निवडा किंवा तयार करा.' : 'Please select or create a project first.');
            }
          }}
          className="fb-tab-3d-inactive"
          style={{
            padding: '12px 20px',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            opacity: selectedProject ? 1 : 0.65,
            cursor: selectedProject ? 'pointer' : 'not-allowed',
          }}
          title={!selectedProject ? (isMr ? 'कृपया आधी प्रकल्प निवडा' : 'Please select a project first') : ''}
        >
          <span style={{ fontSize: '17px' }}>🚀</span>
          <span>{isMr ? 'फॉर्म प्रकाशित करा (Publish Form)' : 'Publish Form'}</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* VIEW 1: PUBLISHED FORMS TABLE & USER ACCESS MANAGEMENT        */}
      {/*         (Directly connected to DB `published_forms` table)     */}
      {/* ============================================================== */}
      {activeView === 'published' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '24px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                🚀 {isMr ? 'प्रकाशित फॉर्म व वापरकर्ते अधिकार यादी' : 'Published Forms & Assigned Users'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                {isMr
                  ? 'येथे सर्व प्रकाशित फॉर्म, त्यांचे सर्व फॉरमॅट्स आणि ॲक्सेस असलेले कार्यकर्ते दिसतील. येथून थेट वापरकर्त्यांना अधिकार द्या.'
                  : 'All published forms from `published_forms` table with their full schema and assigned users. Manage access seamlessly.'}
              </p>
            </div>

            {/* Search Input & Refresh Button */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '280px' }}>
                <input
                  type="text"
                  placeholder={isMr ? 'प्रकाशित फॉर्म शोधा...' : 'Search published form...'}
                  value={publishedSearch}
                  onChange={(e) => setPublishedSearch(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px 8px 32px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '13px',
                  }}
                />
                <span style={{ position: 'absolute', left: 10, top: 9, color: '#94a3b8', fontSize: '13px' }}>🔍</span>
              </div>

              <button
                type="button"
                onClick={fetchPublishedForms}
                className="fb-btn-3d-secondary"
                style={{
                  padding: '7px 14px',
                  fontSize: '13px',
                }}
              >
                🔄 {isMr ? 'रिफ्रेश' : 'Refresh'}
              </button>

              <button
                type="button"
                onClick={handleCreateNewForm}
                className="fb-btn-3d-primary"
                style={{
                  padding: '8px 18px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>➕</span>
                <span>{isMr ? 'नवीन फॉर्म तयार करा' : 'Create New Form'}</span>
              </button>
            </div>
          </div>

          {loadingPublishedForms ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <span style={{ fontSize: '28px' }}>⏳</span>
              <p style={{ marginTop: '8px', fontWeight: '750' }}>{isMr ? 'प्रकाशित फॉर्म लोड होत आहेत...' : 'Loading published forms...'}</p>
            </div>
          ) : filteredPublishedForms.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '48px 20px',
                background: '#f8fafc',
                borderRadius: '12px',
                border: '1.5px dashed #cbd5e1',
              }}
            >
              <div style={{ fontSize: '42px', marginBottom: '10px' }}>📋</div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '800', color: '#1e293b' }}>
                {isMr ? 'अजून कोणताही फॉर्म प्रकाशित झालेला नाही' : 'No Published Forms Found in Table'}
              </h3>
              <p style={{ margin: '0 0 18px', fontSize: '13px', color: '#64748b' }}>
                {isMr
                  ? 'नवीन फॉर्म डिझाइन करा किंवा वरील "फॉर्म तयार करा" टॅबवरून फॉर्म प्रकाशित करा.'
                  : 'Design a form and click "Publish Form" to store it in published_forms and grant user access.'}
              </p>
              <button
                type="button"
                onClick={handleCreateNewForm}
                className="fb-btn-3d-primary"
                style={{
                  padding: '10px 22px',
                  fontSize: '13.5px',
                }}
              >
                ✏️ {isMr ? 'नवीन फॉर्म तयार करा (+ Create Form)' : '+ Create New Form'}
              </button>
            </div>
          ) : (
            /* ======================================================== */
            /* PUBLISHED FORMS TABLE WITH FORMAT & ASSIGNED USERS      */
            /* ======================================================== */
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px', fontSize: '13.5px' }}>
                <thead>
                  <tr style={{ color: '#475569', fontSize: '12.5px', fontWeight: '800', textAlign: 'left', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0 16px 8px' }}>{isMr ? 'फॉर्म नाव व प्रकल्प' : 'Form Title & Project'}</th>
                    <th style={{ padding: '0 16px 8px' }}>{isMr ? 'व्याप्ती (Scope)' : 'Scope'}</th>
                    <th style={{ padding: '0 16px 8px' }}>{isMr ? 'ॲक्सेस असलेले कार्यकर्ते' : 'Assigned Users (Workers)'}</th>
                    <th style={{ padding: '0 16px 8px' }}>{isMr ? 'स्थिती (Status)' : 'Status'}</th>
                    <th style={{ padding: '0 16px 8px', textAlign: 'right' }}>{isMr ? 'कृती / ॲक्सेस' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPublishedForms.map((pForm) => {
                    const assignedUsers = pForm.assigned_users || [];
                    const scopeObj = SCOPES.find((s) => s.value === pForm.geographic_scope);
                    const scopeTitle = isMr ? (scopeObj?.title_mr || pForm.geographic_scope) : (scopeObj?.title || pForm.geographic_scope);

                    return (
                      <tr
                        key={pForm.id}
                        className="fb-card-3d"
                        style={{
                          background: '#ffffff',
                          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                          borderRadius: '12px',
                          border: '1px solid #e2e8f0',
                        }}
                      >
                        {/* 1. Form Title & Project */}
                        <td style={{ padding: '16px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', borderRadius: '12px 0 0 12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '24px' }}>📋</span>
                            <div>
                              <strong style={{ fontSize: '14.5px', color: '#0f172a', display: 'block' }}>
                                {isMr && pForm.form_title_mr ? pForm.form_title_mr : pForm.form_title}
                              </strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
                                <span style={{ fontSize: '12px', color: '#64748b' }}>
                                  📁 {pForm.project_name} • v{pForm.version || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setFormatModalForm(pForm);
                                    setShowFormatModal(true);
                                  }}
                                  title="View Form Schema"
                                  className="fb-btn-3d-secondary"
                                  style={{
                                    fontSize: '11px',
                                    padding: '2px 8px',
                                    borderRadius: '5px',
                                    color: '#1d4ed8',
                                  }}
                                >
                                  👁️ {isMr ? 'स्कीमा' : 'Schema'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* 2. Scope */}
                        <td style={{ padding: '16px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                          <span
                            style={{
                              background: '#f1f5f9',
                              color: '#334155',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '750',
                            }}
                          >
                            📍 {scopeTitle}
                          </span>
                        </td>

                        {/* 3. Assigned Users (Workers) - Sleek Dropup Trigger */}
                        <td style={{ padding: '16px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                          <button
                            type="button"
                            data-dropup-btn="true"
                            onClick={(e) => handleToggleWorkersDropup(e, pForm.id)}
                            className="fb-badge-3d-workers"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '7px 15px',
                              fontSize: '12.5px',
                            }}
                          >
                            <span style={{ fontSize: '14px' }}>👥</span>
                            <span>
                              {pForm.assigned_users_count || assignedUsers.length} {isMr ? 'कार्यकर्ते' : 'Workers'}
                            </span>
                            <span
                              style={{
                                fontSize: '10px',
                                transform: openWorkersDropupId === pForm.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                              }}
                            >
                              ▲
                            </span>
                          </button>
                        </td>

                        {/* 4. Status (Interactive Selector that updates DB directly) */}
                        <td style={{ padding: '16px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '135px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <select
                                value={pForm.status || 'PUBLISHED'}
                                disabled={statusUpdatingId === pForm.id}
                                onChange={(e) => handleUpdateFormStatus(pForm, e.target.value)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: '850',
                                  cursor: statusUpdatingId === pForm.id ? 'not-allowed' : 'pointer',
                                  background:
                                    pForm.status === 'PUBLISHED' || pForm.status === 'ACTIVE'
                                      ? '#ecfdf5'
                                      : pForm.status === 'DRAFT'
                                        ? '#fffbeb'
                                        : '#fef2f2',
                                  color:
                                    pForm.status === 'PUBLISHED' || pForm.status === 'ACTIVE'
                                      ? '#047857'
                                      : pForm.status === 'DRAFT'
                                        ? '#b45309'
                                        : '#b91c1c',
                                  border:
                                    pForm.status === 'PUBLISHED' || pForm.status === 'ACTIVE'
                                      ? '1.5px solid #a7f3d0'
                                      : pForm.status === 'DRAFT'
                                        ? '1.5px solid #fde68a'
                                        : '1.5px solid #fecaca',
                                  outline: 'none',
                                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                }}
                              >
                                <option value="PUBLISHED">● {isMr ? 'प्रकाशित (PUBLISHED)' : 'PUBLISHED'}</option>
                                <option value="ACTIVE">● {isMr ? 'सक्रिय (ACTIVE)' : 'ACTIVE'}</option>
                                <option value="INACTIVE">● {isMr ? 'निष्क्रिय (INACTIVE)' : 'INACTIVE'}</option>
                                <option value="DRAFT">● {isMr ? 'मसुदा (DRAFT)' : 'DRAFT'}</option>
                                <option value="CLOSED">● {isMr ? 'बंद (CLOSED)' : 'CLOSED'}</option>
                              </select>

                              {statusUpdatingId === pForm.id && (
                                <span style={{ fontSize: '12px' }} title="Updating in DB...">⏳</span>
                              )}
                            </div>

                            {pForm.published_at && (
                              <div style={{ fontSize: '11px', color: '#64748b' }}>
                                📅 {new Date(pForm.published_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 6. Action: Manage User Access & Demo */}
                        <td style={{ padding: '16px', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderRadius: '0 12px 12px 0', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                            {/* PROMINENT 3D BUTTON: GIVE / MANAGE USER ACCESS */}
                            <button
                              type="button"
                              onClick={() => handleOpenUserAccessModal(pForm)}
                              className="fb-btn-3d-primary"
                              style={{
                                padding: '7.5px 14px',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '5px',
                              }}
                            >
                              <span>👥</span>
                              <span>{isMr ? 'ॲक्सेस द्या / बदला' : 'Manage Access'}</span>
                            </button>

                            {/* EDIT 3D BUTTON: LOAD FORM IN BUILDER */}
                            <button
                              type="button"
                              onClick={() => handleEditPublishedForm(pForm)}
                              className="fb-btn-3d-secondary"
                              style={{
                                padding: '7.5px 12px',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                color: '#1d4ed8',
                              }}
                              title={isMr ? 'हा फॉर्म फॉर्म बिल्डरमध्ये एडिट करा' : 'Edit this form in Form Builder'}
                            >
                              <span>✏️</span>
                              <span>{isMr ? 'एडिट' : 'Edit'}</span>
                            </button>

                            {/* LIVE DEMO 3D BUTTON */}
                            <button
                              type="button"
                              onClick={() => {
                                handleEditPublishedForm(pForm);
                                setBuilderTab('demo');
                              }}
                              className="fb-btn-3d-secondary"
                              style={{
                                padding: '7.5px 12px',
                                fontSize: '12.5px',
                              }}
                            >
                              📱 {isMr ? 'डेमो' : 'Demo'}
                            </button>

                            {/* DELETE 3D BUTTON: REMOVE FROM published_forms */}
                            <button
                              type="button"
                              disabled={deletingFormId === pForm.id}
                              onClick={() => handleDeletePublishedForm(pForm)}
                              className="fb-btn-3d-danger"
                              style={{
                                padding: '7.5px 12px',
                                fontSize: '12.5px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                              title={isMr ? 'हा फॉर्म published_forms टेबलमधून कायमचा डिलीट करा' : 'Delete this form from published_forms table'}
                            >
                              <span>🗑️</span>
                              <span>{deletingFormId === pForm.id ? (isMr ? 'हटवत आहे...' : 'Deleting...') : (isMr ? 'हटवा' : 'Delete')}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ============================================================== */}
          {/* FLOATING ASSIGNED USERS DROPUP / DROPDOWN WITH REAL-TIME SEARCH */}
          {/* ============================================================== */}
          {(() => {
            if (!openWorkersDropupId || !dropupAnchor) return null;
            const activeDropupForm = publishedFormsList.find((f) => f.id === openWorkersDropupId);
            if (!activeDropupForm) return null;

            const assignedUsers = activeDropupForm.assigned_users || [];
            const filteredUsers = assignedUsers.filter((u) => {
              if (!workerDropupSearch.trim()) return true;
              const q = workerDropupSearch.toLowerCase().trim();
              return (
                u.full_name?.toLowerCase().includes(q) ||
                u.phone?.includes(q) ||
                u.email?.toLowerCase().includes(q)
              );
            });

            return (
              <div
                data-dropup-panel="true"
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'fixed',
                  top: dropupAnchor.top,
                  bottom: dropupAnchor.bottom,
                  left: dropupAnchor.left,
                  width: '350px',
                  maxWidth: 'calc(100vw - 32px)',
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)',
                  zIndex: 999999,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                      👥 {isMr ? 'ॲक्सेस असलेले कार्यकर्ते' : 'Assigned Workers'} ({filteredUsers.length}/{assignedUsers.length})
                    </strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      📁 {activeDropupForm.project_name}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenWorkersDropupId(null);
                      setDropupAnchor(null);
                    }}
                    style={{
                      border: 'none',
                      background: '#e2e8f0',
                      color: '#475569',
                      cursor: 'pointer',
                      fontSize: '13px',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* SEARCH OPTION (SEARCH BY NAME / MOBILE) */}
                <div style={{ padding: '10px 14px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 10, color: '#94a3b8', fontSize: '13px' }}>🔍</span>
                    <input
                      type="text"
                      autoFocus
                      placeholder={isMr ? 'कार्यकर्त्याचे नाव किंवा मोबाईल शोधा...' : 'Search worker by name, phone...'}
                      value={workerDropupSearch}
                      onChange={(e) => setWorkerDropupSearch(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '8px 30px 8px 32px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '12.5px',
                        fontWeight: '600',
                        outline: 'none',
                        background: '#f8fafc',
                      }}
                    />
                    {workerDropupSearch && (
                      <button
                        type="button"
                        onClick={() => setWorkerDropupSearch('')}
                        style={{
                          position: 'absolute',
                          right: 8,
                          border: 'none',
                          background: 'transparent',
                          color: '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '2px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* WORKERS LIST */}
                <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '8px 10px', background: '#f8fafc' }}>
                  {assignedUsers.length === 0 ? (
                    <div style={{ padding: '18px 12px', textAlign: 'center', color: '#dc2626', fontSize: '12.5px', fontWeight: '750' }}>
                      ⚠️ {isMr ? 'कोणताही कार्यकर्ता जोडलेला नाही' : 'No workers assigned yet'}
                    </div>
                  ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '18px 12px', textAlign: 'center', color: '#64748b', fontSize: '12.5px' }}>
                      🔍 {isMr ? 'या शोध निकषात कोणताही कार्यकर्ता सापडला नाही' : `No workers match "${workerDropupSearch}"`}
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '9px',
                          background: '#ffffff',
                          marginBottom: '6px',
                          border: '1px solid #e2e8f0',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                          <div
                            style={{
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              background: '#e0e7ff',
                              color: '#3730a3',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '800',
                            }}
                          >
                            {u.full_name ? u.full_name[0].toUpperCase() : 'U'}
                          </div>
                          <div>
                            <strong style={{ fontSize: '13px', color: '#1e293b', display: 'block' }}>
                              {u.full_name}
                            </strong>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              📱 {u.phone || 'No phone'} {u.email ? `• ${u.email}` : ''}
                            </span>
                          </div>
                        </div>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: '800',
                            background: '#ecfdf5',
                            color: '#047857',
                            padding: '2px 7px',
                            borderRadius: '999px',
                            border: '1px solid #a7f3d0',
                          }}
                        >
                          ACTIVE
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* FOOTER ACTION */}
                <div
                  style={{
                    padding: '10px 14px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#ffffff',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOpenWorkersDropupId(null);
                      setDropupAnchor(null);
                      handleOpenUserAccessModal(activeDropupForm);
                    }}
                    className="fb-btn-3d-primary"
                    style={{
                      width: '100%',
                      padding: '9px 14px',
                      fontSize: '12.5px',
                    }}
                  >
                    <span>⚙️</span>
                    <span>{isMr ? 'कार्यकर्ते ॲक्सेस बदला / जोडा' : 'Manage / Assign Workers'}</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 2: CREATE / EDIT FORM WORKSPACE                           */}
      {/* ============================================================== */}
      {activeView === 'builder' && (selectedProject || isNewForm || editingPublishedForm) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Sub-Header Bar: Switch between Designer vs Live Mobile Demo - Single Line with Exactly Same Length & Height */}
          <div
            style={{
              background: '#ffffff',
              border: '1.5px solid #cbd5e1',
              borderRadius: '14px',
              padding: '10px 14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(6, minmax(130px, 1fr))',
              gap: '8px',
              overflowX: 'auto',
              boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
            }}
          >
            {/* BUTTON 1: FORM DESIGNER */}
            <button
              type="button"
              onClick={() => setBuilderTab('designer')}
              className={builderTab === 'designer' ? 'fb-tab-3d-active' : 'fb-tab-3d-inactive'}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '750',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderRadius: '9px',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
              }}
            >
              <span>🛠️</span>
              <span>{isMr ? 'फॉर्म रचना व प्रश्न' : 'Form Designer'}</span>
            </button>

            {/* BUTTON 2: LIVE DEMO */}
            <button
              type="button"
              onClick={() => setBuilderTab('demo')}
              className={builderTab === 'demo' ? 'fb-tab-3d-active' : 'fb-tab-3d-inactive'}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '750',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderRadius: '9px',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
              }}
            >
              <span>📱</span>
              <span>{isMr ? 'मोबाईल डेमो' : 'Mobile Demo'}</span>
            </button>

            {/* BUTTON 3: ADD QUESTION */}
            <button
              type="button"
              onClick={() => setShowAddQuestionModal(true)}
              className="fb-btn-3d-primary"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '750',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderRadius: '9px',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
              }}
            >
              <span>➕</span>
              <span>{isMr ? 'प्रश्न जोडा' : 'Add Question'}</span>
            </button>

            {/* BUTTON 4: SAVE DRAFT */}
            <button
              type="button"
              disabled={savingForm || publishingForm}
              onClick={handleSaveDraft}
              className="fb-btn-3d-secondary"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '750',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderRadius: '9px',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
              }}
            >
              <span>💾</span>
              <span>{savingForm ? (isMr ? 'सेव्ह होत आहे...' : 'Saving...') : (isMr ? 'मसुदा सेव्ह करा' : 'Save Draft')}</span>
            </button>

            {/* BUTTON 5: PUBLISH TO DB */}
            <button
              type="button"
              disabled={publishingForm || savingForm}
              onClick={handleConfirmPublish}
              className="fb-btn-3d-publish"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '750',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderRadius: '9px',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
              }}
            >
              <span>🚀</span>
              <span>{publishingForm ? (isMr ? 'सेव्ह होत आहे...' : 'Saving...') : (isMr ? 'प्रकाशित करा' : 'Publish')}</span>
            </button>

            {/* BUTTON 6: VIEW FORMS LIST */}
            <button
              type="button"
              onClick={() => setActiveView('published')}
              className="fb-btn-3d-secondary"
              style={{
                width: '100%',
                height: '38px',
                padding: '0 6px',
                fontSize: '12px',
                fontWeight: '750',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px',
                borderRadius: '9px',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
              }}
            >
              <span>📋</span>
              <span>{isMr ? 'प्रकाशित फॉर्म यादी' : 'View Forms'}</span>
            </button>
          </div>

          {/* SUB-VIEW: FORM DESIGNER */}
          {builderTab === 'designer' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* CARD 0: FORM NAME / IDENTITY SETTINGS (ENGLISH & MARATHI) */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  padding: '22px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '24px' }}>📝</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
                          {isMr ? 'सर्व्हे फॉर्म तपशील (Form Title & Identity)' : 'Form Title & Settings'}
                        </h2>
                        {isNewForm ? (
                          <span style={{ fontSize: '11px', fontWeight: '800', background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '999px' }}>
                            ✨ {isMr ? 'नवीन फॉर्म' : 'NEW FORM'}
                          </span>
                        ) : editingPublishedForm ? (
                          <span style={{ fontSize: '11px', fontWeight: '800', background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 8px', borderRadius: '999px' }}>
                            ✏️ {isMr ? `published_forms ID #${editingPublishedForm.id}` : `published_forms ID #${editingPublishedForm.id}`}
                          </span>
                        ) : null}
                      </div>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                        {isMr
                          ? 'येथे भरलेली माहिती थेट published_forms डेटाबेस टेबलमध्ये सुरक्षित सेव्ह होईल.'
                          : 'Values configured here are saved directly into the `published_forms` database table.'}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="button"
                      disabled={savingForm || publishingForm}
                      onClick={handleSaveDraft}
                      className="fb-btn-3d-secondary"
                      style={{
                        padding: '8px 16px',
                        fontSize: '12.5px',
                      }}
                    >
                      <span>💾</span>
                      <span>{savingForm ? (isMr ? 'सेव्ह होत आहे...' : 'Saving...') : (isMr ? 'मसुदा सेव्ह करा' : 'Save Draft')}</span>
                    </button>

                    <button
                      type="button"
                      disabled={publishingForm || savingForm}
                      onClick={handleConfirmPublish}
                      className="fb-btn-3d-publish"
                      style={{
                        padding: '8px 18px',
                        fontSize: '12.5px',
                      }}
                    >
                      <span>🚀</span>
                      <span>{publishingForm ? (isMr ? 'सेव्ह होत आहे...' : 'Saving...') : (isMr ? 'प्रकाशित करा (Save to DB)' : 'Save & Publish')}</span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {/* Form Title EN */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                      {isMr ? 'फॉर्मचे नाव (इंग्रजीत / English Name) *' : 'Form Name (English) *'}
                    </label>
                    <input
                      type="text"
                      value={formTitleEn}
                      onChange={(e) => setFormTitleEn(e.target.value)}
                      placeholder={isMr ? 'उदा. Sangli Ward 10 Survey Form' : 'e.g. Sangli Ward 10 Survey Form'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '9px',
                        border: '1.5px solid #94a3b8',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      {isMr ? 'कार्यकर्त्यांना व ॲडमिनला इंग्रजी भाषेत दिसणारे नाव' : 'Visible to workers & admin in English'}
                    </span>
                  </div>

                  {/* Form Title MR */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                      {isMr ? 'फॉर्मचे नाव (मराठीत / Marathi Name)' : 'Form Name (Marathi)'}
                    </label>
                    <input
                      type="text"
                      value={formTitleMr}
                      onChange={(e) => setFormTitleMr(e.target.value)}
                      placeholder={isMr ? 'उदा. सांगली प्रभाग १० सर्व्हे फॉर्म' : 'e.g. सांगली प्रभाग १० सर्व्हे फॉर्म'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '9px',
                        border: '1.5px solid #94a3b8',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      {isMr ? 'कार्यकर्त्यांना व ॲडमिनला मराठी भाषेत दिसणारे नाव' : 'Visible to workers & admin in Marathi'}
                    </span>
                  </div>

                  {/* Campaign / Project Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                      {isMr ? 'मोहीम / प्रकल्पाचे नाव (Campaign / Project Name)' : 'Campaign / Project Name'}
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder={isMr ? 'उदा. सांगली मोहीम, प्रभाग १०' : 'e.g. Sangli Ward 10 Campaign'}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '9px',
                        border: '1.5px solid #94a3b8',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      {isMr ? 'डेटाबेसमध्ये project_name म्हणून सेव्ह होईल' : 'Saved as project_name in published_forms table'}
                    </span>
                  </div>

                  {/* Geographic Scope */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                      {isMr ? 'भौगोलिक व्याप्ती (Geographic Scope)' : 'Geographic Scope'}
                    </label>
                    <select
                      value={geographicScope}
                      onChange={(e) => setGeographicScope(e.target.value)}
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '9px',
                        border: '1.5px solid #94a3b8',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      {SCOPES.map((sc) => (
                        <option key={sc.value} value={sc.value}>
                          {sc.icon} {isMr ? sc.title_mr : sc.title} ({sc.value})
                        </option>
                      ))}
                    </select>
                    <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      {isMr ? 'डेटाबेसमध्ये geographic_scope म्हणून सेव्ह होईल' : 'Saved as geographic_scope in published_forms table'}
                    </span>
                  </div>

                  {/* Target Households Quota */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '800', color: '#1e293b', marginBottom: '6px' }}>
                      {isMr ? 'लक्ष्य कुटुंब संख्या (Target Households Quota)' : 'Target Households Quota'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={targetHouseholds}
                      onChange={(e) => setTargetHouseholds(e.target.value)}
                      placeholder="100"
                      style={{
                        width: '100%',
                        boxSizing: 'border-box',
                        padding: '10px 14px',
                        borderRadius: '9px',
                        border: '1.5px solid #94a3b8',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#0f172a',
                        background: '#ffffff',
                        outline: 'none',
                      }}
                    />
                    <span style={{ fontSize: '11.5px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      {isMr ? 'कार्यकर्त्यांना allocated कुटुंब संख्या' : 'Household target allocated for workers'}
                    </span>
                  </div>
                </div>

                {/* Auto Assign Workers Checkbox */}
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={assignAllWorkers}
                      onChange={(e) => setAssignAllWorkers(e.target.checked)}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                    <span style={{ fontSize: '13px', fontWeight: '750', color: '#1e293b' }}>
                      {isMr
                        ? '✓ सर्व सक्रिय कार्यकर्त्यांना हा फॉर्म भरण्याचा अधिकार (Access) द्या'
                        : '✓ Automatically grant form access to all active field workers in `published_form_users`'}
                    </span>
                  </label>
                </div>
              </div>

              {/* CARD 1: DEFAULT MANDATORY VOTER SURVEY FIELDS */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1px solid #cbd5e1',
                  padding: '22px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>🏠</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
                        {isMr ? '१. डीफॉल्ट मतदार सर्व्हे माहिती (Default Form Fields)' : '1. Standard Voter Survey Fields'}
                      </h2>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                        {isMr
                          ? 'खालील सर्व फील्ड्स या सर्व्हे फॉर्ममध्ये आधीपासूनच अनिवार्य समाविष्ट आहेत:'
                          : 'The following fields are pre-configured by default in every survey form:'}
                      </p>
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#ecfdf5',
                      color: '#047857',
                      border: '1px solid #a7f3d0',
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: '800',
                    }}
                  >
                    ✓ {isMr ? 'डीफॉल्ट समाविष्ट' : 'Included By Default'}
                  </span>
                </div>

                {/* Grid of Default Mandatory Fields */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>👤 कुटुंब प्रमुखाचे नाव</strong>
                      <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>अनिवार्य</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Family Head Full Name (Text input)</div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>🗳️ एकूण मतदार संख्या</strong>
                      <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>स्वयं-गणना</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Total Voters (Auto-calculated from family members)</div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>👥 सर्व सदस्यांची नावे</strong>
                      <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>अनिवार्य</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>All Family Members (Dynamic multi-member list)</div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>📅 जन्मतारीख व वय (DOB & Age)</strong>
                      <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1d4ed8', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>स्वयंचलित वय</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Date of Birth + Auto Age calculation for all members</div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>🪪 मतदार ओळखपत्र आहे का नाही?</strong>
                      <span style={{ fontSize: '11px', background: '#fee2e2', color: '#dc2626', padding: '1px 6px', borderRadius: '4px', fontWeight: '800' }}>अनिवार्य</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Voter ID Card Yes/No + Card Number field if Yes</div>
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>📍 पत्ता व मोबाईल क्रमांक</strong>
                      <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#475569', padding: '1px 6px', borderRadius: '4px', fontWeight: '750' }}>संपर्क</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>Address, House No. & Mobile Number</div>
                  </div>
                </div>
              </div>

              {/* CARD 2: ADDITIONAL CUSTOM SURVEY QUESTIONS */}
              <div
                style={{
                  background: '#ffffff',
                  borderRadius: '14px',
                  border: '1.5px solid #cbd5e1',
                  padding: '22px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '12px',
                    flexWrap: 'wrap',
                    gap: '10px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '20px' }}>❓</span>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '850', color: '#0f172a' }}>
                        {isMr ? '२. अतिरिक्त सानुकूल प्रश्न (Custom Questions)' : '2. Additional Survey Questions'}
                      </h2>
                      <p style={{ margin: '2px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                        {isMr
                          ? 'प्रकल्पाच्या गरजेनुसार स्थानिक प्रश्न (उदा. पाणी समस्या, योजना लाभ) जोडा.'
                          : 'Add custom field questions (e.g. issues, government schemes, opinions) to this form.'}
                      </p>
                    </div>
                    <span
                      style={{
                        background: '#eff6ff',
                        color: '#1d4ed8',
                        padding: '2px 10px',
                        borderRadius: '999px',
                        fontSize: '12px',
                        fontWeight: '800',
                      }}
                    >
                      {customQuestions.length} {isMr ? 'प्रश्न' : 'Questions'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddQuestionModal(true)}
                    className="fb-btn-3d-primary"
                    style={{
                      padding: '9px 18px',
                      fontSize: '13px',
                    }}
                  >
                    <span>➕</span>
                    <span>{isMr ? 'नवीन प्रश्न जोडा (Add Question)' : 'Add Question'}</span>
                  </button>
                </div>

                {customQuestions.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 20px',
                      background: '#f8fafc',
                      borderRadius: '10px',
                      border: '1.5px dashed #cbd5e1',
                    }}
                  >
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>📝</div>
                    <h3 style={{ margin: '0 0 6px', fontSize: '15px', fontWeight: '800', color: '#1e293b' }}>
                      {isMr ? 'अजून कोणताही अतिरिक्त प्रश्न जोडलेला नाही' : 'No custom questions added yet'}
                    </h3>
                    <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
                      {isMr
                        ? 'स्थानिक समस्या किंवा सर्वेक्षणासाठी नवीन प्रश्न जोडण्यासाठी खालील बटणावर क्लिक करा.'
                        : 'Click the button below to add custom survey questions to this form.'}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowAddQuestionModal(true)}
                      className="fb-btn-3d-primary"
                      style={{
                        padding: '10px 22px',
                        fontSize: '13px',
                      }}
                    >
                      ➕ {isMr ? 'पहिला प्रश्न जोडा' : 'Add First Question'}
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {customQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          background: '#f8fafc',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '12px',
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: '850', color: '#1e3a8a', fontSize: '14px' }}>
                              प्रश्न {idx + 1}.
                            </span>
                            <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>{q.title_mr}</strong>
                            {q.title_en && q.title_en !== q.title_mr && (
                              <span style={{ fontSize: '12.5px', color: '#64748b' }}>({q.title_en})</span>
                            )}
                            {q.required && (
                              <span
                                style={{
                                  fontSize: '11px',
                                  color: '#dc2626',
                                  fontWeight: '800',
                                  background: '#fee2e2',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                }}
                              >
                                अनिवार्य
                              </span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}>
                            <span
                              style={{
                                background: '#dbeafe',
                                color: '#1d4ed8',
                                fontSize: '11.5px',
                                fontWeight: '800',
                                padding: '2px 8px',
                                borderRadius: '4px',
                              }}
                            >
                              {q.type}
                            </span>
                            {q.options && q.options.length > 0 && (
                              <span style={{ fontSize: '12.5px', color: '#475569' }}>
                                पर्याय: {q.options.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="fb-btn-3d-danger"
                          style={{
                            padding: '7px 14px',
                            fontSize: '12px',
                          }}
                        >
                          🗑️ {isMr ? 'हटवा' : 'Delete'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* STICKY BOTTOM ACTION STRIP */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '16px 20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 6px 16px rgba(15, 23, 42, 0.05)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '13px', color: '#475569', fontWeight: '700' }}>
                    {isMr ? 'सध्याची फॉर्म स्थिती:' : 'Current Status:'}
                  </span>
                  <span
                    style={{
                      background: formStatus === 'PUBLISHED' ? '#ecfdf5' : '#fffbeb',
                      color: formStatus === 'PUBLISHED' ? '#047857' : '#b45309',
                      border: `1px solid ${formStatus === 'PUBLISHED' ? '#a7f3d0' : '#fde68a'}`,
                      padding: '3px 12px',
                      borderRadius: '999px',
                      fontWeight: '800',
                      fontSize: '12.5px',
                    }}
                  >
                    ● {formStatus === 'PUBLISHED' ? (isMr ? 'प्रकाशित (PUBLISHED)' : 'PUBLISHED') : (isMr ? 'मसुदा (DRAFT)' : 'DRAFT')}
                  </span>
                  {lastPublishedAt && (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      ({isMr ? 'दिनांक:' : 'Date:'} {new Date(lastPublishedAt).toLocaleDateString()})
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={savingForm}
                    className="fb-btn-3d-secondary"
                    style={{
                      padding: '10px 18px',
                      fontSize: '13px',
                    }}
                  >
                    💾 {savingForm ? (isMr ? 'सेव्ह होत आहे...' : 'Saving...') : (isMr ? 'मसुदा सेव्ह करा' : 'Save Draft')}
                  </button>

                  <button
                    type="button"
                    disabled={publishingForm}
                    onClick={handleConfirmPublish}
                    className="fb-btn-3d-publish"
                    style={{
                      padding: '10px 22px',
                      fontSize: '13.5px',
                    }}
                  >
                    <span>🚀</span>
                    <span>{publishingForm ? (isMr ? 'सेव्ह व प्रकाशित होत आहे...' : 'Saving & Publishing...') : (isMr ? 'फॉर्म प्रकाशित करा (Save & Publish to DB)' : 'Save & Publish Form')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUB-VIEW: LIVE DEMO */}
          {builderTab === 'demo' && (
            <div
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                padding: '24px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>📱</span>
                    <strong style={{ fontSize: '14.5px', color: '#0f172a' }}>
                      {isMr ? 'मोबाईल ॲप फॉर्म भरण्याचा प्रत्यक्ष डेमो (Live Worker View)' : 'Live Mobile Survey Form Filling Demo'}
                    </strong>
                  </div>
                  <p style={{ margin: '3px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    {isMr
                      ? 'कार्यकर्ते प्रत्यक्ष फील्डवर अशाच प्रकारे फॉर्म भरतील. खाली माहिती भरून चाचणी घ्या.'
                      : 'This is the exact interactive form field workers fill in the mobile app. Test filling it below.'}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setBuilderTab('designer')}
                    className="fb-btn-3d-secondary"
                    style={{
                      padding: '8px 16px',
                      fontSize: '12.5px',
                    }}
                  >
                    ← {isMr ? 'रचना बदला (Edit Form)' : 'Back to Designer'}
                  </button>
                </div>
              </div>

              {demoSubmitted && (
                <div
                  style={{
                    background: '#ecfdf5',
                    border: '1.5px solid #a7f3d0',
                    color: '#065f46',
                    padding: '14px 18px',
                    borderRadius: '10px',
                    marginBottom: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '750', fontSize: '13.5px' }}>
                    <span>✓</span>
                    <span>{isMr ? 'चाचणी यशस्वी! कार्यकर्त्यांना प्रत्यक्ष ॲपमध्ये हा फॉर्म असाच दिसेल.' : 'Demo submission recorded successfully!'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDemoSubmitted(false)}
                    style={{ border: 'none', background: 'transparent', color: '#047857', fontWeight: '800', cursor: 'pointer', fontSize: '12.5px' }}
                  >
                    {isMr ? 'पुन्हा भरा ↺' : 'Fill Again ↺'}
                  </button>
                </div>
              )}

              {/* DEMO FORM */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!demoForm.pramukh_name.trim()) {
                    alert(isMr ? 'कृपया कुटुंब प्रमुखाचे नाव प्रविष्ट करा.' : 'Please enter Family Head Name.');
                    return;
                  }
                  setDemoSubmitted(true);
                  showToast(isMr ? '✓ चाचणी फॉर्म सबमिट झाला!' : '✓ Demo form submitted successfully!');
                }}
                style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
              >
                {/* 1. FAMILY PRAMUKH & TOTAL MATDAR */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px 20px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                    <span style={{ fontSize: '18px' }}>🏠</span>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                      {isMr ? '१. कुटुंब प्रमुख व एकूण मतदार माहिती' : '1. Family Head & Voter Information'}
                    </h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#1e293b', marginBottom: '5px' }}>
                        {isMr ? 'कुटुंब प्रमुखाचे नाव (Family Pramukh Name) *' : 'Family Pramukh (Head of Family) Name *'}
                      </label>
                      <input
                        required
                        type="text"
                        placeholder={isMr ? 'उदा. रमेश ज्ञानदेव पाटील' : 'e.g. Ramesh Dnyandev Patil'}
                        value={demoForm.pramukh_name}
                        onChange={(e) => setDemoForm({ ...demoForm, pramukh_name: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '13.5px', background: '#ffffff' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '750', color: '#1e293b', marginBottom: '5px' }}>
                        {isMr ? 'कुटुंबातील एकूण मतदार संख्या (Total Matdar) *' : 'Total Voters in Household (Total Matdar) *'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={demoForm.total_matdar}
                        onChange={(e) => setDemoForm({ ...demoForm, total_matdar: Number(e.target.value) || 0 })}
                        style={{ width: '120px', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '14px', fontWeight: '800', background: '#ffffff', color: '#1d4ed8' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        {isMr ? 'मोबाईल क्रमांक (Mobile Number)' : 'Contact Mobile Number'}
                      </label>
                      <input
                        type="tel"
                        maxLength="10"
                        placeholder="98XXXXXXXX"
                        value={demoForm.mobile}
                        onChange={(e) => setDemoForm({ ...demoForm, mobile: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '5px' }}>
                        {isMr ? 'घर क्र. / पत्ता (Address)' : 'House No. / Address'}
                      </label>
                      <input
                        type="text"
                        placeholder={isMr ? 'उदा. घर क्र. १२, गणपती पेठ' : 'e.g. House No. 12, Main Road'}
                        value={demoForm.address}
                        onChange={(e) => setDemoForm({ ...demoForm, address: e.target.value })}
                        style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#ffffff' }}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. ALL MEMBERS */}
                <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px 20px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '18px' }}>👥</span>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                        {isMr ? '२. सर्व सदस्यांची नावे व माहिती (All Family Members)' : '2. All Family Members Information'}
                      </h3>
                      <span style={{ fontSize: '12px', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '999px', fontWeight: '800' }}>
                        {demoForm.members.length} {isMr ? 'सदस्य' : 'Members'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="fb-btn-3d-primary"
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                      }}
                    >
                      ➕ {isMr ? 'नवीन सदस्य जोडा (Add Member)' : 'Add Member'}
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {demoForm.members.map((member, index) => (
                      <div
                        key={member.id}
                        className="fb-card-3d"
                        style={{
                          borderRadius: '10px',
                          padding: '14px 16px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '13.5px' }}>
                            👤 {isMr ? `सदस्य #${index + 1}` : `Member #${index + 1}`}
                            {index === 0 && <span style={{ marginLeft: 6, fontSize: '11px', color: '#047857', background: '#ecfdf5', padding: '1px 6px', borderRadius: 4 }}>कुटुंब प्रमुख (Head)</span>}
                          </span>
                          {demoForm.members.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              className="fb-btn-3d-danger"
                              style={{
                                padding: '4px 10px',
                                fontSize: '11.5px',
                              }}
                            >
                              ✕ {isMr ? 'काढा' : 'Remove'}
                            </button>
                          )}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '12px' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                              {isMr ? 'पूर्ण नाव (Full Name) *' : 'Full Name *'}
                            </label>
                            <input
                              required
                              type="text"
                              placeholder={isMr ? 'उदा. सुप्रिया रमेश पाटील' : 'e.g. Supriya Ramesh Patil'}
                              value={member.full_name}
                              onChange={(e) => handleMemberChange(member.id, 'full_name', e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                              {isMr ? 'जन्मतारीख (DOB)' : 'Date of Birth (DOB)'}
                            </label>
                            <input
                              type="date"
                              value={member.dob}
                              onChange={(e) => handleMemberChange(member.id, 'dob', e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                              {isMr ? 'वय (Age) *' : 'Age *'}
                            </label>
                            <input
                              required
                              type="number"
                              min="0"
                              max="125"
                              placeholder="वय"
                              value={member.age}
                              onChange={(e) => handleMemberChange(member.id, 'age', e.target.value)}
                              style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '750' }}
                            />
                          </div>

                          <div>
                            <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                              {isMr ? 'मतदार ओळखपत्र आहे का नाही? *' : 'Has Voter ID Card? *'}
                            </label>
                            <select
                              value={member.has_voter_id}
                              onChange={(e) => handleMemberChange(member.id, 'has_voter_id', e.target.value)}
                              style={{
                                width: '100%',
                                boxSizing: 'border-box',
                                padding: '8px 10px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                fontSize: '13px',
                                fontWeight: '750',
                                background: member.has_voter_id === 'YES' ? '#ecfdf5' : '#fff1f2',
                                color: member.has_voter_id === 'YES' ? '#065f46' : '#9f1239',
                              }}
                            >
                              <option value="YES">✓ {isMr ? 'होय, आहे (Yes)' : 'Yes'}</option>
                              <option value="NO">✕ {isMr ? 'नाही (No)' : 'No'}</option>
                            </select>
                          </div>

                          {member.has_voter_id === 'YES' && (
                            <div>
                              <label style={{ display: 'block', fontSize: '12px', fontWeight: '750', color: '#334155', marginBottom: '4px' }}>
                                {isMr ? 'मतदार ओळखपत्र क्रमांक (Voter ID No)' : 'Voter ID Card Number'}
                              </label>
                              <input
                                type="text"
                                placeholder="MH/43/282/XXXXXX"
                                value={member.voter_id_no}
                                onChange={(e) => handleMemberChange(member.id, 'voter_id_no', e.target.value.toUpperCase())}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'monospace' }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. CUSTOM QUESTIONS */}
                {customQuestions.length > 0 && (
                  <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px 20px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                      <span style={{ fontSize: '18px' }}>❓</span>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                        {isMr ? '३. अतिरिक्त प्रश्न (Custom Questions)' : '3. Additional Survey Questions'}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {customQuestions.map((q, idx) => {
                        const qTitle = isMr ? q.title_mr : (q.title_en || q.title_mr);
                        const ansValue = demoForm.customAnswers[q.id];

                        return (
                          <div key={q.id} style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px 16px' }}>
                            <div style={{ marginBottom: '8px' }}>
                              <span style={{ fontWeight: '800', color: '#1e3a8a', fontSize: '13.5px', marginRight: '6px' }}>
                                प्रश्न {idx + 1}.
                              </span>
                              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{qTitle}</strong>
                              {q.required && <span style={{ color: '#dc2626', marginLeft: '4px', fontWeight: '800' }}>*</span>}
                            </div>

                            {q.type === 'single_choice' && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {q.options.map((opt, oIdx) => (
                                  <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                                    <input
                                      type="radio"
                                      name={`demo_q_${q.id}`}
                                      value={opt}
                                      checked={ansValue === opt}
                                      onChange={() => setDemoForm((prev) => ({ ...prev, customAnswers: { ...prev.customAnswers, [q.id]: opt } }))}
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {q.type === 'multi_choice' && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {q.options.map((opt, oIdx) => {
                                  const selectedArr = Array.isArray(ansValue) ? ansValue : [];
                                  const isChecked = selectedArr.includes(opt);
                                  return (
                                    <label key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => {
                                          const next = isChecked ? selectedArr.filter((item) => item !== opt) : [...selectedArr, opt];
                                          setDemoForm((prev) => ({ ...prev, customAnswers: { ...prev.customAnswers, [q.id]: next } }));
                                        }}
                                      />
                                      <span>{opt}</span>
                                    </label>
                                  );
                                })}
                              </div>
                            )}

                            {q.type === 'yes_no' && (
                              <div style={{ display: 'flex', gap: '12px' }}>
                                {['होय (Yes)', 'नाही (No)'].map((opt) => (
                                  <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#334155', cursor: 'pointer' }}>
                                    <input
                                      type="radio"
                                      name={`demo_q_${q.id}`}
                                      value={opt}
                                      checked={ansValue === opt}
                                      onChange={() => setDemoForm((prev) => ({ ...prev, customAnswers: { ...prev.customAnswers, [q.id]: opt } }))}
                                    />
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            )}

                            {q.type === 'rating' && (
                              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    type="button"
                                    key={star}
                                    onClick={() => setDemoForm((prev) => ({ ...prev, customAnswers: { ...prev.customAnswers, [q.id]: star } }))}
                                    style={{
                                      border: '1px solid #cbd5e1',
                                      background: Number(ansValue) >= star ? '#fef08a' : '#ffffff',
                                      color: Number(ansValue) >= star ? '#ca8a04' : '#94a3b8',
                                      fontSize: '18px',
                                      borderRadius: '6px',
                                      padding: '4px 10px',
                                      cursor: 'pointer',
                                    }}
                                  >
                                    ★
                                  </button>
                                ))}
                                {ansValue && <span style={{ fontSize: '12px', color: '#64748b' }}>{ansValue}/5 Stars</span>}
                              </div>
                            )}

                            {q.type === 'text' && (
                              <input
                                type="text"
                                placeholder={isMr ? 'येथे उत्तर लिहा...' : 'Type answer here...'}
                                value={ansValue || ''}
                                onChange={(e) => setDemoForm((prev) => ({ ...prev, customAnswers: { ...prev.customAnswers, [q.id]: e.target.value } }))}
                                style={{ width: '100%', maxWidth: '480px', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                              />
                            )}

                            {q.type === 'textarea' && (
                              <textarea
                                rows="3"
                                placeholder={isMr ? 'येथे सविस्तर मत नोंदवा...' : 'Enter feedback...'}
                                value={ansValue || ''}
                                onChange={(e) => setDemoForm((prev) => ({ ...prev, customAnswers: { ...prev.customAnswers, [q.id]: e.target.value } }))}
                                style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="submit"
                    className="fb-btn-3d-publish"
                    style={{
                      padding: '12px 28px',
                      fontSize: '14px',
                    }}
                  >
                    <span>✓</span>
                    <span>{isMr ? 'चाचणी फॉर्म सबमिट करा (Submit Demo Form)' : 'Submit Demo Form (Test)'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Fallback when builder is active without any active form or project */}
      {activeView === 'builder' && !selectedProject && !isNewForm && !editingPublishedForm && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1.5px dashed #cbd5e1',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📝</div>
          <h2 style={{ fontSize: '18px', fontWeight: '850', color: '#0f172a', margin: '0 0 8px' }}>
            {isMr ? 'नवीन सर्व्हे फॉर्म तयार करा' : 'Create New Survey Form'}
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748b', maxWidth: '520px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            {isMr
              ? 'नवीन सर्व्हे फॉर्म तयार करा जो थेट published_forms डेटाबेस टेबलमध्ये सेव्ह होईल आणि कार्यकर्त्यांसाठी उपलब्ध होईल.'
              : 'Create a survey form that saves directly into the `published_forms` database table and activates for field workers.'}
          </p>
          <button
            type="button"
            onClick={handleCreateNewForm}
            className="fb-btn-3d-primary"
            style={{
              padding: '12px 30px',
              fontSize: '14px',
            }}
          >
            ➕ {isMr ? 'नवीन फॉर्म तयार करा (+ Create New Form)' : '+ Create New Form'}
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW 3: OTHER PROJECT FORMS GALLERY                            */}
      {/* ============================================================== */}
      {activeView === 'all_forms' && (
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '22px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                📂 {isMr ? 'सर्व प्रकल्प फॉर्म यादी (Other Project Forms)' : 'All Project Forms'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
                {isMr
                  ? 'कोणत्याही प्रकल्पासाठी फॉर्म तयार करा किंवा थेट कार्यकर्त्यांसाठी प्रकाशित करा.'
                  : 'Select any created project to configure, design, or publish forms.'}
              </p>
            </div>

            <div style={{ position: 'relative', width: '280px' }}>
              <input
                type="text"
                placeholder={isMr ? 'प्रकल्प शोधा...' : 'Search project...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '8px 12px 8px 32px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                }}
              />
              <span style={{ position: 'absolute', left: 10, top: 9, color: '#94a3b8', fontSize: '13px' }}>🔍</span>
            </div>
          </div>

          {loadingProjects ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
              <span style={{ fontSize: '28px' }}>⏳</span>
              <p style={{ marginTop: '8px', fontWeight: '750' }}>{isMr ? 'प्रकल्प लोड होत आहेत...' : 'Loading project forms...'}</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1.5px dashed #cbd5e1',
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📂</div>
              <div style={{ fontWeight: '750', color: '#334155', fontSize: '15px' }}>
                {isMr ? 'कोणतेही प्रकल्प फॉर्म उपलब्ध नाहीत.' : 'No project forms found.'}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '18px',
              }}
            >
              {filteredProjects.map((project) => {
                const scopeObj = SCOPES.find((s) => s.value === project.geographic_scope);
                const scopeTitle = isMr
                  ? (scopeObj?.title_mr || project.geographic_scope || 'सर्वसाधारण')
                  : (scopeObj?.title || project.geographic_scope || 'General');
                const memberCount = project.assigned_member_count || project.assigned_members_count || 0;
                const isSelected = selectedProject?.uuid === project.uuid;

                // Check if already published
                const publishedRecord = publishedFormsList.find((f) => f.project_uuid === project.uuid);
                const isPublished = Boolean(publishedRecord);

                return (
                  <div
                    key={project.uuid}
                    style={{
                      background: '#ffffff',
                      border: isSelected ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: '16px',
                      boxShadow: isSelected ? '0 6px 16px rgba(37,99,235,0.12)' : '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '22px' }}>📁</span>
                          <strong style={{ fontSize: '16px', color: '#0f172a', fontWeight: '850' }}>
                            {project.name}
                          </strong>
                        </div>

                        <span
                          style={{
                            background: isPublished ? '#ecfdf5' : '#fffbeb',
                            color: isPublished ? '#047857' : '#b45309',
                            border: `1px solid ${isPublished ? '#a7f3d0' : '#fde68a'}`,
                            fontSize: '11px',
                            fontWeight: '800',
                            padding: '3px 8px',
                            borderRadius: '999px',
                          }}
                        >
                          ● {isPublished ? (isMr ? 'प्रकाशित' : 'PUBLISHED') : (isMr ? 'मसुदा' : 'DRAFT')}
                        </span>
                      </div>

                      {project.description && (
                        <p style={{ margin: '0 0 12px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
                          {project.description}
                        </p>
                      )}

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                        <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '750' }}>
                          📍 {scopeTitle}
                        </span>
                        <span style={{ background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: '6px', fontSize: '11.5px', fontWeight: '650' }}>
                          👥 {memberCount} {isMr ? 'कार्यकर्ते' : 'Workers'}
                        </span>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569', lineHeight: 1.4 }}>
                        ✓ कुटुंब प्रमुख • एकूण मतदार • सर्व सदस्य माहिती (DOB, वय, Voter ID)
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button
                        type="button"
                        onClick={() => handleSelectProject(project, 'builder')}
                        className="fb-btn-3d-primary"
                        style={{
                          padding: '10px 14px',
                          fontSize: '13px',
                          justifyContent: 'center',
                        }}
                      >
                        <span>✏️</span>
                        <span>{isMr ? 'फॉर्म तयार करा' : 'Create Form'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedProject(project);
                          loadProjectFormConfig(project);
                          setShowPublishModal(true);
                        }}
                        className={isPublished ? 'fb-btn-3d-publish' : 'fb-btn-3d-secondary'}
                        style={{
                          padding: '10px 14px',
                          fontSize: '13px',
                          justifyContent: 'center',
                        }}
                      >
                        <span>🚀</span>
                        <span>{isMr ? 'प्रकाशित करा' : 'Publish'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MANAGE USER ACCESS MODAL (`published_form_users`)           */}
      {/* ============================================================== */}
      {showUserAccessModal && selectedPublishedForm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(680px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>
                  👥 {isMr ? 'कार्यकर्त्यांना ॲक्सेस अधिकार द्या (Manage User Access)' : 'Manage User Access for Published Form'}
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  📋 {selectedPublishedForm.form_title} • ({selectedAccessUserIds.length} {isMr ? 'कार्यकर्ते निवडले' : 'users selected'})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowUserAccessModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            {/* Quick Action Toolbar & Search */}
            <div style={{ padding: '12px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder={isMr ? 'कार्यकर्ता नाव, फोन किंवा ईमेलने शोधा...' : 'Search user by name, phone or email...'}
                value={accessUserSearch}
                onChange={(e) => setAccessUserSearch(e.target.value)}
                style={{ flex: 1, minWidth: '220px', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />

              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  onClick={handleSelectAllUsers}
                  className="fb-btn-3d-primary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                  }}
                >
                  ✓ {isMr ? 'सर्व निवडा (Select All)' : 'Select All'}
                </button>

                <button
                  type="button"
                  onClick={handleDeselectAllUsers}
                  className="fb-btn-3d-secondary"
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                  }}
                >
                  ✕ {isMr ? 'सर्व काढा (Clear All)' : 'Clear All'}
                </button>
              </div>
            </div>

            {/* User Checkbox List */}
            <div style={{ padding: '16px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {loadingAccessUsers ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  {isMr ? 'कार्यकर्ते लोड होत आहेत...' : 'Loading users list...'}
                </div>
              ) : accessModalUsers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                  {isMr ? 'कोणतेही वापरकर्ते उपलब्ध नाहीत.' : 'No active users found.'}
                </div>
              ) : (
                accessModalUsers
                  .filter((u) => {
                    if (!accessUserSearch.trim()) return true;
                    const q = accessUserSearch.toLowerCase().trim();
                    return u.full_name?.toLowerCase().includes(q) || u.phone?.includes(q) || u.email?.toLowerCase().includes(q);
                  })
                  .map((u) => {
                    const isChecked = selectedAccessUserIds.includes(u.id);
                    return (
                      <div
                        key={u.id}
                        onClick={() => handleToggleAccessUser(u.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          border: isChecked ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          background: isChecked ? '#eff6ff' : '#ffffff',
                          cursor: 'pointer',
                          transition: 'all 0.1s ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => { }}
                            style={{ width: '17px', height: '17px', cursor: 'pointer' }}
                          />
                          <div>
                            <strong style={{ fontSize: '14px', color: '#0f172a' }}>{u.full_name}</strong>
                            <div style={{ fontSize: '12px', color: '#64748b' }}>
                              📱 {u.phone || 'No phone'} {u.email ? `• ✉️ ${u.email}` : ''}
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            fontSize: '11.5px',
                            fontWeight: '750',
                            padding: '3px 10px',
                            borderRadius: '999px',
                            background: isChecked ? '#dbeafe' : '#f1f5f9',
                            color: isChecked ? '#1d4ed8' : '#64748b',
                          }}
                        >
                          {isChecked ? (isMr ? '✓ ॲक्सेस दिला' : 'Access Granted') : (isMr ? '+ ॲक्सेस द्या' : 'Grant Access')}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', color: '#475569', fontWeight: '750' }}>
                {selectedAccessUserIds.length} {isMr ? 'कार्यकर्त्यांना ॲक्सेस मिळेल' : 'workers will have access'}
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowUserAccessModal(false)}
                  className="fb-btn-3d-secondary"
                  style={{
                    padding: '9px 18px',
                    fontSize: '13px',
                  }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>

                <button
                  type="button"
                  disabled={savingUserAccess}
                  onClick={handleSaveUserAccess}
                  className="fb-btn-3d-primary"
                  style={{
                    padding: '9px 22px',
                    fontSize: '13.5px',
                  }}
                >
                  {savingUserAccess ? (isMr ? 'सेव्ह होत आहे...' : 'Saving...') : (isMr ? '💾 अधिकार सेव्ह करा (Save Access)' : 'Save Access')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 5. VIEW FULL FORM FORMAT MODAL (SCHEMA PREVIEW)                */}
      {/* ============================================================== */}
      {showFormatModal && formatModalForm && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(650px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '850', color: '#0f172a' }}>
                  📋 {isMr ? 'फॉर्म फॉरमॅट तपशील (Form Schema Details)' : 'Published Form Schema Format'}
                </h3>
                <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                  {formatModalForm.form_title} • 📁 {formatModalForm.project_name} (v{formatModalForm.version || 1})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowFormatModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Default Voter Fields */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#1e3a8a' }}>
                  🏠 १. डीफॉल्ट मतदार नोंदणी फील्ड्स (Mandatory Voter Fields):
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <strong>👤 कुटुंब प्रमुखाचे नाव</strong> (Text)
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <strong>🗳️ एकूण मतदार संख्या</strong> (Number, Computed)
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <strong>👥 सर्व सदस्यांची नावे</strong> (Members List)
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <strong>📅 जन्मतारीख व वय</strong> (DOB & Auto Age)
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <strong>🪪 मतदार ओळखपत्र आहे का नाही</strong> (Yes/No + ID)
                  </div>
                  <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12.5px' }}>
                    <strong>📍 पत्ता व मोबाईल क्रमांक</strong> (Contact)
                  </div>
                </div>
              </div>

              {/* Custom Questions */}
              <div>
                <h4 style={{ margin: '0 0 10px', fontSize: '14px', fontWeight: '800', color: '#1e3a8a' }}>
                  ❓ २. अतिरिक्त सानुकूल प्रश्न (Custom Questions) ({formatModalForm.custom_questions?.length || 0}):
                </h4>
                {(!formatModalForm.custom_questions || formatModalForm.custom_questions.length === 0) ? (
                  <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', color: '#64748b', fontSize: '13px' }}>
                    {isMr ? 'या फॉर्ममध्ये कोणतेही अतिरिक्त प्रश्न जोडलेले नाहीत.' : 'No custom questions in this form.'}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {formatModalForm.custom_questions.map((q, idx) => (
                      <div key={q.id || idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '800', color: '#1d4ed8' }}>Q{idx + 1}.</span>
                          <strong style={{ fontSize: '13.5px' }}>{q.title_mr || q.title_en}</strong>
                          {q.required && <span style={{ fontSize: '10.5px', background: '#fee2e2', color: '#dc2626', padding: '1px 5px', borderRadius: '4px', fontWeight: '800' }}>अनिवार्य</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                          प्रकार: <strong>{q.type}</strong> {q.options && q.options.length > 0 ? `• पर्याय: ${q.options.join(', ')}` : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowFormatModal(false)}
                className="fb-btn-3d-secondary"
                style={{
                  padding: '9px 20px',
                  fontSize: '13px',
                }}
              >
                {isMr ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. PUBLISH CONFIRMATION MODAL                                  */}
      {/* ============================================================== */}
      {showPublishModal && selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(520px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '24px' }}>🚀</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '850', color: '#0f172a' }}>
                  {isMr ? 'फॉर्म प्रकाशित करा (Publish Form)' : 'Publish Survey Form'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: '#475569', lineHeight: 1.5 }}>
              {isMr
                ? `तुम्ही "${selectedProject.name}" या प्रकल्पासाठीचा सर्व्हे फॉर्म प्रकाशित करत आहात. हा फॉर्म 'published_forms' टेबलमध्ये सेव्ह होईल आणि सर्व संबंधित कार्यकर्त्यांना थेट ॲक्सेस मिळेल.`
                : `You are publishing the survey form for "${selectedProject.name}". It will be saved into the \`published_forms\` table and eligible workers will automatically receive access.`}
            </p>

            {/* Option for giving the name of form in Publish Modal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px' }}>
              <strong style={{ fontSize: '13px', color: '#1e3a8a' }}>
                ✏️ {isMr ? 'फॉर्मचे नाव निश्चित करा (Set Form Name):' : 'Confirm Form Name:'}
              </strong>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                  {isMr ? 'इंग्रजी नाव (English Name) *' : 'Form Name (English) *'}
                </label>
                <input
                  type="text"
                  value={formTitleEn}
                  onChange={(e) => setFormTitleEn(e.target.value)}
                  placeholder={selectedProject ? `${selectedProject.name} Survey Form` : 'Form Name'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #94a3b8',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    background: '#ffffff',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '800', color: '#334155', marginBottom: '4px' }}>
                  {isMr ? 'मराठी नाव (Marathi Name)' : 'Form Name (Marathi)'}
                </label>
                <input
                  type="text"
                  value={formTitleMr}
                  onChange={(e) => setFormTitleMr(e.target.value)}
                  placeholder={selectedProject ? `${selectedProject.name} सर्व्हे फॉर्म` : 'फॉर्मचे नाव'}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid #94a3b8',
                    fontSize: '13.5px',
                    fontWeight: '600',
                    background: '#ffffff',
                  }}
                />
              </div>
            </div>

            {/* Publication Summary Box */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px 16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: '750', color: '#1e293b', marginBottom: '8px' }}>
                📋 {isMr ? 'फॉर्म तपशील सारांश:' : 'Form Summary:'}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', color: '#475569' }}>
                <div>📁 <strong>{isMr ? 'प्रकल्प:' : 'Project:'}</strong> {selectedProject.name}</div>
                <div>✓ <strong>{isMr ? 'डीफॉल्ट माहिती:' : 'Default Fields:'}</strong> कुटुंब प्रमुख, एकूण मतदार, सर्व सदस्य (DOB, वय, Voter ID)</div>
                <div>❓ <strong>{isMr ? 'अतिरिक्त प्रश्न:' : 'Custom Questions:'}</strong> {customQuestions.length} {isMr ? 'प्रश्न' : 'Questions'}</div>
                <div>👥 <strong>{isMr ? 'कार्यकर्ते ॲक्सेस:' : 'Eligible Workers:'}</strong> {selectedProject.assigned_member_count || selectedProject.assigned_members_count || 0} {isMr ? 'कार्यकर्ते' : 'Workers'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="fb-btn-3d-secondary"
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                }}
              >
                {isMr ? 'रद्द करा (Cancel)' : 'Cancel'}
              </button>
              <button
                type="button"
                disabled={publishingForm}
                onClick={handleConfirmPublish}
                className="fb-btn-3d-publish"
                style={{
                  padding: '9px 24px',
                  fontSize: '13.5px',
                }}
              >
                <span>🚀</span>
                <span>{publishingForm ? (isMr ? 'प्रकाशित होत आहे...' : 'Publishing...') : (isMr ? 'होय, फॉर्म प्रकाशित करा' : 'Confirm & Publish')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 7. ADD QUESTION MODAL                                          */}
      {/* ============================================================== */}
      {showAddQuestionModal && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: 'min(560px, 96vw)',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>➕</span>
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#0f172a' }}>
                  {isMr ? 'नवीन प्रश्न जोडा (Add New Question)' : 'Add New Question'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddQuestionModal(false)}
                style={{ border: 'none', background: 'transparent', fontSize: '18px', color: '#64748b', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddQuestion} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#1e293b', marginBottom: '5px' }}>
                  {isMr ? 'प्रश्नाचे नाव (मराठीत) *' : 'Question Title (Marathi) *'}
                </label>
                <input
                  required
                  type="text"
                  placeholder={isMr ? 'उदा. परिसरातील पिण्याच्या पाण्याची सोय कशी आहे?' : 'Question in Marathi'}
                  value={newQuestion.title_mr}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#475569', marginBottom: '5px' }}>
                  {isMr ? 'प्रश्नाचे नाव (इंग्रजीत - ऐच्छिक)' : 'Question Title (English - Optional)'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. How is the drinking water supply in your area?"
                  value={newQuestion.title_en}
                  onChange={(e) => setNewQuestion({ ...newQuestion, title_en: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#1e293b', marginBottom: '5px' }}>
                  {isMr ? 'प्रश्नाचा प्रकार (Question Type) *' : 'Question Type *'}
                </label>
                <select
                  value={newQuestion.type}
                  onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontWeight: '700' }}
                >
                  <option value="single_choice">🔘 {isMr ? 'एकच पर्याय (Single Choice Radio)' : 'Single Choice (Radio)'}</option>
                  <option value="multi_choice">☑️ {isMr ? 'अनेक पर्याय (Multiple Choice Checkbox)' : 'Multiple Choice (Checkbox)'}</option>
                  <option value="yes_no">👍 {isMr ? 'होय / नाही (Yes / No)' : 'Yes / No'}</option>
                  <option value="rating">⭐ {isMr ? '१ ते ५ स्टार रेटिंग (Rating)' : '1 to 5 Star Rating'}</option>
                  <option value="text">✍️ {isMr ? 'लहान मजकूर उत्तर (Short Text)' : 'Short Text'}</option>
                  <option value="textarea">📝 {isMr ? 'सविस्तर मजकूर / अभिप्राय (Paragraph)' : 'Paragraph / Textarea'}</option>
                </select>
              </div>

              {(newQuestion.type === 'single_choice' || newQuestion.type === 'multi_choice') && (
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '750', color: '#1e293b', marginBottom: '5px' }}>
                    {isMr ? 'पर्याय (स्वल्पविरामाने वेगळे करा) *' : 'Options (Comma separated) *'}
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="उदा. उत्तम, समाधानकारक, असमाधानकारक"
                    value={newQuestion.options_text}
                    onChange={(e) => setNewQuestion({ ...newQuestion, options_text: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setNewQuestion({ ...newQuestion, options_text: 'होय, नाही, माहित नाही' })}
                      className="fb-btn-3d-secondary"
                      style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    >
                      + होय, नाही, माहित नाही
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewQuestion({ ...newQuestion, options_text: 'उत्तम, समाधानकारक, असमाधानकारक' })}
                      className="fb-btn-3d-secondary"
                      style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    >
                      + उत्तम, समाधानकारक, असमाधानकारक
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', color: '#1e293b' }}>
                  <input
                    type="checkbox"
                    checked={newQuestion.required}
                    onChange={(e) => setNewQuestion({ ...newQuestion, required: e.target.checked })}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  <span>{isMr ? 'हा प्रश्न भरण्यासाठी अनिवार्य (Mandatory) करा' : 'Mark question as mandatory (Required)'}</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="fb-btn-3d-secondary"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="fb-btn-3d-primary"
                  style={{ padding: '9px 22px', fontSize: '13px' }}
                >
                  ✓ {isMr ? 'फॉर्ममध्ये जोडा' : 'Add to Form'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HouseholdSurveyForm;
