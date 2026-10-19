import React, { useState, useEffect, useRef } from 'react';
import { useAudio } from '../context/AudioProvider';
import TrackDetailsModal from './TrackDetailsModal';

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
    changeVolume,
    queue
  } = useAudio();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isRepeatOne, setIsRepeatOne] = useState(false);
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
    <div className={`global-player fade-in ${isExpanded ? 'expanded' : ''}`}>
      
      {/* Mini Player Wrapper */}
      <div className="mini-player-contents">
        <button 
          className="icon-btn mobile-only player-maximize-btn"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          aria-label="Maximize player"
        >
          <span className="material-symbols-outlined">open_in_full</span>
        </button>

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
                <p className="m-0 text-xs text-outline italic" style={{fontFamily: "'Playfair Display', serif"}}>
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
                title="Like Track"
              >
                <span className="material-symbols-outlined">
                  {currentTrack && likedTracks[currentTrack.id] ? 'favorite' : 'favorite_border'}
                </span>
              </button>

              {/* Dedicated Track Details Info Button */}
              <button 
                type="button"
                className="icon-btn text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDetailsModal(true);
                }}
                disabled={!currentTrack}
                title="View Track Details & Lyrics"
              >
                <span className="material-symbols-outlined">info</span>
              </button>
            </div>

            <div className="player-center flex-col flex-1 max-w-lg mx-auto">
              <div className="flex justify-center items-center gap-6 mb-2">
                <button 
                  className={`icon-btn ${isShuffle ? 'text-primary' : 'muted'}`}
                  onClick={(e) => { e.stopPropagation(); setIsShuffle(!isShuffle); }}
                >
                  <span className="material-symbols-outlined">shuffle</span>
                </button>
                <button className="icon-btn"><span className="material-symbols-outlined">skip_previous</span></button>
                <button 
                  className="play-fab small" 
                  style={{backgroundColor: 'var(--color-primary)', color: 'white'}}
                  onClick={togglePlay}
                  disabled={!currentTrack}
                >
                  <span className="material-symbols-outlined fill-icon">
                    {isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
                <button className="icon-btn" onClick={playNext}><span className="material-symbols-outlined">skip_next</span></button>
                <button 
                  className={`icon-btn ${isRepeat ? 'text-primary' : 'muted'}`}
                  onClick={(e) => { e.stopPropagation(); setIsRepeat(!isRepeat); }}
                >
                  <span className="material-symbols-outlined">repeat</span>
                </button>
              </div>
              <div className="flex items-center gap-4 w-full scrubber-wrapper">
                <span className="text-xs text-outline">{formatTime(currentTime)}</span>
                <div className="scrubber-bar flex-1" onClick={handleScrub}>
                  <div className="scrubber-fill" style={{width: `${progressPercent}%`}}></div>
                  <div className="scrubber-thumb" style={{left: `${progressPercent}%`}}></div>
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
                <button 
                  type="button" 
                  className="icon-btn text-primary" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetailsModal(true);
                  }}
                  title="View Track Details & Lyrics"
                >
                  <span className="material-symbols-outlined">info</span>
                </button>
                <button className="icon-btn muted" onClick={() => setShowDetailsModal(true)}><span className="material-symbols-outlined">lyrics</span></button>
                <button className="icon-btn muted"><span className="material-symbols-outlined">queue_music</span></button>
              </div>
              <div className="flex items-center gap-2 volume-control">
                <span className="material-symbols-outlined muted text-sm">
                  {volume === 0 ? 'volume_off' : volume < 0.5 ? 'volume_down' : 'volume_up'}
                </span>
                <div className="scrubber-bar volume-bar" style={{width: '80px'}} onClick={handleVolumeChange}>
                  <div className="scrubber-fill" style={{width: `${volume * 100}%`}}></div>
                  <div className="scrubber-thumb" style={{left: `${volume * 100}%`}}></div>
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

      {/* Expanded Player Overlay (Mobile Only) */}
      <div className="mobile-expanded-player mobile-only">
        {/* Blurred Background Cover Art */}
        <div 
          className="expanded-background-blur" 
          style={{ backgroundImage: `url(${currentTrack?.img || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600"})` }}
        ></div>
        
        <header className="expanded-header">
          <button className="icon-btn" onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="expanded-header-center">
            <span className="expanded-header-label">ALBUM</span>
            <h5 className="expanded-header-title">{currentTrack?.album || "Rock With Me"}</h5>
          </div>
          <div style={{ width: '48px' }}></div> {/* Spacer to balance back arrow */}
        </header>

        <div className="expanded-body">
          <div className="expanded-cover-wrapper">
            <img 
              src={currentTrack?.img || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600"} 
              alt={currentTrack?.title || "Track Cover"} 
              className="expanded-cover-img"
            />
          </div>

          <div className="expanded-track-info">
            <h2 className="expanded-track-title">{currentTrack?.title || "On My Mind"}</h2>
            <p className="expanded-track-artist">{currentTrack?.artist || "Ellie Goulding"}</p>
          </div>

          <div className="expanded-scrubber-container flex items-center gap-4 w-full">
            <span className="text-xs text-outline">{formatTime(currentTime)}</span>
            <div className="scrubber-bar flex-1" onClick={handleScrub}>
              <div className="scrubber-fill" style={{width: `${progressPercent}%`}}></div>
              <div className="scrubber-thumb" style={{left: `${progressPercent}%`}}></div>
            </div>
            <span className="text-xs text-outline">{formatTime(duration)}</span>
          </div>

          <div className="expanded-controls">
            <button className="icon-btn ctrl-prev"><span className="material-symbols-outlined">skip_previous</span></button>
            <button 
              className="expanded-play-btn" 
              onClick={togglePlay}
              disabled={!currentTrack}
            >
              <span className="material-symbols-outlined">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <button className="icon-btn ctrl-next" onClick={playNext}><span className="material-symbols-outlined">skip_next</span></button>
          </div>

          <div className="expanded-actions-row">
            <button 
              className={`icon-btn ${isShuffle ? 'text-primary' : ''}`}
              onClick={(e) => { e.stopPropagation(); setIsShuffle(!isShuffle); }}
            >
              <span className="material-symbols-outlined">shuffle</span>
            </button>
            <button 
              className={`icon-btn ${isRepeat ? 'text-primary' : ''}`}
              onClick={(e) => { e.stopPropagation(); setIsRepeat(!isRepeat); }}
            >
              <span className="material-symbols-outlined">repeat</span>
            </button>
            <button 
              className={`icon-btn ${isRepeatOne ? 'text-primary' : ''}`}
              onClick={(e) => { e.stopPropagation(); setIsRepeatOne(!isRepeatOne); }}
            >
              <span className="material-symbols-outlined">repeat_one</span>
            </button>
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
        </div>

        <div className="expanded-up-next">
          <div className="up-next-left">
            <span className="up-next-label">Up Next</span>
            <span className="up-next-title">{queue[0]?.title || "Life Without You"}</span>
          </div>
          <span className="material-symbols-outlined up-next-arrow">keyboard_arrow_up</span>
        </div>
      </div>

      {/* Track Details Information Modal */}
      <TrackDetailsModal 
        track={currentTrack}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
      />
    </div>
  );
};

export default GlobalPlayer;
