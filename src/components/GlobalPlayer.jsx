import React from 'react';

const GlobalPlayer = () => {
  return (
    <div className="global-player fade-in">
      <div className="player-left flex items-center gap-4">
        <div className="player-thumb">
          <img src="https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100" alt="Track" />
        </div>
        <div className="player-track-info">
          <h4 className="m-0 text-sm">Abiding Light</h4>
          <p className="m-0 text-xs text-outline italic" style={{fontFamily: "'Playfair Display', serif"}}>Selah Grace</p>
        </div>
        <button className="icon-btn text-primary"><span className="material-symbols-outlined">favorite_border</span></button>
      </div>

      <div className="player-center flex-col flex-1 max-w-lg mx-auto">
        <div className="flex justify-center items-center gap-6 mb-2">
          <button className="icon-btn muted"><span className="material-symbols-outlined">shuffle</span></button>
          <button className="icon-btn"><span className="material-symbols-outlined">skip_previous</span></button>
          <button className="play-fab small" style={{backgroundColor: 'var(--color-primary)', color: 'white'}}>
            <span className="material-symbols-outlined fill-icon">play_arrow</span>
          </button>
          <button className="icon-btn"><span className="material-symbols-outlined">skip_next</span></button>
          <button className="icon-btn muted"><span className="material-symbols-outlined">repeat</span></button>
        </div>
        <div className="flex items-center gap-4 w-full">
          <span className="text-xs text-outline">1:45</span>
          <div className="scrubber-bar flex-1">
            <div className="scrubber-fill" style={{width: '35%'}}></div>
            <div className="scrubber-thumb" style={{left: '35%'}}></div>
          </div>
          <span className="text-xs text-outline">4:12</span>
        </div>
      </div>

      <div className="player-right flex items-center justify-end gap-4">
        <button className="icon-btn muted"><span className="material-symbols-outlined">lyrics</span></button>
        <button className="icon-btn muted"><span className="material-symbols-outlined">queue_music</span></button>
        <div className="flex items-center gap-2 volume-control">
          <span className="material-symbols-outlined muted text-sm">volume_up</span>
          <div className="scrubber-bar" style={{width: '80px'}}>
            <div className="scrubber-fill" style={{width: '70%'}}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalPlayer;
