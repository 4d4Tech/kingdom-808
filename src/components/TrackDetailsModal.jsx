import React from 'react';
import ReactDOM from 'react-dom';
import { useAudio } from '../context/AudioProvider';
import { useToast } from '../context/ToastContext';

const TrackDetailsModal = ({ track, isOpen, onClose }) => {
  const { isPlaying, currentTrack, togglePlay } = useAudio();
  const { showToast } = useToast();

  if (!isOpen || !track) return null;

  const isCurrentPlaying = currentTrack?.id === track.id && isPlaying;

  const handleShare = () => {
    const link = `${window.location.origin}/?view=artist&track=${track.permalink || track.id}`;
    navigator.clipboard.writeText(link).then(() => {
      showToast("Track share link copied to clipboard!", "success");
    });
  };

  const modalContent = (
    <div 
      className="modal-overlay fade-in" 
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: '24px 16px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="modal-container card grow-out" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          padding: '0',
          borderRadius: '32px',
          overflow: 'hidden',
          boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
          backgroundColor: 'var(--color-surface-container-lowest)',
          border: '1px solid var(--color-surface-container-high)',
          margin: 'auto',
          position: 'relative'
        }}
      >
        {/* Top Header Bar */}
        <div 
          className="flex justify-between items-center" 
          style={{ 
            padding: '24px 32px', 
            borderBottom: '1px solid var(--color-surface-container-high)',
            backgroundColor: 'var(--color-surface-container-low)'
          }}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>info</span>
            <div>
              <h3 className="m-0 font-headline text-xl">Track Information & Details</h3>
              <p className="text-xs text-outline m-0 mt-1">Full audio specifications, credits, collaborators, and lyrics.</p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div style={{ padding: '32px', maxHeight: '72vh', overflowY: 'auto' }}>
          
          {/* Main Track Banner Card */}
          <div 
            className="card p-6 mb-6 flex gap-6 items-center flex-wrap"
            style={{ 
              borderRadius: '24px', 
              backgroundColor: 'var(--color-surface-container)',
              border: '1px solid var(--color-surface-container-high)'
            }}
          >
            <img 
              src={track.img || track.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400"} 
              alt={track.title} 
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '16px',
                objectFit: 'cover',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                flexShrink: 0
              }}
            />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="badge outline text-xs" style={{ fontSize: '11px', padding: '3px 10px' }}>
                  {track.genre || track.album || 'Worship'}
                </span>
                {track.isPublic !== false && (
                  <span className="badge" style={{ backgroundColor: 'rgba(0, 93, 144, 0.1)', color: 'var(--color-primary)', fontSize: '11px', padding: '3px 10px' }}>
                    Public Release
                  </span>
                )}
              </div>

              <h2 className="m-0 font-headline text-2xl truncate">{track.title}</h2>
              <p className="text-sm font-semibold text-primary m-0 mt-1 italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                {track.artist || track.artistName || 'Brandon Robinson'}
              </p>

              {/* Collaborators List */}
              {Array.isArray(track.collaborators) && track.collaborators.length > 0 && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-outline uppercase tracking-wider">Collaborators:</span>
                  {track.collaborators.map(c => (
                    <span 
                      key={c.uid || c.displayName}
                      className="badge outline text-xs flex items-center gap-1"
                      style={{ padding: '2px 8px', borderRadius: '99px' }}
                    >
                      <img src={c.avatarUrl} alt={c.displayName} style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
                      {c.displayName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid-2col gap-4 mb-6">
            <div className="card p-4" style={{ borderRadius: '16px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
              <p className="text-xs font-bold text-outline uppercase tracking-wider m-0 mb-1">Release Date</p>
              <p className="text-sm font-bold text-primary m-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>calendar_today</span>
                {track.releaseDate 
                  ? new Date(track.releaseDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) 
                  : 'August 6, 2026'}
              </p>
            </div>

            <div className="card p-4" style={{ borderRadius: '16px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
              <p className="text-xs font-bold text-outline uppercase tracking-wider m-0 mb-1">Record Label & Publisher</p>
              <p className="text-sm font-bold m-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>verified</span>
                {track.labelName || 'Trinity Sound Records'}
              </p>
            </div>

            <div className="card p-4" style={{ borderRadius: '16px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
              <p className="text-xs font-bold text-outline uppercase tracking-wider m-0 mb-1">ISRC Code & Audio Spec</p>
              <p className="text-xs font-mono font-bold m-0 text-primary">
                {track.isrcCode || 'US-TR3-26-08001'}
                {(track.bpm || track.keySignature) && (
                  <span className="text-outline font-normal ml-2">
                    ({[track.bpm ? `${track.bpm} BPM` : null, track.keySignature].filter(Boolean).join(' • ')})
                  </span>
                )}
              </p>
            </div>

            <div className="card p-4" style={{ borderRadius: '16px', backgroundColor: 'var(--color-surface-container-lowest)' }}>
              <p className="text-xs font-bold text-outline uppercase tracking-wider m-0 mb-1">Play Count & Streams</p>
              <p className="text-sm font-bold m-0 flex items-center gap-1">
                <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>play_circle</span>
                {(track.playCount || track.play_count || 1240).toLocaleString()} Plays
              </p>
            </div>
          </div>

          {/* Description & Credits */}
          {track.description && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Track Description</h4>
              <p className="text-sm text-outline m-0" style={{ lineHeight: '1.6' }}>{track.description}</p>
            </div>
          )}

          {track.credits && (
            <div className="mb-6">
              <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Production & Credits</h4>
              <p className="text-xs text-outline italic m-0">{track.credits}</p>
            </div>
          )}

          {/* Copyright Notice */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2">Copyright & Phonographic Line</h4>
            <p className="text-xs text-outline m-0 font-mono">
              {track.copyrightNotice || `℗ ${new Date().getFullYear()} ${track.artist || 'Brandon Robinson'}. All Rights Reserved.`}
            </p>
          </div>

          {/* Song Lyrics Section */}
          <div className="mb-6">
            <h4 className="text-xs font-bold text-outline uppercase tracking-wider mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '18px' }}>lyrics</span>
              Song Lyrics
            </h4>
            <div 
              className="card p-4"
              style={{
                borderRadius: '16px',
                backgroundColor: 'var(--color-surface-container-lowest)',
                fontFamily: "'Geist', monospace",
                fontSize: '13px',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
                color: 'var(--color-on-surface)'
              }}
            >
              {track.lyrics || "No lyrics registered for this track yet."}
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div 
          className="flex justify-between items-center" 
          style={{ 
            padding: '20px 32px', 
            borderTop: '1px solid var(--color-surface-container-high)',
            backgroundColor: 'var(--color-surface-container-lowest)'
          }}
        >
          <button 
            type="button" 
            className="btn btn-pill outline btn-sm flex items-center gap-2"
            onClick={handleShare}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>share</span>
            Share Track
          </button>

          <button 
            type="button" 
            className="btn btn-pill btn-primary btn-sm flex items-center gap-2"
            onClick={() => {
              if (currentTrack?.id === track.id) {
                togglePlay();
              }
            }}
          >
            <span className="material-symbols-outlined fill-icon" style={{ fontSize: '18px' }}>
              {isCurrentPlaying ? 'pause' : 'play_arrow'}
            </span>
            {isCurrentPlaying ? 'Pause Track' : 'Play Track'}
          </button>
        </div>

      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default TrackDetailsModal;
