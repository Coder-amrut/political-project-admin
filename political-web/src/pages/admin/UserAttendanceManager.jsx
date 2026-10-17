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
  ArrowRight
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
    location_name: 'सांगली मध्यवर्ती निवडणूक नियंत्रण कक्ष (Sangli Central HQ)',
    address: 'स्टेशन रोड, विश्रामबाग जवळ, सांगली, महाराष्ट्र ४१६४१६',
    latitude: 16.8524,
    longitude: 74.5815,
    radius_meters: 500,
    enforce_strict_geofence: true,
  });

  // Filters
  const [selectedDateFilter, setSelectedDateFilter] = useState('today'); // 'today', 'yesterday', 'all', 'custom'
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complianceFilter, setComplianceFilter] = useState('all');

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

  // Determine current effective date
  const effectiveDate = useMemo(() => {
    if (selectedDateFilter === 'today') return 'today';
    if (selectedDateFilter === 'yesterday') {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      return d.toISOString().split('T')[0];
    }
    if (selectedDateFilter === 'custom') return customDate;
    return 'all';
  }, [selectedDateFilter, customDate]);

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
    <div style={{ padding: '24px', fontFamily: "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif", color: '#0f172a' }}>
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
        {/* Tiranga Accent Strip */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #FF9933 0%, #FFFFFF 50%, #138808 100%)',
          }}
        />

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
                ? 'सर्व क्षेत्र अधिकाऱ्यांची व कर्मचाऱ्यांची पत्त्यासह दैनंदिन उपस्थिती तपासा. कोणत्याही वापरकर्त्यावर क्लिक करून त्यांची रोजची हजेरी वेळ व पत्ता पहा.'
                : 'Monitor officer attendance with physical addresses. Click any user to review their everyday presentation history with time.'}
            </p>
          </div>

          {/* Action Buttons in Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowLocationSettings(true)}
              style={{
                background: policy.is_location_required
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
                transition: 'all 0.2s ease',
              }}
            >
              <MapPin size={16} />
              {isMr ? 'स्थान निश्चित करा (Set Location for All)' : 'Set Location for All Users'}
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

        {/* --- Active Policy Alert Ribbon showing Location Name & Details --- */}
        <div
          style={{
            marginTop: '20px',
            padding: '14px 18px',
            borderRadius: '10px',
            backgroundColor: policy.is_location_required ? 'rgba(16, 185, 129, 0.15)' : 'rgba(59, 130, 246, 0.15)',
            border: policy.is_location_required ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: policy.is_location_required ? '#10b981' : '#38bdf8',
                boxShadow: policy.is_location_required ? '0 0 10px #10b981' : '0 0 10px #38bdf8',
                marginTop: '5px',
              }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>
                {policy.is_location_required ? (
                  <>
                    <span>📍 {isMr ? 'अनिवार्य स्थान नाव (Location Name): ' : 'Mandatory Location: '}</span>
                    <strong style={{ color: '#34d399', fontSize: '14px', textDecoration: 'underline' }}>
                      {policy.location_name || 'सांगली मध्यवर्ती कार्यालय'}
                    </strong>
                  </>
                ) : (
                  <span>🌐 {isMr ? 'मुक्त उपस्थिती धोरण सक्रिय (Anywhere Allowed):' : 'Flexible Anywhere Attendance Active:'}</span>
                )}
              </div>
              <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '3px' }}>
                {policy.is_location_required ? (
                  <>
                    <strong>{isMr ? 'पत्ता: ' : 'Address: '}</strong>
                    <span>{policy.address || 'सांगली'}</span> •{' '}
                    <strong>{isMr ? 'जिओफेन्स त्रिज्या: ' : 'Radius: '}</strong>
                    <span>{policy.radius_meters || 500} {isMr ? 'मीटर' : 'm'}</span>
                    {policy.latitude && (
                      <span style={{ marginLeft: '6px', fontFamily: 'monospace', color: '#94a3b8' }}>
                        ({Number(policy.latitude).toFixed(4)}, {Number(policy.longitude).toFixed(4)})
                      </span>
                    )}
                  </>
                ) : (
                  <span>
                    {isMr
                      ? 'कोणतेही स्थान बंधन नाही. सर्व कर्मचारी कोणत्याही ठिकाणाहून उपस्थिती नोंदवू शकतात.'
                      : 'No specific location required. All users can punch attendance from any location.'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => setShowLocationSettings(true)}
              style={{
                background: 'rgba(255, 255, 255, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Sliders size={14} />
              {isMr ? 'स्थान बदला / व्यवस्थापित करा' : 'Change Location / Policy'}
            </button>
          </div>
        </div>
      </div>

      {/* --- Live KPI Summary Cards --- */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Total Staff */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              {isMr ? 'एकूण नोंदणीकृत कर्मचारी' : 'Total Registered Staff'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#f1f5f9', color: '#334155' }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#0f172a' }}>{stats.total_users || 0}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {isMr ? 'डेटाबेसमधील सक्रिय कर्मचारी' : 'Active users in database'}
          </div>
        </div>

        {/* Present Today */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', textTransform: 'uppercase' }}>
              {isMr ? 'आज उपस्थित (हजर)' : 'Present Today'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#ecfdf5', color: '#059669' }}>
              <UserCheck size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontSize: '26px', fontWeight: 800, color: '#059669' }}>{stats.present_today || 0}</div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#10b981' }}>
              ({stats.attendance_percentage || 0}%)
            </span>
          </div>
          <div style={{ height: '5px', background: '#e2e8f0', borderRadius: '4px', marginTop: '8px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.min(100, stats.attendance_percentage || 0)}%`,
                height: '100%',
                background: '#10b981',
                borderRadius: '4px',
              }}
            />
          </div>
        </div>

        {/* Currently Active in Field (Punched In) */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#d97706', textTransform: 'uppercase' }}>
              {isMr ? 'सध्या ऑन-फील्ड (कामावर)' : 'Currently In-Field'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fffbeb', color: '#d97706' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#d97706' }}>{stats.punched_in_now || 0}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {isMr ? 'Punch In केलेले (काम चालू)' : 'Punched in (Duty ongoing)'}
          </div>
        </div>

        {/* Completed Shift */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              {isMr ? 'काम पूर्ण (Punched Out)' : 'Completed Shift'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#2563eb' }}>{stats.completed_today || 0}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {isMr ? 'दिवसाचे काम पूर्ण नोंदवलेले' : 'Punched out after duty'}
          </div>
        </div>

        {/* Absent */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#ef4444', textTransform: 'uppercase' }}>
              {isMr ? 'हजेरी बाकी / गैरहजर' : 'Pending / Absent'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444' }}>
              <UserX size={16} />
            </div>
          </div>
          <div style={{ fontSize: '26px', fontWeight: 800, color: '#ef4444' }}>{stats.absent_today || 0}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {isMr ? 'आज अजून हजेरी नाही' : 'Not punched today yet'}
          </div>
        </div>

        {/* Location Compliance Ratio */}
        <div style={cardStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#7c3aed', textTransform: 'uppercase' }}>
              {isMr ? 'स्थान पडताळणी प्रमाण' : 'Geofence Compliance'}
            </span>
            <div style={{ padding: '6px', borderRadius: '8px', background: '#f5f3ff', color: '#7c3aed' }}>
              <ShieldCheck size={16} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#7c3aed' }}>
              {stats.at_designated_location || 0}
            </div>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isMr ? 'ठिकाणी' : 'At HQ'} / {stats.remote_anywhere || 0} {isMr ? 'मुक्त' : 'Remote'}
            </span>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
            {policy.is_location_required
              ? isMr ? 'सर्व ठरवलेल्या ठिकाणी आवश्यक' : 'Mandatory place enforced'
              : isMr ? 'कुठूनही हजेरीस मुभा' : 'Flexible location mode'}
          </div>
        </div>
      </div>

      {/* --- Filters & Search Toolbar --- */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          padding: '18px 20px',
          marginBottom: '20px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', flex: 1 }}>
          {/* Search Input */}
          <div style={{ position: 'relative', minWidth: '260px', flex: '1 1 280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder={isMr ? 'नाव, फोन किंवा पत्त्यानुसार शोधा...' : 'Search by name, phone, or address...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Date Selector Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f8fafc', padding: '4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button
              onClick={() => setSelectedDateFilter('today')}
              style={filterPillStyle(selectedDateFilter === 'today')}
            >
              {isMr ? 'आज' : 'Today'}
            </button>
            <button
              onClick={() => setSelectedDateFilter('yesterday')}
              style={filterPillStyle(selectedDateFilter === 'yesterday')}
            >
              {isMr ? 'काल' : 'Yesterday'}
            </button>
            <button
              onClick={() => setSelectedDateFilter('all')}
              style={filterPillStyle(selectedDateFilter === 'all')}
            >
              {isMr ? 'सर्व दिवस' : 'All Time'}
            </button>
            <button
              onClick={() => setSelectedDateFilter('custom')}
              style={filterPillStyle(selectedDateFilter === 'custom')}
            >
              <Calendar size={13} style={{ marginRight: '4px', verticalAlign: 'text-bottom' }} />
              {isMr ? 'तारीख निवडा' : 'Custom'}
            </button>
          </div>

          {selectedDateFilter === 'custom' && (
            <input
              type="date"
              value={customDate}
              onChange={(e) => setCustomDate(e.target.value)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
              }}
            />
          )}

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              background: '#ffffff',
              color: '#334155',
            }}
          >
            <option value="all">{isMr ? 'सर्व भूमिका (All Roles)' : 'All Roles'}</option>
            <option value="WORKER">{isMr ? 'क्षेत्र अधिकारी (Field Officer)' : 'Field Officer'}</option>
            <option value="OFFICER">{isMr ? 'अधिकारी / नेता (OFFICER)' : 'Officer'}</option>
            <option value="ADMIN">{isMr ? 'प्रशासक (ADMIN)' : 'Admin'}</option>
          </select>

          {/* Compliance Filter */}
          <select
            value={complianceFilter}
            onChange={(e) => setComplianceFilter(e.target.value)}
            style={{
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              background: '#ffffff',
              color: '#334155',
            }}
          >
            <option value="all">{isMr ? 'सर्व स्थान प्रकार' : 'All Compliance'}</option>
            <option value="AT_REQUIRED_LOCATION">{isMr ? '✅ ठरवलेल्या ठिकाणी हजर' : 'At Required Location'}</option>
            <option value="ANYWHERE_ALLOWED">{isMr ? '🌐 मुक्त हजेरी (Anywhere)' : 'Anywhere Allowed'}</option>
            <option value="OUTSIDE_RADIUS">{isMr ? '⚠️ ठिकाणाबाहेर (Violation)' : 'Outside Geofence'}</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setShowManualModal(true)}
            style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              color: '#334155',
              padding: '8px 14px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <FileText size={15} />
            {isMr ? 'मॅन्युअल नोंद / दुरुस्ती' : 'Manual Entry'}
          </button>
        </div>
      </div>

      {/* --- User Attendance Table with Address & Clickable Everyday History --- */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
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
            backgroundColor: '#f8fafc',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: '#0f172a' }}>
              {isMr ? 'वापरकर्ते उपस्थिती तपशील व पत्ता (User Attendance & Address Table)' : 'User Attendance & Address Registry'}
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isMr
                ? `👉 कोणत्याही वापरकर्त्यावर क्लिक करून त्यांचा रोजचा हजेरी इतिहास पहा (एकूण ${attendances.length} नोंदी)`
                : `👉 Click any user to review their everyday presentation history (Found ${attendances.length} records)`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#475569',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              {isMr ? 'थेट डेटाबेस सिंक' : 'Live DB Sync'}
            </span>
          </div>
        </div>

        {/* The Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#475569', borderBottom: '1px solid #cbd5e1' }}>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>#</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>
                  {isMr ? 'वापरकर्ता तपशील (क्लिक करा)' : 'User Details (Click to View History)'}
                </th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>{isMr ? 'तारीख व दिवस' : 'Date'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>{isMr ? 'Punch In (हजेरी)' : 'Punch In'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>{isMr ? 'Punch Out (निर्गमन)' : 'Punch Out'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, minWidth: '280px' }}>
                  {isMr ? 'उपस्थिती पत्ता व स्थान (Attendance Address)' : 'Attendance Address'}
                </th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>{isMr ? 'स्थान पडताळणी' : 'Compliance'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 700 }}>{isMr ? 'स्थिती' : 'Status'}</th>
                <th style={{ padding: '12px 18px', fontWeight: 700, textAlign: 'center' }}>{isMr ? 'दैनंदिन हजेरी' : 'Everyday History'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                    <RefreshCw size={28} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <div style={{ fontWeight: 600 }}>{isMr ? 'उपस्थिती नोंदी डेटाबेसमधून लोड होत आहेत...' : 'Loading attendance records from database...'}</div>
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
                    <Users size={36} style={{ margin: '0 auto 12px', color: '#cbd5e1' }} />
                    <div style={{ fontWeight: 700, fontSize: '15px', color: '#334155' }}>
                      {isMr ? 'कोणतीही उपस्थिती नोंद आढळली नाही' : 'No attendance records found'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                      {isMr ? 'निवडलेल्या तारीख किंवा निकषांनुसार डेटा उपलब्ध नाही.' : 'Try changing date or filters.'}
                    </div>
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
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Index */}
                      <td style={{ padding: '14px 18px', color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>

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

                      {/* Action: Open Everyday Presentation History */}
                      <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={() => handleOpenUserEverydayHistory(item.user_id, item.user_name)}
                          style={{
                            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                            border: '1px solid #93c5fd',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#1d4ed8',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 1px 3px rgba(37,99,235,0.1)',
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
          <div style={{ ...modalContainerStyle, maxWidth: '660px' }}>
            <div style={modalHeaderStyle}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                  {isMr ? '📍 उपस्थिती स्थान व जिओफेन्सिंग नियंत्रण धोरण' : '📍 Attendance Location & Geofence Policy'}
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  {isMr
                    ? 'अ‍ॅडमिनने स्थान ठरवल्यास सर्वांना तिथेच उपस्थिती द्यावी लागेल. स्थान न ठरवल्यास ते कोठूनही हजेरी देऊ शकतात.'
                    : 'Set a mandatory location for attendance. If set, all users must go to this place; otherwise they can attend from anywhere.'}
                </p>
              </div>
              <button onClick={() => setShowLocationSettings(false)} style={closeBtnStyle}>
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                padding: '24px',
                overflowY: 'auto',
                flex: '1 1 auto',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {/* Big Mode Switch Toggle */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginBottom: '20px',
                  padding: '6px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '12px',
                }}
              >
                {/* Option A: Anywhere Allowed */}
                <button
                  type="button"
                  onClick={() => setPolicy((p) => ({ ...p, is_location_required: false, allow_anywhere: true }))}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: !policy.is_location_required ? '#ffffff' : 'transparent',
                    color: !policy.is_location_required ? '#0284c7' : '#64748b',
                    boxShadow: !policy.is_location_required ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Compass size={20} />
                  <span>{isMr ? '🌐 कुठूनही हजेरी मुभा' : '🌐 Anywhere Allowed'}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>
                    {isMr ? '(स्थान बंधन नाही)' : '(No location restriction)'}
                  </span>
                </button>

                {/* Option B: Mandatory Specific Location */}
                <button
                  type="button"
                  onClick={() => setPolicy((p) => ({ ...p, is_location_required: true, allow_anywhere: false }))}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: policy.is_location_required ? '#ffffff' : 'transparent',
                    color: policy.is_location_required ? '#15803d' : '#64748b',
                    boxShadow: policy.is_location_required ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <MapPin size={20} />
                  <span>{isMr ? '📍 ठरवलेले स्थान अनिवार्य' : '📍 Mandatory Specific Location'}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: '#94a3b8' }}>
                    {isMr ? '(सर्व कर्मचाऱ्यांसाठी हे स्थान अनिवार्य)' : '(Mandatory for all users)'}
                  </span>
                </button>
              </div>

              {/* Form Controls */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Location Name Field — "Also show this location into name" */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={formLabelStyle}>
                      {isMr ? '📍 अनिवार्य स्थानाचे नाव (Location Name):' : '📍 Designated Location Name:'}
                    </label>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {isMr ? '(सर्व कर्मचाऱ्यांना हे नाव दिसेल)' : '(Visible to all users)'}
                    </span>
                  </div>
                  <input
                    type="text"
                    value={policy.location_name || ''}
                    placeholder="उदा. सांगली मध्यवर्ती निवडणूक कार्यालय"
                    onChange={(e) => setPolicy({ ...policy, location_name: e.target.value })}
                    style={{ ...formInputStyle, fontWeight: 700, color: '#1e3a8a', borderColor: '#93c5fd' }}
                  />
                </div>

                {/* Detect My Current Location Box with Save Option for All Users */}
                <div
                  style={{
                    backgroundColor: '#eff6ff',
                    border: '1.5px dashed #60a5fa',
                    borderRadius: '10px',
                    padding: '14px 16px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '13px', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Crosshair size={16} />
                        {isMr ? '🎯 अ‍ॅडमिनचे स्वतःचे चालू स्थान वापरा (Use My Own Location)' : '🎯 Use Admin Current Location'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {isMr
                          ? 'आपण सध्या ज्या ठिकाणी आहात, ते स्थान सर्व कर्मचाऱ्यांसाठी अनिवार्य करा.'
                          : 'Set your current device location as the mandatory checkpoint for all users.'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={handleDetectCurrentLocation}
                        disabled={detectingGps}
                        style={{
                          background: '#ffffff',
                          border: '1px solid #3b82f6',
                          borderRadius: '8px',
                          padding: '7px 12px',
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#2563eb',
                          cursor: detectingGps ? 'wait' : 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <Crosshair size={14} style={{ animation: detectingGps ? 'spin 1s linear infinite' : 'none' }} />
                        {detectingGps ? (isMr ? 'शोधत आहे...' : 'Detecting...') : (isMr ? 'स्थान शोधा' : 'Detect GPS')}
                      </button>

                      {/* Direct SAVE button when using own location */}
                      {policy.latitude && policy.longitude && (
                        <button
                          type="button"
                          onClick={() => handleSaveCurrentLocationForEveryone()}
                          disabled={savingCurrentGpsForEveryone}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '7px 14px',
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#ffffff',
                            cursor: savingCurrentGpsForEveryone ? 'wait' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          <Check size={14} />
                          {savingCurrentGpsForEveryone
                            ? (isMr ? 'जतन करत आहे...' : 'Saving...')
                            : (isMr ? '💾 हे स्थान सर्वांसाठी सेव्ह करा' : '💾 Save this Location for All Users')}
                        </button>
                      )}
                    </div>
                  </div>

                  {gpsNotice && (
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#047857', fontWeight: 600 }}>
                      ✓ {gpsNotice}
                    </div>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label style={formLabelStyle}>
                    {isMr ? 'अधिकृत पत्ता (Official Address)' : 'Official Address'}
                  </label>
                  <textarea
                    rows={2}
                    value={policy.address || ''}
                    placeholder="उदा. स्टेशन रोड, विश्रामबाग जवळ, सांगली ४१६४१६"
                    onChange={(e) => setPolicy({ ...policy, address: e.target.value })}
                    style={{ ...formInputStyle, resize: 'vertical' }}
                  />
                </div>

                {/* GPS Coordinates */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={formLabelStyle}>{isMr ? 'अक्षांश (Latitude)' : 'Latitude'}</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={policy.latitude || ''}
                      placeholder="16.8524"
                      onChange={(e) => setPolicy({ ...policy, latitude: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                  <div>
                    <label style={formLabelStyle}>{isMr ? 'रेखांश (Longitude)' : 'Longitude'}</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={policy.longitude || ''}
                      placeholder="74.5815"
                      onChange={(e) => setPolicy({ ...policy, longitude: e.target.value })}
                      style={formInputStyle}
                    />
                  </div>
                </div>

                {/* Radius Slider & Chips */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={formLabelStyle}>
                      {isMr ? 'जिओफेन्स मर्यादा (Allowed Radius around Location)' : 'Allowed Geofence Radius'}
                    </label>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#2563eb' }}>
                      {policy.radius_meters || 500} {isMr ? 'मीटर' : 'meters'}
                    </span>
                  </div>

                  <input
                    type="range"
                    min="50"
                    max="5000"
                    step="50"
                    value={policy.radius_meters || 500}
                    onChange={(e) => setPolicy({ ...policy, radius_meters: parseInt(e.target.value, 10) })}
                    style={{ width: '100%', accentColor: '#2563eb' }}
                  />

                  {/* Quick Radius Chips */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                    {[100, 250, 500, 1000, 2000].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setPolicy({ ...policy, radius_meters: r })}
                        style={{
                          background: policy.radius_meters === r ? '#2563eb' : '#f1f5f9',
                          color: policy.radius_meters === r ? '#ffffff' : '#475569',
                          border: 'none',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {r >= 1000 ? `${r / 1000} km` : `${r}m`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Presets for Sangli */}
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    {isMr ? 'त्वरित पूर्वनिर्धारित ठिकाणे निवडा:' : 'Quick Presets (Sangli Region):'}
                  </span>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {presets.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => applyPresetLocation(preset)}
                        style={{
                          background: '#f8fafc',
                          border: '1px solid #cbd5e1',
                          padding: '5px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#334155',
                          cursor: 'pointer',
                        }}
                      >
                        📍 {preset.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={modalFooterStyle}>
              <button
                type="button"
                onClick={() => setShowLocationSettings(false)}
                style={{
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  padding: '9px 18px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                  color: '#475569',
                }}
              >
                {isMr ? 'रद्द करा' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={() => handleSavePolicy()}
                disabled={savingPolicy}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 22px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: savingPolicy ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                }}
              >
                {savingPolicy ? <RefreshCw size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Check size={15} />}
                {isMr ? '💾 सर्व कर्मचाऱ्यांसाठी लागू करा (Save for All)' : 'Save & Enforce for All Users'}
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
      <div style={{ ...modalContainerStyle, maxWidth: '520px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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
