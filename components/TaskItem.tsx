import React from 'react';
import type { Task } from '../lib/models/task';
import type { SmartMatchResult } from '../lib/smartMatch';
import { getPresetCandidateIds } from '../lib/services/recommendationCache';

type TaskItemProps = {
  i: number;
  task: Task;
  lang: 'zh' | 'en';
  t: any;
  teamData: any[];
  assignMode: 'slow' | 'balanced' | 'fast';
  roleMap: Record<string, string>;
  assignedTasks: { [memberId: string]: number[] };
  selectedMembers: { [taskIdx: number]: string | null };
  expanded: string | null;
  onToggle: (key: 'more' | 'insufficient') => void;
  onMemberClick: (e: React.MouseEvent, member: any, taskIndex: number) => void;
  smartMatchDevelopersForTask: (task: any, members: any[], assigned: any, mode: any) => SmartMatchResult[];
};

export default function TaskItem({ i, task, lang, t, teamData, assignMode, roleMap, assignedTasks, selectedMembers, expanded, onToggle, onMemberClick, smartMatchDevelopersForTask }: TaskItemProps) {
  const mainstreamRoles = [
    '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
    '产品经理', 'DevOps工程师', '全栈工程师'
  ];
  const normalizedRole = roleMap[task.role] || task.role;
  const mappedRole = mainstreamRoles.includes(normalizedRole) ? normalizedRole : '杂项专员';
  let matchResults: SmartMatchResult[] = [];
  if (teamData.length > 0) {
    // 若有候选快照，先用快照ID列表驱动；否则实时计算
    const snapIds = getPresetCandidateIds((task as any).order_id, task.id, assignMode);
    if (snapIds.length > 0) {
      const idToMember: Record<string, any> = Object.fromEntries(teamData.map(m => [m.id, m]));
      matchResults = snapIds
        .map(id => idToMember[id])
        .filter(Boolean)
        .map(member => ({
          member,
          canAssign: member.available_hours.reduce((a:number,b:number)=>a+b,0) >= Math.ceil(task.estimated_hours / (member.speed_factor||1)),
          nextAvailableWeek: 0,
          totalAvailable: member.available_hours.reduce((a:number,b:number)=>a+b,0),
          effectiveHours: Math.ceil(task.estimated_hours / (member.speed_factor||1)),
          originalHours: task.estimated_hours,
        } as SmartMatchResult));
      if (matchResults.length === 0) {
        matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamData,
          assignedTasks,
          assignMode
        );
      }
    } else {
      matchResults = smartMatchDevelopersForTask(
        { ...task, role: mappedRole },
        teamData,
        assignedTasks,
        assignMode
      );
    }
  }

  let canAssign = matchResults.filter(r => r.canAssign);
  const cannotAssign = matchResults.filter(r => !r.canAssign);
  // 展示侧也保障：优先精确角色，再全栈，再兼容
  const isExact = (m: any) => m.member.roles.includes(mappedRole);
  const isFullstack = (m: any) => m.member.roles.includes('全栈工程师');
  canAssign.sort((a, b) => {
    const aTier = isExact(a) ? 0 : (isFullstack(a) ? 1 : 2);
    const bTier = isExact(b) ? 0 : (isFullstack(b) ? 1 : 2);
    if (aTier !== bTier) return aTier - bTier;
    // 次序内按模式偏好：slow价低、fast速度高、balanced兼顾
    if (assignMode === 'slow') return a.member.hourly_rate - b.member.hourly_rate;
    if (assignMode === 'fast') return b.member.speed_factor - a.member.speed_factor;
    const aScore = Math.abs(a.member.speed_factor - 1) + Math.abs(a.member.hourly_rate - 120) / 120;
    const bScore = Math.abs(b.member.speed_factor - 1) + Math.abs(b.member.hourly_rate - 120) / 120;
    return aScore - bScore;
  });
  const selectedId = selectedMembers[i] || null;
  if (selectedId) {
    const idx = canAssign.findIndex(r => r.member.id === selectedId);
    if (idx > 0) {
      const [sel] = canAssign.splice(idx, 1);
      canAssign.unshift(sel);
    }
  }
  const currentTaskSelectedId = selectedMembers[i];
  const currentTaskSelectedMember = matchResults.find(r => r.member.id === currentTaskSelectedId);
  let showDevs: SmartMatchResult[] = [];
  let moreDevs: SmartMatchResult[] = [];
  const maxShow = 12;
  if (currentTaskSelectedMember) {
    showDevs.push(currentTaskSelectedMember);
  }
  if (canAssign.length === 0) {
    const remainingResults = matchResults.filter(r => r.member.id !== currentTaskSelectedId);
    showDevs.push(...remainingResults.slice(0, maxShow - showDevs.length));
    moreDevs = remainingResults.slice(maxShow - showDevs.length);
  } else {
    const remainingCanAssign = canAssign.filter(r => r.member.id !== currentTaskSelectedId);
    const remainingCannot = matchResults.filter(r => !r.canAssign && r.member.id !== currentTaskSelectedId);
    remainingCanAssign.sort((a, b) => a.member.hourly_rate - b.member.hourly_rate);
    const availableSlots = maxShow - showDevs.length;
    showDevs.push(...remainingCanAssign.slice(0, availableSlots));
    const remainingSlots = maxShow - showDevs.length;
    if (remainingSlots > 0) {
      showDevs.push(...remainingCannot.slice(0, remainingSlots));
    }
    moreDevs = [
      ...remainingCanAssign.slice(availableSlots),
      ...remainingCannot.slice(Math.max(0, remainingSlots))
    ];
  }

  return (
    <div className="border p-4 rounded shadow mb-4">
      <p><strong>{t.task}</strong>{lang === 'zh' ? (task.title_zh || task.title) : (task.title_en || task.title) || ''}</p>
      <p><strong>{t.role}</strong>{lang === 'zh' ? (task.role_zh || task.role) : (task.role_en || task.role) || ''}</p>
      <p><strong>{t.est}</strong>{task.estimated_hours} {lang === 'zh' ? '小时' : 'h'}</p>

      <div className="mt-2">
        <strong>{t.recommend}</strong>
        {showDevs.length === 0 ? (
          <span className="text-gray-500">{t.none}</span>
        ) : (
          <>
            {showDevs.map(({ member, canAssign, effectiveHours }) => {
              const isSelected = selectedId === member.id;
              return (
                <span
                  key={member.id}
                  className={`member-badge${isSelected ? ' selected-member' : ''}`}
                  onClick={e => onMemberClick(e, member, i)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title={canAssign ? t.detail : t.detailInsufficient}
                >
                  <span className="member-name">{lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)}</span> <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                </span>
              );
            })}
            {moreDevs.length > 0 && (
              <span style={{ color: '#64748b', marginLeft: 8, fontSize: '0.98em' }}>{t.moreLabel}</span>
            )}
          </>
        )}
      </div>

      <div className="mt-2 flex gap-2">
        <button className="btn" onClick={() => onToggle('more')}>{t.more}</button>
        <button className="btn" data-variant="danger" onClick={() => onToggle('insufficient')}>{t.insufficient}</button>
      </div>
      {expanded === 'more' && (
        <div className="p-2 border rounded bg-gray-50 mt-2">
          <div style={{ marginBottom: 8 }}>
            <strong>{t.tooExpensive}</strong>
            {moreDevs.filter(r => r.member.hourly_rate > 130).length === 0 ? <span className="text-gray-500">{t.no}</span> : moreDevs.filter(r => r.member.hourly_rate > 130).map(({ member, effectiveHours }) => {
              const isSelected = selectedId === member.id;
              return (
                <span
                  key={member.id}
                  className={`member-badge${isSelected ? ' selected-member' : ''}`}
                  onClick={e => onMemberClick(e, member, i)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title={t.select}
                >
                  <span className="member-name">{lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)}</span> <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                </span>
              );
            })}
          </div>
          <div style={{ marginBottom: 8 }}>
            <strong>{t.tooSlow}</strong>
            {moreDevs.filter(r => r.member.speed_factor < 0.8).length === 0 ? <span className="text-gray-500">{t.no}</span> : moreDevs.filter(r => r.member.speed_factor < 0.8).map(({ member, effectiveHours }) => {
              const isSelected = selectedId === member.id;
              return (
                <span
                  key={member.id}
                  className={`member-badge${isSelected ? ' selected-member' : ''}`}
                  onClick={e => onMemberClick(e, member, i)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title={t.select}
                >
                  <span className="member-name">{lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)}</span> <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                </span>
              );
            })}
          </div>
          <div>
            <strong>{t.others}</strong>
            {moreDevs.filter(r => r.member.hourly_rate <= 130 && r.member.speed_factor >= 0.8).length === 0 ? <span className="text-gray-500">{t.no}</span> : moreDevs.filter(r => r.member.hourly_rate <= 130 && r.member.speed_factor >= 0.8).map(({ member, effectiveHours }) => {
              const isSelected = selectedId === member.id;
              return (
                <span
                  key={member.id}
                  className={`member-badge${isSelected ? ' selected-member' : ''}`}
                  onClick={e => onMemberClick(e, member, i)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title={t.select}
                >
                  <span className="member-name">{lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)}</span> <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}
      {expanded === 'insufficient' && (
        <div className="p-2 border rounded bg-gray-50 mt-2">
          {cannotAssign.length === 0 ? (
            <span className="text-gray-500">{t.no}</span>
          ) : (
            cannotAssign.map(({ member, effectiveHours }) => {
              const isSelected = selectedId === member.id;
              return (
                <span
                  key={member.id}
                  className={`member-badge${isSelected ? ' selected-member' : ''}`}
                  onClick={e => onMemberClick(e, member, i)}
                  style={{ cursor: 'pointer', userSelect: 'none' }}
                  title={t.detailInsufficient}
                >
                  <span className="member-name">{lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)}</span> <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                </span>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}


