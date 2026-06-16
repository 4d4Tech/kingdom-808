import React from 'react';

const Sidebar = ({ currentView, setCurrentView, isMobileMenuOpen }) => {
  const navItems = [
    { id: 'artist', icon: 'home', label: 'Home' }, // Based on screen1, "Home" is selected? Wait, mock says Profile. We'll map accordingly.
    { id: 'discover', icon: 'explore', label: 'Discovery' },
    { id: 'playlist', icon: 'library_music', label: 'Library' },
    { id: 'wrapped', icon: 'podcasts', label: 'Live' },
    { id: 'player', icon: 'person', label: 'Profile' }
  ];

  return (
    <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        TRINITY<span>Sound</span>
        <div className="text-xs text-outline font-normal" style={{fontFamily: 'Geist, sans-serif', letterSpacing: '1px'}}>DIVINE HARMONY</div>
      </div>
      
      <nav className="sidebar-nav">
        <button className={`sidebar-item ${currentView === 'artist' ? 'active' : ''}`} onClick={() => setCurrentView('artist')}>
          <span className={`material-symbols-outlined ${currentView === 'artist' ? 'fill-icon' : ''}`}>person</span>
          Artist Profile
        </button>
        <button className={`sidebar-item ${currentView === 'discover' ? 'active' : ''}`} onClick={() => setCurrentView('discover')}>
          <span className={`material-symbols-outlined ${currentView === 'discover' ? 'fill-icon' : ''}`}>explore</span>
          Discovery
        </button>
        <button className={`sidebar-item ${currentView === 'playlist' ? 'active' : ''}`} onClick={() => setCurrentView('playlist')}>
          <span className={`material-symbols-outlined ${currentView === 'playlist' ? 'fill-icon' : ''}`}>library_music</span>
          Library
        </button>
        <button className={`sidebar-item ${currentView === 'wrapped' ? 'active' : ''}`} onClick={() => setCurrentView('wrapped')}>
          <span className={`material-symbols-outlined ${currentView === 'wrapped' ? 'fill-icon' : ''}`}>podcasts</span>
          Live
        </button>
        <button className={`sidebar-item ${currentView === 'player' ? 'active' : ''}`} onClick={() => setCurrentView('player')}>
          <span className={`material-symbols-outlined ${currentView === 'player' ? 'fill-icon' : ''}`}>play_circle</span>
          Immersive Player
        </button>
      </nav>

      <div className="sidebar-playlists mt-xl">
        <p className="text-xs text-outline font-bold tracking-wider mb-4 px-4 uppercase">My Playlists</p>
        <div className="playlist-link">Evening Peace</div>
        <div className="playlist-link active text-primary">Morning Worship</div>
        <div className="playlist-link">Sunday Classics</div>
      </div>

      <div className="sidebar-footer">
        <button className="btn w-full mb-4" style={{backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)'}}>
          Upgrade to Premium
        </button>
        <button className="sidebar-item">
          <span className="material-symbols-outlined">settings</span>
          Settings
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
