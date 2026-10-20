import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAudio } from '../context/AudioProvider';
import { useToast } from '../context/ToastContext';

const ARTIST_DIRECTORY = {
  'brandon robinson': {
    displayName: 'Brandon Robinson',
    tagline: 'Modern Worship & Ethereal Melodies',
    location: 'Atlanta, GA',
    followers: '620K',
    rank: 18,
    concerts: 22,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    heroUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1600',
    bio: 'Brandon Robinson is a visionary Christian producer, vocalist, and multi-instrumentalist blending sacred worship traditions with atmospheric modern production.',
    curatedTracks: [
      { id: 'br-1', title: 'Heaven on Earth', genre: 'Worship', duration: 234, playCount: 412890, artworkUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
      { id: 'br-2', title: 'Ascension Reflections', genre: 'Single', duration: 218, playCount: 284100, artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 'br-3', title: 'Lies (feat. Selah Grace)', genre: 'Worship', duration: 245, playCount: 530400, credits: 'ft. Selah Grace', artworkUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
    ]
  },
  'selah grace': {
    displayName: 'Selah Grace',
    tagline: 'Modern Worship & Ethereal Melodies',
    location: 'Nashville, TN',
    followers: '450K',
    rank: 42,
    concerts: 15,
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    heroUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=1600',
    bio: 'Selah Grace is a multi-award winning worship leader and songwriter known for her ethereal melodies. Born in Nashville and raised in the choral traditions of the South, she blends classical foundations with modern ambient sounds to create a sacred space for listening.',
    curatedTracks: [
      { id: 'sg-1', title: 'Cathedral Light', genre: 'Heirwave', duration: 252, playCount: 389200, artworkUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
      { id: 'sg-2', title: 'Eden Gardens & Rain', genre: 'Album', duration: 274, playCount: 310500, artworkUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' }
    ]
  },
  'brandon lake': {
    displayName: 'Brandon Lake',
    tagline: 'Anthemic Praise & Revival Sound',
    location: 'Charleston, SC',
    followers: '1.8M',
    rank: 7,
    concerts: 34,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    heroUrl: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=1600',
    bio: 'Brandon Lake is a Grammy-winning worship artist and songwriter crafting passionate anthems of gratitude, revival, and faith.',
    curatedTracks: [
      { id: 'bl-1', title: 'Gratitude', genre: 'Worship', duration: 338, playCount: 1920400, artworkUrl: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
      { id: 'bl-2', title: 'House of Miracles (Deluxe)', genre: 'Album', duration: 289, playCount: 945000, artworkUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' }
    ]
  },
  'elijah king': {
    displayName: 'Elijah King',
    tagline: 'ZionSoul & Sacred R&B Harmonies',
    location: 'Chicago, IL',
    followers: '310K',
    rank: 54,
    concerts: 12,
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    heroUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=1600',
    bio: 'Elijah King bridges soulful gospel heritage with warm contemporary R&B textures and deeply reflective lyricism.',
    curatedTracks: [
      { id: 'ek-1', title: 'Grace Flows', genre: 'ZionSoul', duration: 221, playCount: 418000, artworkUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
      { id: 'ek-2', title: 'Silver Lining Hymns', genre: 'Album', duration: 248, playCount: 267300, artworkUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' }
    ]
  },
  'cece winans': {
    displayName: 'CeCe Winans',
    tagline: 'Timeless Gospel & Sacred Grace',
    location: 'Nashville, TN',
    followers: '2.4M',
    rank: 4,
    concerts: 28,
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600',
    heroUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600',
    bio: 'CeCe Winans is one of the most celebrated gospel vocalists in history, inspiring generations with songs of faith, worship, and unwavering devotion.',
    curatedTracks: [
      { id: 'cw-1', title: 'Goodness of God', genre: 'Gospel', duration: 298, playCount: 3150000, artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
      { id: 'cw-2', title: 'Ethereal Dawn EP', genre: 'EP', duration: 265, playCount: 840000, artworkUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
    ]
  },
  'zion worship': {
    displayName: 'Zion Worship',
    tagline: 'Communal Praise & Sanctuary Soundscapes',
    location: 'Denver, CO',
    followers: '520K',
    rank: 29,
    concerts: 19,
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    heroUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=1600',
    bio: 'Zion Worship is a collective of worship leaders and ambient musicians creating immersive congregational praise experiences.',
    curatedTracks: [
      { id: 'zw-1', title: 'Sacred Morning', genre: 'Worship', duration: 260, playCount: 615000, artworkUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' }
    ]
  },
  'tasha cobbs leonard': {
    displayName: 'Tasha Cobbs Leonard',
    tagline: 'Powerhouse Gospel & Prophetic Worship',
    location: 'Atlanta, GA',
    followers: '2.1M',
    rank: 6,
    concerts: 25,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    heroUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=1600',
    bio: 'Tasha Cobbs Leonard is an internationally acclaimed gospel powerhouse whose anthems have transformed modern praise around the globe.',
    curatedTracks: [
      { id: 'tc-1', title: 'Break Every Chain', genre: 'Gospel', duration: 312, playCount: 2890000, artworkUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3' }
    ]
  }
};

const ArtistProfile = ({ userProfile, selectedArtist, onBack, onOpenSettings }) => {
  const { showToast } = useToast();
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { playTrack, currentTrack, isPlaying } = useAudio();

  // Resolve which artist profile is being viewed
  const activeProfile = useMemo(() => {
    if (!selectedArtist) {
      return {
        displayName: userProfile?.displayName || 'Selah Grace',
        tagline: userProfile?.tagline || 'Modern Worship & Ethereal Melodies',
        location: userProfile?.location || 'Nashville, TN',
        followers: '450K',
        rank: 42,
        concerts: 15,
        avatarUrl: userProfile?.avatarUrl || 'https://i.pravatar.cc/300?img=11',
        heroUrl: userProfile?.heroUrl || '',
        bio: userProfile?.bio || ARTIST_DIRECTORY['selah grace'].bio,
        curatedTracks: [],
        isOwnProfile: true
      };
    }

    const rawName = (selectedArtist.name || selectedArtist.displayName || 'Selah Grace').trim();
    const key = rawName.toLowerCase();
    const directoryEntry = ARTIST_DIRECTORY[key];

    if (directoryEntry) {
      return {
        ...directoryEntry,
        avatarUrl: selectedArtist.avatarUrl || directoryEntry.avatarUrl,
        isOwnProfile: Boolean(
          userProfile?.displayName &&
          userProfile.displayName.toLowerCase() === key
        )
      };
    }

    return {
      displayName: rawName,
      tagline: 'Featured Sanctuary Recording Artist',
      location: 'Nashville, TN',
      followers: '185K',
      rank: 64,
      concerts: 9,
      avatarUrl: selectedArtist.avatarUrl || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
      heroUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1600',
      bio: `${rawName} is a featured recording artist on TrinitySound, crafting sacred melodies and contemporary worship soundscapes.`,
      curatedTracks: selectedArtist.featuredTrack ? [selectedArtist.featuredTrack] : [
        {
          id: `curated-${key.replace(/\s+/g, '-')}`,
          title: 'Sanctuary Sessions (Live)',
          genre: 'Worship',
          duration: 242,
          playCount: 142000,
          artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400',
          audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
        }
      ],
      isOwnProfile: false
    };
  }, [selectedArtist, userProfile]);

  useEffect(() => {
    const q = query(collection(db, 'tracks'), where('isPublic', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let trackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      trackList = trackList.filter(t => t.isPublic !== false);

      trackList.sort((a, b) => {
        const getTime = (val) => {
          if (!val) return 0;
          if (val.toDate) return val.toDate().getTime();
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime() || 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });

      setUploadedTracks(trackList);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch artist profile tracks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter tracks for the active artist profile, merging Firestore uploads with curated catalog tracks
  const tracks = useMemo(() => {
    if (!selectedArtist) {
      return uploadedTracks;
    }
    const targetName = activeProfile.displayName.toLowerCase();
    const matchingUploads = uploadedTracks.filter(t => {
      const trackArtist = (t.artist || t.artistName || 'Brandon Robinson').toLowerCase();
      const hasCollab = Array.isArray(t.collaborators) && t.collaborators.some(
        c => (c.displayName || '').toLowerCase().includes(targetName)
      );
      return trackArtist.includes(targetName) || hasCollab;
    });

    const existingTitles = new Set(matchingUploads.map(t => (t.title || '').toLowerCase()));
    const extras = (activeProfile.curatedTracks || []).filter(
      ct => !existingTitles.has((ct.title || '').toLowerCase())
    );
    return [...matchingUploads, ...extras];
  }, [uploadedTracks, selectedArtist, activeProfile]);

  const handlePlayTrack = (track) => {
    const playerTrack = {
      id: track.id,
      title: track.title,
      artist: activeProfile.displayName,
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
      showToast("No uploaded tracks in this profile playlist yet.", "info");
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '3:45';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const heroStyle = activeProfile.heroUrl ? {
    backgroundImage: `url(${activeProfile.heroUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center'
  } : {};

  return (
    <div className="artist-profile fade-in">

      {/* Back Navigation when viewing an artist from Listen Now */}
      {selectedArtist && onBack && (
        <div className="mb-4 mt-2">
          <button
            type="button"
            className="btn btn-pill outline btn-xs with-icon"
            onClick={onBack}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            Back to Listen Now
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="artist-hero-desktop" style={heroStyle}>
        <div className="hero-overlay"></div>
        <div className="artist-hero-content flex items-center gap-6 flex-wrap" style={{ maxWidth: '100%', width: '100%' }}>
          <img
            src={activeProfile.avatarUrl}
            alt={activeProfile.displayName}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid rgba(255,255,255,0.25)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
              flexShrink: 0
            }}
          />
          <div>
            <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs mb-2">
              <span className="material-symbols-outlined fill-icon" style={{ fontSize: '16px' }}>verified</span>
              VERIFIED ARTIST
            </div>

            <h1 className="m-0 text-white font-headline" style={{ fontSize: '42px' }}>{activeProfile.displayName}</h1>
            <p className="italic text-white mb-3" style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', opacity: 0.9 }}>
              {activeProfile.tagline}
            </p>
            {activeProfile.location && (
              <p className="text-xs text-white opacity-80 m-0 mb-4 flex items-center gap-1">
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>location_on</span>
                {activeProfile.location}
              </p>
            )}
          </div>

          <div className="flex gap-6 mb-xl" style={{ marginLeft: 'auto' }}>
            <div>
              <h2 className="m-0 text-white" style={{ fontFamily: "'Geist', sans-serif" }}>{tracks.length}</h2>
              <p className="text-xs uppercase tracking-wider font-bold m-0 text-white opacity-80">Songs</p>
            </div>
            <div>
              <h2 className="m-0 text-white" style={{ fontFamily: "'Geist', sans-serif" }}>{activeProfile.followers}</h2>
              <p className="text-xs uppercase tracking-wider font-bold m-0 text-white opacity-80">Followers</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap mt-6" style={{ position: 'relative', zIndex: 3 }}>
          <button className="btn btn-primary btn-pill with-icon" onClick={handlePlayRadio}>
            <span className="material-symbols-outlined fill-icon">
              {currentTrack && isPlaying ? 'pause' : 'play_arrow'}
            </span>
            PLAY RADIO
          </button>
          <button className="btn btn-pill outline">
            FOLLOW
          </button>
          {onOpenSettings && activeProfile.isOwnProfile && (
            <button
              className="btn btn-pill outline with-icon"
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
            <h3>Popular & Uploaded Tracks</h3>
            {tracks.length > 0 && (
              <span className="text-primary text-xs font-bold uppercase tracking-wider">
                {tracks.length} {tracks.length === 1 ? 'Track' : 'Tracks'}
              </span>
            )}
          </div>

          {loading ? (
            <div className="card text-center py-6 mb-xl">
              <p className="text-xs text-outline m-0">Loading tracks...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="card text-center py-8 mb-xl" style={{ border: '1px dashed var(--color-outline-variant)', background: 'transparent', borderRadius: '12px' }}>
              <span className="material-symbols-outlined text-outline mb-2" style={{ fontSize: '36px' }}>library_music</span>
              <p className="text-sm font-bold m-0" style={{ color: 'var(--color-on-surface)' }}>Blank Slate — No uploaded songs yet</p>
              <p className="text-xs text-outline m-0 mt-1">Upload your audio tracks in Creator Studio to populate your artist profile playlist.</p>
            </div>
          ) : (
            <div className="flex-col gap-2 mb-xl">
              {tracks.map((track, idx) => {
                const num = String(idx + 1).padStart(2, '0');
                const isCurrent = currentTrack?.id === track.id || currentTrack?.title === track.title;
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
              <button className="btn btn-pill bg-white text-xs py-1 px-4" style={{ padding: '6px 16px' }}>Releases</button>
            </div>
          </div>

          {tracks.length === 0 ? (
            <div className="card text-center py-6" style={{ border: '1px dashed var(--color-outline-variant)', background: 'transparent', borderRadius: '12px' }}>
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
              {activeProfile.bio}
            </p>
            <div className="flex gap-3 mt-4 mb-xl">
              <button className="icon-btn-circle outline"><span className="material-symbols-outlined">public</span></button>
              <button className="icon-btn-circle outline"><span className="material-symbols-outlined">share</span></button>
            </div>

            <div className="grid-2col mt-4">
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider m-0">Global Rank</p>
                <h2 className="m-0 flex items-baseline gap-1"><span className="text-outline font-normal">#</span>{activeProfile.rank}</h2>
              </div>
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider m-0">Concerts</p>
                <h2 className="m-0">{activeProfile.concerts}</h2>
              </div>
            </div>
          </div>

          <div className="card">
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">Upcoming Tour</p>

            <div className="tour-card bg-white mb-3">
              <div>
                <p className="text-xs font-bold m-0 text-outline">OCT 24</p>
                <h4 className="text-sm m-0">Red Rocks Amphitheatre</h4>
                <p className="text-xs text-outline m-0">Morrison, CO</p>
              </div>
              <button className="btn btn-pill outline text-xs py-1" style={{ padding: '6px 16px' }}>TICKETS</button>
            </div>

            <div className="tour-card bg-white">
              <div>
                <p className="text-xs font-bold m-0 text-outline">NOV 02</p>
                <h4 className="text-sm m-0">Ryman Auditorium</h4>
                <p className="text-xs text-outline m-0">Nashville, TN</p>
              </div>
              <button className="btn btn-pill outline text-xs py-1" style={{ padding: '6px 16px' }}>TICKETS</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ArtistProfile;
