import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, getDocs, startAfter } from 'firebase/firestore';

const Feed = () => {
  const [feed, setFeed] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth || !auth.currentUser) return;
    
    // Initial fetch
    const q = query(
      collection(db, "users", auth.currentUser.uid, "feed"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeed(items);
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadMore = async () => {
    if (!auth?.currentUser || !lastDoc || loading) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", auth.currentUser.uid, "feed"),
        orderBy("timestamp", "desc"),
        startAfter(lastDoc),
        limit(10)
      );
      
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFeed(prev => [...prev, ...items]);
      
      if (snapshot.docs.length > 0) {
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      } else {
        setLastDoc(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>Your Social Feed</h3>
      
      <div className="flex flex-col gap-4">
        {feed.map(item => (
          <div key={item.id} className="list-item">
            <div>
              <p className="font-bold">New Release from <span className="text-primary">Artist</span></p>
              <p className="text-outline text-sm">Genre: {item.genre}</p>
            </div>
            <button className="icon-btn">
              <span className="material-symbols-outlined fill-icon" style={{ fontSize: '36px' }}>play_circle</span>
            </button>
          </div>
        ))}
        {feed.length === 0 && <p className="text-outline text-sm italic">Nothing in your feed yet. Follow some artists to see new releases!</p>}
      </div>

      {lastDoc && (
        <button 
          onClick={loadMore}
          disabled={loading}
          className="btn btn-secondary mt-4"
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
};

export default Feed;
