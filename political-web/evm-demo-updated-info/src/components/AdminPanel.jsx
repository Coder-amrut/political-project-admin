import { useState } from 'react';
import CandidatePagesTab from './admin/CandidatePagesTab';
import ResultsTab from './admin/ResultsTab';
import SettingsTab from './admin/SettingsTab';

const AdminPanel = ({ appState, setAppState, onLogout }) => {
    const [activeTab, setActiveTab] = useState('candidates');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const tabs = [
        { id: 'candidates', label: 'उमेदवार व्यवस्थापन', shortLabel: 'उमेदवार', icon: '👥' },
        { id: 'results', label: 'निकाल', shortLabel: 'निकाल', icon: '📊' },
        { id: 'settings', label: 'सेटिंग्ज', shortLabel: 'सेटिंग्ज', icon: '⚙️' },
    ];

    const handleTabClick = (tabId) => {
        setActiveTab(tabId);
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-slate-100 font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-1.5 sm:p-2 rounded-lg shadow-lg">
                                <span className="text-lg sm:text-2xl">🛡️</span>
                            </div>
                            <div>
                                <h1 className="text-base sm:text-xl font-bold tracking-wide">प्रशासक पॅनेल</h1>
                                <p className="text-slate-400 text-[10px] sm:text-xs uppercase tracking-wider hidden sm:block">
                                    Election Administration System
                                </p>
                            </div>
                        </div>

                        {/* Desktop Actions */}
                        <div className="hidden sm:flex gap-2 sm:gap-3">
                            <a
                                href="/"
                                target="_blank"
                                className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all border border-slate-600 flex items-center gap-2"
                            >
                                <span>👁️</span>
                                <span>View Site</span>
                            </a>
                            <button
                                onClick={onLogout}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center gap-2"
                            >
                                <span>🚪</span>
                                <span>लॉगआउट</span>
                            </button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="sm:hidden bg-slate-700/50 p-2 rounded-lg"
                        >
                            <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="sm:hidden mt-3 pt-3 border-t border-slate-700 space-y-2 animate-fade-in">
                            <a
                                href="/"
                                target="_blank"
                                className="flex items-center gap-2 text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-700/50 transition-all"
                            >
                                <span>👁️</span>
                                <span>View Site</span>
                            </a>
                            <button
                                onClick={onLogout}
                                className="w-full flex items-center gap-2 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all"
                            >
                                <span>🚪</span>
                                <span>लॉगआउट</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Tab Navigation - Fixed Bottom */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-40">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabClick(tab.id)}
                            className={`flex-1 flex flex-col items-center justify-center py-2.5 transition-all ${activeTab === tab.id
                                    ? 'text-blue-600 bg-blue-50'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            <span className="text-xl mb-0.5">{tab.icon}</span>
                            <span className="text-[10px] font-medium">{tab.shortLabel}</span>
                            {activeTab === tab.id && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 pb-24 sm:pb-8">
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">

                    {/* Sidebar Navigation - Desktop Only */}
                    <div className="hidden sm:block w-56 lg:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-24">
                            <div className="p-3 sm:p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Menu</h3>
                            </div>
                            <div className="p-2 space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => handleTabClick(tab.id)}
                                        className={`
                                            w-full text-left px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg font-medium text-sm transition-all duration-200
                                            flex items-center gap-2 lg:gap-3
                                            ${activeTab === tab.id
                                                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                            }
                                        `}
                                    >
                                        <span className="text-base lg:text-lg">{tab.icon}</span>
                                        <span className="truncate">{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 min-w-0">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[400px] sm:min-h-[500px] p-3 sm:p-6 lg:p-8">
                            {/* Tab Title - Desktop */}
                            <div className="hidden sm:flex mb-6 lg:mb-8 pb-4 border-b border-slate-100 justify-between items-center">
                                <h2 className="text-xl lg:text-2xl font-bold text-slate-800">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h2>
                                <span className="text-slate-400 text-xs lg:text-sm">
                                    {activeTab === 'candidates' && 'Manage candidate list'}
                                    {activeTab === 'results' && 'View live analytics'}
                                    {activeTab === 'settings' && 'System configuration'}
                                </span>
                            </div>

                            {/* Tab Title - Mobile */}
                            <div className="sm:hidden mb-4 flex items-center gap-2">
                                <span className="text-2xl">{tabs.find(t => t.id === activeTab)?.icon}</span>
                                <h2 className="text-lg font-bold text-slate-800">
                                    {tabs.find(t => t.id === activeTab)?.label}
                                </h2>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'candidates' && (
                                <CandidatePagesTab appState={appState} setAppState={setAppState} />
                            )}
                            {activeTab === 'results' && (
                                <ResultsTab appState={appState} setAppState={setAppState} />
                            )}
                            {activeTab === 'settings' && (
                                <SettingsTab appState={appState} setAppState={setAppState} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
