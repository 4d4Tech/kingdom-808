import React, { useState, useEffect } from 'react';
import { db, storage, auth } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAudio } from '../context/AudioProvider';

// Subcomponents
import UploadDropzone from '../components/UploadDropzone';
import TrackMetadataForm from '../components/TrackMetadataForm';
import DashboardTrackList from '../components/DashboardTrackList';
import TrackEditModal from '../components/TrackEditModal';

const Dashboard = ({ userProfile }) => {
  const [subView, setSubView] = useState('library'); // 'library' or 'upload'
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active track being edited/deleted
  const [editingTrack, setEditingTrack] = useState(null);
  const [deletingTrack, setDeletingTrack] = useState(null);

  // Upload state
  const [uploadingFile, setUploadingFile] = useState(null);
  const [uploadTrackId, setUploadTrackId] = useState('');
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioUrl, setAudioUrl] = useState('');
  const [audioDuration, setAudioDuration] = useState(0);
  const [isAudioUploading, setIsAudioUploading] = useState(false);
  const [uploadTask, setUploadTask] = useState(null);

  const { playTrack, currentTrack, isPlaying } = useAudio();

  // Fetch Artist's Tracks
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'tracks'),
      where('artistId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const trackList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTracks(trackList);
      setLoading(false);
    }, (error) => {
      console.error("Failed to fetch tracks:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper: Retrieve Audio Duration in Client
  const getAudioDuration = (file) => {
    return new Promise((resolve) => {
      const objectUrl = URL.createObjectURL(file);
      const audio = new Audio();
      audio.src = objectUrl;
      audio.addEventListener('loadedmetadata', () => {
        resolve(Math.round(audio.duration));
        URL.revokeObjectURL(objectUrl);
      });
      audio.addEventListener('error', () => {
        resolve(0);
        URL.revokeObjectURL(objectUrl);
      });
    });
  };

  // Handle Drag & Drop File Selection (Start background upload immediately)
  const handleFileSelect = async (file) => {
    if (!auth.currentUser) return;
    
    // Generate single aligned trackId
    const trackId = crypto.randomUUID();
    setUploadTrackId(trackId);
    setUploadingFile(file);
    setIsAudioUploading(true);
    setAudioProgress(0);
    setSubView('upload'); // Switch to metadata view immediately

    // Get duration
    const duration = await getAudioDuration(file);
    setAudioDuration(duration);

    // Start background upload
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')) || '.mp3';
    const storageRef = ref(storage, `audio/artists/${auth.currentUser.uid}/tracks/${trackId}${fileExtension}`);
    const task = uploadBytesResumable(storageRef, file);
    setUploadTask(task);

    task.on('state_changed', 
      (snapshot) => {
        const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setAudioProgress(progress);
      }, 
      (error) => {
        console.error("Audio upload failed:", error);
        alert("Audio upload failed.");
        resetUploadState();
        setSubView('library');
      }, 
      async () => {
        const downloadUrl = await getDownloadURL(task.snapshot.ref);
        setAudioUrl(downloadUrl);
        setIsAudioUploading(false);
      }
    );
  };

  // Cancel In-Progress Upload
  const handleCancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
    }
    resetUploadState();
    setSubView('library');
  };

  // Reset Upload state
  const resetUploadState = () => {
    setUploadingFile(null);
    setUploadTrackId('');
    setAudioProgress(0);
    setAudioUrl('');
    setAudioDuration(0);
    setIsAudioUploading(false);
    setUploadTask(null);
  };

  // Save Track Ingestion to Firestore
  const handleSaveTrack = async (metadata) => {
    if (!auth.currentUser || !uploadTrackId) return;

    try {
      let finalAudioUrl = audioUrl;

      // In case user clicked save before the upload finished, await the uploadTask promise
      if (isAudioUploading && uploadTask) {
        // Wait for task to complete
        await new Promise((resolve, reject) => {
          uploadTask.then(async (snapshot) => {
            finalAudioUrl = await getDownloadURL(snapshot.ref);
            resolve();
          }).catch(reject);
        });
      }

      // Write Track Document
      await setDoc(doc(db, 'tracks', uploadTrackId), {
        trackId: uploadTrackId,
        artistId: auth.currentUser.uid,
        title: metadata.title,
        permalink: metadata.permalink,
        genre: metadata.genre,
        tags: metadata.tags,
        description: metadata.description,
        isPublic: metadata.isPublic,
        audioUrl: finalAudioUrl,
        artworkUrl: metadata.artworkUrl,
        duration: audioDuration,
        playCount: 0,
        play_count: 0, // compatibility
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      alert("Track saved and published successfully!");
      resetUploadState();
      setSubView('library');
    } catch (err) {
      console.error("Failed to save track document:", err);
      alert("Failed to save track details.");
    }
  };

  // Save Track Modification
  const handleSaveEdit = async (trackId, updatedFields) => {
    try {
      const trackRef = doc(db, 'tracks', trackId);
      await updateDoc(trackRef, {
        ...updatedFields,
        updatedAt: serverTimestamp()
      });
      alert("Track updated successfully.");
      setEditingTrack(null);
    } catch (err) {
      console.error("Failed to update track:", err);
      alert("Failed to update track.");
    }
  };

  // Delete Track and associated Storage files
  const handleDeleteConfirm = async () => {
    if (!deletingTrack) return;
    const track = deletingTrack;

    try {
      // 1. Delete Firestore Document
      await deleteDoc(doc(db, 'tracks', track.id));

      // 2. Delete Storage Files (Audio & Artwork)
      if (track.audioUrl && track.audioUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const audioRef = ref(storage, track.audioUrl);
          await deleteObject(audioRef);
        } catch (storageErr) {
          console.warn("Storage audio deletion skipped/failed:", storageErr);
        }
      }

      if (track.artworkUrl && track.artworkUrl.includes('firebasestorage.googleapis.com')) {
        try {
          const artworkRef = ref(storage, track.artworkUrl);
          await deleteObject(artworkRef);
        } catch (storageErr) {
          console.warn("Storage artwork deletion skipped/failed:", storageErr);
        }
      }

      alert("Track and files deleted successfully.");
      setDeletingTrack(null);
    } catch (err) {
      console.error("Deletion failed:", err);
      alert("Failed to complete track deletion.");
    }
  };

  // Play Track in Global Player
  const handlePlayTrack = (track) => {
    // Map track schema to Global Player track schema
    const playerTrack = {
      id: track.id,
      title: track.title,
      artist: 'Selah Grace', // Verified artist
      album: track.genre || 'Single',
      img: track.artworkUrl || "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100",
      audioUrl: track.audioUrl
    };
    playTrack(playerTrack);
  };

  // Copy shareable link
  const handleShareTrack = (track) => {
    const link = `${window.location.origin}/?view=artist&track=${track.permalink || track.id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert("Track share link copied to clipboard!");
    }).catch(err => {
      console.error("Could not copy text: ", err);
    });
  };

  // Calculations for stats
  const totalPlays = tracks.reduce((sum, t) => sum + (t.playCount || t.play_count || 0), 0);
  const publicTracks = tracks.filter(t => t.isPublic).length;

  return (
    <div className="dashboard-page fade-in">
      {/* Upper Welcome Header */}
      <div className="dashboard-welcome-header mb-8 mt-2">
        <div className="flex justify-between items-end gap-6 flex-wrap">
          <div>
            <h1 className="font-headline" style={{ fontSize: '40px', marginBottom: '8px', lineHeight: '1.2' }}>Creator Studio</h1>
            <p className="italic text-outline m-0" style={{ fontFamily: "'Playfair Display', serif", fontSize: '18px', lineHeight: '1.5' }}>
              Welcome back, {userProfile?.displayName || 'Artist'}. Share your divine harmony.
            </p>
          </div>
          {subView === 'library' && (
            <button 
              type="button" 
              className="btn btn-primary btn-pill with-icon"
              onClick={() => setSubView('upload-start')}
              style={{ padding: '14px 28px' }}
            >
              <span className="material-symbols-outlined">add</span>
              Upload Track
            </button>
          )}
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid-3col mb-8 stats-summary-grid">
        <div className="card stat-card flex items-center gap-5">
          <div className="stat-icon-wrapper blue">
            <span className="material-symbols-outlined">library_music</span>
          </div>
          <div>
            <p className="text-xs text-outline font-bold uppercase tracking-wider m-0 mb-1">Total Tracks</p>
            <h2 className="m-0 font-headline" style={{ fontSize: '32px', lineHeight: '1.2' }}>{tracks.length}</h2>
          </div>
        </div>

        <div className="card stat-card flex items-center gap-5">
          <div className="stat-icon-wrapper gold">
            <span className="material-symbols-outlined">play_circle</span>
          </div>
          <div>
            <p className="text-xs text-outline font-bold uppercase tracking-wider m-0 mb-1">Total Streams</p>
            <h2 className="m-0 font-headline" style={{ fontSize: '32px', lineHeight: '1.2' }}>{totalPlays.toLocaleString()}</h2>
          </div>
        </div>

        <div className="card stat-card flex items-center gap-5">
          <div className="stat-icon-wrapper green">
            <span className="material-symbols-outlined">visibility</span>
          </div>
          <div>
            <p className="text-xs text-outline font-bold uppercase tracking-wider m-0 mb-1">Public Catalog</p>
            <h2 className="m-0 font-headline" style={{ fontSize: '32px', lineHeight: '1.2' }}>
              {publicTracks} <span className="text-sm text-outline font-normal">/ {tracks.length}</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Main Studio View Area */}
      {subView === 'upload-start' && (
        <div className="card fade-in">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="m-0">Upload Track</h2>
            <button type="button" className="btn outline btn-xs py-1" onClick={() => setSubView('library')}>Back to Library</button>
          </div>
          <UploadDropzone onFileSelect={handleFileSelect} />
        </div>
      )}

      {subView === 'upload' && uploadingFile && (
        <TrackMetadataForm 
          trackId={uploadTrackId}
          audioFileName={uploadingFile.name}
          audioUploadProgress={audioProgress}
          isAudioUploading={isAudioUploading}
          onSave={handleSaveTrack}
          onCancel={handleCancelUpload}
        />
      )}

      {subView === 'library' && (
        <div className="card studio-library-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="m-0">Your Track Library</h2>
            <span className="text-xs text-outline font-bold">{tracks.length} track(s) found</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="simple-spinner mb-4"></div>
              <p className="text-outline text-sm">Retrieving your creative library...</p>
            </div>
          ) : (
            <DashboardTrackList 
              tracks={tracks}
              onPlay={handlePlayTrack}
              onEdit={setEditingTrack}
              onDelete={setDeletingTrack}
              onShare={handleShareTrack}
            />
          )}
        </div>
      )}

      {/* Edit Track Modal Dialog */}
      {editingTrack && (
        <TrackEditModal 
          track={editingTrack}
          onSave={handleSaveEdit}
          onClose={() => setEditingTrack(null)}
        />
      )}

      {/* Deletion Confirmation Dialog */}
      {deletingTrack && (
        <div className="modal-overlay fade-in">
          <div className="modal-container card dialog grow-out p-6 max-w-sm text-center">
            <span className="material-symbols-outlined text-error mb-4" style={{ fontSize: '48px', color: '#ff5449' }}>warning</span>
            <h3>Delete Track?</h3>
            <p className="text-outline text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete <strong>{deletingTrack.title}</strong>? 
              This will remove the Firestore metadata and delete all associated audio/cover files from storage. This action is irreversible.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                type="button" 
                className="btn outline"
                onClick={() => setDeletingTrack(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-primary"
                style={{ backgroundColor: '#ff5449', borderColor: '#ff5449', color: 'white' }}
                onClick={handleDeleteConfirm}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
