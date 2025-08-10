import React from 'react';

type Props = {
  lang: 'zh' | 'en';
  assignMode: 'slow' | 'balanced' | 'fast';
  completionInfo: any;
  costInfo: any;
  t: any;
  selectedMembersCount: number;
};

export default function EstimatedSummary({ lang, assignMode, completionInfo, costInfo, t, selectedMembersCount }: Props) {
  if (!completionInfo) return null;
  return (
    <div style={{ marginTop: 24, padding: 16, background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
        {lang === 'zh' ? '📅 预计完成时间' : '📅 Estimated Completion Time'}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
        <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 120 }}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>{lang === 'zh' ? '总工时' : 'Total Hours'}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>{completionInfo.totalHours.toFixed(1)} {lang === 'zh' ? '小时' : 'h'}</div>
        </div>
        <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 120 }}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>{lang === 'zh' ? '预计天数' : 'Estimated Days'}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>{completionInfo.daysNeeded} {lang === 'zh' ? '天' : 'days'}</div>
        </div>
        <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', minWidth: 120 }}>
          <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>{lang === 'zh' ? '预计周数' : 'Estimated Weeks'}</div>
          <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>{completionInfo.weeksNeeded} {lang === 'zh' ? '周' : 'weeks'}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: '#64748b', fontStyle: 'italic' }}>
        {assignMode === 'fast' && (lang === 'zh' ? '⚡ 最快模式：优先选择速度快的成员，实现并行工作' : '⚡ Fastest Mode: Prioritizes fast members for parallel work')}
        {assignMode === 'balanced' && (lang === 'zh' ? '⚖️ 均衡模式：平衡速度与成本，考虑并行性' : '⚖️ Balanced Mode: Balances speed and cost with parallel work')}
        {assignMode === 'slow' && (lang === 'zh' ? '💰 最便宜模式：选择时薪最低的成员，不考虑时间' : '💰 Cheapest Mode: Selects lowest hourly rate members, time not considered')}
      </div>
      {costInfo && selectedMembersCount > 0 && (
        <div style={{ marginTop: 16, padding: '16px 0', borderTop: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>{lang === 'zh' ? '💰 预计总金额' : '💰 Estimated Total Cost'}</div>
          <div style={{ background: '#fff', padding: '12px 16px', borderRadius: 8, border: '1px solid #e2e8f0', display: 'inline-block', minWidth: 200 }}>
            <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>{t.totalCost}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>¥{costInfo.totalCost.toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              {lang === 'zh' ? `平均时薪: ¥${costInfo.averageHourlyRate.toFixed(0)}/小时` : `Avg Rate: ¥${costInfo.averageHourlyRate.toFixed(0)}/h`}
            </div>
          </div>
        </div>
      )}
      <div style={{ fontSize: 12, color: '#64748b', marginTop: 12, fontStyle: 'italic' }}>
        {lang === 'zh' ? `* 基于每天${completionInfo.hoursPerDay}小时，每周${completionInfo.hoursPerWeek}小时的工作量计算` : `* Based on ${completionInfo.hoursPerDay}h/day, ${completionInfo.hoursPerWeek}h/week workload`}
      </div>
    </div>
  );
}


