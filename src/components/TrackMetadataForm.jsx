import React, { useState, useEffect, useRef } from 'react';
import { storage, auth } from '../firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { detectLyricsWithAI } from '../utils/aiLyricService';
import { useToast } from '../context/ToastContext';

const GENRES = ['Glowstep', 'Antha', 'Heirwave', 'ZionSoul', 'Rhema&B', 'ZionDrill', 'Upperground', 'Worship', 'Gospel', 'Christian Hip Hop', 'Ambient'];

const TrackMetadataForm = ({ trackId, audioFileName, audioUploadProgress, isAudioUploading, onSave, onCancel }) => {
  const { showToast } = useToast();
  const [title, setTitle] = useState('');
  const [permalink, setPermalink] = useState('');
  const [genre, setGenre] = useState(GENRES[0]);
  const [tags, setTags] = useState('');
  const [description, setDescription] = useState('');
  const [credits, setCredits] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [isDetectingLyrics, setIsDetectingLyrics] = useState(false);
  const [isPublic, setIsPublic] = useState(true);

  // Audio & Publishing Metadata
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isrcCode, setIsrcCode] = useState('');
  const [bpm, setBpm] = useState('');
  const [keySignature, setKeySignature] = useState('');
  const [labelName, setLabelName] = useState('');
  const [copyrightNotice, setCopyrightNotice] = useState('');

  // Artwork state
  const [artworkFile, setArtworkFile] = useState(null);
  const [artworkUrl, setArtworkUrl] = useState('');
  const [artworkProgress, setArtworkProgress] = useState(0);
  const [isArtworkUploading, setIsArtworkUploading] = useState(false);
  const artworkInputRef = useRef(null);

  // Pre-fill Title from filename and auto-detect lyrics
  useEffect(() => {
    if (audioFileName) {
      // Remove extension
      const baseName = audioFileName.substring(0, audioFileName.lastIndexOf('.')) || audioFileName;
      setTitle(baseName);
      setPermalink(baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
      
      // Run initial AI Lyric Detection
      handleDetectLyrics(baseName, genre);
    }
  }, [audioFileName]);

  const handleDetectLyrics = async (trackTitle = title, trackGenre = genre) => {
    setIsDetectingLyrics(true);
    try {
      const detected = await detectLyricsWithAI(trackTitle, trackGenre, auth.currentUser?.displayName || 'Brandon Robinson');
      setLyrics(detected);
    } catch (err) {
      console.error("AI Lyric Detection failed:", err);
    } finally {
      setIsDetectingLyrics(false);
    }
  };

  // Handle manual title changes and update permalink accordingly if not edited manually
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!permalink || permalink === title.toLowerCase().replace(/[^a-z0-9]+/g, '-')) {
      setPermalink(newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Handle Cover Art File Selection with Instant Local Preview & Resilient Storage Fallback
  const handleArtworkChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        showToast("Please upload an image file for the cover art.", "error");
        return;
      }
      setArtworkFile(file);

      // 1. Instantly update artwork preview using FileReader
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setArtworkUrl(event.target.result);
        }
      };
      reader.readAsDataURL(file);

      // 2. Upload to Firebase Storage asynchronously
      uploadArtwork(file);
    }
  };

  const uploadArtwork = (file) => {
    const uid = auth.currentUser?.uid || 'artist_' + Date.now();
    setIsArtworkUploading(true);
    setArtworkProgress(0);

    try {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')) || '.jpg';
      const storageRef = ref(storage, `images/artists/${uid}/artwork/${trackId}_cover${fileExtension}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setArtworkProgress(progress);
        }, 
        (error) => {
          console.warn("Artwork storage upload warning (using local preview fallback):", error);
          setIsArtworkUploading(false);
        }, 
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setArtworkUrl(downloadUrl);
          } catch (urlErr) {
            console.warn("Could not retrieve artwork download URL:", urlErr);
          } finally {
            setIsArtworkUploading(false);
          }
        }
      );
    } catch (err) {
      console.warn("Firebase Storage initialization warning:", err);
      setIsArtworkUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Title is required.", "warning");
      return;
    }
    if (!permalink.trim()) {
      showToast("Permalink is required.", "warning");
      return;
    }

    onSave({
      title,
      permalink,
      genre,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      description,
      credits,
      lyrics,
      isPublic,
      artworkUrl: artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=300",
      releaseDate,
      isrcCode,
      bpm,
      keySignature,
      labelName,
      copyrightNotice
    });
  };

  return (
    <form onSubmit={handleSubmit} className="track-metadata-form card fade-in">
      <div className="form-header">
        <h2>Enter Track Details</h2>
        <span className="badge outline text-xs">SoundCloud Sync Active</span>
      </div>

      {/* Audio Upload Status Banner */}
      <div className="audio-upload-status-banner mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold tracking-wider text-outline uppercase">
            {isAudioUploading ? "Uploading Audio File..." : "Audio Upload Complete"}
          </span>
          <span className="text-xs font-bold text-primary">{audioUploadProgress}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: `${audioUploadProgress}%` }}></div>
        </div>
        <p className="text-xs text-outline italic mt-1 truncate">{audioFileName}</p>
      </div>

      <div className="form-body-columns">
        {/* Left: Artwork Dropzone */}
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
          {artworkUrl && (
            <button 
              type="button" 
              className="btn btn-xs outline mt-2 w-full"
              onClick={() => artworkInputRef.current.click()}
            >
              Replace Image
            </button>
          )}
        </div>

        {/* Right: Text Fields */}
        <div className="fields-section flex flex-col gap-4">
          <div className="form-group">
            <label className="text-xs font-bold text-outline uppercase mb-1 block">Title *</label>
            <input 
              type="text" 
              value={title} 
              onChange={handleTitleChange}
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
              rows={4}
            />
          </div>

          <div className="form-group">
            <label className="text-xs font-bold text-outline uppercase mb-1 block">Track Credits & Production</label>
            <input 
              type="text" 
              value={credits} 
              onChange={(e) => setCredits(e.target.value)}
              placeholder="e.g. Written & Produced by Brandon Robinson" 
              className="input-field w-full"
            />
          </div>

          {/* Release Date & Record Label */}
          <div className="grid-2col">
            <div className="form-group">
              <label className="text-xs font-bold text-outline uppercase mb-1 block">Release Date *</label>
              <input 
                type="date" 
                value={releaseDate} 
                onChange={(e) => setReleaseDate(e.target.value)}
                className="input-field w-full"
                required
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-bold text-outline uppercase mb-1 block">Record Label / Publisher</label>
              <input 
                type="text" 
                value={labelName} 
                onChange={(e) => setLabelName(e.target.value)}
                placeholder="e.g. Trinity Sound Records" 
                className="input-field w-full"
              />
            </div>
          </div>

          {/* ISRC, BPM & Key Signature */}
          <div className="grid-3col gap-3">
            <div className="form-group">
              <label className="text-xs font-bold text-outline uppercase mb-1 block">ISRC Code</label>
              <input 
                type="text" 
                value={isrcCode} 
                onChange={(e) => setIsrcCode(e.target.value.toUpperCase())}
                placeholder="US-XX1-26-00001" 
                className="input-field w-full font-mono text-xs"
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-bold text-outline uppercase mb-1 block">Tempo (BPM)</label>
              <input 
                type="number" 
                value={bpm} 
                onChange={(e) => setBpm(e.target.value)}
                placeholder="e.g. 124" 
                className="input-field w-full"
              />
            </div>

            <div className="form-group">
              <label className="text-xs font-bold text-outline uppercase mb-1 block">Key Signature</label>
              <input 
                type="text" 
                value={keySignature} 
                onChange={(e) => setKeySignature(e.target.value)}
                placeholder="e.g. C Major" 
                className="input-field w-full"
              />
            </div>
          </div>

          {/* Copyright Notice */}
          <div className="form-group">
            <label className="text-xs font-bold text-outline uppercase mb-1 block">Copyright & Phonographic Line (℗ & ©)</label>
            <input 
              type="text" 
              value={copyrightNotice} 
              onChange={(e) => setCopyrightNotice(e.target.value)}
              placeholder="℗ 2026 Trinity Sound. All Rights Reserved." 
              className="input-field w-full"
            />
          </div>

          <div className="form-group">
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-outline uppercase block m-0">
                Song Lyrics (AI Transcribed & Editable)
              </label>
              <button 
                type="button" 
                className="btn btn-pill outline btn-xs flex items-center gap-1"
                onClick={() => handleDetectLyrics()}
                disabled={isDetectingLyrics}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>auto_awesome</span>
                {isDetectingLyrics ? "Detecting Lyrics..." : "AI Detect Lyrics"}
              </button>
            </div>
            <textarea 
              value={lyrics} 
              onChange={(e) => setLyrics(e.target.value)}
              placeholder="Song lyrics will be detected by AI automatically or type lyrics line by line..." 
              className="input-field w-full textarea-field"
              rows={6}
              style={{ fontFamily: "'Geist', monospace", fontSize: '13px', lineHeight: '1.6' }}
            />
          </div>

          <div className="form-group privacy-toggle-group">
            <label className="text-xs font-bold text-outline uppercase mb-1 block">Privacy Setting</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={isPublic} 
                  onChange={() => setIsPublic(true)}
                  className="radio-input"
                />
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>public</span>
                Public (Anyone can stream and view)
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={!isPublic} 
                  onChange={() => setIsPublic(false)}
                  className="radio-input"
                />
                <span className="material-symbols-outlined text-outline" style={{ fontSize: '18px' }}>lock</span>
                Private (Only you can access)
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="form-footer mt-6 flex justify-end gap-4 border-t pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          className="btn btn-pill outline"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-pill btn-primary"
          disabled={isAudioUploading || isArtworkUploading}
        >
          {isAudioUploading ? "Awaiting Audio..." : isArtworkUploading ? "Uploading Art..." : "Save Track"}
        </button>
      </div>
    </form>
  );
};

export default TrackMetadataForm;
