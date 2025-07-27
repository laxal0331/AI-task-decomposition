// 简单的团队成员数据测试
console.log('=== 团队成员数据测试 ===');

// 模拟团队成员数据
const mockTeamData = [
  { id: '1', name: '前端工程师1', roles: ['前端工程师'], skills: ['React', 'Vue', 'TypeScript'] },
  { id: '2', name: '后端工程师1', roles: ['后端工程师'], skills: ['Node.js', 'Java', 'Spring'] },
  { id: '3', name: 'UI设计师1', roles: ['UI设计师'], skills: ['UI设计', 'Figma', 'Photoshop'] },
  { id: '4', name: 'UX设计师1', roles: ['UX设计师'], skills: ['UX设计', '用户体验', '原型设计'] },
  { id: '5', name: '测试工程师1', roles: ['测试工程师'], skills: ['测试', '自动化', 'Jest'] },
  { id: '6', name: '数据库工程师1', roles: ['数据库工程师'], skills: ['数据库', 'SQL', '数据建模'] },
  { id: '7', name: '产品经理1', roles: ['产品经理'], skills: ['项目管理', '需求分析', '原型设计'] },
  { id: '8', name: 'DevOps工程师1', roles: ['DevOps工程师'], skills: ['CI/CD', '云服务', '自动化'] },
  { id: '9', name: '全栈工程师1', roles: ['全栈工程师'], skills: ['Node.js', 'React', '数据库'] },
  { id: '10', name: '移动端工程师1', roles: ['移动端工程师'], skills: ['Flutter', 'React Native', 'iOS'] },
  { id: '11', name: '运维工程师1', roles: ['运维工程师'], skills: ['Linux', 'Docker', '监控'] },
  { id: '12', name: '安全工程师1', roles: ['安全工程师'], skills: ['网络安全', '渗透测试', '安全审计'] },
  { id: '13', name: '算法工程师1', roles: ['算法工程师'], skills: ['机器学习', '深度学习', 'Python'] },
  { id: '14', name: '数据分析师1', roles: ['数据分析师'], skills: ['数据分析', 'SQL', 'Python'] },
  { id: '15', name: '架构师1', roles: ['架构师'], skills: ['系统架构', '微服务', '高可用'] },
  { id: '16', name: '技术经理1', roles: ['技术经理'], skills: ['技术管理', '团队管理', '项目管理'] },
  { id: '17', name: '项目经理1', roles: ['项目经理'], skills: ['项目管理', '团队协调', '进度控制'] },
  { id: '18', name: '业务分析师1', roles: ['业务分析师'], skills: ['需求分析', '业务流程', '数据分析'] },
  { id: '19', name: '内容运营1', roles: ['内容运营'], skills: ['内容创作', '文案撰写', '社交媒体'] },
  { id: '20', name: '市场专员1', roles: ['市场专员'], skills: ['市场推广', '品牌营销', '活动策划'] },
  { id: '21', name: '客服专员1', roles: ['客服专员'], skills: ['客户服务', '问题解决', '沟通协调'] },
  { id: '22', name: '财务专员1', roles: ['财务专员'], skills: ['财务管理', '会计核算', '税务处理'] },
  { id: '23', name: '人事专员1', roles: ['人事专员'], skills: ['招聘', '培训', '绩效考核'] },
  { id: '24', name: '行政专员1', roles: ['行政专员'], skills: ['行政管理', '办公协调', '文档管理'] },
  { id: '25', name: '杂项专员1', roles: ['杂项专员'], skills: ['通用技能', '学习能力', '沟通协调'] }
];

console.log(`总成员数量: ${mockTeamData.length}`);

// 统计角色分布
const roleCounts = {};
mockTeamData.forEach(member => {
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

console.log('\n=== 所有职位类别 ===');
const allRoles = Object.keys(roleCounts);
console.log(`共 ${allRoles.length} 个职位类别:`);
allRoles.forEach(role => console.log(`- ${role}`));

console.log('\n=== 示例成员 ===');
mockTeamData.slice(0, 5).forEach(member => {
  console.log(`ID: ${member.id}, 姓名: ${member.name}, 角色: ${member.roles.join(', ')}, 技能: ${member.skills.slice(0, 3).join(', ')}`);
});

console.log('\n=== 测试完成 ==='); 