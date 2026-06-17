import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioProvider';

const GlobalPlayer = () => {
  const {
    isPlaying,
    currentTrack,
    currentTime,
    duration,
    volume,
    togglePlay,
    seek,
    playNext,
    changeVolume
  } = useAudio();

  const [activeSlide, setActiveSlide] = useState(0);
  const swipeContainerRef = useRef(null);

  const [likedTracks, setLikedTracks] = useState(() => {
    try {
      const stored = localStorage.getItem('liked_tracks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Keep liked state in sync when currentTrack changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('liked_tracks');
      setLikedTracks(stored ? JSON.parse(stored) : {});
    } catch {
      setLikedTracks({});
    }
  }, [currentTrack]);

  const toggleTrackLike = (trackId) => {
    if (!trackId) return;
    setLikedTracks(prev => {
      const updated = { ...prev, [trackId]: !prev[trackId] };
      localStorage.setItem('liked_tracks', JSON.stringify(updated));
      return updated;
    });
  };

  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '0:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleScrub = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max(clickX / width, 0), 1);
    seek(percentage * duration);
  };

  const handleVolumeChange = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const percentage = Math.min(Math.max(clickX / width, 0), 1);
    changeVolume(percentage);
  };

  const handleScroll = () => {
    if (!swipeContainerRef.current) return;
    const scrollLeft = swipeContainerRef.current.scrollLeft;
    const width = swipeContainerRef.current.clientWidth;
    const newSlide = Math.round(scrollLeft / (width || 1));
    if (newSlide !== activeSlide) {
      setActiveSlide(newSlide);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="global-player fade-in">
      <div
        className="player-swipe-container"
        ref={swipeContainerRef}
        onScroll={handleScroll}
      >
        {/* Slide 1: Play/Pause, Next/Previous, Shuffle, Repeat, Progress Slider, Like Heart */}
        <div className="player-slide slide-main">
          <div className="player-left flex items-center gap-4 mobile-hide">
            <div className="player-thumb">
              <img
                src={currentTrack?.img || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100"}
                alt={currentTrack?.title || "Track Cover"}
              />
            </div>
            <div className="player-track-info">
              <h4 className="m-0 text-sm">{currentTrack?.title || "Abiding Light"}</h4>
              <p className="m-0 text-xs text-outline italic" style={{ fontFamily: "'Playfair Display', serif" }}>
                {currentTrack?.artist || "Selah Grace"}
              </p>
            </div>
            <button
              className="icon-btn text-primary"
              onClick={(e) => {
                e.stopPropagation();
                toggleTrackLike(currentTrack?.id);
              }}
              disabled={!currentTrack}
            >
              <span className="material-symbols-outlined">
                {currentTrack && likedTracks[currentTrack.id] ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>

          <div className="player-center flex-col flex-1 max-w-lg mx-auto">
            <div className="flex justify-center items-center gap-6 mb-2">
              <button className="icon-btn muted"><span className="material-symbols-outlined">shuffle</span></button>
              <button className="icon-btn"><span className="material-symbols-outlined">skip_previous</span></button>
              <button
                className="play-fab small"
                style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}
                onClick={togglePlay}
                disabled={!currentTrack}
              >
                <span className="material-symbols-outlined fill-icon">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button className="icon-btn" onClick={playNext}><span className="material-symbols-outlined">skip_next</span></button>
              <button className="icon-btn muted"><span className="material-symbols-outlined">repeat</span></button>
            </div>
            <div className="flex items-center gap-4 w-full scrubber-wrapper">
              <span className="text-xs text-outline">{formatTime(currentTime)}</span>
              <div className="scrubber-bar flex-1" onClick={handleScrub}>
                <div className="scrubber-fill" style={{ width: `${progressPercent}%` }}></div>
                <div className="scrubber-thumb" style={{ left: `${progressPercent}%` }}></div>
              </div>
              <span className="text-xs text-outline">{formatTime(duration)}</span>
              <button
                className="icon-btn text-primary mobile-only"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleTrackLike(currentTrack?.id);
                }}
                disabled={!currentTrack}
                style={{ opacity: currentTrack ? 1 : 0.5, cursor: currentTrack ? 'pointer' : 'default' }}
              >
                <span className="material-symbols-outlined">
                  {currentTrack && likedTracks[currentTrack.id] ? 'favorite' : 'favorite_border'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Slide 2: Audio icon and slider, icon for lyrics, icon for queue_music */}
        <div className="player-slide slide-extra">
          <div className="player-right flex items-center justify-end gap-4">
            <div className="player-extra-buttons flex items-center gap-4">
              <button className="icon-btn muted"><span className="material-symbols-outlined">lyrics</span></button>
              <button className="icon-btn muted"><span className="material-symbols-outlined">queue_music</span></button>
            </div>
            <div className="flex items-center gap-2 volume-control">
              <span className="material-symbols-outlined muted text-sm">
                {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
              </span>
              <div className="scrubber-bar volume-bar" style={{ width: '80px' }} onClick={handleVolumeChange}>
                <div className="scrubber-fill" style={{ width: `${volume * 100}%` }}></div>
                <div className="scrubber-thumb" style={{ left: `${volume * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe dots for mobile */}
      <div className="player-dots mobile-only">
        <span className={`dot ${activeSlide === 0 ? 'active' : ''}`}></span>
        <span className={`dot ${activeSlide === 1 ? 'active' : ''}`}></span>
      </div>
    </div>
  );
};

export default GlobalPlayer;
