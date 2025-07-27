// 测试数据保存和读取
import { orders, tasks, teamMembers, saveAllData } from './lib/dataStore.js';

console.log('=== 数据测试 ===');
console.log(`团队成员数量: ${teamMembers.length}`);
console.log(`订单数量: ${orders.length}`);
console.log(`任务数量: ${tasks.length}`);

if (orders.length > 0) {
  console.log('\n=== 最新订单 ===');
  const latestOrder = orders[orders.length - 1];
  console.log(`订单ID: ${latestOrder.id}`);
  console.log(`目标: ${latestOrder.goal}`);
  console.log(`状态: ${latestOrder.status}`);
  console.log(`任务数量: ${latestOrder.task_count}`);
  
  // 查找该订单的任务
  const orderTasks = tasks.filter(task => task.order_id === latestOrder.id);
  console.log(`实际任务数量: ${orderTasks.length}`);
  
  if (orderTasks.length > 0) {
    console.log('\n=== 任务示例 ===');
    orderTasks.slice(0, 3).forEach(task => {
      console.log(`任务ID: ${task.id}, 标题: ${task.title_zh}, 角色: ${task.role_zh}, 状态: ${task.status}`);
    });
  }
}

console.log('\n=== 测试完成 ==='); 