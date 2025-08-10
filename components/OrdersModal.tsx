import React from 'react';
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

  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 12, minWidth: 600, maxWidth: 800, maxHeight: '80vh', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', position: 'relative' }}>
        <button
          style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', fontSize: 24, color: '#888', cursor: 'pointer', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background-color 0.2s', zIndex: 10 }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          onClick={onClose}
        >
          ×
        </button>
        <div style={{ padding: 32, maxHeight: '80vh', overflow: 'auto', paddingTop: 32, paddingRight: 64 }}>
          <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 24 }}>{t.myOrders}</div>
          {orders.length === 0 ? (
            <div style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>{t.noOrder}</div>
          ) : (
            <div style={{ display: 'grid', gap: 16 }}>
              {orders
                .sort((a, b) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0))
                .map((order) => (
                  <div key={order.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <div style={{ fontWeight: 600 }}>{t.orderId}：{order.id}</div>
                      <div style={{ padding: '4px 12px', borderRadius: 6, fontSize: 14, fontWeight: 600, color: '#fff', background: statusColorMap[order.status] || '#888' }}>
                        {orderStatusI18n[lang][order.status as keyof typeof orderStatusI18n[typeof lang]] || order.status}
                      </div>
                    </div>
                    <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>{t.time}：{new Date(parseInt(order.id)).toLocaleString()}</div>
                    <div style={{ color: '#666', fontSize: 14, marginBottom: 12 }}>{t.taskCount}：{order.task_count || 0}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        style={{ background: '#1890ff', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 14, cursor: 'pointer', flex: 1 }}
                        onClick={() => onView(order.id)}
                      >
                        {t.viewDetails}
                      </button>
                      <button
                        style={{ background: '#e11d48', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 14, cursor: 'pointer' }}
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


