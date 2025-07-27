import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { roleMap } from '../lib/teamData';
import { smartMatchDevelopersForTask, SmartMatchResult, globalFastestAssignment } from '../lib/smartMatch';
import { translateSkills, translateRoles } from '../lib/teamData';

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

export default function TaskPlanner() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expandedTasks, setExpandedTasks] = useState<{[key: number]: string | null}>({});
  const [selectedMembers, setSelectedMembers] = useState<{[taskIdx: number]: string | null}>({});
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [popupPos, setPopupPos] = useState<{x: number, y: number} | null>(null);
  const [popupTaskIdx, setPopupTaskIdx] = useState<number | null>(null);
  
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
  const [teamData, setTeamData] = useState<any[]>([]);
  const { orderId } = router.query;
  const [orderStatus, setOrderStatus] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (input.trim().length < 6) {
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
      const data = await res.json();
      
      if (data.error) {
        throw new Error(data.error);
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
        const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const existingTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
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
        localStorage.setItem('orders', JSON.stringify(existingOrders));
        localStorage.setItem('tasks', JSON.stringify(existingTasks));
        
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
      setTasks(tasksWithId.map(normalizeTaskStatus));
      setSelectedMembers({});
      // 重置已分配任务状态，确保重新拆解时有完整的成员选择
      setAssignedTasks({});
      setDbOrderId(data.orderId);
      console.log('设置的dbOrderId:', data.orderId);
      // 统一使用API返回的成员数据，确保数据一致性
      if (data.members) {
        setTeamData(data.members);
      }
      
      // 任务分解成功后，如果订单面板打开，刷新订单列表
      if (ordersOpen) {
        setTimeout(() => {
          fetchOrders();
        }, 500); // 延迟500ms确保数据已保存
      }
    } catch (error) {
      console.error('Submit error:', error);
      setModalMsg(`提交失败: ${String(error)}`);
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

  // 自动分配成员：分配模式、任务、团队成员变化时自动选择推荐列表第一个成员
  useEffect(() => {
    // 只有数据都准备好才自动分配
    if (!tasks.length || !teamData.length) return;
    let autoSelected: { [taskIdx: number]: string } = {};
    if (assignMode === 'fast') {
      const usedMemberIds = new Set<string>();
      tasks.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师', '前端开发工程师', '后端开发工程师', 'UI/UX设计师'
        ];
        const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
        const matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamData,
          assignedTasks,
          assignMode
        ).filter(r => r.canAssign);
        
        console.log(`最快模式 - 任务 ${i} (${task.title}) 匹配结果:`, matchResults.map(r => ({
          name: r.member.name,
          speed_factor: r.member.speed_factor,
          hourly_rate: r.member.hourly_rate,
          effectiveHours: r.effectiveHours
        })));
        
        let best: string | null = null;
        let maxSpeed = -Infinity;
        
        // 最快模式：优先选择未分配的成员中速度最快的
        // 这样可以实现真正的并行工作
        matchResults.forEach(r => {
          if (!usedMemberIds.has(r.member.id) && r.member.speed_factor > maxSpeed) {
            maxSpeed = r.member.speed_factor;
            best = r.member.id;
          }
        });
        
        // 如果所有匹配的成员都已分配，选择速度最快的
        if (!best) {
          matchResults.forEach(r => {
            if (r.member.speed_factor > maxSpeed) {
              maxSpeed = r.member.speed_factor;
              best = r.member.id;
            }
          });
        }
        
        if (best) {
          const selectedMember = teamData.find(m => m.id === best);
          console.log(`最快模式 - 任务 ${i} 选择成员: ${selectedMember?.name} (速度: ${selectedMember?.speed_factor})`);
          autoSelected[i] = best;
          usedMemberIds.add(best);
        }
      });
    } else if (assignMode === 'balanced') {
      tasks.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师', '前端开发工程师', '后端开发工程师', 'UI/UX设计师'
        ];
        const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
        const matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamData,
          assignedTasks,
          assignMode
        ).filter(r => r.canAssign);
        const rates = matchResults.map(r => r.member.hourly_rate).sort((a, b) => a - b);
        const speeds = matchResults.map(r => r.member.speed_factor).sort((a, b) => a - b);
        const median = (arr: number[]) => arr.length % 2 === 0 ? (arr[arr.length/2-1] + arr[arr.length/2])/2 : arr[Math.floor(arr.length/2)];
        const medianRate = median(rates);
        const medianSpeed = median(speeds);
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
        }
      });
    } else {
      tasks.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师', '前端开发工程师', '后端开发工程师', 'UI/UX设计师'
        ];
        const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
        const matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamData,
          assignedTasks,
          assignMode
        ).filter(r => r.canAssign);
        
        console.log(`最便宜模式 - 任务 ${i} (${task.title}) 匹配结果:`, matchResults.map(r => ({
          name: r.member.name,
          speed_factor: r.member.speed_factor,
          hourly_rate: r.member.hourly_rate,
          effectiveHours: r.effectiveHours
        })));
        
        // 最便宜模式：选择时薪最低的成员
        let best: string | null = null;
        let minRate = Infinity;
        
        matchResults.forEach(r => {
          if (r.member.hourly_rate < minRate) {
            minRate = r.member.hourly_rate;
            best = r.member.id;
          }
        });
        
        if (best) {
          const selectedMember = teamData.find(m => m.id === best);
          console.log(`最便宜模式 - 任务 ${i} 选择成员: ${selectedMember?.name} (时薪: ¥${selectedMember?.hourly_rate})`);
          autoSelected[i] = best;
        }
      });
    }
    setSelectedMembers(autoSelected);
  }, [assignMode, tasks, teamData]);

  useEffect(() => {
    if (ordersOpen) {
      fetchOrders();
    }
  }, [ordersOpen]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      
      if (data.orders && data.orders.length > 0) {
        // 按时间降序排序（最新的在前）
        const sortedOrders = data.orders.sort((a: any, b: any) => {
          const timeA = parseInt(a.id) || 0;
          const timeB = parseInt(b.id) || 0;
          return timeB - timeA;
        });
        setOrders(sortedOrders);
      } else {
        // API返回空数据，尝试从localStorage读取
        console.log('API返回空订单，尝试从localStorage读取...');
        tryLoadOrdersFromLocalStorage();
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      // API调用失败，尝试从localStorage读取
      console.log('API调用失败，尝试从localStorage读取订单...');
      tryLoadOrdersFromLocalStorage();
    }
  };

  // 从localStorage读取订单的备用方法
  const tryLoadOrdersFromLocalStorage = () => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      console.log('从localStorage读取到订单数量:', savedOrders.length);
      
      if (savedOrders.length > 0) {
        // 按时间降序排序（最新的在前）
        const sortedOrders = savedOrders.sort((a: any, b: any) => {
          const timeA = parseInt(a.id) || 0;
          const timeB = parseInt(b.id) || 0;
          return timeB - timeA;
        });
        setOrders(sortedOrders);
      }
    } catch (error) {
      console.error('从localStorage读取订单失败:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      console.log('=== 删除订单 ===');
      console.log('删除订单ID:', orderId);
      
      // 1. 删除localStorage中的订单和相关任务
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
      
      // 过滤掉要删除的订单
      const filteredOrders = savedOrders.filter((o: any) => o.id !== orderId);
      // 过滤掉该订单的所有任务
      const filteredTasks = savedTasks.filter((t: any) => t.order_id !== orderId);
      
      // 保存更新后的数据
      localStorage.setItem('orders', JSON.stringify(filteredOrders));
      localStorage.setItem('tasks', JSON.stringify(filteredTasks));
      
      console.log(`✅ 本地数据删除完成`);
      console.log(`- 剩余订单: ${filteredOrders.length}`);
      console.log(`- 剩余任务: ${filteredTasks.length}`);
      
      // 2. 更新UI状态（确保排序）
      const sortedOrders = filteredOrders.sort((a: any, b: any) => {
        const timeA = parseInt(a.id) || 0;
        const timeB = parseInt(b.id) || 0;
        return timeB - timeA;
      });
      setOrders(sortedOrders);
      setDeleteOrderId(null);
      
      // 3. 尝试同步到服务器（不阻塞）
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
          console.log('✅ 服务器删除成功');
        } else {
          console.log('⚠️ 服务器删除失败，但本地数据已删除');
      }
      } catch (syncError) {
        console.log('⚠️ 服务器删除出错，但本地数据已删除:', syncError);
      }
      
    } catch (error) {
      console.error('删除订单失败:', error);
      setModalMsg(`删除失败: ${String(error)}`);
      setModalOpen(true);
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
        } else {
          // API返回空数据，尝试从localStorage获取
          console.log('API返回空成员数据，尝试从localStorage获取...');
          const savedMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
          console.log('localStorage中成员数量:', savedMembers.length);
          
          if (savedMembers.length > 0) {
            setTeamData(savedMembers);
            console.log('成功从localStorage加载成员数据');
          }
        }
      } catch (error) {
        console.error('获取团队成员失败:', error);
        // API调用失败，尝试从localStorage获取
        const savedMembers = JSON.parse(localStorage.getItem('teamMembers') || '[]');
        if (savedMembers.length > 0) {
          setTeamData(savedMembers);
          console.log('API失败，从localStorage加载成员数据:', savedMembers.length);
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
        const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
        const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        
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
          // 不再 setSelectedMembers，这部分交给自动分配 useEffect
          // 不再 setAssignedTasks，这部分交给自动分配 useEffect
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
          // 不再 setAssignedTasks，不再 setSelectedMembers
          if (data.members) {
            setTeamData(data.members);
          } else {
            const membersRes = await fetch('/api/members');
            const membersData = await membersRes.json();
            if (membersData.members) {
              setTeamData(membersData.members);
            }
          }
        }
        // 如果从localStorage加载了数据，也需要获取团队成员数据
        if (targetOrder && targetTasks.length > 0) {
          const membersRes = await fetch('/api/members');
          const membersData = await membersRes.json();
          if (membersData.members) {
            setTeamData(membersData.members);
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
          Object.keys(newAssigned).forEach(memberId => {
            newAssigned[memberId] = newAssigned[memberId].filter((taskIdx: number) => taskIdx !== taskIndex);
          });
          return newAssigned;
        });
        
        console.log(`任务 ${reassignTask} 已重置分配状态`);
      }
    }
  }, [router.query.reassignTask, orderId, tasks]);

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
  
  if (currentOrderId && tasks.length === 0 && !orderId) {
    // 新建界面内容（分配模式+输入框）- 只有在没有任务数据且没有orderId时才显示
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
  } else if (currentOrderId && tasks.length > 0) {
    // 任务分配界面内容
    mainContent = (
      <>
        <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>{t.title}</h1>
        
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
            if (selectedId) {
              const idx = canAssign.findIndex(r => r.member.id === selectedId);
              if (idx > 0) {
                const [sel] = canAssign.splice(idx, 1);
                canAssign.unshift(sel);
              }
            }
            // 推荐成员筛选逻辑，优先未被选成员，已选成员排后但不消失，最多12人且不重复
            const selectedMemberIds = Object.values(selectedMembers).filter(Boolean);
            let showDevs: SmartMatchResult[] = [];
            let moreDevs: SmartMatchResult[] = [];
            const maxShow = 12;
            if (canAssign.length === 0) {
              // 没有完全符合的人，强制推荐最接近的成员（包括时间不足的）
              if (matchResults.length > 0) {
                showDevs = matchResults.slice(0, 3); // 不再只限制canAssign为true的成员
              moreDevs = matchResults.filter(r => !showDevs.includes(r));
              } else {
                // 如果完全没有匹配结果，随机推荐一些杂项专员
                const miscMembers = teamData.filter(m => m.roles.includes('杂项专员')).slice(0, 3);
                showDevs = miscMembers.map(member => ({
                  member,
                  canAssign: false,
                  nextAvailableWeek: -1,
                  totalAvailable: 0,
                  effectiveHours: task.estimated_hours
                }));
                moreDevs = [];
              }
            } else {
              const minPrice = Math.min(...canAssign.map(r => r.member.hourly_rate));
              const unselected = canAssign.filter(r => !selectedMemberIds.includes(r.member.id));
              const selected = canAssign.filter(r => selectedMemberIds.includes(r.member.id));
              showDevs = [
                ...unselected.filter(r => r.member.hourly_rate === minPrice),
                ...selected.filter(r => r.member.hourly_rate === minPrice && !showDevs?.some(x => x.member.id === r.member.id))
              ];
              selected.forEach(sel => {
                if (!showDevs.find(r => r.member.id === sel.member.id)) {
                  showDevs.unshift(sel);
                } else {
                  showDevs = [sel, ...showDevs.filter(r => r.member.id !== sel.member.id)];
                }
              });
              showDevs = showDevs.slice(0, maxShow);
              moreDevs = matchResults.filter(r => !showDevs.includes(r));
            }
            // 生成 moreDevs 后，确保所有已选成员都在 moreDevs 里
            const allSelected = canAssign.filter(r => selectedMemberIds.includes(r.member.id));
            allSelected.forEach(sel => {
              if (!moreDevs.find(r => r.member.id === sel.member.id)) {
                moreDevs.unshift(sel);
              }
            });
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
                        const isSelected = selectedId === member.id;
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
                      
                      // 如果没有手动选择，则自动选择
                      if (!memberId) {
                        console.log(`任务 ${i} 未选择开发者，自动选择...`);
                        const taskRecommendations = smartMatchDevelopersForTask(task, teamData, {}, 'fast');
                        if (taskRecommendations.length > 0) {
                          memberId = taskRecommendations[0].member.id;
                          console.log(`✅ 自动选择任务 ${i} 的开发者: ${taskRecommendations[0].member.name} (ID: ${memberId})`);
                        } else {
                          // 如果还是没有，选择第一个团队成员
                          if (teamData.length > 0) {
                            memberId = teamData[0].id;
                            console.log(`⚠️ 使用默认开发者: ${teamData[0].name} (ID: ${memberId})`);
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
                    
                    // 1. 读取当前数据
                    const savedTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                    const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
                    // 直接使用组件状态中的 teamData，确保数据一致性
                    const currentTeamMembers = teamData;
                    
                    console.log('当前数据状态:');
                    console.log('- 任务数量:', savedTasks.length);
                    console.log('- 订单数量:', savedOrders.length);
                    console.log('- 成员数量 (来自组件状态):', currentTeamMembers.length);
                    console.log('- 成员数据示例 (来自组件状态):', currentTeamMembers.slice(0, 5).map(m => ({ id: m.id, name: m.name })));
                    
                    // 2. 验证数据完整性
                    if (savedTasks.length === 0) {
                      throw new Error('没有找到任务数据，请重新进行任务分解');
                    }
                    
                    if (currentTeamMembers.length === 0) {
                      throw new Error('没有找到团队成员数据');
                    }
                    
                    // 3. 更新任务分配
                    let assignedCount = 0;
                    assignments.forEach(({ taskId, memberId }) => {
                      const taskIndex = savedTasks.findIndex((t: any) => t.id === taskId);
                      const member = currentTeamMembers.find((m: any) => String(m.id) === String(memberId));
                      
                      console.log(`分配任务 ${taskId} 给成员 ${memberId}:`);
                      console.log('- 任务索引:', taskIndex);
                      console.log('- 找到成员:', member ? member.name : '未找到');
                      
                      if (taskIndex !== -1 && member) {
                        const originalTask = savedTasks[taskIndex];
                        
                        // 调试任务名称问题
                        console.log(`原始任务数据 (ID: ${originalTask.id}):`, { 
                          title: originalTask.title, 
                          title_zh: originalTask.title_zh,
                          name_zh: originalTask.name_zh,
                          name: originalTask.name
                        });
                        
                        savedTasks[taskIndex] = {
                          ...originalTask,
                          assigned_member_id: memberId,
                          status: 'PENDING', // 等待接受
                          assigned_at: new Date().toISOString(),
                          assigned_member_name: member.name
                        };
                        assignedCount++;
                        console.log(`✅ 任务 "${originalTask.name_zh || originalTask.title_zh || originalTask.title}" 分配给 ${member.name} (ID: ${memberId})`);
                        console.log(`✅ 更新后任务数据:`, savedTasks[taskIndex]);
                      } else {
                        console.log(`❌ 分配失败 - 任务ID: ${taskId}, 成员ID: ${memberId}`);
                        console.log(`❌ 任务索引: ${taskIndex}, 成员: ${member ? '找到' : '未找到'}`);
                      }
                    });
                    
                    console.log(`任务分配完成: ${assignedCount}/${assignments.length}`);
                    
                    // 4. 更新订单状态
                    const orderIndex = savedOrders.findIndex((o: any) => o.id === dbOrderId);
                    if (orderIndex !== -1) {
                      savedOrders[orderIndex] = {
                        ...savedOrders[orderIndex],
                        status: '进行中',
                        assigned_at: new Date().toISOString(),
                        total_assigned_tasks: assignedCount
                      };
                      console.log(`✅ 订单 ${dbOrderId} 状态更新为"进行中"`);
                    } else {
                      console.log(`❌ 未找到订单 ${dbOrderId}`);
                    }
                    
                    // 5. 保存所有数据
                    localStorage.setItem('tasks', JSON.stringify(savedTasks));
                    localStorage.setItem('orders', JSON.stringify(savedOrders));
                    
                    // 6. 验证保存结果
                    const verifyTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
                    const assignedTasks = verifyTasks.filter((t: any) => t.assigned_member_id);
                    console.log(`✅ 验证结果: ${assignedTasks.length} 个任务已分配成员`);
                    
                    // 详细验证每个分配的任务
                    assignedTasks.forEach((task: any, index: number) => {
                      console.log(`验证任务 ${index + 1}:`, {
                        id: task.id,
                        name: task.name_zh || task.title_zh || task.title,
                        assigned_member_id: task.assigned_member_id,
                        assigned_member_name: task.assigned_member_name,
                        status: task.status
                      });
                    });
                    
                    // 额外验证：检查所有任务的数据完整性
                    console.log('=== 任务数据完整性检查 ===');
                    savedTasks.forEach((task: any, index: number) => {
                      console.log(`任务 ${index + 1} 数据:`, {
                        id: task.id,
                        title: task.title,
                        title_zh: task.title_zh,
                        name_zh: task.name_zh,
                        assigned_member_id: task.assigned_member_id,
                        status: task.status
                      });
                    });
                    
                                        // 7. 同步数据到服务器（确保API能访问到数据）
                    try {
                      console.log('=== 开始数据同步 ===');
                      console.log('同步的订单数量:', savedOrders.length);
                      console.log('同步的任务数量:', savedTasks.length);
                      console.log('同步的分配数量:', assignments.length);
                      
                      // 先同步订单和任务数据
                      const syncDataRes = await fetch('/api/orders', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          clientOrders: savedOrders,
                          clientTasks: savedTasks
                        })
                      });
                      
                      if (syncDataRes.ok) {
                        console.log('✅ 订单和任务数据同步成功');
                        
                        // 等待一下确保数据已保存
                        await new Promise(resolve => setTimeout(resolve, 500));
                        
                        // 然后同步任务分配
                        const syncAssignRes = await fetch('/api/assign-tasks', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            assignments,
                            orderId: dbOrderId
                          })
                        });
                        
                        if (syncAssignRes.ok) {
                          console.log('✅ 任务分配同步成功');
                        } else {
                          console.log('⚠️ 任务分配同步失败，但本地数据已保存');
                        }
                      } else {
                        console.log('⚠️ 数据同步失败，但本地数据已保存');
                      }
                    } catch (syncError) {
                      console.log('⚠️ 服务器同步出错，但本地数据已保存:', syncError);
                    }
                    
                    // 跳转到结果页面
                  router.push({
                    pathname: '/result',
                    query: {
                      orderId: dbOrderId
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
    // 新建界面内容（无 orderId）
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
                              if (status === '未开始' || status === 'Not Started') {
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
                  {translateRoles(selectedMember.roles, lang).join(', ')}
                </div>
                <div style={{ marginBottom: 6 }}>
                  <span style={{ fontWeight: 500 }}>{lang === 'zh' ? '技能：' : 'Skills: '}</span>
                  {translateSkills(selectedMember.skills, lang).join(', ')}
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
