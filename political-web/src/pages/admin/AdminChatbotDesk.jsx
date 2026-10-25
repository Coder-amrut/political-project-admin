import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../../api/axios';

export default function AdminChatbotDesk({ lang = 'mr', isFloating = false, onClose = null, onNavigateDesk = null }) {
  const isMr = lang === 'mr';

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: isMr
        ? '👋 नमस्कार! मी आपला निवडणूक व प्रचार सहाय्यक आहे.'
        : '👋 Hello! I am your Campaign & Field Operations Assistant.',
      structuredItems: [],
      suggestedActions: [
        { label: isMr ? '🏘️ गाव लोकसंख्या व मतदार' : '🏘️ Village Population & Voters', query: isMr ? 'गावानुसार एकूण लोकसंख्या आणि मतदार संख्या दाखवा' : 'Show village population and total voters summary' },
        { label: isMr ? '📊 एकूण मतदार सारांश' : '📊 Total Voters Summary', query: isMr ? 'एकूण मतदार संख्या आणि राजकीय कल दाखवा' : 'Show total voters and sentiment' },
        { label: isMr ? '🗳️ बूथनिहाय प्रगती' : '🗳️ Booth Progress', query: isMr ? 'बूथनिहाय प्रगती आणि आघाडीवरील बूथ दाखवा' : 'Show booth progress' },
        { label: isMr ? '⚠️ प्रलंबित समस्या' : '⚠️ Pending Issues', query: isMr ? 'सध्याच्या प्रलंबित नागरी समस्या कोणत्या आहेत?' : 'What are pending civic issues?' },
        { label: isMr ? '👥 सक्रिय कार्यकर्ते' : '👥 Active Workers', query: isMr ? 'सक्रिय कार्यकर्ते आणि त्यांची कामगिरी दाखवा' : 'Show active karyakartas' },
      ],
      timestamp: new Date().toLocaleTimeString(isMr ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeTabCategory, setActiveTabCategory] = useState('all');
  const chatBottomRef = useRef(null);

  // Load suggestion chips from backend
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await apiClient.get('/admin/chatbot/suggestions', { params: { lang } });
        if (res.data.success && res.data.suggestions) {
          setSuggestions(res.data.suggestions);
        }
      } catch (err) {
        console.error('Failed to load chatbot suggestions:', err);
      }
    };
    fetchSuggestions();
  }, [lang]);

  // Auto-scroll to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryText = null) => {
    const textToSend = (queryText || input).trim();
    if (!textToSend || loading) return;

    const userMsg = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString(isMr ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await apiClient.post('/admin/chatbot/query', {
        message: textToSend,
        lang,
      });

      if (res.data.success) {
        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: 'bot',
          text: res.data.reply,
          intent: res.data.intent,
          structuredItems: res.data.related_data || [],
          suggestedActions: res.data.suggested_actions || [],
          timestamp: new Date().toLocaleTimeString(isMr ? 'mr-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'bot',
            text: isMr
              ? '⚠️ क्षमस्व, अडचण आली. कृपया पुन्हा मेसेज पाठवा.'
              : '⚠️ Sorry, an error occurred. Please send again.',
            timestamp: new Date().toLocaleTimeString(),
          },
        ]);
      }
    } catch (err) {
      console.error('Chatbot API error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'bot',
          text: isMr
            ? '❌ संपर्क होऊ शकला नाही. कृपया पुन्हा प्रयत्न करा.'
            : '❌ Could not connect. Please try again.',
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    if (!window.confirm(isMr ? 'सर्व संभाषण रिकामे करायचे आहे का?' : 'Clear conversation history?')) return;
    setMessages([
      {
        id: 'welcome_reset',
        sender: 'bot',
        text: isMr
          ? '👋 संभाषण रीसेट केले.'
          : '👋 Conversation reset.',
        structuredItems: [],
        suggestedActions: [
          { label: isMr ? '📊 एकूण मतदार सारांश' : '📊 Voters Summary', query: isMr ? 'एकूण मतदार सारांश दाखवा' : 'Show total voters summary' },
          { label: isMr ? '⚠️ प्रलंबित समस्या' : '⚠️ Pending Issues', query: isMr ? 'प्रलंबित नागरी समस्या' : 'Pending civic issues' },
        ],
        timestamp: new Date().toLocaleTimeString(),
      },
    ]);
  };

  // Safe and clean Markdown-like parser
  const renderFormattedText = (markdown) => {
    if (!markdown) return null;

    const lines = markdown.split('\n');
    const elements = [];
    let inTable = false;
    let tableRows = [];

    const flushTable = () => {
      if (tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[:\s-]+$/)));

        elements.push(
          <div key={`table_${elements.length}`} style={{ overflowX: 'auto', margin: '12px 0', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', background: '#ffffff' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                  {headerRow.map((cell, idx) => (
                    <th key={idx} style={{ padding: '8px 12px', fontWeight: '800', color: '#1e293b' }}>
                      {cell.replace(/\*\*/g, '').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: '1px solid #f1f5f9', background: rIdx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '7px 12px', color: '#334155' }}>
                        {formatInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Table line
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        inTable = true;
        const cells = trimmed
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        tableRows.push(cells);
        return;
      } else if (inTable) {
        flushTable();
      }

      // Headers
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={index} style={{ margin: '12px 0 6px 0', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
            {formatInline(trimmed.substring(4))}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={index} style={{ margin: '10px 0 4px 0', fontSize: '13.5px', fontWeight: '750', color: '#1e293b' }}>
            {formatInline(trimmed.substring(5))}
          </h4>
        );
      } else if (trimmed.startsWith('> ')) {
        // Blockquote
        elements.push(
          <div
            key={index}
            style={{
              borderLeft: '3px solid #3b82f6',
              background: '#eff6ff',
              padding: '8px 12px',
              borderRadius: '0 6px 6px 0',
              margin: '8px 0',
              fontSize: '12px',
              color: '#1e40af',
              fontStyle: 'italic',
            }}
          >
            {formatInline(trimmed.substring(2))}
          </div>
        );
      } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        // Bullet
        elements.push(
          <div key={index} style={{ display: 'flex', gap: '8px', margin: '4px 0', fontSize: '13px', color: '#334155' }}>
            <span style={{ color: '#2563eb', fontWeight: 'bold' }}>•</span>
            <div>{formatInline(trimmed.substring(2))}</div>
          </div>
        );
      } else if (trimmed) {
        // Normal paragraph
        elements.push(
          <p key={index} style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5, color: '#334155' }}>
            {formatInline(trimmed)}
          </p>
        );
      }
    });

    if (inTable) {
      flushTable();
    }

    return elements;
  };

  const formatInline = (str) => {
    if (!str) return '';
    // Format bold **text** and inline `code`
    const parts = [];
    let remaining = str;
    let keyIdx = 0;

    // Split by `code` or **bold**
    const regex = /(\*\*.*?\*\*|`.*?`)/g;
    let match;
    let lastIndex = 0;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(<strong key={keyIdx++} style={{ color: '#0f172a' }}>{token.slice(2, -2)}</strong>);
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code
            key={keyIdx++}
            style={{
              background: '#f1f5f9',
              padding: '1px 5px',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11.5px',
              color: '#1d4ed8',
            }}
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? parts : str;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: isFloating ? '100%' : 'calc(100vh - 120px)',
        minHeight: isFloating ? '0' : 'min(650px, 75vh)',
        maxHeight: '100%',
        background: '#ffffff',
        borderRadius: isFloating ? 'inherit' : '16px',
        border: isFloating ? 'none' : '1px solid #e2e8f0',
        boxShadow: isFloating ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.04)',
        fontFamily: isMr ? "'Noto Sans Devanagari', 'Mukta', 'Inter', sans-serif" : "'Inter', 'Noto Sans Devanagari', 'Mukta', sans-serif",
        overflow: 'hidden',
      }}
    >
      {/* Chatbot Top Header Bar */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)',
          color: '#ffffff',
          padding: isFloating ? '10px 14px 12px 14px' : '14px 20px',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        {/* Mobile Pull Handle Indicator (visible in floating mode on small screens) */}
        {isFloating && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '4px',
                background: 'rgba(255, 255, 255, 0.4)',
                borderRadius: '999px',
              }}
            />
          </div>
        )}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: isFloating ? '8px' : '12px', minWidth: 0, flex: 1 }}>
            <div
              style={{
                width: isFloating ? '34px' : '38px',
                height: isFloating ? '34px' : '38px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isFloating ? '18px' : '20px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                flexShrink: 0,
              }}
            >
              🤖
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                <h3
                  style={{
                    margin: 0,
                    fontSize: isFloating ? '14px' : '16px',
                    fontWeight: '800',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    color: '#ffffff',
                  }}
                >
                  {isMr ? (isFloating ? 'AI निवडणूक सहाय्यक' : 'AI प्रचार व निवडणूक सहाय्यक') : (isFloating ? 'AI Campaign Assistant' : 'AI Campaign & Field Assistant')}
                </h3>
                <span
                  style={{
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '9.5px',
                    fontWeight: '800',
                    padding: '2px 6px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                    flexShrink: 0,
                  }}
                >
                  <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#ffffff' }} />
                  LIVE
                </span>
              </div>
              <div
                style={{
                  fontSize: '10.5px',
                  color: '#93c5fd',
                  marginTop: '1px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {isMr ? 'थेट माहिती सहाय्यक • त्वरित उत्तरे' : 'Real-time Campaign Intelligence'}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <button
              type="button"
              onClick={handleClearChat}
              title={isMr ? 'चॅट रीसेट करा' : 'Clear chat'}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#ffffff',
                padding: '5px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap',
              }}
            >
              🔄 <span>{isMr ? 'रीसेट' : 'Reset'}</span>
            </button>

            {isFloating && onClose && (
              <button
                type="button"
                onClick={onClose}
                title={isMr ? 'बंद करा' : 'Close'}
                aria-label={isMr ? 'बंद करा' : 'Close'}
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  lineHeight: 1,
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.borderColor = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Suggestion Chips Bar */}
      <div
        style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: isFloating ? '8px 12px' : '10px 16px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: '750', color: '#64748b', alignSelf: 'center', marginRight: '4px', flexShrink: 0 }}>
          {isMr ? 'त्वरित प्रश्न:' : 'Quick Queries:'}
        </span>
        {suggestions.map((sug) => (
          <button
            key={sug.id}
            type="button"
            onClick={() => handleSend(sug.query)}
            disabled={loading}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '20px',
              padding: '5px 12px',
              fontSize: '11.5px',
              fontWeight: '650',
              color: '#1e40af',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = '#2563eb';
              e.currentTarget.style.background = '#eff6ff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.background = '#ffffff';
            }}
          >
            {sug.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          padding: isFloating ? '12px 10px' : '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: isFloating ? '12px' : '16px',
          background: '#f8fafc',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: isUser ? 'flex-end' : 'flex-start',
                width: '100%',
              }}
            >
              <div
                style={{
                  maxWidth: isFloating ? '94%' : '80%',
                  background: isUser ? '#1d4ed8' : '#ffffff',
                  color: isUser ? '#ffffff' : '#0f172a',
                  padding: isFloating ? '10px 14px' : '14px 18px',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                  border: isUser ? 'none' : '1px solid #e2e8f0',
                  boxSizing: 'border-box',
                  wordBreak: 'break-word',
                  overflowWrap: 'anywhere',
                }}
              >
                {/* Message Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                    fontSize: '11px',
                    color: isUser ? '#bfdbfe' : '#94a3b8',
                  }}
                >
                  <span style={{ fontWeight: '750' }}>{isUser ? (isMr ? 'तुम्ही' : 'You') : (isMr ? '🤖 AI प्रचार सहाय्यक' : '🤖 AI Campaign Assistant')}</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Content */}
                {isUser ? (
                  <div style={{ fontSize: isFloating ? '13px' : '13.5px', lineHeight: 1.45, whiteSpace: 'pre-wrap' }}>{msg.text}</div>
                ) : (
                  <div>{renderFormattedText(msg.text)}</div>
                )}

                {/* Structured Interactive Clickable Items (e.g. Citizens, Booths, Issues) */}
                {msg.structuredItems && msg.structuredItems.length > 0 && (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {isMr ? '📌 संबंधित रेकॉर्ड्स (क्लिक करा):' : '📌 Related Records (Clickable):'}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isFloating ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
                      {msg.structuredItems.map((item, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            if (item.type === 'citizen') {
                              handleSend(`${item.title} यांची संपूर्ण माहिती व मतदार तपशील`);
                            } else if (item.type === 'booth') {
                              handleSend(`${item.title} ची सविस्तर पाहणी व मतदार यादी`);
                            } else if (item.type === 'issue') {
                              handleSend(`तक्रार ${item.title} चे सविस्तर निवारण अपडेट`);
                            } else if (item.type === 'worker') {
                              handleSend(`कार्यकर्ता ${item.title} यांनी केलेले सर्व्हे अहवाल`);
                            }
                          }}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '8px',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.background = '#eff6ff';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.borderColor = '#cbd5e1';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                        >
                          <div style={{ fontSize: '12.5px', fontWeight: '750', color: '#1e40af' }}>
                            {item.title}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            {item.subtitle}
                          </div>
                          {item.status && (
                            <span
                              style={{
                                display: 'inline-block',
                                marginTop: '4px',
                                fontSize: '10px',
                                fontWeight: '750',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                background: item.status === 'PENDING' ? '#fef3c7' : '#ecfdf5',
                                color: item.status === 'PENDING' ? '#b45309' : '#059669',
                              }}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Follow-up Actions */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', alignSelf: 'center' }}>
                      {isMr ? 'पुढील प्रश्न:' : 'Follow-up:'}
                    </span>
                    {msg.suggestedActions.map((act, aIdx) => (
                      <button
                        key={aIdx}
                        type="button"
                        onClick={() => handleSend(act.query)}
                        style={{
                          background: '#f1f5f9',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '4px 10px',
                          fontSize: '11px',
                          fontWeight: '700',
                          color: '#1d4ed8',
                          cursor: 'pointer',
                        }}
                      >
                        ↳ {act.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: '#ffffff', padding: '12px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
            <span style={{ fontSize: '18px' }}>🤖</span>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12.5px', fontWeight: '700', color: '#1e293b' }}>
                {isMr ? 'MySQL डेटाबेसमधून माहिती शोधत आहे...' : 'Querying MySQL Database...'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>
                {isMr ? 'मतदार, बूथ व सर्व्हे रेकॉर्ड्स विश्लेषण सुरू' : 'Analyzing voter, booth & survey records'}
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Form Bar */}
      <div
        style={{
          background: '#ffffff',
          borderTop: '1px solid #e2e8f0',
          padding: isFloating ? '8px 10px' : '14px 18px',
          paddingBottom: isFloating ? 'max(10px, env(safe-area-inset-bottom, 10px))' : '14px',
          display: 'flex',
          gap: isFloating ? '6px' : '10px',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={
            isFloating
              ? (isMr ? 'उदा. "बूथ क्र. १", "सतीश खोत", "समस्या"...' : 'E.g. "Booth 1", "Search voter"...')
              : (isMr
                  ? 'उदा. "बूथ क्र. १ ची सद्यस्थिती काय आहे?", "सतीश खोत यांची माहिती", "नागरी समस्या"...'
                  : 'E.g. "What is status of Booth 1?", "Search voter Satish Khot", "Pending issues"...')
          }
          disabled={loading}
          style={{
            flex: 1,
            minWidth: 0,
            padding: isFloating ? '9px 12px' : '11px 16px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.15s ease',
            background: loading ? '#f8fafc' : '#ffffff',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
          onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
        />

        <button
          type="button"
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          style={{
            background: loading || !input.trim() ? '#94a3b8' : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            padding: isFloating ? '9px 13px' : '11px 22px',
            borderRadius: '10px',
            fontSize: isFloating ? '12px' : '13px',
            fontWeight: '750',
            cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            boxShadow: '0 2px 6px rgba(29, 78, 216, 0.25)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {loading ? (isMr ? 'शोधत...' : 'Searching...') : (isMr ? 'विचारा ➔' : 'Ask ➔')}
        </button>
      </div>
    </div>
  );
}
