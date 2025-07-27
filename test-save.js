// 测试数据保存功能
import { orders, tasks, saveAllData, debugData } from './lib/dataStore.js';

console.log('=== 测试数据保存 ===');

// 添加测试订单
const testOrder = {
  id: 'test_order_1',
  goal: '测试项目',
  assign_mode: 'slow',
  status: '未开始',
  task_count: 2,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

// 添加测试任务
const testTask1 = {
  id: 'test_task_1',
  order_id: 'test_order_1',
  title_zh: '测试任务1',
  title_en: 'Test Task 1',
  role_zh: '前端工程师',
  role_en: 'Frontend Engineer',
  estimated_hours: 8,
  status: 'PENDING',
  assigned_member_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const testTask2 = {
  id: 'test_task_2',
  order_id: 'test_order_1',
  title_zh: '测试任务2',
  title_en: 'Test Task 2',
  role_zh: '后端工程师',
  role_en: 'Backend Engineer',
  estimated_hours: 12,
  status: 'PENDING',
  assigned_member_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

console.log('添加测试数据前:');
debugData();

// 添加测试数据
orders.push(testOrder);
tasks.push(testTask1);
tasks.push(testTask2);

console.log('\n添加测试数据后:');
debugData();

// 保存数据
console.log('\n保存数据...');
saveAllData();

console.log('\n保存数据后:');
debugData();

console.log('=== 测试完成 ==='); 