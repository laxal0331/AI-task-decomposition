import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { roleMap } from '../lib/teamData';
import { smartMatchDevelopersForTask, SmartMatchResult, globalFastestAssignment } from '../lib/smartMatch';

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
      mode: 'Assignment Mode:',
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
      
      // 使用数据库返回的任务数据
      const tasksWithId = data.tasks.map((task: any, idx: number) => ({ 
        ...task, 
        title: task.title_zh || task.title || '',
        role: task.role_zh || task.role || '',
        status: STATUS.NOT_STARTED, 
        id: task.id  // 直接使用数据库返回的ID，不重新生成
      }));
      setTasks(tasksWithId.map(normalizeTaskStatus));
      setSelectedMembers({});
      // 重置已分配任务状态，确保重新拆解时有完整的成员选择
      setAssignedTasks({});
      setDbOrderId(data.orderId);
      // 统一使用API返回的成员数据，确保数据一致性
      if (data.members) {
        setTeamData(data.members);
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

  // 自动分配成员：分配模式切换时自动选择推荐列表第一个成员
  useEffect(() => {
    setSelectedMembers({});
    if (tasks.length === 0) return;
    let autoSelected: { [taskIdx: number]: string } = {};
    if (assignMode === 'fast') {
      // 越快越好分配逻辑：优先让不同任务分配给不同的人并行开发，只有同一人更快时才分配给同一人
      const usedMemberIds = new Set<string>();
      tasks.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师'
        ];
        const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
        const matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamData,
          assignedTasks,
          assignMode
        ).filter(r => r.canAssign);
        // 优先分配给未被选中的成员中速度最快的
        let best: string | null = null;
        let maxSpeed = -Infinity;
        let foundUnassigned = false;
        matchResults.forEach(r => {
          if (!usedMemberIds.has(r.member.id) && r.member.speed_factor > maxSpeed) {
            maxSpeed = r.member.speed_factor;
            best = r.member.id;
            foundUnassigned = true;
          }
        });
        // 如果所有成员都已分配过，则在所有可分配成员中选速度最快的
        if (!foundUnassigned) {
          matchResults.forEach(r => {
            if (r.member.speed_factor > maxSpeed) {
              maxSpeed = r.member.speed_factor;
              best = r.member.id;
            }
          });
        }
        if (best) {
          autoSelected[i] = best;
          usedMemberIds.add(best);
        }
      });
    } else if (assignMode === 'balanced') {
      // 均衡分配逻辑：优先选择完成时间和价格都接近中位数的成员
      tasks.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师'
        ];
        const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
        const matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamData,
          assignedTasks,
          assignMode
        ).filter(r => r.canAssign);
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
        }
      });
    } else {
      tasks.forEach((task, i) => {
        const mainstreamRoles = [
          '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
          '产品经理', 'DevOps工程师', '全栈工程师'
        ];
        const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
        const matchResults = smartMatchDevelopersForTask(
          { ...task, role: mappedRole },
          teamData,
          assignedTasks,
          assignMode
        );
        const match = matchResults.find(r => r.canAssign);
        if (match) autoSelected[i] = match.member.id;
      });
    }
    setSelectedMembers(autoSelected);
  }, [assignMode, tasks]);

  useEffect(() => {
    if (ordersOpen) {
      fetchOrders();
    }
  }, [ordersOpen]);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== orderId));
        setDeleteOrderId(null);
      }
    } catch (error) {
      console.error('Delete order error:', error);
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
    
    // 计算总工时
    const totalHours = tasks.reduce((sum, task) => sum + task.estimated_hours, 0);
    
    // 假设每天工作8小时，每周工作5天
    const hoursPerDay = 8;
    const daysPerWeek = 5;
    const hoursPerWeek = hoursPerDay * daysPerWeek; // 40小时/周
    
    // 计算需要的周数
    const weeksNeeded = Math.ceil(totalHours / hoursPerWeek);
    
    // 计算天数
    const daysNeeded = Math.ceil(totalHours / hoursPerDay);
    
    return {
      totalHours,
      weeksNeeded,
      daysNeeded,
      hoursPerDay,
      hoursPerWeek
    };
  };

  // 拉取团队成员数据
  useEffect(() => {
    async function fetchMembers() {
      const res = await fetch('/api/members');
      const data = await res.json();
      setTeamData(data.members || []);
    }
    fetchMembers();
  }, []);

  // 新增：拉取订单详情时初始化 input 和 assignMode
  useEffect(() => {
    if (orderId) {
      (async () => {
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
        // 重置已分配任务状态，确保从"我的订单"进入时显示完整的成员选择
        setAssignedTasks({});
        setSelectedMembers({});
        // 统一使用API返回的成员数据，确保数据一致性
        if (data.members) {
          setTeamData(data.members);
        } else {
          // 如果没有返回成员数据，单独获取
          const membersRes = await fetch('/api/members');
          const membersData = await membersRes.json();
          if (membersData.members) {
            setTeamData(membersData.members);
          }
        }
      })();
    }
  }, [orderId]);

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
  
  if (currentOrderId && orderStatus === '未开始' && tasks.length === 0) {
    // 新建界面内容（分配模式+输入框）- 只有在没有任务数据时才显示
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
              '产品经理', 'DevOps工程师', '全栈工程师'
            ];
            const mappedRole = mainstreamRoles.includes(task.role) ? (roleMap[task.role] || task.role) : '杂项专员';
            let matchResults: SmartMatchResult[] = [];
            if (assignMode === 'fast') {
              matchResults = smartMatchDevelopersForTask(
                { ...task, role: mappedRole },
                teamData,
                assignedTasks,
                assignMode
              );
            } else if (assignMode === 'balanced') {
              matchResults = smartMatchDevelopersForTask(
                { ...task, role: mappedRole },
                teamData,
                assignedTasks,
                assignMode
              );
            } else {
              matchResults = smartMatchDevelopersForTask(
                { ...task, role: mappedRole },
                teamData,
                assignedTasks,
                assignMode
              );
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
            if (canAssign.length === 0 && matchResults.length > 0) {
              // 没有完全符合的人，强制推荐2-3个最接近的（但只推荐 canAssign 为 true 的成员）
              showDevs = matchResults.filter(r => r.canAssign).slice(0, 3);
              moreDevs = matchResults.filter(r => !showDevs.includes(r));
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
                            onClick={e => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              setSelectedMember(member);
                              setPopupPos({ x: rect.right + window.scrollX + 8, y: rect.top + window.scrollY });
                              setPopupTaskIdx(i);
                              setSelectedMembers(prev => ({ ...prev, [i]: member.id }));
                            }}
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
                            onClick={e => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              setSelectedMember(member);
                              setPopupPos({ x: rect.right + window.scrollX + 8, y: rect.top + window.scrollY });
                              setPopupTaskIdx(i);
                              setSelectedMembers(prev => ({ ...prev, [i]: member.id }));
                            }}
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
                            onClick={e => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              setSelectedMember(member);
                              setPopupPos({ x: rect.right + window.scrollX + 8, y: rect.top + window.scrollY });
                              setPopupTaskIdx(i);
                              setSelectedMembers(prev => ({ ...prev, [i]: member.id }));
                            }}
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
                            onClick={e => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              setSelectedMember(member);
                              setPopupPos({ x: rect.right + window.scrollX + 8, y: rect.top + window.scrollY });
                              setPopupPos({ x: rect.right + window.scrollX + 8, y: rect.top + window.scrollY });
                              setPopupTaskIdx(i);
                              setSelectedMembers(prev => ({ ...prev, [i]: member.id }));
                            }}
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
                            onClick={e => {
                              const rect = (e.target as HTMLElement).getBoundingClientRect();
                              setSelectedMember(member);
                              setPopupPos({ x: rect.right + window.scrollX + 8, y: rect.top + window.scrollY });
                              setPopupTaskIdx(i);
                              setSelectedMembers(prev => ({ ...prev, [i]: member.id }));
                            }}
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
          
          {/* 预计完成时间显示 */}
          {tasks.length > 0 && (() => {
            const completionInfo = calculateEstimatedCompletionTime();
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
                      {completionInfo.totalHours} {lang === 'zh' ? '小时' : 'h'}
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
                    const assignments = Object.entries(selectedMembers).map(([taskIdx, memberId]) => ({
                      taskId: tasks[parseInt(taskIdx)].id,
                      memberId
                    }));
                    const res = await fetch('/api/assign-tasks', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        assignments,
                        orderId: dbOrderId
                      })
                    });
                    const data = await res.json();
                    if (data.error) {
                      throw new Error(data.error);
                    }
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
                    {orders.map((order) => (
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
            <div style={{
              position: 'fixed', left: popupPos.x, top: popupPos.y, zIndex: 5000,
              background: '#fff', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', padding: 16, minWidth: 200
            }}>
              <div style={{fontWeight:600, marginBottom:8}}>{selectedMember.name}</div>
              <div style={{fontSize:14, color:'#666', marginBottom:4}}>{lang === 'zh' ? '角色：' : 'Role: '}{selectedMember.roles.join(', ')}</div>
              <div style={{fontSize:14, color:'#666', marginBottom:4}}>{lang === 'zh' ? '时薪：' : 'Hourly Rate: '}{selectedMember.hourly_rate} {lang === 'zh' ? '元' : 'CNY'}</div>
              <div style={{fontSize:14, color:'#666', marginBottom:4}}>{lang === 'zh' ? '速度倍率：' : 'Speed Factor: '}{selectedMember.speed_factor}</div>
              <div style={{fontSize:14, color:'#666'}}>{lang === 'zh' ? '经验分数：' : 'Experience: '}{selectedMember.experience_score}</div>
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
