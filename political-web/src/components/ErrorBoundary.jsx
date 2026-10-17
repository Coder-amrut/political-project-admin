import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            boxSizing: 'border-box',
            fontFamily: "'Inter', 'Noto Sans Devanagari', -apple-system, BlinkMacSystemFont, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: '580px',
              width: '100%',
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #fecaca',
              boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)',
              padding: '32px 28px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>⚠️</div>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', fontWeight: '850', color: '#b91c1c' }}>
              {this.props.title || 'हा विभाग लोड करताना त्रुटी आली'}
            </h2>
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#64748b', lineHeight: 1.5 }}>
              {this.state.error?.message || 'अपेक्षित डेटा उपलब्ध नाही किंवा तांत्रिक समस्या आली आहे. खालील बटनांवर क्लिक करून पुन्हा प्रयत्न करा.'}
            </p>

            {this.state.error?.stack && (
              <details style={{ textAlign: 'left', marginBottom: '20px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <summary style={{ fontSize: '12px', fontWeight: '700', color: '#475569', cursor: 'pointer' }}>
                  तांत्रिक तपशील (Technical Details)
                </summary>
                <pre style={{ fontSize: '11px', color: '#dc2626', overflowX: 'auto', margin: '8px 0 0 0', whiteSpace: 'pre-wrap' }}>
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => {
                  this.handleReset();
                  window.location.reload();
                }}
                style={{
                  background: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '750',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
                }}
              >
                🔄 पृष्ठ रिफ्रेश करा (Reload)
              </button>
              <button
                type="button"
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/';
                }}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                🏠 मुख्य पृष्ठ (Home)
              </button>
              <button
                type="button"
                onClick={() => {
                  this.handleReset();
                  window.location.href = '/login';
                }}
                style={{
                  background: '#ffffff',
                  color: '#ea580c',
                  border: '1px solid #fed7aa',
                  padding: '10px 18px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                🔑 लॉगिन (Login)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
