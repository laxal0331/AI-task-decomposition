import React from 'react';

type Props = {
  visible: boolean;
  label: string;
  onClick: () => void;
};

export default function AutoSelectButton({ visible, label, onClick }: Props) {
  if (!visible) return null;
  return (
    <button
      style={{ 
        background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px',
        borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6
      }}
      onClick={onClick}
    >
      🤖 {label}
    </button>
  );
}


