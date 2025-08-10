export async function decompose(goal: string, assignMode: 'slow' | 'balanced' | 'fast', lang: 'zh' | 'en') {
  const res = await fetch('/api/decompose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal, assignMode, lang }),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const contentType = res.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error('API返回的不是JSON格式');
  }
  return res.json();
}


