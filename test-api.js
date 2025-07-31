// 测试API调用
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('开始测试API...');
    
    const response = await fetch('http://localhost:3004/api/decompose', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        goal: '测试项目',
        assignMode: 'balanced',
        lang: 'zh'
      })
    });
    
    console.log('响应状态:', response.status);
    console.log('响应头:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('响应内容:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('解析后的数据:', data);
    }
  } catch (error) {
    console.error('API测试失败:', error);
  }
}

testAPI(); 