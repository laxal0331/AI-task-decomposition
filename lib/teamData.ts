export type TeamMember = {
  id: string;
  name: string;
  name_zh?: string;
  name_en?: string;
  roles: string[];
  skills: string[];
  available_hours: number[]; // 未来四周每周可用工时
  experience_score: number;
  hourly_rate: number;
  speed_factor: number; // 新增，完成任务速度倍率
};

const mainstreamRoles = [
  '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
  '产品经理', 'DevOps工程师', '全栈工程师'
];
const allRoles = [...mainstreamRoles, '杂项专员'];
const allSkills = [
  'React', 'Vue', 'TypeScript', 'Node.js', 'Java', 'Spring', '数据库', 'SQL', 'API设计',
  'UI设计', 'UX设计', '用户体验', 'Figma', 'Photoshop', 'Sketch', '测试', '自动化', 'Jest', '敏捷开发', '项目管理',
  '部署', 'CI/CD', '云服务', '数据建模', 'Go', 'Python'
];

function randomFromArray<T>(arr: T[], count: number) {
  const copy = [...arr];
  const res: T[] = [];
  while (res.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    res.push(copy.splice(idx, 1)[0]);
  }
  return res;
}

// 扩大数据库规模，确保每个角色至少20人
const roleDistribution: Record<string, number> = {
  '前端工程师': 40,      // 20%
  '后端工程师': 40,      // 20%
  'UI设计师': 30,        // 15%
  'UX设计师': 20,        // 10%
  '用户体验设计师': 20,   // 10%
  '测试工程师': 30,       // 15%
  '数据库工程师': 20,     // 10%
  '产品经理': 30,         // 15%
  'DevOps工程师': 20,     // 10%
  '全栈工程师': 30        // 15%
};

// 生成团队成员，主角色严格按比例分配
const teamData: TeamMember[] = [];
let memberIdx = 1;
Object.entries(roleDistribution).forEach(([role, count]) => {
  for (let i = 0; i < count; i++) {
    // 70%单角色，30%多角色
    const roleCount = Math.random() < 0.7 ? 1 : 2;
    let roles = [role];
    if (roleCount === 2) {
      // 除主角色外再随机分配一个不同角色，非主流职位一律用"杂项专员"
      const otherRoles = mainstreamRoles.filter(r => r !== role);
      const extraRole = otherRoles.length > 0 ? randomFromArray(otherRoles, 1)[0] : '杂项专员';
      roles = [role, extraRole];
    }
    const skills = randomFromArray(allSkills, 3 + Math.floor(Math.random() * 4));
    const available_hours = Array.from({ length: 4 }).map(() => 20 + Math.floor(Math.random() * 21)); // 20~40
    const experience_score = 70 + Math.floor(Math.random() * 31); // 70~100
    // 先生成时薪
    const hourly_rate = 90 + Math.floor(Math.random() * 71); // 90~160
    // speed_factor 与 hourly_rate 正相关，归一化到 0.8~1.5
    const speed_factor = 0.8 + ((hourly_rate - 90) / 70) * 0.7;
    teamData.push({
      id: (memberIdx++).toString(),
      name: `成员${memberIdx}`,
      name_zh: `成员${memberIdx}`,
      name_en: `Member${memberIdx}`,
      roles,
      skills,
      available_hours,
      experience_score,
      hourly_rate,
      speed_factor
    });
  }
});

// 保证每个职责至少4人（如比例过低时补足）
const roleCount: Record<string, number> = {};
allRoles.forEach(role => { roleCount[role] = 0; });
teamData.forEach(member => {
  member.roles.forEach(role => {
    if (roleCount[role] !== undefined) roleCount[role]++;
  });
});
let nextId = teamData.length + 1;
allRoles.forEach(role => {
  while (roleCount[role] < 4) {
    const skills = randomFromArray(allSkills, 3 + Math.floor(Math.random() * 4));
    const available_hours = Array.from({ length: 4 }).map(() => 20 + Math.floor(Math.random() * 21));
    const experience_score = 70 + Math.floor(Math.random() * 31);
    const hourly_rate = 90 + Math.floor(Math.random() * 71);
    teamData.push({
      id: (nextId++).toString(),
      name: `成员${nextId}`,
      name_zh: `成员${nextId}`,
      name_en: `Member${nextId}`,
      roles: [role],
      skills,
      available_hours,
      experience_score,
      hourly_rate,
      speed_factor: 0.8 + Math.random() * 0.7
    });
    roleCount[role]++;
  }
});

// 每个职业各加1个全可用和1个全占用成员
Object.keys(roleDistribution).forEach(role => {
  // 全可用
  teamData.push({
    id: (teamData.length + 1).toString(),
    name: `全可用${role}`,
    name_zh: `全可用${role}`,
    name_en: `Fully Available ${role}`,
    roles: [role],
    skills: randomFromArray(allSkills, 4),
    available_hours: [40, 40, 40, 40],
    experience_score: 90,
    hourly_rate: 100,
    speed_factor: 1.2
  });
  // 全占用
  teamData.push({
    id: (teamData.length + 1).toString(),
    name: `全占用${role}`,
    name_zh: `全占用${role}`,
    name_en: `Fully Occupied ${role}`,
    roles: [role],
    skills: randomFromArray(allSkills, 4),
    available_hours: [0, 0, 0, 0],
    experience_score: 90,
    hourly_rate: 100,
    speed_factor: 1.2
  });
});

const roleMap: Record<string, string> = {
  '运维工程师': 'DevOps工程师',
  '项目经理': '产品经理',
  '用户体验师': 'UX设计师',
  '用户体验设计师': 'UX设计师',
  'UI/UX设计师': 'UI设计师',
  // 可根据实际拆解结果继续补充
};

// 新增：批量初始化成员到数据库
export function seedTeamMembers(cb: (members: TeamMember[]) => Promise<void>) {
  cb(teamData);
}

export { roleMap }; 