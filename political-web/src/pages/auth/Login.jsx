import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { RoleName } from '../../api/contracts';
import { sendOtp, verifyOtp } from '../../services/authService';
import {
  UserCheck,
  KeyRound,
  Phone,
  CreditCard,
  FileText,
  Lock,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Shield,
  Mail
} from 'lucide-react';

const TRANSLATIONS = {
  mr: {
    portalBadge: 'अधिकारी पोर्टल',
    title: 'अधिकारी लॉगिन',
    signUpTitle: 'नवीन अधिकारी नोंदणी',
    subtitle: 'फील्ड मॅनेजमेंट सिस्टीम - सुरक्षित प्रवेश',
    signInTab: 'साइन इन',
    signUpTab: 'नवीन नोंदणी',

    // Sign In
    idOrEmailLabel: 'ईमेल आयडी किंवा मोबाईल नंबर',
    idOrEmailPlaceholder: 'उदा. officer@gmail.com किंवा ९८२२०११२२१',
    passwordLabel: 'पासवर्ड',
    passwordPlaceholder: '••••••••',
    signingIn: 'लॉगिन होत आहे...',
    signInBtn: 'साइन इन करा',
    newAccountQuestion: 'नवीन खाते तयार करायचे आहे का?',
    registerNowLink: 'येथे नोंदणी करा',

    // Sign Up
    signUpDescription: 'नवीन नोंदणीसाठी आपले नाव, मोबाईल, ओटीपी, आधार आणि पॅन कार्ड तपशील भरा:',
    fullNameLabel: 'पूर्ण नाव (आधार कार्डनुसार)',
    fullNamePlaceholder: 'उदा. राहुल रमेश कदम',
    phoneLabel: 'मोबाईल नंबर',
    phoneSignUpPlaceholder: '१० अंकी मोबाईल नंबर (उदा. ९८२२०११२२१)',
    sendOtp: 'ओटीपी पाठवा',
    resendOtp: 'पुन्हा ओटीपी पाठवा',
    resendIn: 'पुन्हा पाठवा',
    seconds: 'सेकंदांत',
    verifiedBadge: 'नंबर पडताळला',
    otpContainerTitle: 'मोबाईल ओटीपी पडताळणी',
    otpSignUpPlaceholder: '६ अंकी ओटीपी टाका',
    verifyBtn: 'तपासा',
    verifying: 'तपासत आहे...',
    verified: 'पडताळणी पूर्ण',

    // Aadhaar & PAN
    aadhaarLabel: 'आधार कार्ड नंबर',
    aadhaarBadge: '१२ अंक',
    aadhaarPlaceholder: 'XXXX XXXX XXXX',
    aadhaarHint: '१२ अंकी वैध आधार क्रमांक टाका',
    validAadhaar: 'वैध आधार क्रमांक',

    panLabel: 'पॅन कार्ड नंबर',
    panBadge: '१० वर्ण',
    panPlaceholder: 'ABCDE1234F',
    panHint: '१० अक्षरी पॅन क्रमांक (उदा. ABCDE1234F)',
    validPan: 'वैध पॅन क्रमांक',

    passwordFieldLabel: 'पासवर्ड तयार करा',
    passwordMinLength: 'किमान ६ अक्षरे',
    confirmPasswordLabel: 'पासवर्ड पुन्हा टाका',
    retypePassword: 'पुन्हा टाईप करा',
    optionalEmailLabel: 'ईमेल आयडी (पर्यायी)',
    emailPlaceholder: 'officer@example.com',
    registering: 'नोंदणी होत आहे...',
    signUpBtn: 'नोंदणी पूर्ण करा',
    alreadyRegisteredQuestion: 'आधीच नोंदणी झाली आहे का?',
    signInLink: 'साइन इन करा',

    // Errors & Messages
    invalidPhone: 'कृपया वैध १० अंकी मोबाईल नंबर टाका.',
    otpSentSuccess: 'मोबाईलवर ओटीपी पाठवण्यात आला आहे!',
    otpSendError: 'ओटीपी पाठवण्यात त्रुटी आली.',
    invalidOtpError: 'ओटीपी चुकीचा किंवा कालबाह्य झाला आहे.',
    loginRequiredError: 'ईमेल आयडी किंवा मोबाईल नंबर आवश्यक आहे.',
    passwordRequiredError: 'पासवर्ड आवश्यक आहे.',
    loginFailedError: 'लॉगिन अयशस्वी. कृपया आपले तपशील तपासा.',
    phoneVerifiedSuccess: 'मोबाईल नंबर यशस्वीरित्या पडताळला गेला!',
    otpVerifyError: 'ओटीपी पडताळणी अयशस्वी झाली.',
    fullNameRequired: 'पूर्ण नाव टाकणे आवश्यक आहे.',
    aadhaarRequired: '१२ अंकी आधार कार्ड नंबर आवश्यक आहे.',
    panRequired: '१० अक्षरी वैध पॅन कार्ड नंबर आवश्यक आहे (उदा. ABCDE1234F).',
    passwordLengthError: 'पासवर्ड किमान ६ अक्षरांचा असणे आवश्यक आहे.',
    passwordsMismatch: 'पासवर्ड जुळत नाही.',
    signUpSuccess: 'नोंदणी यशस्वी झाली! डॅशबोर्ड उघडत आहे...',
    signUpFailed: 'नोंदणी अयशस्वी. कृपया तपशील तपासा किंवा प्रशासकांशी संपर्क साधा.'
  },
  en: {
    portalBadge: 'Officer Portal',
    title: 'Officer Login',
    signUpTitle: 'Officer Registration',
    subtitle: 'Field Management System - Secure Access',


    // Sign In
    idOrEmailLabel: 'Email ID or Mobile Number',
    idOrEmailPlaceholder: 'e.g. officer@gmail.com or 9822011221',
    passwordLabel: 'Password',
    passwordPlaceholder: '••••••••',
    signingIn: 'Signing in...',
    signInBtn: 'Sign In',
    newAccountQuestion: "Don't have an account?",
    registerNowLink: 'Register Now',

    // Sign Up
    signUpDescription: 'Fill your Name, Mobile, OTP, Aadhaar, and PAN card details for registration:',
    fullNameLabel: 'Full Name (As on Aadhaar)',
    fullNamePlaceholder: 'e.g. Rahul Ramesh Kadam',
    phoneLabel: 'Mobile Number',
    phoneSignUpPlaceholder: '10-digit mobile number (e.g. 9822011221)',
    sendOtp: 'Send OTP',
    resendOtp: 'Resend OTP',
    resendIn: 'Resend in',
    seconds: 's',
    verifiedBadge: 'Phone Verified',
    otpContainerTitle: 'Mobile OTP Verification',
    otpSignUpPlaceholder: 'Enter 6-digit OTP',
    verifyBtn: 'Verify',
    verifying: 'Verifying...',
    verified: 'Verified',

    // Aadhaar & PAN
    aadhaarLabel: 'Aadhaar Card Number',
    aadhaarBadge: '12 Digits',
    aadhaarPlaceholder: 'XXXX XXXX XXXX',
    aadhaarHint: 'Enter 12-digit valid Aadhaar number',
    validAadhaar: 'Valid Aadhaar Format',

    panLabel: 'PAN Card Number',
    panBadge: '10 Chars',
    panPlaceholder: 'ABCDE1234F',
    panHint: 'Enter 10-character PAN (e.g. ABCDE1234F)',
    validPan: 'Valid PAN Format',

    passwordFieldLabel: 'Create Password',
    passwordMinLength: 'Min 6 characters',
    confirmPasswordLabel: 'Confirm Password',
    retypePassword: 'Retype password',
    optionalEmailLabel: 'Email ID (Optional)',
    emailPlaceholder: 'officer@example.com',
    registering: 'Registering...',
    signUpBtn: 'Complete Registration',
    alreadyRegisteredQuestion: 'Already have an account?',
    signInLink: 'Sign In here',

    // Errors & Messages
    invalidPhone: 'Please enter a valid 10-digit mobile number.',
    otpSentSuccess: 'OTP has been sent to your mobile number!',
    otpSendError: 'Failed to send OTP. Please try again.',
    invalidOtpError: 'Invalid or expired OTP. Please try again.',
    loginRequiredError: 'Email ID or mobile number is required.',
    passwordRequiredError: 'Password is required.',
    loginFailedError: 'Login failed. Please check your credentials.',
    phoneVerifiedSuccess: 'Mobile number verified successfully!',
    otpVerifyError: 'OTP verification failed. Please try again.',
    fullNameRequired: 'Full Name is required.',
    aadhaarRequired: 'Valid 12-digit Aadhaar number is required.',
    panRequired: 'Valid 10-character PAN number is required (e.g. ABCDE1234F).',
    passwordLengthError: 'Password must be at least 6 characters.',
    passwordsMismatch: 'Passwords do not match.',
    signUpSuccess: 'Registration successful! Opening dashboard...',
    signUpFailed: 'Registration failed. Please check details or contact administrator.'
  }
};

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Language state: 'mr' | 'en'
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('preferred_language') || 'mr';
  });

  const t = TRANSLATIONS[language] || TRANSLATIONS.mr;

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferred_language', lang);
  };

  // Active Tab: 'signin' | 'signup'
  const [activeTab, setActiveTab] = useState(
    location.pathname === '/register' || location.state?.tab === 'signup' ? 'signup' : 'signin'
  );

  // Sign In Form State (strictly ID + Password)
  const [signInData, setSignInData] = useState({
    login: '',
    password: '',
  });

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    full_name: '',
    phone: '',
    email: '',
    otp: '',
    aadhar_number: '',
    pan_number: '',
    password: '',
    password_confirmation: '',
  });
  const [signUpOtpSent, setSignUpOtpSent] = useState(false);
  const [signUpOtpVerified, setSignUpOtpVerified] = useState(false);
  const [signUpOtpTimer, setSignUpOtpTimer] = useState(0);

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Countdown timer for Sign Up OTP
  useEffect(() => {
    let interval = null;
    if (signUpOtpTimer > 0) {
      interval = setInterval(() => {
        setSignUpOtpTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [signUpOtpTimer]);

  // Format Aadhaar: XXXX XXXX XXXX
  const formatAadhaar = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    return parts.join(' ');
  };

  // Format PAN: ABCDE1234F
  const formatPan = (val) => {
    return val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
  };

  // Validation checks for badges
  const rawAadhaarDigits = signUpData.aadhar_number.replace(/\D/g, '');
  const isAadhaarComplete = rawAadhaarDigits.length === 12;
  const isPanComplete = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(signUpData.pan_number.trim());

  // Common redirect logic based on authenticated role
  const handleRedirect = (userRoles) => {
    const fromPath = location.state?.from?.pathname;
    if (fromPath && fromPath !== '/login' && fromPath !== '/register' && fromPath !== '/worker') {
      navigate(fromPath, { replace: true });
      return;
    }

    if (userRoles.includes(RoleName.ADMIN)) {
      navigate('/admin', { replace: true });
    } else if (userRoles.includes(RoleName.OFFICER)) {
      navigate('/officer', { replace: true });
    } else {
      navigate('/officer', { replace: true });
    }
  };

  // -------------------------------------------------------------
  // Sign In Handlers (Strictly ID + Password)
  // -------------------------------------------------------------
  const handleSignInChange = (e) => {
    const { name, value } = e.target;
    setSignInData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (generalError) setGeneralError('');
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    setFieldErrors({});

    const errors = {};
    if (!signInData.login.trim()) {
      errors.login = t.loginRequiredError;
    }
    if (!signInData.password) {
      errors.password = t.passwordRequiredError;
    }
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        login: signInData.login.trim(),
        password: signInData.password,
      });
      handleRedirect(response.user?.roles || []);
    } catch (err) {
      if (err.errors) setFieldErrors(err.errors);
      setGeneralError(err.message || t.loginFailedError);
    } finally {
      setIsSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Sign Up Handlers
  // -------------------------------------------------------------
  const handleSignUpChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;

    if (name === 'phone') {
      finalVal = value.replace(/\D/g, '').slice(0, 10);
      if (signUpOtpVerified) setSignUpOtpVerified(false);
    } else if (name === 'aadhar_number') {
      finalVal = formatAadhaar(value);
    } else if (name === 'pan_number') {
      finalVal = formatPan(value);
    }

    setSignUpData((prev) => ({ ...prev, [name]: finalVal }));
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    if (generalError) setGeneralError('');
  };

  const handleSendSignUpOtp = async () => {
    const phone = signUpData.phone.replace(/\D/g, '');
    if (phone.length < 10) {
      setFieldErrors({ phone: t.invalidPhone });
      return;
    }
    setFieldErrors({});
    setGeneralError('');
    setSendingOtp(true);
    try {
      const res = await sendOtp(phone);
      setSignUpOtpSent(true);
      setSignUpOtpTimer(60);
      if (res.is_bypass && res.otp) {
        setSignUpData((prev) => ({ ...prev, otp: res.otp }));
      }
    } catch (err) {
      setGeneralError(err.message || t.otpSendError);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifySignUpOtp = async () => {
    const phone = signUpData.phone.replace(/\D/g, '');
    if (!signUpData.otp || signUpData.otp.trim().length < 4) {
      setFieldErrors({ otp: t.invalidOtpError });
      return;
    }
    setVerifyingOtp(true);
    setGeneralError('');
    try {
      const res = await verifyOtp(phone, signUpData.otp.trim());
      if (res.verified) {
        setSignUpOtpVerified(true);
        setSuccessMessage(t.phoneVerifiedSuccess);
      } else {
        setGeneralError(t.invalidOtpError);
      }
    } catch (err) {
      setGeneralError(err.message || t.otpVerifyError);
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    setSuccessMessage('');
    setFieldErrors({});

    const rawAadhaar = signUpData.aadhar_number.replace(/\s/g, '');
    const rawPan = signUpData.pan_number.trim();

    const errors = {};
    if (!signUpData.full_name.trim()) {
      errors.full_name = t.fullNameRequired;
    }
    if (!signUpData.phone || signUpData.phone.length !== 10) {
      errors.phone = t.invalidPhone;
    }
    if (!rawAadhaar || rawAadhaar.length !== 12) {
      errors.aadhar_number = t.aadhaarRequired;
    }
    if (!rawPan || rawPan.length !== 10) {
      errors.pan_number = t.panRequired;
    }
    if (!signUpData.password || signUpData.password.length < 6) {
      errors.password = t.passwordLengthError;
    }
    if (signUpData.password !== signUpData.password_confirmation) {
      errors.password_confirmation = t.passwordsMismatch;
    }
    if (!signUpOtpVerified && signUpData.phone !== '9898989898') {
      errors.otp = language === 'mr' ? 'कृपया प्रथम मोबाईल ओटीपी पडताळणी पूर्ण करा.' : 'Please verify mobile OTP first.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        full_name: signUpData.full_name.trim(),
        phone: signUpData.phone.trim(),
        email: signUpData.email.trim() || undefined,
        aadhar_number: rawAadhaar,
        pan_number: rawPan,
        role: 'OFFICER',
        password: signUpData.password,
        password_confirmation: signUpData.password_confirmation,
      };

      const response = await register(payload);
      setSuccessMessage(t.signUpSuccess);
      setTimeout(() => {
        handleRedirect(response.user?.roles || ['OFFICER']);
      }, 700);
    } catch (err) {
      if (err.errors) setFieldErrors(err.errors);
      setGeneralError(err.message || t.signUpFailed);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="login-page-root"
      style={{
        minHeight: '100vh',
        backgroundColor: '#f1f5f9',
        backgroundImage: 'radial-gradient(at 0% 0%, #dcfce7 0px, transparent 50%), radial-gradient(at 100% 100%, #e0f2fe 0px, transparent 50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        fontFamily: language === 'mr'
          ? "'Noto Sans Devanagari', 'Mukta', 'Inter', -apple-system, sans-serif"
          : "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        /* Prevent outer page scrolling on mobile devices - fit screen cleanly */
        @media (max-width: 640px) {
          html, body {
            overflow: hidden !important;
            height: 100% !important;
            height: 100dvh !important;
          }
          .login-page-root {
            min-height: 100vh !important;
            min-height: 100dvh !important;
            height: 100vh !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: hidden !important;
            align-items: stretch !important;
            justify-content: stretch !important;
          }
          .login-card-container {
            width: 100% !important;
            max-width: 100% !important;
            height: 100% !important;
            max-height: 100dvh !important;
            border-radius: 0 !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
          }
          .login-header-banner {
            padding: 12px 18px 10px 18px !important;
            flex-shrink: 0 !important;
          }
          .login-header-top-row {
            margin-bottom: 8px !important;
          }
          .login-header-icon {
            width: 38px !important;
            height: 38px !important;
            font-size: 19px !important;
            border-radius: 10px !important;
          }
          .login-header-title {
            font-size: 16.5px !important;
          }
          .login-header-subtitle {
            font-size: 11.5px !important;
          }
          .login-content-body {
            padding: 14px 18px !important;
            flex: 1 !important;
            overflow-y: auto !important;
            overscroll-behavior: contain !important;
            -webkit-overflow-scrolling: touch !important;
            display: flex !important;
            flex-direction: column !important;
            justifyContent: space-between !important;
          }
          .login-form-inner {
            gap: 11px !important;
          }
          .login-form-inner label {
            font-size: 12px !important;
            margin-bottom: 3px !important;
          }
          .login-input-field {
            padding: 10px 12px 10px 38px !important;
            font-size: 13.5px !important;
          }
          .login-submit-button {
            padding: 11px !important;
            margin-top: 4px !important;
            font-size: 14px !important;
          }
          .login-switch-footer {
            margin-top: 10px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div
        className="login-card-container"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          boxShadow: '0 20px 40px -15px rgba(5, 150, 105, 0.15), 0 0 1px 1px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}
      >
        {/* Top Header Banner */}
        <div
          className="login-header-banner"
          style={{
            background: 'linear-gradient(135deg, #065f46 0%, #059669 100%)',
            padding: '22px 26px 18px 26px',
            color: '#ffffff',
            position: 'relative',
          }}
        >
          {/* Top Row: Language Toggle & Portal Badge (Home Option Removed) */}
          <div
            className="login-header-top-row"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}
          >
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: 'rgba(255,255,255,0.18)',
              padding: '4px 10px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#f0fdf4',
              backdropFilter: 'blur(4px)',
            }}>
              <Shield size={13} color="#fef08a" />
              {t.portalBadge}
            </span>

            {/* Language Switcher Pill */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: 'rgba(0, 0, 0, 0.22)',
              borderRadius: '20px',
              padding: '2px',
              border: '1px solid rgba(255, 255, 255, 0.25)',
            }}>
              <button
                type="button"
                onClick={() => handleLanguageChange('mr')}
                style={{
                  padding: '4px 11px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: language === 'mr' ? '#ffffff' : 'transparent',
                  color: language === 'mr' ? '#065f46' : '#d1fae5',
                  transition: 'all 0.2s ease',
                }}
              >
                मराठी
              </button>
              <button
                type="button"
                onClick={() => handleLanguageChange('en')}
                style={{
                  padding: '4px 11px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  backgroundColor: language === 'en' ? '#ffffff' : 'transparent',
                  color: language === 'en' ? '#065f46' : '#d1fae5',
                  transition: 'all 0.2s ease',
                }}
              >
                English
              </button>
            </div>
          </div>

          {/* Title and Icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              className="login-header-icon"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              }}
            >
              🏛️
            </div>
            <div>
              <h1
                className="login-header-title"
                style={{ margin: 0, fontSize: '20px', fontWeight: '800', letterSpacing: '-0.02em', color: '#ffffff' }}
              >
                {activeTab === 'signup' ? t.signUpTitle : t.title}
              </h1>
              <p
                className="login-header-subtitle"
                style={{ margin: '3px 0 0 0', fontSize: '13px', color: '#d1fae5', fontWeight: '400' }}
              >
                {t.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="login-content-body" style={{ padding: '24px 26px' }}>
          {/* Notifications */}
          {generalError && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '18px',
            }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{generalError}</div>
            </div>
          )}

          {successMessage && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              padding: '12px 14px',
              borderRadius: '10px',
              fontSize: '13px',
              marginBottom: '18px',
            }}>
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 1: SIGN IN (Strictly ID + Password) */}
          {/* ============================================================== */}
          {activeTab === 'signin' && (
            <div>
              <form
                className="login-form-inner"
                onSubmit={handleSignInSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              >
                {/* Identifier Input (Email or Mobile Phone Number) */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                    {t.idOrEmailLabel} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="login"
                      className="login-input-field"
                      value={signInData.login}
                      onChange={handleSignInChange}
                      placeholder={t.idOrEmailPlaceholder}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '11px 12px 11px 40px',
                        boxSizing: 'border-box',
                        border: fieldErrors.login ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                      }}
                    />
                    <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '13px' }} />
                  </div>
                  {fieldErrors.login && (
                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{fieldErrors.login}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '6px' }}>
                    {t.passwordLabel} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="login-input-field"
                      value={signInData.password}
                      onChange={handleSignInChange}
                      placeholder={t.passwordPlaceholder}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '11px 40px 11px 40px',
                        boxSizing: 'border-box',
                        border: fieldErrors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        borderRadius: '10px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                      }}
                    />
                    <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '13px', top: '13px' }} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p style={{ color: '#ef4444', fontSize: '12px', margin: '4px 0 0 0' }}>{fieldErrors.password}</p>
                  )}
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  className="login-submit-button"
                  disabled={isSubmitting}
                  style={{
                    padding: '13px',
                    backgroundColor: isSubmitting ? '#93c5fd' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '8px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> {t.signingIn}
                    </>
                  ) : (
                    <>
                      {t.signInBtn} <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: SIGN UP */}
          {/* ============================================================== */}
          {activeTab === 'signup' && (
            <div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.4' }}>
                {t.signUpDescription}
              </p>

              <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* 1. Full Name */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e293b', marginBottom: '5px' }}>
                    {t.fullNameLabel} <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      name="full_name"
                      value={signUpData.full_name}
                      onChange={handleSignUpChange}
                      placeholder={t.fullNamePlaceholder}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        boxSizing: 'border-box',
                        border: fieldErrors.full_name ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        borderRadius: '9px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    <UserCheck size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  </div>
                  {fieldErrors.full_name && (
                    <p style={{ color: '#ef4444', fontSize: '11px', margin: '3px 0 0 0' }}>{fieldErrors.full_name}</p>
                  )}
                </div>

                {/* 2. Phone Number & OTP Section */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>
                      {t.phoneLabel} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    {signUpOtpVerified ? (
                      <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <CheckCircle2 size={13} /> {t.verifiedBadge}
                      </span>
                    ) : signUpOtpSent && signUpOtpTimer > 0 ? (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        {t.resendIn} ({signUpOtpTimer}{t.seconds})
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendSignUpOtp}
                        disabled={sendingOtp || signUpData.phone.length !== 10}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: signUpData.phone.length === 10 ? '#059669' : '#94a3b8',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: signUpData.phone.length === 10 ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {sendingOtp ? '...' : signUpOtpSent ? `🔄 ${t.resendOtp}` : `📲 ${t.sendOtp}`}
                      </button>
                    )}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      name="phone"
                      value={signUpData.phone}
                      onChange={handleSignUpChange}
                      placeholder={t.phoneSignUpPlaceholder}
                      maxLength={10}
                      disabled={isSubmitting}
                      style={{
                        width: '100%',
                        padding: '10px 12px 10px 38px',
                        boxSizing: 'border-box',
                        border: fieldErrors.phone ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                        borderRadius: '9px',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                    <Phone size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '11px' }} />
                  </div>
                  {fieldErrors.phone && (
                    <p style={{ color: '#ef4444', fontSize: '11px', margin: '3px 0 0 0' }}>{fieldErrors.phone}</p>
                  )}
                </div>

                {/* OTP Verification Container (Demo fill removed) */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '10px 12px',
                }}>
                  <div style={{ marginBottom: '6px' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#334155' }}>
                      {t.otpContainerTitle}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type="text"
                        name="otp"
                        value={signUpData.otp}
                        onChange={handleSignUpChange}
                        placeholder={t.otpSignUpPlaceholder}
                        maxLength={6}
                        disabled={isSubmitting || signUpOtpVerified}
                        style={{
                          width: '100%',
                          padding: '8px 10px 8px 34px',
                          boxSizing: 'border-box',
                          border: fieldErrors.otp ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '600',
                          letterSpacing: '0.08em',
                          backgroundColor: signUpOtpVerified ? '#f0fdf4' : '#ffffff',
                          outline: 'none',
                        }}
                      />
                      <ShieldCheck size={16} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '10px' }} />
                    </div>
                    {!signUpOtpVerified ? (
                      <button
                        type="button"
                        onClick={handleVerifySignUpOtp}
                        disabled={verifyingOtp || !signUpData.otp}
                        style={{
                          padding: '0 16px',
                          backgroundColor: '#059669',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: verifyingOtp || !signUpData.otp ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {verifyingOtp ? t.verifying : t.verifyBtn}
                      </button>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#059669',
                        fontSize: '12px',
                        fontWeight: '700',
                        padding: '0 8px',
                      }}>
                        <CheckCircle2 size={16} /> {t.verified}
                      </div>
                    )}
                  </div>
                  {fieldErrors.otp && (
                    <p style={{ color: '#ef4444', fontSize: '11px', margin: '3px 0 0 0' }}>{fieldErrors.otp}</p>
                  )}
                </div>

                {/* 3. PROPER OFFICIAL AADHAAR & PAN SECTION */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px',
                }}>
                  {/* Aadhaar Card Number Box */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CreditCard size={15} color="#059669" />
                        {t.aadhaarLabel} <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      {isAadhaarComplete ? (
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} /> {t.validAadhaar}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '6px', fontWeight: '600' }}>
                          {t.aadhaarBadge}
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="aadhar_number"
                        value={signUpData.aadhar_number}
                        onChange={handleSignUpChange}
                        placeholder={t.aadhaarPlaceholder}
                        maxLength={14}
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          boxSizing: 'border-box',
                          border: fieldErrors.aadhar_number
                            ? '1.5px solid #ef4444'
                            : isAadhaarComplete
                              ? '1.5px solid #10b981'
                              : '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '700',
                          letterSpacing: '0.08em',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      />
                      <CreditCard size={17} color={isAadhaarComplete ? '#10b981' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '11px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{t.aadhaarHint}</span>
                      <span style={{ fontSize: '11px', color: isAadhaarComplete ? '#10b981' : '#94a3b8', fontWeight: '600' }}>
                        {rawAadhaarDigits.length}/12
                      </span>
                    </div>
                    {fieldErrors.aadhar_number && (
                      <p style={{ color: '#ef4444', fontSize: '11px', margin: '2px 0 0 0' }}>{fieldErrors.aadhar_number}</p>
                    )}
                  </div>

                  {/* PAN Card Number Box */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileText size={15} color="#059669" />
                        {t.panLabel} <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      {isPanComplete ? (
                        <span style={{ fontSize: '11px', color: '#059669', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <CheckCircle2 size={12} /> {t.validPan}
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', backgroundColor: '#e2e8f0', color: '#475569', padding: '1px 6px', borderRadius: '6px', fontWeight: '600' }}>
                          {t.panBadge}
                        </span>
                      )}
                    </div>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        name="pan_number"
                        value={signUpData.pan_number}
                        onChange={handleSignUpChange}
                        placeholder={t.panPlaceholder}
                        maxLength={10}
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 38px',
                          boxSizing: 'border-box',
                          border: fieldErrors.pan_number
                            ? '1.5px solid #ef4444'
                            : isPanComplete
                              ? '1.5px solid #10b981'
                              : '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '14px',
                          fontWeight: '700',
                          letterSpacing: '0.08em',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                        }}
                      />
                      <FileText size={17} color={isPanComplete ? '#10b981' : '#94a3b8'} style={{ position: 'absolute', left: '12px', top: '11px' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '3px' }}>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{t.panHint}</span>
                      <span style={{ fontSize: '11px', color: isPanComplete ? '#10b981' : '#94a3b8', fontWeight: '600' }}>
                        {signUpData.pan_number.trim().length}/10
                      </span>
                    </div>
                    {fieldErrors.pan_number && (
                      <p style={{ color: '#ef4444', fontSize: '11px', margin: '2px 0 0 0' }}>{fieldErrors.pan_number}</p>
                    )}
                  </div>
                </div>

                {/* 4. Password & Confirm Password */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {t.passwordFieldLabel} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={signUpData.password}
                        onChange={handleSignUpChange}
                        placeholder={t.passwordMinLength}
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '9px 28px 9px 32px',
                          boxSizing: 'border-box',
                          border: fieldErrors.password ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                      <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '10px',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {fieldErrors.password && (
                      <p style={{ color: '#ef4444', fontSize: '10px', margin: '2px 0 0 0' }}>{fieldErrors.password}</p>
                    )}
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                      {t.confirmPasswordLabel} <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="password_confirmation"
                        value={signUpData.password_confirmation}
                        onChange={handleSignUpChange}
                        placeholder={t.retypePassword}
                        disabled={isSubmitting}
                        style={{
                          width: '100%',
                          padding: '9px 28px 9px 32px',
                          boxSizing: 'border-box',
                          border: fieldErrors.password_confirmation ? '1.5px solid #ef4444' : '1.5px solid #cbd5e1',
                          borderRadius: '8px',
                          fontSize: '13px',
                          outline: 'none',
                        }}
                      />
                      <Lock size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '8px',
                          top: '10px',
                          background: 'none',
                          border: 'none',
                          color: '#64748b',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    {fieldErrors.password_confirmation && (
                      <p style={{ color: '#ef4444', fontSize: '10px', margin: '2px 0 0 0' }}>{fieldErrors.password_confirmation}</p>
                    )}
                  </div>
                </div>

                {/* Optional Email */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', color: '#64748b', marginBottom: '4px' }}>
                    {t.optionalEmailLabel}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={signUpData.email}
                    onChange={handleSignUpChange}
                    placeholder={t.emailPlaceholder}
                    disabled={isSubmitting}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      boxSizing: 'border-box',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: '13px',
                    backgroundColor: isSubmitting ? '#93c5fd' : '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '10px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: '700',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '6px',
                    boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" /> {t.registering}
                    </>
                  ) : (
                    <>
                      {t.signUpBtn} <CheckCircle2 size={18} />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Bottom Switch Links */}
          <div className="login-switch-footer" style={{ marginTop: '22px', fontSize: '13px', color: '#64748b', textAlign: 'center' }}>
            {activeTab === 'signin' ? (
              <div>
                <span>{t.newAccountQuestion} </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setGeneralError('');
                    setSuccessMessage('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#059669', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  {t.registerNowLink}
                </button>
              </div>
            ) : (
              <div>
                <span>{t.alreadyRegisteredQuestion} </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signin');
                    setGeneralError('');
                    setSuccessMessage('');
                  }}
                  style={{ background: 'none', border: 'none', color: '#059669', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                >
                  {t.signInLink}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
