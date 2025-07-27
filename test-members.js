// 测试团队成员数据
import { teamMembers } from './lib/dataStore.js';

console.log('=== 团队成员数据测试 ===');
console.log(`总成员数量: ${teamMembers.length}`);

// 统计角色分布
const roleCounts = {};
teamMembers.forEach(member => {
  member.roles.forEach(role => {
    roleCounts[role] = (roleCounts[role] || 0) + 1;
  });
});

console.log('\n=== 角色分布 ===');
Object.entries(roleCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([role, count]) => {
    console.log(`${role}: ${count}人`);
  });

console.log('\n=== 示例成员 ===');
teamMembers.slice(0, 5).forEach(member => {
  console.log(`ID: ${member.id}, 姓名: ${member.name}, 角色: ${member.roles.join(', ')}, 技能: ${member.skills.slice(0, 3).join(', ')}`);
});

console.log('\n=== 测试完成 ==='); 