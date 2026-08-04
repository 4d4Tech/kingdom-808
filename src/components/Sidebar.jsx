import React from 'react';

const Sidebar = ({ currentView, setCurrentView, isMobileMenuOpen, onOpenSettings, user, userProfile, onOpenArtistAuth, onOpenListenerAuth }) => {
  // Explicit case-insensitive evaluation for registered artist check
  const userEmail = (user?.email || userProfile?.email || '').toLowerCase();
  const isRegisteredArtist = Boolean(
    (user && !user.isAnonymous) || 
    userEmail === 'brandonrobinson81@gmail.com' || 
    userProfile?.isArtist || 
    userProfile?.role === 'artist'
  );

  const isGuest = !user || user.isAnonymous;

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
      {/* Brand Logo */}
      <div className="sidebar-logo cursor-pointer" onClick={() => setCurrentView('discover')}>
        TRINITY<span>Sound</span>
        <div className="text-xs text-outline font-normal" style={{ fontFamily: 'Geist, sans-serif', letterSpacing: '1.5px' }}>
          DIVINE HARMONY
        </div>
      </div>

      {/* Prominent Listener Sign In / Sign Up Button for Guests */}
      {isGuest && (
        <div className="px-3 mb-4">
          <button 
            type="button" 
            className="btn btn-pill btn-primary btn-xs w-full text-center flex items-center justify-center gap-2"
            onClick={onOpenListenerAuth || onOpenArtistAuth}
            style={{ padding: '10px 16px', fontWeight: 'bold', fontSize: '12px' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>account_circle</span>
            Sign In / Sign Up
          </button>
        </div>
      )}
      
      {/* Primary Navigation (Apple Music / Spotify Parity) */}
      <nav className="sidebar-nav">
        <div className="px-4 mb-1 text-xs font-bold text-outline uppercase tracking-wider flex justify-between items-center">
          <span>Listen</span>
          {isGuest && (
            <span 
              className="text-primary text-xs font-bold cursor-pointer underline hover:opacity-80"
              onClick={onOpenListenerAuth || onOpenArtistAuth}
            >
              Sign In
            </span>
          )}
        </div>

        <button 
          className={`sidebar-item ${currentView === 'discover' ? 'active' : ''}`} 
          onClick={() => setCurrentView('discover')}
        >
          <span className={`material-symbols-outlined ${currentView === 'discover' ? 'fill-icon' : ''}`}>explore</span>
          Listen Now
        </button>

        <button 
          className={`sidebar-item ${currentView === 'playlist' ? 'active' : ''}`} 
          onClick={() => setCurrentView('playlist')}
        >
          <span className={`material-symbols-outlined ${currentView === 'playlist' ? 'fill-icon' : ''}`}>library_music</span>
          Library
        </button>

        <button 
          className={`sidebar-item ${currentView === 'wrapped' ? 'active' : ''}`} 
          onClick={() => setCurrentView('wrapped')}
        >
          <span className={`material-symbols-outlined ${currentView === 'wrapped' ? 'fill-icon' : ''}`}>podcasts</span>
          Radio & Live
        </button>

        <button 
          className={`sidebar-item ${currentView === 'player' ? 'active' : ''}`} 
          onClick={() => setCurrentView('player')}
        >
          <span className={`material-symbols-outlined ${currentView === 'player' ? 'fill-icon' : ''}`}>graphic_eq</span>
          Immersive Player
        </button>

        {/* Creator Studio Navigation Links — Directly in Nav for Registered Artists */}
        {isRegisteredArtist && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-surface-container-high)' }}>
            <div className="px-4 mb-2 text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>verified</span>
              Creator Studio
            </div>
            <button 
              className={`sidebar-item ${currentView === 'dashboard' ? 'active' : ''}`} 
              onClick={() => setCurrentView('dashboard')}
            >
              <span className={`material-symbols-outlined ${currentView === 'dashboard' ? 'fill-icon' : ''}`}>dashboard</span>
              Artist Dashboard
            </button>
            <button 
              className={`sidebar-item ${currentView === 'artist' ? 'active' : ''}`} 
              onClick={() => setCurrentView('artist')}
            >
              <span className={`material-symbols-outlined ${currentView === 'artist' ? 'fill-icon' : ''}`}>person</span>
              My Artist Profile
            </button>
          </div>
        )}
      </nav>

      {/* Playlists Section */}
      <div className="sidebar-playlists mt-4">
        <p className="text-xs text-outline font-bold tracking-wider mb-2 px-4 uppercase">My Playlists</p>
        <div className="playlist-link">Evening Peace</div>
        <div className="playlist-link active text-primary">Morning Worship</div>
        <div className="playlist-link">Sunday Classics</div>
      </div>

      {/* Artist Sign-In Portal CTA Card (Only for Listeners / Non-Artists) */}
      {!isRegisteredArtist && (
        <div className="sidebar-creator-section mt-4 px-3">
          <div 
            className="artist-portal-promo-card card p-4 border" 
            style={{ 
              borderRadius: '16px', 
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-surface-container-high)'
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>equalizer</span>
              <h4 className="m-0 text-xs font-bold uppercase tracking-wider">Are you an Artist?</h4>
            </div>
            <p className="text-xs text-outline m-0 mb-3" style={{ lineHeight: '1.4' }}>
              Upload your tracks, view stream analytics, and customize your catalog.
            </p>
            <button 
              type="button"
              className="btn btn-pill btn-xs btn-primary w-full text-center"
              onClick={onOpenArtistAuth}
            >
              Artist Sign In / Portal
            </button>
          </div>
        </div>
      )}

      {/* Footer Settings */}
      <div className="sidebar-footer mt-auto pt-4">
        <button 
          className="btn w-full mb-3 text-xs py-2 font-bold" 
          style={{ backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)' }}
        >
          Upgrade to Premium
        </button>
        <button className="sidebar-item" onClick={onOpenSettings}>
          <span className="material-symbols-outlined">settings</span>
          Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
