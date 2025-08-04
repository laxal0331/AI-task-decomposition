import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { roleMap } from '../lib/teamData';
import { smartMatchDevelopersForTask, SmartMatchResult, globalFastestAssignment } from '../lib/smartMatch';

// 添加客户端检查函数
const isClient = typeof window !== 'undefined';

// 安全的localStorage访问函数
const getLocalStorage = (key: string, defaultValue: string = '[]') => {
  if (!isClient) return defaultValue;
  try {
    return localStorage.getItem(key) || defaultValue;
  } catch (error) {
    console.error('localStorage访问失败:', error);
    return defaultValue;
  }
};

const setLocalStorage = (key: string, value: string) => {
  if (!isClient) return;
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    console.error('localStorage设置失败:', error);
  }
};

interface Task {
  title: string;
  role: string;
  estimated_hours: number;
  status: string;
  id: string;
  title_zh?: string;
  title_en?: string;
  role_zh?: string;
  role_en?: string;
}

// 1. 定义统一的状态常量
export const STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  TESTING: 'TESTING',
  COMPLETED: 'COMPLETED',
};

// 2. 状态国际化映射表
const statusI18n = {
  zh: {
    [STATUS.NOT_STARTED]: '未开始',
    [STATUS.PENDING]: '等待接受',
    [STATUS.IN_PROGRESS]: '进行中',
    [STATUS.TESTING]: '测试中',
    [STATUS.COMPLETED]: '已完成',
    // 兼容老数据的中文状态
    '未开始': '未开始',
    '等待接受': '等待接受',
    '进行中': '进行中',
    '测试中': '测试中',
    '已完成': '已完成',
  },
  en: {
    [STATUS.NOT_STARTED]: 'Not Started',
    [STATUS.PENDING]: 'Pending Acceptance',
    [STATUS.IN_PROGRESS]: 'In Progress',
    [STATUS.TESTING]: 'Testing',
    [STATUS.COMPLETED]: 'Completed',
    // 兼容老数据的中文状态
    '未开始': 'Not Started',
    '等待接受': 'Pending Acceptance',
    '进行中': 'In Progress',
    '测试中': 'Testing',
    '已完成': 'Completed',
  }
};

// 3. 兼容老数据的中英文到软编码的映射
const statusTextToCode: { [key: string]: string } = {
  // 软编码常量映射（保持原样）
  [STATUS.NOT_STARTED]: STATUS.NOT_STARTED,
  [STATUS.PENDING]: STATUS.PENDING,
  [STATUS.IN_PROGRESS]: STATUS.IN_PROGRESS,
  [STATUS.TESTING]: STATUS.TESTING,
  [STATUS.COMPLETED]: STATUS.COMPLETED,
  // 老数据的中文状态映射
  '未开始': STATUS.NOT_STARTED,
  '等待接受': STATUS.PENDING,
  '进行中': STATUS.IN_PROGRESS,
  '测试中': STATUS.TESTING,
  '已完成': STATUS.COMPLETED,
  // 老数据的英文状态映射
  'Not Started': STATUS.NOT_STARTED,
  'Pending Acceptance': STATUS.PENDING,
  'In Progress': STATUS.IN_PROGRESS,
  'Testing': STATUS.TESTING,
  'Completed': STATUS.COMPLETED,
};

// 文案中英对照
const texts = {
      zh: {
      title: 'AI 任务拆解',
      mode: '分配模式：',
      fast: '最快',
      balanced: '均衡',
      slow: '价格最低',
      inputPlaceholder: '请输入项目目标，例如：开发一个购物小程序',
      submit: '提交给 AI',
      submitting: 'AI 正在拆解中...',
      taskList: '任务清单：',
      task: '任务：',
      role: '角色：',
      est: '预计时间：',
      recommend: '推荐开发者：',
      none: '暂无合适开发者',
      more: '更多',
      insufficient: '时长不足者',
      moreLabel: '更多：价格过高或速度过慢',
      tooExpensive: '价格过高：',
      tooSlow: '速度过慢：',
      notEnough: '时长不足：',
      no: '无',
      others: '其他开发者：',
      select: '点击选择该开发者',
      detail: '点击查看开发者详情',
      detailInsufficient: '该开发者时长不足，仅供参考',
      totalCost: '总成本：',
      totalTime: '总耗时：',
      confirm: '确认分配',
      confirmTip: '请为每个任务选择开发者，缺人无法分配！',
      toResult: '分配结果',
      back: '返回',
      lang: 'English',
      modalInputTip: '请输入完整的项目目标，例如：开发一个购物小程序',
      modalConfirmTip: '请为每个任务选择开发者，缺人无法分配！',
      myOrders: '我的订单',
      noOrder: '暂无订单',
      orderId: '订单号',
      time: '时间',
      status: '状态',
      taskCount: '任务数',
      delete: '删除',
      close: '关闭',
      deleteConfirm: '确认删除该订单？',
      redecompose: '重新拆解任务',
      viewDetails: '查看详情',
      home: '首页',
      // 错误提示信息
      aiNoUnderstandError: 'AI无法理解您的需求，请提供更清晰、具体的项目目标，例如：开发一个在线购物网站，包含用户注册、商品浏览、购物车、支付功能',
      aiDataFormatError: 'AI返回的任务数据格式有误，请重新尝试。如果问题持续出现，请尝试使用更具体的项目描述。',
      aiNotTaskDataError: 'AI返回的不是任务数据，而是说明文字，请提供更明确的项目目标。',
      aiInvalidDataError: 'AI返回的任务数据无效，请尝试提供更详细的项目需求描述。',
    },
      en: {
      title: 'AI Task Decomposition',
      mode: 'Mode:',
      fast: 'Fastest',
      balanced: 'Balanced',
      slow: 'Lowest Cost',
      inputPlaceholder: 'Please enter your project goal, e.g. Develop a shopping mini-program',
      submit: 'Submit to AI',
      submitting: 'AI is decomposing...',
      taskList: 'Task List:',
      task: 'Task:',
      role: 'Role:',
      est: 'Estimated Time:',
      recommend: 'Recommended Developers:',
      none: 'No suitable developer',
      more: 'More',
      insufficient: 'Insufficient Hours',
      moreLabel: 'More: Too expensive or too slow',
      tooExpensive: 'Too expensive:',
      tooSlow: 'Too slow:',
      notEnough: 'Insufficient:',
      no: 'None',
      others: 'Other Developers:',
      select: 'Click to select this developer',
      detail: 'Click to view developer details',
      detailInsufficient: 'Insufficient hours, for reference only',
      totalCost: 'Total Cost:',
      totalTime: 'Total Duration:',
      confirm: 'Confirm Assignment',
      confirmTip: 'Please select a member for each task!',
      toResult: 'Assignment Result',
      back: 'Back',
      lang: '中文',
      modalInputTip: 'Please enter a complete project goal, e.g. Develop a shopping mini-program',
      modalConfirmTip: 'Please select a member for each task. Cannot assign if missing!',
      myOrders: 'My Orders',
      noOrder: 'No orders',
      orderId: 'Order ID',
      time: 'Time',
      status: 'Status',
      taskCount: 'Tasks',
      delete: 'Delete',
      close: 'Close',
      deleteConfirm: 'Confirm Delete?',
      redecompose: 'Re-decompose Task',
      viewDetails: 'View Details',
      home: 'Home',
      // Error messages
      aiNoUnderstandError: 'AI cannot understand your requirements. Please provide clearer and more specific project goals, for example: Develop an online shopping website with user registration, product browsing, shopping cart, and payment functions',
      aiDataFormatError: 'The task data returned by AI is in the wrong format. Please try again. If the problem persists, try using more specific project descriptions.',
      aiNotTaskDataError: 'AI returned explanatory text instead of task data. Please provide clearer project goals.',
      aiInvalidDataError: 'The task data returned by AI is invalid. Please try providing more detailed project requirements.',
    }
};

const orderStatusI18n = {
  zh: {
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    NOT_STARTED: '未开始',
    DELIVERED: '已交付',
    // 兼容老数据
    '进行中': '进行中',
    '已完成': '已完成',
    '已取消': '已取消',
    '未开始': '未开始',
    '已交付': '已交付',
    // 兼容英文状态
    'In Progress': '进行中',
    'Completed': '已完成',
    'Cancelled': '已取消',
    'Not Started': '未开始',
    'Delivered': '已交付',
  },
  en: {
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    NOT_STARTED: 'Not Started',
    DELIVERED: 'Delivered',
    // 兼容老数据
    '进行中': 'In Progress',
    '已完成': 'Completed',
    '已取消': 'Cancelled',
    '未开始': 'Not Started',
    '已交付': 'Delivered',
    // 兼容英文状态
    'In Progress': 'In Progress',
    'Completed': 'Completed',
    'Cancelled': 'Cancelled',
    'Not Started': 'Not Started',
    'Delivered': 'Delivered',
  }
};

const statusColorMap: Record<string, string> = {
  '已取消': '#e11d48',
  '已交付': '#16a34a',
  '进行中': '#eab308',
  '未开始': '#888',
  'IN_PROGRESS': '#eab308',
  'CANCELLED': '#e11d48',
  'COMPLETED': '#16a34a',
  'NOT_STARTED': '#888',
  'DELIVERED': '#16a34a',
  // 兼容英文状态
  'Cancelled': '#e11d48',
  'Delivered': '#16a34a',
  'In Progress': '#eab308',
  'Not Started': '#888',
  'Completed': '#16a34a',
};

// 任务角色映射表 - 定义为全局常量
const taskRoleMap: { [key: string]: string } = {
  '前端工程师': '前端工程师',
  '后端工程师': '后端工程师', 
  'UI设计师': 'UI设计师',
  'UX设计师': 'UX设计师',
  '测试工程师': '测试工程师',
  '数据库工程师': '数据库工程师',
  '产品经理': '产品经理',
  'DevOps工程师': 'DevOps工程师',
  '全栈工程师': '全栈工程师',
  '杂项专员': '杂项专员',
  // 添加常见的任务角色映射
  '运维工程师': 'DevOps工程师',
  '项目经理': '产品经理',
  'PM': '产品经理',
  'QA': '测试工程师',
  '质量保证': '测试工程师',
  'DBA': '数据库工程师',
  '系统管理员': 'DevOps工程师',
  '架构师': '全栈工程师',
  '技术负责人': '全栈工程师'
};

export default function TaskPlanner() {
  // 添加错误状态
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // 客户端检查
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 错误边界
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      console.error('TaskPlanner页面错误:', error);
      setError(error.message);
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<{[key: number]: string | null}>({});
  const [selectedMembers, setSelectedMembers] = useState<{[taskIdx: number]: string | null}>({});
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [popupPos, setPopupPos] = useState<{x: number, y: number} | null>(null);
  const [popupTaskIdx, setPopupTaskIdx] = useState<number | null>(null);
  const [assignMode, setAssignMode] = useState<'slow' | 'balanced' | 'fast'>('slow');
  const [assignedTasks, setAssignedTasks] = useState<{ [memberId: string]: number[] }>({});
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const t = texts[lang];
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [dbOrderId, setDbOrderId] = useState<string | null>(null);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState<boolean>(false);
  const [teamData, setTeamData] = useState<any[]>([]);
  const { orderId } = router.query;
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  // 🔧 简化状态管理，移除多余的延迟机制状态
  const [isFirstDecomposition, setIsFirstDecomposition] = useState<boolean>(true);
  const [showAutoSelectButton, setShowAutoSelectButton] = useState<boolean>(false);
  
  // 调试信息
  useEffect(() => {
    console.log('TaskPlanner组件已挂载');
    console.log('当前路由:', router.asPath);
    console.log('是否客户端:', isClient);
  }, [router.asPath, isClient]);

  // 处理URL中的orderId参数，从数据库加载订单数据
  useEffect(() => {
    const handleDataLoad = async () => {
      if (router.query.orderId && isClient) {
        console.log('检测到URL中的orderId:', router.query.orderId);
        loadOrderFromDatabase(router.query.orderId as string);
      } else if (isClient && !router.query.orderId) {
        // 页面刷新后如果没有orderId，尝试从localStorage恢复状态
        console.log('🔄 页面刷新检测到无orderId，尝试恢复本地状态');
        await tryLoadOrdersFromLocalStorage();
        
        // 如果localStorage中有数据，让兜底机制处理自动选择
        console.log('🔄 页面刷新后恢复状态，依靠兜底机制处理自动选择');
      }
    };

    handleDataLoad();
  }, [router.query.orderId, isClient]);

  // 从数据库加载订单数据的函数
  const loadOrderFromDatabase = async (orderId: string) => {
    try {
      console.log('从数据库加载订单数据:', orderId);
      const res = await fetch(`/api/orders?orderId=${orderId}`);
      if (!res.ok) {
        throw new Error(`获取订单失败: ${res.status}`);
      }
      
      const data = await res.json();
      console.log('从数据库加载的订单数据:', data);
      
      if (data.tasks && data.tasks.length > 0) {
        const normalizedTasks = data.tasks.map((task: any) => ({
          ...task,
          title: task.title_zh || task.title || '',
          role: task.role_zh || task.role || '',
          status: task.status || STATUS.NOT_STARTED,
          id: task.id
        }));
        
        setTasks(normalizedTasks);
        setDbOrderId(orderId);
        
        if (data.members) {
          setTeamData(data.members);
          
          // 构建已有的分配关系
          const existingAssignments: { [taskIdx: number]: string } = {};
          normalizedTasks.forEach((task: any, idx: number) => {
            if (task.assigned_member_id) {
              existingAssignments[idx] = task.assigned_member_id;
            }
          });
          
          // 如果已有分配，直接使用；否则执行自动分配
          if (Object.keys(existingAssignments).length > 0) {
            console.log('使用已有的分配关系:', existingAssignments);
            setSelectedMembers(existingAssignments);
          } else {
            console.log('没有现有分配，执行自动分配...');
            
            // 🔧 使用统一的同步自动选择函数
            const autoSelected = executeImmediateAutoSelection(
              normalizedTasks, 
              data.members, 
              assignMode, 
              '数据库订单加载'
            );
            
            setSelectedMembers(autoSelected);
            console.log('📊 数据库订单数据加载完成', {
              tasksCount: normalizedTasks.length,
              membersCount: data.members?.length || 0,
              autoSelectedCount: Object.keys(autoSelected).length
            });
          }
        }
      }
    } catch (error) {
      console.error('从数据库加载订单失败:', error);
    }
  };

  // 移除导致无限循环的自动刷新逻辑
  // useEffect(() => {
  //   if (isClient && router.asPath === '/task-planner') {
  //     console.log('检测到task-planner页面，自动刷新');
  //     window.location.reload();
  //   }
  // }, [router.asPath, isClient]);

  // 从localStorage读取订单的备用方法
  
  // 从localStorage读取订单的备用方法
  const tryLoadOrdersFromLocalStorage = async () => {
    try {
      const savedOrders = JSON.parse(getLocalStorage('orders') || '[]');
      console.log('从localStorage读取到订单数量:', savedOrders.length);
      
      if (savedOrders.length > 0) {
        // 按时间降序排序（最新的在前）
        const sortedOrders = savedOrders.sort((a: any, b: any) => {
          const timeA = parseInt(a.id) || 0;
          const timeB = parseInt(b.id) || 0;
          return timeB - timeA;
        });
        setOrders(sortedOrders);
        
        // 如果当前页面没有任务数据，尝试从最新的订单恢复
        if (tasks.length === 0 && sortedOrders.length > 0) {
          const latestOrder = sortedOrders[0];
          console.log('🔄 页面刷新后尝试从最新订单恢复任务数据:', latestOrder.id);
          
          if (latestOrder.tasks && latestOrder.tasks.length > 0) {
            setTasks(latestOrder.tasks);
            setDbOrderId(latestOrder.id);
            
            // 尝试加载团队数据
            try {
              const res = await fetch('/api/members');
              const data = await res.json();
              if (data.members) {
                setTeamData(data.members);
                console.log('✅ 成功加载团队数据用于页面刷新恢复');
                
                // 页面刷新恢复完成，依靠兜底机制处理自动选择
                console.log('🔄 页面刷新恢复完成，依靠兜底机制处理自动选择');
              }
            } catch (error) {
              console.error('页面刷新后加载团队数据失败:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('从localStorage读取订单失败:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      
      // 检查响应状态
      if (!res.ok) {
        console.error('API响应错误:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('错误响应内容:', errorText);
        throw new Error(`API错误: ${res.status} ${res.statusText}`);
      }
      
      // 检查内容类型
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('响应不是JSON格式:', contentType);
        const responseText = await res.text();
        console.error('响应内容:', responseText);
        throw new Error('API返回的不是JSON格式');
      }
      
      const data = await res.json();
      
      if (data.orders && data.orders.length > 0) {
        // 按时间降序排序（最新的在前）
        const sortedOrders = data.orders.sort((a: any, b: any) => {
          const timeA = parseInt(a.id) || 0;
          const timeB = parseInt(b.id) || 0;
          return timeB - timeA;
        });
        console.log('📄 从服务器获取到订单:', sortedOrders.length, '个');
        setOrders(sortedOrders);
      } else {
        // API返回空数据，检查localStorage是否有数据
        const localOrders = JSON.parse(getLocalStorage('orders') || '[]');
        if (localOrders.length > 0) {
          console.log('API返回空订单，但localStorage有数据，保持当前状态...');
          // 如果localStorage有数据但服务器没有，保持当前状态，不清空
          if (orders.length === 0) {
            // 只有当前端也没有数据时，才从localStorage恢复
            await tryLoadOrdersFromLocalStorage();
          }
        } else {
          console.log('API和localStorage都没有订单数据');
          setOrders([]); // 确实没有数据时才清空
        }
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      // API调用失败，尝试从localStorage读取
      console.log('API调用失败，尝试从localStorage读取订单...');
      await tryLoadOrdersFromLocalStorage();
    }
  };
  
  // 🔧 统一的同步自动选择函数 - 直接使用传入的数据，不依赖状态
  const executeImmediateAutoSelection = (tasksData: Task[], membersData: any[], mode: 'slow' | 'balanced' | 'fast', source: string): { [taskIdx: number]: string } => {
    console.log(`🚀 执行即时自动选择 - 来源: ${source}`, {
      任务数: tasksData.length,
      成员数: membersData.length,
      模式: mode
    });
    
    const autoSelected: { [taskIdx: number]: string } = {};
    
    tasksData.forEach((task: any, idx: number) => {
      const mainstreamRoles = [
        '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
        '产品经理', 'DevOps工程师', '全栈工程师'
      ];
      
      let mappedRole = taskRoleMap[task.role] || task.role;
      if (!mainstreamRoles.includes(mappedRole)) {
        mappedRole = '杂项专员';
      }
      
      let matchResults = smartMatchDevelopersForTask(
        { ...task, role: mappedRole },
        membersData,
        {},
        mode
      ).filter(r => r.canAssign);
      
      if (matchResults.length === 0) {
        matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          membersData,
          {},
          mode
        );
      }
      
      if (matchResults.length > 0) {
        autoSelected[idx] = matchResults[0].member.id;
        console.log(`✅ 任务 ${idx} (${task.title}) 即时分配给: ${matchResults[0].member.name}`);
      } else {
        // 尝试全栈工程师作为后备
        const fallbackResults = smartMatchDevelopersForTask(
          { ...task, role: '全栈工程师' },
          membersData,
          {},
          mode
        );
        
        if (fallbackResults.length > 0) {
          autoSelected[idx] = fallbackResults[0].member.id;
          console.log(`✅ 任务 ${idx} (${task.title}) 使用全栈后备: ${fallbackResults[0].member.name}`);
        } else {
          console.log(`❌ 任务 ${idx} (${task.title}) 无法找到合适成员`);
        }
      }
    });
    
    console.log(`✅ 即时自动选择完成 - 来源: ${source}`, {
      成功分配: Object.keys(autoSelected).length,
      总任务数: tasksData.length,
      分配详情: autoSelected
    });
    
    return autoSelected;
  };

  // 提取的自动分配函数 - 现在在组件内部定义，可以访问所有状态
  const performAutoAssignment = (tasksToAssign: Task[], teamMembers: any[], currentAssignMode: 'slow' | 'balanced' | 'fast', source: string = 'unknown') => {
    console.log(`🚀 开始执行自动分配 - 来源: ${source}`, {
      任务数: tasksToAssign.length,
      成员数: teamMembers.length,
      模式: currentAssignMode,
      当前已选择: Object.keys(selectedMembers).length
    });
    
    let autoSelected: { [taskIdx: number]: string } = {};
    
    if (currentAssignMode === 'fast') {
      // 最快模式：优先分配给不同的人实现并行开发，但考虑任务依赖关系
      const usedMemberIds = new Set<string>();
      const memberWorkloads: { [memberId: string]: number } = {};
      
      // 按任务工时降序排列，优先分配大任务
      const sortedTasks = tasksToAssign.map((task, idx) => ({ task, idx }))
        .sort((a, b) => b.task.estimated_hours - a.task.estimated_hours);
      
      sortedTasks.forEach(({ task, idx }) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师'
        ];
        // 先尝试角色映射，再检查是否在主流角色中，最后才用杂项专员
        let mappedRole = taskRoleMap[task.role] || task.role;
        if (!mainstreamRoles.includes(mappedRole)) {
          mappedRole = '杂项专员';
        }
        let matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamMembers,
          assignedTasks,
          currentAssignMode
        ).filter(r => r.canAssign);
        
        // 如果没有足够工时的成员，则选择所有推荐成员中的最佳选择
        if (matchResults.length === 0) {
          console.log(`任务 ${idx} 没有找到有足够工时的 ${mappedRole}，选择最佳可用成员`);
          matchResults = smartMatchDevelopersForTask(
            { ...task, role: mappedRole },
            teamMembers,
            assignedTasks,
            currentAssignMode
          );
        }
        
        // 计算每个候选成员的总工作量（包括已分配的任务）
        const candidatesWithWorkload = matchResults.map(r => {
          const currentWorkload = memberWorkloads[r.member.id] || 0;
          const effectiveHours = Math.ceil(task.estimated_hours / r.member.speed_factor);
          const totalWorkload = currentWorkload + effectiveHours;
          return { ...r, totalWorkload, effectiveHours };
        });
        
        // 优先选择总工作量最小的成员（实现更好的负载均衡）
        candidatesWithWorkload.sort((a, b) => {
          if (a.totalWorkload !== b.totalWorkload) {
            return a.totalWorkload - b.totalWorkload;
          }
          // 如果工作量相同，优先选择速度更快的
          return b.member.speed_factor - a.member.speed_factor;
        });
        
        const best = candidatesWithWorkload[0];
        if (best) {
          autoSelected[idx] = best.member.id;
          memberWorkloads[best.member.id] = (memberWorkloads[best.member.id] || 0) + best.effectiveHours;
        } else {
          // 如果没有找到合适的成员，尝试使用全栈工程师作为后备
          console.log(`任务 ${idx} 没有找到合适的 ${mappedRole}，尝试使用全栈工程师`);
          const fallbackResults = smartMatchDevelopersForTask(
            { ...task, role: '全栈工程师' },
            teamMembers,
            assignedTasks,
            currentAssignMode
          );
          
          if (fallbackResults.length > 0) {
            const fallbackBest = fallbackResults[0];
            autoSelected[idx] = fallbackBest.member.id;
            const effectiveHours = Math.ceil(task.estimated_hours / fallbackBest.member.speed_factor);
            memberWorkloads[fallbackBest.member.id] = (memberWorkloads[fallbackBest.member.id] || 0) + effectiveHours;
            console.log(`✅ 为任务 ${idx} 分配了全栈工程师后备: ${fallbackBest.member.name}`);
          } else {
            console.log(`❌ 任务 ${idx} 彻底无法找到合适成员`);
          }
        }
      });
    } else if (currentAssignMode === 'balanced') {
      // 均衡分配逻辑：优先选择完成时间和价格都接近中位数的成员
      tasksToAssign.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师'
        ];
        // 先尝试角色映射，再检查是否在主流角色中，最后才用杂项专员
        let mappedRole = taskRoleMap[task.role] || task.role;
        if (!mainstreamRoles.includes(mappedRole)) {
          mappedRole = '杂项专员';
        }
        let matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamMembers,
          assignedTasks,
          currentAssignMode
        ).filter(r => r.canAssign);
        
        // 如果没有足够工时的成员，则选择所有推荐成员中的最佳选择
        if (matchResults.length === 0) {
          console.log(`任务 ${i} 没有找到有足够工时的 ${mappedRole}，选择最佳可用成员`);
          matchResults = smartMatchDevelopersForTask(
            { ...task, role: mappedRole },
            teamMembers,
            assignedTasks,
            currentAssignMode
          );
        }
        
        // 计算中位数
        const rates = matchResults.map(r => r.member.hourly_rate).sort((a, b) => a - b);
        const speeds = matchResults.map(r => r.member.speed_factor).sort((a, b) => a - b);
        const median = (arr: number[]) => arr.length % 2 === 0 ? (arr[arr.length/2-1] + arr[arr.length/2])/2 : arr[Math.floor(arr.length/2)];
        const medianRate = median(rates);
        const medianSpeed = median(speeds);
        // 选择时薪和速度都最接近中位数的成员
        let minScore = Infinity;
        let best: string | null = null;
        matchResults.forEach(r => {
          const score = Math.abs(r.member.hourly_rate - medianRate) + Math.abs(r.member.speed_factor - medianSpeed);
          if (score < minScore) {
            minScore = score;
            best = r.member.id;
          }
        });
        if (best) {
          autoSelected[i] = best;
        } else {
          // 如果没有找到合适的成员，尝试使用全栈工程师作为后备
          console.log(`任务 ${i} 没有找到合适的 ${mappedRole}，尝试使用全栈工程师`);
          const fallbackResults = smartMatchDevelopersForTask(
            { ...task, role: '全栈工程师' },
            teamMembers,
            assignedTasks,
            currentAssignMode
          ).filter(r => r.canAssign);
          
          if (fallbackResults.length > 0) {
            autoSelected[i] = fallbackResults[0].member.id;
            console.log(`✅ 为任务 ${i} 分配了全栈工程师: ${fallbackResults[0].member.name}`);
          }
        }
      });
    } else {
      // 最便宜模式：只考虑价格，不考虑时间
      tasksToAssign.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师'
        ];
        // 先尝试角色映射，再检查是否在主流角色中，最后才用杂项专员
        let mappedRole = taskRoleMap[task.role] || task.role;
        if (!mainstreamRoles.includes(mappedRole)) {
          mappedRole = '杂项专员';
        }
        let matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamMembers,
          assignedTasks,
          currentAssignMode
        ).filter(r => r.canAssign);
        
        // 如果没有足够工时的成员，则选择所有推荐成员中的最佳选择
        if (matchResults.length === 0) {
          console.log(`任务 ${i} 没有找到有足够工时的 ${mappedRole}，选择最佳可用成员`);
          matchResults = smartMatchDevelopersForTask(
            { ...task, role: mappedRole },
            teamMembers,
            assignedTasks,
            currentAssignMode
          );
        }
        
        // 按价格排序，选择最便宜的
        matchResults.sort((a, b) => a.member.hourly_rate - b.member.hourly_rate);
        const cheapest = matchResults[0];
        if (cheapest) {
          autoSelected[i] = cheapest.member.id;
        } else {
          // 如果没有找到合适的成员，尝试使用全栈工程师作为后备
          console.log(`任务 ${i} 没有找到合适的 ${mappedRole}，尝试使用全栈工程师`);
          const fallbackResults = smartMatchDevelopersForTask(
            { ...task, role: '全栈工程师' },
            teamMembers,
            assignedTasks,
            currentAssignMode
          );
          
          if (fallbackResults.length > 0) {
            fallbackResults.sort((a, b) => a.member.hourly_rate - b.member.hourly_rate);
            autoSelected[i] = fallbackResults[0].member.id;
            console.log(`✅ 为任务 ${i} 分配了全栈工程师后备: ${fallbackResults[0].member.name}`);
          } else {
            console.log(`❌ 任务 ${i} 彻底无法找到合适成员`);
          }
        }
      });
    }
    
    setSelectedMembers(autoSelected);
    console.log(`✅ 自动分配完成 - 来源: ${source}`, {
      成功分配: Object.keys(autoSelected).length,
      总任务数: tasksToAssign.length,
      分配详情: autoSelected
    });
  };

  // 🔧 简化的模式切换自动分配
  useEffect(() => {
    if (tasks.length > 0 && teamData.length > 0) {
      console.log('模式切换，重新执行自动分配');
      
      // 如果是第一次拆解且显示自动选择按钮，则不自动选择
      if (showAutoSelectButton) {
        console.log('模式切换时检测到第一次拆解，不自动选择，保持按钮显示');
        return;
      }
      
      const autoSelected = executeImmediateAutoSelection(
        tasks, 
        teamData, 
        assignMode, 
        '模式切换'
      );
      setSelectedMembers(autoSelected);
      // 模式切换后隐藏自动选择按钮
      setShowAutoSelectButton(false);
    }
  }, [assignMode, showAutoSelectButton]);



  useEffect(() => {
    if (ordersOpen && !isDeletingOrder) {
      // 只有在没有进行删除操作时才自动刷新订单列表
      console.log('📄 订单面板打开，刷新订单列表');
      fetchOrders();
    } else if (ordersOpen && isDeletingOrder) {
      console.log('⏸️ 订单删除中，跳过自动刷新');
    }
  }, [ordersOpen, isDeletingOrder]);



  // 🔧 简化的兜底检查机制 - 仅在必要时检查
  useEffect(() => {
    if (tasks.length > 0 && teamData.length > 0) {
      const selectedCount = Object.keys(selectedMembers).length;
      const tasksCount = tasks.length;
      
      // 如果选择不完整，等待2秒后重新选择（给其他机制时间）
      // 但如果是第一次拆解且显示自动选择按钮，则不触发兜底修复
      if (selectedCount < tasksCount && !showAutoSelectButton) {
        console.log('🔍 检测到选择不完整，准备兜底修复', {
          已选择: selectedCount,
          总任务: tasksCount,
          显示自动选择按钮: showAutoSelectButton
        });
        
        const timer = setTimeout(() => {
          const currentSelected = Object.keys(selectedMembers).length;
          if (currentSelected < tasksCount && !showAutoSelectButton) {
            console.log('🔧 执行兜底自动选择修复');
            const autoSelected = executeImmediateAutoSelection(
              tasks, 
              teamData, 
              assignMode, 
              '兜底修复'
            );
            setSelectedMembers(autoSelected);
          }
        }, 2000); // 2秒延迟
        
        return () => clearTimeout(timer);
      }
    }
  }, [tasks.length, teamData.length, selectedMembers, showAutoSelectButton]);

  // 处理成员点击弹窗的通用函数
  const handleMemberClick = (e: React.MouseEvent, member: any, taskIndex: number) => {
    // 使用鼠标位置来定位弹窗
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const popupWidth = 240;
    const popupHeight = 180;
    
    // 计算弹窗位置，优先显示在鼠标右侧
    let x = mouseX + 10;
    let y = mouseY - 20;
    
    // 如果右侧空间不够，显示在左侧
    if (x + popupWidth > window.innerWidth) {
      x = mouseX - popupWidth - 10;
    }
    
    // 如果下边空间不够，显示在上边
    if (y + popupHeight > window.innerHeight) {
      y = mouseY - popupHeight + 20;
    }
    
    // 确保不超出边界
    x = Math.max(10, Math.min(x, window.innerWidth - popupWidth - 10));
    y = Math.max(10, Math.min(y, window.innerHeight - popupHeight - 10));
    
    setSelectedMember(member);
    setPopupPos({ x, y });
    setPopupTaskIdx(taskIndex);
  };

  const handleSubmit = async () => {
    const trimmedInput = input.trim();
    
    // 基本长度检查
    if (trimmedInput.length < 2) {
      setModalMsg(t.modalInputTip);
      setModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/decompose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: input, assignMode, lang }),
      });
      
      // 检查响应状态
      if (!res.ok) {
        console.error('Decompose API响应错误:', res.status, res.statusText);
        const errorText = await res.text();
        console.error('错误响应内容:', errorText);
        
        // 特殊处理500错误，提供更友好的提示
        if (res.status === 500) {
          setModalMsg('AI处理失败，请尝试提供更详细的项目描述，或者稍后再试。');
          setModalOpen(true);
          setLoading(false);
          return;
        }
        
        throw new Error(`API错误: ${res.status} ${res.statusText}`);
      }
      
      // 检查内容类型
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('响应不是JSON格式:', contentType);
        const responseText = await res.text();
        console.error('响应内容:', responseText);
        
        setModalMsg('AI返回格式错误，请尝试重新描述您的项目需求。');
        setModalOpen(true);
        setLoading(false);
        return;
      }
      
      const data = await res.json();
      
      if (data.error) {
        console.error('API返回错误:', data.error);
        setModalMsg('AI处理出错，请尝试提供更清楚的项目描述。');
        setModalOpen(true);
        setLoading(false);
        return;
      }
      
      console.log('=== 任务分解返回数据 ===');
      console.log('完整的返回数据:', data);
      console.log('返回的orderId:', data.orderId);
      console.log('返回的任务数量:', data.tasks?.length);
      console.log('返回的成员数量:', data.members?.length);
      console.log('返回的message:', data.message);
      
      // 在客户端直接处理数据保存到localStorage
      if (data.orderData && data.tasks) {
        console.log('在客户端保存数据到localStorage...');
        
        // 读取现有数据
        const existingOrders = JSON.parse(getLocalStorage('orders') || '[]');
        const existingTasks = JSON.parse(getLocalStorage('tasks') || '[]');
        
        console.log('现有订单数量:', existingOrders.length);
        console.log('现有任务数量:', existingTasks.length);
        
        // 处理任务数据，确保包含所有必要的属性
        const processedTasks = data.tasks.map((task: any, idx: number) => ({ 
          ...task, 
          title: task.title_zh || task.title || '',
          role: task.role_zh || task.role || '',
          status: STATUS.NOT_STARTED, 
          id: task.id
        }));
        
        // 添加新订单和任务
        existingOrders.push(data.orderData);
        existingTasks.push(...processedTasks);
        
        // 保存到localStorage
        setLocalStorage('orders', JSON.stringify(existingOrders));
        setLocalStorage('tasks', JSON.stringify(existingTasks));
        
        console.log('保存后订单数量:', existingOrders.length);
        console.log('保存后任务数量:', existingTasks.length);
        console.log('新增订单:', data.orderData);
        console.log('新增任务数量:', processedTasks.length);
        console.log('处理后的任务示例:', processedTasks[0]);
      }
      
      // 使用数据库返回的任务数据
      const tasksWithId = data.tasks.map((task: any, idx: number) => ({ 
        ...task, 
        title: task.title_zh || task.title || '',
        role: task.role_zh || task.role || '',
        status: STATUS.NOT_STARTED, 
        id: task.id  // 直接使用数据库返回的ID，不重新生成
      }));
      console.log('处理后的任务数据:', tasksWithId);
      const normalizedTasks = tasksWithId.map(normalizeTaskStatus);
      setTasks(normalizedTasks);
      // 重置已分配任务状态，确保重新拆解时有完整的成员选择
      setAssignedTasks({});
      setDbOrderId(data.orderId);
      console.log('设置的dbOrderId:', data.orderId);
            // 统一使用API返回的成员数据，确保数据一致性
      if (data.members) {
        setTeamData(data.members);
        
        // 🔧 第一次拆解任务时不自动选择，显示按钮让用户手动触发
        if (isFirstDecomposition) {
          console.log('🚀 第一次拆解任务，不自动选择，显示自动选择按钮');
          setShowAutoSelectButton(true);
          setSelectedMembers({}); // 清空选择
          setIsFirstDecomposition(false); // 标记不再是第一次拆解
        } else {
          // 非第一次拆解，使用自动选择
          const autoSelected = executeImmediateAutoSelection(
            normalizedTasks, 
            data.members, 
            assignMode, 
            'API任务分解'
          );
          setSelectedMembers(autoSelected);
          setShowAutoSelectButton(false); // 非第一次拆解时不显示按钮
          console.log('🚀 API任务分解和即时自动选择完成', {
            tasksCount: normalizedTasks.length,
            membersCount: data.members?.length || 0,
            autoSelectedCount: Object.keys(autoSelected).length,
            assignMode
          });
        }
      }
      
      // 任务分解成功后，如果订单面板打开，刷新订单列表
      if (ordersOpen) {
        setTimeout(() => {
          fetchOrders();
        }, 500); // 延迟500ms确保数据已保存
      }
    } catch (error) {
      console.error('Submit error:', error);
      
      // 根据错误类型提供更友好的提示
      let userMessage = '';
      const errorStr = String(error);
      
      if (errorStr.includes('500 Internal Server Error')) {
        userMessage = 'AI处理失败，请尝试：\n• 提供更详细的项目描述\n• 使用具体的功能说明\n• 稍后重试';
      } else if (errorStr.includes('网络')) {
        userMessage = '网络连接失败，请检查网络后重试';
      } else if (errorStr.includes('JSON')) {
        userMessage = 'AI返回数据格式错误，请重试或联系管理员';
      } else {
        userMessage = '提交失败，请重试。如果问题持续，请稍后再试。';
      }
      
      setModalMsg(userMessage);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // 新增：校验成员可用时长
  function isDevDisabled(dev: any, taskIdx: number) {
    let used = 0;
    Object.entries(selectedMembers).forEach(([idx, devId]) => {
      if (parseInt(idx) !== taskIdx && devId === dev.id) {
        used += tasks[parseInt(idx)]?.estimated_hours || 0;
      }
    });
    const thisTaskHours = tasks[taskIdx]?.estimated_hours || 0;
    return used + thisTaskHours > dev.available_hours;
  }

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setIsDeletingOrder(true); // 设置删除状态
      console.log('=== 删除订单 ===');
      console.log('删除订单ID:', orderId);
      
      // 1. 删除localStorage中的订单和相关任务
      const savedOrders = JSON.parse(getLocalStorage('orders') || '[]');
      const savedTasks = JSON.parse(getLocalStorage('tasks') || '[]');
      
      // 过滤掉要删除的订单
      const filteredOrders = savedOrders.filter((o: any) => o.id !== orderId);
      // 过滤掉该订单的所有任务
      const filteredTasks = savedTasks.filter((t: any) => t.order_id !== orderId);
      
      // 保存更新后的数据
      setLocalStorage('orders', JSON.stringify(filteredOrders));
      setLocalStorage('tasks', JSON.stringify(filteredTasks));
      
      console.log(`✅ 本地数据删除完成`);
      console.log(`- 剩余订单: ${filteredOrders.length}`);
      console.log(`- 剩余任务: ${filteredTasks.length}`);
      
      // 2. 更新UI状态（确保排序）
      const sortedOrders = filteredOrders.sort((a: any, b: any) => {
        const timeA = parseInt(a.id) || 0;
        const timeB = parseInt(b.id) || 0;
        return timeB - timeA;
      });
      
      console.log('🗑️ 删除后更新前端订单状态:', {
        删除的订单ID: orderId,
        删除前订单数量: savedOrders.length,
        删除后订单数量: sortedOrders.length,
        剩余订单IDs: sortedOrders.map(o => o.id)
      });
      
      setOrders(sortedOrders);
      setDeleteOrderId(null);
      
      // 确保状态更新后验证
      setTimeout(() => {
        console.log('🔍 验证删除后的订单状态:', {
          前端orders数量: orders.length,
          localStorage订单数量: JSON.parse(getLocalStorage('orders') || '[]').length
        });
      }, 100);
      
      // 3. 尝试同步到服务器（不阻塞）
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
          console.log('✅ 服务器删除成功');
          // 删除成功后，重新从服务器获取最新订单列表
          setTimeout(() => {
            fetchOrders();
          }, 500); // 延迟500ms确保服务器数据已更新
        } else {
          console.log('⚠️ 服务器删除失败，但本地数据已删除');
          // 即使服务器删除失败，也保持本地删除的状态
      }
      } catch (syncError) {
        console.log('⚠️ 服务器删除出错，但本地数据已删除:', syncError);
        // 网络错误，保持本地删除的状态
      }
      
    } catch (error) {
      console.error('删除订单失败:', error);
      setModalMsg(`删除失败: ${String(error)}`);
      setModalOpen(true);
    } finally {
      // 无论成功还是失败，都清除删除状态
      setTimeout(() => {
        setIsDeletingOrder(false);
      }, 1000); // 延迟1秒清除，确保删除操作完全完成
    }
  };

  // 兼容老数据：tasks 读取/初始化时自动转换
  const normalizeTaskStatus = (task: Task): Task => ({
    ...task,
    status: statusTextToCode[task.status] || task.status
  });

  // 计算预计完成时间
  const calculateEstimatedCompletionTime = () => {
    if (tasks.length === 0) return null;
    
    // 如果选择了成员，按实际分配计算
    if (Object.keys(selectedMembers).length > 0) {
      // 计算每个成员的工作负载
      const memberWorkload: { [memberId: string]: number } = {};
      
      tasks.forEach((task, index) => {
        const memberId = selectedMembers[index];
        if (memberId) {
          const member = teamData.find(m => m.id === memberId);
          if (member) {
            // 考虑速度因子：实际工时 = 预估工时 / 速度因子
            const actualHours = task.estimated_hours / member.speed_factor;
            memberWorkload[memberId] = (memberWorkload[memberId] || 0) + actualHours;
          }
        }
      });
      
      // 找到最忙的成员（瓶颈）
      const maxWorkload = Math.max(...Object.values(memberWorkload));
    
    // 假设每天工作8小时，每周工作5天
    const hoursPerDay = 8;
    const daysPerWeek = 5;
    const hoursPerWeek = hoursPerDay * daysPerWeek; // 40小时/周
    
      // 计算需要的周数（基于最忙的成员）
      const weeksNeeded = Math.ceil(maxWorkload / hoursPerWeek);
      const daysNeeded = Math.ceil(maxWorkload / hoursPerDay);
    
    return {
        totalHours: Object.values(memberWorkload).reduce((sum, hours) => sum + hours, 0),
      weeksNeeded,
      daysNeeded,
      hoursPerDay,
      hoursPerWeek
      };
    } else {
      // 没有选择成员时，按分配模式估算
      let estimatedWeeks = 0;
      
      if (assignMode === 'fast') {
        // 最快模式：假设可以并行工作，时间取决于最长的单个任务
        const maxTaskHours = Math.max(...tasks.map(t => t.estimated_hours));
        const hoursPerWeek = 8 * 5; // 40小时/周
        estimatedWeeks = Math.ceil(maxTaskHours / hoursPerWeek);
      } else if (assignMode === 'balanced') {
        // 均衡模式：考虑并行性，但时间稍长
        const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
        const hoursPerWeek = 8 * 5; // 40小时/周
        estimatedWeeks = Math.ceil(totalHours / hoursPerWeek / 2); // 假设50%并行度
      } else {
        // 最便宜模式：可能串行工作，时间最长
        const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
        const hoursPerWeek = 8 * 5; // 40小时/周
        estimatedWeeks = Math.ceil(totalHours / hoursPerWeek);
      }
      
      const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
      const daysNeeded = Math.ceil(totalHours / 8);
      
      return {
        totalHours,
        weeksNeeded: estimatedWeeks,
        daysNeeded,
        hoursPerDay: 8,
        hoursPerWeek: 40
      };
    }
  };

  // 计算总金额
  const calculateTotalCost = () => {
    if (tasks.length === 0 || Object.keys(selectedMembers).length === 0) return null;
    
    let totalCost = 0;
    let totalHours = 0;
    
    tasks.forEach((task, index) => {
      const memberId = selectedMembers[index];
      if (memberId) {
        const member = teamData.find(m => m.id === memberId);
        if (member) {
          const taskCost = task.estimated_hours * member.hourly_rate;
          totalCost += taskCost;
          totalHours += task.estimated_hours;
        }
      }
    });
    
    return {
      totalCost,
      totalHours,
      averageHourlyRate: totalHours > 0 ? totalCost / totalHours : 0
    };
  };

  // 拉取团队成员数据
  useEffect(() => {
    async function fetchMembers() {
      try {
        console.log('=== 获取团队成员数据 ===');
      const res = await fetch('/api/members');
      const data = await res.json();
        
        if (data.members && data.members.length > 0) {
          console.log('从API获取到成员数量:', data.members.length);
          setTeamData(data.members);
          
          // 🔧 不再依赖异步状态，使用组件状态快照检查
          if (tasks.length > 0) {
            console.log('fetchMembers完成，立即执行自动分配');
            const autoSelected = executeImmediateAutoSelection(
              tasks, 
              data.members, 
              assignMode, 
              'API成员加载完成'
            );
            setSelectedMembers(autoSelected);
          } else {
            console.log('fetchMembers完成，但尚无任务数据，跳过自动选择');
          }
        } else {
          // API返回空数据，尝试从localStorage获取
          console.log('API返回空成员数据，尝试从localStorage获取...');
          const savedMembers = JSON.parse(getLocalStorage('teamMembers') || '[]');
          console.log('localStorage中成员数量:', savedMembers.length);
          
          if (savedMembers.length > 0) {
            setTeamData(savedMembers);
            console.log('成功从localStorage加载成员数据');
            
            // 🔧 不再依赖异步状态，使用组件状态快照检查
            if (tasks.length > 0) {
              console.log('localStorage成员加载完成，立即执行自动分配');
              const autoSelected = executeImmediateAutoSelection(
                tasks, 
                savedMembers, 
                assignMode, 
                'localStorage成员加载'
              );
              setSelectedMembers(autoSelected);
            } else {
              console.log('localStorage成员加载完成，但尚无任务数据，跳过自动选择');
            }
          }
        }
      } catch (error) {
        console.error('获取团队成员失败:', error);
        // API调用失败，尝试从localStorage获取
        const savedMembers = JSON.parse(getLocalStorage('teamMembers') || '[]');
        if (savedMembers.length > 0) {
          setTeamData(savedMembers);
          console.log('API失败，从localStorage加载成员数据:', savedMembers.length);
          
          // 🔧 不再依赖异步状态，使用组件状态快照检查
          if (tasks.length > 0) {
            console.log('错误处理-成员加载完成，立即执行自动分配');
            const autoSelected = executeImmediateAutoSelection(
              tasks, 
              savedMembers, 
              assignMode, 
              '错误恢复-成员加载'
            );
            setSelectedMembers(autoSelected);
          } else {
            console.log('错误处理-成员加载完成，但尚无任务数据，跳过自动选择');
          }
        }
      }
    }
    fetchMembers();
  }, []);

  // 新增：拉取订单详情时初始化 input 和 assignMode
  useEffect(() => {
    if (orderId) {
      (async () => {
        console.log('=== 加载订单数据 ===');
        console.log('订单ID:', orderId);
        
        // 首先尝试从localStorage加载数据
        const savedOrders = JSON.parse(getLocalStorage('orders') || '[]');
        const savedTasks = JSON.parse(getLocalStorage('tasks') || '[]');
        
        console.log('localStorage中的订单数量:', savedOrders.length);
        console.log('localStorage中的任务数量:', savedTasks.length);
        
        // 查找对应的订单和任务
        const targetOrder = savedOrders.find((order: any) => order.id === orderId);
        const targetTasks = savedTasks.filter((task: any) => task.order_id === orderId);
        
        console.log('找到的订单:', targetOrder);
        console.log('找到的任务数量:', targetTasks.length);
        
        if (targetOrder && targetTasks.length > 0) {
          console.log('从localStorage加载数据成功');
          setTasks(targetTasks.map(normalizeTaskStatus));
          setDbOrderId(orderId as string);
          setOrderStatus(targetOrder.status || '未开始');
          setInput(targetOrder.goal || '');
          setAssignMode(targetOrder.assign_mode || 'slow');
          // 重置已分配任务状态，selectedMembers由自动分配 useEffect 处理
          setAssignedTasks({});
        } else {
          // 如果没有返回成员数据，单独获取
          const res = await fetch(`/api/orders?orderId=${orderId}`);
          const data = await res.json();
          if (data.tasks) {
            setTasks(data.tasks.map(normalizeTaskStatus));
            setDbOrderId(orderId as string);
          }
          if (data.order && data.order.status) {
            setOrderStatus(data.order.status);
          }
          if (data.order && data.order.goal) {
            setInput(data.order.goal);
          }
          if (data.order && data.order.assign_mode) {
                        setAssignMode(data.order.assign_mode);
            }
            // 重置已分配任务状态，selectedMembers由自动分配 useEffect 处理
            setAssignedTasks({});
          if (data.members) {
            setTeamData(data.members);
                    // 🔧 从订单加载时立即执行同步自动分配（保持原来的逻辑）
        if (data.tasks && data.tasks.length > 0) {
          const normalizedTasks = data.tasks.map(normalizeTaskStatus);
          const autoSelected = executeImmediateAutoSelection(
            normalizedTasks, 
            data.members, 
            data.order?.assign_mode || 'slow', 
            '订单数据加载1'
          );
          setSelectedMembers(autoSelected);
          setShowAutoSelectButton(false); // 从订单进入时不显示自动选择按钮
        }
          } else {
            const membersRes = await fetch('/api/members');
            const membersData = await membersRes.json();
            if (membersData.members) {
              setTeamData(membersData.members);
              // 🔧 从订单加载时立即执行同步自动分配（保持原来的逻辑）
              if (data.tasks && data.tasks.length > 0) {
                const normalizedTasks = data.tasks.map(normalizeTaskStatus);
                const autoSelected = executeImmediateAutoSelection(
                  normalizedTasks, 
                  membersData.members, 
                  data.order?.assign_mode || 'slow', 
                  '订单数据加载2'
                );
                setSelectedMembers(autoSelected);
                setShowAutoSelectButton(false); // 从订单进入时不显示自动选择按钮
              }
            }
          }
        }
        // 如果从localStorage加载了数据，也需要获取团队成员数据
        if (targetOrder && targetTasks.length > 0) {
          const membersRes = await fetch('/api/members');
          const membersData = await membersRes.json();
          if (membersData.members) {
            setTeamData(membersData.members);
            // 🔧 从localStorage加载时立即执行同步自动分配（保持原来的逻辑）
            const normalizedTasks = targetTasks.map(normalizeTaskStatus);
            const autoSelected = executeImmediateAutoSelection(
              normalizedTasks, 
              membersData.members, 
              targetOrder.assign_mode || 'slow', 
              'localStorage恢复'
            );
            setSelectedMembers(autoSelected);
            setShowAutoSelectButton(false); // 从localStorage恢复时不显示自动选择按钮
          }
        }
      })();
    }
  }, [orderId]);

  // 处理重新分配单个任务的逻辑
  useEffect(() => {
    const { reassignTask } = router.query;
    if (reassignTask && orderId && tasks.length > 0) {
      // 找到需要重新分配的任务
      const taskIndex = tasks.findIndex(task => task.id === reassignTask);
      if (taskIndex !== -1) {
        // 清除该任务的分配
        setSelectedMembers(prev => {
          const newSelected = { ...prev };
          delete newSelected[taskIndex];
          return newSelected;
        });
        
        // 清除该任务的已分配状态
        setAssignedTasks(prev => {
          const newAssigned = { ...prev };
          // 重置所有成员的工时分配
          Object.keys(newAssigned).forEach(memberId => {
            newAssigned[memberId] = [0, 0, 0, 0]; // 重置为每周0工时
          });
          return newAssigned;
        });
        
        console.log(`任务 ${reassignTask} 已重置分配状态`);
      }
    }
  }, [router.query.reassignTask, orderId, tasks]);

  // 条件渲染 - 移到所有useEffect之后
  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white'
      }}>
        <div style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '40px 20px'
        }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
            页面加载错误
          </h1>
          <p style={{ marginBottom: '20px' }}>
            错误信息: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#4CAF50',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  if (!isClient) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>
            加载中...
          </h1>
        </div>
      </div>
    );
  }

  // 在组件内部定义 mainContent
  console.log("调试信息:", {
    orderId,
    dbOrderId,
    orderStatus,
    tasksLength: tasks.length,
    input,
    loading
  });
  
  let mainContent;
  // 使用 dbOrderId 或 orderId，优先使用 dbOrderId（新创建的订单）
  const currentOrderId = dbOrderId || orderId;
  
  if (currentOrderId && tasks.length > 0) {
    // 任务分配界面内容 - 有任务数据时显示
    mainContent = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>{t.title}</h1>
          
          {/* 自动选择按钮 - 仅在第一次拆解任务时显示 */}
          {tasks.length > 0 && showAutoSelectButton && (
            <button
              style={{ 
                background: '#3b82f6', 
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              onClick={() => {
                console.log('🚀 用户点击自动选择按钮');
                const autoSelected = executeImmediateAutoSelection(
                  tasks, 
                  teamData, 
                  assignMode, 
                  '用户手动触发'
                );
                setSelectedMembers(autoSelected);
                setShowAutoSelectButton(false); // 隐藏按钮
                setIsFirstDecomposition(false); // 标记不再是第一次拆解
              }}
            >
              🤖 {lang === 'zh' ? '自动选择成员' : 'Auto Select'}
            </button>
          )}
        </div>
        
        {/* 重新拆解功能 - 对所有有任务的订单都显示 */}
        <div className="mb-6 p-4 border rounded bg-gray-50">
          <h3 className="text-lg font-semibold mb-3">{t.redecompose}</h3>
          <textarea
            className="w-full p-2 border rounded mb-4"
            rows={3}
            placeholder={t.inputPlaceholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            onClick={handleSubmit}
            className="btn"
            disabled={loading || !input}
          >
            {loading ? t.submitting : t.submit}
          </button>
        </div>
        
        <div className="mt-6 space-y-4">
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2 className="text-lg font-semibold">{t.taskList}</h2>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <span className="font-bold" style={{ color: '#fff' }}>{t.mode}</span>
              <label style={{ marginLeft: 12, color: '#fff' }}>
                <input type="radio" name="assignMode" value="fast" checked={assignMode === 'fast'} onChange={() => setAssignMode('fast')} />
                <span style={{ marginLeft: 4 }}>{t.fast}</span>
              </label>
              <label style={{ marginLeft: 12, color: '#fff' }}>
                <input type="radio" name="assignMode" value="balanced" checked={assignMode === 'balanced'} onChange={() => setAssignMode('balanced')} />
                <span style={{ marginLeft: 4 }}>{t.balanced}</span>
              </label>
              <label style={{ marginLeft: 12, color: '#fff' }}>
                <input type="radio" name="assignMode" value="slow" checked={assignMode === 'slow'} onChange={() => setAssignMode('slow')} />
                <span style={{ marginLeft: 4 }}>{t.slow}</span>
              </label>
            </div>
          </div>
          

          {tasks.map((task, i) => {
            // 统一角色名称，非主流职位自动分配到"杂项专员"
            const mainstreamRoles = [
              '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
              '产品经理', 'DevOps工程师', '全栈工程师', '前端开发工程师', '后端开发工程师', 'UI/UX设计师'
            ];
            const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
            
            console.log(`=== 任务 ${i}: ${(task as any).name_zh || (task as any).title} ===`);
            console.log('原始角色:', task.role_zh || task.role);
            console.log('映射后角色:', mappedRole);
            console.log('团队数据长度:', teamData.length);
            console.log('分配模式:', assignMode);
            
            let matchResults: SmartMatchResult[] = [];
            if (teamData.length === 0) {
              console.log('⚠️ 团队数据为空，无法进行匹配');
              matchResults = [];
            } else {
              matchResults = smartMatchDevelopersForTask(
                { ...task, role: mappedRole },
                teamData,
                assignedTasks,
                assignMode
              );
              
              console.log(`匹配结果数量: ${matchResults.length}`);
              console.log(`可分配成员: ${matchResults.filter(r => r.canAssign).length}`);
              
              if (matchResults.length > 0) {
                console.log('匹配到的成员示例:', matchResults.slice(0, 3).map(r => ({
                  name: r.member.name,
                  roles: r.member.roles,
                  canAssign: r.canAssign,
                  hourlyRate: r.member.hourly_rate
                })));
              }
            }
            // 可分配成员和时长不足成员分开
            let canAssign = matchResults.filter(r => r.canAssign);
            const cannotAssign = matchResults.filter(r => !r.canAssign);
            // 选中成员在本任务中移到最前
            const selectedId = selectedMembers[i] || null;
            
            console.log(`=== 任务 ${i} 选中状态调试 ===`);
            console.log(`selectedId:`, selectedId);
            console.log(`selectedMembers[${i}]:`, selectedMembers[i]);
            console.log(`selectedMembers 完整对象:`, selectedMembers);
            console.log(`selectedMembers 的类型:`, typeof selectedMembers);
            console.log(`selectedMembers 是否为null:`, selectedMembers === null);
            console.log(`selectedMembers[${i}] 的类型:`, typeof selectedMembers[i]);
            if (selectedId) {
              const idx = canAssign.findIndex(r => r.member.id === selectedId);
              if (idx > 0) {
                const [sel] = canAssign.splice(idx, 1);
                canAssign.unshift(sel);
              }
            }
            // 推荐成员筛选逻辑，确保选中的成员总是显示在第一位
            const currentTaskSelectedId = selectedMembers[i];
            const currentTaskSelectedMember = matchResults.find(r => r.member.id === currentTaskSelectedId);
            
            let showDevs: SmartMatchResult[] = [];
            let moreDevs: SmartMatchResult[] = [];
            const maxShow = 12;
            
            // 1. 首先处理选中的成员（如果有的话）
            if (currentTaskSelectedMember) {
              showDevs.push(currentTaskSelectedMember);
              console.log(`任务 ${i} 选中成员 ${currentTaskSelectedMember.member.name} 已放在第一位`);
            }
            
            // 2. 添加其他推荐成员
            if (canAssign.length === 0) {
              // 没有完全符合的人，推荐最接近的成员
              const remainingResults = matchResults.filter(r => r.member.id !== currentTaskSelectedId);
              showDevs.push(...remainingResults.slice(0, maxShow - showDevs.length));
              moreDevs = remainingResults.slice(maxShow - showDevs.length);
            } else {
              // 有可分配的成员，优先显示可分配的
              const remainingCanAssign = canAssign.filter(r => r.member.id !== currentTaskSelectedId);
              const remainingCannot = matchResults.filter(r => !r.canAssign && r.member.id !== currentTaskSelectedId);
              
              // 按价格排序，优先显示便宜的
              remainingCanAssign.sort((a, b) => a.member.hourly_rate - b.member.hourly_rate);
              
              // 先添加可分配的成员
              const availableSlots = maxShow - showDevs.length;
              showDevs.push(...remainingCanAssign.slice(0, availableSlots));
              
              // 如果还有空位，添加不可分配的成员
              const remainingSlots = maxShow - showDevs.length;
              if (remainingSlots > 0) {
                showDevs.push(...remainingCannot.slice(0, remainingSlots));
              }
              
              // 剩余的成员放到 moreDevs
              moreDevs = [
                ...remainingCanAssign.slice(availableSlots),
                ...remainingCannot.slice(Math.max(0, remainingSlots))
              ];
            }
            
            console.log(`任务 ${i} 最终显示列表:`, showDevs.map(r => r.member.name));
            console.log(`任务 ${i} 选中成员在第一位:`, showDevs[0]?.member.id === currentTaskSelectedId);
            return (
              <div key={i} className="border p-4 rounded shadow mb-4">
                <p><strong>{t.task}</strong>{lang === 'zh' ? (task.title_zh || task.title) : (task.title_en || task.title) || ''}</p>
                <p><strong>{t.role}</strong>{lang === 'zh' ? (task.role_zh || task.role) : (task.role_en || task.role) || ''}</p>
                <p><strong>{t.est}</strong>{task.estimated_hours} {lang === 'zh' ? '小时' : 'h'}</p>
                <p><strong>{t.status}：</strong>{statusI18n[lang][task.status] || task.status}</p>
                {/* 推荐成员名字，可选 */}
                <div className="mt-2">
                  <strong>{t.recommend}</strong>
                  {showDevs.length === 0 ? (
                    <span className="text-gray-500">{t.none}</span>
                  ) : (
                    <>
                      {showDevs.map(({ member, canAssign, nextAvailableWeek, effectiveHours }, idx) => {
                        // 检查是否为选中的成员
                        const isSelected = selectedId === member.id;
                        console.log(`成员 ${member.name} (ID: ${member.id}) - selectedId: ${selectedId} - isSelected: ${isSelected}`);
                        return (
                          <span
                            key={member.id}
                            className={`member-badge${isSelected ? ' selected-member' : ''}`}
                            onClick={e => handleMemberClick(e, member, i)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title={canAssign ? t.detail : t.detailInsufficient}
                          >
                            {lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                          </span>
                        );
                      })}
                      {moreDevs.length > 0 && (
                        <span style={{ color: '#64748b', marginLeft: 8, fontSize: '0.98em' }}>{t.moreLabel}</span>
                      )}
                    </>
                  )}
                </div>
                <div className="mt-2 flex gap-2">
                  <button className="btn" onClick={() => setExpandedTasks(prev => ({ ...prev, [i]: prev[i] === 'more' ? null : 'more' }))}>{t.more}</button>
                  <button className="btn" style={{ background: '#e11d48' }} onClick={() => setExpandedTasks(prev => ({ ...prev, [i]: prev[i] === 'insufficient' ? null : 'insufficient' }))}>{t.insufficient}</button>
                </div>
                {expandedTasks[i] === 'more' && (
                  <div className="p-2 border rounded bg-gray-50 mt-2">
                    {/* 价格过高成员 */}
                    <div style={{ marginBottom: 8 }}>
                      <strong>{t.tooExpensive}</strong>
                      {moreDevs.filter(r => r.member.hourly_rate > 130).length === 0 ? <span className="text-gray-500">{t.no}</span> : moreDevs.filter(r => r.member.hourly_rate > 130).map(({ member, effectiveHours }) => {
                        const isSelected = selectedId === member.id;
                        return (
                          <span
                            key={member.id}
                            className={`member-badge${isSelected ? ' selected-member' : ''}`}
                            onClick={e => handleMemberClick(e, member, i)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title={t.select}
                          >
                            {lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                          </span>
                        );
                      })}
                    </div>
                    {/* 速度过慢成员 */}
                    <div style={{ marginBottom: 8 }}>
                      <strong>{t.tooSlow}</strong>
                      {moreDevs.filter(r => r.member.speed_factor < 0.8).length === 0 ? <span className="text-gray-500">{t.no}</span> : moreDevs.filter(r => r.member.speed_factor < 0.8).map(({ member, effectiveHours }) => {
                        const isSelected = selectedId === member.id;
                        return (
                          <span
                            key={member.id}
                            className={`member-badge${isSelected ? ' selected-member' : ''}`}
                            onClick={e => handleMemberClick(e, member, i)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title={t.select}
                          >
                            {lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                          </span>
                        );
                      })}
                    </div>
                    {/* 其他成员 */}
                    <div>
                      <strong>{t.others}</strong>
                      {moreDevs.filter(r => r.member.hourly_rate <= 130 && r.member.speed_factor >= 0.8).length === 0 ? <span className="text-gray-500">{t.no}</span> : moreDevs.filter(r => r.member.hourly_rate <= 130 && r.member.speed_factor >= 0.8).map(({ member, effectiveHours }) => {
                        const isSelected = selectedId === member.id;
                        return (
                          <span
                            key={member.id}
                            className={`member-badge${isSelected ? ' selected-member' : ''}`}
                            onClick={e => handleMemberClick(e, member, i)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title={t.select}
                          >
                            {lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}
                {expandedTasks[i] === 'insufficient' && (
                  <div className="p-2 border rounded bg-gray-50 mt-2">
                    {cannotAssign.length === 0 ? (
                      <span className="text-gray-500">{t.no}</span>
                    ) : (
                      cannotAssign.map(({ member, effectiveHours }) => {
                        const isSelected = selectedId === member.id;
                        return (
                          <span
                            key={member.id}
                            className={`member-badge${isSelected ? ' selected-member' : ''}`}
                            onClick={e => handleMemberClick(e, member, i)}
                            style={{ cursor: 'pointer', userSelect: 'none' }}
                            title={t.detailInsufficient}
                          >
                            {lang === 'zh' ? (member.name_zh || member.name) : (member.name_en || member.name)} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                          </span>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* 预计完成时间和总金额显示 */}
          {tasks.length > 0 && (() => {
            const completionInfo = calculateEstimatedCompletionTime();
            const costInfo = calculateTotalCost();
            if (!completionInfo) return null;
            
            return (
              <div style={{
                marginTop: 24,
                padding: 16,
                background: '#f8fafc',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: 8
                }}>
                  {lang === 'zh' ? '📅 预计完成时间' : '📅 Estimated Completion Time'}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 24,
                  flexWrap: 'wrap'
                }}>
                  <div style={{
                    background: '#fff',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    minWidth: 120
                  }}>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                      {lang === 'zh' ? '总工时' : 'Total Hours'}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>
                      {completionInfo.totalHours.toFixed(1)} {lang === 'zh' ? '小时' : 'h'}
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#fff',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    minWidth: 120
                  }}>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                      {lang === 'zh' ? '预计天数' : 'Estimated Days'}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>
                      {completionInfo.daysNeeded} {lang === 'zh' ? '天' : 'days'}
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#fff',
                    padding: '12px 16px',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    minWidth: 120
                  }}>
                    <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                      {lang === 'zh' ? '预计周数' : 'Estimated Weeks'}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>
                      {completionInfo.weeksNeeded} {lang === 'zh' ? '周' : 'weeks'}
                    </div>
                  </div>
                </div>
                
                {/* 分配模式说明 */}
                <div style={{
                  marginTop: 12,
                  fontSize: 12,
                  color: '#64748b',
                  fontStyle: 'italic'
                }}>
                  {assignMode === 'fast' && (lang === 'zh' ? 
                    '⚡ 最快模式：优先选择速度快的成员，实现并行工作' : 
                    '⚡ Fastest Mode: Prioritizes fast members for parallel work'
                  )}
                  {assignMode === 'balanced' && (lang === 'zh' ? 
                    '⚖️ 均衡模式：平衡速度与成本，考虑并行性' : 
                    '⚖️ Balanced Mode: Balances speed and cost with parallel work'
                  )}
                  {assignMode === 'slow' && (lang === 'zh' ? 
                    '💰 最便宜模式：选择时薪最低的成员，不考虑时间' : 
                    '💰 Cheapest Mode: Selects lowest hourly rate members, time not considered'
                  )}
                </div>
                
                {/* 总金额显示 */}
                {costInfo && Object.keys(selectedMembers).length > 0 && (
                  <div style={{
                    marginTop: 16,
                    padding: '16px 0',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: 18,
                      fontWeight: 600,
                      color: '#1e293b',
                      marginBottom: 8
                    }}>
                      {lang === 'zh' ? '💰 预计总金额' : '💰 Estimated Total Cost'}
                    </div>
                    <div style={{
                      background: '#fff',
                      padding: '12px 16px',
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      display: 'inline-block',
                      minWidth: 200
                    }}>
                      <div style={{ fontSize: 14, color: '#64748b', marginBottom: 4 }}>
                        {t.totalCost}
                      </div>
                      <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
                        ¥{costInfo.totalCost.toLocaleString()}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                        {lang === 'zh' 
                          ? `平均时薪: ¥${costInfo.averageHourlyRate.toFixed(0)}/小时`
                          : `Avg Rate: ¥${costInfo.averageHourlyRate.toFixed(0)}/h`
                        }
                      </div>
                    </div>
                  </div>
                )}
                
                <div style={{
                  fontSize: 12,
                  color: '#64748b',
                  marginTop: 12,
                  fontStyle: 'italic'
                }}>
                  {lang === 'zh' 
                    ? `* 基于每天${completionInfo.hoursPerDay}小时，每周${completionInfo.hoursPerWeek}小时的工作量计算`
                    : `* Based on ${completionInfo.hoursPerDay}h/day, ${completionInfo.hoursPerWeek}h/week workload`
                  }
                </div>
              </div>
            );
          })()}
          

          
          {/* 确认分配按钮 */}
          {tasks.length > 0 && (
            <div className="mt-6 text-center" style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button
                className="btn"
                onClick={async () => {
                  try {
                    console.log('=== 开始分配任务 ===');
                    console.log('当前dbOrderId:', dbOrderId);
                    console.log('当前tasks:', tasks);
                    console.log('当前selectedMembers:', selectedMembers);
                    
                    const assignments = Object.entries(selectedMembers).map(([taskIdx, memberId]) => ({
                      taskId: tasks[parseInt(taskIdx)].id,
                      memberId
                    }));
                    console.log('构建的assignments:', assignments);
                    
                    // 强制为所有任务分配开发者
                    console.log('=== 强制分配所有任务 ===');
                    console.log('任务数量:', tasks.length);
                    console.log('已选择的成员:', selectedMembers);
                    
                    // 为每个任务分配开发者
                    const allAssignments = [];
                    for (let i = 0; i < tasks.length; i++) {
                      const task = tasks[i];
                      let memberId = selectedMembers[i];
                      
                      // 如果没有手动选择，则自动选择（但不显示给用户）
                      if (!memberId) {
                        console.log(`任务 ${i} 未选择开发者，静默自动选择...`);
                        const taskRecommendations = smartMatchDevelopersForTask(task, teamData, {}, 'fast');
                        if (taskRecommendations.length > 0) {
                          memberId = taskRecommendations[0].member.id;
                          console.log(`✅ 静默自动选择任务 ${i} 的开发者: ${taskRecommendations[0].member.name} (ID: ${memberId})`);
                        } else {
                          // 如果还是没有，选择第一个团队成员
                          if (teamData.length > 0) {
                            memberId = teamData[0].id;
                            console.log(`⚠️ 静默使用默认开发者: ${teamData[0].name} (ID: ${memberId})`);
                          }
                        }
                      }
                      
                      if (memberId) {
                        allAssignments.push({
                          taskId: task.id,
                          memberId: memberId
                        });
                        console.log(`✅ 任务 ${i} (${(task as any).name_zh || (task as any).title_zh || task.title}) 分配给开发者 ${memberId}`);
                      }
                    }
                    
                    console.log('所有分配结果:', allAssignments);
                    assignments.length = 0;
                    assignments.push(...allAssignments);
                    
                    // === 完整的任务分配流程 ===
                    console.log('开始完整的任务分配流程...');
                    
                    // 1. 获取当前订单的任务数据（优先从数据库获取）
                    let currentTasks = tasks; // 使用组件状态中的任务数据
                    let currentOrderId = dbOrderId || orderId;
                    
                    // 如果组件状态中没有任务数据，尝试从数据库获取
                    if (currentTasks.length === 0 && currentOrderId) {
                      try {
                        console.log('从数据库获取订单任务数据...');
                        const res = await fetch(`/api/orders?orderId=${currentOrderId}`);
                        const data = await res.json();
                        if (data.tasks && data.tasks.length > 0) {
                          currentTasks = data.tasks.map((task: any) => ({
                            ...task,
                            title: task.title_zh || task.title || '',
                            role: task.role_zh || task.role || '',
                            status: task.status || STATUS.NOT_STARTED,
                            id: task.id
                          }));
                          console.log('从数据库获取到任务数据:', currentTasks.length);
                        }
                      } catch (error) {
                        console.error('从数据库获取任务数据失败:', error);
                      }
                    }
                    
                    // 直接使用组件状态中的 teamData，确保数据一致性
                    const currentTeamMembers = teamData;
                    
                    console.log('当前数据状态:');
                    console.log('- 任务数量:', currentTasks.length);
                    console.log('- 订单ID:', currentOrderId);
                    console.log('- 成员数量 (来自组件状态):', currentTeamMembers.length);
                    console.log('- 成员数据示例 (来自组件状态):', currentTeamMembers.slice(0, 5).map(m => ({ id: m.id, name: m.name })));
                    
                    // 2. 验证数据完整性
                    if (currentTasks.length === 0) {
                      setModalMsg('没有找到任务数据，请重新进行任务分解');
                      setModalOpen(true);
                      return;
                    }
                    
                    if (currentTeamMembers.length === 0) {
                      setModalMsg('没有找到团队成员数据，请稍后重试');
                      setModalOpen(true);
                      return;
                    }
                    
                    // 3. 批量更新任务分配到数据库
                    console.log('批量分配任务到数据库...');
                    try {
                      const response = await fetch('/api/assign-tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                          assignments,
                          orderId: currentOrderId 
                        })
                      });
                      
                      if (!response.ok) {
                        throw new Error(`分配任务失败: ${response.status} ${response.statusText}`);
                      }
                      
                      const result = await response.json();
                      console.log('批量分配结果:', result);
                      
                      // 输出分配详情
                      assignments.forEach(({ taskId, memberId }) => {
                        const task = currentTasks.find((t: any) => t.id === taskId);
                        const member = currentTeamMembers.find((m: any) => String(m.id) === String(memberId));
                        if (task && member) {
                          console.log(`✅ 任务 "${task.title_zh || task.title}" 分配给 ${member.name} (ID: ${memberId})`);
                        }
                      });
                      
                    } catch (error) {
                      console.error('批量分配任务失败:', error);
                      setModalMsg(`分配失败: ${String(error)}`);
                      setModalOpen(true);
                      return;
                    }
                    
                    console.log(`任务分配完成: ${assignments.length} 个任务`);
                    
                    // 跳转到结果页面
                    router.push({
                      pathname: '/result',
                      query: {
                        orderId: currentOrderId
                      }
                    });
                  } catch (error) {
                    console.error('Assign tasks error:', error);
                    setModalMsg(`分配失败: ${String(error)}`);
                    setModalOpen(true);
                  }
                }}
              >
                {t.confirm}
              </button>
              <button
                className="btn"
                style={{ background: '#f1f5f9', color: '#222' }}
                onClick={() => {
                  // 清除所有状态，重新开始
                  setTasks([]);
                  setSelectedMembers({});
                  setAssignedTasks({});
                  setDbOrderId(null);
                  setOrderStatus(null);
                  setInput('');
                  setLoading(false);
                  setExpandedTasks({});
                  // 重新导航到任务规划页面
                  router.push('/task-planner');
                }}
              >
                {t.back}
              </button>
            </div>
          )}
        </div>
      </>
    );
  } else {
    // 新建界面内容（无任务数据时）
    mainContent = (
      <>
      <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>{t.title}</h1>
      <div className="mb-6 flex items-center gap-4">
        <span className="font-bold" style={{ color: '#fff' }}>{t.mode}</span>
        <label style={{ marginLeft: 12, color: '#fff' }}>
          <input type="radio" name="assignMode" value="fast" checked={assignMode === 'fast'} onChange={() => setAssignMode('fast')} />
          <span style={{ marginLeft: 4 }}>{t.fast}</span>
        </label>
        <label style={{ marginLeft: 12, color: '#fff' }}>
          <input type="radio" name="assignMode" value="balanced" checked={assignMode === 'balanced'} onChange={() => setAssignMode('balanced')} />
          <span style={{ marginLeft: 4 }}>{t.balanced}</span>
        </label>
        <label style={{ marginLeft: 12, color: '#fff' }}>
          <input type="radio" name="assignMode" value="slow" checked={assignMode === 'slow'} onChange={() => setAssignMode('slow')} />
          <span style={{ marginLeft: 4 }}>{t.slow}</span>
        </label>
      </div>
      <textarea
        className="w-full p-2 border rounded mb-4"
        rows={3}
        placeholder={t.inputPlaceholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button
        onClick={handleSubmit}
        className="btn"
        disabled={loading || !input}
      >
        {loading ? t.submitting : t.submit}
      </button>
      </>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        backgroundImage: 'url("/bg-task-planner.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 内容区 */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        color: '#1e293b',
        background: 'transparent',
        maxWidth: 640,
        margin: '0 auto',
        padding: 32,
      }}>
        <div className="max-w-2xl mx-auto mt-16 p-6" style={{ position: 'relative' }}>
          {/* 左上角语言切换 */}
          <div style={{ position: 'fixed', left: 24, top: 24, display: 'flex', gap: 12, zIndex: 3000 }}>
            <button
              style={{
                background: '#fff',
                color: '#1890ff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                padding: '6px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                zIndex: 3001,
                cursor: 'pointer',
                letterSpacing: 2
              }}
              onClick={() => router.push('/')}
            >{t.home}</button>
              <button
              style={{
                background: '#fff',
                color: '#1890ff',
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                fontWeight: 700,
                fontSize: 16,
                padding: '6px 18px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                zIndex: 3001,
                cursor: 'pointer',
                letterSpacing: 2
              }}
              onClick={() => setOrdersOpen(true)}
            >{t.myOrders}</button>

              </div>
          
          {/* 右上角语言切换 */}
          <div style={{ position: 'fixed', right: 24, top: 24, zIndex: 3000 }}>
            <button 
              className="btn" 
              onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            >
              {t.lang}
            </button>
            </div>

          {/* 所有弹窗组件保持不变 */}
          
          {/* 订单列表弹窗 */}
          {ordersOpen && (
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff', borderRadius: 12, minWidth: 600, maxWidth: 800, maxHeight: '80vh', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', position: 'relative'
              }}>
                {/* 右上角叉号关闭按钮 - 固定在弹窗右上角 */}
                <button
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    background: 'none',
                    border: 'none',
                    fontSize: 24,
                    color: '#888',
                    cursor: 'pointer',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background-color 0.2s',
                    zIndex: 10
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setOrdersOpen(false)}
                >
                  ×
                </button>
                
                {/* 弹窗内容区域 - 可滚动 */}
                <div style={{
                  padding: 32,
                  maxHeight: '80vh',
                  overflow: 'auto',
                  paddingTop: 32,
                  paddingRight: 64
                }}>
                  <div style={{fontWeight:700, fontSize:22, marginBottom:24}}>{t.myOrders}</div>
                {orders.length === 0 ? (
                  <div style={{color:'#888', textAlign:'center', padding:'40px 0'}}>{t.noOrder}</div>
                ) : (
                  <div style={{display:'grid', gap:16}}>
                    {orders
                      .sort((a, b) => {
                        // 按订单ID降序排序（新的在前）
                        const timeA = parseInt(a.id) || 0;
                        const timeB = parseInt(b.id) || 0;
                        return timeB - timeA;
                      })
                      .map((order) => (
                      <div key={order.id} style={{
                        border: '1px solid #e5e7eb', borderRadius: 8, padding: 16,
                        background: '#fff', transition: 'all 0.2s'
                      }} 
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
                          <div style={{fontWeight:600}}>{t.orderId}：{order.id}</div>
                          <div style={{
                            padding: '4px 12px', borderRadius: 6, fontSize: 14, fontWeight: 600,
                            color: '#fff', background: statusColorMap[order.status] || '#888'
                          }}>
                            {orderStatusI18n[lang][order.status as keyof typeof orderStatusI18n[typeof lang]] || order.status}
                          </div>
                        </div>
                        <div style={{color:'#666', fontSize:14, marginBottom:8}}>{t.time}：{new Date(parseInt(order.id)).toLocaleString()}</div>
                        <div style={{color:'#666', fontSize:14, marginBottom:12}}>{t.taskCount}：{order.task_count || 0}</div>
                        
                        {/* 操作按钮 */}
                        <div style={{display:'flex', gap:8}}>
                          <button
                            style={{
                              background: '#1890ff',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 14,
                              cursor: 'pointer',
                              flex: 1
                            }}
                            onClick={async () => {
                            setOrdersOpen(false);
                              const res = await fetch(`/api/orders?orderId=${order.id}`);
                              const data = await res.json();
                              const status = data.order?.status;
                              const tasks = data.tasks || [];
                              // 判断所有任务都还未分配成员
                              const allUnassigned = tasks.length > 0 && tasks.every(task => !task.assigned_member_id);
                              if (status === '未开始' || status === 'Not Started' || allUnassigned) {
                                router.push({ pathname: '/task-planner', query: { orderId: order.id } });
                              } else {
                                router.push({ pathname: '/result', query: { orderId: order.id } });
                              }
                            }}
                          >
                            {t.viewDetails}
                          </button>
                          <button
                          style={{
                              background: '#e11d48',
                              color: '#fff',
                              border: 'none',
                              borderRadius: 6,
                              padding: '6px 12px',
                              fontSize: 14,
                              cursor: 'pointer'
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteOrderId(order.id);
                            }}
                          >
                            {t.delete}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                </div>
              </div>
            </div>
          )}

          {/* 删除确认弹窗 */}
          {deleteOrderId && (
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
              }}>
                <div style={{fontWeight:700, fontSize:22, marginBottom:18, paddingRight: 48}}>{t.deleteConfirm}</div>
                <div style={{display:'flex', justifyContent:'center', gap:24}}>
                  <button style={{
                    background:'#e11d48',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'
                  }} onClick={() => handleDeleteOrder(deleteOrderId)}>{t.delete}</button>
                  <button style={{
                    background:'#f1f5f9',color:'#222',border:'none',borderRadius:8,fontWeight:600,fontSize:16,padding:'8px 28px',cursor:'pointer'
                  }} onClick={() => setDeleteOrderId(null)}>{t.close}</button>
                </div>
              </div>
            </div>
          )}

          {/* 成员详情弹窗 */}
          {selectedMember && popupPos && (
            <div 
              style={{
                position: 'fixed',
                left: popupPos.x,
                top: popupPos.y,
                zIndex: 5000,
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                padding: 16,
                minWidth: 240,
                maxWidth: 280
              }}
            >
              {/* 成员名称 */}
            <div style={{
                fontWeight: 600,
                fontSize: 16,
                marginBottom: 12,
                color: '#1e293b'
              }}>
                {lang === 'zh' ? selectedMember.name : (selectedMember.name_en || selectedMember.name)}
              </div>
              
              {/* 成员信息 */}
              <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.5 }}>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '角色：' : 'Role: '}</span>
                  {lang === 'zh' 
                    ? selectedMember.roles.join(', ')
                    : selectedMember.roles.map((role: string) => {
                        // 角色名称的英文映射
                        const roleEnMap: { [key: string]: string } = {
                          '前端工程师': 'Frontend Engineer',
                          '后端工程师': 'Backend Engineer',
                          'UI设计师': 'UI Designer',
                          'UX设计师': 'UX Designer',
                          '测试工程师': 'Test Engineer',
                          '数据库工程师': 'Database Engineer',
                          '产品经理': 'Product Manager',
                          'DevOps工程师': 'DevOps Engineer',
                          '全栈工程师': 'Full Stack Engineer',
                          '杂项专员': 'Generalist'
                        };
                        return roleEnMap[role] || role;
                      }).join(', ')
                  }
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '时薪：' : 'Rate: '}</span>
                  {selectedMember.hourly_rate} {lang === 'zh' ? '元' : 'CNY'}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '速度：' : 'Speed: '}</span>
                  {selectedMember.speed_factor}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '经验：' : 'Exp: '}</span>
                  {selectedMember.experience_score}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '可用：' : 'Available: '}</span>
                  {selectedMember.available_hours.join(', ')} {lang === 'zh' ? '小时' : 'h'}
                </div>
              </div>
              
              {/* 选择按钮 */}
              <button
                style={{
                  background: '#1890ff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '8px 16px',
                  fontSize: 14,
                  cursor: 'pointer',
                  width: '100%',
                  fontWeight: 600,
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#40a9ff'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1890ff'}
                onClick={() => {
                  if (popupTaskIdx !== null) {
                    setSelectedMembers(prev => ({ ...prev, [popupTaskIdx]: selectedMember.id }));
                  }
                  setSelectedMember(null);
                  setPopupPos(null);
                  setPopupTaskIdx(null);
                }}
              >
                {lang === 'zh' ? '选择该成员' : 'Select Member'}
              </button>
              
              {/* 关闭按钮 */}
              <button
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  background: 'none',
                  border: 'none',
                  fontSize: 18,
                  color: '#94a3b8',
                  cursor: 'pointer',
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => {
                  setSelectedMember(null);
                  setPopupPos(null);
                  setPopupTaskIdx(null);
                }}
              >
                ×
              </button>
            </div>
          )}

          {/* 确认弹窗 */}
          {modalOpen && (
            <div style={{
              position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
              background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{
                background: '#fff', borderRadius: 12, minWidth: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative', textAlign: 'center'
              }}>
                <div style={{fontWeight:700, fontSize:22, marginBottom:18, paddingRight: 48}}>{modalMsg}</div>
                <div style={{display:'flex', justifyContent:'center', gap:24}}>
                  <button style={{
                    background:'#1890ff',color:'#fff',border:'none',borderRadius:8,fontWeight:700,fontSize:16,padding:'8px 28px',cursor:'pointer'
                  }} onClick={() => setModalOpen(false)}>{t.confirm}</button>
                </div>
              </div>
            </div>
          )}
          
          {mainContent}
        </div>
      </div>
    </div>
  );
}