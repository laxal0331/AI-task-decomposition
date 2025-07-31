// 测试数据库连接
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key 存在:', !!supabaseAnonKey);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testDatabase() {
  try {
    console.log('=== 数据库连接测试 ===');
    
    // 测试团队成员表
    console.log('测试团队成员表...');
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .limit(5);
    
    if (membersError) {
      console.error('团队成员查询错误:', membersError);
    } else {
      console.log('团队成员数量:', members?.length || 0);
      console.log('团队成员示例:', members?.[0]);
    }
    
    // 测试订单表
    console.log('\n测试订单表...');
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('*')
      .limit(5);
    
    if (ordersError) {
      console.error('订单查询错误:', ordersError);
    } else {
      console.log('订单数量:', orders?.length || 0);
    }
    
    // 测试任务表
    console.log('\n测试任务表...');
    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .limit(5);
    
    if (tasksError) {
      console.error('任务查询错误:', tasksError);
    } else {
      console.log('任务数量:', tasks?.length || 0);
    }
    
  } catch (error) {
    console.error('数据库测试失败:', error);
  }
}

testDatabase(); 