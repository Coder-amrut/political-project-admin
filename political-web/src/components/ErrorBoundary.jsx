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
            padding: '32px 24px',
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #fecaca',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)',
            textAlign: 'center',
            margin: '16px 0',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: '800', color: '#b91c1c' }}>
            {this.props.title || 'हा विभाग लोड करताना त्रुटी आली / Error Loading Section'}
          </h3>
          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
            {this.state.error?.message || 'अपेक्षित डेटा उपलब्ध नाही किंवा डेटा फॉरमॅटमध्ये समस्या आली आहे.'}
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              background: '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              padding: '9px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
            }}
          >
            🔄 पुन्हा प्रयत्न करा / Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
