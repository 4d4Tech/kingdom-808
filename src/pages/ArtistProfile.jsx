import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useAudio } from '../context/AudioProvider';
import { useToast } from '../context/ToastContext';

const ArtistProfile = ({ userProfile, onOpenSettings }) => {
  const { showToast } = useToast();
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  useEffect(() => {
    // Fetch all public tracks uploaded by artists from Firestore
    const q = query(collection(db, 'tracks'), where('isPublic', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let trackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter public tracks for listeners
      trackList = trackList.filter(t => t.isPublic !== false);

      // Client-side sorting by createdAt timestamp
      trackList.sort((a, b) => {
        const getTime = (val) => {
          if (!val) return 0;
          if (val.toDate) return val.toDate().getTime();
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime() || 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });

      setTracks(trackList);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch artist profile tracks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handlePlayTrack = (track) => {
    const playerTrack = {
      id: track.id,
      title: track.title,
      artist: userProfile?.displayName || 'Selah Grace',
      album: track.genre || 'Single',
      img: track.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100",
      audioUrl: track.audioUrl
    };
    playTrack(playerTrack);
  };

  const handlePlayRadio = () => {
    if (tracks.length > 0) {
      handlePlayTrack(tracks[0]);
    } else {
      showToast("No uploaded tracks in your profile playlist yet. Head to Creator Studio to upload your first track!", "info");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const heroStyle = userProfile?.heroUrl ? {
    backgroundImage: `url(${userProfile.heroUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  return (
    <div className="artist-profile">

      {/* Hero Section */}
      <div className="artist-hero-desktop" style={heroStyle}>
        <div className="hero-overlay"></div>
        <div className="artist-hero-content flex items-center gap-6 flex-wrap">
          <img
            src={userProfile?.avatarUrl || 'https://i.pravatar.cc/300?img=11'}
            alt={userProfile?.displayName || 'Artist Avatar'}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid white',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              flexShrink: 0
            }}
          />
          <div>
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs mb-2">
              <span className="material-symbols-outlined fill-icon" style={{ fontSize: '16px' }}>verified</span>
              VERIFIED ARTIST
            </div>

            <h1 className="m-0 text-white font-headline" style={{ fontSize: '42px' }}>{userProfile?.displayName || "Selah Grace"}</h1>
            <p className="italic text-white mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', opacity: 0.95 }}>
              {userProfile?.tagline || "Modern Worship & Ethereal Melodies"}
            </p>
            {userProfile?.location && (
              <p className="text-xs text-white opacity-80 m-0 mb-4 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                {userProfile.location}
              </p>
            )}
          </div>

          <div className="flex gap-6 mb-xl" style={{ marginLeft: 'auto' }}>
            <div>
              <h2 className="m-0 text-white" style={{ fontFamily: "'Geist', sans-serif" }}>{tracks.length}</h2>
              <p className="text-xs uppercase tracking-wider font-bold m-0 text-white opacity-80">Uploaded Songs</p>
            </div>
            <div>
              <h2 className="m-0 text-white" style={{ fontFamily: "'Geist', sans-serif" }}>450K</h2>
              <p className="text-xs uppercase tracking-wider font-bold m-0 text-white opacity-80">Followers</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap mt-6" style={{ position: 'relative', zIndex: 3 }}>
          <button className="btn btn-primary btn-pill with-icon" style={{ padding: '12px 32px' }} onClick={handlePlayRadio}>
            <span className="material-symbols-outlined fill-icon">
              {currentTrack && isPlaying ? 'pause' : 'play_arrow'}
            </span>
            PLAY RADIO
          </button>
          <button className="btn btn-pill outline text-white" style={{ padding: '12px 48px', borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}>
            FOLLOW
          </button>
          {onOpenSettings && (
            <button
              className="btn btn-pill outline with-icon text-white"
              style={{ padding: '12px 28px', backgroundColor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
              onClick={onOpenSettings}
            >
              <span className="material-symbols-outlined">tune</span>
              EDIT PROFILE
            </button>
          )}
        </div>
      </div>

      <div className="desktop-col-layout">
        {/* Left Column */}
        <div className="left-col">

          <div className="flex justify-between items-center mb-4">
            <h3>Uploaded Tracks</h3>
            {tracks.length > 0 && (
              <span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer">
                {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="card text-center py-6 mb-xl">
              <p className="text-xs text-outline m-0">Loading tracks...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="card text-center py-8 mb-xl" style={{ border: '1px dashed var(--color-outline)', background: 'transparent', borderRadius: '12px' }}>
              <span className="material-symbols-outlined text-outline mb-2" style={{ fontSize: '36px' }}>library_music</span>
              <p className="text-sm font-bold m-0" style={{ color: 'var(--color-on-surface)' }}>Blank Slate — No uploaded songs yet</p>
              <p className="text-xs text-outline m-0 mt-1">Upload your audio tracks in Creator Studio to populate your artist profile playlist.</p>
            </div>
          ) : (
            <div className="flex-col gap-2 mb-xl">
              {tracks.map((track, idx) => {
                const num = String(idx + 1).padStart(2, '0');
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div key={track.id} className="track-row" onClick={() => handlePlayTrack(track)} style={{ cursor: 'pointer' }}>
                    <span className="track-num text-sm">{num}</span>
                    <img
                      src={track.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100"}
                      alt={track.title}
                      className="track-img"
                    />
                    <div className="flex-1">
                      <h4 style={{ color: isCurrent ? 'var(--color-primary)' : 'inherit' }}>{track.title}</h4>
                      <p className="text-xs text-outline m-0 flex items-center gap-2">
                        <span>{(track.playCount || track.play_count || 0).toLocaleString()} plays</span>
                        {track.credits && (
                          <>
                            <span>•</span>
                            <span className="italic" style={{ color: 'var(--color-primary)' }}>{track.credits}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <span className="text-xs text-outline">{formatDuration(track.duration)}</span>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center mb-4 mt-xl">
            <h3>Discography</h3>
            <div className="flex bg-surface-container" style={{ borderRadius: '99px', background: 'var(--color-surface-container)', padding: '4px' }}>
              <button className="btn btn-pill bg-white text-xs py-1 px-4" style={{ padding: '6px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>Releases</button>
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="card text-center py-6" style={{ border: '1px dashed var(--color-outline)', background: 'transparent', borderRadius: '12px' }}>
              <p className="text-xs text-outline m-0">No releases published yet.</p>
            </div>
          ) : (
            <div className="grid-3col">
              {tracks.map(track => (
                <div key={track.id} className="album-card" onClick={() => handlePlayTrack(track)} style={{ cursor: 'pointer' }}>
                  <img
                    src={track.artworkUrl || "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=400"}
                    alt={track.title}
                  />
                  <h4 className="text-sm">{track.title}</h4>
                  <p className="text-xs text-outline m-0">{track.genre || 'Single'}</p>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* Right Column */}
        <div className="right-col">

          <div className="card mb-xl">
            <h3 className="mb-4">About the Artist</h3>
            <p className="text-sm text-outline" style={{ lineHeight: '1.6' }}>
              {userProfile?.bio || "Selah Grace is a multi-award winning worship leader and songwriter known for her ethereal melodies. Born in Nashville and raised in the choral traditions of the South, she blends classical foundations with modern ambient sounds to create a sacred space for listening."}
            </p>
            <div className="flex gap-4 mt-4 mb-xl">
              <button className="icon-btn-circle outline"><span className="material-symbols-outlined">public</span></button>
              <button className="icon-btn-circle outline"><span className="material-symbols-outlined">share</span></button>
            </div>

            <div className="grid-2col mt-4">
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider m-0">Global Rank</p>
                <h2 className="m-0 flex items-baseline gap-1"><span className="text-outline font-normal">#</span>42</h2>
              </div>
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider m-0">Concerts</p>
                <h2 className="m-0">15</h2>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--color-surface-container)' }}>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">Upcoming Tour</p>

            <div className="tour-card bg-white mb-3">
              <div>
                <p className="text-xs font-bold m-0 text-outline">OCT 24</p>
                <h4 className="text-sm m-0">Red Rocks Amphitheatre</h4>
                <p className="text-xs text-outline m-0">Morrison, CO</p>
              </div>
              <button className="btn btn-pill outline text-xs py-1" style={{ padding: '6px 16px', borderColor: 'var(--color-outline)' }}>TICKETS</button>
            </div>

            <div className="tour-card bg-white">
              <div>
                <p className="text-xs font-bold m-0 text-outline">NOV 02</p>
                <h4 className="text-sm m-0">Ryman Auditorium</h4>
                <p className="text-xs text-outline m-0">Nashville, TN</p>
              </div>
              <button className="btn btn-pill outline text-xs py-1" style={{ padding: '6px 16px', borderColor: 'var(--color-outline)' }}>TICKETS</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ArtistProfile;
