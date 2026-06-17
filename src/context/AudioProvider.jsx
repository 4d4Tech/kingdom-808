import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

const AudioContext = createContext(null);

export const useAudio = () => useContext(AudioContext);

// Utility to extract 11-char YouTube ID
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const AudioProvider = ({ children }) => {
  const audioRef = useRef(null);
  const ytPlayerRef = useRef(null);
  const [ytReady, setYtReady] = useState(false);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [queue, setQueue] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  // Load YouTube IFrame API script tag dynamically on mount
  useEffect(() => {
    if (window.YT) {
      setYtReady(true);
      return;
    }
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
  }, []);

  // Sync timeupdate for normal HTML5 audio player
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      const isYouTube = currentTrack && getYouTubeId(currentTrack.audioUrl);
      if (!isYouTube) {
        setCurrentTime(audio.currentTime);
      }
    };
    const handleLoadedMetadata = () => {
      const isYouTube = currentTrack && getYouTubeId(currentTrack.audioUrl);
      if (!isYouTube) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      const isYouTube = currentTrack && getYouTubeId(currentTrack.audioUrl);
      if (!isYouTube) {
        playNext();
      }
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [queue, currentTrack]);

  // Sync currentTime for YouTube using an interval
  useEffect(() => {
    let interval;
    const isYouTube = currentTrack && getYouTubeId(currentTrack.audioUrl);

    if (isYouTube && isPlaying && ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
      interval = setInterval(() => {
        try {
          setCurrentTime(ytPlayerRef.current.getCurrentTime());
        } catch (err) {
          console.error('Error getting YouTube current time:', err);
        }
      }, 250);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTrack]);

  // Initialize YouTube IFrame Player
  const initYTPlayer = () => {
    return new Promise((resolve) => {
      if (ytPlayerRef.current) {
        resolve(ytPlayerRef.current);
        return;
      }

      const createPlayer = () => {
        try {
          ytPlayerRef.current = new window.YT.Player('youtube-player', {
            height: '0',
            width: '0',
            videoId: '',
            playerVars: {
              playsinline: 1,
              controls: 0,
              disablekb: 1,
              fs: 0,
              rel: 0,
              origin: window.location.origin
            },
            events: {
              onReady: () => {
                setYtReady(true);
                // Sync current volume to YouTube (expects 0-100)
                ytPlayerRef.current.setVolume(volume * 100);
                resolve(ytPlayerRef.current);
              },
              onStateChange: (event) => {
                if (event.data === window.YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                  setDuration(ytPlayerRef.current.getDuration() || 0);
                } else if (event.data === window.YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                } else if (event.data === window.YT.PlayerState.ENDED) {
                  setIsPlaying(false);
                  playNext();
                }
              },
              onError: (err) => {
                console.error('YouTube Player Error:', err);
                resolve(null);
              }
            }
          });
        } catch (e) {
          console.error('Failed to create YouTube player:', e);
          resolve(null);
        }
      };

      if (window.YT && window.YT.Player) {
        createPlayer();
      } else {
        const prevCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          if (prevCallback) prevCallback();
          createPlayer();
        };
      }
    });
  };

  const playTrack = async (track) => {
    setCurrentTrack(track);
    setCurrentTime(0);
    setDuration(0);
    const ytId = getYouTubeId(track.audioUrl);

    if (ytId) {
      // Pause/Stop HTML5 audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }

      const player = await initYTPlayer();
      if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(ytId);
        player.playVideo();
        setIsPlaying(true);
      } else {
        console.error('YouTube player is not fully initialized');
      }
    } else {
      // Pause YouTube player
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        ytPlayerRef.current.pauseVideo();
      }

      if (audioRef.current) {
        audioRef.current.src = track.audioUrl;
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.error('HTML5 audio play error:', err);
            setIsPlaying(false);
          });
      }
    }
  };

  const togglePlay = () => {
    if (!currentTrack) return;
    const ytId = getYouTubeId(currentTrack.audioUrl);

    if (ytId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getPlayerState === 'function') {
        const state = ytPlayerRef.current.getPlayerState();
        if (state === window.YT.PlayerState.PLAYING) {
          ytPlayerRef.current.pauseVideo();
          setIsPlaying(false);
        } else {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        }
      }
    } else {
      if (!audioRef.current) return;
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(console.error);
      }
    }
  };

  const seek = (time) => {
    if (!currentTrack) return;
    const ytId = getYouTubeId(currentTrack.audioUrl);

    if (ytId) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        ytPlayerRef.current.seekTo(time, true);
        setCurrentTime(time);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
        setCurrentTime(time);
      }
    }
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextTrack = queue[0];
      setQueue(queue.slice(1));
      playTrack(nextTrack);
    } else {
      setIsPlaying(false);
      setCurrentTrack(null);
      setCurrentTime(0);
      setDuration(0);
    }
  };

  const changeVolume = (newVolume) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
      ytPlayerRef.current.setVolume(newVolume * 100);
    }
  };

  const value = {
    isPlaying,
    currentTrack,
    queue,
    currentTime,
    duration,
    volume,
    playTrack,
    togglePlay,
    seek,
    playNext,
    setQueue,
    changeVolume
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
      <audio ref={audioRef} style={{ display: 'none' }} />
      {/* Target for YouTube Player Iframe */}
      <div id="youtube-player" style={{ display: 'none' }} />
    </AudioContext.Provider>
  );
};
