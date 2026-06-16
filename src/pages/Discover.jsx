import React from 'react';

const Discover = () => {
  return (
    <div className="discover-page fade-in">
      
      <div className="mb-xl mt-4">
        <h1 className="font-headline" style={{fontSize: '48px', marginBottom: '8px'}}>Celestial 100</h1>
        <p className="italic text-outline m-0" style={{fontFamily: "'Playfair Display', serif", fontSize: '20px'}}>
          The definitive weekly countdown of global Christian excellence.
        </p>
      </div>

      <div className="desktop-col-layout mb-xl" style={{gap: '32px'}}>
        <div className="left-col">
          <div className="celestial-hero m-0" style={{height: '100%', minHeight: '320px'}}>
            <img src="https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200" alt="Heaven on Earth" />
            <div className="celestial-overlay" style={{padding: '48px'}}>
              <div>
                <span className="badge" style={{backgroundColor: '#9a7500', color: 'white', padding: '6px 16px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px'}}>CHART TOPPER #1</span>
                <h1 className="font-headline text-white mt-4" style={{fontSize: '56px', marginBottom: '8px', fontStyle: 'italic'}}>Heaven on Earth</h1>
                <p className="text-primary-fixed-dim" style={{fontFamily: "'Geist', sans-serif", fontSize: '24px', fontWeight: 'bold', margin: '0'}}>Divinity Collective</p>
              </div>
              <button className="play-fab" style={{position: 'absolute', bottom: '48px', right: '48px', width: '64px', height: '64px', backgroundColor: 'white'}}>
                <span className="material-symbols-outlined fill-icon text-primary" style={{fontSize: '32px'}}>play_arrow</span>
              </button>
            </div>
          </div>
        </div>

        <div className="right-col">
          <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">Fastest Climbers</p>
          <div className="flex-col gap-4">
            {[
              { rank: '02', title: 'Sacred Morning', artist: 'Zion Worship', img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=100' },
              { rank: '03', title: 'Grace Flows', artist: 'Elijah King', img: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=100' },
              { rank: '04', title: 'Praise Rising', artist: 'Kingdom Voices', img: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?auto=format&fit=crop&q=80&w=100' }
            ].map(item => (
              <div key={item.rank} className="fastest-climbers-card">
                <span className="font-headline text-surface-container-highest" style={{fontSize: '36px', fontStyle: 'italic'}}>{item.rank}</span>
                <img src={item.img} alt={item.title} style={{width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover'}} />
                <div className="flex-1">
                  <h4 className="m-0 text-sm">{item.title}</h4>
                  <p className="m-0 text-xs text-outline">{item.artist}</p>
                </div>
                <span className="material-symbols-outlined text-secondary-container">trending_up</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2col mb-xl">
        <div>
          <div className="flex justify-between items-baseline mb-4">
            <h2>Top 10 This Week</h2>
            <span className="text-primary text-xs font-bold italic cursor-pointer">See Full History</span>
          </div>
          <div className="flex-col gap-2">
            {[
              { num: '1', title: 'Lion of Judah', artist: 'Roar Collective', time: '04:22' },
              { num: '2', title: 'Mercy Seat', artist: 'The Elders', time: '05:45' },
              { num: '3', title: 'Everlasting', artist: 'Grace City', time: '03:50' }
            ].map(item => (
              <div key={item.num} className="track-row py-4">
                <span className="track-num text-lg" style={{width: '40px'}}>{item.num}</span>
                <div className="flex-1">
                  <h4 className="m-0 text-base">{item.title}</h4>
                  <p className="m-0 text-xs text-outline">{item.artist}</p>
                </div>
                <span className="text-sm font-bold text-outline mr-4">{item.time}</span>
                <button className="icon-btn-circle outline" style={{width: '32px', height: '32px'}}>
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-baseline mb-4">
            <h2>Top 10 This Month</h2>
            <span className="text-primary text-xs font-bold italic cursor-pointer">Historical Records</span>
          </div>
          <div className="flex-col gap-2">
            {[
              { num: '1', title: 'Brokenness to Glory', artist: 'Sara Hezekiah', time: '06:12' },
              { num: '2', title: 'Unseen Faith', artist: 'Thomas Peter', time: '04:15' },
              { num: '3', title: 'Restoration', artist: 'Davidic Heart', time: '05:01' }
            ].map(item => (
              <div key={item.num} className="track-row py-4">
                <span className="track-num text-lg" style={{width: '40px'}}>{item.num}</span>
                <div className="flex-1">
                  <h4 className="m-0 text-base">{item.title}</h4>
                  <p className="m-0 text-xs text-outline">{item.artist}</p>
                </div>
                <span className="text-sm font-bold text-outline mr-4">{item.time}</span>
                <button className="icon-btn-circle outline" style={{width: '32px', height: '32px'}}>
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-xl">
        <h2 className="mb-4">Explore Genres</h2>
        <div className="genre-cards">
          <div className="genre-card">
            <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=600" alt="Worship" />
            <div className="overlay"></div>
            <div className="content">
              <h3>Worship</h3>
              <p className="text-sm mb-4" style={{maxWidth: '80%'}}>Deep reflection and communal praise.</p>
              <button className="btn btn-pill outline text-white" style={{borderColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)'}}>Explore Worship</button>
            </div>
          </div>
          <div className="genre-card">
            <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=600" alt="Gospel" />
            <div className="overlay"></div>
            <div className="content">
              <h3>Gospel</h3>
              <p className="text-sm mb-4" style={{maxWidth: '80%'}}>The heartbeat of tradition and soul.</p>
              <button className="btn btn-pill outline text-white" style={{borderColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)'}}>Explore Gospel</button>
            </div>
          </div>
          <div className="genre-card">
            <img src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=600" alt="CHH" />
            <div className="overlay"></div>
            <div className="content">
              <h3>CHH</h3>
              <p className="text-sm mb-4" style={{maxWidth: '80%'}}>Bold truth through urban rhythm.</p>
              <button className="btn btn-pill outline text-white" style={{borderColor: 'rgba(255,255,255,0.5)', backdropFilter: 'blur(4px)'}}>Explore CHH</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Discover;
