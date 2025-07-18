// 测试分配流程的脚本

async function testAssignment() {
  try {
    console.log('=== 开始测试分配流程 ===');
    
    // 1. 创建任务
    console.log('1. 创建任务...');
    const decomposeResponse = await fetch('http://localhost:3000/api/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        goal: '开发一个简单的待办事项应用',
        assignMode: 'balanced'
      })
    });
    
    const decomposeData = await decomposeResponse.json();
    console.log('任务创建结果:', decomposeData);
    
    if (!decomposeData.orderId) {
      throw new Error('任务创建失败');
    }
    
    const orderId = decomposeData.orderId;
    console.log('订单ID:', orderId);
    
    // 2. 构建分配数据
    console.log('2. 构建分配数据...');
    const assignments = decomposeData.tasks.map((task, index) => ({
      taskId: task.id,
      memberId: `member${index + 1}` // 模拟成员ID
    }));
    
    console.log('分配数据:', assignments);
    
    // 3. 执行分配
    console.log('3. 执行分配...');
    const assignResponse = await fetch('http://localhost:3000/api/assign-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignments })
    });
    
    const assignData = await assignResponse.json();
    console.log('分配结果:', assignData);
    
    // 4. 查询分配结果
    console.log('4. 查询分配结果...');
    const ordersResponse = await fetch(`http://localhost:3000/api/orders?orderId=${orderId}`);
    const ordersData = await ordersResponse.json();
    console.log('查询结果:', JSON.stringify(ordersData, null, 2));
    
    // 5. 检查数据库
    console.log('5. 检查数据库中的分配状态...');
    const { exec } = require('child_process');
    exec(`mysql -u root -p -e "USE ai_remote_pm; SELECT id, title_zh, assigned_member_id FROM tasks WHERE order_id = '${orderId}';"`, (error, stdout, stderr) => {
      if (error) {
        console.error('数据库查询错误:', error);
        return;
      }
      console.log('数据库中的任务分配状态:');
      console.log(stdout);
    });
    
  } catch (error) {
    console.error('测试失败:', error);
  }
}

testAssignment(); 