// 模拟测试数据 - 用于演示功能
export const mockTasks = [
  {
    id: "mock-task-1",
    title_zh: "用户注册登录系统",
    title_en: "User Registration and Login System",
    role_zh: "后端工程师",
    role_en: "Backend Engineer",
    estimated_hours: 16,
    status: "pending"
  },
  {
    id: "mock-task-2", 
    title_zh: "商品展示页面",
    title_en: "Product Display Pages",
    role_zh: "前端工程师",
    role_en: "Frontend Engineer",
    estimated_hours: 12,
    status: "pending"
  },
  {
    id: "mock-task-3",
    title_zh: "购物车功能",
    title_en: "Shopping Cart Functionality", 
    role_zh: "全栈工程师",
    role_en: "Full Stack Engineer",
    estimated_hours: 20,
    status: "pending"
  },
  {
    id: "mock-task-4",
    title_zh: "支付系统集成",
    title_en: "Payment System Integration",
    role_zh: "后端工程师", 
    role_en: "Backend Engineer",
    estimated_hours: 24,
    status: "pending"
  },
  {
    id: "mock-task-5",
    title_zh: "订单管理系统",
    title_en: "Order Management System",
    role_zh: "全栈工程师",
    role_en: "Full Stack Engineer", 
    estimated_hours: 18,
    status: "pending"
  },
  {
    id: "mock-task-6",
    title_zh: "数据库设计",
    title_en: "Database Design",
    role_zh: "数据库工程师",
    role_en: "Database Engineer",
    estimated_hours: 14,
    status: "pending"
  },
  {
    id: "mock-task-7",
    title_zh: "API接口开发",
    title_en: "API Interface Development",
    role_zh: "后端工程师",
    role_en: "Backend Engineer", 
    estimated_hours: 22,
    status: "pending"
  },
  {
    id: "mock-task-8",
    title_zh: "系统测试",
    title_en: "System Testing",
    role_zh: "测试工程师",
    role_en: "Test Engineer",
    estimated_hours: 16,
    status: "pending"
  }
];

export const mockMembers = [
  {
    id: "mock-dev-1",
    name: "test1",
    role: "前端工程师",
    roles: ["前端工程师"],
    hourly_rate: 150,
    capacity: 40,
    available_hours: [10, 10, 10, 10], // 每周可用工时
    speed_factor: 1.0, // 速度系数
    skills: ["React", "Vue", "TypeScript"]
  },
  {
    id: "mock-dev-2", 
    name: "test2",
    role: "后端工程师",
    roles: ["后端工程师"],
    hourly_rate: 180,
    capacity: 40,
    available_hours: [10, 10, 10, 10],
    speed_factor: 1.2,
    skills: ["Node.js", "Python", "Java"]
  },
  {
    id: "mock-dev-3",
    name: "test3", 
    role: "全栈工程师",
    roles: ["全栈工程师", "前端工程师", "后端工程师"],
    hourly_rate: 200,
    capacity: 40,
    available_hours: [12, 12, 12, 12],
    speed_factor: 1.5,
    skills: ["React", "Node.js", "MongoDB"]
  },
  {
    id: "mock-dev-4",
    name: "test4",
    role: "数据库工程师",
    roles: ["数据库工程师"],
    hourly_rate: 160,
    capacity: 40,
    available_hours: [8, 8, 8, 8],
    speed_factor: 0.9,
    skills: ["MySQL", "PostgreSQL", "Redis"]
  },
  {
    id: "mock-dev-5",
    name: "test5",
    role: "测试工程师",
    roles: ["测试工程师"],
    hourly_rate: 140,
    capacity: 40,
    available_hours: [10, 10, 10, 10],
    speed_factor: 1.1,
    skills: ["Jest", "Cypress", "Selenium"]
  }
];

export const mockAssignments = {
  "mock-task-1": "mock-dev-2", // 用户注册登录系统 -> test2(后端工程师)
  "mock-task-2": "mock-dev-1", // 商品展示页面 -> test1(前端工程师)  
  "mock-task-3": "mock-dev-3", // 购物车功能 -> test3(全栈工程师)
  "mock-task-4": "mock-dev-2", // 支付系统集成 -> test2(后端工程师)
  "mock-task-5": "mock-dev-3", // 订单管理系统 -> test3(全栈工程师)
  "mock-task-6": "mock-dev-4", // 数据库设计 -> test4(数据库工程师)
  "mock-task-7": "mock-dev-2", // API接口开发 -> test2(后端工程师)
  "mock-task-8": "mock-dev-5"  // 系统测试 -> test5(测试工程师)
};

export const mockOrderData = {
  id: "mock-order-001",
  goal: "开发一个购物软件",
  status: "test_mode",
  created_at: new Date().toISOString(),
  is_test_mode: true
};
