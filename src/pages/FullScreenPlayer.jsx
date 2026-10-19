import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioProvider';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { detectLyricsWithAI, saveTrackLyricsToFirestore } from '../utils/aiLyricService';
import WaveformWitness from '../components/WaveformWitness';

const FullScreenPlayer = ({ setCurrentView }) => {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, seek, playNext } = useAudio();
  const [lyrics, setLyrics] = useState('');
  const [activeTab, setActiveTab] = useState('LYRICS');
  const [isDetecting, setIsDetecting] = useState(false);
  const activeLineRef = useRef(null);

  // Default fallback track if none is currently playing
  const track = currentTrack || {
    id: 'oceans-of-grace',
    title: 'Oceans of Grace',
    artist: 'Brandon Robinson',
    img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200',
    duration: 312
  };

  // Real-time Firestore sync for track lyrics
  useEffect(() => {
    if (!track.id) return;

    const trackDocRef = doc(db, 'tracks', track.id);
    const unsubscribe = onSnapshot(trackDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.lyrics) {
          setLyrics(data.lyrics);
        } else {
          // If track exists but has no lyrics, trigger auto-detection
          autoDetectAndSaveLyrics(track);
        }
      } else {
        // Fallback default lyrics for demo tracks
        autoDetectAndSaveLyrics(track);
      }
    }, (err) => {
      console.error("Error fetching track lyrics:", err);
    });

    return () => unsubscribe();
  }, [track.id]);

  const autoDetectAndSaveLyrics = async (targetTrack) => {
    setIsDetecting(true);
    try {
      const generated = await detectLyricsWithAI(targetTrack.title, targetTrack.genre || 'Worship', targetTrack.artist || 'Brandon Robinson');
      setLyrics(generated);
      if (targetTrack.id) {
        await saveTrackLyricsToFirestore(targetTrack.id, generated);
      }
    } catch (err) {
      console.error("Auto detect lyrics failed:", err);
    } finally {
      setIsDetecting(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Parse lyrics into individual clean lines
  const lyricLines = lyrics
    ? lyrics.split('\n').filter(line => line.trim().length > 0)
    : [];

  // Calculate active line index based on playback progress
  const progressRatio = duration > 0 ? (currentTime / duration) : 0;
  const activeLineIndex = Math.min(
    Math.floor(progressRatio * lyricLines.length),
    Math.max(0, lyricLines.length - 1)
  );

  // Auto-scroll active lyric line into view
  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeLineIndex]);

  return (
    <div className="fullscreen-player-desktop fade-in">
      
      {/* Header Controls */}
      <header className="fsp-header">
        <button type="button" className="icon-btn" onClick={() => setCurrentView('discover')}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
        </button>
        <div className="logo text-center" style={{ fontSize: '28px' }}>
          TRINITY<span style={{ fontFamily: "'Geist', sans-serif", fontWeight: '300', fontStyle: 'normal' }}>Sound</span>
        </div>
        <div className="flex gap-4">
          <button type="button" className="icon-btn" title="Share Track"><span className="material-symbols-outlined">share</span></button>
          <button type="button" className="icon-btn" title="Favorite"><span className="material-symbols-outlined">favorite_border</span></button>
        </div>
      </header>

      <div className="fsp-layout">
        
        {/* Left Side: Cover Art & Interactive Player Controls */}
        <div className="fsp-left">
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1', borderRadius: '24px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
            <img 
              src={track.artworkUrl || track.img || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1200"} 
              alt={track.title} 
              className="fsp-cover"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          
          <h1 className="font-headline" style={{ fontSize: '44px', marginBottom: '6px' }}>{track.title}</h1>
          <p className="text-primary italic m-0 flex items-center justify-center gap-2 flex-wrap" style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px' }}>
            <span>{track.artist || track.artistName || 'Brandon Robinson'}</span>
            {Array.isArray(track.collaborators) && track.collaborators.length > 0 && (
              <span className="text-outline font-normal text-lg" style={{ fontStyle: 'normal' }}>
                {' ft. ' + track.collaborators.map(c => c.displayName).join(', ')}
              </span>
            )}
          </p>

          <div className="mt-xl mb-xl">
            <WaveformWitness waveformData={Array.from({ length: 40 }, () => Math.random() * 0.8 + 0.2)} className="w-full" />
            <div className="flex justify-between text-xs font-bold text-outline uppercase tracking-wider mt-2">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || track.duration)}</span>
            </div>
            
            {/* Interactive Timeline Scrubber */}
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={currentTime} 
              onChange={(e) => seek(parseFloat(e.target.value))}
              style={{ width: '100%', marginTop: '8px', cursor: 'pointer', accentColor: 'var(--color-primary)' }}
            />
          </div>

          <div className="flex justify-between items-center px-4">
            <button type="button" className="btn btn-pill" style={{ backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-container)', fontSize: '13px', fontWeight: 'bold' }}>
              <span className="material-symbols-outlined text-sm mr-2" style={{ verticalAlign: 'middle' }}>volunteer_activism</span>
              SUPPORT THIS ARTIST
            </button>
            
            <div className="flex items-center gap-6">
              <button type="button" className="icon-btn muted"><span className="material-symbols-outlined">shuffle</span></button>
              <button type="button" className="icon-btn" onClick={() => seek(Math.max(0, currentTime - 10))}>
                <span className="material-symbols-outlined">replay_10</span>
              </button>
              
              <button 
                type="button" 
                className="play-fab" 
                onClick={togglePlay}
                style={{ backgroundColor: 'var(--color-primary)', color: 'white', width: '64px', height: '64px' }}
              >
                <span className="material-symbols-outlined fill-icon" style={{ fontSize: '36px' }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              
              <button type="button" className="icon-btn" onClick={playNext}>
                <span className="material-symbols-outlined">skip_next</span>
              </button>
              <button type="button" className="icon-btn muted"><span className="material-symbols-outlined">repeat</span></button>
            </div>
          </div>
        </div>

        {/* Right Side: AI Synchronized Lyrics Display */}
        <div className="fsp-right">
          <div className="fsp-tabs flex justify-between items-center">
            <div className="flex gap-4">
              <button 
                type="button" 
                className={`fsp-tab ${activeTab === 'LYRICS' ? 'active' : ''}`}
                onClick={() => setActiveTab('LYRICS')}
              >
                LYRICS
              </button>
              <button 
                type="button" 
                className={`fsp-tab ${activeTab === 'SCRIPTURE' ? 'active' : ''}`}
                onClick={() => setActiveTab('SCRIPTURE')}
              >
                SCRIPTURE
              </button>
              <button 
                type="button" 
                className={`fsp-tab ${activeTab === 'TESTIMONY' ? 'active' : ''}`}
                onClick={() => setActiveTab('TESTIMONY')}
              >
                TESTIMONY
              </button>
            </div>

            <button 
              type="button" 
              className="btn btn-pill outline btn-xs flex items-center gap-1"
              onClick={() => autoDetectAndSaveLyrics(track)}
              disabled={isDetecting}
              style={{ padding: '6px 14px', fontSize: '11px' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
              {isDetecting ? "Detecting AI..." : "Re-Transcribe AI"}
            </button>
          </div>

          {activeTab === 'LYRICS' && (
            <div className="huge-lyrics mt-6" style={{ maxHeight: '520px', overflowY: 'auto', paddingRight: '12px' }}>
              {isDetecting ? (
                <div className="text-center py-12">
                  <div className="simple-spinner mx-auto mb-4"></div>
                  <p className="text-sm font-bold text-outline">AI is detecting & transcribing track lyrics...</p>
                </div>
              ) : lyricLines.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-base font-bold">No lyrics recorded for this track yet.</p>
                  <button 
                    type="button" 
                    className="btn btn-pill btn-primary mt-4"
                    onClick={() => autoDetectAndSaveLyrics(track)}
                  >
                    Generate Lyrics with AI
                  </button>
                </div>
              ) : (
                lyricLines.map((line, idx) => {
                  const isActive = idx === activeLineIndex;
                  const isHeader = line.startsWith('[') && line.endsWith(']');
                  
                  return (
                    <p 
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      className={isActive ? 'active' : ''}
                      style={{
                        fontSize: isHeader ? '16px' : (isActive ? '34px' : '26px'),
                        fontWeight: isHeader ? 'bold' : (isActive ? '800' : '500'),
                        color: isHeader ? 'var(--color-primary)' : (isActive ? 'var(--color-primary)' : 'rgba(255,255,255,0.4)'),
                        margin: isHeader ? '24px 0 12px 0' : '16px 0',
                        transition: 'all 0.3s ease',
                        letterSpacing: isActive ? '0.02em' : 'normal',
                        transform: isActive ? 'scale(1.02)' : 'scale(1)',
                        transformOrigin: 'left center'
                      }}
                    >
                      {line}
                    </p>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'SCRIPTURE' && (
            <div className="card p-6 mt-6 fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
              <span className="badge outline text-xs mb-3">Anchored Word</span>
              <h3 className="font-headline text-white" style={{ fontSize: '28px' }}>Psalm 46:1</h3>
              <p className="italic text-outline" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', lineHeight: '1.6' }}>
                "God is our refuge and strength, an ever-present help in trouble. Therefore we will not fear, though the earth give way and the mountains fall into the heart of the sea."
              </p>
            </div>
          )}

          {activeTab === 'TESTIMONY' && (
            <div className="card p-6 mt-6 fade-in" style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}>
              <span className="badge outline text-xs mb-3">Artist Story</span>
              <h3 className="font-headline text-white" style={{ fontSize: '26px' }}>Written in Grace</h3>
              <p className="text-sm text-outline" style={{ lineHeight: '1.7' }}>
                This song was birthed during a quiet late-night worship session, reflecting on God's unwavering faithfulness through every trial and season of growth.
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default FullScreenPlayer;
