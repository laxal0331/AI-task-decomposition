import React from 'react';
import { STATUS } from '../pages/task-planner';

// 状态顺序和映射
const STATUS_ORDER = ['NOT_STARTED', 'PENDING', 'IN_PROGRESS', 'TESTING', 'COMPLETED'];
const STATUS_LEGACY_MAP = {
  '未开始': 'NOT_STARTED',
  '等待接受': 'PENDING', 
  '进行中': 'IN_PROGRESS',
  '测试中': 'TESTING',
  '已完成': 'COMPLETED'
};

const statusStepsMap = {
  zh: [
    { key: 'NOT_STARTED', label: '未开始' },
    { key: 'PENDING', label: '等待接受' },
    { key: 'IN_PROGRESS', label: '进行中' },
    { key: 'TESTING', label: '测试中' },
    { key: 'COMPLETED', label: '已完成' },
  ],
  en: [
    { key: 'NOT_STARTED', label: 'Not Started' },
    { key: 'PENDING', label: 'Pending Acceptance' },
    { key: 'IN_PROGRESS', label: 'In Progress' },
    { key: 'TESTING', label: 'Testing' },
    { key: 'COMPLETED', label: 'Completed' },
  ]
};

export function ProgressBar({ status, lang = 'zh' }: { status: string, lang?: 'zh' | 'en' }) {
  const statusSteps = statusStepsMap[lang] || statusStepsMap.zh;
  
  // 标准化状态：将各种格式的状态转换为统一的英文格式
  let normalizedStatus = status;
  if (STATUS_LEGACY_MAP[status]) {
    normalizedStatus = STATUS_LEGACY_MAP[status];
  } else if (status && typeof status === 'string' && STATUS_ORDER.includes(status.toUpperCase())) {
    normalizedStatus = status.toUpperCase();
  }
  
  const currentIdx = statusSteps.findIndex(s => s.key === normalizedStatus);
  
  return (
    <div style={{
      background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: 24, margin: '16px 0',
      display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 320
    }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
        {statusSteps.map((step, idx) => (
          <React.Fragment key={step.key}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
              <span style={{
                fontWeight: idx === currentIdx ? 700 : 400,
                fontSize: idx === currentIdx ? 20 : 14,
                color: idx === currentIdx ? '#1890ff' : '#333',
                marginBottom: 4,
                transition: 'all 0.3s ease-in-out'
              }}>{step.label}</span>
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                background: idx < currentIdx ? '#1890ff' : (idx === currentIdx ? '#1890ff' : '#eee'),
                border: idx === currentIdx ? '3px solid #1890ff' : '2px solid #eee',
                marginBottom: 2,
                transition: 'all 0.3s ease-in-out',
                boxShadow: idx === currentIdx ? '0 0 8px rgba(24,144,255,0.3)' : 'none'
              }} />
            </div>
            {idx < statusSteps.length - 1 && (
              <div style={{ 
                flex: 1, 
                height: 4, 
                background: idx < currentIdx ? '#1890ff' : '#eee', 
                margin: '0 4px', 
                borderRadius: 2,
                transition: 'all 0.3s ease-in-out'
              }} />
            )}
          </React.Fragment>
        ))}
      </div>
      {/* 添加实时更新指示器 */}
      <div style={{
        marginTop: 8,
        fontSize: 12,
        color: '#888',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: '#1890ff',
          animation: 'pulse 2s infinite'
        }} />
        <span>{lang === 'zh' ? '实时更新中' : 'Live Updates'}</span>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
} 