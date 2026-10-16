import React, { useState, useMemo } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Safely parse JSON strings
const parseJsonSafe = (val) => {
  if (!val) return null;
  if (typeof val === 'object') return val;
  try {
    return JSON.parse(val);
  } catch {
    return null;
  }
};

// Generates clear, non-technical "Who did What to Whom" human explanations in Marathi & English
export const getDetailedStory = (log, lang = 'mr') => {
  const isMr = lang === 'mr';
  const actor =
    log.user?.full_name ||
    log.user_name ||
    (log.user_id ? (isMr ? `वापरकर्ता #${log.user_id}` : `User #${log.user_id}`) : (isMr ? 'प्रशासक / सिस्टिम' : 'Admin / System'));

  const target = log.target_name || '';
  const entityType = log.entity_type || '';
  const entityId = log.entity_id || '';
  const oldData = parseJsonSafe(log.old_data);
  const newData = parseJsonSafe(log.new_data);

  const targetProject =
    target ||
    newData?.name ||
    oldData?.name ||
    (entityType.toLowerCase().includes('project') ? (isMr ? `प्रकल्प #${entityId}` : `Project #${entityId}`) : '');

  const targetUser =
    target ||
    newData?.full_name ||
    oldData?.full_name ||
    (entityType.toLowerCase().includes('user') ? (isMr ? `वापरकर्ता #${entityId}` : `User #${entityId}`) : '');

  const action = log.action || '';

  switch (action) {
    case 'ADMIN_LOGIN':
    case 'USER_LOGIN':
      return {
        title: isMr ? `${actor} यांनी प्रणालीमध्ये सुरक्षित प्रवेश केला.` : `${actor} logged in securely to the portal.`,
        category: isMr ? 'लॉगिन सत्र' : 'Login Session',
        targetLabel: isMr ? 'प्रशासन पोर्टल' : 'Admin Portal',
        badgeColor: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
        icon: '🔑',
      };

    case 'USER_LOGOUT':
      return {
        title: isMr ? `${actor} प्रणालीतून सुरक्षितपणे बाहेर पडले.` : `${actor} logged out from the portal.`,
        category: isMr ? 'लॉगआउट' : 'Logout',
        targetLabel: isMr ? 'सत्र समाप्ती' : 'Session End',
        badgeColor: { bg: '#f1f5f9', text: '#475569', border: '#cbd5e1' },
        icon: '🚪',
      };

    case 'USER_REGISTERED':
      return {
        title: isMr
          ? `${targetUser || actor} यांनी नवीन खात्यासाठी अर्ज व नोंदणी सादर केली.`
          : `${targetUser || actor} submitted a new registration application.`,
        category: isMr ? 'नवीन नोंदणी' : 'New Registration',
        targetLabel: targetUser || (isMr ? 'वापरकर्ता नोंदणी' : 'User Registration'),
        badgeColor: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
        icon: '📝',
      };

    case 'USER_APPROVED':
      return {
        title: isMr
          ? `${actor} यांनी वापरकर्ता '${targetUser || `खाते #${entityId}`}' चे खाते मंजूर केले.`
          : `${actor} approved the account for '${targetUser || `User #${entityId}`}'.`,
        category: isMr ? 'खाते मंजुरी' : 'Account Approved',
        targetLabel: targetUser || (isMr ? `वापरकर्ता #${entityId}` : `User #${entityId}`),
        badgeColor: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
        icon: '✅',
      };

    case 'USER_REJECTED':
      return {
        title: isMr
          ? `${actor} यांनी वापरकर्ता '${targetUser || `खाते #${entityId}`}' चा नोंदणी अर्ज नाकारला.`
          : `${actor} rejected the registration for '${targetUser || `User #${entityId}`}'.`,
        category: isMr ? 'खाते नाकारले' : 'Account Rejected',
        targetLabel: targetUser || (isMr ? `वापरकर्ता #${entityId}` : `User #${entityId}`),
        badgeColor: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
        icon: '❌',
      };

    case 'ADMIN_CREATED_USER':
    case 'USER_CREATED':
      return {
        title: isMr
          ? `${actor} यांनी नवीन वापरकर्ता '${targetUser || `खाते #${entityId}`}' थेट तयार केला.`
          : `${actor} created a new user account '${targetUser || `User #${entityId}`}'.`,
        category: isMr ? 'खाते निर्मिती' : 'User Created',
        targetLabel: targetUser || (isMr ? `वापरकर्ता #${entityId}` : `User #${entityId}`),
        badgeColor: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
        icon: '👤',
      };

    case 'PROJECT_CREATED':
      return {
        title: isMr
          ? `${actor} यांनी '${targetProject || `प्रकल्प #${entityId}`}' हा नवीन प्रकल्प तयार केला.`
          : `${actor} created new project '${targetProject || `Project #${entityId}`}'.`,
        category: isMr ? 'प्रकल्प निर्मिती' : 'Project Created',
        targetLabel: targetProject || (isMr ? `प्रकल्प #${entityId}` : `Project #${entityId}`),
        badgeColor: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
        icon: '📁',
      };

    case 'PROJECT_UPDATED':
      return {
        title: isMr
          ? `${actor} यांनी '${targetProject || `प्रकल्प #${entityId}`}' प्रकल्पाची माहिती अद्ययावत केली.`
          : `${actor} updated details for project '${targetProject || `Project #${entityId}`}'.`,
        category: isMr ? 'प्रकल्प बदल' : 'Project Updated',
        targetLabel: targetProject || (isMr ? `प्रकल्प #${entityId}` : `Project #${entityId}`),
        badgeColor: { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
        icon: '✏️',
      };

    case 'PROJECT_STATUS_CHANGED':
      const newStatus = newData?.status || (isMr ? 'पूर्ण' : 'Completed');
      return {
        title: isMr
          ? `${actor} यांनी '${targetProject || `प्रकल्प #${entityId}`}' प्रकल्पाची स्थिती '${newStatus}' अशी बदलली.`
          : `${actor} changed project '${targetProject || `Project #${entityId}`}' status to '${newStatus}'.`,
        category: isMr ? 'स्थिती बदल' : 'Status Changed',
        targetLabel: targetProject || (isMr ? `प्रकल्प #${entityId}` : `Project #${entityId}`),
        badgeColor: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
        icon: '🔄',
      };

    case 'PROJECT_DELETED':
      return {
        title: isMr
          ? `${actor} यांनी '${targetProject || `प्रकल्प #${entityId}`}' हा प्रकल्प हटवला.`
          : `${actor} deleted project '${targetProject || `Project #${entityId}`}'.`,
        category: isMr ? 'प्रकल्प हटवला' : 'Project Deleted',
        targetLabel: targetProject || (isMr ? `प्रकल्प #${entityId}` : `Project #${entityId}`),
        badgeColor: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
        icon: '🗑️',
      };

    case 'PROJECT_MEMBERS_ASSIGNED':
      return {
        title: isMr
          ? `${actor} यांनी '${targetProject || `प्रकल्प #${entityId}`}' प्रकल्पात कार्यकर्ते व अधिकारी नियुक्त केले.`
          : `${actor} assigned workers/officers to project '${targetProject || `Project #${entityId}`}'.`,
        category: isMr ? 'सदस्य नियुक्ती' : 'Team Assigned',
        targetLabel: targetProject || (isMr ? `प्रकल्प #${entityId}` : `Project #${entityId}`),
        badgeColor: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
        icon: '👥',
      };

    case 'MEMBER_REMOVED':
      return {
        title: isMr
          ? `${actor} यांनी सदस्याला प्रकल्पातून वगळले.`
          : `${actor} removed team member from project.`,
        category: isMr ? 'सदस्य वगळला' : 'Member Removed',
        targetLabel: targetProject || (isMr ? 'प्रकल्प सदस्य' : 'Project Member'),
        badgeColor: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
        icon: '➖',
      };

    case 'MEMBER_STATUS_CHANGED':
      return {
        title: isMr
          ? `${actor} यांनी प्रकल्प सदस्याची जबाबदारी किंवा स्थिती बदलली.`
          : `${actor} updated member status in project.`,
        category: isMr ? 'सदस्य स्थिती' : 'Member Status',
        targetLabel: targetProject || (isMr ? 'प्रकल्प सदस्य' : 'Project Member'),
        badgeColor: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' },
        icon: '🔄',
      };

    case 'ROLE_PERMISSIONS_UPDATED':
    case 'ROLE_PERMISSION_GRANTED':
    case 'ROLE_PERMISSION_REVOKED':
      return {
        title: isMr
          ? `${actor} यांनी ${entityId ? `भूमिका #${entityId}` : 'भूमिका'} च्या सुरक्षा परवानग्या अद्ययावत केल्या.`
          : `${actor} updated access permissions for ${entityId ? `role #${entityId}` : 'role'}.`,
        category: isMr ? 'परवानगी बदल' : 'Permission Update',
        targetLabel: isMr ? `भूमिका #${entityId}` : `Role #${entityId}`,
        badgeColor: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
        icon: '🛡️',
      };

    case 'USER_PERMISSIONS_UPDATED':
    case 'USER_PERMISSION_GRANTED':
    case 'USER_PERMISSION_REVOKED':
      return {
        title: isMr
          ? `${actor} यांनी वापरकर्ता '${targetUser || `#${entityId}`}' च्या विशेष परवानग्या बदलल्या.`
          : `${actor} updated custom access rights for '${targetUser || `User #${entityId}`}'.`,
        category: isMr ? 'वैयक्तिक परवानगी' : 'User Permissions',
        targetLabel: targetUser || (isMr ? `वापरकर्ता #${entityId}` : `User #${entityId}`),
        badgeColor: { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff' },
        icon: '👤',
      };

    case 'SURVEY_SUBMITTED':
      return {
        title: isMr
          ? `${actor} यांनी कुटुंब सर्वेक्षण माहिती प्रणालीत नोंदवली.`
          : `${actor} recorded a household survey submission.`,
        category: isMr ? 'सर्व्हे नोंद' : 'Survey Submitted',
        targetLabel: isMr ? 'कुटुंब सर्व्हे' : 'Household Survey',
        badgeColor: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
        icon: '📊',
      };

    default:
      const cleanAction = action.replace(/_/g, ' ').toLowerCase();
      return {
        title: isMr
          ? `${actor} यांनी '${cleanAction}' ही कृती यशस्वीरित्या केली.`
          : `${actor} performed action '${cleanAction}'.`,
        category: cleanAction,
        targetLabel: `${entityType || 'घटक'} ${entityId ? `#${entityId}` : ''}`,
        badgeColor: { bg: '#f8fafc', text: '#334155', border: '#cbd5e1' },
        icon: '📌',
      };
  }
};

const I18N = {
  en: {
    title: 'Audit Log & Security Monitoring',
    subtitle: 'Human-readable activity records explaining who performed what action on which user or project.',
    colActionStory: 'Action Summary (Who did What to Whom)',
    colUser: 'Performed By (Who)',
    colEntity: 'Target Entity (To Whom / What)',
    colTime: 'Date & Time',
    exportPdfBtn: '📄 Export in PDF Format',
    exportCsvBtn: '📥 Export CSV',
    printBtn: '🖨️ Print / Save PDF',
    refreshBtn: '⟳ Refresh Logs',
    filterAll: 'All Activities',
    filterAuth: 'Authentication (Login / Logout)',
    filterProjects: 'Projects Activities',
    filterApprovals: 'User Approvals & Accounts',
    searchPlaceholder: 'Search by action, person name or project...',
    recordsCount: 'activity events recorded',
    noRecords: 'No audit records match the current filter.',
    page: 'Page',
    of: 'of',
    prevBtn: '← Previous',
    nextBtn: 'Next →',
  },
  mr: {
    title: 'ऑडिट लॉग आणि सुरक्षा नोंदी',
    subtitle: 'कोणी, कोणावर किंवा कोणत्या प्रकल्पावर काय कृती केली याचा गैर-तांत्रिक व स्पष्ट मराठीतील तपशील.',
    colActionStory: 'घडलेली कृती आणि तपशील',
    colUser: 'कृती करणारा',
    colEntity: 'कोणावर / कशावर',
    colTime: 'तारीख आणि वेळ',
    exportPdfBtn: '📄 पीडीएफ स्वरूपात डाऊनलोड',
    exportCsvBtn: '📥 सीएसव्ही डाऊनलोड',
    printBtn: '🖨️ मुद्रित करा / सेव्ह करा',
    refreshBtn: '⟳ रिफ्रेश करा',
    filterAll: 'सर्व घडामोडी',
    filterAuth: 'प्रवेश / बाहेर पडणे',
    filterProjects: 'प्रकल्प घडामोडी',
    filterApprovals: 'वापरकर्ते व खाते मंजुरी',
    searchPlaceholder: 'कृती, व्यक्तीचे नाव किंवा प्रकल्पानुसार शोधा...',
    recordsCount: 'नोंदी उपलब्ध',
    noRecords: 'निवडलेल्या फिल्टरनुसार कोणत्याही नोंदी आढळल्या नाहीत.',
    page: 'पान',
    of: 'पैकी',
    prevBtn: '← मागील',
    nextBtn: 'पुढील →',
  },
};

function AuditLogViewer({ logs = [], currentUser, language = 'mr', onRefresh }) {
  const isMr = language === 'mr';
  const t = I18N[language] || I18N.mr;

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Filtered logs (Geography completely removed)
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // 1. Category Filter
      if (
        categoryFilter === 'AUTH' &&
        !['ADMIN_LOGIN', 'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTERED'].includes(log.action)
      ) {
        return false;
      }
      if (
        categoryFilter === 'PROJECTS' &&
        !log.action.startsWith('PROJECT_') &&
        !log.action.startsWith('MEMBER_')
      ) {
        return false;
      }
      if (
        categoryFilter === 'APPROVALS' &&
        ![
          'USER_APPROVED',
          'USER_REJECTED',
          'USER_CREATED',
          'ROLE_PERMISSIONS_UPDATED',
          'ROLE_PERMISSION_GRANTED',
          'ROLE_PERMISSION_REVOKED',
          'USER_PERMISSIONS_UPDATED',
          'USER_PERMISSION_GRANTED',
          'USER_PERMISSION_REVOKED',
        ].includes(log.action)
      ) {
        return false;
      }

      // 2. Search Term Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const story = getDetailedStory(log, language);
        const storyTitle = story.title.toLowerCase();
        const actionCode = (log.action || '').toLowerCase();
        const userName = (log.user?.full_name || log.user_name || String(log.user_id || '')).toLowerCase();
        const targetName = (log.target_name || story.targetLabel || '').toLowerCase();
        const entity = `${log.entity_type || ''} ${log.entity_id || ''}`.toLowerCase();

        return (
          storyTitle.includes(term) ||
          actionCode.includes(term) ||
          userName.includes(term) ||
          targetName.includes(term) ||
          entity.includes(term)
        );
      }

      return true;
    });
  }, [logs, categoryFilter, searchTerm, language]);

  // Paginated Rows
  const paginatedLogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, page]);

  const totalPages = Math.ceil(filteredLogs.length / pageSize) || 1;

  // =========================================================================
  // EXPORT IN PDF FORMAT (jsPDF + autoTable) with Clear Human Stories
  // =========================================================================
  const handleExportPdf = () => {
    const doc = new jsPDF('landscape', 'pt', 'a4');

    const timestamp = new Date().toLocaleString();
    const generatedBy = currentUser?.full_name || (isMr ? 'प्रशासक' : 'Administrator');

    // Report Header
    doc.setFontSize(16);
    doc.setTextColor(15, 23, 42);
    doc.text(isMr ? 'राजकीय मोहीम — सुरक्षा व ऑडिट रिपोर्ट' : 'POLITICAL PROJECT — AUDIT LOG REPORT', 40, 42);

    doc.setFontSize(9.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `${isMr ? 'तारीख' : 'Generated'}: ${timestamp}  |  ${isMr ? 'तयारकर्ता' : 'By'}: ${generatedBy}  |  ${isMr ? 'एकूण नोंदी' : 'Total Events'}: ${filteredLogs.length}`,
      40,
      60
    );

    // Prepare table rows with Human Readable Action Story
    const tableHeaders = [
      [
        '#',
        isMr ? 'तपशीलवार कृती (What Happened)' : 'Action Story (Who did What to Whom)',
        isMr ? 'कोणी केले (Actor)' : 'Performed By',
        isMr ? 'संबंधित घटक (Target)' : 'Target Record',
        isMr ? 'तारीख व वेळ' : 'Date & Time',
      ],
    ];

    const tableRows = filteredLogs.map((log, index) => {
      const story = getDetailedStory(log, language);
      return [
        index + 1,
        story.title,
        log.user?.full_name || log.user_name || (log.user_id ? `User #${log.user_id}` : 'System'),
        story.targetLabel || `${log.entity_type || '—'} (#${log.entity_id || ''})`,
        log.created_at ? new Date(log.created_at).toLocaleString() : '—',
      ];
    });

    autoTable(doc, {
      head: tableHeaders,
      body: tableRows,
      startY: 75,
      theme: 'striped',
      headStyles: {
        fillColor: [30, 58, 138],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
      },
      styles: {
        fontSize: 8.5,
        cellPadding: 6,
        textColor: [30, 41, 59],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 30, halign: 'center' },
        1: { cellWidth: 340, fontStyle: 'bold' },
        2: { cellWidth: 130 },
        3: { cellWidth: 150 },
        4: { cellWidth: 120 },
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(
          `Page ${data.pageNumber} of ${pageCount}  —  Confidential Internal Audit Log`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 20
        );
      },
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    doc.save(`Audit_Log_Report_${dateStr}.pdf`);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!filteredLogs.length) return;
    const headers = [
      '#',
      'Action Summary (Who did What to Whom)',
      'Action Code',
      'Performed By',
      'Target Entity',
      'Date & Time',
    ];

    const rows = filteredLogs.map((log, idx) => {
      const story = getDetailedStory(log, language);
      return [
        idx + 1,
        `"${story.title.replace(/"/g, '""')}"`,
        `"${log.action || ''}"`,
        `"${log.user?.full_name || log.user_name || log.user_id || 'System'}"`,
        `"${story.targetLabel || log.entity_type || ''}"`,
        `"${log.created_at ? new Date(log.created_at).toLocaleString() : ''}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Modern Clean Styles
  const styles = {
    card: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 12,
      padding: '22px 24px',
      marginBottom: 20,
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', -apple-system, sans-serif",
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    badge: (bg, col, border = 'transparent') => ({
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
      fontSize: 11.5,
      fontWeight: 700,
      padding: '3px 8px',
      borderRadius: 999,
      background: bg,
      color: col,
      border: `1px solid ${border}`,
    }),
    btnPdf: {
      padding: '8px 14px',
      background: '#dc2626',
      color: '#ffffff',
      border: 0,
      borderRadius: 7,
      fontWeight: 700,
      fontSize: 12.5,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      boxShadow: '0 1px 3px rgba(220, 38, 38, 0.2)',
    },
    btnSecondary: {
      padding: '7px 12px',
      background: '#ffffff',
      color: '#334155',
      border: '1px solid #cbd5e1',
      borderRadius: 6,
      fontWeight: 650,
      fontSize: 12,
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      gap: 5,
    },
    filterBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 10,
      padding: '12px 14px',
      background: '#f8fafc',
      borderRadius: 8,
      border: '1px solid #e2e8f0',
      marginBottom: 14,
    },
    select: {
      padding: '7px 11px',
      border: '1px solid #cbd5e1',
      borderRadius: 6,
      fontSize: 13,
      color: '#0f172a',
      background: '#ffffff',
      cursor: 'pointer',
      outline: 'none',
    },
    input: {
      padding: '7px 12px',
      border: '1px solid #cbd5e1',
      borderRadius: 6,
      fontSize: 13,
      color: '#0f172a',
      background: '#ffffff',
      width: 270,
      outline: 'none',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 13,
    },
    th: {
      textAlign: 'left',
      padding: '11px 14px',
      background: '#f8fafc',
      color: '#475569',
      fontWeight: 750,
      borderBottom: '2px solid #e2e8f0',
      fontSize: 12.5,
    },
    td: {
      padding: '12px 14px',
      borderBottom: '1px solid #f1f5f9',
      color: '#1e293b',
      verticalAlign: 'middle',
    },
  };

  return (
    <div style={styles.card} className="printable-audit-section">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-audit-section, .printable-audit-section * {
            visibility: visible;
          }
          .printable-audit-section {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: 0 !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header & Export Actions */}
      <div style={styles.topBar}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '22px' }}>🔒</span>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {t.title}
            </h2>
            <span style={styles.badge('#eff6ff', '#1d4ed8', '#bfdbfe')}>
              {filteredLogs.length} {t.recordsCount}
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>
            {t.subtitle}
          </p>
        </div>

        {/* Action Buttons: Export PDF, Print, CSV, Refresh */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }} className="no-print">
          <button
            type="button"
            onClick={handleExportPdf}
            style={styles.btnPdf}
            title={isMr ? 'थेट PDF रिपोर्ट डाऊनलोड करा' : 'Download PDF report directly'}
          >
            {t.exportPdfBtn}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            style={styles.btnSecondary}
          >
            {t.exportCsvBtn}
          </button>
          <button
            type="button"
            onClick={handlePrint}
            style={styles.btnSecondary}
          >
            {t.printBtn}
          </button>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              style={styles.btnSecondary}
            >
              {t.refreshBtn}
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={styles.filterBar} className="no-print">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#334155' }}>
            {isMr ? 'फिल्टर प्रकार:' : 'Filter:'}
          </span>
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            style={styles.select}
          >
            <option value="ALL">{t.filterAll}</option>
            <option value="AUTH">{t.filterAuth}</option>
            <option value="PROJECTS">{t.filterProjects}</option>
            <option value="APPROVALS">{t.filterApprovals}</option>
          </select>
        </div>

        <div>
          <input
            placeholder={t.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={styles.input}
          />
        </div>
      </div>

      {/* HUMAN-READABLE AUDIT LOG TABLE (WHO DID WHAT TO WHOM) */}
      {filteredLogs.length === 0 ? (
        <div
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px dashed #cbd5e1',
            color: '#64748b',
            fontSize: 13,
          }}
        >
          {t.noRecords}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: 8 }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={{ ...styles.th, width: 45 }}>#</th>
                <th style={{ ...styles.th, width: '42%' }}>{t.colActionStory}</th>
                <th style={{ ...styles.th, width: '20%' }}>{t.colUser}</th>
                <th style={{ ...styles.th, width: '20%' }}>{t.colEntity}</th>
                <th style={{ ...styles.th, textAlign: 'right' }}>{t.colTime}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log, idx) => {
                const rowNum = (page - 1) * pageSize + idx + 1;
                const story = getDetailedStory(log, language);

                return (
                  <tr
                    key={log.id || idx}
                    style={{
                      background: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f0f7ff')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#fafafa')}
                  >
                    {/* Index */}
                    <td style={{ ...styles.td, color: '#94a3b8', fontSize: 12, fontWeight: '600' }}>
                      {rowNum}
                    </td>

                    {/* ACTION STORY (CLEAR NATURAL SENTENCE: WHO DID WHAT TO WHOM) */}
                    <td style={styles.td}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '16px' }}>{story.icon}</span>
                          <span style={styles.badge(story.badgeColor.bg, story.badgeColor.text, story.badgeColor.border)}>
                            {story.category}
                          </span>
                        </div>
                        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '13.5px', lineHeight: 1.4 }}>
                          {story.title}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                          {isMr ? `नोंद क्र. #${log.id}` : `ID #${log.id} · Code: ${log.action}`}
                        </div>
                      </div>
                    </td>

                    {/* PERFORMED BY (ACTOR) */}
                    <td style={styles.td}>
                      <div style={{ fontWeight: '750', color: '#0f172a' }}>
                        {log.user?.full_name || log.user_name || (log.user_id ? (isMr ? `वापरकर्ता #${log.user_id}` : `User #${log.user_id}`) : (isMr ? 'सिस्टिम' : 'System'))}
                      </div>
                      <div style={{ marginTop: '3px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '2px 7px',
                            borderRadius: '4px',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                          }}
                        >
                          {isMr
                            ? (log.user?.role === 'ADMIN' ? 'प्रशासक' : log.user?.role === 'WORKER' ? 'कार्यकर्ता' : log.user?.role === 'OFFICER' ? 'अधिकारी' : (log.user?.role || 'प्रशासक'))
                            : (log.user?.role || 'ADMIN')}
                        </span>
                      </div>
                    </td>

                    {/* TARGET ENTITY */}
                    <td style={styles.td}>
                      <div style={{ fontWeight: '700', color: '#334155' }}>
                        {story.targetLabel || `${log.entity_type || '—'}`}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                        {isMr
                          ? (log.entity_type === 'USER' ? 'वापरकर्ता' : log.entity_type === 'PROJECT' ? 'प्रकल्प' : log.entity_type === 'ROLE' ? 'भूमिका' : log.entity_type)
                          : log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                      </div>
                    </td>

                    {/* DATE & TIME */}
                    <td style={{ ...styles.td, textAlign: 'right', whiteSpace: 'nowrap', color: '#64748b', fontSize: '12px' }}>
                      {log.created_at
                        ? new Date(log.created_at).toLocaleString(isMr ? 'mr-IN' : 'en-IN', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 14,
            paddingTop: 10,
            borderTop: '1px solid #e2e8f0',
            fontSize: 13,
          }}
          className="no-print"
        >
          <div style={{ color: '#64748b' }}>
            {t.page} <b>{page}</b> {t.of} <b>{totalPages}</b>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                ...styles.btnSecondary,
                opacity: page <= 1 ? 0.5 : 1,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              {t.prevBtn}
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                ...styles.btnSecondary,
                opacity: page >= totalPages ? 0.5 : 1,
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              {t.nextBtn}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogViewer;
