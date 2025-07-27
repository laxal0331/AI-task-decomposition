// 直接测试数据保存
console.log('=== 直接测试数据保存 ===');

// 模拟分解的过程
const testOrderId = Date.now().toString();
console.log('创建订单ID:', testOrderId);

// 创建测试订单
const testOrder = {
  id: testOrderId,
  goal: '测试项目直接保存',
  assign_mode: 'slow',
  status: '未开始',
  task_count: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// 创建测试任务
const testTask1 = {
  id: `${testOrderId}_0`,
  order_id: testOrderId,
  title_zh: '前端开发',
  title_en: 'Frontend Development',
  role_zh: '前端工程师',
  role_en: 'Frontend Engineer',
  estimated_hours: 20,
  status: 'PENDING',
  assigned_member_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const testTask2 = {
  id: `${testOrderId}_1`,
  order_id: testOrderId,
  title_zh: '后端开发',
  title_en: 'Backend Development',
  role_zh: '后端工程师',
  role_en: 'Backend Engineer',
  estimated_hours: 25,
  status: 'PENDING',
  assigned_member_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// 直接保存到localStorage（模拟客户端保存）
if (typeof localStorage !== 'undefined') {
  console.log('客户端环境，保存到localStorage');
  
  // 读取现有数据
  const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  
  console.log('现有订单数量:', existingOrders.length);
  console.log('现有任务数量:', existingTasks.length);
  
  // 添加新数据
  existingOrders.push(testOrder);
  existingTasks.push(testTask1);
  existingTasks.push(testTask2);
  
  // 保存数据
  localStorage.setItem('orders', JSON.stringify(existingOrders));
  localStorage.setItem('tasks', JSON.stringify(existingTasks));
  
  console.log('保存后订单数量:', existingOrders.length);
  console.log('保存后任务数量:', existingTasks.length);
  
  // 验证保存
  const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  
  console.log('验证订单数量:', savedOrders.length);
  console.log('验证任务数量:', savedTasks.length);
  
  if (savedOrders.length > 0) {
    console.log('最新订单:', savedOrders[savedOrders.length - 1]);
  }
  
} else {
  console.log('服务器端环境，无法访问localStorage');
}

console.log('=== 测试完成 ==='); 