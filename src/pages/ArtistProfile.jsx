import React from 'react';

const ArtistProfile = () => {
  return (
    <div className="artist-profile fade-in">
      
      {/* Hero Section */}
      <div className="artist-hero-desktop">
        <div className="hero-overlay"></div>
        <div className="artist-hero-content">
          <div className="flex items-center gap-2 text-primary font-bold tracking-wider text-xs mb-2">
            <span className="material-symbols-outlined fill-icon" style={{fontSize: '16px'}}>verified</span>
            VERIFIED ARTIST
          </div>
          
          <h1>Selah Grace</h1>
          <p className="italic text-outline mb-xl" style={{fontFamily: "'Playfair Display', serif", fontSize: '24px'}}>
            Modern Worship & Ethereal Melodies
          </p>
          
          <div className="flex gap-6 mb-xl">
            <div>
              <h2 className="m-0" style={{fontFamily: "'Geist', sans-serif"}}>1.2M</h2>
              <p className="text-xs uppercase tracking-wider font-bold m-0">Monthly Listeners</p>
            </div>
            <div>
              <h2 className="m-0" style={{fontFamily: "'Geist', sans-serif"}}>450K</h2>
              <p className="text-xs uppercase tracking-wider font-bold m-0">Followers</p>
            </div>
          </div>

          <div className="flex gap-4">
            <button className="btn btn-primary btn-pill with-icon" style={{padding: '12px 32px'}}>
              <span className="material-symbols-outlined fill-icon">play_arrow</span>
              PLAY RADIO
            </button>
            <button className="btn btn-pill outline" style={{padding: '12px 48px', borderColor: 'var(--color-outline)'}}>
              FOLLOW
            </button>
          </div>
        </div>
      </div>

      <div className="desktop-col-layout">
        {/* Left Column */}
        <div className="left-col">
          
          <div className="flex justify-between items-center mb-4">
            <h3>Top Tracks</h3>
            <span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer">See All</span>
          </div>
          
          <div className="flex-col gap-2 mb-xl">
            {[
              { num: '01', title: 'Abiding Light', plays: '42,506,120 plays', time: '4:12', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100' },
              { num: '02', title: 'Streams in the Desert', plays: '38,192,440 plays', time: '5:45', img: 'https://images.unsplash.com/photo-1472712739516-7ad2b786e1f7?auto=format&fit=crop&q=80&w=100' },
              { num: '03', title: 'Still Waters (Live from Nashville)', plays: '12,440,011 plays', time: '6:30', img: 'https://images.unsplash.com/photo-1490750967868-88cb44cb2722?auto=format&fit=crop&q=80&w=100' }
            ].map(track => (
              <div key={track.num} className="track-row">
                <span className="track-num text-sm">{track.num}</span>
                <img src={track.img} alt={track.title} className="track-img" />
                <div className="flex-1">
                  <h4>{track.title}</h4>
                  <p className="text-xs text-outline m-0">{track.plays}</p>
                </div>
                <span className="text-xs text-outline">{track.time}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mb-4 mt-xl">
            <h3>Discography</h3>
            <div className="flex bg-surface-container" style={{borderRadius: '99px', background: 'var(--color-surface-container)', padding: '4px'}}>
              <button className="btn btn-pill bg-white text-xs py-1 px-4" style={{padding: '6px 16px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>Albums</button>
              <button className="btn btn-pill text-xs outline-none bg-transparent py-1 px-4 text-outline" style={{padding: '6px 16px', border: 'none'}}>Singles</button>
            </div>
          </div>

          <div className="grid-3col">
            {[
              { title: 'Eternal Echoes', info: '2023 • Album', img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=400' },
              { title: 'Morning Star', info: '2022 • Album', img: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=400' },
              { title: 'Field of Grace', info: '2021 • Album', img: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?auto=format&fit=crop&q=80&w=400' },
              { title: 'Resonance', info: '2020 • Album', img: 'https://images.unsplash.com/photo-1536148935331-408321065b18?auto=format&fit=crop&q=80&w=400' }
            ].map(album => (
              <div key={album.title} className="album-card">
                <img src={album.img} alt={album.title} />
                <h4 className="text-sm">{album.title}</h4>
                <p className="text-xs text-outline m-0">{album.info}</p>
              </div>
            ))}
          </div>

        </div>

        {/* Right Column */}
        <div className="right-col">
          
          <div className="card mb-xl">
            <h3 className="mb-4">About the Artist</h3>
            <p className="text-sm text-outline" style={{lineHeight: '1.6'}}>
              Selah Grace is a multi-award winning worship leader and songwriter known for her ethereal melodies. Born in Nashville and raised in the choral traditions of the South, she blends classical foundations with modern ambient sounds to create a sacred space for listening.
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

          <h3 className="mb-4">Collaborations</h3>
          <div className="flex-col mb-xl">
            <div className="collab-row">
              <img src="https://i.pravatar.cc/150?img=11" alt="Julian Rivers" />
              <div className="flex-1">
                <h4>Julian Rivers</h4>
                <p className="text-xs text-outline m-0">Featured on 'Abiding Light'</p>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>
            <div className="collab-row">
              <img src="https://i.pravatar.cc/150?img=47" alt="Eden Voss" />
              <div className="flex-1">
                <h4>Eden Voss</h4>
                <p className="text-xs text-outline m-0">Featured on 'Still Waters'</p>
              </div>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </div>
          </div>

          <div className="card" style={{backgroundColor: 'var(--color-surface-container)'}}>
            <p className="text-xs text-primary font-bold uppercase tracking-wider mb-4">Upcoming Tour</p>
            
            <div className="tour-card bg-white">
              <div>
                <p className="text-xs font-bold m-0 text-outline">OCT 24</p>
                <h4 className="text-sm m-0">Red Rocks Amphitheatre</h4>
                <p className="text-xs text-outline m-0">Morrison, CO</p>
              </div>
              <button className="btn btn-pill outline text-xs py-1" style={{padding: '6px 16px', borderColor: 'var(--color-outline)'}}>TICKETS</button>
            </div>

            <div className="tour-card bg-white">
              <div>
                <p className="text-xs font-bold m-0 text-outline">NOV 02</p>
                <h4 className="text-sm m-0">Ryman Auditorium</h4>
                <p className="text-xs text-outline m-0">Nashville, TN</p>
              </div>
              <button className="btn btn-pill outline text-xs py-1" style={{padding: '6px 16px', borderColor: 'var(--color-outline)'}}>TICKETS</button>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};

export default ArtistProfile;
