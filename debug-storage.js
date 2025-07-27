// 调试localStorage数据
console.log('=== 调试localStorage数据 ===');

// 检查localStorage中的数据
if (typeof window !== 'undefined') {
  console.log('localStorage中的orders:', localStorage.getItem('orders'));
  console.log('localStorage中的tasks:', localStorage.getItem('tasks'));
  console.log('localStorage中的teamMembers:', localStorage.getItem('teamMembers'));
  
  try {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    const teamMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
    
    console.log('解析后的orders数量:', orders.length);
    console.log('解析后的tasks数量:', tasks.length);
    console.log('解析后的teamMembers数量:', teamMembers.length);
    
    if (orders.length > 0) {
      console.log('最新订单:', orders[orders.length - 1]);
    }
    
    if (tasks.length > 0) {
      console.log('最新任务:', tasks[tasks.length - 1]);
    }
  } catch (error) {
    console.error('解析localStorage数据失败:', error);
  }
} else {
  console.log('在服务器端运行，无法访问localStorage');
}

console.log('=== 调试完成 ==='); 