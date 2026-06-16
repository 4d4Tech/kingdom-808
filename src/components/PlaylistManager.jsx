import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, arrayUnion } from 'firebase/firestore';

const PlaylistManager = ({ currentTrackId }) => {
  const [playlists, setPlaylists] = useState([]);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  useEffect(() => {
    if (!auth || !auth.currentUser) return;
    
    const q = query(collection(db, "playlists"), where("userId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const pLists = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPlaylists(pLists);
    });
    
    return () => unsubscribe();
  }, []);

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "playlists"), {
        userId: auth.currentUser.uid,
        name: newPlaylistName,
        tracks: currentTrackId ? [currentTrackId] : [],
        createdAt: serverTimestamp(),
      });
      setNewPlaylistName('');
    } catch (error) {
      console.error("Error creating playlist:", error);
    }
  };

  const addToPlaylist = async (playlistId) => {
    if (!currentTrackId) return;
    try {
      const playlistRef = doc(db, "playlists", playlistId);
      await updateDoc(playlistRef, {
        tracks: arrayUnion(currentTrackId)
      });
    } catch (error) {
      console.error("Error adding to playlist:", error);
    }
  };

  return (
    <div className="card">
      <h3>My Playlists</h3>
      
      <form onSubmit={handleCreatePlaylist} className="flex gap-2 mb-4">
        <input 
          type="text" 
          value={newPlaylistName}
          onChange={(e) => setNewPlaylistName(e.target.value)}
          placeholder="New Playlist Name" 
          className="input-field flex-1"
        />
        <button type="submit" className="btn btn-primary">Create</button>
      </form>

      <div>
        {playlists.map(playlist => (
          <div key={playlist.id} className="list-item">
            <span className="font-bold">
              {playlist.name} <span className="text-outline text-xs">({playlist.tracks?.length || 0})</span>
            </span>
            {currentTrackId && (
              <button onClick={() => addToPlaylist(playlist.id)} className="icon-btn">
                <span className="material-symbols-outlined">add_circle</span>
              </button>
            )}
          </div>
        ))}
        {playlists.length === 0 && <p className="text-outline text-sm italic">No playlists yet.</p>}
      </div>
    </div>
  );
};

export default PlaylistManager;
