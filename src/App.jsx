import React, { useState, useEffect } from 'react';
import { AudioProvider } from './context/AudioProvider';
import Sidebar from './components/Sidebar';
import GlobalPlayer from './components/GlobalPlayer';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import NotificationCenter from './components/NotificationCenter';

// Pages
import ArtistProfile from './pages/ArtistProfile';
import PlaylistDetail from './pages/PlaylistDetail';
import Discover from './pages/Discover';
import Wrapped from './pages/Wrapped';
import FullScreenPlayer from './pages/FullScreenPlayer';
import Dashboard from './pages/Dashboard';

// Components
import AuthModal from './components/AuthModal';
import ProfileSettingsModal from './components/ProfileSettingsModal';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'discover'; // Default landing view for listeners (Apple Music / Spotify style)
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authError, setAuthError] = useState(null);

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalPrompt, setAuthModalPrompt] = useState('');
  const [isProfileSettingsOpen, setIsProfileSettingsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('local_user_profile');
    setUserProfile({
      displayName: 'Guest',
      tagline: 'Guest Listener',
      avatarUrl: 'https://i.pravatar.cc/100?img=9',
      isArtist: false,
      isAnonymous: true
    });
    auth.signOut().then(() => {
      setCurrentView('discover');
      setShowProfileMenu(false);
    });
  };

  // Handle Real-time User Profile sync
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoadingAuth(false);
      } else {
        signInAnonymously(auth)
          .then((cred) => {
            setUser(cred.user);
            setLoadingAuth(false);
          })
          .catch((err) => {
            console.error("Anonymous auth failed:", err);
            setAuthError(err.message);
            setLoadingAuth(false);
          });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserProfile({
        displayName: 'Guest',
        tagline: 'Guest Listener',
        avatarUrl: 'https://i.pravatar.cc/100?img=9',
        isArtist: false,
        isAnonymous: true
      });
      return;
    }

    const isBrandon = Boolean(user.email && user.email.toLowerCase() === 'brandonrobinson81@gmail.com');

    if (user.isAnonymous && !isBrandon) {
      setUserProfile({ 
        displayName: 'Guest', 
        tagline: 'Guest Listener',
        bio: 'Welcome to TrinitySound. Listen to worship tracks and ethereal melodies.',
        avatarUrl: 'https://i.pravatar.cc/100?img=9',
        isArtist: false,
        isAnonymous: true 
      });
      return;
    }

    // Registered profile subscription (Listener or Artist)
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribeProfile = onSnapshot(userDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const isArtistRole = isBrandon || data.role === 'artist' || data.isArtist === true;
        setUserProfile({ 
          ...data, 
          email: user.email || data.email,
          isArtist: isArtistRole, 
          isAnonymous: false 
        });
      } else {
        setUserProfile(parsedLocal || { 
          displayName: user.displayName || (isBrandon ? 'Brandon Robinson' : user.email) || 'User', 
          email: user.email,
          tagline: isBrandon ? 'Modern Worship & Ethereal Melodies' : 'Music Enthusiast & Worship Listener',
          avatarUrl: 'https://i.pravatar.cc/300?img=11',
          isArtist: isBrandon,
          role: isBrandon ? 'artist' : 'listener',
          isAnonymous: false 
        });
      }
    });

    return () => unsubscribeProfile();
  }, [user]);

  // Router Gating
  const handleNavigate = (view) => {
    const isBrandon = Boolean(user?.email && user.email.toLowerCase() === 'brandonrobinson81@gmail.com');
    const isArtist = (user && !user.isAnonymous) || isBrandon || userProfile?.isArtist;
    if ((view === 'dashboard' || view === 'artist') && !isArtist) {
      setAuthModalPrompt("Sign in as an Artist to access Creator Studio & manage your music catalog");
      setIsAuthModalOpen(true);
    } else {
      setCurrentView(view);
    }
  };

  const handleRequireListenerAuth = (msg) => {
    setAuthModalPrompt(msg || "Sign in to your Listener Account to save favorites, build custom playlists, and follow artists");
    setIsAuthModalOpen(true);
  };

  const renderView = () => {
    switch (currentView) {
      case 'discover': return <Discover />;
      case 'playlist': return <PlaylistDetail user={user} onRequireAuth={handleRequireListenerAuth} />;
      case 'wrapped': return <Wrapped />;
      case 'player': return <FullScreenPlayer setCurrentView={handleNavigate} />;
      case 'artist': return <ArtistProfile userProfile={userProfile} onOpenSettings={() => setIsProfileSettingsOpen(true)} />;
      case 'dashboard': return <Dashboard userProfile={userProfile} />;
      default: return <Discover />;
    }
  };

  const isFullScreenPlayer = currentView === 'player';

  if (authError) {
    return (
      <div className="auth-loading-screen flex-col" style={{ padding: '24px', textAlign: 'center' }}>
        <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ff5449', marginBottom: '16px' }}>warning</span>
        <h2 style={{ marginBottom: '8px' }}>Firebase Authentication Required</h2>
        <p className="text-outline text-sm" style={{ maxWidth: '440px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
          TrinitySound requires <strong>Anonymous Authentication</strong> to be enabled in your Firebase project configuration to read and write track libraries securely.
        </p>
        <div style={{
          background: 'rgba(255, 84, 73, 0.05)',
          border: '1px solid rgba(255, 84, 73, 0.2)',
          borderRadius: '12px',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: '#ff5449',
          maxWidth: '440px',
          margin: '0 auto 24px auto',
          textAlign: 'left',
          wordBreak: 'break-all'
        }}>
          Error: {authError}
        </div>
        <div style={{ textAlign: 'left', fontSize: '13px', color: 'var(--color-outline)', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: '1.8' }}>
          <strong>To resolve this:</strong>
          <ol style={{ paddingLeft: '20px', margin: '8px 0 0 0' }}>
            <li>Go to the <strong>Firebase Console</strong> for project <code>kingdom-808</code>.</li>
            <li>Navigate to <strong>Build</strong> &gt; <strong>Authentication</strong> &gt; <strong>Sign-in method</strong>.</li>
            <li>Under <strong>Native providers</strong>, click <strong>Anonymous</strong>.</li>
            <li>Toggle <strong>Enable</strong> to active and click <strong>Save</strong>.</li>
          </ol>
        </div>
        <button 
          className="btn btn-pill btn-primary" 
          onClick={() => window.location.reload()}
          style={{ padding: '12px 32px' }}
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (loadingAuth) {
    return (
      <div className="auth-loading-screen">
        <div className="auth-spinner"></div>
        <p className="auth-loading-text">CONNECTING TO SANCTUARY...</p>
      </div>
    );
  }

  return (
    <AudioProvider>
      <div className="app-layout" onClick={() => setShowProfileMenu(false)}>
        
        {/* Persistent Sidebar */}
        <Sidebar 
          currentView={currentView} 
          setCurrentView={handleNavigate} 
          isMobileMenuOpen={isMobileMenuOpen} 
          onOpenSettings={() => setIsProfileSettingsOpen(true)}
          user={user}
          userProfile={userProfile}
          onOpenArtistAuth={() => {
            setAuthModalPrompt("Sign in or register as an Artist to upload tracks and manage your catalog");
            setIsAuthModalOpen(true);
          }}
          onOpenListenerAuth={() => {
            setAuthModalPrompt("Sign in to your Listener Account to save favorites, build playlists, and follow artists");
            setIsAuthModalOpen(true);
          }}
        />

        {/* Main Content Area */}
        <div className={`main-view ${isFullScreenPlayer ? 'fullscreen-mode' : ''}`}>
          
          {/* Top Header (Visible except on fullscreen) */}
          {!isFullScreenPlayer && (
            <header className="top-header">
              <div className="flex items-center gap-3">
                <button 
                  className="icon-btn mobile-only" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(!isMobileMenuOpen);
                  }}
                  aria-label="Open Navigation Menu"
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="search-box">
                  <span className="material-symbols-outlined">search</span>
                  <input type="text" placeholder="Search divinity music..." />
                </div>
              </div>

              <div className="flex gap-3 items-center right-actions" onClick={(e) => e.stopPropagation()}>
                {/* Prominent Listener Sign In / Sign Up Button visible on Mobile & Desktop */}
                {user?.isAnonymous && (
                  <button 
                    type="button"
                    className="btn btn-pill btn-primary btn-xs font-bold flex items-center gap-1"
                    onClick={() => {
                      setAuthModalPrompt("Sign in to your Listener Account to save favorites, build playlists, and follow artists");
                      setIsAuthModalOpen(true);
                    }}
                    style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>login</span>
                    Sign In / Sign Up
                  </button>
                )}

                <NotificationCenter user={user} />
                <button className="icon-btn hidden-mobile"><span className="material-symbols-outlined">favorite_border</span></button>
                
                <div className="profile-chip-container" style={{ position: 'relative' }}>
                  <div className="profile-chip" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                    <span className="profile-name text-xs font-bold mr-2 hidden-mobile">
                      {userProfile?.displayName || (user?.isAnonymous ? "Guest" : "Artist")}
                    </span>
                    <div className="avatar small-avatar">
                      <img src={userProfile?.avatarUrl || (user?.isAnonymous ? "https://i.pravatar.cc/100?img=9" : "https://i.pravatar.cc/100?img=11")} alt="Profile" />
                    </div>
                  </div>

                  {showProfileMenu && (
                    <div className="profile-dropdown-menu card" style={{
                      position: 'absolute',
                      top: '100%',
                      right: '0',
                      marginTop: '8px',
                      width: '220px',
                      zIndex: '999',
                      padding: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      backgroundColor: 'var(--color-surface-container-lowest)',
                      border: '1px solid var(--color-surface-container-high)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
                    }}>
                      <div className="dropdown-user-info border-b pb-2 mb-1" style={{ borderBottom: '1px solid var(--color-surface-container)' }}>
                        <p className="font-bold text-sm m-0 truncate" style={{ color: 'var(--color-on-surface)' }}>
                          {userProfile?.displayName || "Guest Listener"}
                        </p>
                        <p className="text-xs text-outline m-0 truncate" style={{ color: 'var(--color-outline)' }}>
                          {user?.isAnonymous ? "Guest Account" : user?.email}
                        </p>
                      </div>

                      <button 
                        type="button"
                        className="btn btn-pill btn-xs outline w-full text-center flex items-center justify-center gap-2"
                        onClick={() => {
                          setIsProfileSettingsOpen(true);
                          setShowProfileMenu(false);
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>edit</span>
                        Edit Profile
                      </button>
                      
                      {user?.isAnonymous ? (
                        <button 
                          type="button"
                          className="btn btn-pill btn-xs btn-primary w-full text-center mt-1"
                          onClick={() => {
                            setAuthModalPrompt("Sign in to your account");
                            setIsAuthModalOpen(true);
                            setShowProfileMenu(false);
                          }}
                        >
                          Sign In / Sign Up
                        </button>
                      ) : (
                        <button 
                          type="button"
                          className="btn btn-pill btn-xs outline w-full text-center mt-1"
                          onClick={handleSignOut}
                        >
                          Sign Out
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            </header>
          )}

          {/* Page Content */}
          <main className="page-content">
            {renderView()}
          </main>

        </div>

        {/* Persistent Player */}
        {!isFullScreenPlayer && <GlobalPlayer />}

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        {/* User Auth Modal Dialog */}
        <AuthModal 
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          promptMessage={authModalPrompt}
        />

        {/* Profile Settings Modal */}
        <ProfileSettingsModal 
          isOpen={isProfileSettingsOpen}
          onClose={() => setIsProfileSettingsOpen(false)}
          userProfile={userProfile}
          user={user}
          onSaveProfile={(updatedData) => {
            setUserProfile(prev => ({
              ...(prev || {}),
              ...updatedData
            }));
          }}
        />

      </div>
    </AudioProvider>
  );
}

export default App;
