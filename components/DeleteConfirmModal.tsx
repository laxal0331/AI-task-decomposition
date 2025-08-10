import React from 'react';

type DeleteConfirmModalProps = {
  open: boolean;
  t: any;
  onConfirm: () => void;
  onClose: () => void;
};

export default function DeleteConfirmModal({ open, t, onConfirm, onClose }: DeleteConfirmModalProps) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 18, paddingRight: 48 }}>{t.deleteConfirm}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24 }}>
          <button style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 16, padding: '8px 28px', cursor: 'pointer' }} onClick={onConfirm}>{t.delete}</button>
          <button style={{ background: '#f1f5f9', color: '#222', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 16, padding: '8px 28px', cursor: 'pointer' }} onClick={onClose}>{t.close}</button>
        </div>
      </div>
    </div>
  );
}


