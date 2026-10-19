import React from 'react';
import { useAudio } from '../context/AudioProvider';

const DashboardTrackList = ({ tracks, onPlay, onEdit, onDelete, onShare }) => {
  const { currentTrack, isPlaying } = useAudio();

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="dashboard-track-list-wrapper">
      <div className="table-header-row">
        <div className="col-info">Track Info</div>
        <div className="col-genre">Genre</div>
        <div className="col-privacy">Privacy</div>
        <div className="col-date">Uploaded</div>
        <div className="col-stats text-center">Plays</div>
        <div className="col-actions text-right">Actions</div>
      </div>

      <div className="table-body">
        {tracks.map((track) => {
          const isCurrent = currentTrack && currentTrack.id === track.id;
          
          return (
            <div key={track.id} className={`track-list-row ${isCurrent ? 'current-active' : ''}`}>
              {/* Cover & Title */}
              <div 
                className="col-info flex items-center gap-3 cursor-pointer"
                onClick={() => onPlay(track)}
                style={{ cursor: 'pointer' }}
              >
                <div className="track-cover-container">
                  <img 
                    src={track.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100"} 
                    alt={track.title} 
                    className="track-list-cover"
                  />
                  <button 
                    type="button" 
                    className="track-play-hover-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPlay(track);
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {isCurrent && isPlaying ? 'pause_circle' : 'play_circle'}
                    </span>
                  </button>
                </div>
                <div className="track-title-details truncate">
                  <h4 className="m-0 text-sm truncate font-bold hover:text-primary">{track.title}</h4>
                  <p className="text-xs text-outline m-0 italic truncate">trinitysound.com/tracks/{track.permalink || track.id}</p>
                </div>
              </div>

              {/* Genre */}
              <div className="col-genre">
                <span className="badge outline text-xs">{track.genre || 'Worship'}</span>
              </div>

              {/* Privacy */}
              <div className="col-privacy flex items-center gap-1">
                <span className={`material-symbols-outlined text-outline text-sm`}>
                  {track.isPublic ? 'public' : 'lock'}
                </span>
                <span className="text-xs text-outline font-bold uppercase tracking-wider">
                  {track.isPublic ? 'Public' : 'Private'}
                </span>
              </div>

              {/* Upload Date */}
              <div className="col-date text-sm text-outline">
                {formatDate(track.createdAt)}
              </div>

              {/* Stats */}
              <div className="col-stats text-center font-bold text-sm">
                {track.playCount || track.play_count || 0}
              </div>

              {/* Actions on hover (or visible actions) */}
              <div className="col-actions flex justify-end gap-2">
                <button 
                  type="button" 
                  className="icon-btn-circle outline small-action-btn"
                  onClick={() => onEdit(track)}
                  title="Edit Track"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
                <button 
                  type="button" 
                  className="icon-btn-circle outline small-action-btn"
                  onClick={() => onShare(track)}
                  title="Copy Link"
                >
                  <span className="material-symbols-outlined text-sm">share</span>
                </button>
                <button 
                  type="button" 
                  className="icon-btn-circle outline small-action-btn delete-action-btn"
                  onClick={() => onDelete(track)}
                  title="Delete Track"
                >
                  <span className="material-symbols-outlined text-sm">delete</span>
                </button>
              </div>
            </div>
          );
        })}

        {tracks.length === 0 && (
          <div className="empty-tracks-view card text-center py-12">
            <span className="material-symbols-outlined text-outline mb-4" style={{ fontSize: '48px' }}>music_note</span>
            <h3>No tracks uploaded yet</h3>
            <p className="text-outline text-sm mb-4">Replicate SoundCloud parity and share your divine harmony.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardTrackList;
