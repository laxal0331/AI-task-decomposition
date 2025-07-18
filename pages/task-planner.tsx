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
    recommend: '推荐成员：',
    none: '暂无合适成员',
    more: '更多',
    insufficient: '时长不足者',
    moreLabel: '更多：价格过高或速度过慢',
    tooExpensive: '价格过高：',
    tooSlow: '速度过慢：',
    notEnough: '时长不足：',
    no: '无',
    select: '点击选择该成员',
    detail: '点击查看成员详情',
    detailInsufficient: '该成员时长不足，仅供参考',
    totalCost: '总成本：',
    totalTime: '总耗时：',
    confirm: '确认分配',
    confirmTip: '请为每个任务选择成员，缺人无法分配！',
    toResult: '分配结果',
    lang: 'English',
    modalInputTip: '请输入完整的项目目标，例如：开发一个购物小程序',
    modalConfirmTip: '请为每个任务选择成员，缺人无法分配！',
    myOrders: '我的订单',
    noOrder: '暂无订单',
    orderId: '订单号',
    time: '时间',
    status: '状态',
    taskCount: '任务数',
    delete: '删除',
    close: '关闭',
    deleteConfirm: '确认删除该订单？',
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
    recommend: 'Recommended Members:',
    none: 'No suitable member',
    more: 'More',
    insufficient: 'Insufficient Hours',
    moreLabel: 'More: Too expensive or too slow',
    tooExpensive: 'Too expensive:',
    tooSlow: 'Too slow:',
    notEnough: 'Insufficient:',
    no: 'None',
    select: 'Click to select this member',
    detail: 'Click to view member details',
    detailInsufficient: 'Insufficient hours, for reference only',
    totalCost: 'Total Cost:',
    totalTime: 'Total Duration:',
    confirm: 'Confirm Assignment',
    confirmTip: 'Please select a member for each task!',
    toResult: 'Assignment Result',
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
  }
};

const orderStatusI18n = {
  zh: {
    IN_PROGRESS: '进行中',
    COMPLETED: '已完成',
    CANCELLED: '已取消',
    // 兼容老数据
    '进行中': '进行中',
    '已完成': '已完成',
    '已取消': '已取消',
  },
  en: {
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    // 兼容老数据
    '进行中': 'In Progress',
    '已完成': 'Completed',
    '已取消': 'Cancelled',
  }
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
        body: JSON.stringify({ goal: input, assignMode }),
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
      setDbOrderId(data.orderId);
      if (data.members) setTeamData(data.members);
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

  // 拉取团队成员数据
  useEffect(() => {
    async function fetchMembers() {
      const res = await fetch('/api/members');
      const data = await res.json();
      setTeamData(data.members || []);
    }
    fetchMembers();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6" style={{ position: 'relative' }}>
      {/* 右上角语言切换 */}
      <div style={{ position: 'absolute', right: 24, top: 24 }}>
        <button className="btn" onClick={() => {
          setLang(lang === 'zh' ? 'en' : 'zh');
        }}>{t.lang}</button>
      </div>
      {/* 我的订单按钮 */}
      <button
        style={{
          position: 'fixed',
          left: 24,
          top: 24,
          background: '#fff',
          color: '#1890ff',
          border: '1px solid #e5e7eb',
          borderRadius: 8,
          fontWeight: 700,
          fontSize: 16,
          padding: '6px 18px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          zIndex: 2000,
          cursor: 'pointer',
          letterSpacing: 2
        }}
        onClick={() => setOrdersOpen(true)}
      >{t.myOrders}</button>
      <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
      <div className="mb-6 flex items-center gap-4">
        <span className="font-bold">{t.mode}</span>
        <label>
          <input type="radio" name="assignMode" value="fast" checked={assignMode === 'fast'} onChange={() => setAssignMode('fast')} />
          <span className="ml-1">{t.fast}</span>
        </label>
        <label>
          <input type="radio" name="assignMode" value="balanced" checked={assignMode === 'balanced'} onChange={() => setAssignMode('balanced')} />
          <span className="ml-1">{t.balanced}</span>
        </label>
        <label>
          <input type="radio" name="assignMode" value="slow" checked={assignMode === 'slow'} onChange={() => setAssignMode('slow')} />
          <span className="ml-1">{t.slow}</span>
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

      {tasks.length > 0 && (
        <div className="mt-6 space-y-4">
          <h2 className="text-lg font-semibold">{t.taskList}</h2>
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
                <p><strong>{t.task}</strong>{task.title}</p>
                <p><strong>{t.role}</strong>{task.role}</p>
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
                            {member.name} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
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
                            {member.name} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                          </span>
                        );
                      })}
                    </div>
                    {/* 速度过慢成员 */}
                    <div style={{ marginBottom: 8 }}>
                      <strong>{t.tooSlow}</strong>
                      {moreDevs.filter(r => r.member.hourly_rate <= 130 && r.member.speed_factor < 1.1).length === 0 ? <span className="text-gray-500">{t.no}</span> : moreDevs.filter(r => r.member.hourly_rate <= 130 && r.member.speed_factor < 1.1).map(({ member, effectiveHours }) => {
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
                            {member.name} <span style={{ color: '#64748b', fontWeight: 400 }}>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span>
                          </span>
                        );
                      })}
                    </div>
                    {/* 时长不足成员 */}
                    <div>
                      <strong>{t.notEnough}</strong>
                      {cannotAssign.length === 0 ? <span className="text-gray-500">{t.no}</span> : cannotAssign.map(({ member, effectiveHours }) => (
                        <span key={member.id} className="member-badge text-danger">{member.name} <span>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span></span>
                      ))}
                    </div>
                  </div>
                )}
                {expandedTasks[i] === 'insufficient' && (
                  <div className="p-2 border rounded bg-gray-50 mt-2">
                    <strong>{t.insufficient}：</strong>
                    {cannotAssign.length === 0 ? <span className="text-gray-500">{t.no}</span> : cannotAssign.map(({ member, effectiveHours }) => (
                      <span key={member.id} className="member-badge text-danger">{member.name} <span>({effectiveHours}{lang === 'zh' ? '小时' : 'h'})</span></span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {/* 总耗时和总成本展示 */}
          {tasks.length > 0 && (
            <div className="mt-8 p-4 border rounded bg-gray-50">
              <div className="mb-2 font-bold">
                {t.totalCost}{
                  tasks.reduce((sum, task, i) => {
                    const devId = selectedMembers[i];
                    if (!devId) return sum;
                    const dev = teamData.find(d => d.id === devId);
                    if (!dev) return sum;
                    return sum + dev.hourly_rate * task.estimated_hours;
                  }, 0)
                } {lang === 'zh' ? '元' : 'CNY'}
              </div>
              <div className="mb-2 font-bold">
                {t.totalTime}{
                  (() => {
                    // 统计每个成员的所有任务分配天数，取最大值
                    const memberDays: { [memberId: string]: number } = {};
                    tasks.forEach((task, i) => {
                      const devId = selectedMembers[i];
                      if (!devId) return;
                      const dev = teamData.find(d => d.id === devId);
                      if (!dev) return;
                      // 预计工时/每天8小时，向上取整
                      const days = Math.ceil(task.estimated_hours / 8);
                      memberDays[devId] = (memberDays[devId] || 0) + days;
                    });
                    const maxDays = Math.max(...Object.values(memberDays), 0);
                    return `${maxDays} ${lang === 'zh' ? '天' : 'days'}`;
                  })()
                }
              </div>
              <button
                className="btn"
                disabled={Object.keys(selectedMembers).length !== tasks.length || Object.values(selectedMembers).some(v => !v)}
                onClick={async () => {
                  if (Object.keys(selectedMembers).length !== tasks.length || Object.values(selectedMembers).some(v => !v)) {
                    setModalMsg(t.modalConfirmTip);
                    setModalOpen(true);
                    return;
                  }
                  // 统一分配 assignedTasks
                  const newAssigned: { [memberId: string]: number[] } = {};
                  // 分配后所有任务状态设为 '等待接受'
                  const updatedTasks = tasks.map(task => ({ ...task, status: STATUS.PENDING, id: task.id }));
                  updatedTasks.forEach((task, i) => {
                    const devId = selectedMembers[i];
                    if (!devId) return;
                    if (!newAssigned[devId]) newAssigned[devId] = [0,0,0,0];
                    // 简化：全部分配到第0周
                    newAssigned[devId][0] += task.estimated_hours;
                  });
                  setAssignedTasks(newAssigned);
                  // 先将分配信息写入数据库
                  const assignments = [];
                  for (let i = 0; i < updatedTasks.length; i++) {
                    const task = updatedTasks[i];
                    const memberId = selectedMembers[i];
                    if (task.id && memberId) {
                      assignments.push({
                        taskId: task.id,
                        memberId: memberId
                      });
                    }
                  }
                  console.log('Sending assignments:', assignments);
                  console.log('selectedMembers:', selectedMembers);
                  console.log('updatedTasks:', updatedTasks);
                  
                  if (assignments.length > 0) {
                    const response = await fetch('/api/assign-tasks', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ assignments, orderId: dbOrderId })
                    });
                    
                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || '分配失败');
                    }
                  }
                  // 再跳转到结果页面
                  router.push({
                    pathname: '/result',
                    query: {
                      orderId: dbOrderId
                    }
                  });
                }}
              >
                {t.confirm}
              </button>
            </div>
          )}
        </div>
      )}

      {selectedMember && popupPos && popupTaskIdx !== null && (
        <div
          style={{
            position: "absolute",
            left: popupPos.x,
            top: popupPos.y,
            zIndex: 1000,
            background: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
            minWidth: "220px",
            padding: "16px",
            border: "1px solid #eee"
          }}
          tabIndex={0}
        >
          <button
            style={{ position: "absolute", top: 4, right: 8, background: "none", border: "none", color: "#888", fontSize: 18, cursor: "pointer" }}
            onClick={() => setSelectedMember(null)}
          >×</button>
          <h3 style={{ fontWeight: "bold", marginBottom: 8 }}>{selectedMember.name}（{selectedMember.roles.join('、')}）</h3>
          <div>技能：{selectedMember.skills.join(', ')}</div>
          <div>速度倍率：{selectedMember.speed_factor.toFixed(2)}（越高越快）</div>
          <div>未来四周剩余时间：{
            assignedTasks[selectedMember.id]
              ? selectedMember.available_hours.map((h: number, idx: number) => h - (assignedTasks[selectedMember.id][idx] || 0)).join(' / ') + ' h'
              : selectedMember.available_hours.join(' / ') + ' h'
          }</div>
          <div>合作分数：{selectedMember.experience_score}</div>
          <div>时薪：{selectedMember.hourly_rate} 元/小时</div>
          <div style={{marginTop:8, fontWeight:'bold', color:'#1a7f37'}}>
            完成此任务预估花费：
            {popupTaskIdx !== null && tasks[popupTaskIdx] ?
              (selectedMember.hourly_rate * Math.ceil(tasks[popupTaskIdx].estimated_hours / selectedMember.speed_factor)) : 0
            } 元
          </div>
          {(() => {
            const taskMatch = tasks && typeof popupTaskIdx === 'number' ? (() => {
              const mainstreamRoles = [
                '前端工程师', '后端工程师', 'UI设计师', 'UX设计师', '测试工程师', '数据库工程师',
                '产品经理', 'DevOps工程师', '全栈工程师'
              ];
              const mappedRole = mainstreamRoles.includes(tasks[popupTaskIdx].role) ? (roleMap[tasks[popupTaskIdx].role] || tasks[popupTaskIdx].role) : '杂项专员';
              let matchResults: SmartMatchResult[] = [];
              matchResults = smartMatchDevelopersForTask(
                { ...tasks[popupTaskIdx], role: mappedRole },
                teamData,
                assignedTasks,
                assignMode
              );
              return matchResults.find(r => r.member.id === selectedMember.id);
            })() : undefined;
            if (taskMatch && !taskMatch.canAssign) {
              return <div style={{marginTop:10, color:'#e11d48', fontWeight:'bold'}}>该成员时长不足，仅供参考</div>;
            }
            return null;
          })()}
        </div>
      )}

      {/* Modal 弹窗 */}
      {modalOpen && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{
            background: '#fff', borderRadius: 8, padding: 32, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
          }}>
            <div style={{ fontWeight: 600, fontSize: 18, marginBottom: 16 }}>{lang === 'zh' ? '提示' : 'Notice'}</div>
            <div style={{ marginBottom: 24 }}>{modalMsg}</div>
            <button className="btn" onClick={() => setModalOpen(false)}>{lang === 'zh' ? '确定' : 'OK'}</button>
          </div>
        </div>
      )}

      {/* 订单弹窗 */}
      {ordersOpen && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 3000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        }} onClick={() => setOrdersOpen(false)}>
          <div style={{
            marginTop: 80, background: '#fff', borderRadius: 12, minWidth: 420, maxWidth: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: 32, position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <div style={{fontWeight:700, fontSize:22, marginBottom:18}}>{t.myOrders}</div>
            {orders.length === 0 ? <div style={{color:'#888'}}>{t.noOrder}</div> : (
              <div style={{maxHeight: '60vh', overflowY: 'auto'}}>
                {orders.map((order, idx) => (
                  <div key={order.id} style={{
                    borderBottom: '1px solid #f1f5f9', padding: '12px 0', display: 'flex', alignItems: 'center'
                  }}>
                    <div
                      style={{fontWeight:600, color:'#1890ff', minWidth:80, cursor:'pointer', textDecoration:'underline'}}
                      onClick={() => {
                        setOrdersOpen(false);
                        router.push({
                          pathname: '/result',
                          query: {
                            orderId: order.id
                          }
                        });
                      }}
                    >{order.id}</div>
                    <div style={{flex:1, color:'#222', marginLeft:12}}>{new Date(order.created_at).toLocaleString()}</div>
                    <div style={{minWidth:60, color:'#666', marginLeft:12}}>{t.taskCount}: {order.task_count}</div>
                    <div
                      style={{
                        marginLeft: 12,
                        color:
                          order.status === 'COMPLETED'
                            ? '#888'
                            : order.status === 'IN_PROGRESS'
                            ? '#16a34a'
                            : order.status === 'CANCELLED'
                            ? '#e11d48'
                            : '#16a34a',
                        fontWeight: 600,
                      }}
                    >
                      {(orderStatusI18n[lang] as Record<string, string>)[String(order.status)] || String(order.status)}
                    </div>
                    <button
                      style={{marginLeft:18, color:'#e11d48', background:'none', border:'none', fontWeight:600, cursor:'pointer', fontSize:15}}
                      onClick={() => setDeleteOrderId(order.id)}
                    >{t.delete}</button>
                  </div>
                ))}
              </div>
            )}
            <button style={{position:'absolute',top:18,right:24,background:'none',border:'none',fontSize:22,color:'#888',cursor:'pointer'}} onClick={()=>setOrdersOpen(false)}>{t.close} ×</button>
          </div>
        </div>
      )}

      {deleteOrderId && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.15)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, minWidth: 320, maxWidth: 340, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', padding: '36px 0 32px 0', position: 'relative', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
          }}>
            <button style={{position:'absolute',top:14,right:18,background:'none',border:'none',fontSize:22,color:'#888',cursor:'pointer',lineHeight:1}} onClick={()=>setDeleteOrderId(null)}>×</button>
            <button style={{background:'#e11d48',color:'#fff',border:'none',borderRadius:10,fontWeight:700,fontSize:18,padding:'14px 48px',cursor:'pointer',marginTop:10,boxShadow:'0 2px 8px rgba(225,29,72,0.08)'}} onClick={() => {
              handleDeleteOrder(deleteOrderId);
            }}>{t.delete}</button>
          </div>
        </div>
      )}
    </div>
  );
}
