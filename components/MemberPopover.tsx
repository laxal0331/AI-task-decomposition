import React from 'react';

type Position = { x: number; y: number } | null;

type MemberPopoverProps = {
  selectedMember: any;
  popupPos: Position;
  lang: 'zh' | 'en';
  onConfirm: () => void;
  onClose: () => void;
};

export default function MemberPopover({ selectedMember, popupPos, lang, onConfirm, onClose }: MemberPopoverProps) {
  if (!selectedMember || !popupPos) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        left: popupPos.x!,
        top: popupPos.y!,
        zIndex: 5000,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0',
        padding: 16,
        minWidth: 240,
        maxWidth: 280
      }}
    >
      <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 12, color: '#1e293b' }}>
        {lang === 'zh' ? selectedMember.name : (selectedMember.name_en || selectedMember.name)}
      </div>

      <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '角色：' : 'Role: '}</span>
          {lang === 'zh' 
            ? selectedMember.roles.join(', ')
            : selectedMember.roles.map((role: string) => {
                const roleEnMap: { [key: string]: string } = {
                  '前端工程师': 'Frontend Engineer',
                  '后端工程师': 'Backend Engineer',
                  'UI设计师': 'UI Designer',
                  'UX设计师': 'UX Designer',
                  '测试工程师': 'Test Engineer',
                  '数据库工程师': 'Database Engineer',
                  '产品经理': 'Product Manager',
                  'DevOps工程师': 'DevOps Engineer',
                  '全栈工程师': 'Full Stack Engineer',
                  '杂项专员': 'Generalist'
                };
                return roleEnMap[role] || role;
              }).join(', ')
          }
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '时薪：' : 'Rate: '}</span>
          {selectedMember.hourly_rate} {lang === 'zh' ? '元' : 'CNY'}
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '速度：' : 'Speed: '}</span>
          {selectedMember.speed_factor}
        </div>
        <div style={{ marginBottom: 6 }}>
          <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '经验：' : 'Exp: '}</span>
          {selectedMember.experience_score}
        </div>
        <div style={{ marginBottom: 12 }}>
          <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '可用：' : 'Available: '}</span>
          {selectedMember.available_hours.join(', ')} {lang === 'zh' ? '小时' : 'h'}
        </div>
      </div>

      <button
        style={{
          background: '#1890ff',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 16px',
          fontSize: 14,
          cursor: 'pointer',
          width: '100%',
          fontWeight: 600,
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#40a9ff')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#1890ff')}
        onClick={onConfirm}
      >
        {lang === 'zh' ? '选择该成员' : 'Select Member'}
      </button>

      <button
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'none',
          border: 'none',
          fontSize: 18,
          color: '#94a3b8',
          cursor: 'pointer',
          width: 24,
          height: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f1f5f9')}
        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}


