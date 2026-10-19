import React, { createContext, useContext, useState } from 'react';

const ToastContext = createContext(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if component is used outside ToastProvider
    return {
      showToast: (msg) => console.log("[Toast Notification]:", msg)
    };
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3800);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Floating In-App Toast Container */}
      <div className="toast-container" style={{
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          const isError = toast.type === 'error';
          const isSuccess = toast.type === 'success';
          return (
            <div 
              key={toast.id} 
              className="toast-banner fade-in"
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 18px',
                borderRadius: '16px',
                backgroundColor: isError ? 'var(--color-error-container, #ffdad6)' : (isSuccess ? 'var(--color-primary-container, #d1e4ff)' : 'var(--color-surface-container-high, #e8e8e8)'),
                color: isError ? 'var(--color-on-error-container, #410002)' : (isSuccess ? 'var(--color-on-primary-container, #001d32)' : 'var(--color-on-surface, #1a1c1c)'),
                boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                border: '1px solid rgba(0,0,0,0.08)',
                fontSize: '13px',
                fontWeight: '600',
                lineHeight: '1.4'
              }}
            >
              <span className="material-symbols-outlined text-base" style={{ fontSize: '20px', flexShrink: 0 }}>
                {isError ? 'error' : (isSuccess ? 'check_circle' : 'info')}
              </span>
              <span style={{ flex: 1, wordBreak: 'break-word' }}>{toast.message}</span>
              <button 
                type="button" 
                onClick={() => removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'inherit',
                  opacity: 0.7
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};
