import React, { useState, useEffect, useRef } from 'react';
import { db, auth, analytics } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, deleteDoc, increment, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { logEvent } from 'firebase/analytics';
import { useAudio } from '../context/AudioProvider';

const PlaylistDetail = () => {
  const { isPlaying, currentTrack, playTrack } = useAudio();

  const playlistId = 'morning_worship';
  const [followerCount, setFollowerCount] = useState(12402);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [hoveredTrack, setHoveredTrack] = useState(null);

  const [likedTracks, setLikedTracks] = useState(() => {
    try {
      const stored = localStorage.getItem('liked_tracks');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const toggleTrackLike = (trackId) => {
    setLikedTracks(prev => {
      const updated = { ...prev, [trackId]: !prev[trackId] };
      localStorage.setItem('liked_tracks', JSON.stringify(updated));
      return updated;
    });
  };

  // Generate or retrieve persistent local user ID
  const [userId] = useState(() => {
    let uid = localStorage.getItem('mock_uid');
    if (!uid) {
      uid = 'mock_user_' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('mock_uid', uid);
    }
    return uid;
  });

  const menuRef = useRef(null);

  const tracks = [
    { id: 'track_01', num: '01', title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong UNITED', album: 'Zion', date: 'Oct 12, 2023', time: '8:55', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: 'track_02', num: '02', title: 'Gratitude', artist: 'Brandon Lake', album: 'House of Miracles', date: 'Oct 14, 2023', time: '5:38', img: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=100', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: 'track_03', num: '03', title: 'Way Maker', artist: 'Sinach', album: 'Way Maker', date: 'Oct 15, 2023', time: '5:04', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=100', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: 'track_04', num: '04', title: 'Goodness of God', artist: 'CeCe Winans', album: 'Believe For It', date: 'Oct 20, 2023', time: '4:58', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=100', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
  ];

  // Fetch playlist details from Firestore and check follow status on mount
  useEffect(() => {
    const initAndFetchData = async () => {
      try {
        const playlistRef = doc(db, 'playlists', playlistId);
        const docSnap = await getDoc(playlistRef);
        if (docSnap.exists()) {
          setFollowerCount(docSnap.data().follower_count || 12402);
        } else {
          // Initialize if it doesn't exist yet, using our mock userId as creator/owner
          await setDoc(playlistRef, {
            name: 'Morning Worship',
            follower_count: 12402,
            userId: userId
          });
          setFollowerCount(12402);
        }

        // Check follow state
        const followRef = doc(db, 'users', userId, 'followed_playlists', playlistId);
        const followSnap = await getDoc(followRef);
        setIsFollowing(followSnap.exists());
      } catch (err) {
        console.error('Error initializing or fetching playlist data:', err);
      }
    };

    initAndFetchData();
  }, [userId]);

  // Close Ellipsis Dropdown on outside click
  useEffect(() => {
    const clickOutside = (e) => {
      if (showMoreMenu && menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, [showMoreMenu]);

  // Handle Play All Click
  const handlePlayAll = async () => {
    // Specifically load and play the designated track as required by UX guide
    const raveTrack = {
      id: 'rave_in_the_wasteland',
      title: 'Rave In The Wasteland',
      artist: 'Will Smith',
      album: 'Curated Soundtracks',
      img: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
      audioUrl: 'https://youtu.be/DipsXn4ucTk?si=GcoFTbjKQKSIos5M' // Direct audio stream URL
    };

    playTrack(raveTrack);

    // Logging play_all event to Firestore
    if (userId) {
      try {
        const historyRef = collection(db, 'users', userId, 'listening_history');
        await addDoc(historyRef, {
          playlistId,
          playedAt: serverTimestamp(),
          type: 'play_all'
        });
      } catch (err) {
        console.error('Firestore listening history error:', err);
      }
    }

    // Log Firebase Analytics event
    if (analytics) {
      try {
        logEvent(analytics, 'playlist_play_all', { playlist_id: playlistId });
      } catch (err) {
        console.error('Analytics log event error:', err);
      }
    }
  };

  // Handle Follow Click
  const handleFollow = async () => {
    if (!userId) return;

    const nextFollowState = !isFollowing;
    setIsFollowing(nextFollowState);
    setFollowerCount(prev => prev + (nextFollowState ? 1 : -1));

    const followRef = doc(db, 'users', userId, 'followed_playlists', playlistId);
    const playlistRef = doc(db, 'playlists', playlistId);

    try {
      if (nextFollowState) {
        await setDoc(followRef, { followedAt: serverTimestamp() });
        await updateDoc(playlistRef, { follower_count: increment(1) });
      } else {
        await deleteDoc(followRef);
        await updateDoc(playlistRef, { follower_count: increment(-1) });
      }
    } catch (err) {
      console.error('Firestore follow toggle error:', err);
      // Revert UI on failure
      setIsFollowing(!nextFollowState);
      setFollowerCount(prev => prev + (nextFollowState ? -1 : 1));
    }
  };

  // Handle Individual Track Play
  const handlePlayTrack = async (track) => {
    console.log('handlePlayTrack was called for track:', track.id);
    playTrack(track);

    if (userId) {
      try {
        // Log to user listening history
        const historyRef = collection(db, 'users', userId, 'listening_history');
        await addDoc(historyRef, {
          trackId: track.id,
          title: track.title,
          artist: track.artist,
          playedAt: serverTimestamp(),
          type: 'track_row_click'
        });

        // Increment track play count
        const trackRef = doc(db, 'tracks', track.id);
        const trackSnap = await getDoc(trackRef);
        if (trackSnap.exists()) {
          await updateDoc(trackRef, { play_count: increment(1) });
        } else {
          await setDoc(trackRef, {
            title: track.title,
            artist: track.artist,
            play_count: 1
          });
        }
      } catch (err) {
        console.error('Firestore track click logging error:', err);
      }
    }
  };

  // Share Actions
  const handleCopyLink = () => {
    const link = `${window.location.origin}/?view=playlist&id=${playlistId}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Playlist link copied to clipboard!');
      setShowShareModal(false);
      if (analytics) {
        logEvent(analytics, 'share', { method: 'copy_link', content_type: 'playlist', item_id: playlistId });
      }
    });
  };

  return (
    <div className="playlist-detail fade-in">

      <div className="playlist-header-desktop">
        <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" alt="Morning Worship" className="playlist-cover-desktop" />

        <div className="flex-1">
          <p className="text-primary font-bold uppercase tracking-wider text-xs mb-2">CURATED PLAYLIST</p>
          <h1 className="font-headline" style={{ fontSize: '56px', margin: '0 0 16px 0' }}>Morning Worship</h1>

          <div className="flex items-center gap-4 text-outline font-bold text-sm mb-xl playlist-meta-row">
            <div className="flex items-center gap-2 text-on-surface">
              <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-primary)' }}></div>
              TRINITYSound
            </div>
            <span>•</span>
            <span>48 Songs</span>
            <span>•</span>
            <span>3h 45m</span>
            <span>•</span>
            <span className="text-secondary">{followerCount.toLocaleString()} Followers</span>
          </div>

          <div className="flex items-center gap-4 playlist-actions-row">
            <button className="btn btn-pill btn-primary with-icon" style={{ padding: '12px 32px' }} onClick={handlePlayAll}>
              <span className="material-symbols-outlined fill-icon">
                {currentTrack?.id === 'rave_in_the_wasteland' && isPlaying ? 'pause' : 'play_arrow'}
              </span>
              Play All
            </button>
            <button
              className={`btn btn-pill outline with-icon ${isFollowing ? 'following' : ''}`}
              style={{ padding: '12px 24px' }}
              onClick={handleFollow}
            >
              <span className="material-symbols-outlined">
                {isFollowing ? 'check' : 'person_add'}
              </span>
              <span className="btn-text-mobile-hide">
                {isFollowing ? 'Following' : 'Follow'}
              </span>
            </button>
            <button className="icon-btn-circle outline share-btn" onClick={() => setShowShareModal(true)}>
              <span className="material-symbols-outlined">share</span>
            </button>

            {/* Ellipsis more actions button and dropdown menu */}
            <div style={{ position: 'relative' }} ref={menuRef}>
              <button
                className={`icon-btn-circle outline more-options ${showMoreMenu ? 'active' : ''}`}
                onClick={() => setShowMoreMenu(!showMoreMenu)}
              >
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
              {showMoreMenu && (
                <div className="more-dropdown" style={{ right: 0, top: '56px' }}>
                  <div className="dropdown-item" onClick={() => { setShowMoreMenu(false); alert('Added to Queue'); }}>
                    <span className="material-symbols-outlined">queue_music</span>
                    Add to Queue
                  </div>
                  <div className="dropdown-item" onClick={() => { setShowMoreMenu(false); alert('Reported Playlist'); }}>
                    <span className="material-symbols-outlined">report</span>
                    Report Playlist
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-xl">
        <div className="table-header">
          <span>#</span>
          <span>TITLE</span>
          <span>ALBUM</span>
          <span>DATE ADDED</span>
          <span className="material-symbols-outlined text-sm">schedule</span>
        </div>

        <div className="flex-col gap-2">
          {tracks.map(track => {
            const isCurrent = currentTrack?.id === track.id;
            const isCurrentPlaying = isCurrent && isPlaying;
            const isHovered = hoveredTrack === track.num;

            const isLiked = !!likedTracks[track.id];

            return (
              <div
                key={track.num}
                className="table-row"
                onMouseEnter={() => setHoveredTrack(track.num)}
                onMouseLeave={() => setHoveredTrack(null)}
                onClick={() => handlePlayTrack(track)}
                style={{ cursor: 'pointer' }}
              >
                <span className="text-outline text-sm flex items-center row-track-num-wrapper" style={{ minHeight: '20px' }}>
                  {isCurrentPlaying ? (
                    <div className="equalizer">
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                      <div className="equalizer-bar"></div>
                    </div>
                  ) : isHovered ? (
                    <span className="material-symbols-outlined text-primary fill-icon" style={{ fontSize: '18px' }}>
                      play_arrow
                    </span>
                  ) : (
                    track.num
                  )}
                </span>

                <div className="flex items-center gap-4 row-title-info">
                  <img src={track.img} alt={track.title} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                  <div>
                    <h4 className="m-0 text-sm track-title-text" style={{ color: isCurrent ? 'var(--color-primary)' : 'inherit' }}>
                      {track.title}
                    </h4>
                    <p className="m-0 text-xs text-outline italic row-artist-name">{track.artist}</p>
                  </div>
                </div>
                <span className="text-outline text-sm row-album">{track.album}</span>
                <span className="text-outline text-sm row-date">{track.date}</span>

                <div className="row-actions-duration flex items-center justify-end gap-3">
                  <span className="text-outline text-sm row-duration">{track.time}</span>

                  <button
                    className={`icon-btn row-heart-btn ${isLiked ? 'liked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTrackLike(track.id);
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {isLiked ? 'favorite' : 'favorite_border'}
                    </span>
                  </button>

                  <button
                    className="icon-btn row-more-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`More options for track: ${track.title}`);
                    }}
                  >
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-xl mb-xl">
        <div className="flex justify-between items-baseline mb-4">
          <h2>More Like This</h2>
          <span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer see-all-hover">
            See all
            <span className="arrow">→</span>
          </span>
        </div>

        <div className="grid-5col">
          {[
            { title: 'Sunday Serenity', info: 'Peaceful instrumental ...', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400' },
            { title: 'Modern Hymns', info: 'Classic lyrics, new sou...', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400' },
            { title: 'Praise & Power', info: 'Uplifting contemporary ...', img: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&q=80&w=400' },
            { title: 'Quiet Reflection', info: 'Acoustic moments of p...', img: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?auto=format&fit=crop&q=80&w=400' },
            { title: 'Soul Harmony', info: 'Vocal-forward worship ...', img: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=400' }
          ].map(playlist => (
            <div key={playlist.title} className="album-card" onClick={() => alert(`Navigating to ${playlist.title}...`)}>
              <img src={playlist.img} alt={playlist.title} />
              <h4 className="text-sm">{playlist.title}</h4>
              <p className="text-xs text-outline m-0">{playlist.info}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Share Modal Backdrop and Glassmorphic Dialog */}
      {showShareModal && (
        <div className="share-modal-backdrop" onClick={() => setShowShareModal(false)}>
          <div className="share-modal" onClick={(e) => e.stopPropagation()}>
            <div className="share-header">
              <h3 className="m-0">Share Playlist</h3>
              <button className="icon-btn" onClick={() => setShowShareModal(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="share-items-list mt-2">
              <div className="share-item" style={{ animationDelay: '0.1s' }} onClick={handleCopyLink}>
                <span className="material-symbols-outlined">link</span>
                <span>Copy Link</span>
              </div>
              <div className="share-item" style={{ animationDelay: '0.2s' }} onClick={() => { alert('Shared on Twitter!'); setShowShareModal(false); }}>
                <span className="material-symbols-outlined font-normal">chat</span>
                <span>Twitter / X</span>
              </div>
              <div className="share-item" style={{ animationDelay: '0.3s' }} onClick={() => { alert('Shared on Facebook!'); setShowShareModal(false); }}>
                <span className="material-symbols-outlined">share</span>
                <span>Facebook</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PlaylistDetail;
