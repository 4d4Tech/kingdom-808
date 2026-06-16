import React from 'react';

const TopNav = () => {
  return (
    <header className="app-header">
      <div className="logo">
        TRINITY<span>Sound</span>
      </div>
      <div className="flex gap-4 items-center">
        <span className="material-symbols-outlined" style={{cursor: 'pointer'}}>search</span>
        <div style={{width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--color-outline-variant)', overflow: 'hidden'}}>
          <img src="https://i.pravatar.cc/100?img=11" alt="Profile" style={{width: '100%', height: '100%', objectFit: 'cover'}}/>
        </div>
      </div>
    </header>
  );
};

export default TopNav;
