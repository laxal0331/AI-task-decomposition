import { TeamMember } from './teamData';

export type SmartMatchResult = {
  member: TeamMember;
  canAssign: boolean; // 未来四周是否有足够工时
  nextAvailableWeek: number; // 最早可分配的周索引（0~3），-1表示无可用
  totalAvailable: number; // 四周总可用工时
  effectiveHours: number; // 实际完成本任务所需工时（考虑速度倍率）
};

/**
 * 全局最快优先分配（贪心法）：所有任务按工时降序，依次分配给能最早完成的成员
 * @param tasks 任务列表
 * @param allMembers 所有成员
 * @param assignedTasks 已分配任务：{ [memberId]: number[] }，每周已分配工时
 * @param assignMode 分配模式
 * @returns { [taskIdx]: SmartMatchResult[] } 每个任务的推荐成员列表，首位为最优
 */
export function globalFastestAssignment(
  tasks: { role: string; estimated_hours: number; splittable?: boolean }[],
  allMembers: TeamMember[],
  assignedTasks: { [memberId: string]: number[] },
  assignMode: 'fast' | 'balanced' | 'slow' = 'fast'
): { [taskIdx: number]: SmartMatchResult[] } {
  // 拷贝一份 assignedTasks，避免污染外部
  const assigned: { [memberId: string]: number[] } = {};
  allMembers.forEach(m => {
    assigned[m.id] = (assignedTasks[m.id] || [0,0,0,0]).slice();
  });
  // 统计每个成员已分配任务数
  const memberTaskCount: { [memberId: string]: number } = {};
  // 任务按工时降序
  const taskOrder = tasks.map((t, i) => ({...t, idx: i})).sort((a, b) => b.estimated_hours - a.estimated_hours);
  const result: { [taskIdx: number]: SmartMatchResult[] } = {};
  for (const task of taskOrder) {
    // 过滤有该角色的成员
    const candidates = allMembers.filter(m => m.roles.includes(task.role));
    let match: SmartMatchResult[] = candidates.map(member => {
      const used = assigned[member.id] || [0,0,0,0];
      const remain = member.available_hours.map((h, i) => h - (used[i] || 0));
      const effectiveHours = Math.ceil(task.estimated_hours / member.speed_factor);
      const totalAvailable = remain.reduce((a, b) => a + b, 0);
      return {
        member,
        canAssign: totalAvailable >= effectiveHours,
        nextAvailableWeek: totalAvailable >= effectiveHours ? 0 : -1,
        totalAvailable,
        effectiveHours
      };
    });
    if (task.splittable !== false) {
      let remainHours = task.estimated_hours;
      let assignments: SmartMatchResult[] = [];
      let sorted: SmartMatchResult[] = [];
      if (assignMode === 'fast') {
        sorted = match
          .filter(m => m.totalAvailable > 0)
          .sort((a, b) => {
            const aAssigned = memberTaskCount[a.member.id] || 0;
            const bAssigned = memberTaskCount[b.member.id] || 0;
            if ((aAssigned === 0 && bAssigned > 0) || (aAssigned > 0 && bAssigned === 0)) {
              return aAssigned - bAssigned;
            }
            if (b.member.speed_factor !== a.member.speed_factor) return b.member.speed_factor - a.member.speed_factor;
            return a.member.hourly_rate - b.member.hourly_rate;
          });
        for (let m of sorted) {
          if (remainHours <= 0) break;
          let maxAssignable = Math.floor(m.totalAvailable * m.member.speed_factor);
          let assignHours = Math.min(remainHours, maxAssignable);
          if (assignHours > 0) {
            assignments.push({
              ...m,
              canAssign: true,
              effectiveHours: Math.ceil(assignHours / m.member.speed_factor)
            });
            let assignEff = Math.ceil(assignHours / m.member.speed_factor);
            for (let w = 0; w < 4 && assignEff > 0; w++) {
              let avail = m.member.available_hours[w] - (assigned[m.member.id][w] || 0);
              let use = Math.min(avail, assignEff);
              assigned[m.member.id][w] += use;
              assignEff -= use;
            }
            remainHours -= assignHours;
            memberTaskCount[m.member.id] = (memberTaskCount[m.member.id] || 0) + 1;
          }
        }
        result[task.idx] = match.filter(m => m.canAssign);
      } else if (assignMode === 'balanced') {
        // 优先让已承担本项目任务的成员继续分配
        // 统计已承担本项目任务的成员
        const assignedMemberIds = Object.keys(memberTaskCount).filter(mid => memberTaskCount[mid] > 0);
        sorted = match
          .filter(m => m.totalAvailable > 0)
          .sort((a, b) => {
            const aAssigned = assignedMemberIds.includes(a.member.id) ? 1 : 0;
            const bAssigned = assignedMemberIds.includes(b.member.id) ? 1 : 0;
            if (aAssigned !== bAssigned) return bAssigned - aAssigned; // 已承担的优先
            // 任务数少的优先，速度/价格接近平均
            const aCount = memberTaskCount[a.member.id] || 0;
            const bCount = memberTaskCount[b.member.id] || 0;
            if (aCount !== bCount) return aCount - bCount;
            const baseHourlyRate = allMembers.reduce((sum, m) => sum + m.hourly_rate, 0) / allMembers.length;
            const baseSpeed = allMembers.reduce((sum, m) => sum + m.speed_factor, 0) / allMembers.length;
            const aScore = Math.abs(a.member.speed_factor - baseSpeed) + Math.abs(a.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
            const bScore = Math.abs(b.member.speed_factor - baseSpeed) + Math.abs(b.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
            if (aScore !== bScore) return aScore - bScore;
            return b.member.speed_factor - a.member.speed_factor;
          });
        for (let m of sorted) {
          if (remainHours <= 0) break;
          let maxAssignable = Math.floor(m.totalAvailable * m.member.speed_factor);
          let assignHours = Math.min(remainHours, maxAssignable);
          if (assignHours > 0) {
            assignments.push({
              ...m,
              canAssign: true,
              effectiveHours: Math.ceil(assignHours / m.member.speed_factor)
            });
            let assignEff = Math.ceil(assignHours / m.member.speed_factor);
            for (let w = 0; w < 4 && assignEff > 0; w++) {
              let avail = m.member.available_hours[w] - (assigned[m.member.id][w] || 0);
              let use = Math.min(avail, assignEff);
              assigned[m.member.id][w] += use;
              assignEff -= use;
            }
            remainHours -= assignHours;
            memberTaskCount[m.member.id] = (memberTaskCount[m.member.id] || 0) + 1;
          }
        }
        result[task.idx] = assignments;
      } else {
        // slow: 价格优先
        sorted = match
          .filter(m => m.totalAvailable > 0)
          .sort((a, b) => {
            if (a.member.hourly_rate !== b.member.hourly_rate) return a.member.hourly_rate - b.member.hourly_rate;
            if (b.member.speed_factor !== a.member.speed_factor) return b.member.speed_factor - a.member.speed_factor;
            return (memberTaskCount[a.member.id] || 0) - (memberTaskCount[b.member.id] || 0);
          });
        for (let m of sorted) {
          if (remainHours <= 0) break;
          let maxAssignable = Math.floor(m.totalAvailable * m.member.speed_factor);
          let assignHours = Math.min(remainHours, maxAssignable);
          if (assignHours > 0) {
            assignments.push({
              ...m,
              canAssign: true,
              effectiveHours: Math.ceil(assignHours / m.member.speed_factor)
            });
            let assignEff = Math.ceil(assignHours / m.member.speed_factor);
            for (let w = 0; w < 4 && assignEff > 0; w++) {
              let avail = m.member.available_hours[w] - (assigned[m.member.id][w] || 0);
              let use = Math.min(avail, assignEff);
              assigned[m.member.id][w] += use;
              assignEff -= use;
            }
            remainHours -= assignHours;
            memberTaskCount[m.member.id] = (memberTaskCount[m.member.id] || 0) + 1;
          }
        }
        result[task.idx] = assignments;
      }
    } else {
      // 不可拆分任务，保持原有分配逻辑
      match.sort((a, b) => {
        if (a.nextAvailableWeek !== b.nextAvailableWeek) return a.nextAvailableWeek - b.nextAvailableWeek;
        if (b.member.speed_factor !== a.member.speed_factor) return b.member.speed_factor - a.member.speed_factor;
        return b.member.hourly_rate - a.member.hourly_rate;
      });
      const best = match[0];
      if (best && best.canAssign && best.nextAvailableWeek >= 0) {
        assigned[best.member.id][best.nextAvailableWeek] += best.effectiveHours;
        memberTaskCount[best.member.id] = (memberTaskCount[best.member.id] || 0) + 1;
      }
      result[task.idx] = best ? [best] : [];
    }
  }
  return result;
}

/**
 * 智能推荐成员
 * @param task 当前任务
 * @param allMembers 所有成员
 * @param assignedTasks 已分配任务：{ [memberId]: number[] }，每周已分配工时
 * @param assignMode 分配模式
 */
export function smartMatchDevelopersForTask(
  task: { role: string; estimated_hours: number; },
  allMembers: TeamMember[],
  assignedTasks: { [memberId: string]: number[] },
  assignMode: 'fast' | 'balanced' | 'slow'
): SmartMatchResult[] {
  // 过滤有该角色的成员
  const candidates = allMembers.filter(m => m.roles.includes(task.role));
  // 计算基准时薪
  const baseHourlyRate = allMembers.reduce((sum, m) => sum + m.hourly_rate, 0) / allMembers.length;
  // 计算基准速度
  const baseSpeed = allMembers.reduce((sum, m) => sum + m.speed_factor, 0) / allMembers.length;
  // 计算每个成员未来四周的剩余工时和实际完成任务所需工时
  const results: SmartMatchResult[] = candidates.map(member => {
    const used = assignedTasks[member.id] || [0,0,0,0];
    const remain = member.available_hours.map((h, i) => h - (used[i] || 0));
    const effectiveHours = Math.ceil(task.estimated_hours / member.speed_factor);
    const totalAvailable = remain.reduce((a, b) => a + b, 0);
    return {
      member,
      canAssign: totalAvailable >= effectiveHours,
      nextAvailableWeek: totalAvailable >= effectiveHours ? 0 : -1,
      totalAvailable,
      effectiveHours
    };
  });
  // 按模式排序
  if (assignMode === 'fast') {
    // 最快模式：优先速度倍率高的成员，但也要考虑可用工时
    results.sort((a, b) => {
      // 首先按速度排序
      if (b.member.speed_factor !== a.member.speed_factor) return b.member.speed_factor - a.member.speed_factor;
      // 然后按可用工时排序，确保有足够时间完成任务
      if (a.totalAvailable !== b.totalAvailable) return b.totalAvailable - a.totalAvailable;
      // 最后按价格排序
      return a.member.hourly_rate - b.member.hourly_rate;
    });
  } else if (assignMode === 'balanced') {
    // 均衡：速度倍率和时薪都接近平均值
    results.sort((a, b) => {
      const aScore = Math.abs(a.member.speed_factor - baseSpeed) + Math.abs(a.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
      const bScore = Math.abs(b.member.speed_factor - baseSpeed) + Math.abs(b.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
      if (aScore !== bScore) return aScore - bScore;
      return b.totalAvailable - a.totalAvailable;
    });
  } else {
    // 慢慢来：优先时薪低的成员，整体越便宜越好
    results.sort((a, b) => {
      if (a.member.hourly_rate !== b.member.hourly_rate) return a.member.hourly_rate - b.member.hourly_rate;
      if (a.nextAvailableWeek !== b.nextAvailableWeek) return a.nextAvailableWeek - b.nextAvailableWeek;
      return b.member.speed_factor - a.member.speed_factor;
    });
  }
  return results;
} 