import React from 'react';

const BottomNav = ({ currentView, setCurrentView }) => {
  const navItems = [
    { id: 'wrapped', icon: 'home', label: 'Home' }, // Using wrapped for home to match screen 4 layout loosely, or separate
    { id: 'playlist', icon: 'library_music', label: 'Library' },
    { id: 'player', icon: 'celebration', label: 'Wrapped' }, // Custom mapping just to show all screens
    { id: 'discover', icon: 'search', label: 'Search' },
    { id: 'artist', icon: 'person', label: 'Profile' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button 
          key={item.id} 
          className={`bottom-nav-item ${currentView === item.id ? 'active' : ''}`}
          onClick={() => setCurrentView(item.id)}
        >
          <span className={`material-symbols-outlined ${currentView === item.id ? 'fill-icon' : ''}`}>
            {item.icon}
          </span>
          <span className="label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
