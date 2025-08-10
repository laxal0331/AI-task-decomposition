import { describe, it, expect } from 'vitest';
import members from '../fixtures/members.json';
import tasks from '../fixtures/tasks.json';
import { performAutoAssignment } from '../../lib/services/assignment';
import { smartMatchDevelopersForTask } from '../../lib/smartMatch';

describe('performAutoAssignment', () => {
  it('每个任务都有选中', () => {
    const pick = performAutoAssignment(tasks as any, members as any, {}, 'balanced');
    expect(Object.keys(pick).length).toBe(tasks.length);
  });

  it('fast 并行，balanced 集中，slow 最便宜', () => {
    const fast = performAutoAssignment(tasks as any, members as any, {}, 'fast');
    const balanced = performAutoAssignment(tasks as any, members as any, {}, 'balanced');
    const slow = performAutoAssignment(tasks as any, members as any, {}, 'slow');
    const countBy = (p: Record<string, string>) => Object.values(p).reduce<Record<string, number>>((m, id) => { m[id] = (m[id] || 0) + 1; return m; }, {});
    const maxShare = (p: Record<string, string>) => Math.max(...Object.values(countBy(p)));
    expect(maxShare(fast) / tasks.length).toBeLessThanOrEqual(0.67);
    expect(maxShare(balanced) / tasks.length).toBeGreaterThanOrEqual(0.34);
    tasks.forEach((t, i) => {
      const cands = smartMatchDevelopersForTask({ role: (t as any).role, estimated_hours: (t as any).estimated_hours }, members as any, {}, 'slow');
      const minRate = Math.min(...cands.map(r => r.member.hourly_rate));
      const chosen = (members as any[]).find(m => m.id === (slow as any)[i])!;
      expect(chosen.hourly_rate).toBe(minRate);
    });
  });
});


