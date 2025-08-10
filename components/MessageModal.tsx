import React from 'react';

type Props = {
  open: boolean;
  message: string;
  confirmText: string;
  onClose: () => void;
};

export default function MessageModal({ open, message, confirmText, onClose }: Props) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, paddingRight: 48 }}>{message}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <button style={{ background: '#1890ff', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '8px 28px', cursor: 'pointer' }} onClick={onClose}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}


