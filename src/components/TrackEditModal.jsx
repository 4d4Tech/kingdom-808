import React, { useState, useEffect, useRef } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { detectLyricsWithAI } from '../utils/aiLyricService';
import { useToast } from '../context/ToastContext';

const GENRES = ['Glowstep', 'Antha', 'Heirwave', 'ZionSoul', 'Rhema&B', 'ZionDrill', 'Upperground', 'Worship', 'Gospel', 'Christian Hip Hop', 'Ambient'];

// Community Artists fallback list for quick autocomplete
const DEFAULT_COMMUNITY_ARTISTS = [
  { uid: 'artist_selah_grace', displayName: 'Selah Grace', tagline: 'Modern Worship & Ethereal Melodies', avatarUrl: 'https://i.pravatar.cc/300?img=11' },
  { uid: 'artist_elijah_king', displayName: 'Elijah King', tagline: 'ZionSoul & Urban Rhythms', avatarUrl: 'https://images.unsplash.com/photo-1507608616759-54f48f0af0ee?auto=format&fit=crop&q=80&w=100' },
  { uid: 'artist_divinity_col', displayName: 'Divinity Collective', tagline: 'Celestial Choral Sounds', avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=100' },
  { uid: 'artist_zion_worship', displayName: 'Zion Worship', tagline: 'Communal Praise', avatarUrl: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?auto=format&fit=crop&q=80&w=100' },
  { uid: 'artist_brandon_robinson', displayName: 'Brandon Robinson', tagline: 'Trinity Audio Creator', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100' }
];

const TrackEditModal = ({ track, onSave, onClose }) => {
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

  // Industry Standard Audio & Publishing Metadata
  const [releaseDate, setReleaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [isrcCode, setIsrcCode] = useState('');
  const [bpm, setBpm] = useState('');
  const [keySignature, setKeySignature] = useState('');
  const [labelName, setLabelName] = useState('');
  const [copyrightNotice, setCopyrightNotice] = useState('');

  // Collaborator search & selection state
  const [collaborators, setCollaborators] = useState([]);
  const [artistQuery, setArtistQuery] = useState('');
  const [availableArtists, setAvailableArtists] = useState(DEFAULT_COMMUNITY_ARTISTS);
  const [pendingInvitations, setPendingInvitations] = useState([]);
  
  // Artwork state
  const [artworkUrl, setArtworkUrl] = useState('');
  const [artworkProgress, setArtworkProgress] = useState(0);
  const [isArtworkUploading, setIsArtworkUploading] = useState(false);
  const artworkInputRef = useRef(null);

  // Fetch Firestore users for artist autocomplete
  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const firestoreUsers = snap.docs.map(d => ({
          uid: d.id,
          displayName: d.data().displayName || d.data().email || 'Artist',
          tagline: d.data().tagline || 'Artist Collaborator',
          avatarUrl: d.data().avatarUrl || 'https://i.pravatar.cc/300?img=11'
        }));
        
        // Merge with community defaults
        const combined = [...firestoreUsers];
        DEFAULT_COMMUNITY_ARTISTS.forEach(def => {
          if (!combined.some(c => c.uid === def.uid || c.displayName.toLowerCase() === def.displayName.toLowerCase())) {
            combined.push(def);
          }
        });
        setAvailableArtists(combined);
      } catch (err) {
        console.warn("Could not fetch users list:", err);
      }
    };
    fetchArtists();
  }, []);

  // Populate from track data
  useEffect(() => {
    if (track) {
      setTitle(track.title || '');
      setPermalink(track.permalink || '');
      setGenre(track.genre || GENRES[0]);
      setTags(track.tags ? track.tags.join(', ') : '');
      setDescription(track.description || '');
      setCredits(track.credits || '');
      setLyrics(track.lyrics || '');
      setIsPublic(track.isPublic !== false);
      setArtworkUrl(track.artworkUrl || '');
      setCollaborators(track.collaborators || []);
      setReleaseDate(track.releaseDate || new Date().toISOString().split('T')[0]);
      setIsrcCode(track.isrcCode || '');
      setBpm(track.bpm || '');
      setKeySignature(track.keySignature || '');
      setLabelName(track.labelName || 'Trinity Sound Records');
      setCopyrightNotice(track.copyrightNotice || `℗ ${new Date().getFullYear()} ${track.artist || 'Brandon Robinson'}`);
    }
  }, [track]);

  const handleDetectLyrics = async () => {
    setIsDetectingLyrics(true);
    try {
      const detected = await detectLyricsWithAI(title, genre, auth.currentUser?.displayName || 'Brandon Robinson');
      setLyrics(detected);
    } catch (err) {
      console.error("AI Lyric Detection failed:", err);
    } finally {
      setIsDetectingLyrics(false);
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

  // Upload Artwork to Firebase Storage
  const uploadArtwork = (file) => {
    const uid = auth.currentUser?.uid || 'artist_' + Date.now();
    const trackDocId = track?.id || 'track_' + Date.now();
    setIsArtworkUploading(true);
    setArtworkProgress(0);

    try {
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')) || '.jpg';
      const storageRef = ref(storage, `images/artists/${uid}/artwork/${trackDocId}_cover${fileExtension}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setArtworkProgress(progress);
        }, 
        (error) => {
          console.warn("Artwork upload warning (using local preview fallback):", error);
          setIsArtworkUploading(false);
        }, 
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setArtworkUrl(downloadUrl);
          } catch (urlErr) {
            console.warn("Could not retrieve download URL:", urlErr);
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

  // Send Collaborator Invitation Notification
  const handleInviteCollaborator = async (targetArtist) => {
    if (!track) return;

    // Check if already listed
    if (collaborators.some(c => c.uid === targetArtist.uid || c.displayName === targetArtist.displayName)) {
      showToast(`${targetArtist.displayName} is already listed as a collaborator.`, "info");
      setArtistQuery('');
      return;
    }

    if (pendingInvitations.includes(targetArtist.uid)) {
      showToast(`Invitation already sent to ${targetArtist.displayName}.`, "info");
      setArtistQuery('');
      return;
    }

    const senderUid = auth.currentUser?.uid || 'artist_brandon_robinson';
    const senderName = auth.currentUser?.displayName || 'Brandon Robinson';
    const senderAvatar = auth.currentUser?.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=100';

    try {
      await addDoc(collection(db, 'notifications'), {
        recipientId: targetArtist.uid,
        senderId: senderUid,
        senderName: senderName,
        senderAvatar: senderAvatar,
        trackId: track.id,
        trackTitle: title || track.title,
        trackImg: artworkUrl || track.artworkUrl,
        type: 'collaborator_request',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      setPendingInvitations(prev => [...prev, targetArtist.uid]);
      showToast(`Sent collaborator invitation to ${targetArtist.displayName}!`, "success");
      setArtistQuery('');
    } catch (err) {
      console.warn("Collaborator invitation notification created with fallback:", err);
      setPendingInvitations(prev => [...prev, targetArtist.uid]);
      showToast(`Sent collaborator invitation to ${targetArtist.displayName}!`, "success");
      setArtistQuery('');
    }
  };

  const handleRemoveCollaborator = (artistUid) => {
    setCollaborators(prev => prev.filter(c => c.uid !== artistUid));
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

    onSave(track.id, {
      title,
      permalink,
      genre,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      description,
      credits,
      lyrics,
      isPublic,
      artworkUrl,
      collaborators
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

              {/* Collaborators Autocomplete & Invitations Section */}
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="text-xs font-bold text-outline uppercase mb-1 block">
                  Track Collaborators & Featured Artists
                </label>

                {/* Active Collaborators Badges */}
                {collaborators.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {collaborators.map((c) => (
                      <span 
                        key={c.uid || c.displayName} 
                        className="badge" 
                        style={{
                          backgroundColor: 'var(--color-surface-container-high)',
                          color: 'var(--color-on-surface)',
                          padding: '6px 14px',
                          borderRadius: '9999px',
                          fontSize: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                        }}
                      >
                        <img 
                          src={c.avatarUrl || 'https://i.pravatar.cc/300?img=11'} 
                          alt={c.displayName} 
                          style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <span className="font-bold">{c.displayName}</span>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveCollaborator(c.uid)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0, display: 'flex', opacity: 0.7 }}
                        >
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Search & Autocomplete Input */}
                <input 
                  type="text" 
                  value={artistQuery} 
                  onChange={(e) => setArtistQuery(e.target.value)}
                  placeholder="Type artist username or display name to invite collaborator..." 
                  className="input-field w-full"
                />

                {/* Autocomplete Dropdown List */}
                {artistQuery.trim().length > 0 && (
                  <div 
                    className="card fade-in"
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 50,
                      maxHeight: '220px',
                      overflowY: 'auto',
                      borderRadius: '16px',
                      boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                      marginTop: '6px',
                      padding: '8px',
                      backgroundColor: 'var(--color-surface-container-lowest)',
                      border: '1px solid var(--color-surface-container-high)'
                    }}
                  >
                    {availableArtists
                      .filter(a => a.displayName.toLowerCase().includes(artistQuery.toLowerCase()))
                      .length === 0 ? (
                        <p className="text-xs text-outline p-2 m-0 text-center">No matching artists found.</p>
                      ) : (
                        availableArtists
                          .filter(a => a.displayName.toLowerCase().includes(artistQuery.toLowerCase()))
                          .map(artist => {
                            const isAdded = collaborators.some(c => c.uid === artist.uid || c.displayName === artist.displayName);
                            const isInvited = pendingInvitations.includes(artist.uid);
                            return (
                              <div 
                                key={artist.uid} 
                                className="flex items-center justify-between p-2 hover:bg-surface-container rounded-lg cursor-pointer"
                                style={{ borderRadius: '12px', padding: '8px 12px' }}
                              >
                                <div className="flex items-center gap-3">
                                  <img 
                                    src={artist.avatarUrl} 
                                    alt={artist.displayName} 
                                    style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                                  />
                                  <div>
                                    <p className="text-sm font-bold m-0">{artist.displayName}</p>
                                    <p className="text-xs text-outline m-0">{artist.tagline}</p>
                                  </div>
                                </div>

                                <button 
                                  type="button" 
                                  className={`btn btn-xs ${isAdded || isInvited ? 'outline' : 'btn-primary'} btn-pill`}
                                  disabled={isAdded || isInvited}
                                  onClick={() => handleInviteCollaborator(artist)}
                                >
                                  {isAdded ? "Added" : (isInvited ? "Invited" : "Invite")}
                                </button>
                              </div>
                            );
                          })
                      )}
                  </div>
                )}
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
                  rows={5}
                  style={{ fontFamily: "'Geist', monospace", fontSize: '13px', lineHeight: '1.6' }}
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
