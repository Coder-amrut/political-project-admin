import React from 'react';
import {
  Clock,
  ShieldCheck,
  MapPin,
  RefreshCw,
  LogIn,
  LogOut,
  UserCheck,
  CheckCircle2,
  X,
  AlertTriangle,
} from 'lucide-react';
import Webcam from 'react-webcam';

export default function AttendanceTab({
  isMr,
  t,
  attendanceHistory = [],
  attendanceState,
  attendancePolicy,
  currentCoords,
  locationDetecting,
  detectCurrentLocation,
  startPunchIn,
  startPunchOut,
  isScanningFace,
  setIsScanningFace,
  punchMode,
  webcamRef,
  webcamError,
  setWebcamError,
  confirmPunch,
  LiveClock,
}) {
  const todayRecord = attendanceHistory && attendanceHistory.length > 0 ? attendanceHistory[0] : null;
  const hasPunchedIn = Boolean(todayRecord?.punch_in_time && todayRecord.punch_in_time !== '-');

  return (
    <div className="module-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header with Title and IST Live Clock */}
      <div className="page-header" style={{ marginBottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h1 className="page-title">{isMr ? 'डिजिटल उपस्थिती व जिओ पंच' : 'Geo Attendance Desk'}</h1>
            <span className="karyakarta-badge karyakarta-badge-live">
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#059669', display: 'inline-block' }}></span>
              {isMr ? 'GPS थेट प्रणाली' : 'GPS Live'}
            </span>
          </div>
          <div className="page-subtitle">
            {isMr ? 'GPS स्थान पडताळणी आणि सेल्फी फेस स्कॅनसह दैनंदिन हजेरी (Punch In व Punch Out) नोंदवा.' : 'Daily attendance with GPS location verification and selfie face scan.'}
          </div>
        </div>

        {/* Live IST Clock Card */}
        {LiveClock && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '8px 16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ea580c' }}>
              <Clock size={18} />
            </div>
            <LiveClock isMr={isMr} variant="card" />
          </div>
        )}
      </div>

      {/* Location Policy & GPS Status Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
        }}
      >
        {/* Admin Policy Notice */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: attendancePolicy?.is_location_required ? '#ecfdf5' : '#f0f9ff',
            border: attendancePolicy?.is_location_required ? '1px solid #a7f3d0' : '1px solid #bae6fd',
            color: attendancePolicy?.is_location_required ? '#065f46' : '#0369a1',
            fontSize: '12.5px',
            lineHeight: '1.5',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <ShieldCheck size={22} style={{ flexShrink: 0 }} />
          <div>
            <strong style={{ display: 'block', fontSize: '12.5px' }}>
              {attendancePolicy?.is_location_required ? (isMr ? '📍 अ‍ॅडमिन उपस्थिती धोरण (अनिवार्य स्थान)' : 'Admin Designated Location Enforced') : (isMr ? '🌐 लवचिक उपस्थिती धोरण' : 'Flexible Attendance Policy')}
            </strong>
            <span>
              {attendancePolicy?.is_location_required
                ? `${attendancePolicy.location_name || 'सांगली कार्यालय'} (${attendancePolicy.address || 'सांगली'}) • जिओफेन्स मर्यादा: ${attendancePolicy.radius_meters || 500} मीटर`
                : (isMr ? 'आपण कार्यक्षेत्रातून कोणत्याही ठिकाणाहून हजेरी नोंदवू शकता (Anywhere Attendance Allowed).' : 'You can punch attendance from any field location.')}
            </span>
          </div>
        </div>

        {/* Current Detected Coordinates Strip */}
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            fontSize: '12.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <MapPin size={20} color="#2563eb" style={{ flexShrink: 0 }} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                {isMr ? 'सध्याचे GPS स्थान (Current Location)' : 'Current GPS Location'}
              </div>
              <div style={{ fontWeight: '700', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '300px' }} title={currentCoords?.address || 'स्थान मिळवत आहे...'}>
                {locationDetecting
                  ? (isMr ? '🔄 GPS स्थान शोधत आहे...' : 'Detecting GPS...')
                  : currentCoords?.address
                    ? currentCoords.address
                    : currentCoords?.latitude
                      ? `Lat: ${currentCoords.latitude}, Lng: ${currentCoords.longitude}`
                      : (isMr ? 'स्थान उपलब्ध नाही (Detect Location वर क्लिक करा)' : 'GPS not detected yet')}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="karyakarta-btn karyakarta-btn-secondary"
            onClick={detectCurrentLocation}
            disabled={locationDetecting}
            title="रिफ्रेश स्थान"
            style={{ padding: '6px 12px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
          >
            <RefreshCw size={13} className={locationDetecting ? 'animate-spin' : ''} />
            <span>{isMr ? 'रिफ्रेश GPS' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* PROGRESSIVE PUNCH DESK: SHOWS PUNCH IN, AND AFTER PUNCH IN SHOWS PUNCH OUT THERE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
        {/* MAIN PROGRESSIVE ACTION CARD */}
        <div
          className={`attendance-punch-card ${!hasPunchedIn ? 'in-card' : attendanceState === 'Completed' ? '' : 'out-card'}`}
          style={{ minHeight: '320px' }}
        >
          {!hasPunchedIn ? (
            /* STATE 1: NOT PUNCHED IN YET -> SHOW PUNCH IN */
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LogIn size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {isMr ? 'सकाळची हजेरी (Morning Punch In)' : 'Morning Punch In'}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                        {isMr ? 'ड्युटी प्रारंभ • उपस्थिती नोंदवा' : 'Start Shift • Check In'}
                      </span>
                    </div>
                  </div>

                  <span className="karyakarta-badge karyakarta-badge-amber">
                    {isMr ? '⚪ हजेरी बाकी' : 'Pending'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  {isMr
                    ? 'कामावर रुजू होताना सेल्फी फोटो काढून आणि चालू GPS स्थान निश्चित करून पंच इन नोंदवा.'
                    : 'Start your shift by capturing a live selfie photo and verifying your GPS location.'}
                </p>

                <div style={{ background: '#ffffff', border: '1px dashed #cbd5e1', borderRadius: '10px', padding: '12px 14px', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <MapPin size={18} color="#2563eb" style={{ flexShrink: 0 }} />
                  <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentCoords?.address || (isMr ? 'चालू GPS स्थान आपोआप जोडले जाईल' : 'Live GPS coordinates will be captured')}
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  className="punch-btn-in"
                  onClick={startPunchIn}
                >
                  <LogIn size={18} />
                  <span>{isMr ? '🟢 Punch In करा (सकाळची हजेरी)' : 'Punch In (Start Shift)'}</span>
                </button>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
                  {isMr ? '📷 कॅमेरा सेल्फी + GPS स्थान तपासणी' : 'Live Camera Selfie + Geotag'}
                </div>
              </div>
            </>
          ) : attendanceState !== 'Completed' ? (
            /* STATE 2: ALREADY PUNCHED IN -> SHOW PUNCH OUT RIGHT THERE! */
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <LogOut size={22} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {isMr ? 'संध्याकाळचे निर्गमन (Evening Punch Out)' : 'Evening Punch Out'}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#ea580c', fontWeight: '600' }}>
                        {isMr ? 'ड्युटी समाप्ती • निर्गमन नोंदवा' : 'End Shift • Check Out'}
                      </span>
                    </div>
                  </div>

                  <span className="karyakarta-badge karyakarta-badge-live">
                    {isMr ? '🟢 ड्युटी सुरू (On Duty)' : 'On Duty'}
                  </span>
                </div>

                {/* Today's Punch In Confirmation Strip */}
                <div style={{ background: '#ffffff', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px 14px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {todayRecord?.punch_in_photo ? (
                      <img
                        src={todayRecord.punch_in_photo}
                        alt="Punch In Selfie"
                        style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid #86efac' }}
                      />
                    ) : (
                      <div style={{ width: '42px', height: '42px', borderRadius: '8px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                        <UserCheck size={20} />
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '11px', color: '#059669', fontWeight: '700' }}>
                        {isMr ? '✓ सकाळची हजेरी नोंद झाली' : 'Punched In Successfully'}
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: '#0f172a' }}>
                        ⏰ {todayRecord?.punch_in_time}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={startPunchIn}
                    style={{ background: 'transparent', border: 'none', color: '#059669', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', textDecoration: 'underline' }}
                    title="पुन्हा Punch In अपडेट करा"
                  >
                    {isMr ? 'अपडेट' : 'Update'}
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  {isMr
                    ? 'आपण सध्या ड्युटीवर आहात. दिवसाचे क्षेत्रीय कार्य संपल्यावर आता खालील बटनावर क्लिक करून Punch Out नोंदवा.'
                    : 'Your shift is active. When you finish work today, click below to log your exit punch out.'}
                </p>
              </div>

              <div>
                <button
                  type="button"
                  className="punch-btn-out"
                  onClick={startPunchOut}
                >
                  <LogOut size={18} />
                  <span>{isMr ? '🟠 Punch Out करा (संध्याकाळचे निर्गमन)' : 'Punch Out (End Shift)'}</span>
                </button>
                <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
                  {isMr ? '⏱️ सेल्फी फोटो व निर्गमन वेळेसह कर्तव्य समाप्त' : 'Duty completion time & exit photo'}
                </div>
              </div>
            </>
          ) : (
            /* STATE 3: SHIFT COMPLETED -> BOTH RECORDED */
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CheckCircle2 size={24} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                        {isMr ? 'आजचे कर्तव्य पूर्ण (Shift Completed)' : "Today's Shift Completed"}
                      </h3>
                      <span style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                        {isMr ? 'हजेरी व निर्गमन दोन्ही नोंदवले' : 'Punch In & Punch Out Logged'}
                      </span>
                    </div>
                  </div>

                  <span className="karyakarta-badge karyakarta-badge-live">
                    {isMr ? '✓ पूर्ण झाले' : 'Completed'}
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {todayRecord?.punch_in_photo && (
                      <img src={todayRecord.punch_in_photo} alt="Punch In" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#16a34a', fontWeight: '700' }}>{isMr ? 'पंच इन' : 'Punch In'}</span>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{todayRecord?.punch_in_time}</div>
                    </div>
                  </div>

                  <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {todayRecord?.punch_out_photo && (
                      <img src={todayRecord.punch_out_photo} alt="Punch Out" style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }} />
                    )}
                    <div>
                      <span style={{ fontSize: '10.5px', color: '#ea580c', fontWeight: '700' }}>{isMr ? 'पंच आउट' : 'Punch Out'}</span>
                      <div style={{ fontSize: '14px', fontWeight: '900', color: '#0f172a' }}>{todayRecord?.punch_out_time}</div>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  {isMr
                    ? 'आजचे दैनिक क्षेत्रीय कार्य यशस्वीरीत्या पूर्ण झाले आहे. धन्यवाद!'
                    : 'Your daily field operations have been logged successfully for today. Thank you!'}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="karyakarta-btn karyakarta-btn-secondary"
                  onClick={startPunchOut}
                  style={{ width: '100%', padding: '10px', fontSize: '12px' }}
                >
                  <RefreshCw size={14} />
                  <span>{isMr ? 'पुन्हा Punch Out अपडेट करा' : 'Re-Punch Out'}</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* CARD 2: DUTY STATUS & TIMELINE SUMMARY */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                {isMr ? 'आजची उपस्थिती स्थिती' : "Today's Shift Status"}
              </h3>
              <span
                className={`badge-status ${attendanceState === 'Punched In'
                  ? 'status-progress'
                  : attendanceState === 'Completed'
                    ? 'status-completed'
                    : 'status-pending'
                  }`}
                style={{ fontSize: '12px', padding: '4px 10px' }}
              >
                {attendanceState === 'Punched In'
                  ? (isMr ? '🟢 कामावर हजर (On Duty)' : 'On Duty')
                  : attendanceState === 'Completed'
                    ? (isMr ? '✓ कर्तव्य पूर्ण (Completed)' : 'Completed')
                    : (isMr ? '⚪ उपस्थिती बाकी (Not Started)' : 'Not Started')}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'पंच इन वेळ' : 'Punch In'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                  {todayRecord?.punch_in_time || '--:--'}
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #f1f5f9' }}>
                <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>
                  {isMr ? 'पंच आउट वेळ' : 'Punch Out'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>
                  {todayRecord?.punch_out_time && todayRecord.punch_out_time !== '-' ? todayRecord.punch_out_time : '--:--'}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5' }}>
              {attendanceState === 'Completed'
                ? (isMr ? '🎉 आजचे कर्तव्य यशस्वीरीत्या पूर्ण झाले आहे. धन्यवाद!' : 'Shift completed successfully today. Thank you!')
                : attendanceState === 'Punched In'
                  ? (isMr ? '👍 आपण सध्या ड्युटीवर आहात. कार्य संपल्यावर वरील Punch Out बटनावर क्लिक करा.' : 'You are currently on duty. Use the Punch Out button above when leaving.')
                  : (isMr ? '📌 कृपया दिवसाचे काम सुरू करण्यासाठी प्रथम Punch In करा.' : 'Please punch in first to begin today\'s shift.')}
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11.5px', color: '#64748b' }}>
              {isMr ? 'हजेरी धोरण:' : 'Policy:'} <strong>{attendancePolicy?.is_location_required ? 'स्थान आवश्यक' : 'सर्वत्र मान्य'}</strong>
            </span>
            <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '700' }}>
              {isMr ? '१००% अचूकता' : '100% Accurate'}
            </span>
          </div>
        </div>
      </div>

      {/* ATTENDANCE CAMERA & GEOLOCATION MODAL */}
      {isScanningFace && (
        <div className="attendance-modal-overlay">
          <div className="attendance-modal-content">
            {/* Modal Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: punchMode === 'IN' ? 'linear-gradient(135deg, #ecfdf5 0%, #ffffff 100%)' : 'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: punchMode === 'IN' ? '#10b981' : '#f97316',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {punchMode === 'IN' ? <LogIn size={18} /> : <LogOut size={18} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {punchMode === 'IN'
                      ? (isMr ? 'पंच इन पडताळणी (Punch In Verification)' : 'Punch In Verification')
                      : (isMr ? 'पंच आउट पडताळणी (Punch Out Verification)' : 'Punch Out Verification')}
                  </h3>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                    {isMr ? 'सेल्फी चेहरा स्कॅन व GPS स्थान खात्री' : 'Live Face Scan & GPS Verification'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScanningFace(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Camera Viewport */}
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
              <div
                style={{
                  position: 'relative',
                  width: '240px',
                  height: '240px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `6px solid ${punchMode === 'IN' ? '#10b981' : '#f97316'}`,
                  boxShadow: `0 8px 24px ${punchMode === 'IN' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(249, 115, 22, 0.25)'}`,
                  background: '#0f172a',
                }}
              >
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  height="100%"
                  onUserMediaError={() => setWebcamError(true)}
                  style={{ objectFit: 'cover' }}
                />

                {webcamError && (
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'rgba(15, 23, 42, 0.9)',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      padding: '16px',
                      fontSize: '12px',
                      gap: '8px',
                    }}
                  >
                    <AlertTriangle size={24} color="#f87171" />
                    <span>कॅमेरा परवानगी आवश्यक आहे किंवा उपलब्ध नाही. ब्राउझरमध्ये कॅमेरा अनुमती द्या.</span>
                  </div>
                )}

                {/* Scanning Line Overlay */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: `linear-gradient(to bottom, transparent 0%, ${punchMode === 'IN' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(249, 115, 22, 0.35)'} 50%, transparent 100%)`,
                    animation: 'scanLine 1.8s infinite linear',
                    zIndex: 10,
                    pointerEvents: 'none',
                  }}
                />
              </div>

              {/* Geolocation & IST timestamp info box */}
              <div
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  fontSize: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b', fontWeight: '700' }}>⏰ {isMr ? 'वेळ व तारीख:' : 'Time & Date:'}</span>
                  {LiveClock ? <LiveClock isMr={isMr} variant="inline" /> : null}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <span style={{ color: '#64748b', fontWeight: '700', flexShrink: 0 }}>📍 {isMr ? 'GPS स्थान:' : 'GPS Location:'}</span>
                  <span style={{ fontWeight: '700', color: '#0f172a', textAlign: 'right', wordBreak: 'break-word' }}>
                    {currentCoords?.address || (currentCoords?.latitude ? `${currentCoords.latitude}, ${currentCoords.longitude}` : (isMr ? 'स्थान तपासत आहे...' : 'Detecting...'))}
                  </span>
                </div>

                {attendancePolicy?.is_location_required && (
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: '600', marginTop: '2px' }}>
                    ✓ अ‍ॅडमिन उपस्थिती स्थान: {attendancePolicy.location_name || 'सांगली कार्यालय'}
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
                <button
                  type="button"
                  className="karyakarta-btn karyakarta-btn-secondary"
                  onClick={() => setIsScanningFace(false)}
                  style={{ flex: 1, padding: '12px' }}
                >
                  {t('cancel')}
                </button>

                <button
                  type="button"
                  onClick={confirmPunch}
                  style={{
                    flex: 2,
                    padding: '12px 20px',
                    fontSize: '14.5px',
                    fontWeight: '800',
                    backgroundColor: punchMode === 'IN' ? '#10b981' : '#f97316',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    boxShadow: `0 4px 14px ${punchMode === 'IN' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(249, 115, 22, 0.35)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {punchMode === 'IN' ? <LogIn size={18} /> : <LogOut size={18} />}
                  <span>
                    {punchMode === 'IN'
                      ? (isMr ? '✓ Punch In निश्चित करा' : 'Confirm Punch In')
                      : (isMr ? '✓ Punch Out निश्चित करा' : 'Confirm Punch Out')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ATTENDANCE HISTORY REGISTER TABLE */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: 0 }}>
              {isMr ? 'उपस्थिती नोंदवही (Attendance History)' : 'Attendance History Register'}
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {isMr ? 'मागील १५ दिवसांची हजेरी, वेळ व फोटो तपशील' : 'Past 15 days attendance log with photos'}
            </span>
          </div>
          <span className="karyakarta-badge karyakarta-badge-blue">
            {attendanceHistory.length} {isMr ? 'नोंदी' : 'Records'}
          </span>
        </div>

        <div className="karyakarta-table-wrapper">
          <table className="karyakarta-table">
            <thead>
              <tr>
                <th>{isMr ? 'तारीख' : 'Date'}</th>
                <th>{isMr ? 'पंच इन (Punch In)' : 'Punch In'}</th>
                <th>{isMr ? 'पंच आउट (Punch Out)' : 'Punch Out'}</th>
                <th>{isMr ? 'सेल्फी फोटो' : 'Photos'}</th>
                <th>{isMr ? 'स्थान / ठिकाण' : 'Location'}</th>
                <th>{isMr ? 'उपस्थिती स्थिती' : 'Status'}</th>
              </tr>
            </thead>
            <tbody>
              {attendanceHistory && attendanceHistory.length > 0 ? (
                attendanceHistory.map((record, i) => (
                  <tr key={record.id || i}>
                    <td style={{ fontWeight: '750', color: '#0f172a' }}>{record.date}</td>
                    <td>
                      <span style={{ color: '#059669', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <LogIn size={13} />
                        {record.punch_in_time || record.punchIn || '-'}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: '#ea580c', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <LogOut size={13} />
                        {record.punch_out_time || record.punchOut || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {(record.punch_in_photo || record.punchInPhoto) ? (
                          <div
                            style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}
                            title="Punch In Selfie"
                          >
                            <img
                              src={record.punch_in_photo || record.punchInPhoto}
                              alt="Punch In"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(5, 150, 105, 0.85)', color: 'white', fontSize: '8px', textAlign: 'center', fontWeight: '700' }}>
                              IN
                            </span>
                          </div>
                        ) : null}

                        {(record.punch_out_photo || record.punchOutPhoto) ? (
                          <div
                            style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}
                            title="Punch Out Selfie"
                          >
                            <img
                              src={record.punch_out_photo || record.punchOutPhoto}
                              alt="Punch Out"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', background: 'rgba(234, 88, 12, 0.85)', color: 'white', fontSize: '8px', textAlign: 'center', fontWeight: '700' }}>
                              OUT
                            </span>
                          </div>
                        ) : null}

                        {!record.punch_in_photo && !record.punch_out_photo && (
                          <span style={{ fontSize: '11px', color: '#94a3b8' }}>-</span>
                        )}
                      </div>
                    </td>
                    <td style={{ maxWidth: '260px' }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '12px', color: '#475569' }} title={record.location_note || record.address || 'सांगली परिसर'}>
                        📍 {record.location_note || record.address || 'सांगली परिसर'}
                      </div>
                    </td>
                    <td>
                      <span className={`badge-status ${record.status === 'Present' ? 'status-completed' : 'status-progress'}`}>
                        {record.status === 'Present' ? (isMr ? 'हजर (Present)' : 'Present') : record.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b' }}>
                    {isMr ? 'कोणतीही हजेरी नोंद उपलब्ध नाही' : 'No attendance history records found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
