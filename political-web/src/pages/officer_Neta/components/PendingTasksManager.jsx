import React, { useState, useEffect } from 'react';
import { netaApi } from '../api/netaApi';

export default function PendingTasksManager({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all'); // all, pending, in_progress, completed, urgent
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title_mr: '',
    category_mr: 'नागरी समस्या निवारण',
    assigned_to: '',
    priority: 'high',
    deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    notes_mr: '',
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (search.trim()) params.search = search.trim();

      const res = await netaApi.getTasks(params);
      if (res.success) {
        setTasks(res.data);
      }
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTasks();
    }, 250);
    return () => clearTimeout(timer);
  }, [filterStatus, search]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...newTaskForm,
        title_en: newTaskForm.title_mr,
        category_en: newTaskForm.category_mr,
        notes_en: newTaskForm.notes_mr,
      };
      const res = await netaApi.createTask(payload);
      if (res.success) {
        setShowAddModal(false);
        setNewTaskForm({
          title_mr: '',
          category_mr: 'नागरी समस्या निवारण',
          assigned_to: '',
          priority: 'high',
          deadline: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
          notes_mr: '',
        });
        await fetchTasks();
      }
    } catch (err) {
      console.error('Failed to create task:', err);
      alert(err?.message || 'टास्क तयार करण्यात त्रुटी आली.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await netaApi.updateTaskStatus(id, newStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            ⚡ {isMr ? 'प्रलंबित कामे व पाठपुरावा' : 'Pending Tasks & Follow-ups'}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'मतदार समस्या, विकासकामे व शासकीय योजनांची पाठपुरावा प्रणाली'
              : 'Direct database tracking for citizen grievance redressals, civic issues, and follow-ups.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            boxShadow: '0 4px 10px rgba(234, 88, 12, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>＋</span> {isMr ? 'नवीन काम जोडा' : 'Add New Task'}
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          padding: '16px 20px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label_mr: `सर्व कामे (${tasks.length})`, label_en: `All (${tasks.length})` },
            {
              key: 'urgent',
              label_mr: `🚨 अतितात्काळ`,
              label_en: `🚨 Urgent`,
            },
            {
              key: 'pending',
              label_mr: `प्रलंबित`,
              label_en: `Pending`,
            },
            {
              key: 'in_progress',
              label_mr: `प्रगतीपथावर`,
              label_en: `In Progress`,
            },
            {
              key: 'completed',
              label_mr: `पूर्ण झालेले`,
              label_en: `Completed`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              style={{
                padding: '7px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                border: filterStatus === tab.key ? 'none' : '1px solid #cbd5e1',
                background: filterStatus === tab.key ? (tab.key === 'urgent' ? '#dc2626' : '#1e3a8a') : '#ffffff',
                color: filterStatus === tab.key ? '#ffffff' : '#475569',
              }}
            >
              {isMr ? tab.label_mr : tab.label_en}
            </button>
          ))}
        </div>

        <div style={{ minWidth: '240px' }}>
          <input
            type="text"
            placeholder={isMr ? 'काम किंवा नाव शोधा...' : 'Search task or assignee...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
            }}
          />
        </div>
      </div>

      {/* Tasks Table / Cards */}
      {loading ? (
        <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', color: '#1e3a8a', fontWeight: '700' }}>
          ⏳ {isMr ? 'डेटाबेसमधून प्रलंबित कामे लोड होत आहेत...' : 'Loading tasks from database...'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {tasks.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#94a3b8' }}>
              {isMr ? 'या फिल्टरमध्ये कोणतीही कामे उपलब्ध नाहीत.' : 'No tasks match your selected filter.'}
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  background: '#ffffff',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  border:
                    task.priority === 'urgent' && task.status !== 'completed'
                      ? '1px solid #fca5a5'
                      : '1px solid #e2e8f0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span
                        style={{
                          background: '#eff6ff',
                          color: '#1d4ed8',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {isMr ? task.category_mr : (task.category_en || task.category_mr)}
                      </span>
                      <span
                        style={{
                          background:
                            task.priority === 'urgent'
                              ? '#fee2e2'
                              : task.priority === 'high'
                              ? '#ffedd5'
                              : '#f1f5f9',
                          color:
                            task.priority === 'urgent'
                              ? '#991b1b'
                              : task.priority === 'high'
                              ? '#c2410c'
                              : '#475569',
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {task.priority === 'urgent'
                          ? isMr
                            ? '🚨 अतितात्काळ'
                            : '🚨 Urgent'
                          : task.priority === 'high'
                          ? isMr
                            ? '⚡ उच्च प्राधान्य'
                            : '⚡ High'
                          : isMr
                          ? 'सामान्य'
                          : 'Medium'}
                      </span>
                    </div>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: '15px',
                        fontWeight: '800',
                        color: task.status === 'completed' ? '#94a3b8' : '#0f172a',
                        textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                      }}
                    >
                      {isMr ? task.title_mr : (task.title_en || task.title_mr)}
                    </h3>
                  </div>

                  {/* Status Selector Dropdown */}
                  <select
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      border: '1px solid #cbd5e1',
                      background:
                        task.status === 'completed'
                          ? '#dcfce7'
                          : task.status === 'in_progress'
                          ? '#fef9c3'
                          : '#f8fafc',
                      color:
                        task.status === 'completed'
                          ? '#15803d'
                          : task.status === 'in_progress'
                          ? '#854d0e'
                          : '#334155',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="pending">⏳ {isMr ? 'प्रलंबित' : 'Pending'}</option>
                    <option value="in_progress">⚙️ {isMr ? 'प्रगतीपथावर' : 'In Progress'}</option>
                    <option value="completed">✓ {isMr ? 'पूर्ण झाले' : 'Completed'}</option>
                  </select>
                </div>

                {/* Task Details and Meta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', fontSize: '12px', color: '#64748b' }}>
                  <div>
                    👤 <strong>{isMr ? 'जबाबदार:' : 'Assigned:'}</strong> {task.assigned_to}
                  </div>
                  <div>
                    📅 <strong>{isMr ? 'अंतिम तारीख:' : 'Deadline:'}</strong>{' '}
                    <span style={{ color: '#ea580c', fontWeight: '700' }}>{task.deadline}</span>
                  </div>
                </div>

                {task.notes_mr && (
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', fontSize: '12px', color: '#334155', borderLeft: '3px solid #cbd5e1' }}>
                    {isMr ? task.notes_mr : (task.notes_en || task.notes_mr)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddModal && (
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
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              maxWidth: '540px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>
                ⚡ {isMr ? 'नवीन काम जोडा (DB Save)' : 'Add New Task to Database'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'कार्याचे नाव / समस्या *' : 'Task Title / Issue *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isMr ? 'उदा. विश्रामबाग कॉलेज समोर पथदिवे बसवणे' : 'Enter task title'}
                  value={newTaskForm.title_mr}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, title_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'विभाग / श्रेणी' : 'Category'}
                  </label>
                  <select
                    value={newTaskForm.category_mr}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, category_mr: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="नागरी समस्या निवारण">{isMr ? 'नागरी समस्या निवारण' : 'Civic Grievances'}</option>
                    <option value="शासकीय योजना पाठपुरावा">{isMr ? 'शासकीय योजना पाठपुरावा' : 'Government Scheme Followup'}</option>
                    <option value="बूथ बांधणी व कव्हरेज">{isMr ? 'बूथ बांधणी व कव्हरेज' : 'Booth Management'}</option>
                    <option value="मतदार यादी पुनरीक्षण">{isMr ? 'मतदार यादी पुनरीक्षण' : 'Voter List Verification'}</option>
                    <option value="प्रचार व सोशल मीडिया">{isMr ? 'प्रचार व सोशल मीडिया' : 'Campaign & Social Media'}</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'प्राधान्य' : 'Priority'}
                  </label>
                  <select
                    value={newTaskForm.priority}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, priority: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  >
                    <option value="urgent">{isMr ? '🚨 अतितात्काळ' : '🚨 Urgent'}</option>
                    <option value="high">{isMr ? '⚡ उच्च' : '⚡ High'}</option>
                    <option value="medium">{isMr ? 'सामान्य' : 'Medium'}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'जबाबदार अधिकारी *' : 'Assigned Officer *'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={isMr ? 'उदा. सचिन पाटील' : 'Name of officer'}
                    value={newTaskForm.assigned_to}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, assigned_to: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                    {isMr ? 'अंतिम मुदत *' : 'Deadline *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={newTaskForm.deadline}
                    onChange={(e) => setNewTaskForm({ ...newTaskForm, deadline: e.target.value })}
                    style={{ width: '100%', boxSizing: 'border-box', padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '4px' }}>
                  {isMr ? 'सविस्तर सूचना व टिपण' : 'Notes / Instructions'}
                </label>
                <textarea
                  rows={3}
                  placeholder={isMr ? 'कार्याबद्दल अतिरिक्त माहिती किंवा फोन नंबर...' : 'Instructions...'}
                  value={newTaskForm.notes_mr}
                  onChange={(e) => setNewTaskForm({ ...newTaskForm, notes_mr: e.target.value })}
                  style={{ width: '100%', boxSizing: 'border-box', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', fontFamily: 'inherit' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#475569', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isMr ? 'रद्द करा' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: '#ea580c', color: '#ffffff', fontWeight: '700', cursor: submitting ? 'wait' : 'pointer' }}
                >
                  {submitting ? 'सेव्ह होत आहे...' : (isMr ? 'काम सेव्ह करा (Save to DB)' : 'Save Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
