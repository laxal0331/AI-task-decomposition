export async function submitAssignments(assignments: Array<{ taskId: string; memberId: string | null }>, orderId: string | string[] | null | undefined) {
  const clean = assignments.filter(a => a.memberId);
  const res = await fetch('/api/assign-tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assignments: clean, orderId }),
  });
  if (!res.ok) throw new Error(`分配任务失败: ${res.status} ${res.statusText}`);
  return res.json();
}


