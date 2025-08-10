export async function getOrders() {
  const res = await fetch('/api/orders');
  if (!res.ok) throw new Error(`API错误: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function getOrderById(orderId: string) {
  const res = await fetch(`/api/orders?orderId=${orderId}`);
  if (!res.ok) throw new Error(`获取订单失败: ${res.status}`);
  return res.json();
}

export async function deleteOrder(orderId: string) {
  const res = await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
  return res; // 调用方根据 ok 判断
}


