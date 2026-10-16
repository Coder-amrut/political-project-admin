const VoteConfirmationModal = ({ candidates, electionName, onClose, currentSlug }) => {
    // Support both single candidate (backward compat) and multiple candidates
    const candidateList = Array.isArray(candidates) ? candidates : [candidates].filter(Boolean);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md overflow-hidden max-h-[95vh] flex flex-col">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 flex justify-between items-center flex-shrink-0">
                    <h3 className="text-sm sm:text-base font-bold truncate pr-2">
                        {electionName || 'निवडणूक'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-xl transition-colors flex-shrink-0"
                    >
                        ×
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto flex-1 overscroll-contain">
                    <div className="p-3 sm:p-4">
                        <p className="text-gray-500 text-[11px] sm:text-xs mb-3 text-center">
                            मी डेमो ईव्हीएम वर खालील उमेदवारांना मतदान केले:
                        </p>

                        {/* Candidates List - Compact Cards */}
                        <div className="space-y-3">
                            {candidateList.map((candidate, index) => (
                                <div key={index} className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-3 border border-slate-200 shadow-sm">
                                    {/* Section Badge */}
                                    {candidate.section && (
                                        <div className="mb-2 text-center">
                                            <span className="inline-block bg-purple-100 text-purple-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold">
                                                {candidate.section}
                                            </span>
                                        </div>
                                    )}
                                    
                                    {/* Horizontal Layout */}
                                    <div className="flex items-center gap-3">
                                        {/* Photo */}
                                        <div className="flex-shrink-0">
                                            <img
                                                src={candidate.photo}
                                                alt={candidate.name}
                                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-md"
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/150/cccccc/666666?text=Photo';
                                                }}
                                            />
                                        </div>
                                        
                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h2 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                                                {candidate.name}
                                            </h2>
                                            <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                                                {candidate.party}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <span className="text-blue-600 font-bold text-[11px] sm:text-xs bg-blue-50 px-2 py-0.5 rounded">
                                                    क्र. {candidate.number}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Symbol */}
                                        <div className="flex-shrink-0">
                                            {candidate.symbol && (
                                                <img
                                                    src={candidate.symbol}
                                                    alt="symbol"
                                                    className="w-10 h-10 sm:w-12 sm:h-12 object-contain border border-slate-200 rounded-lg p-1 bg-white"
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/150?text=Symbol';
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Share Button */}
                <div className="p-3 sm:p-4 border-t border-slate-100 flex-shrink-0 bg-white">
                    <button
                        onClick={() => {
                            const hostname = window.location.hostname;
                            const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
                            const baseUrl = isLocalhost
                                ? `http://${hostname}:${window.location.port}`
                                : window.location.origin;

                            // Use currentSlug (from URL) instead of first candidate's slug
                            // This ensures the same link that was opened is shared
                            const shareUrl = `${baseUrl}/${currentSlug}`;

                            // Build message with ALL voted candidates
                            let candidatesText = '';
                            if (candidateList.length > 0) {
                                const votesBySection = {};
                                candidateList.forEach(vc => {
                                    const section = vc.section || 'अन्य';
                                    if (!votesBySection[section]) {
                                        votesBySection[section] = [];
                                    }
                                    votesBySection[section].push({
                                        name: vc.name,
                                        party: vc.party,
                                        number: vc.number
                                    });
                                });

                                const sectionEntries = Object.entries(votesBySection);
                                if (sectionEntries.length === 1) {
                                    candidatesText = candidateList.map(vc => 
                                        `क्र. ${vc.number} - *${vc.name}* (${vc.party || 'पक्ष'})`
                                    ).join('\n');
                                } else {
                                    candidatesText = sectionEntries.map(([section, cands]) =>
                                        `📋 *${section}*:\n${cands.map(c => 
                                            `क्र. ${c.number} - *${c.name}* (${c.party || 'पक्ष'})`
                                        ).join('\n')}`
                                    ).join('\n\n');
                                }
                            } else {
                                candidatesText = `• *${candidateList[0]?.name || 'उमेदवार'}*`;
                            }

                            const shareMessage = `मी खालील उमेदवारांना मतदान केले आहे:\n${candidatesText}\n\nतुम्ही पण खालील लिंक वर क्लिक करून मतदान करा:\n👉 ${shareUrl}`;

                            if (navigator.share) {
                                navigator.share({ text: shareMessage }).catch(() => {
                                    window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
                                });
                            } else {
                                window.open(`https://wa.me/?text=${encodeURIComponent(shareMessage)}`, '_blank');
                            }
                        }}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        शेअर करा
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VoteConfirmationModal;
