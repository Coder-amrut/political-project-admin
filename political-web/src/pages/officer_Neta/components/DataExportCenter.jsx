import React, { useState } from 'react';
import { netaApi } from '../api/netaApi';
import PrintableExecutiveReport from './PrintableExecutiveReport';

export default function DataExportCenter({ lang = 'mr' }) {
  const isMr = lang === 'mr';

  const [selectedReport, setSelectedReport] = useState('users'); // users, surveys, survey_forms, crm_citizens, crm_issues, workers, booths, tasks, meetings, full_backup
  const [selectedFormat, setSelectedFormat] = useState('csv'); // csv, pdf, json
  const [isExporting, setIsExporting] = useState(false);
  const [successToast, setSuccessToast] = useState('');

  // Printable Report modal state
  const [printableData, setPrintableData] = useState(null);

  // Helper to format a single CSV row safely
  const toCsvRow = (arr) =>
    arr
      .map((val) => {
        const str = (val ?? '').toString().replace(/"/g, '""');
        return `"${str}"`;
      })
      .join(',');

  // Export as CSV (With UTF-8 BOM for authentic Marathi/Devanagari characters in MS Excel)
  const exportToCSV = (filename, headers, rows) => {
    const csvContent =
      '\uFEFF' +
      [
        headers.join(','),
        ...rows.map((row) =>
          row
            .map((val) => {
              const str = (val ?? '').toString().replace(/"/g, '""');
              return `"${str}"`;
            })
            .join(',')
        ),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Complete Multi-table Database Backup in a Structured Master CSV (Excel Compatible)
  const exportFullBackupCSV = (filename, data) => {
    const lines = [];
    const addLine = (row) => lines.push(toCsvRow(row));
    const addEmpty = () => lines.push('');

    // Header Metadata
    addLine(['=== २८२ - सांगली विधानसभा मतदारसंघ | संपूर्ण डेटाबेस महा-बॅकअप (MASTER DATABASE BACKUP) ===']);
    addLine(['तयार केल्याची तारीख व वेळ', new Date().toLocaleString(isMr ? 'mr-IN' : 'en-US')]);
    addLine(['मतदारसंघ', '२८२ - सांगली विधानसभा मतदारसंघ (महाराष्ट्र)']);
    addLine(['प्रणाली', 'Political Project Management System (Live Sync DB)']);
    addEmpty();

    // 1. Users
    const users = data.users || [];
    addLine([`--- विभाग १: प्रणाली वापरकर्ते व अधिकारी (${users.length} खाती) ---`]);
    addLine(['आयडी', 'पूर्ण नाव', 'मोबाईल नंबर', 'ईमेल', 'भूमिका (Roles)', 'सद्यस्थिती', 'नोंदणी तारीख']);
    users.forEach((u) => {
      addLine([
        u.id,
        u.full_name || '-',
        u.phone || '-',
        u.email || '-',
        u.roles || 'USER',
        u.status || 'ACTIVE',
        u.created_at ? new Date(u.created_at).toLocaleDateString() : '-',
      ]);
    });
    addEmpty();

    // 2. Citizens CRM
    const citizens = data.citizens || [];
    addLine([`--- विभाग २: नागरिक संपर्क ३६०° मतदार यादी (${citizens.length} मतदार) ---`]);
    addLine(['नाव', 'EPIC मतदार ओळखपत्र', 'मोबाईल', 'वय/लिंग', 'बूथ क्र.', 'पत्ता', 'राजकीय कल', 'जबाबदार कार्यकर्ता']);
    citizens.forEach((c) => {
      addLine([
        isMr ? c.full_name_mr : (c.full_name_en || c.full_name_mr),
        c.voter_id_number || '-',
        c.phone || '-',
        `${c.age || '-'} / ${c.gender === 'male' ? (isMr ? 'पु' : 'M') : (isMr ? 'म' : 'F')}`,
        c.booth_no,
        isMr ? c.address_mr : (c.address_en || c.address_mr),
        isMr ? (c.sentiment_label_mr || c.sentiment) : (c.sentiment_label_en || c.sentiment),
        c.assigned_worker_name || '-',
      ]);
    });
    addEmpty();

    // 3. Booths
    const booths = data.booths || [];
    addLine([`--- विभाग ३: बूथनिहाय प्रगती व मतदार सांख्यिकी (${booths.length} बूथ) ---`]);
    addLine(['बूथ क्र.', 'केंद्राचे नाव', 'तालुका', 'गाव/वॉर्ड', 'एकूण मतदार', 'सर्व्हे मतदार', 'कव्हरेज %', 'बूथ इनचार्ज', 'मोबाईल', 'कल']);
    booths.forEach((b) => {
      addLine([
        b.booth_no,
        isMr ? b.booth_name_mr : (b.booth_name_en || b.booth_name_mr),
        isMr ? b.taluka_mr : (b.taluka_en || b.taluka_mr),
        isMr ? b.village_mr : (b.village_en || b.village_mr),
        b.total_voters,
        b.surveyed_voters,
        `${b.coverage_pct}%`,
        b.incharge_name || '-',
        b.incharge_phone || '-',
        isMr ? b.sentiment_label_mr : (b.sentiment_label_en || b.sentiment_label_mr),
      ]);
    });
    addEmpty();

    // 4. Workers
    const workers = data.workers || [];
    addLine([`--- विभाग ४: कार्यकर्ते व संघटन अहवाल (${workers.length} कार्यकर्ते) ---`]);
    addLine(['नाव', 'मोबाईल', 'पद / जबाबदारी', 'परिसर', 'एकूण सर्व्हे', 'आजचे सर्व्हे', 'रेटिंग', 'स्थिती']);
    workers.forEach((w) => {
      addLine([
        w.name,
        w.phone,
        isMr ? w.role_mr : (w.role_en || w.role_mr),
        isMr ? w.assigned_area_mr : (w.assigned_area_en || w.assigned_area_mr),
        w.total_surveys,
        w.today_surveys,
        `${w.rating} / 5`,
        w.status === 'active' ? (isMr ? 'सक्रिय' : 'Active') : (isMr ? 'ऑफलाइन' : 'Offline'),
      ]);
    });
    addEmpty();

    // 5. Survey Submissions
    const surveys = data.survey_submissions || [];
    addLine([`--- विभाग ५: मतदार पाहणी प्रत्यक्ष सर्व्हे नोंदी (${surveys.length} सर्व्हे) ---`]);
    addLine(['सर्व्हे कोड', 'फॉर्मचे नाव', 'मतदाराचे नाव', 'EPIC ओळखपत्र', 'मोबाईल', 'बूथ क्र.', 'गाव / परिसर', 'सर्व्हेयर कार्यकर्ता', 'स्थिती', 'तारीख']);
    surveys.forEach((s) => {
      addLine([
        s.submission_code || `SUB-${s.id}`,
        isMr ? (s.form_title_mr || 'मतदार पाहणी') : (s.form_title_en || s.form_title_mr || 'Voter Survey'),
        s.citizen_name_mr || s.citizen_name || '-',
        s.voter_id_number || '-',
        s.phone || '-',
        s.booth_no || '-',
        s.village_mr || '-',
        s.submitted_by_name || '-',
        s.status === 'APPROVED' ? (isMr ? 'मंजूर' : 'Approved') : (isMr ? 'पडताळणी बाकी' : 'Pending'),
        s.created_at ? new Date(s.created_at).toLocaleDateString() : '-',
      ]);
    });
    addEmpty();

    // 6. Civic Grievances
    const issues = data.crm_issues || [];
    addLine([`--- विभाग ६: नागरी समस्या व तक्रारी नोंदवही (${issues.length} तक्रारी) ---`]);
    addLine(['तक्रार क्र.', 'समस्या शीर्षक', 'नागरिकाचे नाव', 'मोबाईल', 'बूथ', 'प्राधान्य', 'स्थिती']);
    issues.forEach((iss) => {
      addLine([
        iss.tracking_no || `TKT-${iss.id}`,
        isMr ? iss.title_mr : (iss.title_en || iss.title_mr),
        iss.citizen_name || '-',
        iss.citizen_phone || '-',
        iss.booth_no || '-',
        iss.priority === 'urgent' ? (isMr ? 'तातडीचे' : 'Urgent') : (isMr ? 'सामान्य' : 'Normal'),
        iss.status === 'resolved'
          ? (isMr ? 'सोडवली' : 'Resolved')
          : iss.status === 'in_progress'
          ? (isMr ? 'प्रगतीपथावर' : 'In Progress')
          : (isMr ? 'प्रलंबित' : 'Pending'),
      ]);
    });
    addEmpty();

    // 7. Tasks
    const tasks = data.tasks || [];
    addLine([`--- विभाग ७: प्रलंबित कामे व पाठपुरावा अहवाल (${tasks.length} कामे) ---`]);
    addLine(['कामाचे शीर्षक', 'प्रकार', 'जबाबदार व्यक्ती', 'प्राधान्य', 'अंतिम मुदत', 'स्थिती']);
    tasks.forEach((t) => {
      addLine([
        isMr ? t.title_mr : (t.title_en || t.title_mr),
        isMr ? t.category_mr : (t.category_en || t.category_mr),
        t.assigned_to,
        t.priority === 'urgent' ? (isMr ? 'तातडीचे' : 'Urgent') : t.priority,
        t.deadline,
        t.status === 'completed' ? (isMr ? 'पूर्ण' : 'Completed') : (isMr ? 'प्रलंबित' : 'Pending'),
      ]);
    });
    addEmpty();

    // 8. Meetings
    const meetings = data.meetings || [];
    addLine([`--- विभाग ८: बैठका व दौरे वेळापत्रक पत्रिका (${meetings.length} कार्यक्रम) ---`]);
    addLine(['दौरा / बैठक', 'प्रकार', 'तारीख', 'वेळ', 'ठिकाण', 'अपेक्षित उपस्थिती', 'प्रमुख']);
    meetings.forEach((m) => {
      addLine([
        isMr ? m.title_mr : (m.title_en || m.title_mr),
        isMr ? m.type_mr : (m.type_en || m.type_mr),
        m.date,
        m.time,
        isMr ? m.venue_mr : (m.venue_en || m.venue_mr),
        m.expected_attendees || '-',
        m.incharge || '-',
      ]);
    });
    addEmpty();

    // 9. Survey Forms
    const forms = data.survey_forms || [];
    addLine([`--- विभाग ९: सर्व्हे फॉर्म्स व प्रश्नावली संच (${forms.length} फॉर्म्स) ---`]);
    addLine(['फॉर्म कोड', 'शीर्षक', 'उद्दिष्ट', 'लक्षित वर्ग', 'स्थिती', 'तयार केल्याची तारीख']);
    forms.forEach((f) => {
      addLine([
        f.form_code || `FRM-${f.id}`,
        isMr ? f.title_mr : (f.title_en || f.title_mr),
        f.campaign_objective || '-',
        f.target_audience || '-',
        f.status || 'ACTIVE',
        f.created_at ? new Date(f.created_at).toLocaleDateString() : '-',
      ]);
    });

    const csvContent = '\uFEFF' + lines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Open Master Printable PDF Dossier for Full Database Backup
  const openFullBackupPDF = (data) => {
    const users = data.users || [];
    const citizens = data.citizens || [];
    const booths = data.booths || [];
    const workers = data.workers || [];
    const surveys = data.survey_submissions || [];
    const issues = data.crm_issues || [];
    const tasks = data.tasks || [];
    const meetings = data.meetings || [];

    const sections = [
      {
        title: isMr ? '१. प्रणाली वापरकर्ते व अधिकारी (System Users & Officers)' : '1. System Users & Officers',
        headers: isMr ? ['आयडी', 'नाव', 'मोबाईल', 'ईमेल', 'भूमिका', 'स्थिती'] : ['ID', 'Name', 'Phone', 'Email', 'Roles', 'Status'],
        rows: users.map((u) => [
          u.id,
          u.full_name || '-',
          u.phone || '-',
          u.email || '-',
          u.roles || 'USER',
          u.status || 'ACTIVE',
        ]),
      },
      {
        title: isMr ? '२. नागरिक संपर्क ३६०° मतदार यादी (Citizen CRM Directory)' : '2. Citizen 360 CRM Directory',
        headers: isMr ? ['नाव', 'EPIC ओळखपत्र', 'मोबाईल', 'वय/लिंग', 'बूथ', 'राजकीय कल'] : ['Name', 'EPIC Voter ID', 'Phone', 'Age / Gender', 'Booth', 'Sentiment'],
        rows: citizens.map((c) => [
          isMr ? c.full_name_mr : (c.full_name_en || c.full_name_mr),
          c.voter_id_number || '-',
          c.phone || '-',
          `${c.age || '-'} / ${c.gender === 'male' ? (isMr ? 'पु' : 'M') : (isMr ? 'म' : 'F')}`,
          c.booth_no,
          isMr ? (c.sentiment_label_mr || c.sentiment) : (c.sentiment_label_en || c.sentiment),
        ]),
      },
      {
        title: isMr ? '३. बूथनिहाय प्रगती व मतदार सांख्यिकी (Booth Progress)' : '3. Booth Progress Ledger',
        headers: isMr ? ['बूथ क्र.', 'केंद्राचे नाव', 'गाव/वॉर्ड', 'एकूण मतदार', 'सर्व्हे मतदार', 'कव्हरेज', 'बूथ प्रमुख', 'कल'] : ['Booth', 'Booth Name', 'Village', 'Total Voters', 'Surveyed', 'Coverage', 'In-charge', 'Sentiment'],
        rows: booths.map((b) => [
          b.booth_no,
          isMr ? b.booth_name_mr : (b.booth_name_en || b.booth_name_mr),
          isMr ? b.village_mr : (b.village_en || b.village_mr),
          b.total_voters,
          b.surveyed_voters,
          `${b.coverage_pct}%`,
          b.incharge_name || '-',
          isMr ? b.sentiment_label_mr : (b.sentiment_label_en || b.sentiment_label_mr),
        ]),
      },
      {
        title: isMr ? '४. कार्यकर्ते संघटन व कामगिरी (Worker Roster)' : '4. Worker Roster & Performance',
        headers: isMr ? ['नाव', 'मोबाईल', 'पद / जबाबदारी', 'परिसर', 'सर्व्हे', 'रेटिंग', 'स्थिती'] : ['Worker Name', 'Phone', 'Role', 'Area', 'Surveys', 'Rating', 'Status'],
        rows: workers.map((w) => [
          w.name,
          w.phone,
          isMr ? w.role_mr : (w.role_en || w.role_mr),
          isMr ? w.assigned_area_mr : (w.assigned_area_en || w.assigned_area_mr),
          w.total_surveys,
          `${w.rating} / 5`,
          w.status === 'active' ? (isMr ? 'सक्रिय' : 'Active') : (isMr ? 'ऑफलाइन' : 'Offline'),
        ]),
      },
      {
        title: isMr ? '५. मतदार पाहणी प्रत्यक्ष सर्व्हे नोंदी (Survey Submissions)' : '5. Field Survey Submissions',
        headers: isMr ? ['कोड', 'फॉर्म', 'मतदाराचे नाव', 'EPIC ID', 'मोबाईल', 'बूथ', 'कार्यकर्ता', 'स्थिती'] : ['Code', 'Form', 'Voter Name', 'EPIC ID', 'Phone', 'Booth', 'Worker', 'Status'],
        rows: surveys.map((s) => [
          s.submission_code || `SUB-${s.id}`,
          isMr ? (s.form_title_mr || 'मतदार पाहणी') : (s.form_title_en || s.form_title_mr || 'Survey'),
          s.citizen_name_mr || s.citizen_name || '-',
          s.voter_id_number || '-',
          s.phone || '-',
          s.booth_no || '-',
          s.submitted_by_name || '-',
          s.status === 'APPROVED' ? (isMr ? 'मंजूर' : 'Approved') : (isMr ? 'पडताळणी बाकी' : 'Pending'),
        ]),
      },
      {
        title: isMr ? '६. नागरी समस्या व तक्रारी नोंदवही (Civic Grievances)' : '6. Civic Grievances Ledger',
        headers: isMr ? ['तक्रार क्र.', 'समस्या शीर्षक', 'नागरिक', 'मोबाईल', 'बूथ', 'प्राधान्य', 'स्थिती'] : ['Ticket No', 'Issue Title', 'Citizen', 'Phone', 'Booth', 'Priority', 'Status'],
        rows: issues.map((iss) => [
          iss.tracking_no || `TKT-${iss.id}`,
          isMr ? iss.title_mr : (iss.title_en || iss.title_mr),
          iss.citizen_name || '-',
          iss.citizen_phone || '-',
          iss.booth_no || '-',
          iss.priority === 'urgent' ? (isMr ? 'तातडीचे' : 'Urgent') : (isMr ? 'सामान्य' : 'Normal'),
          iss.status === 'resolved'
            ? (isMr ? 'सोडवली' : 'Resolved')
            : iss.status === 'in_progress'
            ? (isMr ? 'प्रगतीपथावर' : 'In Progress')
            : (isMr ? 'प्रलंबित' : 'Pending'),
        ]),
      },
      {
        title: isMr ? '७. प्रलंबित कामे व पाठपुरावा (Action Tasks)' : '7. Action Tasks & Follow-ups',
        headers: isMr ? ['काम शीर्षक', 'प्रकार', 'जबाबदार व्यक्ती', 'प्राधान्य', 'मुदत', 'स्थिती'] : ['Task Title', 'Category', 'Assigned To', 'Priority', 'Deadline', 'Status'],
        rows: tasks.map((t) => [
          isMr ? t.title_mr : (t.title_en || t.title_mr),
          isMr ? t.category_mr : (t.category_en || t.category_mr),
          t.assigned_to,
          t.priority === 'urgent' ? (isMr ? 'तातडीचे' : 'Urgent') : t.priority,
          t.deadline,
          t.status === 'completed' ? (isMr ? 'पूर्ण' : 'Completed') : (isMr ? 'प्रलंबित' : 'Pending'),
        ]),
      },
      {
        title: isMr ? '८. बैठका व दौरे वेळापत्रक (Meetings & Tours)' : '8. Tours & Meetings Schedule',
        headers: isMr ? ['कार्यक्रम', 'प्रकार', 'तारीख / वेळ', 'ठिकाण', 'उपस्थिती', 'प्रमुख'] : ['Event', 'Type', 'Date & Time', 'Venue', 'Attendance', 'In-charge'],
        rows: meetings.map((m) => [
          isMr ? m.title_mr : (m.title_en || m.title_mr),
          isMr ? m.type_mr : (m.type_en || m.type_mr),
          `${m.date || ''} ${m.time || ''}`,
          isMr ? m.venue_mr : (m.venue_en || m.venue_mr),
          m.expected_attendees || '-',
          m.incharge || '-',
        ]),
      },
    ];

    setPrintableData({
      title: isMr ? 'संपूर्ण डेटाबेस महा-अहवाल व बॅकअप दस्तऐवज' : 'Master Database Backup & Executive Dossier',
      subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | सर्व विभागांचा एकत्रित अधिकृत अहवाल' : '282 - Sangli Assembly Constituency | Comprehensive System DB Dossier',
      filters: {
        [isMr ? 'बॅकअप प्रकार' : 'Backup Type']: isMr ? 'सर्व डेटा मॉड्यूल्स (Full Database Roster)' : 'All Database Modules',
        [isMr ? 'मतदारसंघ' : 'Constituency']: isMr ? '२८२ - सांगली विधानसभा' : '282 - Sangli Assembly',
      },
      summaryStats: [
        { label: isMr ? 'वापरकर्ते' : 'Users', value: users.length },
        { label: isMr ? 'मतदार CRM' : 'Voters CRM', value: citizens.length },
        { label: isMr ? 'बूथ सांख्यिकी' : 'Booths', value: booths.length },
        { label: isMr ? 'कार्यकर्ते' : 'Workers', value: workers.length },
        { label: isMr ? 'सर्व्हे नोंदी' : 'Surveys', value: surveys.length },
        { label: isMr ? 'नागरी तक्रारी' : 'Issues', value: issues.length },
      ],
      sections,
    });
  };

  // Export as JSON backup file
  const exportToJSON = (filename, data) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Trigger export handler
  const handleExport = async (targetType = selectedReport, explicitFormat = null) => {
    const activeFormat = explicitFormat || selectedFormat;
    setIsExporting(true);

    try {
      const res = await netaApi.getExportData(targetType);
      if (!res.success) {
        throw new Error(res.message || 'Export failed');
      }

      const records = res.data || [];
      const nowStr = new Date().toISOString().split('T')[0];

      // Handle Full Backup in CSV, PDF or JSON
      if (targetType === 'full_backup') {
        if (activeFormat === 'csv') {
          exportFullBackupCSV(`Political_Project_Master_DB_Backup_${nowStr}.csv`, records);
          setSuccessToast(
            isMr
              ? 'संपूर्ण डेटाबेस Master Excel/CSV बॅकअप यशस्वीरीत्या डाऊनलोड झाला!'
              : 'Master Database Excel/CSV backup downloaded successfully!'
          );
        } else if (activeFormat === 'pdf') {
          openFullBackupPDF(records);
          setSuccessToast(
            isMr
              ? 'संपूर्ण डेटाबेस अधिकृत PDF अहवाल प्रिव्ह्यू उघडला आहे!'
              : 'Official full database PDF dossier generated!'
          );
        } else {
          exportToJSON(`Political_Project_Full_DB_Backup_${nowStr}.json`, records);
          setSuccessToast(
            isMr
              ? 'संपूर्ण डेटाबेस सुरक्षित बॅकअप (JSON) यशस्वीरीत्या डाउनलोड झाला!'
              : 'Complete database snapshot backup (JSON) exported successfully!'
          );
        }
        setIsExporting(false);
        return;
      }

      // If JSON format is chosen
      if (activeFormat === 'json') {
        exportToJSON(`${targetType}_data_backup_${nowStr}.json`, records);
        setSuccessToast(
          isMr
            ? `${targetType.toUpperCase()} डेटा बॅकअप (JSON) यशस्वीरीत्या डाउनलोड झाला!`
            : `${targetType.toUpperCase()} data backup (JSON) exported successfully!`
        );
        setIsExporting(false);
        return;
      }

      // Handle Dataset Specific Export (CSV & PDF)
      if (targetType === 'users') {
        const headers = isMr
          ? ['आयडी', 'पूर्ण नाव', 'मोबाईल नंबर', 'ईमेल', 'भूमिका (Roles)', 'सद्यस्थिती', 'नोंदणी तारीख']
          : ['ID', 'Full Name', 'Phone Number', 'Email', 'Assigned Roles', 'Status', 'Registered At'];
        const rows = records.map((u) => [
          u.id,
          u.full_name || '-',
          u.phone || '-',
          u.email || '-',
          u.roles || 'USER',
          u.status || 'ACTIVE',
          u.created_at ? new Date(u.created_at).toLocaleDateString() : '-',
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`System_Users_List_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'प्रणाली वापरकर्ते व पदाधिकारी यादी (System Users Roster)' : 'System Users & Officers Directory',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | ॲडमिन, अधिकारी व कार्यकर्ते' : '282 - Sangli Assembly | Admin, Officers & Workers',
            filters: { [isMr ? 'एकूण वापरकर्ते' : 'Total Users']: records.length },
            summaryStats: [
              { label: isMr ? 'एकूण खाती' : 'Total Accounts', value: records.length },
              { label: isMr ? 'ॲडमिन' : 'Admins', value: records.filter((u) => (u.roles || '').includes('ADMIN')).length },
              { label: isMr ? 'अधिकारी' : 'Officers', value: records.filter((u) => (u.roles || '').includes('OFFICER')).length },
              { label: isMr ? 'कार्यकर्ते' : 'Workers', value: records.filter((u) => (u.roles || '').includes('WORKER')).length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'surveys') {
        const headers = isMr
          ? ['सर्व्हे कोड', 'फॉर्मचे नाव', 'मतदाराचे नाव', 'EPIC मतदार ओळखपत्र', 'मोबाईल', 'बूथ क्र.', 'गाव / परिसर', 'सर्व्हेयर कार्यकर्ता', 'स्थिती', 'तारीख']
          : ['Survey Code', 'Form Name', 'Voter Name', 'EPIC Voter ID', 'Phone', 'Booth No', 'Village', 'Field Worker', 'Status', 'Date'];
        const rows = records.map((s) => [
          s.submission_code || `SUB-${s.id}`,
          isMr ? (s.form_title_mr || 'मतदार पाहणी') : (s.form_title_en || s.form_title_mr || 'Voter Survey'),
          s.citizen_name_mr || s.citizen_name || '-',
          s.voter_id_number || '-',
          s.phone || '-',
          s.booth_no || '-',
          s.village_mr || '-',
          s.submitted_by_name || '-',
          s.status === 'APPROVED' ? (isMr ? 'मंजूर' : 'Approved') : (isMr ? 'पडताळणी बाकी' : 'Pending'),
          s.created_at ? new Date(s.created_at).toLocaleDateString() : '-',
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Field_Survey_Submissions_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'मतदार सर्वेक्षण व प्रत्यक्ष पाहणी अहवाल' : 'Voter Field Survey Submissions Ledger',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | ग्राउंड सर्व्हे डेटाबेस' : '282 - Sangli Assembly Constituency | Field Survey DB',
            filters: { [isMr ? 'एकूण सर्व्हे नोंदी' : 'Total Surveys']: records.length },
            summaryStats: [
              { label: isMr ? 'एकूण सर्व्हे' : 'Total Surveys', value: records.length },
              { label: isMr ? 'मंजूर' : 'Approved', value: records.filter((s) => s.status === 'APPROVED').length },
              { label: isMr ? 'पडताळणी बाकी' : 'Pending', value: records.filter((s) => s.status !== 'APPROVED').length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'crm_citizens') {
        const headers = isMr
          ? ['नाव', 'EPIC ओळखपत्र', 'मोबाईल', 'वय/लिंग', 'बूथ क्र.', 'पत्ता', 'राजकीय कल', 'जबाबदार कार्यकर्ता']
          : ['Name', 'EPIC Voter ID', 'Phone', 'Age / Gender', 'Booth No', 'Address', 'Political Sentiment', 'Assigned Worker'];
        const rows = records.map((c) => [
          isMr ? c.full_name_mr : (c.full_name_en || c.full_name_mr),
          c.voter_id_number || '-',
          c.phone || '-',
          `${c.age || '-'} / ${c.gender === 'male' ? (isMr ? 'पु' : 'M') : (isMr ? 'म' : 'F')}`,
          c.booth_no,
          isMr ? c.address_mr : (c.address_en || c.address_mr),
          isMr ? (c.sentiment_label_mr || c.sentiment) : (c.sentiment_label_en || c.sentiment),
          c.assigned_worker_name || '-',
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Citizen_CRM_Voter_Directory_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'नागरिक संपर्क ३६०° मतदार यादी' : 'Citizen 360 CRM Directory',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | मतदार संपर्क कक्ष' : '282 - Sangli Assembly Constituency | Outreach Desk',
            filters: { [isMr ? 'एकूण संपर्क' : 'Total Contacts']: records.length },
            summaryStats: [
              { label: isMr ? 'नोंदणीकृत मतदार' : 'Total Contacts', value: records.length },
              { label: isMr ? 'अनुकूल मतदार' : 'Supportive', value: records.filter((c) => c.sentiment === 'anukul').length },
              { label: isMr ? 'तटस्थ मतदार' : 'Neutral', value: records.filter((c) => c.sentiment === 'tatstha').length },
              { label: isMr ? 'विरोधी' : 'Opposition', value: records.filter((c) => c.sentiment === 'virodhak').length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'booths') {
        const headers = isMr
          ? ['बूथ क्र.', 'केंद्राचे नाव', 'तालुका', 'गाव/वॉर्ड', 'एकूण मतदार', 'सर्व्हे मतदार', 'कव्हरेज %', 'बूथ इनचार्ज', 'मोबाईल', 'कल']
          : ['Booth No', 'Booth Name', 'Taluka', 'Village', 'Total Voters', 'Surveyed Voters', 'Coverage %', 'Booth In-charge', 'Phone', 'Sentiment'];
        const rows = records.map((b) => [
          b.booth_no,
          isMr ? b.booth_name_mr : (b.booth_name_en || b.booth_name_mr),
          isMr ? b.taluka_mr : (b.taluka_en || b.taluka_mr),
          isMr ? b.village_mr : (b.village_en || b.village_mr),
          b.total_voters,
          b.surveyed_voters,
          `${b.coverage_pct}%`,
          b.incharge_name,
          b.incharge_phone,
          isMr ? b.sentiment_label_mr : (b.sentiment_label_en || b.sentiment_label_mr),
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Booth_Progress_Report_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'बूथनिहाय प्रगती व मतदार सर्वेक्षण अहवाल' : 'Booth-wise Progress Report',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | ३१८ बूथ नियंत्रण कक्ष' : '282 - Sangli Assembly Constituency | Booth Desk',
            filters: { [isMr ? 'एकूण बूथ' : 'Total Booths']: records.length },
            summaryStats: [
              { label: isMr ? 'एकूण बूथ' : 'Total Booths', value: records.length },
              { label: isMr ? 'अनुकूल बूथ' : 'Supportive', value: records.filter((b) => b.sentiment === 'anukul').length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'workers') {
        const headers = isMr
          ? ['नाव', 'मोबाईल', 'पद / जबाबदारी', 'परिसर', 'एकूण सर्व्हे', 'आजचे सर्व्हे', 'रेटिंग', 'स्थिती']
          : ['Worker Name', 'Phone', 'Role', 'Area', 'Total Surveys', 'Today Surveys', 'Rating', 'Status'];
        const rows = records.map((w) => [
          w.name,
          w.phone,
          isMr ? w.role_mr : (w.role_en || w.role_mr),
          isMr ? w.assigned_area_mr : (w.assigned_area_en || w.assigned_area_mr),
          w.total_surveys,
          w.today_surveys,
          `${w.rating} / 5`,
          w.status === 'active' ? (isMr ? 'सक्रिय' : 'Active') : (isMr ? 'ऑफलाइन' : 'Offline'),
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Karyakarta_Roster_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'कार्यकर्ते कामगिरी व क्षेत्रीय हजेरी अहवाल' : 'Worker Performance Roster',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | संघटन कक्ष' : '282 - Sangli Assembly Constituency | Operations Desk',
            filters: { [isMr ? 'एकूण कार्यकर्ते' : 'Worker Count']: records.length },
            summaryStats: [
              { label: isMr ? 'नोंदणीकृत कार्यकर्ते' : 'Total Workers', value: records.length },
              { label: isMr ? 'सक्रिय' : 'Active', value: records.filter((w) => w.status === 'active').length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'crm_issues') {
        const headers = isMr
          ? ['तक्रार क्र.', 'समस्या शीर्षक', 'नागरिकाचे नाव', 'मोबाईल', 'बूथ', 'प्राधान्य', 'स्थिती']
          : ['Ticket No', 'Issue Title', 'Citizen Name', 'Phone', 'Booth', 'Priority', 'Status'];
        const rows = records.map((iss) => [
          iss.tracking_no,
          isMr ? iss.title_mr : (iss.title_en || iss.title_mr),
          iss.citizen_name || '-',
          iss.citizen_phone || '-',
          iss.booth_no || '-',
          iss.priority === 'urgent' ? (isMr ? 'तातडीचे' : 'Urgent') : (isMr ? 'सामान्य' : 'Normal'),
          iss.status === 'resolved'
            ? (isMr ? 'सोडवली' : 'Resolved')
            : iss.status === 'in_progress'
            ? (isMr ? 'प्रगतीपथावर' : 'In Progress')
            : (isMr ? 'प्रलंबित' : 'Pending'),
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Civic_Grievances_Ledger_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'नागरी समस्या व तक्रारी निवारण नोंदवही' : 'Civic Grievances Ledger',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | जनसमस्या निवारण कक्ष' : '282 - Sangli Assembly Constituency | Grievance Desk',
            filters: { [isMr ? 'एकूण तक्रारी' : 'Total Grievances']: records.length },
            summaryStats: [
              { label: isMr ? 'एकूण तक्रारी' : 'Total Grievances', value: records.length },
              { label: isMr ? 'प्रलंबित' : 'Pending', value: records.filter((i) => i.status !== 'resolved').length },
              { label: isMr ? 'निवारण झाले' : 'Resolved', value: records.filter((i) => i.status === 'resolved').length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'tasks') {
        const headers = isMr
          ? ['कामाचे शीर्षक', 'प्रकार', 'जबाबदार व्यक्ती', 'प्राधान्य', 'अंतिम मुदत', 'स्थिती']
          : ['Task Title', 'Category', 'Assigned To', 'Priority', 'Deadline', 'Status'];
        const rows = records.map((t) => [
          isMr ? t.title_mr : (t.title_en || t.title_mr),
          isMr ? t.category_mr : (t.category_en || t.category_mr),
          t.assigned_to,
          t.priority === 'urgent' ? (isMr ? 'तातडीचे' : 'Urgent') : t.priority,
          t.deadline,
          t.status === 'completed' ? (isMr ? 'पूर्ण' : 'Completed') : (isMr ? 'प्रलंबित' : 'Pending'),
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Pending_Tasks_Report_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'प्रलंबित कामे व पाठपुरावा अहवाल' : 'Pending Tasks Dossier',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | कृती नियंत्रण कक्ष' : '282 - Sangli Assembly Constituency | Control Desk',
            filters: { [isMr ? 'एकूण कामे' : 'Total Tasks']: records.length },
            summaryStats: [
              { label: isMr ? 'एकूण कामे' : 'Total Tasks', value: records.length },
              { label: isMr ? 'प्रलंबित' : 'Pending', value: records.filter((t) => t.status !== 'completed').length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'meetings') {
        const headers = isMr
          ? ['दौरा / बैठक', 'प्रकार', 'तारीख', 'वेळ', 'ठिकाण', 'अपेक्षित उपस्थिती', 'प्रमुख']
          : ['Tour / Meeting', 'Category', 'Date', 'Time', 'Venue', 'Expected Crowd', 'In-charge'];
        const rows = records.map((m) => [
          isMr ? m.title_mr : (m.title_en || m.title_mr),
          isMr ? m.type_mr : (m.type_en || m.type_mr),
          m.date,
          m.time,
          isMr ? m.venue_mr : (m.venue_en || m.venue_mr),
          m.expected_attendees || '-',
          m.incharge || '-',
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Meetings_and_Tours_Schedule_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'दौरे व जाहीर सभा वेळापत्रक पत्रिका' : 'Tours & Townhalls Schedule',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | अधिकृत संपर्क पत्रिका' : '282 - Sangli Assembly Constituency | Official Schedule',
            filters: { [isMr ? 'नियोजित कार्यक्रम' : 'Scheduled Events']: records.length },
            summaryStats: [
              { label: isMr ? 'एकूण कार्यक्रम' : 'Total Events', value: records.length },
              { label: isMr ? 'नियोजित' : 'Scheduled', value: records.filter((m) => m.status === 'scheduled').length },
            ],
            headers,
            rows,
          });
        }
      } else if (targetType === 'survey_forms') {
        const headers = isMr
          ? ['फॉर्म कोड', 'शीर्षक', 'उद्दिष्ट', 'लक्षित वर्ग', 'स्थिती', 'तयार केल्याची तारीख']
          : ['Form Code', 'Title', 'Objective', 'Target Audience', 'Status', 'Created At'];
        const rows = records.map((f) => [
          f.form_code || `FRM-${f.id}`,
          isMr ? f.title_mr : (f.title_en || f.title_mr),
          f.campaign_objective || '-',
          f.target_audience || '-',
          f.status || 'ACTIVE',
          f.created_at ? new Date(f.created_at).toLocaleDateString() : '-',
        ]);

        if (activeFormat === 'csv') {
          exportToCSV(`Survey_Forms_Templates_${nowStr}.csv`, headers, rows);
        } else {
          setPrintableData({
            title: isMr ? 'सर्वेक्षण फॉर्म्स व प्रश्नावली सूची' : 'Survey Forms Templates Ledger',
            subtitle: isMr ? '२८२ - सांगली विधानसभा मतदारसंघ | फॉर्म संच' : '282 - Sangli Assembly Constituency | Forms Repository',
            filters: { [isMr ? 'एकूण फॉर्म्स' : 'Total Forms']: records.length },
            summaryStats: [
              { label: isMr ? 'एकूण फॉर्म्स' : 'Total Forms', value: records.length },
            ],
            headers,
            rows,
          });
        }
      }

      setSuccessToast(
        isMr
          ? `डेटाबेसमधून ${targetType.toUpperCase()} अहवाल (${selectedFormat.toUpperCase()}) यशस्वीरीत्या तयार झाला!`
          : `${targetType.toUpperCase()} report (${selectedFormat.toUpperCase()}) generated successfully!`
      );
    } catch (err) {
      console.error('Export Error:', err);
      alert(isMr ? 'डेटा एक्सपोर्ट करताना त्रुटी आली.' : 'Failed to export data.');
    } finally {
      setIsExporting(false);
    }
  };

  const exportDatasets = [
    {
      id: 'users',
      title_mr: 'युझर व ॲडमिन डेटा (User Accounts)',
      title_en: 'User Accounts & Roles',
      desc_mr: 'सर्व ॲडमिन, अधिकारी, कार्यकर्ते फोन व भूमिका तपशील',
      desc_en: 'All admin, officer and worker accounts with roles & phones',
      icon: '👤',
      badge: isMr ? 'खाती' : 'Accounts',
      badgeColor: '#2563eb',
    },
    {
      id: 'surveys',
      title_mr: 'मतदार सर्वेक्षण डेटा (Field Surveys)',
      title_en: 'Field Survey Submissions',
      desc_mr: 'प्रत्यक्ष जमिनीवर कार्यकर्त्यांनी भरलेले मतदार पाहणी सर्व्हे',
      desc_en: 'Voter surveys filled on the ground with voter ID & responses',
      icon: '📋',
      badge: isMr ? 'सर्व्हे' : 'Surveys',
      badgeColor: '#059669',
    },
    {
      id: 'crm_citizens',
      title_mr: 'नागरिक संपर्क ३६०° मतदार यादी',
      title_en: 'Citizen 360 CRM Roster',
      desc_mr: 'संपूर्ण मतदार यादी, वय, लिंग, कल, मोबाईल व कुटुंब तपशील',
      desc_en: 'Full registered voter directory with sentiment, phone & family',
      icon: '👥',
      badge: isMr ? 'मतदार' : 'Voters',
      badgeColor: '#0d9488',
    },
    {
      id: 'workers',
      title_mr: 'कार्यकर्ते व कामगिरी अहवाल',
      title_en: 'Worker Roster & Performance',
      desc_mr: 'कार्यकर्त्यांची हजेरी, बूथ वाटप, पूर्ण झालेले सर्व्हे व रेटिंग',
      desc_en: 'Worker directory, booth allocations, surveys completed & rating',
      icon: '🚩',
      badge: isMr ? 'कार्यकर्ते' : 'Workers',
      badgeColor: '#d97706',
    },
    {
      id: 'booths',
      title_mr: 'बूथनिहाय प्रगती व मतदार यादी',
      title_en: 'Booth Progress & Voter Roll',
      desc_mr: '३१८ बुथांचे मतदार, कव्हरेज, बूथ प्रमुख व राजकीय कल',
      desc_en: '318 booths voters, coverage, in-charge and sentiment',
      icon: '🗳️',
      badge: isMr ? 'बूथ' : 'Booths',
      badgeColor: '#7c3aed',
    },
    {
      id: 'crm_issues',
      title_mr: 'नागरी समस्या व तक्रारी नोंदवही',
      title_en: 'Civic Grievances Ledger',
      desc_mr: 'पाणी, रस्ते, वीज नागरी तक्रारी, अर्ज व निवारण स्थिती',
      desc_en: 'Water, road, power grievances tickets & resolution status',
      icon: '⚠️',
      badge: isMr ? 'तक्रारी' : 'Issues',
      badgeColor: '#dc2626',
    },
    {
      id: 'tasks',
      title_mr: 'प्रलंबित कामे व पाठपुरावा अहवाल',
      title_en: 'Pending Tasks & Follow-ups',
      desc_mr: 'नागरी समस्या, जबाबदार व्यक्ती, प्राधान्य व अंतिम मुदत',
      desc_en: 'Action items, assignees, priorities and deadlines',
      icon: '⚡',
      badge: isMr ? 'कामे' : 'Tasks',
      badgeColor: '#e11d48',
    },
    {
      id: 'meetings',
      title_mr: 'बैठका व दौरे वेळापत्रक पत्रिका',
      title_en: 'Tours & Meetings Itinerary',
      desc_mr: 'नेत्यांचे सर्व दौरे, कॉर्नर सभा, ठिकाण, वेळ व उपस्थिती',
      desc_en: 'Leader tour programs, venues, dates and crowd',
      icon: '📅',
      badge: isMr ? 'दौरे' : 'Tours',
      badgeColor: '#4f46e5',
    },
    {
      id: 'survey_forms',
      title_mr: 'सर्व्हे फॉर्म्स व प्रश्नावली संच',
      title_en: 'Survey Questionnaire Templates',
      desc_mr: 'प्रणालीत तयार केलेल्या सर्व्हे फॉर्म्स व प्रश्नांची रचना',
      desc_en: 'Templates, questions, campaign goals and modules',
      icon: '🗂️',
      badge: isMr ? 'फॉर्म्स' : 'Templates',
      badgeColor: '#0284c7',
    },
    {
      id: 'full_backup',
      title_mr: 'संपूर्ण डेटाबेस महा-बॅकअप (Full System Backup)',
      title_en: 'Full Database System Snapshot',
      desc_mr: 'सर्व ९ विभागांचा (युझर, मतदार CRM, सर्व्हे, बूथ, तक्रारी, कामे) Excel, PDF किंवा JSON मध्ये संपूर्ण बॅकअप',
      desc_en: 'Complete unified backup of all database modules in Excel, PDF or JSON format',
      icon: '💾',
      badge: isMr ? 'संपूर्ण बॅकअप' : 'Full Backup',
      badgeColor: '#047857',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Printable Report Modal if active */}
      {printableData && (
        <PrintableExecutiveReport
          title={printableData.title}
          subtitle={printableData.subtitle}
          filters={printableData.filters}
          summaryStats={printableData.summaryStats}
          headers={printableData.headers}
          rows={printableData.rows}
          onClose={() => setPrintableData(null)}
          lang={lang}
        />
      )}

      {/* Header Banner */}
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
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>💾</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>
              {isMr ? 'डेटा बॅकअप व निर्यात केंद्र' : 'Data Backup & Export HQ'}
            </h2>
            <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '11px', fontWeight: '800', padding: '3px 8px', borderRadius: '12px', border: '1px solid #bbf7d0' }}>
              {isMr ? 'थेट डेटाबेस जोडणी' : 'Live Sync DB'}
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            {isMr
              ? 'प्रणालीतील वापरकर्ते, मतदार पाहणी सर्व्हे, मतदार CRM ३६०°, बूथ व तक्रारींचा डेटा Excel/CSV, PDF किंवा थेट JSON बॅकअप स्वरूपात सुरक्षितपणे निर्यात करा.'
              : 'Securely backup and export users, field survey responses, voter CRM, booths and grievances into Excel/CSV, PDF or full JSON snapshot.'}
          </p>
        </div>

        {/* Quick Full Backup Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Quick Excel/CSV Full Backup */}
          <button
            type="button"
            onClick={() => handleExport('full_backup', 'csv')}
            disabled={isExporting}
            style={{
              background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '11px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '750',
              cursor: isExporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
              transition: 'all 0.15s ease',
            }}
            title={isMr ? 'सर्व टेबल्सचा एकत्र Master Excel/CSV बॅकअप डाउनलोड करा' : 'Download unified Excel/CSV backup'}
          >
            <span>📊</span>
            {isMr ? 'संपूर्ण Excel बॅकअप' : 'Full Excel Backup'}
          </button>

          {/* Quick PDF Full Backup */}
          <button
            type="button"
            onClick={() => handleExport('full_backup', 'pdf')}
            disabled={isExporting}
            style={{
              background: 'linear-gradient(135deg, #b91c1c 0%, #dc2626 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '11px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '750',
              cursor: isExporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              transition: 'all 0.15s ease',
            }}
            title={isMr ? 'सर्व विभागांचा एकत्रित अधिकृत PDF अहवाल उघडा' : 'Open comprehensive printable PDF dossier'}
          >
            <span>📄</span>
            {isMr ? 'संपूर्ण PDF अहवाल' : 'Full PDF Report'}
          </button>

          {/* Quick JSON Full Backup */}
          <button
            type="button"
            onClick={() => handleExport('full_backup', 'json')}
            disabled={isExporting}
            style={{
              background: 'linear-gradient(135deg, #334155 0%, #475569 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '11px 18px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: '750',
              cursor: isExporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 12px rgba(71, 85, 105, 0.25)',
              transition: 'all 0.15s ease',
            }}
            title={isMr ? 'सर्व टेबल्सचा सुरक्षित सिस्टीम JSON बॅकअप डाउनलोड करा' : 'Download system snapshot JSON file'}
          >
            <span>💾</span>
            {isMr ? 'JSON स्नॅपशॉट' : 'JSON Snapshot'}
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {successToast && (
        <div
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            border: '1px solid #a7f3d0',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>✓</span>
            <span>{successToast}</span>
          </div>
          <button
            onClick={() => setSuccessToast('')}
            style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}
          >
            ×
          </button>
        </div>
      )}

      {/* Export Configuration Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
        }}
      >
        {/* Step 1: Select Dataset to Backup / Export */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
            <label style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
              {isMr ? '१. बॅकअप किंवा डाऊनलोड करण्यासाठी डेटा प्रकार निवडा:' : '1. Choose Dataset to Backup & Export:'}
            </label>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isMr ? '१० पर्याय उपलब्ध' : '10 Datasets Available'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
            {exportDatasets.map((item) => {
              const isSelected = selectedReport === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedReport(item.id)}
                  style={{
                    border: isSelected ? '2px solid #1d4ed8' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : '#ffffff',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    position: 'relative',
                    boxShadow: isSelected ? '0 4px 12px rgba(29, 78, 216, 0.1)' : '0 1px 2px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div style={{ fontSize: '26px' }}>{item.icon}</div>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        background: isSelected ? '#1d4ed8' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : item.badgeColor,
                        border: `1px solid ${isSelected ? '#1d4ed8' : '#cbd5e1'}`,
                      }}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: isSelected ? '#1d4ed8' : '#0f172a' }}>
                    {isMr ? item.title_mr : item.title_en}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                    {isMr ? item.desc_mr : item.desc_en}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Format */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>
            {isMr ? '२. बॅकअप / फाईल प्रकार निवडा:' : '2. Choose Export / Backup Format:'}
          </label>
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            {/* CSV / Excel */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: selectedFormat === 'csv' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                background: selectedFormat === 'csv' ? '#f0fdf4' : '#ffffff',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13.5px',
                color: selectedFormat === 'csv' ? '#15803d' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="format"
                value="csv"
                checked={selectedFormat === 'csv'}
                onChange={() => setSelectedFormat('csv')}
              />
              📊 {isMr ? 'Excel / CSV स्प्रेडशीट (मराठी Unicode)' : 'Excel / CSV Spreadsheet'}
            </label>

            {/* Official PDF */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: selectedFormat === 'pdf' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                background: selectedFormat === 'pdf' ? '#fef2f2' : '#ffffff',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13.5px',
                color: selectedFormat === 'pdf' ? '#b91c1c' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="format"
                value="pdf"
                checked={selectedFormat === 'pdf'}
                onChange={() => setSelectedFormat('pdf')}
              />
              📄 {isMr ? 'अधिकृत PDF अहवाल (प्रिंट व जतन)' : 'Official PDF Dossier (Print / Save)'}
            </label>

            {/* JSON System Backup */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                borderRadius: '10px',
                border: selectedFormat === 'json' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: selectedFormat === 'json' ? '#eff6ff' : '#ffffff',
                cursor: 'pointer',
                fontWeight: '700',
                fontSize: '13.5px',
                color: selectedFormat === 'json' ? '#1d4ed8' : '#334155',
                transition: 'all 0.15s ease',
              }}
            >
              <input
                type="radio"
                name="format"
                value="json"
                checked={selectedFormat === 'json'}
                onChange={() => setSelectedFormat('json')}
              />
              🗄️ {isMr ? 'सुरक्षित JSON डेटाबेस बॅकअप (Raw Backup)' : 'Secure JSON Database Backup (Raw)'}
            </label>
          </div>
        </div>

        {/* Step 3: Trigger Button */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => handleExport(selectedReport)}
            disabled={isExporting}
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '14px 28px',
              borderRadius: '10px',
              fontSize: '14.5px',
              fontWeight: '800',
              cursor: isExporting ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 6px 16px rgba(37, 99, 235, 0.28)',
            }}
          >
            <span>{isExporting ? '⏳' : selectedFormat === 'pdf' ? '🖨️' : '📥'}</span>
            {isExporting
              ? isMr
                ? 'डेटाबेसमधून बॅकअप तयार होत आहे...'
                : 'Fetching from DB & generating export...'
              : selectedFormat === 'pdf'
              ? isMr
                ? 'अधिकृत PDF अहवाल उघडा'
                : 'Generate Official Printable PDF'
              : selectedFormat === 'json'
              ? isMr
                ? 'JSON बॅकअप फाईल डाउनलोड करा'
                : 'Download JSON Backup File'
              : isMr
              ? 'निवडलेला डेटा CSV/Excel डाऊनलोड करा'
              : 'Download Selected CSV Report'}
          </button>

          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {isMr
              ? '💡 टीप: Excel फाईल UTF-8 BOM सह तयार होते, त्यामुळे मराठी मजकूर व्यवस्थित दिसतो.'
              : '💡 Note: Files are exported with UTF-8 BOM for full Unicode Marathi compatibility.'}
          </span>
        </div>
      </div>
    </div>
  );
}
