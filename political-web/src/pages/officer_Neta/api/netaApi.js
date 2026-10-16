import apiClient from '../../../api/axios';

/**
 * Neta & Officer Command API Client
 * Interacts with backend MySQL tables (neta_*)
 */
export const netaApi = {
  // 1. संपूर्ण क्षेत्राचा Dashboard
  getOverview: async () => {
    const res = await apiClient.get('/neta/overview');
    return res.data;
  },

  // 2. जिल्हा/विधानसभा/तालुका/गाव/बूथनिहाय Progress
  getBooths: async (params = {}) => {
    const res = await apiClient.get('/neta/booths', { params });
    return res.data;
  },

  getGeographyFilters: async (params = {}) => {
    const res = await apiClient.get('/neta/geography-filters', { params });
    return res.data;
  },

  // 3. कार्यकर्त्यांचे काम व Performance Dashboard
  getKaryakartas: async (params = {}) => {
    const res = await apiClient.get('/neta/karyakartas', { params });
    return res.data;
  },

  updateKaryakarta: async (userId, payload) => {
    const res = await apiClient.put(`/neta/karyakartas/${userId}`, payload);
    return res.data;
  },

  createKaryakarta: async (payload) => {
    const res = await apiClient.post('/neta/karyakartas', payload);
    return res.data;
  },

  getRoles: async () => {
    const res = await apiClient.get('/neta/roles');
    return res.data;
  },

  assignKaryakartaTask: async (workerId, taskNote) => {
    const res = await apiClient.post(`/neta/karyakartas/${workerId}/task`, { task_note: taskNote });
    return res.data;
  },

  // 4. बैठका व दौरे
  getMeetings: async (params = {}) => {
    const res = await apiClient.get('/neta/meetings', { params });
    return res.data;
  },

  createMeeting: async (payload) => {
    const res = await apiClient.post('/neta/meetings', payload);
    return res.data;
  },

  updateMeetingStatus: async (meetingId, status) => {
    const res = await apiClient.patch(`/neta/meetings/${meetingId}/status`, { status });
    return res.data;
  },

  // 5. Pending Tasks
  getTasks: async (params = {}) => {
    const res = await apiClient.get('/neta/tasks', { params });
    return res.data;
  },

  createTask: async (payload) => {
    const res = await apiClient.post('/neta/tasks', payload);
    return res.data;
  },

  updateTaskStatus: async (taskId, status) => {
    const res = await apiClient.patch(`/neta/tasks/${taskId}/status`, { status });
    return res.data;
  },

  // 6. महत्त्वाच्या Reports
  getReports: async () => {
    const res = await apiClient.get('/neta/reports');
    return res.data;
  },

  // 7. Field Updates
  getFieldUpdates: async (params = {}) => {
    const res = await apiClient.get('/neta/field-updates', { params });
    return res.data;
  },

  createFieldUpdate: async (payload) => {
    const res = await apiClient.post('/neta/field-updates', payload);
    return res.data;
  },

  // 8. Notifications & Alerts
  getNotifications: async (params = {}) => {
    const res = await apiClient.get('/neta/notifications', { params });
    return res.data;
  },

  broadcastNotification: async (payload) => {
    const res = await apiClient.post('/neta/notifications/broadcast', payload);
    return res.data;
  },

  toggleNotificationRead: async (alertId) => {
    const res = await apiClient.patch(`/neta/notifications/${alertId}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await apiClient.post('/neta/notifications/mark-all-read');
    return res.data;
  },

  // 9. आवश्यकतेनुसार Data Export
  getExportData: async (type) => {
    const res = await apiClient.get(`/neta/export/${type}`);
    return res.data;
  },

  // 10. सिटिझन CRM ३६०° (Citizen 360 Contact Management)
  getCrmCitizens: async (params = {}) => {
    const res = await apiClient.get('/neta/crm/citizens', { params });
    return res.data;
  },

  getCrmCitizen: async (id) => {
    const res = await apiClient.get(`/neta/crm/citizens/${id}`);
    return res.data;
  },

  createCrmCitizen: async (payload) => {
    const res = await apiClient.post('/neta/crm/citizens', payload);
    return res.data;
  },

  addCrmInteraction: async (citizenId, payload) => {
    const res = await apiClient.post(`/neta/crm/citizens/${citizenId}/interactions`, payload);
    return res.data;
  },

  addCrmIssue: async (citizenId, payload) => {
    const res = await apiClient.post(`/neta/crm/citizens/${citizenId}/issues`, payload);
    return res.data;
  },

  updateCrmIssueStatus: async (issueId, payload) => {
    const res = await apiClient.patch(`/neta/crm/issues/${issueId}/status`, payload);
    return res.data;
  },
};
