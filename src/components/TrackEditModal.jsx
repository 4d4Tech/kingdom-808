import React, { useState, useEffect, useRef } from 'react';
import { storage, auth } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

const GENRES = ['Glowstep', 'Antha', 'Heirwave', 'ZionSoul', 'Rhema&B', 'ZionDrill', 'Upperground', 'Worship', 'Gospel', 'Christian Hip Hop', 'Ambient'];

const TrackEditModal = ({ track, onSave, onClose }) => {
  const [title, setTitle] = useState('');
  const [permalink, setPermalink] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  
  // Artwork state
  const [artworkUrl, setArtworkUrl] = useState('');
  const [artworkProgress, setArtworkProgress] = useState(0);
  const [isArtworkUploading, setIsArtworkUploading] = useState(false);
  const artworkInputRef = useRef(null);

  // Populate from track data
  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setPermalink(track.permalink || '');
      setGenre(track.genre || GENRES[0]);
      setTags(track.tags ? track.tags.join(', ') : '');
      setDescription(track.description || '');
      setIsPublic(track.isPublic !== false);
      setArtworkUrl(track.artworkUrl || '');
    }
  }, [track]);

  // Handle Cover Art File Selection
  const handleArtworkChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file for the cover art.");
        return;
      }
      uploadArtwork(file);
    }
  };

  // Upload Artwork to Firebase Storage
  const uploadArtwork = (file) => {
    if (!auth.currentUser || !track) return;
    setIsArtworkUploading(true);
    setArtworkProgress(0);

    const fileExtension = file.name.substring(file.name.lastIndexOf('.')) || '.jpg';
    const storageRef = ref(storage, `images/artists/${auth.currentUser.uid}/artwork/${track.id}_cover${fileExtension}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setArtworkProgress(progress);
      }, 
      (error) => {
        console.error("Artwork upload failed:", error);
        alert("Cover artwork upload failed.");
        setIsArtworkUploading(false);
      }, 
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        setArtworkUrl(downloadUrl);
        setIsArtworkUploading(false);
      }
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }
    if (!permalink.trim()) {
      alert("Permalink is required.");
      return;
    }

    onSave(track.id, {
      title,
      permalink,
      genre,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      description,
      isPublic,
      artworkUrl
    });
  };

  return (
    <div className="modal-overlay fade-in">
      <div className="modal-container card grow-out" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Track Info</h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-body-columns">
            
            {/* Left: Artwork Section */}
            <div className="artwork-upload-section">
              <p className="text-xs font-bold tracking-wider text-outline uppercase mb-2">Cover Art</p>
              <div 
                className="artwork-dropzone"
                onClick={() => artworkInputRef.current.click()}
                style={{ backgroundImage: artworkUrl ? `url(${artworkUrl})` : 'none' }}
              >
                {!artworkUrl && !isArtworkUploading && (
                  <div className="artwork-placeholder">
                    <span className="material-symbols-outlined">image</span>
                    <span className="text-xs font-bold text-outline">Upload Cover Image</span>
                  </div>
                )}
                {isArtworkUploading && (
                  <div className="artwork-loading-overlay">
                    <div className="simple-spinner"></div>
                    <span className="text-xs text-white font-bold">{artworkProgress}%</span>
                  </div>
                )}
                <input 
                  ref={artworkInputRef}
                  type="file" 
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleArtworkChange}
                />
              </div>
              <button 
                type="button" 
                className="btn btn-xs outline mt-2 w-full"
                onClick={() => artworkInputRef.current.click()}
                disabled={isArtworkUploading}
              >
                Replace Artwork
              </button>
            </div>

            {/* Right: Input Fields */}
            <div className="fields-section flex flex-col gap-4">
              <div className="form-group">
                <label className="text-xs font-bold text-outline uppercase mb-1 block">Title *</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  placeholder="Track Title" 
                  className="input-field w-full"
                  required
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-outline uppercase mb-1 block">Permalink URL *</label>
                <div className="permalink-input-wrapper">
                  <span className="permalink-prefix">trinitysound.com/tracks/</span>
                  <input 
                    type="text" 
                    value={permalink} 
                    onChange={(e) => setPermalink(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, ''))}
                    placeholder="permalink" 
                    className="input-field permalink-input"
                    required
                  />
                </div>
              </div>

              <div className="grid-2col">
                <div className="form-group">
                  <label className="text-xs font-bold text-outline uppercase mb-1 block">Genre *</label>
                  <select 
                    value={genre} 
                    onChange={(e) => setGenre(e.target.value)}
                    className="input-field w-full select-field"
                  >
                    {GENRES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="text-xs font-bold text-outline uppercase mb-1 block">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={tags} 
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. ambient, worship, live" 
                    className="input-field w-full"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-outline uppercase mb-1 block">Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Write a description for your track..." 
                  className="input-field w-full textarea-field"
                  rows={3}
                />
              </div>

              <div className="form-group privacy-toggle-group">
                <label className="text-xs font-bold text-outline uppercase mb-1 block">Privacy Setting</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      name="edit-privacy" 
                      checked={isPublic} 
                      onChange={() => setIsPublic(true)}
                      className="radio-input"
                    />
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>public</span>
                    Public
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input 
                      type="radio" 
                      name="edit-privacy" 
                      checked={!isPublic} 
                      onChange={() => setIsPublic(false)}
                      className="radio-input"
                    />
                    <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>lock</span>
                    Private
                  </label>
                </div>
              </div>
            </div>

          </div>

          <div className="form-footer mt-6 flex justify-end gap-4 border-t pt-4">
            <button 
              type="button" 
              onClick={onClose}
              className="btn btn-pill outline"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-pill btn-primary"
              disabled={isArtworkUploading}
            >
              {isArtworkUploading ? "Uploading Art..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrackEditModal;
