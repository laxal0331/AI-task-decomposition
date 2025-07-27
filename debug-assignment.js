// 调试任务分配问题
console.log('=== 开始调试任务分配问题 ===');

// 1. 检查localStorage数据
console.log('\n1. 检查localStorage数据:');
const orders = JSON.parse(localStorage.getItem('orders') || '[]');
const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');

console.log('订单数量:', orders.length);
console.log('任务数量:', tasks.length);
console.log('团队成员数量:', teamMembers.length);

if (orders.length > 0) {
  console.log('最新订单:', orders[orders.length - 1]);
}

if (tasks.length > 0) {
  console.log('任务分配情况:');
  tasks.forEach((task, index) => {
    console.log(`任务 ${index}:`, {
      id: task.id,
      name: task.name_zh || task.title,
      assigned_member_id: task.assigned_member_id,
      assigned_member_name: task.assigned_member_name,
      status: task.status,
      order_id: task.order_id
    });
  });
}

// 2. 检查API数据
console.log('\n2. 检查API数据:');
async function checkAPIData() {
  try {
    // 检查订单API
    const ordersRes = await fetch('/api/orders');
    const ordersData = await ordersRes.json();
    console.log('API订单数据:', ordersData);
    
    // 检查成员API
    const membersRes = await fetch('/api/members');
    const membersData = await membersRes.json();
    console.log('API成员数据数量:', membersData.members?.length || 0);
    
    // 如果有订单，检查具体订单的任务
    if (ordersData.orders && ordersData.orders.length > 0) {
      const latestOrder = ordersData.orders[0];
      console.log('最新订单ID:', latestOrder.id);
      
      const orderTasksRes = await fetch(`/api/orders?orderId=${latestOrder.id}`);
      const orderTasksData = await orderTasksRes.json();
      console.log('订单任务数据:', orderTasksData);
    }
  } catch (error) {
    console.error('API检查失败:', error);
  }
}

// 3. 检查任务分配逻辑
console.log('\n3. 检查任务分配逻辑:');
function checkAssignmentLogic() {
  console.log('当前页面任务数量:', window.tasks?.length || 0);
  console.log('当前页面团队成员数量:', window.teamData?.length || 0);
  
  if (window.tasks && window.teamData) {
    console.log('任务分配测试:');
    window.tasks.forEach((task, index) => {
      console.log(`任务 ${index}:`, {
        id: task.id,
        name: task.name_zh || task.title,
        role: task.role,
        estimated_hours: task.estimated_hours
      });
    });
  }
}

// 4. 检查smartMatch函数
console.log('\n4. 检查smartMatch函数:');
function testSmartMatch() {
  if (window.smartMatchDevelopersForTask && window.teamData && window.tasks) {
    const testTask = window.tasks[0];
    if (testTask) {
      console.log('测试任务:', testTask);
      const recommendations = window.smartMatchDevelopersForTask(testTask, window.teamData, {}, 'fast');
      console.log('推荐结果:', recommendations);
    }
  }
}

// 5. 检查页面状态
console.log('\n5. 检查页面状态:');
function checkPageState() {
  console.log('当前URL:', window.location.href);
  console.log('页面标题:', document.title);
  
  // 检查是否有任务分配相关的元素
  const taskElements = document.querySelectorAll('[data-task-id]');
  console.log('任务元素数量:', taskElements.length);
  
  const memberElements = document.querySelectorAll('.member-badge');
  console.log('成员元素数量:', memberElements.length);
}

// 6. 检查控制台错误
console.log('\n6. 检查控制台错误:');
function checkConsoleErrors() {
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args);
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.log('捕获的错误:', errors);
    console.error = originalError;
  }, 1000);
}

// 执行所有检查
checkAPIData();
checkAssignmentLogic();
testSmartMatch();
checkPageState();
checkConsoleErrors();

// 7. 提供修复建议
console.log('\n7. 修复建议:');
console.log('- 如果localStorage数据为空，需要重新进行任务分解');
console.log('- 如果API返回404，需要检查服务器端数据同步');
console.log('- 如果任务未分配，需要检查分配逻辑');
console.log('- 如果成员数据为空，需要检查成员API');

console.log('\n=== 调试完成 ==='); 