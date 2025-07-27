// 全局内存存储（服务器端和客户端共享）
const globalMemoryStore: { [key: string]: any } = {};

// 数据加载函数
function loadFromLocalStorage<T>(key: string, defaultValue: T): T {
  console.log(`加载数据 ${key}:`);
  
  // 优先从全局内存存储读取
  if (globalMemoryStore[key] !== undefined) {
    const value = globalMemoryStore[key];
    console.log(`从全局内存存储读取 ${key}:`, Array.isArray(value) ? value.length : value);
    return globalMemoryStore[key];
  }
  
  // 客户端从localStorage读取
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      globalMemoryStore[key] = parsed;
      console.log(`从localStorage读取 ${key}:`, Array.isArray(parsed) ? parsed.length : parsed);
      return parsed;
    }
  }
  
  // 服务器端特殊处理：尝试从全局内存获取
  if (typeof window === 'undefined' && globalMemoryStore[key] !== undefined) {
    console.log(`服务器端从全局内存读取 ${key}:`, Array.isArray(globalMemoryStore[key]) ? globalMemoryStore[key].length : globalMemoryStore[key]);
    return globalMemoryStore[key];
  }
  
  // 返回默认值并存储到全局内存
  console.log(`使用默认值 ${key}:`, Array.isArray(defaultValue) ? defaultValue.length : defaultValue);
  globalMemoryStore[key] = defaultValue;
  return defaultValue;
}

// 数据保存函数
function saveToLocalStorage(key: string, value: any) {
  console.log(`保存数据到 ${key}:`, Array.isArray(value) ? value.length : value);
  
  // 保存到全局内存存储
  globalMemoryStore[key] = value;
  console.log(`全局内存存储 ${key} 已更新:`, Array.isArray(globalMemoryStore[key]) ? globalMemoryStore[key].length : globalMemoryStore[key]);
  
  // 客户端同时保存到localStorage
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value));
    console.log(`localStorage ${key} 已更新`);
  } else {
    console.log(`服务器端，跳过localStorage保存`);
  }
}

// 生成默认数据（包含更多职位类别）
function generateDefaultTeamMembers() {
  const rolesList = [
    { role: '前端工程师', en: 'Frontend Engineer', skills: ['React', 'Vue', 'TypeScript', 'Jest', '敏捷开发', 'UI设计', 'API设计'] },
    { role: '后端工程师', en: 'Backend Engineer', skills: ['Node.js', 'Java', 'Go', 'Spring', '数据库', 'API设计', 'CI/CD'] },
    { role: '全栈工程师', en: 'Fullstack Engineer', skills: ['Node.js', 'Vue', 'React', 'Spring', 'API设计', '数据库', '敏捷开发'] },
    { role: '移动端工程师', en: 'Mobile Engineer', skills: ['Flutter', 'React Native', 'iOS', 'Android', '移动开发', 'UI设计'] },
    { role: 'UI设计师', en: 'UI Designer', skills: ['UI设计', 'Photoshop', 'Figma', 'Sketch', '敏捷开发', '项目管理'] },
    { role: 'UX设计师', en: 'UX Designer', skills: ['UX设计', '用户体验', '数据建模', '项目管理', '敏捷开发', '测试'] },
    { role: '测试工程师', en: 'Test Engineer', skills: ['测试', '自动化', 'Jest', 'CI/CD', 'API设计', 'SQL'] },
    { role: '数据库工程师', en: 'DB Engineer', skills: ['数据库', 'SQL', '数据建模', 'Spring', 'TypeScript', '云服务'] },
    { role: 'DevOps工程师', en: 'DevOps Engineer', skills: ['CI/CD', '云服务', '自动化', '部署', 'Node.js', 'Go'] },
    { role: '运维工程师', en: 'Operations Engineer', skills: ['Linux', 'Shell', 'Docker', 'Kubernetes', '监控', '部署'] },
    { role: '安全工程师', en: 'Security Engineer', skills: ['网络安全', '信息安全', '渗透测试', '安全审计', '加密'] },
    { role: '算法工程师', en: 'Algorithm Engineer', skills: ['机器学习', '深度学习', '算法优化', 'Python', '数据分析'] },
    { role: '数据分析师', en: 'Data Analyst', skills: ['数据分析', 'SQL', 'Python', 'Excel', 'PowerBI', 'Tableau'] },
    { role: '架构师', en: 'Architect', skills: ['系统架构', '微服务', '高可用', '性能优化', '技术选型'] },
    { role: '技术经理', en: 'Technical Manager', skills: ['技术管理', '团队管理', '项目管理', '技术选型', '敏捷开发'] },
    { role: '产品经理', en: 'Product Manager', skills: ['项目管理', '敏捷开发', 'UX设计', 'API设计', '测试', 'Figma'] },
    { role: '项目经理', en: 'Project Manager', skills: ['项目管理', '团队协调', '进度控制', '风险管理', '沟通管理'] },
    { role: '业务分析师', en: 'Business Analyst', skills: ['需求分析', '业务流程', '数据分析', '文档编写', '沟通协调'] },
    { role: '内容运营', en: 'Content Operator', skills: ['内容创作', '文案撰写', '社交媒体', '用户运营', '数据分析'] },
    { role: '市场专员', en: 'Marketing Specialist', skills: ['市场推广', '品牌营销', '活动策划', '数据分析', '客户关系'] },
    { role: '客服专员', en: 'Customer Service', skills: ['客户服务', '问题解决', '沟通协调', '产品知识', '服务态度'] },
    { role: '财务专员', en: 'Finance Specialist', skills: ['财务管理', '会计核算', '税务处理', '财务报表', '成本控制'] },
    { role: '人事专员', en: 'HR Specialist', skills: ['招聘', '培训', '绩效考核', '员工关系', '薪酬福利'] },
    { role: '行政专员', en: 'Administrative Specialist', skills: ['行政管理', '办公协调', '文档管理', '后勤保障', '接待服务'] },
    { role: '杂项专员', en: 'General Specialist', skills: ['通用技能', '学习能力', '沟通协调', '问题解决', '团队合作'] },
  ];
  const members = [];
  let idCounter = 1;
  for (const roleObj of rolesList) {
    for (let i = 0; i < 10; i++) { // 减少到每个角色10人
      members.push({
        id: String(idCounter++),
        name: `成员${idCounter - 1}`,
        roles: [roleObj.role],
        skills: roleObj.skills,
        available_hours: [40, 35, 30, 25],
        experience_score: 70 + Math.floor(Math.random() * 31),
        hourly_rate: 90 + Math.floor(Math.random() * 71),
        speed_factor: +(0.8 + Math.random() * 0.7).toFixed(2),
        name_en: `member${idCounter - 1}`
      });
    }
  }
  return members;
}

// Define types for the data structures
type ChatMessage = {
  id: number;
  order_id: string;
  task_id: string;
  role: string;
  message: string;
  created_at: string;
};

export const teamMembers = loadFromLocalStorage('teamMembers', generateDefaultTeamMembers());
export const orders = loadFromLocalStorage('orders', []) as any[];
export const tasks = loadFromLocalStorage('tasks', []) as any[];
export const chatMessages = loadFromLocalStorage('chatMessages', []) as ChatMessage[];

export function saveAllData() {
  saveToLocalStorage('teamMembers', teamMembers);
  saveToLocalStorage('orders', orders);
  saveToLocalStorage('tasks', tasks);
  saveToLocalStorage('chatMessages', chatMessages);
  
  // 在服务器端，强制同步到全局内存存储
  if (typeof window === 'undefined') {
    globalMemoryStore['teamMembers'] = teamMembers;
    globalMemoryStore['orders'] = orders;
    globalMemoryStore['tasks'] = tasks;
    globalMemoryStore['chatMessages'] = chatMessages;
  }
}

// 调试函数
export function debugData() {
  console.log('=== 调试数据 ===');
  console.log('全局内存存储:', globalMemoryStore);
  console.log('orders长度:', orders.length);
  console.log('tasks长度:', tasks.length);
  console.log('teamMembers长度:', teamMembers.length);
  
  if (orders.length > 0) {
    console.log('最新订单:', orders[orders.length - 1]);
  }
  
  if (tasks.length > 0) {
    console.log('最新任务:', tasks[tasks.length - 1]);
  }
  
  if (typeof window !== 'undefined') {
    console.log('localStorage orders:', localStorage.getItem('orders'));
    console.log('localStorage tasks:', localStorage.getItem('tasks'));
  }
  console.log('=== 调试完成 ===');
}

export { generateDefaultTeamMembers, loadFromLocalStorage, saveToLocalStorage }; 