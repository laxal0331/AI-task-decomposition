import type { Task } from '../models/task';

export function isDevOverCapacity(dev: any, taskIdx: number, tasks: Task[], selectedMembers: { [taskIdx: number]: string | null }): boolean {
  let used = 0;
  Object.entries(selectedMembers).forEach(([idx, devId]) => {
    if (parseInt(idx) !== taskIdx && devId === dev.id) {
      used += tasks[parseInt(idx)]?.estimated_hours || 0;
    }
  });
  const thisTaskHours = tasks[taskIdx]?.estimated_hours || 0;
  return used + thisTaskHours > dev.available_hours;
}


