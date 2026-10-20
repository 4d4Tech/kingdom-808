import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAudio } from '../context/AudioProvider';

const TRENDING_FALLBACK_SONGS = [
  {
    id: 'trending-1',
    title: 'Lies (feat. Selah Grace)',
    artist: 'Brandon Robinson, Selah Grace',
    genre: 'Worship',
    artworkUrl: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'trending-2',
    title: 'Sacred Sanctuary',
    artist: 'Tate Grace',
    genre: 'Heirwave',
    artworkUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'trending-3',
    title: 'expectations (feat. Zion Choir)',
    artist: 'Olivia Faith, Zion Choir',
    genre: 'ZionSoul',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: 'trending-4',
    title: 'Flower In A Hurricane (feat. Kingdom Collective)',
    artist: 'Justice, Kingdom Collective, SZA',
    genre: 'Glowstep',
    badge: 'HI-FI',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'trending-5',
    title: '60 Psalms',
    artist: 'LUCKI GRACE',
    genre: 'CHH',
    badge: 'E',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'trending-6',
    title: 'Think of You (Selah)',
    artist: 'KETTAMA, Prospa, Rohan Pinnock-Hamilton',
    genre: 'Upperground',
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  },
  {
    id: 'trending-7',
    title: 'Still Waters Run Deep',
    artist: 'Ashe & The Sanctuary',
    genre: 'Antha',
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
  },
  {
    id: 'trending-8',
    title: 'Oceans of Mercy',
    artist: 'Hillsong UNITED, Brandon Lake',
    genre: 'Worship',
    artworkUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  }
];

const POPULAR_ARTISTS_LIST = [
  {
    id: 'artist-brandon-robinson',
    name: 'Brandon Robinson',
    role: 'Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600',
    featuredTrack: {
      id: 'artist-track-brandon',
      title: 'Heaven on Earth',
      artist: 'Brandon Robinson',
      genre: 'Worship',
      artworkUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
    }
  },
  {
    id: 'artist-selah-grace',
    name: 'Selah Grace',
    role: 'Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600',
    featuredTrack: {
      id: 'artist-track-selah',
      title: 'Cathedral Light',
      artist: 'Selah Grace',
      genre: 'Heirwave',
      artworkUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
    }
  },
  {
    id: 'artist-brandon-lake',
    name: 'Brandon Lake',
    role: 'Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
    featuredTrack: {
      id: 'artist-track-lake',
      title: 'Gratitude',
      artist: 'Brandon Lake',
      genre: 'Worship',
      artworkUrl: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    }
  },
  {
    id: 'artist-elijah-king',
    name: 'Elijah King',
    role: 'Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
    featuredTrack: {
      id: 'artist-track-elijah',
      title: 'Grace Flows',
      artist: 'Elijah King',
      genre: 'ZionSoul',
      artworkUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
    }
  },
  {
    id: 'artist-cece-winans',
    name: 'CeCe Winans',
    role: 'Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=600',
    featuredTrack: {
      id: 'artist-track-cece',
      title: 'Goodness of God',
      artist: 'CeCe Winans',
      genre: 'Gospel',
      artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
    }
  },
  {
    id: 'artist-zion-collective',
    name: 'Zion Worship',
    role: 'Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
    featuredTrack: {
      id: 'artist-track-zion',
      title: 'Sacred Morning',
      artist: 'Zion Worship',
      genre: 'Worship',
      artworkUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
    }
  },
  {
    id: 'artist-tasha-cobbs',
    name: 'Tasha Cobbs Leonard',
    role: 'Artist',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600',
    featuredTrack: {
      id: 'artist-track-tasha',
      title: 'Break Every Chain',
      artist: 'Tasha Cobbs Leonard',
      genre: 'Gospel',
      artworkUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3'
    }
  }
];

const POPULAR_ALBUMS_AND_SINGLES = [
  {
    id: 'album-1',
    title: 'House of Miracles (Deluxe)',
    artist: 'Brandon Lake',
    type: 'Album',
    year: '2026',
    artworkUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: 'album-2',
    title: 'Eden Gardens & Rain',
    artist: 'Selah Grace',
    type: 'Album',
    year: '2026',
    artworkUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  },
  {
    id: 'album-3',
    title: '10 Hours of Continuous Worship Soaking Pads',
    artist: 'Trinity Ambient Sanctuary',
    type: 'Album',
    year: '2026',
    artworkUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 'album-4',
    title: 'Ascension Reflections',
    artist: 'Brandon Robinson',
    type: 'Single',
    year: '2026',
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: 'album-5',
    title: 'Silver Lining Hymns',
    artist: 'Zion Worship, Elijah King',
    type: 'Album',
    year: '2025',
    artworkUrl: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  },
  {
    id: 'album-6',
    title: 'Midnight Sanctuary Lights',
    artist: 'Kingdom Voices',
    type: 'Single',
    year: '2026',
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3'
  },
  {
    id: 'album-7',
    title: 'Ethereal Dawn EP',
    artist: 'CeCe Winans, Selah Grace',
    type: 'EP',
    year: '2026',
    artworkUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  }
];

const ALL_GENRES = [
  { name: 'Worship', desc: 'Deep reflection and communal praise.', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600' },
  { name: 'Glowstep', desc: 'Luminous synth melodies & ambient bass.', img: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=600' },
  { name: 'ZionSoul', desc: 'Soulful rhythms rooted in divine grace.', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600' },
  { name: 'Heirwave', desc: 'Ethereal ambient pads and vocal harmonies.', img: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&q=80&w=600' },
  { name: 'Rhema&B', desc: 'Contemporary R&B laced with sacred truth.', img: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=600' },
  { name: 'ZionDrill', desc: 'Energetic urban drill with spiritual lyrics.', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600' },
  { name: 'Upperground', desc: 'Uplifting house & electronic worship.', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600' },
  { name: 'Gospel', desc: 'The heartbeat of tradition, choir & soul.', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600' },
  { name: 'Antha', desc: 'Atmospheric acoustic & instrumental devotion.', img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=600' },
  { name: 'CHH', desc: 'Bold truth through urban hip hop rhythm.', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600' },
  { name: 'Ambient', desc: 'Peaceful instrumental soundscapes.', img: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=600' }
];

const Discover = () => {
  const [uploadedTracks, setUploadedTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenreFilter, setSelectedGenreFilter] = useState('All');
  const [selectedArtistFilter, setSelectedArtistFilter] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    trending: false,
    artists: false,
    albums: false
  });
  const { playTrack, togglePlay, currentTrack, isPlaying, setQueue } = useAudio();

  const toggleSectionExpand = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  useEffect(() => {
    // Real-time query to fetch all public artist tracks from Firestore
    const q = query(collection(db, 'tracks'), where('isPublic', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let trackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Filter public tracks for all visitors & listeners
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

      setUploadedTracks(trackList);
      setLoading(false);
    }, (err) => {
      console.error("Failed to fetch tracks in Discover page:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatTrackForPlayer = (track) => ({
    id: track.id || track.title.toLowerCase().replace(/\s+/g, '-'),
    title: track.title,
    artist: track.artist || track.artistName || 'Brandon Robinson',
    album: track.genre || track.type || 'Single',
    img: track.artworkUrl || track.img || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400",
    audioUrl: track.audioUrl || "https://codeskulptor-demos.commondatastorage.googleapis.com/desolate_shores/desolate_shores.mp3"
  });

  const handlePlayChartTrack = (track, queueList = []) => {
    if (!track) return;
    const formatted = formatTrackForPlayer(track);
    if (currentTrack && (currentTrack.id === formatted.id || currentTrack.title === formatted.title)) {
      togglePlay();
      return;
    }
    playTrack(formatted);
    if (Array.isArray(queueList) && queueList.length > 0 && setQueue) {
      const remaining = queueList
        .filter(item => (item.id || item.title) !== (track.id || track.title))
        .map(formatTrackForPlayer);
      setQueue(remaining);
    }
  };

  // Merge uploaded community tracks with curated trending songs
  const trendingSongs = useMemo(() => {
    const formattedUploads = uploadedTracks.map(t => ({
      id: t.id,
      title: t.title,
      artist: [
        t.artist || t.artistName || 'Brandon Robinson',
        ...(Array.isArray(t.collaborators) ? t.collaborators.map(c => c.displayName).filter(Boolean) : [])
      ].join(', '),
      genre: t.genre || 'Worship',
      artworkUrl: t.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600",
      audioUrl: t.audioUrl
    }));
    const existingTitles = new Set(formattedUploads.map(t => t.title?.toLowerCase()));
    const fallbacks = TRENDING_FALLBACK_SONGS.filter(t => !existingTitles.has(t.title.toLowerCase()));
    return [...formattedUploads, ...fallbacks];
  }, [uploadedTracks]);

  // Link popular artists to any uploaded tracks they own
  const popularArtists = useMemo(() => {
    return POPULAR_ARTISTS_LIST.map(artist => {
      const matchingUpload = uploadedTracks.find(t => {
        const trackArtist = (t.artist || t.artistName || '').toLowerCase();
        return trackArtist.includes(artist.name.toLowerCase());
      });
      return {
        ...artist,
        featuredTrack: matchingUpload || artist.featuredTrack
      };
    });
  }, [uploadedTracks]);

  // Merge albums & singles with uploaded releases
  const popularAlbums = useMemo(() => {
    const uploadedReleases = uploadedTracks.slice(0, 3).map(t => ({
      id: `release-${t.id}`,
      title: t.title,
      artist: t.artist || t.artistName || 'Brandon Robinson',
      type: t.genre || 'Single',
      year: '2026',
      artworkUrl: t.artworkUrl || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=600",
      audioUrl: t.audioUrl
    }));
    const existingTitles = new Set(uploadedReleases.map(r => r.title?.toLowerCase()));
    const fallbacks = POPULAR_ALBUMS_AND_SINGLES.filter(a => !existingTitles.has(a.title.toLowerCase()));
    return [...uploadedReleases, ...fallbacks];
  }, [uploadedTracks]);

  // Helper: Find tracks belonging to a genre
  const getTracksForGenre = (genreName) => {
    return uploadedTracks.filter(t => {
      if (!t.genre) return false;
      const g = t.genre.toLowerCase();
      const target = genreName.toLowerCase();
      return g === target || (target === 'chh' && g.includes('hip hop'));
    });
  };

  // Filtered tracks list if user selected a genre or artist filter
  const displayedTracks = useMemo(() => {
    let base = selectedGenreFilter === 'All'
      ? uploadedTracks
      : getTracksForGenre(selectedGenreFilter);

    if (selectedArtistFilter) {
      base = base.filter(t => {
        const a = (t.artist || t.artistName || 'Brandon Robinson').toLowerCase();
        return a.includes(selectedArtistFilter.toLowerCase());
      });
    }
    return base;
  }, [uploadedTracks, selectedGenreFilter, selectedArtistFilter]);

  // Select hero track
  const heroTrack = displayedTracks.length > 0 ? displayedTracks[0] : (uploadedTracks[0] || null);

  return (
    <div className="discover-page fade-in">
      
      {/* Header Banner */}
      <div className="mb-8 mt-4 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline" style={{ fontSize: '44px', marginBottom: '8px' }}>Listen Now</h1>
          <p className="italic text-outline m-0" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px' }}>
            Discover celestial melodies, top charting worship, and divine Christian excellence.
          </p>
        </div>
        {(uploadedTracks.length > 0 || selectedGenreFilter !== 'All' || selectedArtistFilter) && (
          <div className="flex gap-2 items-center flex-wrap">
            {uploadedTracks.length > 0 && (
              <span className="badge" style={{ backgroundColor: 'rgba(0, 93, 144, 0.1)', color: 'var(--color-primary)', padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold' }}>
                🎵 {uploadedTracks.length} Artist Tracks Online
              </span>
            )}
            {selectedGenreFilter !== 'All' && (
              <button 
                type="button" 
                className="btn btn-pill outline btn-xs"
                onClick={() => setSelectedGenreFilter('All')}
              >
                Clear Genre ({selectedGenreFilter})
              </button>
            )}
            {selectedArtistFilter && (
              <button 
                type="button" 
                className="btn btn-pill outline btn-xs"
                onClick={() => setSelectedArtistFilter(null)}
              >
                Clear Artist ({selectedArtistFilter})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Spotify-Style Home Shelves (Trending songs, Popular artists, Popular albums and singles) */}
      <div className="spotify-home-shelves mb-xl">
        
        {/* 1. Trending songs */}
        <section className="spotify-shelf-section" aria-label="Trending songs">
          <div className="spotify-shelf-header">
            <h2 className="spotify-shelf-title" onClick={() => toggleSectionExpand('trending')}>
              Trending songs
            </h2>
            <button
              type="button"
              className="spotify-show-all-btn"
              onClick={() => toggleSectionExpand('trending')}
            >
              {expandedSections.trending ? 'Show less' : 'Show all'}
            </button>
          </div>

          <div className={`spotify-shelf-wrapper ${expandedSections.trending ? 'is-expanded' : ''}`}>
            <div className={expandedSections.trending ? 'spotify-shelf-grid' : 'spotify-shelf-row'}>
              {trendingSongs.map((song) => {
                const isThisTrack = currentTrack && (currentTrack.id === song.id || currentTrack.title === song.title);
                const isActivePlaying = isThisTrack && isPlaying;

                return (
                  <div
                    key={song.id}
                    className={`spotify-media-card ${isThisTrack ? 'is-active' : ''}`}
                    onClick={() => handlePlayChartTrack(song, trendingSongs)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePlayChartTrack(song, trendingSongs);
                      }
                    }}
                  >
                    <div className="spotify-card-artwork-wrap">
                      <img
                        src={song.artworkUrl}
                        alt={song.title}
                        className="spotify-card-artwork"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className={`spotify-card-play-btn ${isActivePlaying ? 'playing' : ''}`}
                        aria-label={isActivePlaying ? `Pause ${song.title}` : `Play ${song.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayChartTrack(song, trendingSongs);
                        }}
                      >
                        <span className="material-symbols-outlined fill-icon">
                          {isActivePlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                    </div>
                    <div className="spotify-card-meta">
                      <h4 className="spotify-card-title" title={song.title}>{song.title}</h4>
                      <p className="spotify-card-subtitle" title={song.artist}>
                        {song.badge && (
                          <span className="spotify-explicit-badge">{song.badge}</span>
                        )}
                        <span>{song.artist}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. Popular artists */}
        <section className="spotify-shelf-section" aria-label="Popular artists">
          <div className="spotify-shelf-header">
            <h2 className="spotify-shelf-title" onClick={() => toggleSectionExpand('artists')}>
              Popular artists
            </h2>
            <button
              type="button"
              className="spotify-show-all-btn"
              onClick={() => toggleSectionExpand('artists')}
            >
              {expandedSections.artists ? 'Show less' : 'Show all'}
            </button>
          </div>

          <div className={`spotify-shelf-wrapper ${expandedSections.artists ? 'is-expanded' : ''}`}>
            <div className={expandedSections.artists ? 'spotify-shelf-grid' : 'spotify-shelf-row'}>
              {popularArtists.map((artist) => {
                const track = artist.featuredTrack;
                const isThisArtistPlaying = currentTrack && (
                  currentTrack.id === track?.id ||
                  currentTrack.title === track?.title ||
                  (currentTrack.artist && currentTrack.artist.toLowerCase().includes(artist.name.toLowerCase()))
                );
                const isActivePlaying = isThisArtistPlaying && isPlaying;
                const isArtistFiltered = selectedArtistFilter === artist.name;

                return (
                  <div
                    key={artist.id}
                    className={`spotify-media-card artist-variant ${isThisArtistPlaying || isArtistFiltered ? 'is-active' : ''}`}
                    onClick={() => {
                      setSelectedArtistFilter(prev => prev === artist.name ? null : artist.name);
                      handlePlayChartTrack(track, trendingSongs);
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedArtistFilter(prev => prev === artist.name ? null : artist.name);
                        handlePlayChartTrack(track, trendingSongs);
                      }
                    }}
                  >
                    <div className="spotify-card-artwork-wrap circle-artwork">
                      <img
                        src={artist.avatarUrl}
                        alt={artist.name}
                        className="spotify-card-artwork circle"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className={`spotify-card-play-btn ${isActivePlaying ? 'playing' : ''}`}
                        aria-label={isActivePlaying ? `Pause ${artist.name}` : `Play ${artist.name}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayChartTrack(track, trendingSongs);
                        }}
                      >
                        <span className="material-symbols-outlined fill-icon">
                          {isActivePlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                    </div>
                    <div className="spotify-card-meta">
                      <h4 className="spotify-card-title" title={artist.name}>{artist.name}</h4>
                      <p className="spotify-card-subtitle">{artist.role || 'Artist'}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. Popular albums and singles */}
        <section className="spotify-shelf-section" aria-label="Popular albums and singles">
          <div className="spotify-shelf-header">
            <h2 className="spotify-shelf-title" onClick={() => toggleSectionExpand('albums')}>
              Popular albums and singles
            </h2>
            <button
              type="button"
              className="spotify-show-all-btn"
              onClick={() => toggleSectionExpand('albums')}
            >
              {expandedSections.albums ? 'Show less' : 'Show all'}
            </button>
          </div>

          <div className={`spotify-shelf-wrapper ${expandedSections.albums ? 'is-expanded' : ''}`}>
            <div className={expandedSections.albums ? 'spotify-shelf-grid' : 'spotify-shelf-row'}>
              {popularAlbums.map((album) => {
                const isThisAlbum = currentTrack && (currentTrack.id === album.id || currentTrack.title === album.title);
                const isActivePlaying = isThisAlbum && isPlaying;

                return (
                  <div
                    key={album.id}
                    className={`spotify-media-card ${isThisAlbum ? 'is-active' : ''}`}
                    onClick={() => handlePlayChartTrack(album, popularAlbums)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handlePlayChartTrack(album, popularAlbums);
                      }
                    }}
                  >
                    <div className="spotify-card-artwork-wrap">
                      <img
                        src={album.artworkUrl}
                        alt={album.title}
                        className="spotify-card-artwork"
                        loading="lazy"
                      />
                      <button
                        type="button"
                        className={`spotify-card-play-btn ${isActivePlaying ? 'playing' : ''}`}
                        aria-label={isActivePlaying ? `Pause ${album.title}` : `Play ${album.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayChartTrack(album, popularAlbums);
                        }}
                      >
                        <span className="material-symbols-outlined fill-icon">
                          {isActivePlaying ? 'pause' : 'play_arrow'}
                        </span>
                      </button>
                    </div>
                    <div className="spotify-card-meta">
                      <h4 className="spotify-card-title" title={album.title}>{album.title}</h4>
                      <p className="spotify-card-subtitle" title={`${album.artist} • ${album.type}`}>
                        {album.year} • {album.artist}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

      </div>

      {/* Featured Community Artist Uploads Section */}
      <div className="mb-xl">
        <div className="flex justify-between items-baseline mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="m-0">
              {selectedGenreFilter === 'All' ? 'Artist Public Song Catalog' : `Artist Public Song Catalog — ${selectedGenreFilter}`}
            </h2>
            {selectedArtistFilter && (
              <span className="badge" style={{ backgroundColor: 'rgba(0, 93, 144, 0.1)', color: 'var(--color-primary)', fontSize: '11px' }}>
                Filtered by {selectedArtistFilter}
              </span>
            )}
          </div>
          <span className="text-primary text-xs font-bold uppercase tracking-wider">
            {displayedTracks.length} {displayedTracks.length === 1 ? 'Track' : 'Tracks'} Available to Stream
          </span>
        </div>

        {loading ? (
          <div className="card text-center py-6">
            <p className="text-xs text-outline m-0">Loading community tracks...</p>
          </div>
        ) : displayedTracks.length === 0 ? (
          <div className="card p-6 text-center" style={{ borderRadius: '16px', border: '1px dashed var(--color-outline-variant)' }}>
            <span className="material-symbols-outlined text-outline mb-2" style={{ fontSize: '36px' }}>library_music</span>
            <p className="text-sm font-bold m-0">
              {selectedArtistFilter
                ? `No community uploads by ${selectedArtistFilter} yet`
                : `No songs uploaded in ${selectedGenreFilter} yet`}
            </p>
            <p className="text-xs text-outline m-0 mt-1">Artists can upload audio tracks in Creator Studio to feature their music in this catalog.</p>
            {(selectedGenreFilter !== 'All' || selectedArtistFilter) && (
              <button
                type="button"
                className="btn btn-pill outline btn-xs mt-3"
                onClick={() => {
                  setSelectedGenreFilter('All');
                  setSelectedArtistFilter(null);
                }}
              >
                View All Uploaded Tracks
              </button>
            )}
          </div>
        ) : (
          <div className="grid-3col gap-6">
            {displayedTracks.map((track) => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div 
                  key={track.id} 
                  className="card p-4 hover-elevate cursor-pointer flex-col gap-3 track-card-with-bg"
                  onClick={() => handlePlayChartTrack(track)}
                  style={{ borderRadius: '20px', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden' }}
                >
                  {/* Track Art Background Layers */}
                  <div 
                    className="table-row-bg-image" 
                    style={{ backgroundImage: `url(${track.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400"})` }}
                  />
                  <div className="table-row-bg-overlay" />

                  <div style={{ position: 'relative', zIndex: 2, width: '100%', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden' }}>
                    <img 
                      src={track.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400"} 
                      alt={track.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button 
                      type="button" 
                      className="play-fab"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayChartTrack(track);
                      }}
                      style={{
                        position: 'absolute',
                        bottom: '12px',
                        right: '12px',
                        width: '48px',
                        height: '48px',
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        borderRadius: '50%',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
                        cursor: 'pointer'
                      }}
                    >
                      <span className="material-symbols-outlined fill-icon" style={{ fontSize: '28px' }}>
                        {isCurrent && isPlaying ? 'pause' : 'play_arrow'}
                      </span>
                    </button>
                  </div>

                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <h4 className="m-0 text-base font-bold truncate">{track.title}</h4>
                    <p className="text-xs text-outline m-0 mt-1 flex items-center justify-between">
                      <span className="font-semibold text-primary truncate" style={{ maxWidth: '75%' }}>
                        {track.artist || track.artistName || 'Brandon Robinson'}
                        {Array.isArray(track.collaborators) && track.collaborators.length > 0 && (
                          <span className="text-outline font-normal">
                            {' ft. ' + track.collaborators.map(c => c.displayName).join(', ')}
                          </span>
                        )}
                      </span>
                      <span className="badge outline text-xs" style={{ fontSize: '10px', padding: '2px 8px' }}>{track.genre || 'Worship'}</span>
                    </p>
                    {track.credits && (
                      <p className="text-xs text-outline italic m-0 mt-1 truncate">
                        {track.credits}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Hero Section & Climbers */}
      <div className="desktop-col-layout mb-xl" style={{ gap: '32px' }}>
        <div className="left-col">
          <div className="celestial-hero m-0" style={{ height: '100%', minHeight: '320px', borderRadius: '24px', overflow: 'hidden', position: 'relative' }}>
            <img 
              src={heroTrack?.artworkUrl || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200"} 
              alt={heroTrack?.title || "Heaven on Earth"} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
            <div className="celestial-overlay" style={{ padding: '44px' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '6px 16px', fontSize: '11px', fontWeight: 'bold', letterSpacing: '1px', borderRadius: '99px' }}>
                  FEATURED RELEASE #1
                </span>
                <h1 className="font-headline text-white mt-4 truncate" style={{ fontSize: '48px', marginBottom: '8px', fontStyle: 'italic' }}>
                  {heroTrack ? heroTrack.title : "Heaven on Earth"}
                </h1>
                <p className="text-white m-0" style={{ fontFamily: "'Geist', sans-serif", fontSize: '22px', fontWeight: 'bold', opacity: 0.9 }}>
                  {heroTrack ? (heroTrack.artist || "Brandon Robinson") : "Divinity Collective"}
                </p>
              </div>
              <button 
                type="button"
                className="play-fab" 
                onClick={() => handlePlayChartTrack(heroTrack || { title: 'Heaven on Earth', artist: 'Divinity Collective', img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400' })}
                style={{ position: 'absolute', bottom: '40px', right: '40px', width: '64px', height: '64px', backgroundColor: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.25)' }}
              >
                <span className="material-symbols-outlined fill-icon text-primary" style={{ fontSize: '36px' }}>
                  {currentTrack?.title === (heroTrack ? heroTrack.title : 'Heaven on Earth') && isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="right-col">
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">Fastest Climbers</p>
          <div className="flex-col gap-4">
            {(uploadedTracks.length > 1 ? uploadedTracks.slice(0, 3) : [
              { id: 'sacred-morning', rank: '02', title: 'Sacred Morning', artist: 'Zion Worship', img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=100' },
              { id: 'grace-flows', rank: '03', title: 'Grace Flows', artist: 'Elijah King', img: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=100' },
              { id: 'praise-rising', rank: '04', title: 'Praise Rising', artist: 'Kingdom Voices', img: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?auto=format&fit=crop&q=80&w=100' }
            ]).map((item, idx) => (
              <div 
                key={item.id || idx} 
                className="fastest-climbers-card cursor-pointer"
                onClick={() => handlePlayChartTrack(item)}
              >
                <span className="font-headline text-surface-container-highest" style={{ fontSize: '32px', fontStyle: 'italic' }}>
                  {String(idx + 2).padStart(2, '0')}
                </span>
                <img src={item.artworkUrl || item.img || "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=100"} alt={item.title} style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover' }} />
                <div className="flex-1">
                  <h4 className="m-0 text-sm">{item.title}</h4>
                  <p className="m-0 text-xs text-outline">{item.artist || 'Brandon Robinson'}</p>
                </div>
                <button type="button" className="icon-btn-circle outline small">
                  <span className="material-symbols-outlined text-sm">
                    {currentTrack?.title === item.title && isPlaying ? 'pause' : 'play_arrow'}
                  </span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Explore Created Genres Section */}
      <div className="mb-xl">
        <div className="flex justify-between items-baseline mb-4">
          <h2>Explore Trinity Genres</h2>
          <span className="text-primary text-xs font-bold uppercase tracking-wider">{ALL_GENRES.length} Genres Active</span>
        </div>

        <div className="genre-cards">
          {ALL_GENRES.map((g) => {
            const matchingTracks = getTracksForGenre(g.name);
            const songCount = matchingTracks.length;
            const hasUploads = songCount > 0;
            const isSelected = selectedGenreFilter === g.name;

            return (
              <div 
                key={g.name} 
                className={`genre-card ${isSelected ? 'active-genre-card' : ''}`}
                style={{
                  position: 'relative',
                  border: isSelected ? '3px solid var(--color-primary)' : (hasUploads ? '2px solid rgba(0,93,144,0.4)' : 'none')
                }}
              >
                {/* Upper Right Corner Song Count Badge */}
                {hasUploads && (
                  <span 
                    className="badge"
                    style={{ 
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      zIndex: 3,
                      backgroundColor: 'var(--color-primary)', 
                      color: 'white', 
                      padding: '6px 14px', 
                      borderRadius: '9999px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      letterSpacing: '0.05em',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>music_note</span>
                    {songCount} {songCount === 1 ? 'Song' : 'Songs'}
                  </span>
                )}

                <img src={g.img} alt={g.name} />
                <div className="overlay"></div>
                <div className="content">
                  
                  <h3 className="m-0 mb-1" style={{ fontSize: '28px' }}>{g.name}</h3>
                  <p className="text-sm mb-4" style={{ maxWidth: '90%', lineHeight: '1.4', opacity: 0.9 }}>
                    {g.desc}
                  </p>

                  {hasUploads && matchingTracks[0] && (
                    <p className="text-xs italic text-primary-fixed-dim m-0 mb-3 truncate" style={{ color: 'rgba(255,255,255,0.95)' }}>
                      Includes "{matchingTracks[0].title}" by {matchingTracks[0].artist || 'Brandon Robinson'}
                    </p>
                  )}

                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      className={`btn btn-pill ${hasUploads ? 'btn-primary' : 'outline text-white'}`}
                      onClick={() => {
                        if (hasUploads) {
                          handlePlayChartTrack(matchingTracks[0]);
                        } else {
                          setSelectedGenreFilter(g.name);
                        }
                      }}
                      style={{ 
                        borderColor: 'rgba(255,255,255,0.5)', 
                        backdropFilter: 'blur(4px)',
                        padding: '8px 20px',
                        fontSize: '12px'
                      }}
                    >
                      {hasUploads ? `Play ${g.name}` : `Explore ${g.name}`}
                    </button>
                    <button 
                      type="button"
                      className="btn btn-pill outline text-white"
                      onClick={() => setSelectedGenreFilter(g.name)}
                      style={{ 
                        borderColor: 'rgba(255,255,255,0.4)', 
                        backdropFilter: 'blur(4px)',
                        padding: '8px 16px',
                        fontSize: '12px'
                      }}
                    >
                      Filter
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default Discover;
