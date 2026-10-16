import { useState } from 'react';

const AdminLogin = ({ onLogin, onClose }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const success = onLogin(password);
        if (!success) {
            setError('Access Denied: Invalid Credentials');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full overflow-hidden animate-slide-down">
                {/* Header */}
                <div className="bg-slate-800 p-6 text-center border-b border-slate-700 relative">
                    <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-3xl">🛡️</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">प्रशासक लॉगिन</h2>
                    <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider">Secure Access Required</p>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-slate-600 text-sm font-bold mb-2 uppercase tracking-wide">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                placeholder="Enter admin password"
                                className="w-full px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:bg-white focus:outline-none transition-all text-slate-800"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded text-sm flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider shadow-md hover:shadow-lg transition-all transform active:scale-95"
                        >
                            Login to Dashboard
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-slate-400">
                            Default Password: <span className="font-mono bg-slate-100 px-1 rounded">admin123</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
