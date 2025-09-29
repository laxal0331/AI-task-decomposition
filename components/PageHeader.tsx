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
      <div className="page-header-left" style={{ position: 'fixed', left: 24, top: 24, display: 'flex', gap: 12, zIndex: 3000 }}>
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
      <div className="page-header-right" style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000 }}>
        <button className="btn page-header-lang" onClick={onToggleLang}>
          {t.lang}
        </button>
      </div>
      <style jsx global>{`
        /* 任务拆解页顶部按钮在极小屏下缩放到 80% */
        @media (max-width: 420px) {
          .page-header-left { gap: 9.6px !important; left: 20px !important; top: 20px !important; }
          .page-header-left button {
            font-size: 12.8px !important; /* 16 * 0.8 */
            padding: 4.8px 14.4px !important; /* 6x18 * 0.8 */
            border-radius: 6.4px !important; /* 8 * 0.8 */
            letter-spacing: 1.6px !important; /* 2 * 0.8 */
          }
          .page-header-right { right: 20px !important; top: 20px !important; }
          .page-header-right .page-header-lang {
            font-size: 0.8em !important; /* 相对 btn 原始字号缩放 */
            padding: 0.8em 0.8em !important; /* 保守等比缩放 */
          }
        }
      `}</style>
    </>
  );
}


