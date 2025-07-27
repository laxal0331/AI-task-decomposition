export type TeamMember = {
  id: string;
  name: string;
  name_zh: string;
  name_en: string;
  roles: string[];
  skills: string[];
  available_hours: number[]; // 未来四周每周可用工时
  experience_score: number;
  hourly_rate: number;
  speed_factor: number; // 新增，完成任务速度倍率
};

const mainstreamRoles = [
  '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
  '产品经理', 'DevOps工程师', '全栈工程师', '移动端工程师', '数据分析师', '算法工程师',
  '运维工程师', '安全工程师', '架构师', '技术经理', '项目经理', '业务分析师',
  '内容运营', '市场专员', '客服专员', '财务专员', '人事专员', '行政专员'
];
const allRoles = [...mainstreamRoles, '杂项专员'];
const allSkills = [
  // 前端技能
  { zh: 'React', en: 'React' },
  { zh: 'Vue', en: 'Vue' },
  { zh: 'TypeScript', en: 'TypeScript' },
  { zh: 'JavaScript', en: 'JavaScript' },
  { zh: 'HTML/CSS', en: 'HTML/CSS' },
  { zh: 'Webpack', en: 'Webpack' },
  { zh: 'Vite', en: 'Vite' },
  { zh: 'Babel', en: 'Babel' },
  { zh: 'ESLint', en: 'ESLint' },
  { zh: 'Prettier', en: 'Prettier' },
  { zh: 'Sass', en: 'Sass' },
  { zh: 'Less', en: 'Less' },
  { zh: 'Tailwind CSS', en: 'Tailwind CSS' },
  { zh: 'Ant Design', en: 'Ant Design' },
  { zh: 'Element UI', en: 'Element UI' },
  { zh: 'Bootstrap', en: 'Bootstrap' },
  { zh: 'Material-UI', en: 'Material-UI' },
  
  // 后端技能
  { zh: 'Node.js', en: 'Node.js' },
  { zh: 'Java', en: 'Java' },
  { zh: 'Spring', en: 'Spring' },
  { zh: 'Go', en: 'Go' },
  { zh: 'Python', en: 'Python' },
  { zh: 'C#', en: 'C#' },
  { zh: 'PHP', en: 'PHP' },
  { zh: 'Ruby', en: 'Ruby' },
  { zh: 'Scala', en: 'Scala' },
  { zh: 'Kotlin', en: 'Kotlin' },
  
  // 数据库技能
  { zh: '数据库', en: 'Database' },
  { zh: 'SQL', en: 'SQL' },
  { zh: 'MySQL', en: 'MySQL' },
  { zh: 'PostgreSQL', en: 'PostgreSQL' },
  { zh: 'MongoDB', en: 'MongoDB' },
  { zh: 'Redis', en: 'Redis' },
  { zh: 'Elasticsearch', en: 'Elasticsearch' },
  { zh: 'Oracle', en: 'Oracle' },
  { zh: 'SQL Server', en: 'SQL Server' },
  
  // 移动端技能
  { zh: 'Flutter', en: 'Flutter' },
  { zh: 'React Native', en: 'React Native' },
  { zh: 'iOS', en: 'iOS' },
  { zh: 'Android', en: 'Android' },
  { zh: 'Swift', en: 'Swift' },
  { zh: 'Objective-C', en: 'Objective-C' },
  { zh: 'Kotlin', en: 'Kotlin' },
  { zh: 'Java Android', en: 'Java Android' },
  
  // 设计技能
  { zh: 'UI设计', en: 'UI Design' },
  { zh: 'UX设计', en: 'UX Design' },
  { zh: '用户体验', en: 'User Experience' },
  { zh: 'Figma', en: 'Figma' },
  { zh: 'Photoshop', en: 'Photoshop' },
  { zh: 'Sketch', en: 'Sketch' },
  { zh: 'Adobe XD', en: 'Adobe XD' },
  { zh: 'InVision', en: 'InVision' },
  { zh: '原型设计', en: 'Prototype Design' },
  { zh: '交互设计', en: 'Interaction Design' },
  { zh: '视觉设计', en: 'Visual Design' },
  { zh: '品牌设计', en: 'Brand Design' },
  
  // 测试技能
  { zh: '测试', en: 'Testing' },
  { zh: '自动化', en: 'Automation' },
  { zh: 'Jest', en: 'Jest' },
  { zh: 'JUnit', en: 'JUnit' },
  { zh: 'Mockito', en: 'Mockito' },
  { zh: 'Selenium', en: 'Selenium' },
  { zh: 'Cypress', en: 'Cypress' },
  { zh: '单元测试', en: 'Unit Testing' },
  { zh: '集成测试', en: 'Integration Testing' },
  { zh: '端到端测试', en: 'End-to-End Testing' },
  { zh: '压力测试', en: 'Stress Testing' },
  
  // 项目管理
  { zh: '敏捷开发', en: 'Agile Development' },
  { zh: '项目管理', en: 'Project Management' },
  { zh: 'Scrum', en: 'Scrum' },
  { zh: 'Kanban', en: 'Kanban' },
  { zh: 'JIRA', en: 'JIRA' },
  { zh: 'Confluence', en: 'Confluence' },
  { zh: '需求分析', en: 'Requirements Analysis' },
  { zh: '竞品分析', en: 'Competitive Analysis' },
  { zh: '用户研究', en: 'User Research' },
  
  // DevOps技能
  { zh: '部署', en: 'Deployment' },
  { zh: 'CI/CD', en: 'CI/CD' },
  { zh: '云服务', en: 'Cloud Services' },
  { zh: 'Docker', en: 'Docker' },
  { zh: 'Kubernetes', en: 'Kubernetes' },
  { zh: 'AWS', en: 'AWS' },
  { zh: 'Azure', en: 'Azure' },
  { zh: '阿里云', en: 'Alibaba Cloud' },
  { zh: '腾讯云', en: 'Tencent Cloud' },
  { zh: 'Nginx', en: 'Nginx' },
  { zh: 'Apache', en: 'Apache' },
  { zh: 'Linux', en: 'Linux' },
  { zh: 'Shell', en: 'Shell' },
  { zh: 'Git', en: 'Git' },
  { zh: 'SVN', en: 'SVN' },
  
  // 数据技能
  { zh: '数据分析', en: 'Data Analysis' },
  { zh: '机器学习', en: 'Machine Learning' },
  { zh: '深度学习', en: 'Deep Learning' },
  { zh: '算法优化', en: 'Algorithm Optimization' },
  { zh: 'Excel', en: 'Excel' },
  { zh: 'PowerBI', en: 'PowerBI' },
  { zh: 'Tableau', en: 'Tableau' },
  { zh: 'SPSS', en: 'SPSS' },
  { zh: 'R', en: 'R' },
  { zh: '数据建模', en: 'Data Modeling' },
  
  // 安全技能
  { zh: '网络安全', en: 'Network Security' },
  { zh: '系统架构', en: 'System Architecture' },
  { zh: '微服务', en: 'Microservices' },
  { zh: 'OAuth', en: 'OAuth' },
  { zh: 'JWT', en: 'JWT' },
  { zh: 'HTTPS', en: 'HTTPS' },
  { zh: 'SSL', en: 'SSL' },
  { zh: 'CDN', en: 'CDN' },
  { zh: '负载均衡', en: 'Load Balancing' },
  { zh: '高可用', en: 'High Availability' },
  { zh: '容灾备份', en: 'Disaster Recovery' },
  { zh: '监控告警', en: 'Monitoring & Alerting' },
  
  // 性能优化
  { zh: '日志分析', en: 'Log Analysis' },
  { zh: '性能优化', en: 'Performance Optimization' },
  { zh: '代码审查', en: 'Code Review' },
  { zh: 'API设计', en: 'API Design' },
  { zh: 'RESTful API', en: 'RESTful API' },
  { zh: 'GraphQL', en: 'GraphQL' },
  { zh: 'Postman', en: 'Postman' },
  { zh: 'Swagger', en: 'Swagger' },
  
  // 消息队列
  { zh: 'Kafka', en: 'Kafka' },
  { zh: 'RabbitMQ', en: 'RabbitMQ' },
  
  // 小程序开发
  { zh: '微信小程序', en: 'WeChat Mini Program' },
  { zh: '支付宝小程序', en: 'Alipay Mini Program' },
  { zh: 'H5', en: 'H5' },
  { zh: 'PWA', en: 'PWA' },
  
  // 运营技能
  { zh: '营销策划', en: 'Marketing Strategy' },
  { zh: '活动运营', en: 'Event Operations' },
  { zh: '用户运营', en: 'User Operations' },
  { zh: '社群运营', en: 'Community Operations' },
  { zh: '内容创作', en: 'Content Creation' },
  { zh: '文案撰写', en: 'Copywriting' },
  { zh: '视频制作', en: 'Video Production' },
  { zh: 'SEO', en: 'SEO' },
  { zh: 'SEM', en: 'SEM' },
  { zh: '社交媒体', en: 'Social Media' },
  { zh: '电子邮件营销', en: 'Email Marketing' },
  
  // 业务技能
  { zh: '客户关系管理', en: 'CRM' },
  { zh: '销售管理', en: 'Sales Management' },
  { zh: '财务管理', en: 'Financial Management' },
  { zh: '人力资源管理', en: 'HR Management' },
  { zh: '行政管理', en: 'Administrative Management' },
  { zh: '法务合规', en: 'Legal Compliance' },
  { zh: '风险控制', en: 'Risk Control' },
  { zh: '质量控制', en: 'Quality Control' },
  { zh: '供应链管理', en: 'Supply Chain Management' },
  
  // 通用技能
  { zh: '通用技能', en: 'General Skills' },
  { zh: '学习能力', en: 'Learning Ability' },
  { zh: '沟通协调', en: 'Communication & Coordination' },
  { zh: '问题解决', en: 'Problem Solving' },
  { zh: '团队合作', en: 'Teamwork' },
  { zh: '时间管理', en: 'Time Management' },
  { zh: '压力管理', en: 'Stress Management' },
  { zh: '创新思维', en: 'Innovative Thinking' },
  { zh: '逻辑分析', en: 'Logical Analysis' },
  { zh: '决策能力', en: 'Decision Making' },
  { zh: '领导力', en: 'Leadership' },
  { zh: '执行力', en: 'Execution' },
  { zh: '责任心', en: 'Responsibility' },
  { zh: '主动性', en: 'Initiative' },
  { zh: '适应性', en: 'Adaptability' },
  { zh: '抗压能力', en: 'Pressure Resistance' },
  { zh: '自我驱动', en: 'Self-Driven' },
  { zh: '持续改进', en: 'Continuous Improvement' }
];

// 技能映射表，用于中英文切换
export const skillMap: Record<string, { zh: string; en: string }> = {};
allSkills.forEach(skill => {
  skillMap[skill.zh] = skill;
  skillMap[skill.en] = skill;
});

// 获取技能的中英文名称
export function getSkillName(skill: string, lang: 'zh' | 'en'): string {
  const skillData = skillMap[skill];
  if (skillData) {
    return lang === 'zh' ? skillData.zh : skillData.en;
  }
  return skill; // 如果找不到映射，返回原值
}

// 将技能数组转换为指定语言的技能名称
export function translateSkills(skills: string[], lang: 'zh' | 'en'): string[] {
  return skills.map(skill => getSkillName(skill, lang));
}

// 技能名称数组（使用中文）
const skillNames = allSkills.map(skill => skill.zh);

function randomFromArray<T>(arr: T[], count: number) {
  const copy = [...arr];
  const res: T[] = [];
  while (res.length < count && copy.length) {
    const idx = Math.floor(Math.random() * copy.length);
    res.push(copy.splice(idx, 1)[0]);
  }
  return res;
}

// 扩大数据库规模，确保每个角色至少10人
const roleDistribution: Record<string, number> = {
  '前端工程师': 25,      // 技术类
  '后端工程师': 25,      // 技术类
  '全栈工程师': 20,      // 技术类
  '移动端工程师': 15,    // 技术类
  'UI设计师': 15,        // 设计类
  'UX设计师': 12,        // 设计类
  '测试工程师': 15,      // 技术类
  '数据库工程师': 12,    // 技术类
  'DevOps工程师': 12,    // 技术类
  '运维工程师': 10,      // 技术类
  '安全工程师': 10,      // 技术类
  '算法工程师': 10,      // 技术类
  '数据分析师': 12,      // 数据类
  '架构师': 8,          // 技术类
  '技术经理': 8,         // 管理类
  '产品经理': 15,        // 管理类
  '项目经理': 10,        // 管理类
  '业务分析师': 10,      // 业务类
  '内容运营': 8,         // 运营类
  '市场专员': 8,         // 市场类
  '客服专员': 10,        // 服务类
  '财务专员': 8,         // 职能类
  '人事专员': 8,         // 职能类
  '行政专员': 8,         // 职能类
  '杂项专员': 15         // 通用类
};

// 生成团队成员，主角色严格按比例分配
let teamData: TeamMember[] = [];
let memberIdx = 1;
Object.entries(roleDistribution).forEach(([role, count]) => {
  for (let i = 0; i < count; i++) {
    // 70%单角色，30%多角色
    let roleCount = Math.random() < 0.7 ? 1 : 2;
    let roles = [role];
    if (roleCount === 2) {
      // 除主角色外再随机分配一个不同角色，非主流职位一律用"杂项专员"
      const otherRoles = mainstreamRoles.filter(r => r !== role);
      const extraRole = otherRoles.length > 0 ? randomFromArray(otherRoles, 1)[0] : '杂项专员';
      roles = [role, extraRole];
    }
    const skills = randomFromArray(skillNames, 3 + Math.floor(Math.random() * 4));
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

// 保证每个职责至少10人（如比例过低时补足）
const roleCount: Record<string, number> = {};
allRoles.forEach(role => { roleCount[role] = 0; });
teamData.forEach(member => {
  member.roles.forEach(role => {
    if (roleCount[role] !== undefined) roleCount[role]++;
  });
});
let nextId = teamData.length + 1;
allRoles.forEach(role => {
  while (roleCount[role] < 10) {
    const skills = randomFromArray(skillNames, 3 + Math.floor(Math.random() * 4));
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
    skills: randomFromArray(skillNames, 4),
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
    skills: randomFromArray(skillNames, 4),
    available_hours: [0, 0, 0, 0],
    experience_score: 90,
    hourly_rate: 100,
    speed_factor: 1.2
  });
});

const roleMap: Record<string, string> = {
  // 技术类映射
  '前端开发工程师': '前端工程师',
  '后端开发工程师': '后端工程师',
  '移动端开发工程师': '移动端工程师',
  'Android工程师': '移动端工程师',
  'iOS工程师': '移动端工程师',
  'Flutter工程师': '移动端工程师',
  'React Native工程师': '移动端工程师',
  'UI/UX设计师': 'UI设计师',
  '用户体验设计师': 'UX设计师',
  '用户体验师': 'UX设计师',
  '软件测试工程师': '测试工程师',
  '自动化测试工程师': '测试工程师',
  '数据库管理员': '数据库工程师',
  'DBA': '数据库工程师',
  '运维工程师': 'DevOps工程师',
  '系统运维工程师': '运维工程师',
  '网络安全工程师': '安全工程师',
  '信息安全工程师': '安全工程师',
  '机器学习工程师': '算法工程师',
  'AI工程师': '算法工程师',
  '数据科学家': '数据分析师',
  '商业分析师': '业务分析师',
  '系统架构师': '架构师',
  '软件架构师': '架构师',
  '技术负责人': '技术经理',
  '研发经理': '技术经理',
  '产品负责人': '产品经理',
  '项目负责人': '项目经理',
  '运营专员': '内容运营',
  '新媒体运营': '内容运营',
  '市场推广专员': '市场专员',
  '销售专员': '客服专员',
  '客户服务专员': '客服专员',
  '会计': '财务专员',
  '出纳': '财务专员',
  'HR专员': '人事专员',
  '人力资源专员': '人事专员',
  '行政助理': '行政专员',
  '前台': '行政专员',
  '助理': '杂项专员',
  '实习生': '杂项专员',
  '临时工': '杂项专员',
  // 可根据实际拆解结果继续补充
};

// 角色映射表，用于中英文切换
export const roleTranslationMap: Record<string, { zh: string; en: string }> = {
  // 技术类
  '前端工程师': { zh: '前端工程师', en: 'Frontend Engineer' },
  '后端工程师': { zh: '后端工程师', en: 'Backend Engineer' },
  '全栈工程师': { zh: '全栈工程师', en: 'Fullstack Engineer' },
  '移动端工程师': { zh: '移动端工程师', en: 'Mobile Engineer' },
  'UI设计师': { zh: 'UI设计师', en: 'UI Designer' },
  'UX设计师': { zh: 'UX设计师', en: 'UX Designer' },
  '测试工程师': { zh: '测试工程师', en: 'Test Engineer' },
  '数据库工程师': { zh: '数据库工程师', en: 'Database Engineer' },
  'DevOps工程师': { zh: 'DevOps工程师', en: 'DevOps Engineer' },
  '运维工程师': { zh: '运维工程师', en: 'Operations Engineer' },
  '安全工程师': { zh: '安全工程师', en: 'Security Engineer' },
  '算法工程师': { zh: '算法工程师', en: 'Algorithm Engineer' },
  '数据分析师': { zh: '数据分析师', en: 'Data Analyst' },
  '架构师': { zh: '架构师', en: 'Architect' },
  '技术经理': { zh: '技术经理', en: 'Technical Manager' },
  
  // 管理类
  '产品经理': { zh: '产品经理', en: 'Product Manager' },
  '项目经理': { zh: '项目经理', en: 'Project Manager' },
  '业务分析师': { zh: '业务分析师', en: 'Business Analyst' },
  
  // 运营类
  '内容运营': { zh: '内容运营', en: 'Content Operator' },
  '市场专员': { zh: '市场专员', en: 'Marketing Specialist' },
  '客服专员': { zh: '客服专员', en: 'Customer Service' },
  
  // 职能类
  '财务专员': { zh: '财务专员', en: 'Finance Specialist' },
  '人事专员': { zh: '人事专员', en: 'HR Specialist' },
  '行政专员': { zh: '行政专员', en: 'Administrative Specialist' },
  
  // 通用类
  '杂项专员': { zh: '杂项专员', en: 'General Specialist' }
};

// 获取角色的中英文名称
export function getRoleName(role: string, lang: 'zh' | 'en'): string {
  const roleData = roleTranslationMap[role];
  if (roleData) {
    return lang === 'zh' ? roleData.zh : roleData.en;
  }
  return role; // 如果找不到映射，返回原值
}

// 将角色数组转换为指定语言的角色名称
export function translateRoles(roles: string[], lang: 'zh' | 'en'): string[] {
  return roles.map(role => getRoleName(role, lang));
}

// 新增：批量初始化成员到数据库
export function seedTeamMembers(cb: (members: TeamMember[]) => Promise<void>) {
  cb(teamData);
}

export { roleMap }; 