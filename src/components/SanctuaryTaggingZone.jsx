import React, { useState, useRef } from 'react';
import { storage, db, auth } from '../firebase';
import { ref, uploadBytes } from 'firebase/storage';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const PILLARS = ['Glowstep', 'Antha', 'Heirwave', 'ZionSoul', 'Rhema&B', 'ZionDrill', 'Upperground'];

const SanctuaryTaggingZone = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedPillar, setSelectedPillar] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('audio/')) {
      setFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !selectedPillar || !auth?.currentUser) {
      if(!auth?.currentUser) alert("You must be logged in to upload tracks.");
      return;
    }
    
    setUploading(true);
    try {
      const trackId = crypto.randomUUID();
      const storageRef = ref(storage, `raw_audio/${auth.currentUser.uid}/${trackId}_${file.name}`);
      
      await uploadBytes(storageRef, file);
      
      await setDoc(doc(db, "tracks", trackId), {
        userId: auth.currentUser.uid,
        title: title,
        genre: selectedPillar,
        createdAt: serverTimestamp(),
        fileName: file.name
      });
      
      setFile(null);
      setTitle('');
      setSelectedPillar('');
      alert("Track uploaded successfully and sent to the Refinery!");
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="card">
      <h2>Sanctuary Tagging Zone</h2>
      
      <div 
        onDragOver={(e) => e.preventDefault()} 
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        className="upload-zone"
      >
        <span className="text-outline text-sm font-bold">
          {file ? file.name : "Drag & Drop Audio File (.wav/.mp3) or Click to Browse"}
        </span>
        <input 
          type="file" 
          accept="audio/*" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={(e) => setFile(e.target.files[0])}
        />
      </div>

      <div className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Track Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input-field"
        />
        
        <div>
          <p className="text-outline text-xs font-bold mb-4" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Select a Genre Pillar:</p>
          <div className="flex flex-wrap gap-2">
            {PILLARS.map(pillar => (
              <button 
                key={pillar}
                onClick={() => setSelectedPillar(pillar)}
                className={`btn-pill ${selectedPillar === pillar ? 'active' : ''}`}
              >
                {pillar}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={handleUpload}
          disabled={!file || !title || !selectedPillar || uploading}
          className="btn btn-primary mt-4"
        >
          {uploading ? "Uploading to Refinery..." : "Upload & Tag"}
        </button>
      </div>
    </div>
  );
};

export default SanctuaryTaggingZone;
