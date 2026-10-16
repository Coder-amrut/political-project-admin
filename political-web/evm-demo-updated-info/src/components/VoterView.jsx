import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import VoteConfirmationModal from './VoteConfirmationModal';
import OptimizedImage, { preloadImages } from './OptimizedImage';
import voteSong from '../assets/vote_song.mp3';
import wrongSound from '../assets/wrong_sound.mp3';
import { FastLoader } from '../utils/indexManager';

// Helper function to check if a color is light (for text contrast)
const isLightColor = (color) => {
    if (!color) return false;
    
    // Convert hex to RGB
    let hex = color.replace('#', '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate luminance - colors with luminance > 0.6 are considered light
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6;
};

const VoterView = ({ appState, setAppState }) => {
    const { slug } = useParams();
    const candidateRefs = useRef({}); // Refs for scrolling to candidates

    useEffect(() => {
        // Clear FastLoader cache for this slug so latest admin changes are used
        FastLoader.clearCache?.();
    }, [slug]);

    const [showVoteModal, setShowVoteModal] = useState(false);
    const [votedCandidates, setVotedCandidates] = useState([]);
    const [votedSections, setVotedSections] = useState(new Set()); // Track which sections have been voted
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [voicesLoaded, setVoicesLoaded] = useState(false);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    // Preload voices when component mounts
    useEffect(() => {
        const loadVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                // Priority 1: Google Hindi female voice with natural names (Neer, Lekha, etc.)
                let voice = voices.find(v =>
                    v.name.toLowerCase().includes('google') &&
                    v.lang === 'hi-IN' &&
                    (v.name.toLowerCase().includes('neer') ||
                        v.name.toLowerCase().includes('lekha') ||
                        v.name.toLowerCase().includes('female'))
                );

                // Priority 2: Any Google Hindi voice
                if (!voice) {
                    voice = voices.find(v =>
                        v.name.toLowerCase().includes('google') &&
                        v.lang === 'hi-IN'
                    );
                }

                // Priority 3: Microsoft Hindi female voice
                if (!voice) {
                    voice = voices.find(v =>
                        v.lang === 'hi-IN' &&
                        (v.name.toLowerCase().includes('female') ||
                            v.name.toLowerCase().includes('swara'))
                    );
                }

                // Priority 4: Any Hindi voice
                if (!voice) {
                    voice = voices.find(v =>
                        v.lang === 'hi-IN' || v.lang.startsWith('hi')
                    );
                }

                // Priority 5: Google Marathi voice (if available)
                if (!voice) {
                    voice = voices.find(v =>
                        v.name.toLowerCase().includes('google') &&
                        (v.lang === 'mr-IN' || v.lang.startsWith('mr'))
                    );
                }

                // Priority 6: Any Marathi voice
                if (!voice) {
                    voice = voices.find(v =>
                        v.lang === 'mr-IN' || v.lang.startsWith('mr')
                    );
                }

                // Priority 7: Any female voice
                if (!voice) {
                    voice = voices.find(v =>
                        v.name.toLowerCase().includes('female')
                    );
                }

                setSelectedVoice(voice);
                setVoicesLoaded(true);
                console.log('🎤 Voice preloaded:', voice?.name || 'default', '| Lang:', voice?.lang || 'default');
            }
        };

        // Load voices immediately if available
        loadVoices();

        // Also listen for voices changed event
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, []);

    // Set images as loaded after component mounts
    useEffect(() => {
        const timer = setTimeout(() => {
            setImagesLoaded(true);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const playVoteSound = () => {
        // Default to true if enableSound is not set
        if (appState.settings?.enableSound === false) return;
        try {
            const audio = new Audio(voteSong);
            audio.volume = 0.7;
            audio.play().catch(error => console.log('Error playing vote sound:', error));
        } catch (error) {
            console.log('Error playing vote sound:', error);
        }
    };

    const speakMessage = (text) => {
        if ('speechSynthesis' in window && text && voicesLoaded) {
            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            // Create utterance with preloaded voice
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'hi-IN';
            utterance.rate = 0.9;
            utterance.pitch = 1.1;
            utterance.volume = 1.0;

            // Use preloaded voice
            if (selectedVoice) {
                utterance.voice = selectedVoice;
            }

            // Add event listeners for debugging
            utterance.onstart = () => console.log('🗣️ Speech started');
            utterance.onend = () => console.log('✅ Speech ended');
            utterance.onerror = (e) => console.error('❌ Speech error:', e);

            // Speak immediately
            window.speechSynthesis.speak(utterance);
        }
    };

    const vibrateDevice = () => {
        // Default to true if enableVibration is not set
        if (appState.settings?.enableVibration === false) return;
        if ('vibrate' in navigator) navigator.vibrate([500]);
    };

    // Find ALL candidate pages and group by section (position)
    const [sectionsData, setSectionsData] = useState([]);

    // Load candidates filtered by slug - show ALL sections that belong to the same group
    useEffect(() => {
        const loadCandidates = async () => {
            const startTime = performance.now();
            try {
                // Get all candidate pages
                const allPages = appState.candidatePages || [];

                // Find the candidate matching the current slug
                const matchedCandidate = allPages.find(page => page.slug === slug);

                if (!matchedCandidate) {
                    console.warn('No candidate found for slug:', slug);
                    setSectionsData([]);
                    return;
                }

                // Filter candidates that belong to the same group
                // Priority 1: Use pageGroupId if available (for new data)
                // Priority 2: Show only same position (for old data without pageGroupId)
                let filteredPages;

                console.log('🔍 matchedCandidate:', matchedCandidate.candidateName, 'pageGroupId:', matchedCandidate.pageGroupId);

                if (matchedCandidate.pageGroupId) {
                    // Use pageGroupId for precise matching - groups multiple sections created together
                    filteredPages = allPages.filter(page =>
                        page.pageGroupId === matchedCandidate.pageGroupId
                    );
                    console.log(`🔗 Filtering by pageGroupId: ${matchedCandidate.pageGroupId}`);
                } else {
                    // No pageGroupId = old data or single section
                    // Show ONLY candidates from the SAME POSITION as the linked candidate
                    const targetPosition = matchedCandidate.electionInfo?.position || 'अन्य';

                    filteredPages = allPages.filter(page => {
                        const pagePosition = page.electionInfo?.position || 'अन्य';
                        return pagePosition === targetPosition;
                    });
                    console.log(`📋 Filtering by position: "${targetPosition}"`);
                }

                // Debug: Log sectionColor from filtered pages
                console.log('🎨 Section colors from pages:', filteredPages.map(p => ({
                    name: p.candidateName,
                    position: p.electionInfo?.position,
                    sectionColor: p.sectionColor
                })));

                // Group by position (section header) - now we'll have multiple sections
                const grouped = {};
                filteredPages.forEach(page => {
                    const position = page.electionInfo?.position || 'अन्य';
                    if (!grouped[position]) {
                        grouped[position] = {
                            position,
                            color: page.sectionColor || '#e91e63',
                            maxCandidates: page.maxCandidates || 16,
                            candidates: []
                        };
                        console.log(`🎨 Section "${position}" color: ${page.sectionColor || '#e91e63 (default)'}, maxCandidates: ${page.maxCandidates || '16 (default)'}`);
                    }
                    grouped[position].candidates.push(page);
                });

                // Convert to array and sort candidates by serial number
                const sections = Object.values(grouped).map(section => ({
                    ...section,
                    candidates: section.candidates.sort((a, b) =>
                        (a.serialNumber || 0) - (b.serialNumber || 0)
                    )
                }));

                setSectionsData(sections);
                const loadTime = performance.now() - startTime;
                console.log(`⚡ Loaded ${sections.length} section(s) with ${filteredPages.length} candidates in ${loadTime.toFixed(2)}ms`);
            } catch (error) {
                console.warn('Loading failed:', error);
            }
        };

        loadCandidates();
    }, [appState.candidatePages, slug]);

    // Get matched candidate for election info (based on current slug)
    const candidatePage = appState.candidatePages?.find(page => page.slug === slug) || appState.candidatePages?.[0];

    // Play voice message for a SPECIFIC candidate (uses candidate's own audio/message)
    const playCandidateVoiceMessage = (candidateId) => {
        // Find the specific candidate from candidatePages
        const candidate = appState.candidatePages?.find(page => page.id === candidateId);
        
        if (!candidate) {
            console.log('❌ Candidate not found for voice:', candidateId);
            return;
        }

        const audioFile = candidate.electionInfo?.audio;
        const textMessage = candidate.electionInfo?.message || '';

        console.log('🎤 Playing voice for candidate:', candidate.candidateName, '| Audio:', audioFile ? 'Yes' : 'No', '| Message:', textMessage || 'None');

        // Check if audio file exists and is valid
        if (audioFile && audioFile.trim() !== '' && audioFile !== 'null' && audioFile !== 'uploading...') {
            try {
                const audio = new Audio(audioFile);
                audio.volume = 0.8;
                audio.play().catch(error => {
                    console.log('Error playing candidate audio, falling back to text-to-speech:', error);
                    if (textMessage) {
                        speakMessage(textMessage);
                    }
                });
                console.log('🎵 Playing candidate audio message');
            } catch (error) {
                console.log('Error with candidate audio, using text-to-speech:', error);
                if (textMessage) {
                    speakMessage(textMessage);
                }
            }
        } else if (textMessage) {
            console.log('🗣️ No candidate audio, using text-to-speech');
            speakMessage(textMessage);
        } else {
            console.log('⚠️ No audio or message set for this candidate');
        }
    };

    const playVoterMessage = () => {
        const audioFile = candidatePage?.electionInfo?.audio || appState.electionInfo?.audio;
        const textMessage = candidatePage?.electionInfo?.message || appState.electionInfo?.message || '';

        // Check if audio file exists and is not empty/null (supports both base64 and Firebase URLs)
        if (audioFile && audioFile.trim() !== '' && audioFile !== 'null' && audioFile !== 'uploading...') {
            // Play audio file if available
            try {
                const audio = new Audio(audioFile);
                audio.volume = 0.8;
                audio.play().catch(error => {
                    console.log('Error playing audio, falling back to text-to-speech:', error);
                    // Fallback to text-to-speech if audio fails
                    if (textMessage) {
                        speakMessage(textMessage);
                    }
                });
                console.log('🎵 Playing audio message');
            } catch (error) {
                console.log('Error with audio, using text-to-speech:', error);
                // Fallback to text-to-speech if audio fails
                if (textMessage) {
                    speakMessage(textMessage);
                }
            }
        } else if (textMessage) {
            // Use text-to-speech if no audio or audio is empty/null
            console.log('🗣️ No audio found, using text-to-speech');
            speakMessage(textMessage);
        }
    };

    console.log('VoterView sections =>', sectionsData);

    // Check if vote count should be shown (from matched candidate)
    const showVoteCount = candidatePage?.showVoteCount === true || candidatePage?.showVoteCount === 'true';

    // Get all candidates count
    const allCandidates = useMemo(() => {
        return sectionsData.flatMap(section => section.candidates);
    }, [sectionsData]);

    // Get total votes for current candidate page (direct from candidate's votes field)
    const totalVotes = candidatePage?.votes || 0;

    // Create EVM rows for each section
    const createEvmRows = (section) => {
        const maxRows = section.maxCandidates || 16;
        return Array.from({ length: maxRows }, (_, i) => {
            const serialNumber = i + 1;
            const candidate = section.candidates.find(c => c.serialNumber === serialNumber);
            return {
                serialNumber,
                candidate: candidate ? {
                    id: candidate.id,
                    number: candidate.serialNumber,
                    name: candidate.candidateName,
                    party: candidate.partyName,
                    symbol: candidate.partySymbol,
                    photo: candidate.candidatePhoto,
                    highlighted: candidate.highlighted,
                    slug: candidate.slug
                } : null
            };
        });
    };

    // Preload first 4 candidate images for instant display
    useEffect(() => {
        if (sectionsData.length > 0) {
            const imagesToPreload = [];
            sectionsData.forEach(section => {
                section.candidates.slice(0, 4).forEach(c => {
                    if (c.candidatePhoto) imagesToPreload.push(c.candidatePhoto);
                    if (c.partySymbol) imagesToPreload.push(c.partySymbol);
                });
            });
            preloadImages(imagesToPreload);
        }
    }, [sectionsData]);

    const openWhatsApp = async (specificCandidate = null) => {
        // Get base URL - ensure http:// for localhost
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const baseUrl = isLocalhost
            ? `http://${hostname}:${window.location.port}`
            : window.location.origin;

        // ALWAYS use the current page's slug (from URL) for sharing
        // This ensures the same link that was opened is shared
        const currentSlug = slug; // slug from useParams()
        console.log('🔗 Sharing with slug:', currentSlug);

        // If sharing for a specific candidate, use their slug
        let shareUrl;
        let candidatesList = '';
        
        if (specificCandidate) {
            // Share link for specific candidate - simple slug link
            shareUrl = `${baseUrl}/${specificCandidate.slug}`;
            candidatesList = `क्र. ${specificCandidate.number} - *${specificCandidate.name}* (${specificCandidate.party || 'पक्ष'})`;
        } else if (votedCandidates.length > 0) {
            // Share link should be the SAME as the page that was opened (current slug)
            shareUrl = `${baseUrl}/${currentSlug}`;
            
            // Build message with ALL voted candidates
            // Group by section/position for better formatting
            const votesBySection = {};
            votedCandidates.forEach(vc => {
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

            // Format: क्र. X - Name (Party)
            const sectionEntries = Object.entries(votesBySection);
            if (sectionEntries.length === 1) {
                // Single section
                candidatesList = votedCandidates
                    .map(vc => `क्र. ${vc.number} - *${vc.name}* (${vc.party || 'पक्ष'})`)
                    .join('\n');
            } else {
                // Multiple sections
                candidatesList = sectionEntries
                    .map(([section, candidates]) => {
                        const lines = candidates
                            .map(c => `क्र. ${c.number} - *${c.name}* (${c.party || 'पक्ष'})`)
                            .join('\n');
                        return `📋 *${section}*:\n${lines}`;
                    })
                    .join('\n\n');
            }
        } else {
            // Default: use current page candidate
            shareUrl = `${baseUrl}/${slug}`;
            candidatesList = `*${candidatePage?.candidateName || 'उमेदवार'}*`;
        }

        // Professional Marathi message
        const message = specificCandidate 
            ? `कृपया खालील उमेदवाराला मतदान करा:\n\n${candidatesList}\n\n👉 ${shareUrl}`
            : `मी खालील उमेदवारांना मतदान केले आहे:\n\n${candidatesList}\n\nतुम्ही पण खालील लिंक वर क्लिक करून मतदान करा:\n👉 ${shareUrl}`;

        // Try native share API first (works on mobile and shows all apps)
        if (navigator.share) {
            try {
                await navigator.share({
                    text: message
                });
            } catch (error) {
                // User cancelled or error occurred
                console.log('Share cancelled or failed:', error);
            }
        } else {
            // Fallback to WhatsApp
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            window.open(whatsappUrl, '_blank');
        }
    };

    // Copy candidate link to clipboard
    const copyCandidateLink = (candidate) => {
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
        const baseUrl = isLocalhost
            ? `http://${hostname}:${window.location.port}`
            : window.location.origin;
        
        // Simple slug link without ?candidate= parameter
        const link = `${baseUrl}/${candidate.slug}`;
        navigator.clipboard.writeText(link).then(() => {
            alert('✅ लिंक कॉपी झाली!');
        }).catch(() => {
            // Fallback for older browsers
            prompt('लिंक कॉपी करा:', link);
        });
    };

    const playErrorSound = () => {
        if (!appState.settings?.enableSound) return;
        try {
            const audio = new Audio(wrongSound);
            audio.volume = 0.8;
            audio.play().catch(error => console.log('Error playing wrong sound:', error));
        } catch (error) {
            console.log('Error playing wrong sound:', error);
        }
    };

    // Check if a section has already been voted
    const hasSectionBeenVoted = (sectionPosition) => {
        return votedSections.has(sectionPosition);
    };

    const handleVote = (candidate, sectionPosition) => {
        if (!candidate) {
            // Empty button clicked - show error
            playErrorSound();
            vibrateDevice();
            return;
        }

        // Check if this specific section has already been voted (per-section voting)
        if (hasSectionBeenVoted(sectionPosition) && !appState.settings?.allowMultipleVotes) {
            playErrorSound();
            alert(`⚠️ आपण या विभागात (${sectionPosition}) आधीच मतदान केले आहे!`);
            return;
        }

        // Add candidate to voted list with section info
        const candidateWithSection = {
            ...candidate,
            section: sectionPosition
        };
        setVotedCandidates(prev => [...prev, candidateWithSection]);

        // Mark this section as voted
        const newVotedSections = new Set([...votedSections, sectionPosition]);
        setVotedSections(newVotedSections);

        // Play vote sound first
        playVoteSound();
        vibrateDevice();

        // Play THIS CANDIDATE's voice message after vote sound
        setTimeout(() => {
            playCandidateVoiceMessage(candidate.id);
        }, 800);

        // Check if all sections are now voted (using updated set)
        const allSectionsVoted = sectionsData.every(section =>
            newVotedSections.has(section.position)
        );

        console.log('📊 Vote status:', {
            totalSections: sectionsData.length,
            votedSections: newVotedSections.size,
            allSectionsVoted,
            sections: sectionsData.map(s => s.position),
            voted: [...newVotedSections]
        });

        // Only show modal and update vote count when ALL sections are voted (last vote)
        if (allSectionsVoted) {
            // Show modal after 3 seconds to let the vote sound and message finish
            setTimeout(() => {
                setShowVoteModal(true);
            }, 3000);

            // Update vote count for EACH voted candidate directly in their candidatePage
            setAppState(prev => {
                // Get all voted candidate IDs
                const votedCandidateIds = [...votedCandidates, candidateWithSection].map(vc => vc.id);
                
                // Update votes for each voted candidate
                const updatedCandidatePages = prev.candidatePages.map(page => {
                    if (votedCandidateIds.includes(page.id)) {
                        return {
                            ...page,
                            votes: (page.votes || 0) + 1
                        };
                    }
                    return page;
                });

                // Also update global vote count
                const newGlobalCount = (prev.globalVoteCount || 0) + 1;

                console.log('✅ Votes updated for candidates:', votedCandidateIds, 'Global count:', newGlobalCount);

                return {
                    ...prev,
                    hasVoted: true,
                    candidatePages: updatedCandidatePages,
                    globalVoteCount: newGlobalCount
                };
            });
        }
        // For intermediate votes, just sound + voice plays - no vote count update
    };

    if (!candidatePage || sectionsData.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 to-purple-600 p-4">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
                    <h1 className="text-3xl font-bold text-slate-800 mb-4">पृष्ठ सापडले नाही</h1>
                    <p className="text-slate-600 mb-6">हे मतदान पृष्ठ अस्तित्वात नाही.</p>
                </div>
            </div>
        );
    }

    // Show loading state while images are loading
    if (!imagesLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
                <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-600 mx-auto mb-4"></div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">लोड करत आहे...</h3>
                    <p className="text-slate-500 text-sm">कृपया प्रतीक्षा करा</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f3f4f6] font-poppins overflow-x-hidden">
            {/* Header - Pink Gradient */}
            <div className="bg-gradient-to-r from-[#c2185b] to-[#e91e63] text-white shadow-lg">
                {/* Election Name & Info Bar */}
                <div className="px-3 sm:px-4 py-3 bg-[#ad1457]">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-white font-bold text-sm sm:text-base truncate">
                                {candidatePage.electionInfo?.name || appState.electionInfo?.name || 'निवडणूक'}
                            </p>
                            <p className="text-white/70 text-[10px] sm:text-xs">
                                {sectionsData.length} विभाग • {allCandidates.length} उमेदवार
                            </p>
                        </div>
                        <button
                            onClick={openWhatsApp}
                            className="bg-[#25D366] hover:bg-[#128C7E] p-2 rounded-full shadow-lg transition-all flex-shrink-0"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Date Time */}
                <div className="px-3 sm:px-4 pt-2 pb-2">
                    <div className="text-center py-2 text-xs sm:text-sm font-bold text-white bg-[#880e4f] rounded-md shadow-sm">
                        {candidatePage.electionInfo?.dateTime || appState.electionInfo?.dateTime || ''}
                    </div>
                </div>
            </div>

            {/* Main EVM Cards - Multiple Sections */}
            <div className="mx-2 sm:mx-3 mt-3 mb-4 space-y-4">
                {sectionsData.map((section, sectionIndex) => {
                    const evmRows = createEvmRows(section);

                    return (
                        <div key={sectionIndex} className="bg-white rounded-xl shadow-2xl overflow-hidden border-4 border-slate-400">
                            {/* Card Header with Section Position */}
                            <div
                                className="text-center py-3 shadow-md"
                                style={{
                                    background: `linear-gradient(to right, ${section.color}, ${section.color}dd)`,
                                    color: isLightColor(section.color) ? '#1e293b' : 'white'
                                }}
                            >
                                <h2 className="text-xs sm:text-sm font-bold tracking-wider uppercase">
                                    {section.position}
                                </h2>
                            </div>

                            {/* Table */}
                            <div className="w-full overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead 
                                        className="text-[10px] sm:text-xs border-b-2 font-bold"
                                        style={{
                                            backgroundColor: `${section.color}15`,
                                            borderBottomColor: `${section.color}50`,
                                            color: isLightColor(section.color) ? '#1e293b' : '#1e293b'
                                        }}
                                    >
                                        <tr>
                                            <th className="py-2 px-1 text-center border-r w-[8%]" style={{ borderColor: `${section.color}30` }}>क्र.</th>
                                            <th className="py-2 px-2 text-left border-r w-[35%]" style={{ borderColor: `${section.color}30` }}>उमेदवाराचे नाव</th>
                                            <th className="py-2 px-1 text-center border-r w-[15%]" style={{ borderColor: `${section.color}30` }}>उमेदवार फोटो</th>
                                            <th className="py-2 px-1 text-center border-r w-[12%]" style={{ borderColor: `${section.color}30` }}>चिन्ह</th>
                                            <th className="py-2 px-1 text-center w-[30%]">मत</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white">
                                        {evmRows.map(({ serialNumber, candidate }) => {
                                            return (
                                            <tr
                                                key={serialNumber}
                                                ref={candidate ? (el) => candidateRefs.current[candidate.id] = el : undefined}
                                                id={candidate ? `candidate-${candidate.id}` : undefined}
                                                className="border-b border-slate-200 transition-all"
                                                style={{
                                                    backgroundColor: candidate?.highlighted 
                                                        ? `${section.color}10` 
                                                        : 'white'
                                                }}
                                            >
                                                {/* Number */}
                                                <td className="py-3 px-1 text-center border-r border-slate-200 align-middle">
                                                    <span className="font-bold text-slate-700 text-sm">
                                                        {serialNumber}
                                                    </span>
                                                </td>

                                                {/* Name Only */}
                                                <td className="py-2 px-2 border-r border-slate-200 align-middle">
                                                    {candidate ? (
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-xs leading-tight">
                                                                {candidate.name}
                                                            </div>
                                                            <div className="text-slate-500 text-[9px] mt-0.5 font-medium">
                                                                {candidate.party}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="h-12"></div>
                                                    )}
                                                </td>

                                                {/* Photo Only */}
                                                <td className="py-0.5 px-0 text-center border-r border-slate-200 align-middle">
                                                    {candidate && (
                                                        <OptimizedImage
                                                            src={candidate.photo}
                                                            alt={candidate.name || 'candidate'}
                                                            className="w-16 h-16 rounded-md mx-auto border-2 border-slate-200"
                                                            fallbackSrc="https://via.placeholder.com/150/cccccc/666666?text=Photo"
                                                            priority={serialNumber <= 4}
                                                        />
                                                    )}
                                                </td>

                                                {/* Symbol Only */}
                                                <td className="py-0.5 px-0 text-center border-r border-slate-200 align-middle">
                                                    {candidate && (
                                                        <OptimizedImage
                                                            src={candidate.symbol}
                                                            alt={candidate.party || 'symbol'}
                                                            className="w-16 h-16 rounded mx-auto border border-slate-200"
                                                            fallbackSrc="https://via.placeholder.com/150/cccccc/666666?text=Symbol"
                                                            priority={serialNumber <= 4}
                                                            style={{ objectFit: 'contain' }}
                                                        />
                                                    )}
                                                </td>

                                                {/* Vote Button */}
                                                <td className="py-2 px-1 text-center align-middle">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all duration-300 ${votedCandidates.some(vc => vc.id === candidate?.id)
                                                            ? 'bg-red-500 border-red-600 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse'
                                                            : 'bg-slate-200 border-slate-400'
                                                            }`}></div>
                                                        <button
                                                            onClick={() => handleVote(candidate, section.position)}
                                                            disabled={candidate && hasSectionBeenVoted(section.position) && !appState.settings?.allowMultipleVotes}
                                                            className={`h-9 w-16 rounded-md shadow-md border-b-4 flex items-center justify-center text-[10px] text-white font-bold transition-all ${!candidate
                                                                ? 'bg-blue-300 border-blue-400 cursor-pointer hover:bg-blue-400 hover:shadow-[0_0_10px_rgba(239,68,68,0.6)] active:border-b-0 active:translate-y-1'
                                                                : (hasSectionBeenVoted(section.position) && !appState.settings?.allowMultipleVotes)
                                                                    ? 'bg-slate-400 border-slate-500 cursor-not-allowed'
                                                                    : 'bg-blue-600 hover:bg-blue-700 border-blue-800 active:border-b-0 active:translate-y-1'
                                                                }`}
                                                        >
                                                            {candidate && 'बटन दाबा'}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
            </div>


            {/* Bottom Section - Vote Count & Contact */}
            <div className="mx-2 sm:mx-3 mb-4">
                <div className="bg-[#1a237e] text-white rounded-xl shadow-2xl overflow-hidden">
                    {/* Top Row - Vote Count (HIDDEN BY DEFAULT, only shows if admin enabled) */}
                    {showVoteCount && (
                        <div className="flex justify-between items-center px-3 sm:px-6 py-3 border-b border-white/20">
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-slate-200 uppercase tracking-wide">थेट मतदान</span>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <span className="text-xs font-medium text-slate-300 uppercase">एकूण मते:</span>
                                <div className="bg-[#283593] px-3 py-1.5 rounded border border-[#3949ab] shadow-inner">
                                    <span className="text-lg font-bold font-mono tracking-widest text-white">
                                        {totalVotes.toString().padStart(3, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Bottom Row - Contact (Shows only if number is set) */}
                    {/* Priority: 1. Page-specific WhatsApp number (if 10 digits), 2. Default settings WhatsApp number */}
                    {(() => {
                        // Get page-specific number if valid (10 digits)
                        const pageWhatsapp = candidatePage?.contactWhatsapp?.length === 10 ? candidatePage.contactWhatsapp : '';
                        // Get default settings number
                        const defaultWhatsapp = appState.settings?.contactWhatsapp || '';
                        // Use page-specific if available, else default
                        const whatsappNumber = pageWhatsapp || defaultWhatsapp;
                        
                        if (!whatsappNumber) return null;
                        
                        return (
                            <div className="flex items-center justify-center gap-2 sm:gap-3 px-3 py-3">
                                <span className="text-white font-semibold text-xs sm:text-sm">Demo EVM हवे आहे?</span>
                                <a
                                    href={`https://wa.me/91${whatsappNumber}?text=${encodeURIComponent('नमस्कार, मला डेमो EVM app बनवून हवे आहे.')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-full font-bold transition-all shadow-md hover:shadow-lg text-xs sm:text-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                                    </svg>
                                    <span>संपर्क करा</span>
                                </a>
                            </div>
                        );
                    })()}
                </div>
            </div>


            {/* Vote Modal - Shows all voted candidates */}
            {showVoteModal && votedCandidates.length > 0 && (
                <VoteConfirmationModal
                    candidates={votedCandidates}
                    electionName={candidatePage?.electionInfo?.name || appState.electionInfo?.name || 'निवडणूक'}
                    onClose={() => setShowVoteModal(false)}
                    currentSlug={slug}
                />
            )}

        </div>
    );
};

export default VoterView;
