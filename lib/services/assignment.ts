import { smartMatchDevelopersForTask } from '../smartMatch';
import { taskRoleMap, mainstreamRoles } from '../constants/roles';
import type { Task } from '../models/task';

export type AssignMode = 'slow' | 'balanced' | 'fast';

export function executeImmediateAutoSelection(tasksData: Task[], membersData: any[], mode: AssignMode): { [taskIdx: number]: string } {
  // 统一走全局策略，确保：
  // - fast 并行分配到不同成员
  // - balanced 尽量集中
  // - slow 最便宜
  return performAutoAssignment(tasksData, membersData, {}, mode);
}

export function performAutoAssignment(
  tasksToAssign: Task[],
  teamMembers: any[],
  assignedTasks: { [memberId: string]: number[] },
  currentAssignMode: AssignMode
): { [taskIdx: number]: string } {
  const autoSelected: { [taskIdx: number]: string } = {};

  if (currentAssignMode === 'fast') {
    // 最快：任务按工时降序，尽量分配给不同的人并行执行；只有当更快的成员已被占满时，才回退到已有的人
    const memberWorkloads: { [memberId: string]: number } = {};
    const usedOnce: Set<string> = new Set();
    const sortedTasks = tasksToAssign.map((task, idx) => ({ task, idx }))
      .sort((a, b) => b.task.estimated_hours - a.task.estimated_hours);

    sortedTasks.forEach(({ task, idx }) => {
      let mappedRole = taskRoleMap[task.role] || task.role;
      if (!mainstreamRoles.includes(mappedRole)) {
        mappedRole = '杂项专员';
      }

      let matchResults = smartMatchDevelopersForTask(
        { ...task, role: mappedRole },
        teamMembers,
        assignedTasks,
        currentAssignMode
      ).filter(r => r.canAssign);

      if (matchResults.length === 0) {
        matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamMembers,
          assignedTasks,
          currentAssignMode
        );
      }

      const candidatesWithWorkload = matchResults.map(r => {
        const currentWorkload = memberWorkloads[r.member.id] || 0;
        const effectiveHours = Math.ceil(task.estimated_hours / r.member.speed_factor);
        const totalWorkload = currentWorkload + effectiveHours;
        return { ...r, totalWorkload, effectiveHours };
      });
      // 优先挑选尚未使用的最快候选，以并行最大化
      const unusedFirst = [...candidatesWithWorkload]
        .filter(c => !usedOnce.has(c.member.id))
        .sort((a, b) => b.member.speed_factor - a.member.speed_factor);
      let pick = unusedFirst[0];
      if (!pick) {
        // 都已使用过，则按最小总负载 + 更快优先
        candidatesWithWorkload.sort((a, b) => {
          if (a.totalWorkload !== b.totalWorkload) return a.totalWorkload - b.totalWorkload;
          return b.member.speed_factor - a.member.speed_factor;
        });
        pick = candidatesWithWorkload[0];
      }

      if (pick) {
        autoSelected[idx] = pick.member.id;
        usedOnce.add(pick.member.id);
        memberWorkloads[pick.member.id] = (memberWorkloads[pick.member.id] || 0) + pick.effectiveHours;
      } else {
        const fallbackResults = smartMatchDevelopersForTask(
          { ...task, role: '全栈工程师' },
          teamMembers,
          assignedTasks,
          currentAssignMode
        );
        if (fallbackResults.length > 0) {
          const fallbackBest = fallbackResults.sort((a, b) => b.member.speed_factor - a.member.speed_factor)[0];
          autoSelected[idx] = fallbackBest.member.id;
          const effectiveHours = Math.ceil(task.estimated_hours / fallbackBest.member.speed_factor);
          usedOnce.add(fallbackBest.member.id);
          memberWorkloads[fallbackBest.member.id] = (memberWorkloads[fallbackBest.member.id] || 0) + effectiveHours;
        } else if (teamMembers.length > 0) {
          // 终极兜底：选全员里速度最快者
          const fb = [...teamMembers].sort((a: any, b: any) => b.speed_factor - a.speed_factor)[0];
          if (fb) {
            autoSelected[idx] = fb.id;
            const effectiveHours = Math.ceil(task.estimated_hours / (fb.speed_factor || 1));
            usedOnce.add(fb.id);
            memberWorkloads[fb.id] = (memberWorkloads[fb.id] || 0) + effectiveHours;
          }
        }
      }
    });
    // 最终兜底：若仍有缺失，按全员最快补齐
    tasksToAssign.forEach((_, idx) => {
      if (!autoSelected[idx] && teamMembers.length > 0) {
        const fb = [...teamMembers].sort((a: any, b: any) => b.speed_factor - a.speed_factor)[0];
        if (fb) autoSelected[idx] = fb.id;
      }
    });
  } else if (currentAssignMode === 'balanced') {
    // 均衡：尽量集中到同一人（质量/上下文连续性），但避免过慢。策略：
    // 1) 按任务工时降序；2) 在候选中选择已被分配次数最多的成员（保持集中）；
    // 3) 若速度低于团队中位速度太多（< 0.9*medianSpeed），换次优。
    const assignCount: { [memberId: string]: number } = {};
    const sorted = tasksToAssign.map((task, idx) => ({ task, idx }))
      .sort((a, b) => b.task.estimated_hours - a.task.estimated_hours);
    const teamMedianSpeed = (() => {
      const speeds = teamMembers.map((m: any) => m.speed_factor).sort((a: number, b: number) => a - b);
      const mid = speeds.length % 2 === 0 ? (speeds[speeds.length/2 - 1] + speeds[speeds.length/2]) / 2 : speeds[Math.floor(speeds.length/2)];
      return mid || 1;
    })();

    sorted.forEach(({ task, idx }) => {
      let mappedRole = taskRoleMap[task.role] || task.role;
      if (!mainstreamRoles.includes(mappedRole)) {
        mappedRole = '杂项专员';
      }
      let matchResults = smartMatchDevelopersForTask(
        { ...task, role: mappedRole },
        teamMembers,
        assignedTasks,
        currentAssignMode
      ).filter(r => r.canAssign);

      if (matchResults.length === 0) {
        matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamMembers,
          assignedTasks,
          currentAssignMode
        );
      }

      // 选择已分配次数最多、且速度不低于 0.9*团队中位速度 的成员；若无则选择速度更高者
      const sortedByFocus = [...matchResults].sort((a, b) => {
        const ca = assignCount[a.member.id] || 0;
        const cb = assignCount[b.member.id] || 0;
        if (ca !== cb) return cb - ca;
        return b.member.speed_factor - a.member.speed_factor;
      });
      let chosen = sortedByFocus.find(r => r.member.speed_factor >= 0.9 * teamMedianSpeed) || sortedByFocus[0];
      if (chosen) {
        autoSelected[idx] = chosen.member.id;
        assignCount[chosen.member.id] = (assignCount[chosen.member.id] || 0) + 1;
      } else {
        const fallbackResults = smartMatchDevelopersForTask(
          { ...task, role: '全栈工程师' },
          teamMembers,
          assignedTasks,
          currentAssignMode
        ).filter(r => r.canAssign);
        if (fallbackResults.length > 0) {
          const fb = fallbackResults.sort((a, b) => (assignCount[b.member.id]||0) - (assignCount[a.member.id]||0))[0];
          autoSelected[idx] = fb.member.id;
          assignCount[fb.member.id] = (assignCount[fb.member.id] || 0) + 1;
        } else if (teamMembers.length > 0) {
          // 终极兜底：选速度接近中位数者
          const speeds = teamMembers.map((m: any) => m.speed_factor);
          const median = (() => { const s = [...speeds].sort((a,b)=>a-b); const n=s.length; return n%2? s[(n-1)/2] : (s[n/2-1]+s[n/2])/2; })();
          const fb = [...teamMembers].sort((a: any, b: any) => Math.abs(a.speed_factor - median) - Math.abs(b.speed_factor - median))[0];
          if (fb) {
            autoSelected[idx] = fb.id;
            assignCount[fb.id] = (assignCount[fb.id] || 0) + 1;
          }
        }
      }
    });
    // 最终兜底：速度最接近中位数者
    if (teamMembers.length > 0) {
      const speeds = teamMembers.map((m: any) => m.speed_factor);
      const median = (() => { const s = [...speeds].sort((a,b)=>a-b); const n=s.length; return n%2? s[(n-1)/2] : (s[n/2-1]+s[n/2])/2; })();
      tasksToAssign.forEach((_, idx) => {
        if (!autoSelected[idx]) {
          const fb = [...teamMembers].sort((a: any, b: any) => Math.abs(a.speed_factor - median) - Math.abs(b.speed_factor - median))[0];
          if (fb) autoSelected[idx] = fb.id;
        }
      });
    }
  } else {
    tasksToAssign.forEach((task, i) => {
      let mappedRole = taskRoleMap[task.role] || task.role;
      if (!mainstreamRoles.includes(mappedRole)) {
        mappedRole = '杂项专员';
      }
      let matchResults = smartMatchDevelopersForTask(
        { ...task, role: mappedRole },
        teamMembers,
        assignedTasks,
        currentAssignMode
      ).filter(r => r.canAssign);
      if (matchResults.length === 0) {
        matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamMembers,
          assignedTasks,
          currentAssignMode
        );
      }
      // 最便宜：直接按时薪从低到高
      matchResults.sort((a, b) => a.member.hourly_rate - b.member.hourly_rate);
      const cheapest = matchResults[0];
      if (cheapest) {
        autoSelected[i] = cheapest.member.id;
      } else {
        const fallbackResults = smartMatchDevelopersForTask(
          { ...task, role: '全栈工程师' },
          teamMembers,
          assignedTasks,
          currentAssignMode
        );
        if (fallbackResults.length > 0) {
          fallbackResults.sort((a, b) => a.member.hourly_rate - b.member.hourly_rate);
          autoSelected[i] = fallbackResults[0].member.id;
        } else if (teamMembers.length > 0) {
          // 终极兜底：选全员里时薪最低者
          const fb = [...teamMembers].sort((a: any, b: any) => a.hourly_rate - b.hourly_rate)[0];
          if (fb) autoSelected[i] = fb.id;
        }
      }
    });
    // 最终兜底：全员最便宜
    if (teamMembers.length > 0) {
      tasksToAssign.forEach((_, i) => {
        if (!autoSelected[i]) {
          const fb = [...teamMembers].sort((a: any, b: any) => a.hourly_rate - b.hourly_rate)[0];
          if (fb) autoSelected[i] = fb.id;
        }
      });
    }
  }

  return autoSelected;
}



