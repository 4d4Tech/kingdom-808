import React from 'react';

const Wrapped = () => {
  return (
    <div className="wrapped-page fade-in" style={{paddingTop: '24px'}}>
      
      <div className="mb-xl">
        <p className="text-primary font-bold uppercase tracking-wider text-xs mb-2">DIVINE RECAP</p>
        <h1 className="font-headline" style={{fontSize: '72px', margin: '0 0 16px 0'}}>2024</h1>
        <p className="italic text-outline" style={{fontFamily: "'Playfair Display', serif", fontSize: '20px', maxWidth: '600px'}}>
          A reflection of your spiritual journey through worship and melody over the past six months.
        </p>
      </div>

      <div className="grid-3col mb-xl">
        <div className="stat-card-clean">
          <span className="material-symbols-outlined text-primary mb-4" style={{fontSize: '32px'}}>schedule</span>
          <p className="text-xs font-bold text-outline tracking-wider uppercase mb-xl">TOTAL WORSHIP</p>
          <h2 className="text-primary font-headline" style={{fontSize: '48px', margin: '0'}}>12,482</h2>
          <p className="italic text-primary-fixed-dim" style={{fontFamily: "'Playfair Display', serif", fontSize: '24px', margin: '0 0 32px 0'}}>Minutes</p>
          <p className="text-xs text-outline">You spent 22% more time in reflection than last season.</p>
        </div>

        <div className="stat-card-clean">
          <span className="material-symbols-outlined text-primary mb-4" style={{fontSize: '32px'}}>auto_awesome</span>
          <p className="text-xs font-bold text-outline tracking-wider uppercase mb-xl">NEW DISCOVERIES</p>
          <h2 className="text-primary font-headline" style={{fontSize: '48px', margin: '0'}}>342</h2>
          <p className="italic text-primary-fixed-dim" style={{fontFamily: "'Playfair Display', serif", fontSize: '24px', margin: '0 0 32px 0'}}>Anthems</p>
          <div className="flex justify-center items-end gap-1" style={{height: '40px'}}>
            {/* Fake visualizer bars */}
            <div style={{width: '6px', height: '20%', background: 'var(--color-primary)', borderRadius: '3px'}}></div>
            <div style={{width: '6px', height: '40%', background: 'var(--color-primary)', borderRadius: '3px'}}></div>
            <div style={{width: '6px', height: '80%', background: 'var(--color-primary)', borderRadius: '3px'}}></div>
            <div style={{width: '6px', height: '100%', background: 'var(--color-primary)', borderRadius: '3px'}}></div>
            <div style={{width: '6px', height: '60%', background: 'var(--color-primary)', borderRadius: '3px'}}></div>
            <div style={{width: '6px', height: '30%', background: 'var(--color-primary)', borderRadius: '3px'}}></div>
          </div>
        </div>

        <div className="stat-card-clean" style={{backgroundColor: '#FFFAED'}}>
          <p className="text-xs font-bold text-on-secondary-container tracking-wider uppercase mb-4 text-left">LISTENING PERSONALITY</p>
          <h2 className="font-headline text-on-secondary-fixed text-left mb-4" style={{fontSize: '36px', lineHeight: '1.2'}}>The<br/>Reflective<br/>Listener</h2>
          <p className="text-sm text-on-secondary-container mb-xl text-left" style={{lineHeight: '1.6'}}>
            Your soul finds peace in quiet arrangements and lyrical depth. You prioritize intentionality over volume.
          </p>
          <div className="text-left">
            <button className="btn btn-pill" style={{backgroundColor: 'var(--color-secondary)', color: 'white'}}>View Profile</button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="material-symbols-outlined text-primary">star</span>
        <h2 className="m-0">Your Top Artist</h2>
      </div>

      <div className="top-artist-banner">
        <img src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=1200" alt="Covenant Collective" />
        <div className="top-artist-overlay">
          <div className="flex gap-4 mb-4">
            <span className="badge">Most Played</span>
            <span className="text-white text-sm font-bold">Top 1% Worldwide</span>
          </div>
          <h1 className="font-headline text-white" style={{fontSize: '64px', margin: '0 0 16px 0'}}>Covenant<br/>Collective</h1>
          <div className="flex gap-8 text-white">
            <div>
              <p className="text-xs text-outline uppercase tracking-wider font-bold m-0 mb-1">STREAMS</p>
              <h4 className="m-0">2,419</h4>
            </div>
            <div style={{width: '1px', background: 'rgba(255,255,255,0.3)'}}></div>
            <div>
              <p className="text-xs text-outline uppercase tracking-wider font-bold m-0 mb-1">CONNECTION</p>
              <h4 className="m-0">Spiritual</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4 mt-xl">
        <span className="material-symbols-outlined text-primary">music_note</span>
        <h2 className="m-0 flex-1">Your Sacred Anthems</h2>
        <span className="text-primary text-xs font-bold uppercase tracking-wider cursor-pointer">Full History</span>
      </div>

      <div className="grid-5col mb-xl">
        {[
          { title: 'Eternal Grace', artist: 'Sacred Light Ensemble', img: 'https://images.unsplash.com/photo-1470229722913-7c090be31d04?auto=format&fit=crop&q=80&w=400' },
          { title: 'Dawn of Mercy', artist: 'Zion Collective', img: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=400' },
          { title: 'Mountain Prayer', artist: 'Covenant Echoes', img: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=400' },
          { title: 'River of Life', artist: 'The Wellspring', img: 'https://images.unsplash.com/photo-1548625361-ec8538260682?auto=format&fit=crop&q=80&w=400' },
          { title: 'Shadowlands', artist: 'Pilgrim\'s Path', img: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?auto=format&fit=crop&q=80&w=400' }
        ].map(anthem => (
          <div key={anthem.title} className="album-card">
            <img src={anthem.img} alt={anthem.title} style={{width: '100%', aspectRatio: '1', borderRadius: '16px', objectFit: 'cover', marginBottom: '12px'}} />
            <h4 className="text-sm m-0">{anthem.title}</h4>
            <p className="text-xs text-outline italic m-0" style={{fontFamily: "'Playfair Display', serif"}}>{anthem.artist}</p>
          </div>
        ))}
      </div>

      <div className="card text-center mb-xl" style={{padding: '64px', borderRadius: '32px'}}>
        <h2 className="font-headline mb-4" style={{fontSize: '40px'}}>Share Your Light</h2>
        <p className="text-outline mx-auto mb-xl" style={{maxWidth: '400px'}}>
          Your journey is an inspiration. Share your Season in Sound with your community and illuminate their path.
        </p>
        <div className="flex justify-center gap-4">
          <button className="btn btn-primary btn-pill with-icon" style={{padding: '16px 32px'}}>
            <span className="material-symbols-outlined fill-icon">share</span>
            Instagram Stories
          </button>
          <button className="btn btn-pill outline with-icon" style={{padding: '16px 32px', color: 'var(--color-primary)', borderColor: 'var(--color-primary)'}}>
            <span className="material-symbols-outlined">link</span>
            Copy Link
          </button>
        </div>
      </div>

    </div>
  );
};

export default Wrapped;
