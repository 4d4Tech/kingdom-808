import React from 'react';
import WaveformWitness from '../components/WaveformWitness';

const FullScreenPlayer = ({ setCurrentView }) => {
  return (
    <div className="fullscreen-player-desktop fade-in">
      
      <header className="fsp-header">
        <button className="icon-btn" onClick={() => setCurrentView('playlist')}>
          <span className="material-symbols-outlined" style={{fontSize: '32px'}}>close</span>
        </button>
        <div className="logo text-center" style={{fontSize: '28px'}}>
          TRINITY<span style={{fontFamily: "'Geist', sans-serif", fontWeight: '300', fontStyle: 'normal'}}>Sound</span>
        </div>
        <div className="flex gap-4">
          <button className="icon-btn"><span className="material-symbols-outlined">share</span></button>
          <button className="icon-btn"><span className="material-symbols-outlined">favorite_border</span></button>
        </div>
      </header>

      <div className="fsp-layout">
        
        {/* Left Side: Cover & Controls */}
        <div className="fsp-left">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200" alt="Oceans of Grace" className="fsp-cover" />
          
          <h1 className="font-headline" style={{fontSize: '48px', marginBottom: '8px'}}>Oceans of Grace</h1>
          <p className="text-primary italic m-0" style={{fontFamily: "'Playfair Display', serif", fontSize: '28px'}}>Trinity Collective ft. Sarah Grace</p>

          <div className="mt-xl mb-xl">
            <WaveformWitness waveformData={Array.from({length: 40}, () => Math.random() * 0.8 + 0.2)} className="w-full" />
            <div className="flex justify-between text-xs font-bold text-outline uppercase tracking-wider mt-2">
              <span>2:45</span>
              <span>5:12</span>
            </div>
          </div>

          <div className="flex justify-between items-center px-4">
            <button className="btn btn-pill" style={{backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)'}}>
              <span className="material-symbols-outlined text-sm mr-2" style={{verticalAlign: 'middle'}}>volunteer_activism</span>
              SUPPORT THIS ARTIST
            </button>
            
            <div className="flex items-center gap-6">
              <button className="icon-btn muted"><span className="material-symbols-outlined">shuffle</span></button>
              <button className="icon-btn"><span className="material-symbols-outlined">skip_previous</span></button>
              <button className="play-fab" style={{backgroundColor: 'var(--color-primary)', color: 'white'}}>
                <span className="material-symbols-outlined fill-icon">pause</span>
              </button>
              <button className="icon-btn"><span className="material-symbols-outlined">skip_next</span></button>
              <button className="icon-btn muted"><span className="material-symbols-outlined">repeat</span></button>
            </div>
          </div>
        </div>

        {/* Right Side: Lyrics Content */}
        <div className="fsp-right">
          <div className="fsp-tabs">
            <button className="fsp-tab active">LYRICS</button>
            <button className="fsp-tab">SCRIPTURE</button>
            <button className="fsp-tab">TESTIMONY</button>
          </div>

          <div className="huge-lyrics">
            <p>In the depth of every valley</p>
            <p>Through the fire and through the flood</p>
            <p className="active">I will trust the hand that guides me</p>
            <p>Resting in Your perfect love</p>
            <p style={{opacity: 0.3, marginTop: '48px'}}>Oceans rise and thunders roar</p>
            <p style={{opacity: 0.3}}>I will rest in You alone</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default FullScreenPlayer;
