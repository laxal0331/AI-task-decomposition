import type { Task } from '../models/task';
import { smartMatchDevelopersForTask } from '../smartMatch';
import { performAutoAssignment } from './assignment';

export type AssignMode = 'slow' | 'balanced' | 'fast';

type TaskCache = {
  normalizedRole: string;
  estimatedHours: number;
  best: { fast?: string | null; balanced?: string | null; slow?: string | null };
  candidates?: { fast?: string[]; balanced?: string[]; slow?: string[] };
};

type OrderCache = {
  teamHash: string;
  tasks: { [taskId: string]: TaskCache };
};

function getLocal(key: string): any {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(window.localStorage.getItem(key) || 'null'); } catch { return null; }
}

function setLocal(key: string, value: any): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

export function computeTeamHash(members: any[]): string {
  try {
    const core = members
      .map(m => `${m.id}|${m.hourly_rate}|${m.speed_factor}|${(m.available_hours||[]).join(',')}`)
      .sort()
      .join(';');
    let h = 0; for (let i = 0; i < core.length; i++) { h = (h * 131 + core.charCodeAt(i)) >>> 0; }
    return String(h);
  } catch { return String(Date.now()); }
}

function loadOrderCache(orderId: string): OrderCache | null {
  return getLocal(`recCache:${orderId}`);
}

function saveOrderCache(orderId: string, cache: OrderCache) {
  setLocal(`recCache:${orderId}`, cache);
}

export function getOrComputeAssignments(
  orderId: string | undefined,
  tasks: Task[],
  members: any[],
  mode: AssignMode
): { [taskIdx: number]: string } {
  const byIdx: { [i: number]: string } = {};
  if (!orderId) {
    return byIdx;
  }
  const teamHash = computeTeamHash(members);
  const cache = loadOrderCache(orderId) || { teamHash, tasks: {} as { [taskId: string]: TaskCache } };
  const useCache = cache.teamHash === teamHash;
  tasks.forEach((t, idx) => {
    const tc = cache.tasks[t.id];
    if (
      useCache &&
      tc &&
      tc.normalizedRole === t.role &&
      tc.estimatedHours === (t as any).estimated_hours &&
      tc.best && tc.best[mode] && typeof tc.best[mode] === 'string'
    ) {
      byIdx[idx] = tc.best[mode] as string;
    }
  });
  // compute missing
  const missing = tasks.filter((_, idx) => !byIdx[idx]);
  if (missing.length > 0) {
    // 使用全局分配以获得“最快模式并行、均衡集中、最便宜”等跨任务策略
    const globalPick = performAutoAssignment(tasks as any, members as any, {}, mode);
    tasks.forEach((t, idx) => {
      const best = globalPick[idx] || null;
      if (!cache.tasks[t.id]) cache.tasks[t.id] = { normalizedRole: t.role, estimatedHours: (t as any).estimated_hours, best: {}, candidates: {} };
      cache.tasks[t.id].normalizedRole = t.role;
      cache.tasks[t.id].estimatedHours = (t as any).estimated_hours;
      cache.tasks[t.id].best[mode] = best;
      if (best && !byIdx[idx]) byIdx[idx] = best;
    });
    cache.teamHash = teamHash;
    saveOrderCache(orderId, cache);
  }
  return byIdx;
}

export function snapshotCandidates(orderId: string, tasks: Task[], members: any[], onlyIfMissing: boolean = false) {
  if (!orderId) return;
  const cache = loadOrderCache(orderId) || { teamHash: computeTeamHash(members), tasks: {} as { [taskId: string]: TaskCache } };
  for (const t of tasks) {
    if (!cache.tasks[t.id]) cache.tasks[t.id] = { normalizedRole: t.role, estimatedHours: (t as any).estimated_hours, best: {}, candidates: {} };
    if (onlyIfMissing && cache.tasks[t.id].candidates && Object.keys(cache.tasks[t.id].candidates!).length >= 3) continue;
    const modes: AssignMode[] = ['fast','balanced','slow'];
    for (const m of modes) {
      const results = smartMatchDevelopersForTask(
        { role: t.role, estimated_hours: (t as any).estimated_hours },
        members,
        {},
        m
      );
      cache.tasks[t.id].candidates = cache.tasks[t.id].candidates || {};
      cache.tasks[t.id].candidates![m] = results.map(r => r.member.id);
    }
  }
  cache.teamHash = computeTeamHash(members);
  saveOrderCache(orderId, cache);
}

export function getPresetCandidateIds(orderId: string | undefined, taskId: string | undefined, mode: AssignMode): string[] {
  if (!orderId || !taskId) return [];
  const cache = loadOrderCache(orderId);
  if (!cache) return [];
  const tc = cache.tasks[taskId];
  if (!tc || !tc.candidates) return [];
  return (tc.candidates[mode] || []).slice();
}


