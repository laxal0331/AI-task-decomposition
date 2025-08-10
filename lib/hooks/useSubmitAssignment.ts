import { useCallback } from 'react';
import type { Task } from '../models/task';

export function useSubmitAssignment() {
  const buildAssignments = useCallback((tasks: Task[], selectedMembers: { [taskIdx: number]: string | null }) => {
    const all: Array<{ taskId: string; memberId: string | null }> = [];
    for (let i = 0; i < tasks.length; i++) {
      const memberId = selectedMembers[i];
      if (memberId) all.push({ taskId: tasks[i].id, memberId });
    }
    return all;
  }, []);

  const submitAssignments = useCallback(async (assignments: Array<{ taskId: string; memberId: string | null }>, orderId: string | string[] | null | undefined) => {
    const res = await fetch('/api/assign-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments, orderId })
    });
    if (!res.ok) throw new Error(`分配任务失败: ${res.status} ${res.statusText}`);
    return res.json();
  }, []);

  return { buildAssignments, submitAssignments };
}


