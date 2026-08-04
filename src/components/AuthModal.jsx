import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthModal = ({ isOpen, onClose, promptMessage }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [accountType, setAccountType] = useState('listener'); // 'listener' | 'artist'
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          setError(accountType === 'artist' ? "Artist Name is required." : "Full Name is required.");
          setLoading(false);
          return;
        }

        // 1. Create User
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 2. Update Auth Profile
        await updateProfile(user, { displayName });

        // 3. Create User Document in Firestore with explicit role
        const isArtist = accountType === 'artist';
        await setDoc(doc(db, 'users', user.uid), {
          displayName,
          email,
          role: accountType,
          isArtist: isArtist,
          createdAt: serverTimestamp()
        });

      } else {
        // Sign In
        await signInWithEmailAndPassword(auth, email, password);
      }
      onClose(); // Close modal on success
    } catch (err) {
      console.error("Auth error:", err);
      // Clean up error messages for better UX
      let msg = err.message;
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      else if (err.code === 'auth/email-already-in-use') msg = "This email is already registered.";
      else if (err.code === 'auth/weak-password') msg = "Password should be at least 6 characters.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay auth-overlay fade-in" onClick={onClose}>
      <div className="modal-container card auth-modal-container grow-out max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="m-0 font-headline" style={{ fontSize: '24px' }}>
            {isSignUp ? "Join TRINITYSound" : "Welcome Back"}
          </h3>
          <button type="button" className="icon-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {promptMessage && (
          <div className="auth-prompt-banner mb-4">
            <span className="material-symbols-outlined text-sm">info</span>
            <p className="text-xs m-0 font-bold">{promptMessage}</p>
          </div>
        )}

        {/* Tab Selection */}
        <div className="auth-tabs flex mb-6">
          <button 
            type="button"
            className={`auth-tab-btn flex-1 py-2 font-bold text-sm ${!isSignUp ? 'active' : 'text-outline'}`}
            onClick={() => { setIsSignUp(false); setError(null); }}
          >
            Sign In
          </button>
          <button 
            type="button"
            className={`auth-tab-btn flex-1 py-2 font-bold text-sm ${isSignUp ? 'active' : 'text-outline'}`}
            onClick={() => { setIsSignUp(true); setError(null); }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="auth-error-banner mb-4">
            <span className="material-symbols-outlined text-sm">error</span>
            <p className="text-xs m-0">{error}</p>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Account Type Option for Registration */}
          {isSignUp && (
            <div className="form-group mb-2">
              <label className="text-xs font-bold text-outline uppercase mb-2 block">Select Account Type *</label>
              <div className="grid-2col gap-3">
                <div 
                  className={`card p-3 cursor-pointer flex flex-col gap-1 ${accountType === 'listener' ? 'border-primary' : ''}`}
                  onClick={() => setAccountType('listener')}
                  style={{
                    borderRadius: '14px',
                    border: accountType === 'listener' ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-container-high)',
                    backgroundColor: accountType === 'listener' ? 'rgba(0, 93, 144, 0.06)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>headphones</span>
                    <span className="text-xs font-bold">Music Listener</span>
                  </div>
                  <p className="text-xs text-outline m-0 mt-1" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                    Stream music, save favorite tracks & playlists.
                  </p>
                </div>

                <div 
                  className={`card p-3 cursor-pointer flex flex-col gap-1 ${accountType === 'artist' ? 'border-primary' : ''}`}
                  onClick={() => setAccountType('artist')}
                  style={{
                    borderRadius: '14px',
                    border: accountType === 'artist' ? '2px solid var(--color-primary)' : '1px solid var(--color-surface-container-high)',
                    backgroundColor: accountType === 'artist' ? 'rgba(0, 93, 144, 0.06)' : 'transparent',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary" style={{ fontSize: '20px' }}>mic</span>
                    <span className="text-xs font-bold">Artist / Creator</span>
                  </div>
                  <p className="text-xs text-outline m-0 mt-1" style={{ fontSize: '11px', lineHeight: '1.3' }}>
                    Upload tracks, manage catalog & Creator Studio.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isSignUp && (
            <div className="form-group">
              <label className="text-xs font-bold text-outline uppercase mb-1 block">
                {accountType === 'artist' ? "Artist / Stage Name *" : "Full Name / Display Name *"}
              </label>
              <input 
                type="text" 
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={accountType === 'artist' ? "e.g. Selah Grace" : "e.g. Alex Taylor"}
                className="input-field w-full"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="text-xs font-bold text-outline uppercase mb-1 block">Email Address *</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field w-full"
              required
            />
          </div>

          <div className="form-group">
            <label className="text-xs font-bold text-outline uppercase mb-1 block">Password *</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field w-full"
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-pill mt-4 w-full py-3 font-bold"
            disabled={loading}
          >
            {loading ? (
              <div className="flex justify-center items-center gap-2">
                <div className="simple-spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }}></div>
                <span>Please wait...</span>
              </div>
            ) : (
              <span>
                {isSignUp 
                  ? (accountType === 'artist' ? "Register as Artist" : "Sign Up as Listener") 
                  : "Sign In"}
              </span>
            )}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-outline m-0">
            {isSignUp ? "Already have an account?" : "New to TRINITYSound?"}{' '}
            <span 
              className="text-primary font-bold cursor-pointer hover:underline"
              onClick={() => { setIsSignUp(!isSignUp); setError(null); }}
            >
              {isSignUp ? "Sign In" : "Create one now"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
