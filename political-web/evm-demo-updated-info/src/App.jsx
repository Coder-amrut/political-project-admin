import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ref, onValue, set, update } from 'firebase/database';
import { db } from './firebase';
import VoterView from './components/VoterView';
import AdminPanel from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import LandingPage from './components/LandingPage';
import { FastLoader } from './utils/indexManager';

const AdminRoute = ({ isAdmin, onLogin, children }) => {
  if (!isAdmin) {
    return <AdminLogin onLogin={onLogin} onClose={() => window.location.href = '/'} />;
  }
  return children;
};

function AppContent() {
  const [isAdmin, setIsAdmin] = useState(() => {
    // Check sessionStorage on initial load
    return sessionStorage.getItem('isAdmin') === 'true';
  });
  const [loading, setLoading] = useState(true);

  const defaultState = {
    hasVoted: false,
    adminPassword: 'Admin9370',
    globalVoteCount: 0, // Total votes across all candidates
    electionInfo: {
      name: 'नगर परिषद निवडणूक २०२५ (Nagar Parishad Elections 2025)',
      message: 'राष्ट्रवादी काँग्रेस पक्ष – अजित पवार गट या पार्टी च्या घड्याळ चिन्हासमोरील क्रमांक.२ बटन दाबून "वंदना चंद्रकांत परब" यांना प्रचंड मतांनी विजयी करा , ही नम्र विनंती..!',
      dateTime: 'मतदान दिनांक : १ डिसेंबर, २०२५ रोजी ७:०० AM पासून सुरू',
      whatsappNumber: '919876543210'
    },
    candidatePages: [], // Each candidate has their own 'votes' field
    settings: {
      enableSound: true,
      enableVibration: true,
      allowMultipleVotes: false,
      contactWhatsapp: '',
      contactCall: ''
    }
  };

  const [appState, setAppState] = useState(defaultState);

  useEffect(() => {
    // Try to load from localStorage first for instant loading (with freshness check)
    const cachedData = localStorage.getItem('electionData');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        // Check if cache is not too old (5 minutes)
        const cacheAge = Date.now() - (parsed._cacheTime || 0);
        if (cacheAge < 5 * 60 * 1000) {
          // Use cache for initial display only
          setAppState(prev => ({
            ...prev,
            electionInfo: parsed.electionInfo || prev.electionInfo,
            settings: parsed.settings || prev.settings,
            candidatePages: parsed.candidatePages || prev.candidatePages,
            hasVoted: prev.hasVoted
          }));
          setLoading(false);
          console.log('📦 Loaded fresh cached data for instant display');
        } else {
          console.log('🕒 Cache expired, will load fresh data');
          localStorage.removeItem('electionData');
        }
      } catch (error) {
        console.warn('Failed to parse cached data:', error);
        localStorage.removeItem('electionData'); // Clear corrupted cache
      }
    }

    const electionRef = ref(db, 'electionData');
    let isFirstLoad = true;

    const unsubscribe = onValue(electionRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Smart caching - cache metadata only, preserve full data in state
        try {
          const metadataOnly = {
            electionInfo: data.electionInfo,
            candidatePages: data.candidatePages ? Object.values(data.candidatePages).map(page => ({
              id: page.id || '',
              slug: page.slug || '',
              serialNumber: page.serialNumber || 1,
              candidateName: page.candidateName || '',
              partyName: page.partyName || '',
              // Only cache small images (thumbnails/placeholders)
              candidatePhoto: page.candidatePhoto?.startsWith('data:') && page.candidatePhoto.length > 5000 ? null : (page.candidatePhoto || 'https://via.placeholder.com/150?text=Photo'),
              partySymbol: page.partySymbol?.startsWith('data:') && page.partySymbol.length > 5000 ? null : (page.partySymbol || 'https://via.placeholder.com/150?text=Symbol'),
              electionInfo: {
                name: page.electionInfo?.name || '',
                message: page.electionInfo?.message || '',
                dateTime: page.electionInfo?.dateTime || '',
                position: page.electionInfo?.position || '',
                // Skip large audio files
                audio: page.electionInfo?.audio?.startsWith('data:') && page.electionInfo.audio.length > 10000 ? null : (page.electionInfo?.audio || null)
              },
              highlighted: page.highlighted || false,
              showVoteCount: page.showVoteCount !== undefined ? page.showVoteCount : true,
              contactWhatsapp: page.contactWhatsapp || '', // Page-specific WhatsApp
              votes: page.votes || 0,
              baseVotes: page.baseVotes || 0,
              pageGroupId: page.pageGroupId || null,
              sectionColor: page.sectionColor || '#e91e63',
              maxCandidates: page.maxCandidates || 16
            })) : [],
            settings: data.settings,
            _cacheTime: Date.now()
          };

          const cacheString = JSON.stringify(metadataOnly);
          // Only cache if under 1MB to be safe
          if (cacheString.length < 1024 * 1024) {
            localStorage.setItem('electionData', cacheString);
            console.log('📦 Cached metadata for fast loading');
          } else {
            console.warn('Metadata too large for cache, skipping');
            localStorage.removeItem('electionData');
          }
        } catch (error) {
          console.warn('Failed to cache metadata:', error);
        }

        // Only update state if data is different
        setAppState(prev => {
          // CRITICAL: Preserve votes - merge Firebase votes with existing, always keep higher
          const existingVotesMap = {};
          (prev.candidatePages || []).forEach(p => {
            if (p.id) existingVotesMap[p.id] = p.votes || 0;
          });

          // Clean the data to ensure no undefined values
          const cleanData = {
            ...data,
            candidatePages: data.candidatePages ? Object.values(data.candidatePages).map(page => {
              const existingVotes = existingVotesMap[page.id] || 0;
              const firebaseVotes = page.votes || 0;
              // Always keep the higher vote count (prevents accidental reset)
              const preservedVotes = Math.max(existingVotes, firebaseVotes);
              
              return {
                id: page.id || '',
                slug: page.slug || '',
                serialNumber: page.serialNumber || 1,
                candidateName: page.candidateName || '',
                partyName: page.partyName || '',
                candidatePhoto: page.candidatePhoto || 'https://via.placeholder.com/150?text=Photo',
                partySymbol: page.partySymbol || 'https://via.placeholder.com/150?text=Symbol',
                electionInfo: {
                  name: page.electionInfo?.name || '',
                  message: page.electionInfo?.message || '',
                  dateTime: page.electionInfo?.dateTime || '',
                  position: page.electionInfo?.position || '',
                  audio: page.electionInfo?.audio || null
                },
                highlighted: page.highlighted || false,
                showVoteCount: page.showVoteCount !== undefined ? page.showVoteCount : true,
                contactWhatsapp: page.contactWhatsapp || '', // Page-specific WhatsApp
                votes: preservedVotes, // PRESERVED VOTES
                baseVotes: page.baseVotes || 0,
                createdAt: page.createdAt || new Date().toISOString(),
                updatedAt: page.updatedAt || new Date().toISOString(),
                link: page.link || '',
                pageGroupId: page.pageGroupId || null,
                sectionColor: page.sectionColor || '#e91e63',
                maxCandidates: page.maxCandidates || 16
              };
            }) : [],
            electionInfo: {
              name: data.electionInfo?.name || '',
              message: data.electionInfo?.message || '',
              dateTime: data.electionInfo?.dateTime || '',
              position: data.electionInfo?.position || '',
              audio: data.electionInfo?.audio || null,
              whatsappNumber: data.electionInfo?.whatsappNumber || ''
            },
            settings: {
              enableSound: data.settings?.enableSound !== false,
              enableVibration: data.settings?.enableVibration !== false,
              allowMultipleVotes: data.settings?.allowMultipleVotes || false,
              contactWhatsapp: data.settings?.contactWhatsapp || '',
              contactCall: data.settings?.contactCall || ''
            },
            adminPassword: data.adminPassword || 'Admin9370',
            // Preserve global vote count
            globalVoteCount: Math.max(data.globalVoteCount || 0, prev.globalVoteCount || 0)
          };

          const newData = {
            ...prev,
            ...cleanData,
            hasVoted: prev.hasVoted
          };

          // Check if data actually changed (skip deep comparison on first load for performance)
          if (!isFirstLoad && JSON.stringify(prev.candidatePages?.map(p => p.id)) === JSON.stringify(newData.candidatePages?.map(p => p.id))) {
            // If only the same candidates exist, merge to preserve any cached data
            const mergedCandidates = newData.candidatePages?.map(newPage => {
              const prevPage = prev.candidatePages?.find(p => p.id === newPage.id);
              return prevPage ? {
                ...newPage,
                // Preserve any existing images that might be from cache
                candidatePhoto: newPage.candidatePhoto || prevPage.candidatePhoto,
                partySymbol: newPage.partySymbol || prevPage.partySymbol
              } : newPage;
            });

            return {
              ...newData,
              candidatePages: mergedCandidates
            };
          }

          isFirstLoad = false;

          // Preload candidates for fast access
          if (newData.candidatePages && newData.candidatePages.length > 0) {
            setTimeout(() => {
              FastLoader.preloadAllCandidates().catch(console.warn);
            }, 100);
          }

          return newData;
        });
      } else {
        set(electionRef, {
          adminPassword: defaultState.adminPassword,
          globalVoteCount: 0,
          electionInfo: defaultState.electionInfo,
          candidatePages: defaultState.candidatePages || [],
          settings: defaultState.settings
        });
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateFirebase = (newState) => {
    const { hasVoted, _intentionalReset, ...firebaseData } = newState;

    // Check if this is an intentional reset from admin
    const isIntentionalReset = _intentionalReset === true;

    // CRITICAL: Preserve candidate votes - never decrease unless intentional reset
    if (firebaseData.candidatePages && !isIntentionalReset) {
      const existingVotesMap = {};
      (appState.candidatePages || []).forEach(p => {
        if (p.id) existingVotesMap[p.id] = p.votes || 0;
      });

      firebaseData.candidatePages = firebaseData.candidatePages.map(page => {
        const existingVotes = existingVotesMap[page.id] || 0;
        const newVotes = page.votes || 0;
        
        // Only allow vote increase, never decrease (unless intentional)
        if (newVotes < existingVotes) {
          console.warn(`⚠️ Prevented vote decrease for ${page.candidateName}: ${existingVotes} -> ${newVotes} (kept ${existingVotes})`);
          return { ...page, votes: existingVotes };
        }
        return page;
      });
    }

    // Preserve global vote count
    const existingGlobalCount = appState.globalVoteCount || 0;
    const newGlobalCount = firebaseData.globalVoteCount || 0;
    if (!isIntentionalReset) {
      firebaseData.globalVoteCount = Math.max(existingGlobalCount, newGlobalCount);
    }

    // Clean undefined values to prevent Firebase errors
    const cleanObject = (obj) => {
      if (obj === null || obj === undefined) return null;
      if (typeof obj !== 'object' || Array.isArray(obj)) return obj;

      const cleaned = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && key !== '_intentionalReset') {
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            const cleanedValue = cleanObject(value);
            if (cleanedValue !== null) {
              cleaned[key] = cleanedValue;
            }
          } else {
            cleaned[key] = value;
          }
        }
      }
      return cleaned;
    };

    const cleanedData = cleanObject(firebaseData);

    // Debug: Log votes being saved
    console.log('💾 Saving to Firebase:', {
      globalVoteCount: cleanedData.globalVoteCount,
      candidateVotes: cleanedData.candidatePages?.map(p => ({ name: p.candidateName, votes: p.votes }))
    });

    update(ref(db, 'electionData'), cleanedData)
      .then(() => console.log('✅ Data saved to Firebase'))
      .catch((error) => console.error('❌ Firebase error:', error));
  };

  const handleStateUpdate = (updater) => {
    setAppState(prev => {
      const newState = typeof updater === 'function' ? updater(prev) : updater;

      // Only update Firebase if data actually changed
      const candidatePagesChanged = JSON.stringify(prev.candidatePages) !== JSON.stringify(newState.candidatePages);
      const settingsChanged = JSON.stringify(prev.settings) !== JSON.stringify(newState.settings);
      const electionInfoChanged = JSON.stringify(prev.electionInfo) !== JSON.stringify(newState.electionInfo);
      const passwordChanged = prev.adminPassword !== newState.adminPassword;
      const globalVoteCountChanged = prev.globalVoteCount !== newState.globalVoteCount;

      if (candidatePagesChanged || settingsChanged || electionInfoChanged || passwordChanged || globalVoteCountChanged) {
        // Use setTimeout to batch updates and prevent rapid successive calls
        setTimeout(() => {
          updateFirebase(newState);
        }, 100);
      }

      return newState;
    });
  };

  const handleAdminLogin = (password) => {
    console.log('🔐 Login attempt:', { entered: password, expected: appState.adminPassword });
    if (password === appState.adminPassword) {
      setIsAdmin(true);
      sessionStorage.setItem('isAdmin', 'true');
      console.log('✅ Admin login successful');
      return true;
    }
    console.log('❌ Admin login failed');
    return false;
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('isAdmin');
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-poppins">
      <Routes>
        <Route path="/" exact element={<LandingPage appState={appState} />} />
        <Route
          path="/admin"
          element={
            <AdminRoute isAdmin={isAdmin} onLogin={handleAdminLogin}>
              <AdminPanel
                appState={appState}
                setAppState={handleStateUpdate}
                onLogout={handleAdminLogout}
              />
            </AdminRoute>
          }
        />
        <Route
          path="/:slug"
          element={
            <VoterView
              appState={appState}
              setAppState={handleStateUpdate}
            />
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
