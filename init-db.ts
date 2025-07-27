import { teamMembers, saveAllData } from './lib/dataStore';
import { seedTeamMembers } from './lib/teamData';

console.log('=== 重新初始化团队成员数据 ===');

// 清空现有数据
teamMembers.length = 0;

// 重新生成团队成员数据
seedTeamMembers(async (members) => {
  console.log('生成团队成员数量:', members.length);
  
  // 将新成员数据添加到全局存储
  teamMembers.push(...members);
  
  // 保存到数据库
  await saveAllData();
  
  console.log('✅ 团队成员数据初始化完成');
  console.log('团队成员数量:', teamMembers.length);
  
  // 显示一些示例数据
  console.log('示例成员数据:');
  members.slice(0, 3).forEach((member, index) => {
    console.log(`成员 ${index + 1}:`, {
      id: member.id,
      name: member.name,
      roles: member.roles,
      skills: member.skills.slice(0, 3), // 只显示前3个技能
      hourly_rate: member.hourly_rate,
      speed_factor: member.speed_factor
    });
  });
  
  process.exit(0);
}); 