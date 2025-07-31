// 测试环境变量配置
require('dotenv').config({ path: '.env.local' });

console.log('=== 环境变量测试 ===');
console.log('DEEPSEEK_API_KEY 存在:', !!process.env.DEEPSEEK_API_KEY);
console.log('OPENAI_API_KEY 存在:', !!process.env.OPENAI_API_KEY);
console.log('SUPABASE_URL 存在:', !!process.env.SUPABASE_URL);
console.log('SUPABASE_ANON_KEY 存在:', !!process.env.SUPABASE_ANON_KEY);

console.log('\n=== API密钥长度 ===');
console.log('DEEPSEEK_API_KEY 长度:', process.env.DEEPSEEK_API_KEY?.length || 0);
console.log('OPENAI_API_KEY 长度:', process.env.OPENAI_API_KEY?.length || 0);
console.log('SUPABASE_URL 长度:', process.env.SUPABASE_URL?.length || 0);
console.log('SUPABASE_ANON_KEY 长度:', process.env.SUPABASE_ANON_KEY?.length || 0);

console.log('\n=== 测试完成 ==='); 