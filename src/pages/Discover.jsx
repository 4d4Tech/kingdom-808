import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAudio } from '../context/AudioProvider';

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
  const { playTrack, currentTrack, isPlaying } = useAudio();

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

  const handlePlayChartTrack = (track) => {
    playTrack({
      id: track.id || track.title.toLowerCase().replace(/\s+/g, '-'),
      title: track.title,
      artist: track.artist || track.artistName || 'Brandon Robinson',
      album: track.genre || 'Single',
      img: track.artworkUrl || track.img || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=400",
      audioUrl: track.audioUrl || "https://codeskulptor-demos.commondatastorage.googleapis.com/desolate_shores/desolate_shores.mp3"
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '3:45';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper: Find tracks belonging to a genre
  const getTracksForGenre = (genreName) => {
    return uploadedTracks.filter(t => {
      if (!t.genre) return false;
      const g = t.genre.toLowerCase();
      const target = genreName.toLowerCase();
      return g === target || (target === 'chh' && g.includes('hip hop'));
    });
  };

  // Filtered tracks list if user selected a genre filter
  const displayedTracks = selectedGenreFilter === 'All' 
    ? uploadedTracks 
    : getTracksForGenre(selectedGenreFilter);

  // Select hero track
  const heroTrack = displayedTracks.length > 0 ? displayedTracks[0] : (uploadedTracks[0] || null);

  return (
    <div className="discover-page fade-in">
      
      {/* Header Banner */}
      <div className="mb-xl mt-4 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="font-headline" style={{ fontSize: '44px', marginBottom: '8px' }}>Listen Now</h1>
          <p className="italic text-outline m-0" style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px' }}>
            Discover celestial melodies, top charting worship, and divine Christian excellence.
          </p>
        </div>
        {uploadedTracks.length > 0 && (
          <div className="flex gap-2 items-center">
            <span className="badge" style={{ backgroundColor: 'rgba(0, 93, 144, 0.1)', color: 'var(--color-primary)', padding: '8px 18px', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold' }}>
              🎵 {uploadedTracks.length} Artist Tracks Online
            </span>
            {selectedGenreFilter !== 'All' && (
              <button 
                type="button" 
                className="btn btn-pill outline btn-xs"
                onClick={() => setSelectedGenreFilter('All')}
              >
                Clear Filter ({selectedGenreFilter})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Featured Community Artist Uploads Section */}
      <div className="mb-xl">
        <div className="flex justify-between items-baseline mb-4 flex-wrap gap-2">
          <h2 className="m-0">
            {selectedGenreFilter === 'All' ? 'Artist Public Song Catalog' : `Releases in ${selectedGenreFilter}`}
          </h2>
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
            <p className="text-sm font-bold m-0">No songs uploaded in {selectedGenreFilter} yet</p>
            <p className="text-xs text-outline m-0 mt-1">Artists can upload audio tracks in Creator Studio to feature their music in this genre.</p>
            {selectedGenreFilter !== 'All' && (
              <button type="button" className="btn btn-pill outline btn-xs mt-3" onClick={() => setSelectedGenreFilter('All')}>
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
