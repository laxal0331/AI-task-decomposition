export async function getMembers() {
  const res = await fetch('/api/members');
  if (!res.ok) throw new Error(`获取成员失败: ${res.status}`);
  return res.json();
}


