const fetch = require('node-fetch');

async function testApiResponse() {
  try {
    console.log('=== 测试API返回数据 ===');
    
    const response = await fetch('http://localhost:3000/api/members');
    const data = await response.json();
    
    console.log('API响应状态:', response.status);
    console.log('API响应数据:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.members && data.members.length > 0) {
      console.log('\n=== 第一个开发者数据详情 ===');
      const firstDev = data.members[0];
      console.log('ID:', firstDev.id);
      console.log('姓名:', firstDev.name);
      console.log('角色 (raw):', firstDev.roles);
      console.log('角色类型:', typeof firstDev.roles);
      console.log('可用工时 (raw):', firstDev.available_hours);
      console.log('可用工时类型:', typeof firstDev.available_hours);
      console.log('技能 (raw):', firstDev.skills);
      console.log('技能类型:', typeof firstDev.skills);
      
      // 检查角色显示
      if (Array.isArray(firstDev.roles)) {
        console.log('角色数组第一个元素:', firstDev.roles[0]);
      } else if (typeof firstDev.roles === 'string') {
        try {
          const parsedRoles = JSON.parse(firstDev.roles);
          console.log('解析后的角色:', parsedRoles);
        } catch (e) {
          console.log('角色字符串解析失败:', e.message);
        }
      }
      
      // 检查可用工时显示
      if (Array.isArray(firstDev.available_hours)) {
        console.log('可用工时数组:', firstDev.available_hours);
        console.log('可用工时字符串:', firstDev.available_hours.join('/'));
      } else if (typeof firstDev.available_hours === 'string') {
        console.log('可用工时字符串:', firstDev.available_hours);
      }
    }
    
  } catch (error) {
    console.error('测试API失败:', error);
  }
}

testApiResponse(); 