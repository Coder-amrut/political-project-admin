import React, { useState, useEffect, useMemo, useCallback } from 'react';
import apiClient from '../../api/axios';
import {
  MapPin,
  Compass,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  Eye,
  Sliders,
  ShieldCheck,
  Building,
  Navigation,
  Crosshair,
  UserCheck,
  UserX,
  FileText,
  Map,
  X,
  Camera,
  Check,
  ChevronRight,
  CalendarDays,
  Printer,
  Sparkles,
  RotateCcw,
  ChevronDown
} from 'lucide-react';

export default function UserAttendanceManager({ language = 'mr' }) {
  const isMr = language === 'mr';

  // --- States ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savingCurrentGpsForEveryone, setSavingCurrentGpsForEveryone] = useState(false);

  // Attendance Data & Stats
  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    present_today: 0,
    punched_in_now: 0,
    completed_today: 0,
    absent_today: 0,
    at_designated_location: 0,
    remote_anywhere: 0,
    attendance_percentage: 0,
  });

  // Location Policy State
  const [policy, setPolicy] = useState({
    is_location_required: false,
    allow_anywhere: true,
    location_name: 'Shambhara Footi Road मध्यवर्ती कार्यालय (Live HQ)',
    address: 'Shambhara Footi Road, Viya Nagar, सांगली, महाराष्ट्र',
    latitude: 16.846266,
    longitude: 74.598727,
    radius_meters: 500,
    enforce_strict_geofence: true,
  });

  // Calendar Date & Filters State
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [openFilterMenu, setOpenFilterMenu] = useState(null); // 'status' | 'role' | 'compliance' | null
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');

  const handlePrevDay = () => {
    const d = new Date(attendanceDate);
    d.setDate(d.getDate() - 1);
    setAttendanceDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(attendanceDate);
    d.setDate(d.getDate() + 1);
    setAttendanceDate(d.toISOString().split('T')[0]);
  };

  const handleToday = () => {
    setAttendanceDate(new Date().toISOString().split('T')[0]);
  };

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return dateObj.toLocaleDateString(isMr ? 'mr-IN' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Close filter dropdown popup on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.attendance-filter-dropdown-container')) {
        setOpenFilterMenu(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  // Modals & Drawers
  const [showLocationSettings, setShowLocationSettings] = useState(false);
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');
  const [activePhotoModal, setActivePhotoModal] = useState(null);
  const [selectedRecordDetail, setSelectedRecordDetail] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [allUsersList, setAllUsersList] = useState([]);

  // User Everyday Attendance History Modal State
  const [selectedUserForHistory, setSelectedUserForHistory] = useState(null);
  const [userHistoryLoading, setUserHistoryLoading] = useState(false);
  const [userEverydayHistory, setUserEverydayHistory] = useState(null);

  // Lock background page scroll whenever any popup modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      showLocationSettings ||
      selectedUserForHistory ||
      activePhotoModal ||
      selectedRecordDetail ||
      showManualModal
    );

    if (isAnyModalOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow || '';
        document.body.style.paddingRight = originalPaddingRight || '';
      };
    }
  }, [showLocationSettings, selectedUserForHistory, activePhotoModal, selectedRecordDetail, showManualModal]);

  // Toast / Alert
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 4500);
  };

  // Current effective date from Calendar
  const effectiveDate = attendanceDate;

  // Load Attendance Data from Backend
  const fetchAttendanceData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const params = new URLSearchParams();
      if (effectiveDate !== 'all') params.append('date', effectiveDate);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (complianceFilter !== 'all') params.append('compliance', complianceFilter);

      const res = await apiClient.get(`/admin/attendance?${params.toString()}`);
      if (res.data?.success) {
        setAttendances(res.data.data.attendances || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
        if (res.data.data.policy) {
          setPolicy(res.data.data.policy);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance records:', err);
      showNotification(isMr ? 'उपस्थिती डेटा लोड करताना त्रुटी आली' : 'Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [effectiveDate, searchQuery, roleFilter, statusFilter, complianceFilter, isMr]);

  // Load All Users for Manual Attendance Form
  const loadUsersList = async () => {
    try {
      const res = await apiClient.get('/admin/users-list');
      if (res.data?.data) {
        setAllUsersList(res.data.data);
      }
    } catch (err) {
      console.warn('Could not load user list:', err);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
    loadUsersList();
  }, [fetchAttendanceData]);

  // Save Attendance Location Policy to Database for All Users
  const handleSavePolicy = async (customPayload = null) => {
    setSavingPolicy(true);
    try {
      const payload = customPayload || {
        is_location_required: Boolean(policy.is_location_required),
        allow_anywhere: !policy.is_location_required,
        location_name: policy.location_name,
        address: policy.address,
        latitude: policy.latitude ? parseFloat(policy.latitude) : null,
        longitude: policy.longitude ? parseFloat(policy.longitude) : null,
        radius_meters: parseInt(policy.radius_meters, 10) || 500,
        enforce_strict_geofence: Boolean(policy.enforce_strict_geofence),
      };

      const res = await apiClient.post('/admin/attendance/location-setting', payload);
      if (res.data?.success) {
        setPolicy(res.data.data);
        showNotification(
          res.data.message || (isMr ? 'उपस्थिती स्थान धोरण सर्व कर्मचाऱ्यांसाठी यशस्वीरीत्या जतन केले!' : 'Location policy saved for all users!'),
          'success'
        );
        setShowLocationSettings(false);
        fetchAttendanceData(true);
      }
    } catch (err) {
      console.error('Failed to save policy:', err);
      showNotification(
        err.response?.data?.message || (isMr ? 'स्थान धोरण जतन करताना त्रुटी आली' : 'Failed to save location policy'),
        'error'
      );
    } finally {
      setSavingPolicy(false);
      setSavingCurrentGpsForEveryone(false);
    }
  };

  // Immediate Save Option when User Uses his own location for all users
  const handleSaveCurrentLocationForEveryone = async (detectedData = null) => {
    setSavingCurrentGpsForEveryone(true);
    const targetPolicy = detectedData || policy;
    const payload = {
      is_location_required: true,
      allow_anywhere: false,
      location_name: targetPolicy.location_name || 'सांगली मध्यवर्ती नियंत्रण कार्यालय (Admin Live HQ)',
      address: targetPolicy.address || 'सांगली, महाराष्ट्र',
      latitude: parseFloat(targetPolicy.latitude),
      longitude: parseFloat(targetPolicy.longitude),
      radius_meters: parseInt(targetPolicy.radius_meters, 10) || 500,
      enforce_strict_geofence: true,
    };
    await handleSavePolicy(payload);
  };

  // Quick Preset Locations in Sangli District
  const applyPresetLocation = (preset) => {
    const updated = {
      ...policy,
      is_location_required: true,
      allow_anywhere: false,
      location_name: preset.name,
      address: preset.address,
      latitude: preset.lat,
      longitude: preset.lng,
      radius_meters: preset.radius || 500,
    };
    setPolicy(updated);
    showNotification(
      isMr ? `पूर्वनिर्धारित स्थान निवडले: ${preset.name}` : `Preset selected: ${preset.name}`,
      'success'
    );
  };

  const presets = [
    {
      name: 'सांगली मध्यवर्ती निवडणूक कार्यालय',
      address: 'स्टेशन रोड, विश्रामबाग जवळ, सांगली शहर ४१६४१६',
      lat: 16.8524,
      lng: 74.5815,
      radius: 300,
    },
    {
      name: 'मिरज विधानसभा संपर्क कार्यालय',
      address: 'रेल्वे स्टेशन चौक, मिरज, सांगली ४१६४१०',
      lat: 16.827,
      lng: 74.643,
      radius: 500,
    },
    {
      name: 'विश्रामबाग १०० फूट रोड मुख्य कचेरी',
      address: '१०० फूट रोड, विश्रामबाग, सांगली ४१६४१५',
      lat: 16.848,
      lng: 74.592,
      radius: 400,
    },
    {
      name: 'कुपवाड महानगर जनसंपर्क केंद्र',
      address: 'एमआयडीसी रोड, कुपवाड, सांगली ४१६४३६',
      lat: 16.871,
      lng: 74.62,
      radius: 600,
    },
  ];

  // Geolocation detector using browser API & reverse-geocoding
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsNotice(isMr ? 'ब्राउझरमध्ये GPS सेवा उपलब्ध नाही.' : 'Geolocation not supported in browser.');
      return;
    }

    setDetectingGps(true);
    setGpsNotice(isMr ? 'सध्याचे GPS स्थान शोधत आहे...' : 'Detecting current GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));

        let resolvedAddress = `अक्षांश: ${lat}, रेखांश: ${lng} (सांगली परिसर)`;
        let locationNameCandidate = 'सांगली कार्यालय (GPS Detected Location)';

        // Try reverse geocoding via OpenStreetMap Nominatim
        try {
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'mr,en' } }
          );
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            if (geoData.display_name) {
              resolvedAddress = geoData.display_name;
            }
            if (geoData.address) {
              const place =
                geoData.address.suburb ||
                geoData.address.neighbourhood ||
                geoData.address.road ||
                geoData.address.city ||
                geoData.address.town ||
                'सांगली';
              locationNameCandidate = `${place} मध्यवर्ती कार्यालय (Live HQ)`;
            }
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
        }

        setPolicy((prev) => ({
          ...prev,
          is_location_required: true,
          allow_anywhere: false,
          location_name: locationNameCandidate,
          latitude: lat,
          longitude: lng,
          address: resolvedAddress,
        }));

        setDetectingGps(false);
        setGpsNotice(
          isMr
            ? `स्थान प्राप्त झाले: "${locationNameCandidate}" (${lat}, ${lng})`
            : `GPS detected: "${locationNameCandidate}" (${lat}, ${lng})`
        );
      },
      (err) => {
        setDetectingGps(false);
        setGpsNotice(
          isMr
            ? `GPS स्थान प्राप्त करता आले नाही: ${err.message}`
            : `Could not retrieve GPS: ${err.message}`
        );
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  // Open a specific user's everyday presentation history modal directly from MySQL database
  const handleOpenUserEverydayHistory = async (userId, userName) => {
    setUserHistoryLoading(true);
    setSelectedUserForHistory({ id: userId, name: userName });
    try {
      const res = await apiClient.get(`/admin/attendance/users/${userId}/history`);
      if (res.data?.success) {
        setUserEverydayHistory(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load user attendance history:', err);
      showNotification(
        isMr ? 'वापरकर्त्याचा दैनंदिन हजेरी इतिहास लोड करता आला नाही' : 'Failed to load user attendance history',
        'error'
      );
    } finally {
      setUserHistoryLoading(false);
    }
  };

  // CSV Export for main table
  const handleExportCsv = () => {
    if (!attendances.length) {
      showNotification(isMr ? 'डाउनलोड करण्यासाठी डेटा उपलब्ध नाही' : 'No records to export', 'error');
      return;
    }

    const headers = [
      'User ID',
      'Full Name',
      'Role',
      'Phone',
      'Date',
      'Punch In Time',
      'Punch Out Time',
      'Attendance Address',
      'Status',
      'Distance (Meters)',
      'Compliance Status',
    ];

    const rows = attendances.map((item) => [
      `"${item.user_id}"`,
      `"${item.user_name || ''}"`,
      `"${item.user_role || ''}"`,
      `"${item.user_phone || ''}"`,
      `"${item.date || ''}"`,
      `"${item.punch_in_time || '-'}"`,
      `"${item.punch_out_time || '-'}"`,
      `"${(item.address || '').replace(/"/g, '""')}"`,
      `"${item.status || 'Present'}"`,
      `"${item.distance_meters !== null ? item.distance_meters : '-'}"`,
      `"${item.compliance_status || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `User_Attendance_Report_${effectiveDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(isMr ? 'उपस्थिती अहवाल CSV डाउनलोड झाला!' : 'Attendance CSV downloaded successfully!', 'success');
  };

  // CSV Export for individual user everyday presentation history
  const handleExportUserHistoryCsv = () => {
    if (!userEverydayHistory?.history?.length) return;

    const u = userEverydayHistory.user;
    const headers = ['Date', 'Day', 'Punch In Time', 'Punch Out Time', 'Working Duration', 'Address', 'Status', 'Compliance'];
    const rows = userEverydayHistory.history.map((h) => [
      `"${h.date}"`,
      `"${isMr ? h.day_name_mr || h.day_name : h.day_name}"`,
      `"${h.punch_in_time || '-'}"`,
      `"${h.punch_out_time || '-'}"`,
      `"${h.duration || '-'}"`,
      `"${(h.address || '').replace(/"/g, '""')}"`,
      `"${h.status || 'Present'}"`,
      `"${h.compliance_status || '-'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `${(u.full_name || 'User').replace(/\s+/g, '_')}_Attendance_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="attendance-page-root" style={{ padding: '20px 24px', fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif", color: '#0f172a', maxWidth: '100%', boxSizing: 'border-box' }}>
      <style>{`
        @media (max-width: 768px) {
          .attendance-page-root {
            padding: 10px 8px !important;
          }
          .attendance-hero-card {
            padding: 16px 14px !important;
            border-radius: 12px !important;
          }
          .attendance-hero-card h1 {
            font-size: 19px !important;
            line-height: 1.3 !important;
          }
          .attendance-hero-actions {
            width: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 8px !important;
          }
          .attendance-hero-actions button {
            width: 100% !important;
            justify-content: center !important;
            min-height: 44px !important;
          }
        }
      `}</style>
      {/* Toast Notification */}
      {toast.show && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981',
            color: '#ffffff',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontSize: '14px',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          {toast.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* --- Header Section (Admin Command HQ Theme) --- */}
      <div
        className="attendance-hero-card"
        style={{
          background: 'linear-gradient(135deg, #0b132b 0%, #1c2541 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 10px 30px rgba(11, 19, 43, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span
                style={{
                  background: 'rgba(255, 153, 51, 0.2)',
                  color: '#ffb703',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  letterSpacing: '0.5px',
                  border: '1px solid rgba(255, 183, 3, 0.3)',
                }}
              >
                <Compass size={14} />
                ADMIN COMMAND HQ • ATTENDANCE & GEOFENCE
              </span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px 0', letterSpacing: '-0.3px', color: '#ffffff' }}>
              {isMr ? 'कर्मचारी उपस्थिती व स्थान नियंत्रण कक्ष' : 'User Attendance & Geofence Command Desk'}
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '14px', maxWidth: '640px' }}>
              {isMr
                ? 'सर्व कार्यकर्त्यांची व अधिकाऱ्यांची पत्त्यासह दैनंदिन उपस्थिती तपासा. कोणत्याही वापरकर्त्यावर क्लिक करून त्यांची रोजची हजेरी वेळ व पत्ता पहा.'
                : 'Monitor user attendance with physical addresses. Click any user to review their everyday presentation history with time.'}
            </p>
          </div>

          {/* Action Buttons in Header */}
          <div className="attendance-hero-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setShowLocationSettings(true)}
              className="btn-3d-blue"
              style={{
                padding: '9px 18px',
                borderRadius: '10px',
                fontSize: '13px',
              }}
            >
              <span>📍</span>
              <span>{isMr ? 'उपस्थिती स्थान सेटिंग्स' : 'Attendance Location Settings'}</span>
            </button>

            <button
              onClick={() => fetchAttendanceData(true)}
              disabled={refreshing}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: refreshing ? 'wait' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <RefreshCw size={15} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
              {isMr ? 'रिफ्रेश' : 'Refresh'}
            </button>

            <button
              onClick={handleExportCsv}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                padding: '10px 16px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Download size={15} />
              {isMr ? 'CSV एक्सपोर्ट' : 'Export CSV'}
            </button>
          </div>
        </div>
      </div>


      {/* --- Filters & Search Toolbar with 3D Tactile Styling & Royal Blue Palette --- */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '16px 20px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0',
          borderTop: '3.5px solid #2563eb',
          boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Top Row: Interactive Calendar Date Selector (Left) + Search Input (Right) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Calendar Date Picker Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#f8fafc',
                padding: '6px 10px',
                borderRadius: '12px',
                border: '1.5px solid #cbd5e1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
              }}
            >
              {/* Prev Day Button */}
              <button
                type="button"
                onClick={handlePrevDay}
                title={isMr ? 'मागचा दिवस' : 'Previous Day'}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  width: '34px',
                  height: '34px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
              >
                ◀
              </button>

              {/* Calendar Icon + Native Date Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', position: 'relative' }}>
                <Calendar size={18} style={{ color: '#2563eb', flexShrink: 0 }} />
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  style={{
                    border: '1.5px solid #93c5fd',
                    borderRadius: '8px',
                    padding: '6px 12px',
                    fontSize: '14px',
                    fontWeight: 750,
                    color: '#1e3a8a',
                    background: '#ffffff',
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.04)',
                  }}
                />
              </div>

              {/* Next Day Button */}
              <button
                type="button"
                onClick={handleNextDay}
                title={isMr ? 'पुढचा दिवस' : 'Next Day'}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  width: '34px',
                  height: '34px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '14px',
                  transition: 'all 0.15s ease',
                }}
              >
                ▶
              </button>

              {/* Today Quick Jump Button */}
              <button
                type="button"
                onClick={handleToday}
                className={attendanceDate === new Date().toISOString().split('T')[0] ? 'tab-btn-3d-blue' : 'tab-btn-3d-inactive'}
                style={{
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: 800,
                  borderRadius: '8px',
                  height: '34px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isMr ? 'आज (Today)' : 'Today'}
              </button>
            </div>

            {/* Display formatted day pill */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#eff6ff',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
                padding: '6px 14px',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 750,
              }}
            >
              <span>📅</span>
              <span>{formatDisplayDate(attendanceDate)}</span>
            </div>
          </div>

          {/* Right Side: Search Input */}
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <Search size={17} style={{ position: 'absolute', left: '12px', top: '12px', color: '#2563eb' }} />
            <input
              type="text"
              placeholder={isMr ? 'नाव, फोन किंवा पत्त्यानुसार शोधा...' : 'Search by name, phone, or address...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '10px 12px 10px 38px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                fontSize: '13.5px',
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
                background: '#ffffff',
                boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
                transition: 'all 0.2s ease',
                height: '42px',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#2563eb';
                e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.15)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#cbd5e1';
                e.target.style.boxShadow = 'inset 0 1px 2px rgba(0, 0, 0, 0.04)';
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '11px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94a3b8',
                  padding: '2px',
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Filter Row: Role, Status, Compliance Custom Dropdown Popups */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '1px dashed #e2e8f0',
          }}
        >
          <span style={{ fontSize: '12.5px', fontWeight: 750, color: '#475569', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Filter size={15} style={{ color: '#2563eb' }} />
            {isMr ? 'फिल्टर्स:' : 'Filters:'}
          </span>

          {/* Status Filter Custom Popup */}
          <div className="attendance-filter-dropdown-container" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenFilterMenu(openFilterMenu === 'status' ? null : 'status')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: statusFilter !== 'all' ? '#eff6ff' : '#ffffff',
                color: statusFilter !== 'all' ? '#1d4ed8' : '#334155',
                borderColor: statusFilter !== 'all' ? '#93c5fd' : '#cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <span>
                {statusFilter === 'all'
                  ? (isMr ? 'सर्व हजेरी स्थिती (All)' : 'All Statuses')
                  : statusFilter === 'Present'
                  ? (isMr ? '🟢 उपस्थित' : '🟢 Present')
                  : statusFilter === 'Punched In'
                  ? (isMr ? '🟡 चालू शिफ्ट' : '🟡 Active / Punched In')
                  : statusFilter === 'Completed'
                  ? (isMr ? '🔵 काम पूर्ण' : '🔵 Completed')
                  : (isMr ? '🔴 हजेरी बाकी / गैरहजर' : '🔴 Pending / Absent')}
              </span>
              <ChevronDown size={14} style={{ transform: openFilterMenu === 'status' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {openFilterMenu === 'status' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 1050,
                  minWidth: '230px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {[
                  { value: 'all', label: isMr ? 'सर्व हजेरी स्थिती (All)' : 'All Statuses' },
                  { value: 'Present', label: isMr ? '🟢 उपस्थित (Present)' : '🟢 Present' },
                  { value: 'Punched In', label: isMr ? '🟡 चालू शिफ्ट (Punched In)' : '🟡 Active / Punched In' },
                  { value: 'Completed', label: isMr ? '🔵 काम पूर्ण (Completed)' : '🔵 Completed' },
                  { value: 'Absent', label: isMr ? '🔴 हजेरी बाकी / गैरहजर' : '🔴 Pending / Absent' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setStatusFilter(opt.value);
                      setOpenFilterMenu(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: statusFilter === opt.value ? '#eff6ff' : 'transparent',
                      color: statusFilter === opt.value ? '#1d4ed8' : '#334155',
                      fontWeight: statusFilter === opt.value ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (statusFilter !== opt.value) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (statusFilter !== opt.value) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{opt.label}</span>
                    {statusFilter === opt.value && <Check size={15} style={{ color: '#2563eb' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Role Filter Custom Popup */}
          <div className="attendance-filter-dropdown-container" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenFilterMenu(openFilterMenu === 'role' ? null : 'role')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: roleFilter !== 'all' ? '#eff6ff' : '#ffffff',
                color: roleFilter !== 'all' ? '#1d4ed8' : '#334155',
                borderColor: roleFilter !== 'all' ? '#93c5fd' : '#cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <span>
                {roleFilter === 'all'
                  ? (isMr ? 'सर्व भूमिका (All Roles)' : 'All Roles')
                  : roleFilter === 'WORKER'
                  ? (isMr ? 'कार्यकर्ता (WORKER)' : 'Worker')
                  : roleFilter === 'OFFICER'
                  ? (isMr ? 'अधिकारी / नेता (OFFICER)' : 'Officer')
                  : (isMr ? 'प्रशासक (ADMIN)' : 'Admin')}
              </span>
              <ChevronDown size={14} style={{ transform: openFilterMenu === 'role' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {openFilterMenu === 'role' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 1050,
                  minWidth: '220px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {[
                  { value: 'all', label: isMr ? 'सर्व भूमिका (All Roles)' : 'All Roles' },
                  { value: 'WORKER', label: isMr ? 'कार्यकर्ता (WORKER)' : 'Worker' },
                  { value: 'OFFICER', label: isMr ? 'अधिकारी / नेता (OFFICER)' : 'Officer' },
                  { value: 'ADMIN', label: isMr ? 'प्रशासक (ADMIN)' : 'Admin' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRoleFilter(opt.value);
                      setOpenFilterMenu(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: roleFilter === opt.value ? '#eff6ff' : 'transparent',
                      color: roleFilter === opt.value ? '#1d4ed8' : '#334155',
                      fontWeight: roleFilter === opt.value ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (roleFilter !== opt.value) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (roleFilter !== opt.value) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{opt.label}</span>
                    {roleFilter === opt.value && <Check size={15} style={{ color: '#2563eb' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Compliance Filter Custom Popup */}
          <div className="attendance-filter-dropdown-container" style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenFilterMenu(openFilterMenu === 'compliance' ? null : 'compliance')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: '10px',
                border: '1.5px solid #cbd5e1',
                background: complianceFilter !== 'all' ? '#eff6ff' : '#ffffff',
                color: complianceFilter !== 'all' ? '#1d4ed8' : '#334155',
                borderColor: complianceFilter !== 'all' ? '#93c5fd' : '#cbd5e1',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
              }}
            >
              <span>
                {complianceFilter === 'all'
                  ? (isMr ? 'सर्व स्थान प्रकार (All Compliance)' : 'All Compliance')
                  : complianceFilter === 'AT_REQUIRED_LOCATION'
                  ? (isMr ? '✅ ठरवलेल्या ठिकाणी हजर' : 'At Required Location')
                  : complianceFilter === 'ANYWHERE_ALLOWED'
                  ? (isMr ? '🌐 मुक्त हजेरी (Anywhere)' : 'Anywhere Allowed')
                  : (isMr ? '⚠️ ठिकाणाबाहेर (Violation)' : 'Outside Geofence')}
              </span>
              <ChevronDown size={14} style={{ transform: openFilterMenu === 'compliance' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>

            {openFilterMenu === 'compliance' && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  zIndex: 1050,
                  minWidth: '240px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.18), 0 4px 10px rgba(0,0,0,0.06)',
                  border: '1px solid #e2e8f0',
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
                {[
                  { value: 'all', label: isMr ? 'सर्व स्थान प्रकार (All Compliance)' : 'All Compliance' },
                  { value: 'AT_REQUIRED_LOCATION', label: isMr ? '✅ ठरवलेल्या ठिकाणी हजर' : 'At Required Location' },
                  { value: 'ANYWHERE_ALLOWED', label: isMr ? '🌐 मुक्त हजेरी (Anywhere)' : 'Anywhere Allowed' },
                  { value: 'OUTSIDE_RADIUS', label: isMr ? '⚠️ ठिकाणाबाहेर (Violation)' : 'Outside Geofence' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setComplianceFilter(opt.value);
                      setOpenFilterMenu(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: complianceFilter === opt.value ? '#eff6ff' : 'transparent',
                      color: complianceFilter === opt.value ? '#1d4ed8' : '#334155',
                      fontWeight: complianceFilter === opt.value ? 800 : 600,
                      fontSize: '13px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (complianceFilter !== opt.value) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (complianceFilter !== opt.value) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{opt.label}</span>
                    {complianceFilter === opt.value && <Check size={15} style={{ color: '#2563eb' }} />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Active Filter Clear indicator if applied */}
          {(statusFilter !== 'all' || roleFilter !== 'all' || complianceFilter !== 'all' || searchQuery.trim() !== '') && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter('all');
                setRoleFilter('all');
                setComplianceFilter('all');
                setSearchQuery('');
                setAttendanceDate(new Date().toISOString().split('T')[0]);
              }}
              style={{
                background: '#f8fafc',
                border: '1px dashed #94a3b8',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 650,
                color: '#64748b',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.borderColor = '#ef4444';
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#64748b';
                e.currentTarget.style.borderColor = '#94a3b8';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
            >
              <RotateCcw size={13} />
              {isMr ? 'फिल्टर्स रीसेट करा' : 'Reset Filters'}
            </button>
          )}

          <div style={{ marginLeft: 'auto', fontSize: '12px', fontWeight: 650, color: '#64748b' }}>
            {isMr ? 'एकूण निकाल: ' : 'Total results: '}
            <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '13px' }}>{attendances.length}</span>
          </div>
        </div>
      </div>

      {/* --- User Attendance Table with Address & Clickable Everyday History --- */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          borderTop: '3.5px solid #2563eb',
          boxShadow: '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #bfdbfe',
                }}
              >
                <Users size={17} />
              </div>
              <h2 style={{ fontSize: '16.5px', fontWeight: 850, margin: 0, color: '#0f172a' }}>
                {isMr ? 'वापरकर्ते उपस्थिती तपशील व पत्ता (User Attendance & Address Table)' : 'User Attendance & Address Registry'}
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
              {isMr
                ? `👉 कोणत्याही वापरकर्त्यावर क्लिक करून त्यांचा रोजचा हजेरी इतिहास पहा (एकूण ${attendances.length} नोंदी)`
                : `👉 Click any user to review their everyday presentation history (Found ${attendances.length} records)`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#065f46',
                background: '#ecfdf5',
                padding: '5px 12px',
                borderRadius: '20px',
                border: '1px solid #a7f3d0',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)',
              }}
            >
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 6px #10b981',
                }}
              />
              {isMr ? 'थेट डेटाबेस सिंक' : 'Live DB Sync'}
            </span>
          </div>
        </div>

        {/* The Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr
                style={{
                  background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
                  color: '#1e293b',
                  borderBottom: '2px solid #cbd5e1',
                }}
              >
                <th style={{ padding: '13px 18px', fontWeight: 800 }}>#</th>
                <th style={{ padding: '13px 18px', fontWeight: 800 }}>
                  {isMr ? 'वापरकर्ता तपशील (क्लिक करा)' : 'User Details (Click to View History)'}
                </th>
                <th style={{ padding: '13px 18px', fontWeight: 800 }}>{isMr ? 'तारीख व दिवस' : 'Date'}</th>
                <th style={{ padding: '13px 18px', fontWeight: 800 }}>{isMr ? 'Punch In (हजेरी)' : 'Punch In'}</th>
                <th style={{ padding: '13px 18px', fontWeight: 800 }}>{isMr ? 'Punch Out (निर्गमन)' : 'Punch Out'}</th>
                <th style={{ padding: '13px 18px', fontWeight: 800, minWidth: '280px' }}>
                  {isMr ? 'उपस्थिती पत्ता व स्थान (Attendance Address)' : 'Attendance Address'}
                </th>
                <th style={{ padding: '13px 18px', fontWeight: 800 }}>{isMr ? 'स्थान पडताळणी' : 'Compliance'}</th>
                <th style={{ padding: '13px 18px', fontWeight: 800 }}>{isMr ? 'स्थिती' : 'Status'}</th>
                <th style={{ padding: '13px 18px', fontWeight: 800, textAlign: 'center' }}>{isMr ? 'दैनंदिन हजेरी' : 'Everyday History'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px', color: '#2563eb' }} />
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#1e293b' }}>
                      {isMr ? 'उपस्थिती नोंदी डेटाबेसमधून लोड होत आहेत...' : 'Loading attendance records from database...'}
                    </div>
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        background: 'linear-gradient(180deg, #eff6ff 0%, #dbeafe 100%)',
                        border: '1.5px solid #bfdbfe',
                        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 16px',
                        color: '#2563eb',
                      }}
                    >
                      <Users size={32} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '16px', color: '#0f172a' }}>
                      {isMr ? 'कोणतीही उपस्थिती नोंद आढळली नाही' : 'No attendance records found'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', maxWidth: '420px', margin: '6px auto 16px' }}>
                      {isMr ? 'निवडलेल्या तारीख किंवा निकषांनुसार डेटा उपलब्ध नाही.' : 'Try changing date or filters.'}
                    </div>
                    {(roleFilter !== 'all' || complianceFilter !== 'all' || searchQuery.trim() !== '' || selectedDateFilter !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setRoleFilter('all');
                          setComplianceFilter('all');
                          setSearchQuery('');
                          setSelectedDateFilter('all');
                        }}
                        className="tab-btn-3d-blue"
                        style={{ padding: '8px 18px', fontSize: '13px', borderRadius: '10px' }}
                      >
                        <RotateCcw size={14} />
                        {isMr ? 'सर्व फिल्टर्स रीसेट करा' : 'Reset All Filters'}
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                attendances.map((item, idx) => {
                  const roleColor = getRoleBadgeColor(item.user_role);
                  const isCompleted = item.status === 'Completed' || (item.punch_out_time && item.punch_out_time !== '-');
                  const googleMapsUrl = item.latitude && item.longitude
                    ? `https://www.google.com/maps?q=${item.latitude},${item.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address || 'Sangli')}`;

                  return (
                    <tr
                      key={item.id || idx}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'all 0.18s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8fafc';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(37,99,235,0.05)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Index */}
                      <td style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 650 }}>{idx + 1}</td>

                      {/* User Info (Clickable for everyday presentation history) */}
                      <td
                        style={{ padding: '14px 18px', cursor: 'pointer' }}
                        onClick={() => handleOpenUserEverydayHistory(item.user_id, item.user_name)}
                        title={isMr ? 'या वापरकर्त्याचा रोजचा हजेरी इतिहास पाहण्यासाठी क्लिक करा' : 'Click to view everyday attendance history'}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '50%',
                              backgroundColor: roleColor.bg,
                              color: roleColor.text,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 700,
                              fontSize: '14px',
                              border: `1px solid ${roleColor.border}`,
                              flexShrink: 0,
                              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            }}
                          >
                            {(item.user_name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                color: '#0f172a',
                                fontSize: '13px',
                                textDecoration: 'underline',
                                textDecorationColor: '#cbd5e1',
                              }}
                            >
                              {item.user_name || 'अनामित वापरकर्ता'}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                              <span
                                style={{
                                  backgroundColor: roleColor.bg,
                                  color: roleColor.text,
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  fontSize: '10px',
                                  fontWeight: 700,
                                }}
                              >
                                {item.user_role || 'WORKER'}
                              </span>
                              {item.user_phone && (
                                <span style={{ fontSize: '11px', color: '#64748b' }}>{item.user_phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600, color: '#334155' }}>{item.date}</div>
                      </td>

                      {/* Punch In */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: item.punch_in_time && item.punch_in_time !== '-' ? '#059669' : '#94a3b8',
                            }}
                          >
                            {item.punch_in_time || '-'}
                          </span>
                          {item.punch_in_photo && (
                            <button
                              onClick={() => setActivePhotoModal({ title: `${item.user_name} - Punch In Photo`, photo: item.punch_in_photo })}
                              title={isMr ? 'फोटो पहा' : 'View Punch Photo'}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                padding: '2px 5px',
                                cursor: 'pointer',
                                color: '#2563eb',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Camera size={13} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Punch Out */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              fontWeight: 700,
                              color: isCompleted ? '#2563eb' : '#94a3b8',
                            }}
                          >
                            {item.punch_out_time || '-'}
                          </span>
                          {item.punch_out_photo && (
                            <button
                              onClick={() => setActivePhotoModal({ title: `${item.user_name} - Punch Out Photo`, photo: item.punch_out_photo })}
                              title={isMr ? 'फोटो पहा' : 'View Punch Photo'}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '4px',
                                padding: '2px 5px',
                                cursor: 'pointer',
                                color: '#2563eb',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <Camera size={13} />
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Address Column — User Attendance with Address */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                          <div style={{ maxWidth: '340px' }}>
                            <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '13px', lineHeight: '1.4' }}>
                              {item.address || (isMr ? 'पत्ता उपलब्ध नाही (सांगली)' : 'Address not recorded')}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                              {item.latitude && item.longitude && (
                                <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                  ({Number(item.latitude).toFixed(4)}, {Number(item.longitude).toFixed(4)})
                                </span>
                              )}
                              <a
                                href={googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  fontSize: '11px',
                                  color: '#2563eb',
                                  textDecoration: 'none',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '2px',
                                }}
                              >
                                <Map size={11} />
                                {isMr ? 'मॅपवर पहा' : 'View Map'}
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location Compliance */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        {item.compliance_status === 'AT_REQUIRED_LOCATION' ? (
                          <span
                            style={{
                              backgroundColor: '#ecfdf5',
                              color: '#065f46',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              border: '1px solid #a7f3d0',
                            }}
                          >
                            <CheckCircle2 size={12} />
                            {isMr ? 'ठरवलेल्या ठिकाणी' : 'At Required HQ'}
                            {item.distance_meters !== null && ` (${Math.round(item.distance_meters)}m)`}
                          </span>
                        ) : item.compliance_status === 'ANYWHERE_ALLOWED' ? (
                          <span
                            style={{
                              backgroundColor: '#f0f9ff',
                              color: '#0369a1',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              border: '1px solid #bae6fd',
                            }}
                          >
                            <Compass size={12} />
                            {isMr ? 'मुक्त हजेरी' : 'Anywhere Mode'}
                          </span>
                        ) : item.compliance_status === 'MANUAL_VERIFIED' ? (
                          <span
                            style={{
                              backgroundColor: '#fef3c7',
                              color: '#92400e',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              border: '1px solid #fde68a',
                            }}
                          >
                            <ShieldCheck size={12} />
                            {isMr ? 'मॅन्युअल पडताळणी' : 'Manual Verified'}
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#fef2f2',
                              color: '#991b1b',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 700,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              border: '1px solid #fecaca',
                            }}
                          >
                            <AlertTriangle size={12} />
                            {isMr ? 'ठिकाणाबाहेर' : 'Outside Radius'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            backgroundColor: isCompleted ? '#dcfce7' : item.status === 'Present' ? '#fef3c7' : '#f1f5f9',
                            color: isCompleted ? '#15803d' : item.status === 'Present' ? '#b45309' : '#475569',
                          }}
                        >
                          {isCompleted ? (isMr ? 'पूर्ण (Completed)' : 'Completed') : (isMr ? 'हजर (Active)' : 'Present')}
                        </span>
                      </td>

                      {/* Action: Open Everyday Presentation History with 3D tactile button */}
                      <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenUserEverydayHistory(item.user_id, item.user_name)}
                          className="btn-3d-blue"
                          style={{
                            padding: '6px 14px',
                            fontSize: '12px',
                            borderRadius: '8px',
                          }}
                        >
                          <CalendarDays size={14} />
                          {isMr ? 'दैनंदिन हजेरी पहा' : 'Everyday History'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: Admin Location Configuration (Give option for admin) */}
      {/* Includes "Save this location when user uses his own location for all users" */}
      {/* Also shows location name prominently */}
      {/* ============================================================== */}
      {showLocationSettings && (
        <div
          style={modalBackdropStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowLocationSettings(false);
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              width: '100%',
              maxWidth: '580px',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)',
              padding: '24px 28px',
              boxSizing: 'border-box',
              maxHeight: '92vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}
          >
            {/* Header matching image */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '18px', lineHeight: 1 }}>📍</span>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#1e3a8a', letterSpacing: '-0.2px' }}>
                    {isMr ? 'उपस्थिती स्थान सेटिंग्स' : 'Attendance Location Settings'}
                  </h3>
                </div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                  {isMr ? 'कर्मचाऱ्यांसाठी कार्यालयाचे स्थान आणि उपस्थिती नियम सेट करा.' : 'Set office location and attendance rules for employees.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  lineHeight: 1,
                  borderRadius: '6px',
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
                title={isMr ? 'बंद करा' : 'Close'}
              >
                ✕
              </button>
            </div>

            {/* 1. स्थानाचा प्रकार */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 750, color: '#0f172a', marginBottom: '8px' }}>
                {isMr ? '1. स्थानाचा प्रकार' : '1. Location Type'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* कोठूनही हजेरी (Option A) */}
                <button
                  type="button"
                  onClick={() => setPolicy((p) => ({ ...p, is_location_required: false, allow_anywhere: true }))}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '8px',
                    border: !policy.is_location_required ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                    background: !policy.is_location_required ? '#eff6ff' : '#ffffff',
                    color: !policy.is_location_required ? '#2563eb' : '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>🌐</span>
                  <span style={{ fontSize: '13.5px', fontWeight: !policy.is_location_required ? 750 : 600 }}>
                    {isMr ? 'कोठूनही हजेरी' : 'Attendance from Anywhere'}
                  </span>
                </button>

                {/* ठरावीक स्थान (Option B) */}
                <button
                  type="button"
                  onClick={() => setPolicy((p) => ({ ...p, is_location_required: true, allow_anywhere: false }))}
                  style={{
                    padding: '16px 12px',
                    borderRadius: '8px',
                    border: policy.is_location_required ? '1.5px solid #3b82f6' : '1px solid #cbd5e1',
                    background: policy.is_location_required ? '#eff6ff' : '#ffffff',
                    color: policy.is_location_required ? '#2563eb' : '#475569',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    outline: 'none',
                  }}
                >
                  <span style={{ fontSize: '20px', lineHeight: 1 }}>📍</span>
                  <span style={{ fontSize: '13.5px', fontWeight: policy.is_location_required ? 750 : 600 }}>
                    {isMr ? 'ठरावीक स्थान' : 'Fixed Location'}
                  </span>
                </button>
              </div>
            </div>

            {/* 2. कार्यालयाचे नाव */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 750, color: '#0f172a', marginBottom: '8px' }}>
                {isMr ? '2. कार्यालयाचे नाव' : '2. Office Name'}
              </div>
              <input
                type="text"
                value={policy.location_name || ''}
                placeholder={isMr ? 'Shambhara Footi Road मध्यवर्ती कार्यालय (Live HQ)' : 'Office / Headquarters Name'}
                onChange={(e) => setPolicy({ ...policy, location_name: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0f172a',
                  background: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>

            {/* 3. अधिकृत पत्ता */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 750, color: '#0f172a', marginBottom: '8px' }}>
                {isMr ? '3. अधिकृत पत्ता' : '3. Official Address'}
              </div>
              <input
                type="text"
                value={policy.address || ''}
                placeholder={isMr ? 'Shambhara Footi Road, Viya Nagar, सांगली, महाराष्ट्र' : 'Full street address'}
                onChange={(e) => setPolicy({ ...policy, address: e.target.value })}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '11px 14px',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0f172a',
                  background: '#ffffff',
                  marginBottom: '12px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />

              {/* Coordinates: Latitude & Longitude */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 650, color: '#0f172a', marginBottom: '5px' }}>
                    Latitude
                  </div>
                  <input
                    type="text"
                    value={policy.latitude !== undefined && policy.latitude !== null ? policy.latitude : ''}
                    placeholder="16.846266"
                    onChange={(e) => setPolicy({ ...policy, latitude: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>

                <div>
                  <div style={{ fontSize: '13px', fontWeight: 650, color: '#0f172a', marginBottom: '5px' }}>
                    Longitude
                  </div>
                  <input
                    type="text"
                    value={policy.longitude !== undefined && policy.longitude !== null ? policy.longitude : ''}
                    placeholder="74.598727"
                    onChange={(e) => setPolicy({ ...policy, longitude: e.target.value })}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13.5px',
                      color: '#0f172a',
                      background: '#ffffff',
                      outline: 'none',
                      transition: 'border-color 0.15s ease',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                    onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                  />
                </div>
              </div>
            </div>

            {/* 4. जिओफेन्स त्रिज्या */}
            <div>
              <div style={{ fontSize: '14px', fontWeight: 750, color: '#0f172a', marginBottom: '8px' }}>
                {isMr ? '4. जिओफेन्स त्रिज्या' : '4. Geofence Radius'}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  value={policy.radius_meters ? `${policy.radius_meters} मीटर` : '500 मीटर'}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    setPolicy({ ...policy, radius_meters: digits ? parseInt(digits, 10) : '' });
                  }}
                  placeholder="500 मीटर"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '11px 14px',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#0f172a',
                    background: '#ffffff',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
                />
              </div>

              {/* Action Buttons: Detect Location & Save Location */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={handleDetectCurrentLocation}
                  disabled={detectingGps}
                  style={{
                    background: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 650,
                    cursor: detectingGps ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#dbeafe')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#eff6ff')}
                >
                  <span style={{ fontSize: '14px' }}>🎯</span>
                  <span>{detectingGps ? (isMr ? 'शोधत आहे...' : 'Detecting...') : (isMr ? 'माझे स्थान शोधा' : 'Detect My Location')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCurrentLocationForEveryone()}
                  disabled={savingCurrentGpsForEveryone}
                  style={{
                    background: '#dcfce7',
                    color: '#16a34a',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 650,
                    cursor: savingCurrentGpsForEveryone ? 'wait' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.background = '#bbf7d0')}
                  onMouseOut={(e) => (e.currentTarget.style.background = '#dcfce7')}
                >
                  <span>✓</span>
                  <span>{savingCurrentGpsForEveryone ? (isMr ? 'जतन करत आहे...' : 'Saving...') : (isMr ? 'स्थान सेव्ह करा' : 'Save Location')}</span>
                </button>
              </div>

              {gpsNotice && (
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                  ✓ {gpsNotice}
                </div>
              )}
            </div>

            {/* Bottom Footer Actions matching image */}
            <div style={{ display: 'flex', gap: '14px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                onClick={() => setShowLocationSettings(false)}
                style={{
                  flex: 1,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  padding: '11px 20px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: 'pointer',
                  color: '#0f172a',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#ffffff')}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => handleSavePolicy()}
                disabled={savingPolicy}
                style={{
                  flex: 2,
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '11px 24px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: savingPolicy ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.15s ease',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#1d4ed8')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#2563eb')}
              >
                <span>💾</span>
                <span>{savingPolicy ? (isMr ? 'जतन होत आहे...' : 'Saving...') : (isMr ? 'सर्व कर्मचाऱ्यांसाठी सेव्ह करा' : 'Save for all employees')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: User Everyday Presentation & Attendance History Modal */}
      {/* "while clicking any user admin can able to click his everyday presentation with time make sure all are done from the database" */}
      {/* ============================================================== */}
      {selectedUserForHistory && (
        <div
          style={modalBackdropStyle}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedUserForHistory(null);
              setUserEverydayHistory(null);
            }
          }}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div style={{ ...modalContainerStyle, maxWidth: '820px' }}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #000080 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '18px',
                  }}
                >
                  {(selectedUserForHistory.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    {selectedUserForHistory.name} — {isMr ? 'दैनंदिन उपस्थिती व कामाची वेळ' : 'Everyday Presence & Hours'}
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {userEverydayHistory?.user?.role || 'WORKER'} • {userEverydayHistory?.user?.phone || ''} •{' '}
                    <span style={{ color: '#059669', fontWeight: 700 }}>
                      {isMr ? 'डेटाबेसमधून थेट रेकॉर्ड्स' : 'Loaded directly from MySQL database'}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => { setSelectedUserForHistory(null); setUserEverydayHistory(null); }} style={closeBtnStyle}>
                <X size={20} />
              </button>
            </div>

            <div
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: '1 1 auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {userHistoryLoading ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                  <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>
                    {isMr ? 'डेटाबेसमधून दैनंदिन हजेरी नोंदी प्राप्त होत आहेत...' : 'Loading everyday presence records from database...'}
                  </div>
                </div>
              ) : !userEverydayHistory?.history?.length ? (
                <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                  <CalendarDays size={40} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                  <div style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>
                    {isMr ? 'या वापरकर्त्यासाठी उपस्थिती नोंदी उपलब्ध नाहीत' : 'No attendance history found for this user'}
                  </div>
                </div>
              ) : (
                <>
                  {/* Top Stats Summary for this user */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                      gap: '10px',
                      marginBottom: '18px',
                    }}
                  >
                    <div style={historyStatBoxStyle}>
                      <span style={historyStatLabelStyle}>{isMr ? 'एकूण दिवस' : 'Total Days'}</span>
                      <span style={historyStatValueStyle}>{userEverydayHistory.summary.total_days_logged}</span>
                    </div>
                    <div style={historyStatBoxStyle}>
                      <span style={historyStatLabelStyle}>{isMr ? 'उपस्थित (हजर)' : 'Present Days'}</span>
                      <span style={{ ...historyStatValueStyle, color: '#059669' }}>{userEverydayHistory.summary.total_present}</span>
                    </div>
                    <div style={historyStatBoxStyle}>
                      <span style={historyStatLabelStyle}>{isMr ? 'पूर्ण दिवस (Shift)' : 'Completed Shifts'}</span>
                      <span style={{ ...historyStatValueStyle, color: '#2563eb' }}>{userEverydayHistory.summary.total_completed}</span>
                    </div>
                    <div style={historyStatBoxStyle}>
                      <span style={historyStatLabelStyle}>{isMr ? 'ठिकाणी हजेरी' : 'At Required HQ'}</span>
                      <span style={{ ...historyStatValueStyle, color: '#7c3aed' }}>{userEverydayHistory.summary.total_at_hq}</span>
                    </div>
                    <div style={historyStatBoxStyle}>
                      <span style={historyStatLabelStyle}>{isMr ? 'मुक्त हजेरी' : 'Remote / Anywhere'}</span>
                      <span style={{ ...historyStatValueStyle, color: '#0284c7' }}>{userEverydayHistory.summary.total_remote}</span>
                    </div>
                  </div>

                  {/* Everyday Presentation Table */}
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                          <th style={{ padding: '10px 14px', fontWeight: 700 }}>{isMr ? 'तारीख व वार' : 'Date & Day'}</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700 }}>{isMr ? 'Punch In (वेळ)' : 'Punch In'}</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700 }}>{isMr ? 'Punch Out (वेळ)' : 'Punch Out'}</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700 }}>{isMr ? 'कामाची वेळ' : 'Duration'}</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700 }}>{isMr ? 'उपस्थिती पत्ता' : 'Address Recorded'}</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700 }}>{isMr ? 'पडताळणी' : 'Compliance'}</th>
                          <th style={{ padding: '10px 14px', fontWeight: 700 }}>{isMr ? 'स्थिती' : 'Status'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userEverydayHistory.history.map((rec) => {
                          const isDone = rec.status === 'Completed' || (rec.punch_out_time && rec.punch_out_time !== '-');
                          return (
                            <tr key={rec.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{rec.date}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>
                                  {isMr ? rec.day_name_mr || rec.day_name : rec.day_name}
                                </div>
                              </td>

                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 700, color: rec.punch_in_time && rec.punch_in_time !== '-' ? '#059669' : '#94a3b8' }}>
                                    {rec.punch_in_time || '-'}
                                  </span>
                                  {rec.punch_in_photo && (
                                    <button
                                      onClick={() => setActivePhotoModal({ title: `${userEverydayHistory.user.full_name} - ${rec.date} In`, photo: rec.punch_in_photo })}
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                                    >
                                      <Camera size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <span style={{ fontWeight: 700, color: isDone ? '#2563eb' : '#94a3b8' }}>
                                    {rec.punch_out_time || '-'}
                                  </span>
                                  {rec.punch_out_photo && (
                                    <button
                                      onClick={() => setActivePhotoModal({ title: `${userEverydayHistory.user.full_name} - ${rec.date} Out`, photo: rec.punch_out_photo })}
                                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#2563eb' }}
                                    >
                                      <Camera size={13} />
                                    </button>
                                  )}
                                </div>
                              </td>

                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    backgroundColor: rec.duration ? '#f1f5f9' : 'transparent',
                                    padding: rec.duration ? '3px 8px' : 0,
                                    borderRadius: '6px',
                                    fontWeight: 700,
                                    fontSize: '12px',
                                    color: '#334155',
                                  }}
                                >
                                  {rec.duration || '-'}
                                </span>
                              </td>

                              <td style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', maxWidth: '240px' }}>
                                  <MapPin size={14} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                  <div>
                                    <div style={{ fontSize: '12px', color: '#1e293b', fontWeight: 600, lineHeight: '1.3' }}>
                                      {rec.address || 'सांगली, महाराष्ट्र'}
                                    </div>
                                    {rec.latitude && rec.longitude && (
                                      <a
                                        href={`https://www.google.com/maps?q=${rec.latitude},${rec.longitude}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ fontSize: '10px', color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}
                                      >
                                        Google Maps वर पहा
                                      </a>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    backgroundColor: rec.compliance_status === 'AT_REQUIRED_LOCATION' ? '#ecfdf5' : '#f0f9ff',
                                    color: rec.compliance_status === 'AT_REQUIRED_LOCATION' ? '#065f46' : '#0369a1',
                                  }}
                                >
                                  {rec.compliance_status === 'AT_REQUIRED_LOCATION' ? (isMr ? 'ठिकाणी हजर' : 'At HQ') : (isMr ? 'मुक्त हजेरी' : 'Remote')}
                                </span>
                              </td>

                              <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
                                <span
                                  style={{
                                    fontSize: '11px',
                                    fontWeight: 700,
                                    padding: '3px 8px',
                                    borderRadius: '6px',
                                    backgroundColor: isDone ? '#dcfce7' : '#fef3c7',
                                    color: isDone ? '#15803d' : '#b45309',
                                  }}
                                >
                                  {isDone ? (isMr ? 'पूर्ण' : 'Completed') : (isMr ? 'हजर' : 'Present')}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>

            <div style={modalFooterStyle}>
              {userEverydayHistory?.history?.length > 0 && (
                <button
                  type="button"
                  onClick={handleExportUserHistoryCsv}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #cbd5e1',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '13px',
                    cursor: 'pointer',
                    color: '#334155',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Download size={14} />
                  {isMr ? 'या वापरकर्त्याचा CSV डाउनलोड करा' : 'Export User CSV'}
                </button>
              )}
              <button
                type="button"
                onClick={() => { setSelectedUserForHistory(null); setUserEverydayHistory(null); }}
                style={{
                  background: '#0f172a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {isMr ? 'बंद करा' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: Camera Photo Lightbox                                 */}
      {/* ============================================================== */}
      {activePhotoModal && (
        <div
          style={modalBackdropStyle}
          onClick={() => setActivePhotoModal(null)}
          onWheel={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            style={{
              background: '#0f172a',
              padding: '16px',
              borderRadius: '12px',
              maxWidth: '480px',
              width: '90%',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', color: '#ffffff' }}>
              <span style={{ fontWeight: 700, fontSize: '14px' }}>{activePhotoModal.title}</span>
              <button onClick={() => setActivePhotoModal(null)} style={{ background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <img
              src={activePhotoModal.photo}
              alt="Biometric face capture"
              style={{ width: '100%', maxHeight: '420px', objectFit: 'contain', borderRadius: '8px', backgroundColor: '#000000' }}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 4: Manual Mark / Adjust Attendance                       */}
      {/* ============================================================== */}
      {showManualModal && (
        <ManualAttendanceModal
          isMr={isMr}
          users={allUsersList}
          onClose={() => setShowManualModal(false)}
          onSuccess={() => {
            setShowManualModal(false);
            fetchAttendanceData(true);
            showNotification(isMr ? 'मॅन्युअल हजेरी यशस्वीरित्या नोंदवली!' : 'Manual attendance saved successfully!');
          }}
        />
      )}
    </div>
  );
}

// Subcomponent: Manual Attendance Entry Form Modal
function ManualAttendanceModal({ isMr, users, onClose, onSuccess }) {
  const [userId, setUserId] = useState(users[0]?.id || '');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('Present');
  const [punchIn, setPunchIn] = useState('09:30 AM');
  const [punchOut, setPunchOut] = useState('06:00 PM');
  const [address, setAddress] = useState('सांगली मध्यवर्ती कार्यालय, स्टेशन रोड, सांगली');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await apiClient.post('/admin/attendance/manual-mark', {
        user_id: userId,
        date,
        status,
        punch_in_time: punchIn,
        punch_out_time: punchOut,
        address,
        notes,
      });
      if (res.data?.success) {
        onSuccess();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error marking attendance');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={modalBackdropStyle}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onWheel={(e) => {
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      <div style={{ ...modalContainerStyle, maxWidth: 'min(520px, 96vw)', boxSizing: 'border-box' }}>
        <div style={modalHeaderStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800 }}>
              {isMr ? 'मॅन्युअल हजेरी नोंदणी व दुरुस्ती' : 'Manual Attendance Mark & Override'}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isMr ? 'अधिकृत कामासाठी किंवा ऑफलाइन कर्मचाऱ्यांची हजेरी' : 'For duty exemption or offline workers'}
            </span>
          </div>
          <button onClick={onClose} style={closeBtnStyle}>
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            padding: '20px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            overflowY: 'auto',
            flex: '1 1 auto',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div>
            <label style={formLabelStyle}>{isMr ? 'कर्मचारी निवडा' : 'Select User'}</label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              required
              style={formInputStyle}
            >
              <option value="">{isMr ? '-- कर्मचारी निवडा --' : '-- Select User --'}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.full_name} ({u.role || u.role_name || 'User'}) - {u.phone}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div>
              <label style={formLabelStyle}>{isMr ? 'तारीख' : 'Date'}</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={formInputStyle} />
            </div>
            <div>
              <label style={formLabelStyle}>{isMr ? 'स्थिती' : 'Status'}</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={formInputStyle}>
                <option value="Present">{isMr ? 'Present (हजर)' : 'Present'}</option>
                <option value="Completed">{isMr ? 'Completed (पूर्ण)' : 'Completed'}</option>
                <option value="Half-Day">{isMr ? 'Half-Day (अर्धा दिवस)' : 'Half-Day'}</option>
                <option value="Absent">{isMr ? 'Absent (गैरहजर)' : 'Absent'}</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
            <div>
              <label style={formLabelStyle}>{isMr ? 'Punch In वेळ' : 'Punch In Time'}</label>
              <input type="text" value={punchIn} onChange={(e) => setPunchIn(e.target.value)} style={formInputStyle} />
            </div>
            <div>
              <label style={formLabelStyle}>{isMr ? 'Punch Out वेळ' : 'Punch Out Time'}</label>
              <input type="text" value={punchOut} onChange={(e) => setPunchOut(e.target.value)} style={formInputStyle} />
            </div>
          </div>

          <div>
            <label style={formLabelStyle}>{isMr ? 'हजेरीचा पत्ता (Address)' : 'Attendance Address'}</label>
            <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={formInputStyle} />
          </div>

          <div>
            <label style={formLabelStyle}>{isMr ? 'नोंद किंवा शेरा (Notes)' : 'Reason / Notes'}</label>
            <input type="text" placeholder="उदा. निवडणूक प्रचार दौरा / कार्यालयीन काम" value={notes} onChange={(e) => setNotes(e.target.value)} style={formInputStyle} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', cursor: 'pointer' }}>
              {isMr ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '8px 20px',
                borderRadius: '6px',
                border: 'none',
                background: '#2563eb',
                color: '#ffffff',
                fontWeight: 700,
                cursor: submitting ? 'wait' : 'pointer',
              }}
            >
              {submitting ? 'जतन करत आहे...' : (isMr ? 'हजेरी जतन करा' : 'Save Attendance')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Helpers
function getRoleBadgeColor(role) {
  const r = (role || '').toUpperCase();
  if (r === 'ADMIN' || r === 'SUPER_ADMIN') {
    return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
  }
  if (r === 'OFFICER') {
    return { bg: '#fff7ed', text: '#c2410c', border: '#ffedd5' };
  }
  return { bg: '#eff6ff', text: '#1d4ed8', border: '#dbeafe' };
}

// Inline Styles
const cardStyle = {
  background: '#ffffff',
  borderRadius: '14px',
  padding: '18px 20px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
};

const filterPillStyle = (isActive) => ({
  background: isActive ? '#0f172a' : 'transparent',
  color: isActive ? '#ffffff' : '#475569',
  border: 'none',
  padding: '6px 12px',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: isActive ? 700 : 500,
  cursor: 'pointer',
  transition: 'all 0.15s ease',
});

const modalBackdropStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.65)',
  backdropFilter: 'blur(4px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '16px',
  overscrollBehavior: 'contain',
};

const modalContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: '16px',
  width: '100%',
  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  overflow: 'hidden',
  maxHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  overscrollBehavior: 'contain',
};

const modalHeaderStyle = {
  padding: '18px 24px',
  borderBottom: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#f8fafc',
  flexShrink: 0,
};

const modalFooterStyle = {
  padding: '14px 24px',
  borderTop: '1px solid #e2e8f0',
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '10px',
  background: '#f8fafc',
  flexShrink: 0,
};

const closeBtnStyle = {
  background: 'transparent',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  padding: '4px',
};

const formLabelStyle = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  color: '#334155',
  marginBottom: '4px',
};

const formInputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '9px 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  outline: 'none',
  color: '#0f172a',
  background: '#ffffff',
};

const historyStatBoxStyle = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '10px 12px',
  textAlign: 'center',
};

const historyStatLabelStyle = {
  display: 'block',
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase',
  marginBottom: '2px',
};

const historyStatValueStyle = {
  fontSize: '18px',
  fontWeight: 800,
  color: '#0f172a',
};
