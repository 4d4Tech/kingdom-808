import React, { useState } from 'react';
import { AudioProvider } from './context/AudioProvider';
import Sidebar from './components/Sidebar';
import GlobalPlayer from './components/GlobalPlayer';

// Pages
import ArtistProfile from './pages/ArtistProfile';
import PlaylistDetail from './pages/PlaylistDetail';
import Discover from './pages/Discover';
import Wrapped from './pages/Wrapped';
import FullScreenPlayer from './pages/FullScreenPlayer';

function App() {
  const [currentView, setCurrentView] = useState('artist');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'artist': return <ArtistProfile />;
      case 'playlist': return <PlaylistDetail />;
      case 'discover': return <Discover />;
      case 'wrapped': return <Wrapped />;
      case 'player': return <FullScreenPlayer />;
      default: return <ArtistProfile />;
    }
  };

  const isFullScreenPlayer = currentView === 'player';

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
