// 强制保存团队成员数据（包含新的技能翻译）
console.log('=== 强制保存团队成员数据（包含技能翻译） ===');

// 模拟团队成员数据（使用新的技能格式，包含通用技能）
const teamMembers = [
  {
    id: '1',
    name: '成员1',
    name_zh: '成员1',
    name_en: 'Member1',
    roles: ['前端工程师'],
    skills: ['React', 'Vue', 'TypeScript', '通用技能', '学习能力'],
    available_hours: [40, 35, 30, 25],
    experience_score: 85,
    hourly_rate: 120,
    speed_factor: 1.2
  },
  {
    id: '2',
    name: '成员2',
    name_zh: '成员2',
    name_en: 'Member2',
    roles: ['后端工程师'],
    skills: ['Node.js', 'Java', '数据库', '沟通协调', '问题解决'],
    available_hours: [35, 40, 35, 30],
    experience_score: 90,
    hourly_rate: 130,
    speed_factor: 1.3
  },
  {
    id: '3',
    name: '成员3',
    name_zh: '成员3',
    name_en: 'Member3',
    roles: ['UI设计师'],
    skills: ['UI设计', 'Figma', 'Photoshop', '团队合作', '创新思维'],
    available_hours: [30, 35, 40, 35],
    experience_score: 88,
    hourly_rate: 110,
    speed_factor: 1.1
  },
  {
    id: '4',
    name: '成员4',
    name_zh: '成员4',
    name_en: 'Member4',
    roles: ['杂项专员'],
    skills: ['通用技能', '学习能力', '沟通协调', '问题解决', '团队合作'],
    available_hours: [25, 30, 35, 40],
    experience_score: 95,
    hourly_rate: 100,
    speed_factor: 1.0
  }
];

// 保存到 localStorage
if (typeof window !== 'undefined') {
  localStorage.setItem('teamMembers', JSON.stringify(teamMembers));
  console.log('✅ 团队成员数据已保存到 localStorage');
  console.log('团队成员数量:', teamMembers.length);
} else {
  console.log('服务器端环境，无法保存到 localStorage');
}

console.log('示例成员数据:');
teamMembers.forEach((member, index) => {
  console.log(`成员 ${index + 1}:`, {
    id: member.id,
    name: member.name,
    roles: member.roles,
    skills: member.skills,
    hourly_rate: member.hourly_rate,
    speed_factor: member.speed_factor
  });
});

console.log('技能翻译测试:');
const testSkills = ['通用技能', '学习能力', '沟通协调', '问题解决', '团队合作'];
console.log('中文技能:', testSkills);
console.log('英文技能:', testSkills.map(skill => {
  const skillMap = {
    '通用技能': 'General Skills',
    '学习能力': 'Learning Ability',
    '沟通协调': 'Communication & Coordination',
    '问题解决': 'Problem Solving',
    '团队合作': 'Teamwork'
  };
  return skillMap[skill] || skill;
})); 