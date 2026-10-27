import React from 'react';

export default function LoadingSpinner({ text = 'Loading...', size = 'medium' }) {
  const sizeMap = {
    small: { width: 24, height: 24, border: 2 },
    medium: { width: 40, height: 40, border: 3 },
    large: { width: 56, height: 56, border: 4 },
  };

  const current = sizeMap[size] || sizeMap.medium;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        gap: '1rem',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: current.width,
          height: current.height,
          borderRadius: '50%',
          border: `${current.border}px solid var(--color-slate-200)`,
          borderTopColor: 'var(--color-emerald-600)',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      {text && (
        <span style={{ fontSize: '0.9rem', color: 'var(--color-slate-600)', fontWeight: 500 }}>
          {text}
        </span>
      )}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
