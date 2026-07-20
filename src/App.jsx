import React, { useState, useEffect } from 'react';
import { AudioProvider } from './context/AudioProvider';
import Sidebar from './components/Sidebar';
import GlobalPlayer from './components/GlobalPlayer';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth } from './firebase';

// Pages
import ArtistProfile from './pages/ArtistProfile';
import PlaylistDetail from './pages/PlaylistDetail';
import Discover from './pages/Discover';
import Wrapped from './pages/Wrapped';
import FullScreenPlayer from './pages/FullScreenPlayer';
import Dashboard from './pages/Dashboard';

function App() {
  const [currentView, setCurrentView] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') || 'artist';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);

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

  const renderView = () => {
    switch (currentView) {
      case 'artist': return <ArtistProfile />;
      case 'playlist': return <PlaylistDetail />;
      case 'discover': return <Discover />;
      case 'wrapped': return <Wrapped />;
      case 'player': return <FullScreenPlayer setCurrentView={setCurrentView} />;
      case 'dashboard': return <Dashboard />;
      default: return <ArtistProfile />;
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
      <div className="app-layout">
        
        {/* Persistent Sidebar */}
        <Sidebar 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          isMobileMenuOpen={isMobileMenuOpen} 
        />

        {/* Main Content Area */}
        <div className={`main-view ${isFullScreenPlayer ? 'fullscreen-mode' : ''}`}>
          
          {/* Top Header (Visible except on fullscreen) */}
          {!isFullScreenPlayer && (
            <header className="top-header">
              <div className="flex items-center gap-4">
                <button 
                  className="icon-btn mobile-only" 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  <span className="material-symbols-outlined">menu</span>
                </button>
                <div className="search-box">
                  <span className="material-symbols-outlined">search</span>
                  <input type="text" placeholder="Search divinity music..." />
                </div>
              </div>

              <div className="flex gap-4 items-center right-actions">
                <button className="icon-btn"><span className="material-symbols-outlined">notifications</span></button>
                <button className="icon-btn"><span className="material-symbols-outlined">favorite_border</span></button>
                <div className="avatar">
                  <img src="https://i.pravatar.cc/100?img=11" alt="Profile" />
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

      </div>
    </AudioProvider>
  );
}

export default App;
