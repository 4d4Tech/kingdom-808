import React, { useState, useEffect, useRef } from 'react';
import { db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { useToast } from '../context/ToastContext';
import { compressImage } from '../utils/imageCompressor';

const ProfileSettingsModal = ({ isOpen, onClose, userProfile, user, onSaveProfile }) => {
  const { showToast } = useToast();
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [heroUrl, setHeroUrl] = useState('');

  // Upload states
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarProgress, setAvatarProgress] = useState(0);
  const [isHeroUploading, setIsHeroUploading] = useState(false);
  const [heroProgress, setHeroProgress] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const avatarInputRef = useRef(null);
  const heroInputRef = useRef(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || 'Selah Grace');
      setTagline(userProfile.tagline || 'Modern Worship & Ethereal Melodies');
      setBio(userProfile.bio || 'Selah Grace is a multi-award winning worship leader and songwriter known for her ethereal melodies. Born in Nashville and raised in the choral traditions of the South, she blends classical foundations with modern ambient sounds to create a sacred space for listening.');
      setLocation(userProfile.location || 'Nashville, TN');
      setAvatarUrl(userProfile.avatarUrl || 'https://i.pravatar.cc/300?img=11');
      setHeroUrl(userProfile.heroUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=1600');
    }
  }, [userProfile, isOpen]);

  if (!isOpen) return null;

  // Handle Avatar Upload with Client-Side Compression & Instant Preview
  const handleAvatarChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      showToast("Please select a valid image file for profile picture.", "error");
      return;
    }

    setIsAvatarUploading(true);
    setAvatarProgress(30);

    // Compress image to lightweight ~25KB JPEG payload
    const compressed = await compressImage(file, 500, 500, 0.8);
    if (compressed) {
      setAvatarUrl(compressed);
    }
    setAvatarProgress(100);
    setIsAvatarUploading(false);

    // Asynchronously attempt Firebase Storage upload
    const uid = user?.uid || 'user_' + Date.now();
    try {
      const storageRef = ref(storage, `images/users/${uid}/avatar_${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', null, (err) => console.warn("Storage upload warn:", err), async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setAvatarUrl(url);
        } catch (e) {
          console.warn("Storage getDownloadURL warn:", e);
        }
      });
    } catch (err) {
      console.warn("Storage init warn:", err);
    }
  };

  // Handle Hero Banner Upload with Client-Side Compression & Instant Preview
  const handleHeroChange = async (e) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];
    if (!file.type.startsWith('image/')) {
      showToast("Please select a valid image file for header cover.", "error");
      return;
    }

    setIsHeroUploading(true);
    setHeroProgress(30);

    // Compress cover image to lightweight ~80KB JPEG payload
    const compressed = await compressImage(file, 1200, 600, 0.8);
    if (compressed) {
      setHeroUrl(compressed);
    }
    setHeroProgress(100);
    setIsHeroUploading(false);

    // Asynchronously attempt Firebase Storage upload
    const uid = user?.uid || 'user_' + Date.now();
    try {
      const storageRef = ref(storage, `images/users/${uid}/hero_${Date.now()}.jpg`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on('state_changed', null, (err) => console.warn("Storage upload warn:", err), async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setHeroUrl(url);
        } catch (e) {
          console.warn("Storage getDownloadURL warn:", e);
        }
      });
    } catch (err) {
      console.warn("Storage init warn:", err);
    }
  };

  // Save Profile to Firestore, localStorage & App State
  const handleSave = async (e) => {
    e.preventDefault();
    if (!displayName.trim()) {
      showToast("Artist Name is required.", "warning");
      return;
    }

    setIsSaving(true);
    const updatedData = {
      displayName: displayName.trim(),
      tagline: tagline.trim(),
      bio: bio.trim(),
      location: location.trim(),
      avatarUrl: avatarUrl || 'https://i.pravatar.cc/300?img=11',
      heroUrl: heroUrl || 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=1600',
      updatedAt: new Date().toISOString()
    };

    // 1. Save locally for instant persistence & UI re-rendering
    try {
      localStorage.setItem('local_user_profile', JSON.stringify(updatedData));
    } catch (err) {
      console.warn("Could not save to localStorage:", err);
    }

    // 2. Trigger parent app state update so Artist Profile & Header re-render immediately
    if (onSaveProfile) {
      onSaveProfile(updatedData);
    }

    // 3. Save to Firestore if user exists with non-blocking error handling
    if (user && !user.isAnonymous) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(userRef, updatedData, { merge: true });
      } catch (err) {
        console.warn("Cloud profile sync notice (saved locally & in memory):", err);
      }
    }

    setIsSaving(false);
    showToast("Profile settings saved successfully!", "success");
    onClose();
  };

  return (
    <div 
      className="modal-overlay fade-in" 
      onClick={onClose}
      style={{
        overflowX: 'hidden',
        overflowY: 'auto',
        padding: '24px 16px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        className="modal-container card grow-out" 
        onClick={(e) => e.stopPropagation()}
        style={{ 
          width: '100%', 
          maxWidth: '780px', 
          padding: '0', 
          overflow: 'hidden',
          borderRadius: '32px',
          boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
          boxSizing: 'border-box',
          margin: 'auto'
        }}
      >
        {/* Modal Top Title Header */}
        <div 
          className="modal-header flex justify-between items-center" 
          style={{ 
            padding: '28px 36px', 
            borderBottom: '1px solid var(--color-surface-container-high)',
            boxSizing: 'border-box'
          }}
        >
          <div>
            <h3 className="m-0 flex items-center gap-3 font-headline" style={{ fontSize: '24px', lineHeight: '1.2' }}>
              <span className="material-symbols-outlined text-primary" style={{ fontSize: '28px' }}>manage_accounts</span>
              Artist Profile Settings
            </h3>
            <p className="text-xs text-outline m-0 mt-2" style={{ lineHeight: '1.5', fontSize: '13px' }}>
              Customize your public profile, biography, location, and visual artwork headers.
            </p>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} style={{ flexShrink: 0 }}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} style={{ maxHeight: '76vh', overflowY: 'auto', overflowX: 'hidden', boxSizing: 'border-box' }}>
          
          {/* Interactive Live Profile Banner & Avatar Preview Container */}
          <div style={{ padding: '36px 36px 24px 36px', boxSizing: 'border-box', width: '100%' }}>
            <div 
              style={{
                position: 'relative',
                borderRadius: '24px',
                overflow: 'hidden',
                height: '200px',
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.75)), url(${heroUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'flex-end',
                padding: '28px',
                boxSizing: 'border-box',
                width: '100%'
              }}
            >
              {/* Cover Banner Edit Button */}
              <button 
                type="button"
                onClick={() => heroInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  top: '20px',
                  right: '20px',
                  background: 'rgba(0,0,0,0.65)',
                  backdropFilter: 'blur(12px)',
                  color: 'white',
                  border: '1px solid rgba(255,255,255,0.3)',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                {isHeroUploading ? `Uploading ${heroProgress}%` : "Change Cover Header"}
              </button>
              <input 
                ref={heroInputRef}
                type="file" 
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleHeroChange}
              />

              {/* Live Preview Text overlay inside banner */}
              <div style={{ color: 'white', textShadow: '0 2px 10px rgba(0,0,0,0.7)', maxWidth: 'calc(100% - 40px)', boxSizing: 'border-box' }}>
                <h2 className="m-0 font-headline truncate" style={{ fontSize: '28px', lineHeight: '1.2', color: 'white' }}>
                  {displayName || 'Artist Name'}
                </h2>
                <p className="m-0 text-sm italic truncate" style={{ fontFamily: "'Playfair Display', serif", opacity: 0.95, marginTop: '4px' }}>
                  {tagline || 'Modern Worship & Ethereal Melodies'}
                </p>
              </div>
            </div>

            {/* Floating Avatar Frame overlapping bottom-left */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: '24px', 
              marginTop: '-48px', 
              marginLeft: '28px', 
              position: 'relative', 
              zIndex: 2,
              boxSizing: 'border-box',
              maxWidth: 'calc(100% - 56px)',
              flexWrap: 'wrap'
            }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    width: '112px',
                    height: '112px',
                    borderRadius: '50%',
                    backgroundImage: `url(${avatarUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '4px solid var(--color-surface-container-lowest)',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    transition: 'transform 0.2s ease'
                  }}
                ></div>
                <button 
                  type="button" 
                  onClick={() => avatarInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '4px',
                    right: '4px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    border: '2px solid white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
                  }}
                  title="Change Profile Photo"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>photo_camera</span>
                </button>
                <input 
                  ref={avatarInputRef}
                  type="file" 
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleAvatarChange}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <span className="text-xs font-bold text-outline uppercase tracking-wider block" style={{ letterSpacing: '0.08em' }}>
                  Profile Photo
                </span>
                {isAvatarUploading ? (
                  <span className="text-xs text-primary font-bold mt-1 block">Uploading {avatarProgress}%</span>
                ) : (
                  <span className="text-xs text-outline mt-1 block" style={{ lineHeight: '1.4' }}>
                    Click photo badge to update avatar
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Form Inputs Container with Generous 32px Vertical Spacing */}
          <div style={{ 
            padding: '12px 36px 36px 36px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '32px',
            boxSizing: 'border-box',
            width: '100%'
          }}>
            
            {/* 2-Column Row for Name & Location with 28px Gap */}
            <div className="grid-2col" style={{ gap: '28px', margin: 0, boxSizing: 'border-box', width: '100%' }}>
              <div className="form-group" style={{ margin: 0, boxSizing: 'border-box', width: '100%' }}>
                <label 
                  className="text-xs font-bold text-outline uppercase mb-2 block" 
                  style={{ letterSpacing: '0.06em', lineHeight: '1.4', marginBottom: '10px' }}
                >
                  Artist / Display Name *
                </label>
                <input 
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Selah Grace"
                  className="input-field w-full"
                  style={{ 
                    padding: '16px 24px', 
                    borderRadius: '16px', 
                    lineHeight: '1.5',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0, boxSizing: 'border-box', width: '100%' }}>
                <label 
                  className="text-xs font-bold text-outline uppercase mb-2 block" 
                  style={{ letterSpacing: '0.06em', lineHeight: '1.4', marginBottom: '10px' }}
                >
                  Location
                </label>
                <input 
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Nashville, TN"
                  className="input-field w-full"
                  style={{ 
                    padding: '16px 24px', 
                    borderRadius: '16px', 
                    lineHeight: '1.5',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    width: '100%'
                  }}
                />
              </div>
            </div>

            {/* Tagline Field */}
            <div className="form-group" style={{ margin: 0, boxSizing: 'border-box', width: '100%' }}>
              <label 
                className="text-xs font-bold text-outline uppercase mb-2 block" 
                style={{ letterSpacing: '0.06em', lineHeight: '1.4', marginBottom: '10px' }}
              >
                Tagline / Artist Subtitle
              </label>
              <input 
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Modern Worship & Ethereal Melodies"
                className="input-field w-full"
                style={{ 
                  padding: '16px 24px', 
                  borderRadius: '16px', 
                  lineHeight: '1.5',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
              />
            </div>

            {/* Bio Field */}
            <div className="form-group" style={{ margin: 0, boxSizing: 'border-box', width: '100%' }}>
              <label 
                className="text-xs font-bold text-outline uppercase mb-2 block" 
                style={{ letterSpacing: '0.06em', lineHeight: '1.4', marginBottom: '10px' }}
              >
                Artist Biography
              </label>
              <textarea 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your musical background and story with listeners..."
                className="input-field w-full textarea-field"
                style={{ 
                  padding: '16px 24px', 
                  borderRadius: '16px', 
                  lineHeight: '1.6',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  width: '100%'
                }}
                rows={5}
              />
            </div>

          </div>

          {/* Action Footer Bar with Generous 20px Button Gap */}
          <div 
            style={{ 
              padding: '24px 36px', 
              borderTop: '1px solid var(--color-surface-container-high)',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-surface-container-lowest)',
              boxSizing: 'border-box',
              width: '100%',
              flexWrap: 'wrap',
              gap: '16px'
            }}
          >
            <div className="text-xs text-outline font-medium">
              {isAvatarUploading || isHeroUploading ? (
                <span className="text-primary font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined spin" style={{ fontSize: '18px' }}>sync</span>
                  Uploading artwork media...
                </span>
              ) : (
                <span>All profile media synced</span>
              )}
            </div>

            <div className="flex items-center" style={{ gap: '20px' }}>
              <button 
                type="button" 
                className="btn btn-pill outline" 
                onClick={onClose}
                style={{ padding: '14px 32px' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-pill btn-primary"
                disabled={isAvatarUploading || isHeroUploading || isSaving}
                style={{ padding: '14px 36px' }}
              >
                {isSaving ? "Saving Profile..." : "Save Profile Settings"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
