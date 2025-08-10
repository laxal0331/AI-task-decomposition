import { STATUS } from '../constants/status';

export function calculateEstimatedCompletionTime(tasks: any[], selectedMembers: { [taskIdx: number]: string | null }, teamData: any[], assignMode: 'fast' | 'balanced' | 'slow') {
  if (tasks.length === 0) return null;

  if (Object.keys(selectedMembers).length > 0) {
    const memberWorkload: { [memberId: string]: number } = {};
    tasks.forEach((task, index) => {
      const memberId = selectedMembers[index];
      if (memberId) {
        const member = teamData.find(m => m.id === memberId);
        if (member) {
          const actualHours = task.estimated_hours / member.speed_factor;
          memberWorkload[memberId] = (memberWorkload[memberId] || 0) + actualHours;
        }
      }
    });
    const maxWorkload = Math.max(...Object.values(memberWorkload));
    const hoursPerDay = 8;
    const daysPerWeek = 5;
    const hoursPerWeek = hoursPerDay * daysPerWeek;
    const weeksNeeded = Math.ceil(maxWorkload / hoursPerWeek);
    const daysNeeded = Math.ceil(maxWorkload / hoursPerDay);
    return { totalHours: Object.values(memberWorkload).reduce((s, h) => s + h, 0), weeksNeeded, daysNeeded, hoursPerDay, hoursPerWeek };
  }

  let estimatedWeeks = 0;
  if (assignMode === 'fast') {
    const maxTaskHours = Math.max(...tasks.map(t => t.estimated_hours));
    const hoursPerWeek = 8 * 5;
    estimatedWeeks = Math.ceil(maxTaskHours / hoursPerWeek);
  } else if (assignMode === 'balanced') {
    const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
    const hoursPerWeek = 8 * 5;
    estimatedWeeks = Math.ceil(totalHours / hoursPerWeek / 2);
  } else {
    const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
    const hoursPerWeek = 8 * 5;
    estimatedWeeks = Math.ceil(totalHours / hoursPerWeek);
  }
  const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
  const daysNeeded = Math.ceil(totalHours / 8);
  return { totalHours, weeksNeeded: estimatedWeeks, daysNeeded, hoursPerDay: 8, hoursPerWeek: 40 };
}

export function calculateTotalCost(tasks: any[], selectedMembers: { [taskIdx: number]: string | null }, teamData: any[]) {
  if (tasks.length === 0 || Object.keys(selectedMembers).length === 0) return null;
  let totalCost = 0;
  let totalHours = 0;
  tasks.forEach((task, index) => {
    const memberId = selectedMembers[index];
    if (memberId) {
      const member = teamData.find(m => m.id === memberId);
      if (member) {
        totalCost += task.estimated_hours * member.hourly_rate;
        totalHours += task.estimated_hours;
      }
    }
  });
  return { totalCost, totalHours, averageHourlyRate: totalHours > 0 ? totalCost / totalHours : 0 };
}


