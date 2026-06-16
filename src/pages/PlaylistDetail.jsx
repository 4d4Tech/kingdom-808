import React from 'react';

const PlaylistDetail = () => {
  return (
    <div className="playlist-detail fade-in">
      
      <div className="playlist-header-desktop">
        <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" alt="Morning Worship" className="playlist-cover-desktop" />
        
        <div className="flex-1">
          <p className="text-primary font-bold uppercase tracking-wider text-xs mb-2">CURATED PLAYLIST</p>
          <h1 className="font-headline" style={{fontSize: '56px', margin: '0 0 16px 0'}}>Morning Worship</h1>
          
          <div className="flex items-center gap-4 text-outline font-bold text-sm mb-xl">
            <div className="flex items-center gap-2 text-on-surface">
              <div style={{width: 20, height: 20, borderRadius: '50%', backgroundColor: 'var(--color-primary)'}}></div>
              TRINITYSound
            </div>
            <span>•</span>
            <span>48 Songs</span>
            <span>•</span>
            <span>3h 45m</span>
            <span>•</span>
            <span className="text-secondary">12,402 Followers</span>
          </div>

          <div className="flex items-center gap-4">
            <button className="btn btn-pill btn-primary with-icon" style={{padding: '12px 32px'}}>
              <span className="material-symbols-outlined fill-icon">play_arrow</span>
              Play All
            </button>
            <button className="btn btn-pill outline with-icon" style={{padding: '12px 24px'}}>
              <span className="material-symbols-outlined">person_add</span>
              Follow
            </button>
            <button className="icon-btn-circle outline"><span className="material-symbols-outlined">share</span></button>
            <button className="icon-btn-circle outline"><span className="material-symbols-outlined">more_horiz</span></button>
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
          {[
            { num: '01', title: 'Oceans (Where Feet May Fail)', artist: 'Hillsong UNITED', album: 'Zion', date: 'Oct 12, 2023', time: '8:55', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100' },
            { num: '02', title: 'Gratitude', artist: 'Brandon Lake', album: 'House of Miracles', date: 'Oct 14, 2023', time: '5:38', img: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=100' },
            { num: '03', title: 'Way Maker', artist: 'Sinach', album: 'Way Maker', date: 'Oct 15, 2023', time: '5:04', img: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=100' },
            { num: '04', title: 'Goodness of God', artist: 'CeCe Winans', album: 'Believe For It', date: 'Oct 20, 2023', time: '4:58', img: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=100' }
          ].map(track => (
            <div key={track.num} className="table-row">
              <span className="text-outline">{track.num}</span>
              <div className="flex items-center gap-4">
                <img src={track.img} alt={track.title} style={{width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover'}} />
                <div>
                  <h4 className="m-0 text-sm">{track.title}</h4>
                  <p className="m-0 text-xs text-outline italic">{track.artist}</p>
                </div>
              </div>
              <span className="text-outline text-sm">{track.album}</span>
              <span className="text-outline text-sm">{track.date}</span>
              <span className="text-outline text-sm">{track.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-xl mb-xl">
        <div className="flex justify-between items-baseline mb-4">
          <h2>More Like This</h2>
          <span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer">See all</span>
        </div>
        
        <div className="grid-5col">
          {[
            { title: 'Sunday Serenity', info: 'Peaceful instrumental ...', img: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=400' },
            { title: 'Modern Hymns', info: 'Classic lyrics, new sou...', img: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=400' },
            { title: 'Praise & Power', info: 'Uplifting contemporary ...', img: 'https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&q=80&w=400' },
            { title: 'Quiet Reflection', info: 'Acoustic moments of p...', img: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?auto=format&fit=crop&q=80&w=400' },
            { title: 'Soul Harmony', info: 'Vocal-forward worship ...', img: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=400' }
          ].map(playlist => (
            <div key={playlist.title} className="album-card">
              <img src={playlist.img} alt={playlist.title} />
              <h4 className="text-sm">{playlist.title}</h4>
              <p className="text-xs text-outline m-0">{playlist.info}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default PlaylistDetail;
