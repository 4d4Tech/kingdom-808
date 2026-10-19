import React, { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { useToast } from '../context/ToastContext';

const NotificationCenter = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const { showToast } = useToast();

  const currentUserId = user?.uid || (user?.email ? user.email.toLowerCase() : 'guest');
  const userDisplayName = user?.displayName || user?.email || 'Artist';

  useEffect(() => {
    if (!user || user.isAnonymous) return;

    // Real-time listener for incoming notifications for this user
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', 'in', [user.uid, user.email?.toLowerCase(), 'brandonrobinson81@gmail.com'].filter(Boolean))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort by timestamp desc
      list.sort((a, b) => {
        const getTime = (val) => {
          if (!val) return 0;
          if (val.toDate) return val.toDate().getTime();
          if (val.seconds) return val.seconds * 1000;
          return new Date(val).getTime() || 0;
        };
        return getTime(b.createdAt) - getTime(a.createdAt);
      });

      setNotifications(list);
    }, (err) => {
      console.warn("Notification listener notice:", err);
    });

    return () => unsubscribe();
  }, [user]);

  // Handle Accept Collaborator Request
  const handleAccept = async (notif) => {
    try {
      // 1. Update track in Firestore to include this collaborator
      if (notif.trackId) {
        const trackRef = doc(db, 'tracks', notif.trackId);
        await updateDoc(trackRef, {
          collaborators: arrayUnion({
            uid: currentUserId,
            displayName: userDisplayName,
            avatarUrl: user?.photoURL || 'https://i.pravatar.cc/300?img=11'
          }),
          updatedAt: serverTimestamp()
        });
      }

      // 2. Mark notification as accepted
      await updateDoc(doc(db, 'notifications', notif.id), {
        status: 'accepted',
        updatedAt: serverTimestamp()
      });

      // 3. Send acceptance notification back to initiating artist
      if (notif.senderId) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: notif.senderId,
          senderId: currentUserId,
          senderName: userDisplayName,
          trackId: notif.trackId,
          trackTitle: notif.trackTitle,
          trackImg: notif.trackImg,
          type: 'collaborator_accepted',
          status: 'pending',
          message: `${userDisplayName} accepted your invitation to collaborate on "${notif.trackTitle}"!`,
          createdAt: serverTimestamp()
        });
      }

      showToast(`Accepted collaboration on "${notif.trackTitle}"!`, 'success');
    } catch (err) {
      console.error("Failed to accept collaborator request:", err);
      showToast("Could not update collaboration status.", "error");
    }
  };

  // Handle Deny Collaborator Request
  const handleDeny = async (notif) => {
    try {
      // 1. Mark notification as denied
      await updateDoc(doc(db, 'notifications', notif.id), {
        status: 'denied',
        updatedAt: serverTimestamp()
      });

      // 2. Send denial notification back to initiating artist
      if (notif.senderId) {
        await addDoc(collection(db, 'notifications'), {
          recipientId: notif.senderId,
          senderId: currentUserId,
          senderName: userDisplayName,
          trackId: notif.trackId,
          trackTitle: notif.trackTitle,
          trackImg: notif.trackImg,
          type: 'collaborator_denied',
          status: 'pending',
          message: `${userDisplayName} declined the collaborator invitation for "${notif.trackTitle}".`,
          createdAt: serverTimestamp()
        });
      }

      showToast(`Declined collaboration on "${notif.trackTitle}".`, 'info');
    } catch (err) {
      console.error("Failed to decline collaborator request:", err);
    }
  };

  // Dismiss notification
  const handleDismiss = async (notifId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notifId));
    } catch (err) {
      console.warn("Dismiss notification warning:", err);
    }
  };

  const pendingRequests = notifications.filter(n => n.type === 'collaborator_request' && n.status === 'pending');
  const unreadCount = pendingRequests.length + notifications.filter(n => (n.type === 'collaborator_accepted' || n.type === 'collaborator_denied') && n.status === 'pending').length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Bell Icon Trigger */}
      <button 
        type="button" 
        className="icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
        style={{ position: 'relative' }}
      >
        <span className="material-symbols-outlined">notifications</span>
        {unreadCount > 0 && (
          <span 
            style={{
              position: 'absolute',
              top: '2px',
              right: '2px',
              backgroundColor: '#e53935',
              color: 'white',
              fontSize: '10px',
              fontWeight: 'bold',
              borderRadius: '99px',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div 
          className="card fade-in"
          style={{
            position: 'absolute',
            right: 0,
            top: '52px',
            width: '360px',
            maxHeight: '480px',
            overflowY: 'auto',
            zIndex: 1000,
            borderRadius: '24px',
            boxShadow: '0 20px 48px rgba(0,0,0,0.25)',
            padding: '20px',
            backgroundColor: 'var(--color-surface-container-lowest)',
            border: '1px solid var(--color-surface-container-high)'
          }}
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="m-0 font-bold text-sm">Notifications & Collaborations</h4>
            <button 
              type="button" 
              className="text-xs text-outline hover:text-primary cursor-pointer border-none bg-transparent"
              onClick={() => setIsOpen(false)}
            >
              Close
            </button>
          </div>

          {notifications.length === 0 ? (
            <div className="text-center py-6">
              <span className="material-symbols-outlined text-outline mb-2" style={{ fontSize: '32px' }}>notifications_paused</span>
              <p className="text-xs text-outline m-0">No new notifications or requests.</p>
            </div>
          ) : (
            <div className="flex-col gap-3">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="p-3 card flex flex-col gap-2" 
                  style={{ borderRadius: '16px', backgroundColor: 'var(--color-surface-container-low)' }}
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={notif.trackImg || 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=100'} 
                      alt={notif.trackTitle} 
                      style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                    <div className="flex-1 min-w-0">
                      {notif.type === 'collaborator_request' && (
                        <>
                          <p className="text-xs font-bold m-0 text-primary truncate">Collaborator Invitation</p>
                          <p className="text-xs m-0 truncate">
                            <strong>{notif.senderName || 'An artist'}</strong> invited you to collaborate on <em>"{notif.trackTitle}"</em>.
                          </p>
                        </>
                      )}

                      {notif.type === 'collaborator_accepted' && (
                        <>
                          <p className="text-xs font-bold m-0 text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                            Collaboration Accepted
                          </p>
                          <p className="text-xs m-0">{notif.message}</p>
                        </>
                      )}

                      {notif.type === 'collaborator_denied' && (
                        <>
                          <p className="text-xs font-bold m-0 text-outline flex items-center gap-1">
                            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>cancel</span>
                            Invitation Declined
                          </p>
                          <p className="text-xs m-0">{notif.message}</p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions for Pending Requests */}
                  {notif.type === 'collaborator_request' && notif.status === 'pending' && (
                    <div className="flex gap-2 mt-1">
                      <button 
                        type="button" 
                        className="btn btn-pill btn-primary btn-xs flex-1"
                        onClick={() => handleAccept(notif)}
                      >
                        Accept
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-pill outline btn-xs flex-1"
                        onClick={() => handleDeny(notif)}
                      >
                        Deny
                      </button>
                    </div>
                  )}

                  {/* Dismiss for Accepted/Denied/Read Notifications */}
                  {(notif.type !== 'collaborator_request' || notif.status !== 'pending') && (
                    <div className="flex justify-end mt-1">
                      <button 
                        type="button" 
                        className="text-xs text-outline hover:text-primary cursor-pointer border-none bg-transparent"
                        onClick={() => handleDismiss(notif.id)}
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
