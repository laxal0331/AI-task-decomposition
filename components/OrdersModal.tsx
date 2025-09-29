import React, { useEffect, useState } from 'react';
import { statusColorMap } from '../lib/constants/status';
import { orderStatusI18n } from '../lib/utils/i18n';

type OrdersModalProps = {
  open: boolean;
  orders: any[];
  lang: 'zh' | 'en';
  t: any;
  onClose: () => void;
  onView: (orderId: string) => void;
  onDeleteClick: (orderId: string) => void;
};

export default function OrdersModal({ open, orders, lang, t, onClose, onView, onDeleteClick }: OrdersModalProps) {
  if (!open) return null;

  // 简易断点：小屏（< 640px）做更紧凑布局
  const [isSmall, setIsSmall] = useState<boolean>(false);
  useEffect(() => {
    const check = () => setIsSmall(typeof window !== 'undefined' ? window.innerWidth < 640 : false);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isSmall ? 12 : 0 }}>
      <div style={{ background: '#fff', borderRadius: 12, width: 'clamp(320px, 92vw, 800px)', maxHeight: '80vh', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', position: 'relative' }}>
        <button
          style={{ position: 'absolute', top: isSmall ? 10 : 16, right: isSmall ? 10 : 16, background: 'none', border: 'none', fontSize: isSmall ? 20 : 24, color: '#888', cursor: 'pointer', width: isSmall ? 28 : 32, height: isSmall ? 28 : 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background-color 0.2s', zIndex: 10 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          onClick={onClose}
        >
          ×
        </button>
        <div style={{ padding: isSmall ? 16 : 32, maxHeight: '80vh', overflow: 'auto', paddingTop: isSmall ? 16 : 32, paddingRight: isSmall ? 16 : 48 }}>
          <div style={{ fontWeight: 700, fontSize: isSmall ? 18 : 22, marginBottom: isSmall ? 16 : 24 }}>{t.myOrders}</div>
          {orders.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: isSmall ? '24px 0' : '40px 0' }}>{t.noOrder}</div>
          ) : (
            <div style={{ display: 'grid', gap: isSmall ? 12 : 16 }}>
              {orders
                .sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0))
                .map((order) => (
                  <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: isSmall ? 12 : 16, background: '#fff', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    <div style={{ display: 'flex', flexDirection: isSmall ? 'column' : 'row', justifyContent: 'space-between', alignItems: isSmall ? 'flex-start' : 'center', gap: isSmall ? 8 : 0, marginBottom: 8 }}>
                      <div style={{ fontWeight: 600, wordBreak: 'break-all' }}>{t.orderId}：{order.id}</div>
                      <div style={{ padding: isSmall ? '2px 8px' : '4px 12px', borderRadius: 6, fontSize: isSmall ? 12 : 14, fontWeight: 600, color: '#fff', background: statusColorMap[order.status] || '#888' }}>
                        {orderStatusI18n[lang][order.status as keyof typeof orderStatusI18n[typeof lang]] || order.status}
                      </div>
                    </div>
                    <div style={{ color: '#666', fontSize: isSmall ? 12 : 14, marginBottom: 8 }}>{t.time}：{new Date(parseInt(order.id)).toLocaleString()}</div>
                    <div style={{ color: '#666', fontSize: isSmall ? 12 : 14, marginBottom: 12 }}>{t.taskCount}：{order.task_count || 0}</div>
                    <div style={{ display: 'flex', gap: 8, flexDirection: isSmall ? 'column' : 'row' }}>
                      <button
                        style={{ background: '#1890ff', color: '#fff', border: 'none', borderRadius: 6, padding: isSmall ? '8px 12px' : '6px 12px', fontSize: isSmall ? 14 : 14, cursor: 'pointer', flex: 1 }}
                        onClick={() => onView(order.id)}
                      >
                        {t.viewDetails}
                      </button>
                      <button
                        style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: isSmall ? '8px 12px' : '6px 12px', fontSize: isSmall ? 14 : 14, cursor: 'pointer' }}
                        onClick={() => onDeleteClick(order.id)}
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


