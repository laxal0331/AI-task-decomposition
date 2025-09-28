import { TeamMember, roleMap } from './teamData';

export type SmartMatchResult = {
  member: TeamMember;
  canAssign: boolean; // 未来四周是否有足够工时
  nextAvailableWeek: number; // 最早可分配的周索引（0~3），-1表示无可用
  totalAvailable: number; // 四周总可用工时
  effectiveHours: number; // 实际完成本任务所需工时（考虑速度倍率）
  originalHours: number; // 原始工时（AI拆解时的工时）
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
    const taskRole = roleMap[task.role] || task.role; // 使用角色映射
    // 候选分层：先精确，再全栈，最后兼容
    const exactCandidates = allMembers.filter(m => m.roles && m.roles.includes(taskRole));
    const fullstackCandidates = allMembers.filter(m => m.roles && m.roles.includes('全栈工程师'));
    const roleCompatibility = {
      '前端工程师': ['UI设计师', 'UX设计师'],
      '后端工程师': ['数据库工程师', 'DevOps工程师'],
      'UI设计师': ['前端工程师', 'UX设计师'],
      'UX设计师': ['前端工程师', 'UI设计师', '产品经理'],
      '数据库工程师': ['后端工程师', 'DevOps工程师'],
      'DevOps工程师': ['后端工程师', '数据库工程师'],
      '测试工程师': ['前端工程师', '后端工程师'],
      '产品经理': ['UX设计师', 'UI设计师'],
      '杂项专员': [],
      '项目经理': ['产品经理', 'UX设计师', 'UI设计师']
    } as Record<string, string[]>;
    const compatibleCandidates = allMembers.filter(m => m.roles && (roleCompatibility[taskRole] || []).some(r => m.roles.includes(r)));
    const candidates = exactCandidates.length > 0 ? exactCandidates : (fullstackCandidates.length > 0 ? fullstackCandidates : compatibleCandidates);
    const match: SmartMatchResult[] = candidates.map(member => {
      const used = assigned[member.id] || [0,0,0,0];
      const remain = (member.available_hours || [40, 40, 40, 40]).map((h, i) => h - (used[i] || 0));
      const effectiveHours = Math.ceil(task.estimated_hours / (member.speed_factor || 1.0));
      const totalAvailable = remain.reduce((a, b) => a + b, 0);
      return {
        member,
        canAssign: totalAvailable >= effectiveHours,
        nextAvailableWeek: totalAvailable >= effectiveHours ? 0 : -1,
        totalAvailable,
        effectiveHours,
        originalHours: task.estimated_hours
      };
    });
    if (task.splittable !== false) {
      let remainHours = task.estimated_hours;
      const assignments: SmartMatchResult[] = [];
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
            // 最快模式：只考虑速度，完全忽略价格
            return (b.member.speed_factor || 1.0) - (a.member.speed_factor || 1.0);
          });
        for (const m of sorted) {
          if (remainHours <= 0) break;
          const maxAssignable = Math.floor(m.totalAvailable * (m.member.speed_factor || 1.0));
          const assignHours = Math.min(remainHours, maxAssignable);
          if (assignHours > 0) {
            assignments.push({
              ...m,
              canAssign: true,
              effectiveHours: Math.ceil(assignHours / (m.member.speed_factor || 1.0))
            });
            let assignEff = Math.ceil(assignHours / (m.member.speed_factor || 1.0));
            for (let w = 0; w < 4 && assignEff > 0; w++) {
              const avail = (m.member.available_hours || [40, 40, 40, 40])[w] - (assigned[m.member.id][w] || 0);
              const use = Math.min(avail, assignEff);
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
            const aScore = Math.abs((a.member.speed_factor || 1.0) - baseSpeed) + Math.abs(a.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
            const bScore = Math.abs((b.member.speed_factor || 1.0) - baseSpeed) + Math.abs(b.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
            if (aScore !== bScore) return aScore - bScore;
            return (b.member.speed_factor || 1.0) - (a.member.speed_factor || 1.0);
          });
        for (const m of sorted) {
          if (remainHours <= 0) break;
          const maxAssignable = Math.floor(m.totalAvailable * (m.member.speed_factor || 1.0));
          const assignHours = Math.min(remainHours, maxAssignable);
          if (assignHours > 0) {
            assignments.push({
              ...m,
              canAssign: true,
              effectiveHours: Math.ceil(assignHours / (m.member.speed_factor || 1.0))
            });
            let assignEff = Math.ceil(assignHours / (m.member.speed_factor || 1.0));
            for (let w = 0; w < 4 && assignEff > 0; w++) {
              const avail = (m.member.available_hours || [40, 40, 40, 40])[w] - (assigned[m.member.id][w] || 0);
              const use = Math.min(avail, assignEff);
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
            if ((b.member.speed_factor || 1.0) !== (a.member.speed_factor || 1.0)) return (b.member.speed_factor || 1.0) - (a.member.speed_factor || 1.0);
            return (memberTaskCount[a.member.id] || 0) - (memberTaskCount[b.member.id] || 0);
          });
        for (const m of sorted) {
          if (remainHours <= 0) break;
          const maxAssignable = Math.floor(m.totalAvailable * (m.member.speed_factor || 1.0));
          const assignHours = Math.min(remainHours, maxAssignable);
          if (assignHours > 0) {
            assignments.push({
              ...m,
              canAssign: true,
              effectiveHours: Math.ceil(assignHours / (m.member.speed_factor || 1.0))
            });
            let assignEff = Math.ceil(assignHours / (m.member.speed_factor || 1.0));
            for (let w = 0; w < 4 && assignEff > 0; w++) {
              const avail = (m.member.available_hours || [40, 40, 40, 40])[w] - (assigned[m.member.id][w] || 0);
              const use = Math.min(avail, assignEff);
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
      // 不可拆分任务，根据分配模式排序
      match.sort((a, b) => {
        if (a.nextAvailableWeek !== b.nextAvailableWeek) return a.nextAvailableWeek - b.nextAvailableWeek;
        if ((b.member.speed_factor || 1.0) !== (a.member.speed_factor || 1.0)) return (b.member.speed_factor || 1.0) - (a.member.speed_factor || 1.0);
        // 根据分配模式决定是否考虑价格
        if (assignMode === 'fast') {
          // 最快模式：完全忽略价格
          return 0; // 如果速度相同，不考虑价格
        } else {
          // 其他模式：考虑价格
          return b.member.hourly_rate - a.member.hourly_rate;
        }
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
  const taskRole = roleMap[task.role] || task.role;
  const exactCandidates = allMembers.filter(m => m.roles && m.roles.includes(taskRole));
  const fullstackCandidates = allMembers.filter(m => m.roles && m.roles.includes('全栈工程师'));
  const roleCompatibility = {
    '前端工程师': ['UI设计师', 'UX设计师'],
    '后端工程师': ['数据库工程师', 'DevOps工程师'],
    'UI设计师': ['前端工程师', 'UX设计师'],
    'UX设计师': ['前端工程师', 'UI设计师', '产品经理'],
    '数据库工程师': ['后端工程师', 'DevOps工程师'],
    'DevOps工程师': ['后端工程师', '数据库工程师'],
    '测试工程师': ['前端工程师', '后端工程师'],
    '产品经理': ['UX设计师', 'UI设计师'],
    '杂项专员': [],
    '项目经理': ['产品经理', 'UX设计师', 'UI设计师']
  } as Record<string, string[]>;
  const compatibleCandidates = allMembers.filter(m => m.roles && (roleCompatibility[taskRole] || []).some(r => m.roles.includes(r)));
  const baseCandidates = exactCandidates.length > 0 ? exactCandidates : (fullstackCandidates.length > 0 ? fullstackCandidates : compatibleCandidates);
  // 计算基准时薪
  const baseHourlyRate = allMembers.reduce((sum, m) => sum + m.hourly_rate, 0) / allMembers.length;
  // 计算基准速度
  const baseSpeed = allMembers.reduce((sum, m) => sum + m.speed_factor, 0) / allMembers.length;
  // 计算每个成员未来四周的剩余工时和实际完成任务所需工时
  const results: SmartMatchResult[] = baseCandidates.map(member => {
    const used = assignedTasks[member.id] || [0,0,0,0];
    const remain = (member.available_hours || [40, 40, 40, 40]).map((h, i) => h - (used[i] || 0));
    const effectiveHours = Math.ceil(task.estimated_hours / (member.speed_factor || 1.0));
    const totalAvailable = remain.reduce((a, b) => a + b, 0);
    return {
      member,
      canAssign: totalAvailable >= effectiveHours,
      nextAvailableWeek: totalAvailable >= effectiveHours ? 0 : -1,
      totalAvailable,
      effectiveHours,
      originalHours: task.estimated_hours
    };
  });
  // 按模式排序
  if (assignMode === 'fast') {
    // 最快模式：并行优先（每个成员尽量只承担一个），再看速度
    results.sort((a, b) => {
      const aExactMatch = a.member.roles.includes(taskRole) ? 1 : 0;
      const bExactMatch = b.member.roles.includes(taskRole) ? 1 : 0;
      if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch;
      // 速度优先
      if (b.member.speed_factor !== a.member.speed_factor) return b.member.speed_factor - a.member.speed_factor;
      // 可用工时多者优先
      if (a.totalAvailable !== b.totalAvailable) return b.totalAvailable - a.totalAvailable;
      return 0;
    });
  } else if (assignMode === 'balanced') {
    // 均衡：速度倍率和时薪都接近平均值
    results.sort((a, b) => {
      // 首先按角色匹配度排序（精确匹配 > 兼容角色）
      const aExactMatch = a.member.roles.includes(taskRole) ? 1 : 0;
      const bExactMatch = b.member.roles.includes(taskRole) ? 1 : 0;
      if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch;
      
      const aScore = Math.abs((a.member.speed_factor || 1.0) - baseSpeed) + Math.abs(a.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
      const bScore = Math.abs((b.member.speed_factor || 1.0) - baseSpeed) + Math.abs(b.member.hourly_rate - baseHourlyRate) / baseHourlyRate;
      if (aScore !== bScore) return aScore - bScore;
      return b.totalAvailable - a.totalAvailable;
    });
  } else {
    // 慢慢来：优先时薪低的成员，整体越便宜越好
    results.sort((a, b) => {
      // 首先按角色匹配度排序（精确匹配 > 兼容角色）
      const aExactMatch = a.member.roles.includes(taskRole) ? 1 : 0;
      const bExactMatch = b.member.roles.includes(taskRole) ? 1 : 0;
      if (aExactMatch !== bExactMatch) return bExactMatch - aExactMatch;
      
      if (a.member.hourly_rate !== b.member.hourly_rate) return a.member.hourly_rate - b.member.hourly_rate;
      if (a.nextAvailableWeek !== b.nextAvailableWeek) return a.nextAvailableWeek - b.nextAvailableWeek;
      return (b.member.speed_factor || 1.0) - (a.member.speed_factor || 1.0);
    });
  }
  return results;
} 