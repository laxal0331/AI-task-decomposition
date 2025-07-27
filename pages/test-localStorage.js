// 测试localStorage数据
console.log('=== 测试localStorage数据 ===');

// 检查localStorage中的数据
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
const members = JSON.parse(localStorage.getItem('teamMembers') || '[]');

console.log('orders数量:', orders.length);
console.log('tasks数量:', tasks.length);
console.log('members数量:', members.length);

if (orders.length > 0) {
  console.log('最新订单:', orders[orders.length - 1]);
}

if (tasks.length > 0) {
  console.log('最新任务:', tasks[tasks.length - 1]);
  
  // 检查任务分配情况
  const assignedTasks = tasks.filter(t => t.assigned_member_id);
  console.log('已分配任务数量:', assignedTasks.length);
  
  assignedTasks.forEach((task, index) => {
    console.log(`任务 ${index + 1}:`, {
      id: task.id,
      title: task.title_zh || task.title,
      assigned_member_id: task.assigned_member_id,
      assigned_member_name: task.assigned_member_name,
      status: task.status
    });
  });
}

// 检查所有localStorage键
console.log('localStorage中的所有键:', Object.keys(localStorage));

// 测试特定成员ID的任务
const testMemberId = '1'; // 可以修改这个ID来测试
const memberTasks = tasks.filter(t => String(t.assigned_member_id) === String(testMemberId));
console.log(`成员ID ${testMemberId} 的任务数量:`, memberTasks.length);
memberTasks.forEach((task, index) => {
  console.log(`成员 ${testMemberId} 的任务 ${index + 1}:`, {
    id: task.id,
    title: task.title_zh || task.title,
    status: task.status
  });
});

console.log('=== 测试完成 ==='); 