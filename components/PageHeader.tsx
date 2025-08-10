import React from 'react';

type Props = {
  t: any;
  onHome: () => void;
  onOpenOrders: () => void;
  lang: 'zh' | 'en';
  onToggleLang: () => void;
};

export default function PageHeader({ t, onHome, onOpenOrders, lang, onToggleLang }: Props) {
  return (
    <>
      <div style={{ position: 'fixed', left: 24, top: 24, display: 'flex', gap: 12, zIndex: 3000 }}>
        <button
          style={{
            background: '#fff', color: '#1890ff', border: '1px solid #e5e7eb', borderRadius: 8,
            fontWeight: 700, fontSize: 16, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', zIndex: 3001,
            cursor: 'pointer', letterSpacing: 2
          }}
          onClick={onHome}
        >{t.home}</button>
        <button
          style={{
            background: '#fff', color: '#1890ff', border: '1px solid #e5e7eb', borderRadius: 8,
            fontWeight: 700, fontSize: 16, padding: '6px 18px', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', zIndex: 3001,
            cursor: 'pointer', letterSpacing: 2
          }}
          onClick={onOpenOrders}
        >{t.myOrders}</button>
      </div>
      <div style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000 }}>
        <button className="btn" onClick={onToggleLang}>
          {t.lang}
        </button>
      </div>
    </>
  );
}


