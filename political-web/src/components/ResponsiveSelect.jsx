import React, { useState, useRef, useEffect, useId } from 'react';

/**
 * ResponsiveSelect Component
 * A 100% mobile-friendly, touch-ready dropdown that:
 * 1. Never overflows mobile screens (anchored to 100% width, max-width: 100%).
 * 2. Has a scrollable vertical list with max-height: 45vh (40vh to 50vh).
 * 3. Supports Marathi (Devanagari) and English text with proper wrapping.
 * 4. Includes an instant search filter for lists > 7 items.
 * 5. Preserves existing options, values, and onChange signature ({ target: { value, name } }).
 */
export default function ResponsiveSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Select option',
  id,
  name,
  disabled = false,
  isMr = false,
  className = '',
  style = {},
  selectStyle = {},
  menuMaxHeight = '65vh',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  const autoId = useId();
  const selectId = id || autoId;

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchFilter('');
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setSearchFilter('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Find currently selected option
  const selectedOption = options.find((opt) => String(opt.value) === String(value));
  const displayLabel = selectedOption ? selectedOption.label : placeholder;
  const isSelectedActive = value !== undefined && value !== null && value !== '' && value !== 'all';

  // Filter options based on search query
  const filteredOptions = options.filter((opt) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase().trim();
    return (
      String(opt.label || '').toLowerCase().includes(q) ||
      String(opt.value || '').toLowerCase().includes(q)
    );
  });

  const handleSelectOption = (optValue) => {
    if (onChange) {
      onChange({
        target: {
          value: optValue,
          name: name || selectId,
        },
      });
    }
    setIsOpen(false);
    setSearchFilter('');
  };

  return (
    <div
      ref={containerRef}
      className={`responsive-select-wrapper ${className}`}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        zIndex: isOpen ? 100 : 1,
        ...style,
      }}
    >
      {/* Hidden native select for accessibility and forms */}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
          margin: 0,
          padding: 0,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Styled Touch-Friendly Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '10px 14px',
          borderRadius: '8px',
          border: isOpen ? '1.5px solid #2563eb' : '1px solid #cbd5e1',
          fontSize: '13.5px',
          fontWeight: '600',
          background: isOpen ? '#ffffff' : '#f8fafc',
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: isSelectedActive ? '#1d4ed8' : '#334155',
          textAlign: 'left',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(37, 99, 235, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          minHeight: '42px',
          ...selectStyle,
        }}
      >
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1,
            minWidth: 0,
            lineHeight: 1.3,
          }}
        >
          {displayLabel}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            flexShrink: 0,
            color: isOpen ? '#2563eb' : '#64748b',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown Menu Popup - Confined within Screen Width & Max-Height 45vh */}
      {isOpen && (
        <div
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            boxShadow: '0 12px 28px -4px rgba(15, 23, 42, 0.2), 0 4px 10px -2px rgba(15, 23, 42, 0.08)',
            zIndex: 1050,
            maxHeight: menuMaxHeight || '65vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Quick Search Bar when options count > 7 */}
          {options.length > 7 && (
            <div
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid #e2e8f0',
                background: '#f8fafc',
                flexShrink: 0,
              }}
            >
              <div style={{ position: 'relative' }}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={isMr ? 'पर्याय शोधा...' : 'Search options...'}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '6px 26px 6px 10px',
                    fontSize: '12px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    outline: 'none',
                    fontFamily: 'inherit',
                  }}
                />
                {searchFilter && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchFilter('');
                    }}
                    style={{
                      position: 'absolute',
                      right: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable Options List */}
          <div
            style={{
              overflowY: 'auto',
              overflowX: 'hidden',
              flex: 1,
              maxHeight: options.length > 7 ? `calc(${menuMaxHeight || '65vh'} - 48px)` : (menuMaxHeight || '65vh'),
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {filteredOptions.length === 0 ? (
              <div
                style={{
                  padding: '14px',
                  textAlign: 'center',
                  fontSize: '12px',
                  color: '#94a3b8',
                }}
              >
                {isMr ? 'कोणतेही पर्याय आढळले नाहीत' : 'No matching options'}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectOption(opt.value)}
                    style={{
                      padding: '11px 14px',
                      fontSize: '13.5px',
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected ? '#1d4ed8' : '#334155',
                      background: isSelected ? '#eff6ff' : 'transparent',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #f8fafc',
                      wordBreak: 'break-word',
                      whiteSpace: 'normal',
                      lineHeight: 1.4,
                      minHeight: '42px',
                      boxSizing: 'border-box',
                      transition: 'background 0.1s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span style={{ color: '#2563eb', fontWeight: '800', marginLeft: '6px' }}>
                        ✓
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
