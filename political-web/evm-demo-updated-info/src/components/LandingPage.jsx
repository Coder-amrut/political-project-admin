const LandingPage = ({ appState }) => {
    // Get contact numbers from admin settings - NO defaults, only admin-set numbers
    const hasCallNumber = appState?.settings?.contactCall && appState.settings.contactCall.length === 10;
    const hasWhatsappNumber = appState?.settings?.contactWhatsapp && appState.settings.contactWhatsapp.length === 10;

    const callNumber = hasCallNumber ? `+91${appState.settings.contactCall}` : '';
    const whatsappNumber = hasWhatsappNumber ? `91${appState.settings.contactWhatsapp}` : '';

    // Format display number
    const displayCallNumber = hasCallNumber
        ? `+91 ${appState.settings.contactCall.slice(0, 5)} ${appState.settings.contactCall.slice(5)}`
        : 'नंबर सेट करा';

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 font-poppins">
            {/* Tricolor Top Strip */}
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>

            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16 sm:h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                                <span className="text-xl sm:text-2xl">🗳️</span>
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-xl font-bold text-white">डेमो EVM</h1>
                                <p className="text-[10px] sm:text-xs text-slate-400">Digital Voting System</p>
                            </div>
                        </div>

                        {/* CTA Button */}
                        {hasCallNumber && (
                            <a
                                href={`tel:${callNumber}`}
                                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-bold shadow-lg shadow-orange-500/25 transition-all hover:scale-105"
                            >
                                <span>📞</span>
                                <span className="hidden sm:inline">संपर्क करा</span>
                            </a>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Glow Effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
                    <div className="text-center max-w-4xl mx-auto">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-4 py-2 rounded-full mb-6 sm:mb-8">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-green-400 text-xs sm:text-sm font-medium">आता उपलब्ध • मराठी भाषेत</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-white mb-4 sm:mb-6 leading-tight">
                            <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-yellow-400 bg-clip-text text-transparent">
                                इलेक्ट्रॉनिक मतदान
                            </span>
                            <br />
                            <span className="text-white">यंत्र प्रणाली</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-base sm:text-lg lg:text-xl text-slate-400 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
                            निवडणूक प्रचारासाठी व्यावसायिक डेमो EVM. उमेदवार माहिती, फोटो, चिन्ह आणि मतदारांसाठी सोपी मतदान प्रणाली.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                            {hasCallNumber && (
                                <a
                                    href={`tel:${callNumber}`}
                                    className="group flex items-center justify-center gap-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-orange-500/25 transition-all hover:scale-105"
                                >
                                    <span className="text-xl sm:text-2xl group-hover:animate-bounce">📞</span>
                                    <span>आता कॉल करा</span>
                                </a>
                            )}
                            {hasWhatsappNumber && (
                                <a
                                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('नमस्कार, मला डेमो EVM app बद्दल माहिती हवी आहे.')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-green-500/25 transition-all hover:scale-105"
                                >
                                    <span className="text-xl sm:text-2xl group-hover:animate-bounce">💬</span>
                                    <span>WhatsApp करा</span>
                                </a>
                            )}
                            {!hasCallNumber && !hasWhatsappNumber && (
                                <div className="text-slate-400 text-sm bg-slate-800/50 px-6 py-4 rounded-xl border border-slate-700">
                                    ⚠️ Admin Panel → सेटिंग्ज मध्ये संपर्क क्रमांक सेट करा
                                </div>
                            )}
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-10 sm:mt-14 px-4">
                            {[
                                { icon: '🔐', text: '100% सुरक्षित' },
                                { icon: '⚡', text: 'जलद सेटअप' },
                                { icon: '📱', text: 'मोबाईल फ्रेंडली' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-slate-400">
                                    <span className="text-lg sm:text-xl">{item.icon}</span>
                                    <span className="text-xs sm:text-sm font-medium">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* EVM Preview Section */}
            <section className="relative py-12 sm:py-20 bg-gradient-to-b from-slate-800/50 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-14">
                        <span className="inline-block bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3">
                            EVM प्रीव्ह्यू
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
                            असे दिसते आमचे EVM
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                            व्यावसायिक डिझाइन, सोपे वापर, आणि जलद मतदान
                        </p>
                    </div>

                    {/* EVM Mockup */}
                    <div className="max-w-md mx-auto">
                        <div className="bg-slate-800/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-slate-700/50 shadow-2xl">
                            {/* EVM Header */}
                            <div className="bg-gradient-to-r from-orange-500 via-white to-green-500 p-[2px] rounded-xl mb-4">
                                <div className="bg-slate-900 rounded-xl py-3 px-4 text-center">
                                    <p className="text-[10px] sm:text-xs text-slate-400">डेमो मतदान प्रणाली</p>
                                    <p className="text-sm sm:text-base font-bold text-white">नगर परिषद निवडणूक २०२५</p>
                                </div>
                            </div>

                            {/* Candidates */}
                            <div className="space-y-2 sm:space-y-3">
                                {[
                                    { num: 1, name: 'अमित शर्मा', party: 'जन सेवा पक्ष', symbol: '🌾', highlight: false },
                                    { num: 2, name: 'प्रिया जाधव', party: 'लोक कल्याण पक्ष', symbol: '⏰', highlight: true },
                                    { num: 3, name: 'विकास मोरे', party: 'स्वतंत्र', symbol: '🏠', highlight: false }
                                ].map((c) => (
                                    <div
                                        key={c.num}
                                        className={`flex items-center gap-3 p-3 rounded-xl transition-all ${c.highlight
                                            ? 'bg-gradient-to-r from-orange-500/10 to-green-500/10 border border-orange-500/30'
                                            : 'bg-slate-700/30 border border-slate-600/30'
                                            }`}
                                    >
                                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                            {c.num}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold text-sm sm:text-base truncate ${c.highlight ? 'text-orange-300' : 'text-white'}`}>
                                                {c.name}
                                            </p>
                                            <p className="text-[10px] sm:text-xs text-slate-400 truncate">{c.party}</p>
                                        </div>
                                        <div className="text-2xl sm:text-3xl">{c.symbol}</div>
                                        <button className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${c.highlight
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                                            : 'bg-slate-600 text-slate-300'
                                            }`}>
                                            मत द्या
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-14">
                        <span className="inline-block bg-orange-500/10 text-orange-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3">
                            वैशिष्ट्ये
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
                            का निवडावे आमचे EVM?
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
                            व्यावसायिक, सुरक्षित आणि वापरण्यास सोपे
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                        {[
                            {
                                icon: '🎨',
                                title: 'सानुकूल डिझाइन',
                                desc: 'तुमच्या उमेदवाराचे फोटो, पक्ष चिन्ह आणि माहिती जोडा',
                                color: 'from-purple-500 to-pink-500'
                            },
                            {
                                icon: '📊',
                                title: 'थेट निकाल',
                                desc: 'रिअल-टाइम मतदान परिणाम आणि आकडेवारी पहा',
                                color: 'from-blue-500 to-cyan-500'
                            },
                            {
                                icon: '📱',
                                title: 'मोबाईल ऑप्टिमाइझ्ड',
                                desc: 'सर्व फोन आणि टॅब्लेटवर परफेक्ट दिसते',
                                color: 'from-green-500 to-emerald-500'
                            },
                            {
                                icon: '🔗',
                                title: 'सोपी शेअरिंग',
                                desc: 'WhatsApp, SMS किंवा सोशल मीडियावर लिंक शेअर करा',
                                color: 'from-orange-500 to-yellow-500'
                            },
                            {
                                icon: '🇮🇳',
                                title: 'मराठी भाषा',
                                desc: 'संपूर्ण मराठी भाषेत उपलब्ध, समजायला सोपे',
                                color: 'from-orange-500 to-green-500'
                            },
                            {
                                icon: '⚡',
                                title: 'जलद सेटअप',
                                desc: 'काही मिनिटांत तुमचे EVM तयार करा',
                                color: 'from-yellow-500 to-orange-500'
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl sm:rounded-2xl p-5 sm:p-6 hover:border-slate-600 transition-all hover:-translate-y-1"
                            >
                                <div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-2xl sm:text-3xl mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{feature.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-12 sm:py-20 bg-gradient-to-b from-slate-800/30 to-transparent">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10 sm:mb-14">
                        <span className="inline-block bg-green-500/10 text-green-400 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-3">
                            कार्यपद्धती
                        </span>
                        <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
                            कसे काम करते?
                        </h2>
                        <p className="text-slate-400 text-sm sm:text-base">सोप्या ३ पायऱ्या</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto">
                        {[
                            { step: '1', icon: '📝', title: 'माहिती द्या', desc: 'उमेदवार नाव, फोटो आणि पक्ष चिन्ह' },
                            { step: '2', icon: '🔗', title: 'लिंक मिळवा', desc: 'तुमचे युनिक EVM लिंक तयार' },
                            { step: '3', icon: '📤', title: 'शेअर करा', desc: 'WhatsApp वर मतदारांना पाठवा' }
                        ].map((item, i) => (
                            <div key={i} className="text-center">
                                {/* Connector */}
                                {i < 2 && (
                                    <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-slate-600 to-transparent"></div>
                                )}

                                {/* Icon with Number */}
                                <div className="flex items-center justify-center gap-3 mb-4">
                                    {/* Step Number */}
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                                        {item.step}
                                    </div>
                                    {/* Icon */}
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-slate-600 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-xl">
                                        {item.icon}
                                    </div>
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{item.title}</h3>
                                <p className="text-slate-400 text-sm">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-12 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="relative bg-gradient-to-r from-orange-600 via-orange-500 to-green-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 lg:p-16 overflow-hidden">
                        {/* Background Pattern */}
                        <div className="absolute inset-0 opacity-10">
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                        </div>

                        <div className="relative text-center">
                            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white mb-4 sm:mb-6">
                                आजच तुमचे डेमो EVM<br className="sm:hidden" /> बनवा!
                            </h2>
                            <p className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8 max-w-xl mx-auto">
                                विनामूल्य चर्चा करा आणि तुमच्या निवडणूक प्रचारासाठी डेमो EVM मिळवा
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                {hasCallNumber && (
                                    <a
                                        href={`tel:${callNumber}`}
                                        className="flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-orange-600 px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl transition-all hover:scale-105"
                                    >
                                        <span className="text-xl sm:text-2xl">📞</span>
                                        <span>कॉल करा</span>
                                    </a>
                                )}
                                {hasWhatsappNumber && (
                                    <a
                                        href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('नमस्कार, मला डेमो EVM app बद्दल माहिती हवी आहे.')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl transition-all hover:scale-105"
                                    >
                                        <span className="text-xl sm:text-2xl">💬</span>
                                        <span>WhatsApp</span>
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-10 sm:py-14">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                        {/* Company */}
                        <div className="sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-green-500 rounded-xl flex items-center justify-center">
                                    <span className="text-xl">🗳️</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">डेमो EVM</h3>
                                    <p className="text-xs text-slate-500">Digital Voting</p>
                                </div>
                            </div>
                            <p className="text-slate-400 text-sm mb-4">
                                व्यावसायिक निवडणूक प्रचार EVM प्रणाली
                            </p>
                            {hasCallNumber ? (
                                <a href={`tel:${callNumber}`} className="text-orange-400 font-bold hover:text-orange-300 transition-colors">
                                    {displayCallNumber}
                                </a>
                            ) : (
                                <span className="text-slate-500 text-sm">📞 Admin मध्ये नंबर सेट करा</span>
                            )}
                        </div>

                        {/* Services */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">सेवा</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li>✅ सानुकूल EVM विकास</li>
                                <li>✅ निवडणूक व्यवस्थापन</li>
                                <li>✅ थेट निकाल प्रणाली</li>
                                <li>✅ तांत्रिक सहाय्य</li>
                            </ul>
                        </div>

                        {/* Contact */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">संपर्क</h4>
                            <ul className="space-y-2 text-slate-400 text-sm">
                                <li className="flex items-center gap-2">
                                    <span>📍</span>
                                    <span>सांगली, महाराष्ट्र</span>
                                </li>
                                {hasCallNumber && (
                                    <li className="flex items-center gap-2">
                                        <span>📞</span>
                                        <span>{displayCallNumber}</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="text-white font-semibold mb-4">त्वरित संपर्क</h4>
                            <div className="space-y-2">
                                {hasCallNumber && (
                                    <a
                                        href={`tel:${callNumber}`}
                                        className="flex items-center gap-2 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <span>📞</span>
                                        <span>कॉल करा</span>
                                    </a>
                                )}
                                {hasWhatsappNumber && (
                                    <a
                                        href={`https://wa.me/${whatsappNumber}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                    >
                                        <span>💬</span>
                                        <span>WhatsApp</span>
                                    </a>
                                )}
                                {!hasCallNumber && !hasWhatsappNumber && (
                                    <p className="text-slate-500 text-xs">Admin मध्ये नंबर सेट करा</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom */}
                    <div className="border-t border-slate-800 pt-6 text-center">
                        <p className="text-slate-500 text-xs sm:text-sm">
                            © 2025 <span className="text-orange-400 font-semibold">Infoyashonand Technology Pvt Ltd</span>. सर्व हक्क राखीव.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            {hasWhatsappNumber && (
                <a
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('नमस्कार, मला डेमो EVM app बद्दल माहिती हवी आहे.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-2xl shadow-xl shadow-green-500/30 hover:scale-110 transition-transform z-50"
                >
                    💬
                </a>
            )}

            {/* Tricolor Bottom Strip */}
            <div className="h-1.5 bg-gradient-to-r from-orange-500 via-white to-green-500"></div>
        </div>
    );
};

export default LandingPage;
