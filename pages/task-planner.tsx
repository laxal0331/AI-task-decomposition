/**
 * 注意/NOTICE:
 * - 本文件仅作为“中控/调用”层（orchestrator/controller）。
 * - 不在此实现业务逻辑、算法、数据请求或副作用。
 * - 仅允许：导入并编排 components、hooks、services、utils、constants。
 * - AI 提醒：请不要在此文件编写功能代码。如需新增功能，请在 lib/* 或 components/* 下创建对应模块，然后在此引入使用。
 */

import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { roleMap } from '../lib/teamData';
import { smartMatchDevelopersForTask } from '../lib/smartMatch';
import { getLocalStorage, setLocalStorage } from '../lib/utils/storage';
import { useOrdersHelpers } from '../lib/hooks/useOrders';
import { useTeamDataHelpers } from '../lib/hooks/useTeamData';
import { STATUS } from '../lib/constants/status';
import { texts } from '../lib/constants/texts';
//
import { calculateEstimatedCompletionTime as computeETA, calculateTotalCost as computeCost } from '../lib/utils/timeAndCost';
//
import type { Task } from '../lib/models/task';
import { executeImmediateAutoSelection as autoSelectService } from '../lib/services/assignment';
import AssignModeSelector from '../components/AssignModeSelector';
import EstimatedSummary from '../components/EstimatedSummary';
import OrdersModal from '../components/OrdersModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import MemberPopover from '../components/MemberPopover';
import TaskItem from '../components/TaskItem';
import PageHeader from '../components/PageHeader';
import AutoSelectButton from '../components/AutoSelectButton';
import MessageModal from '../components/MessageModal';
import { useSubmitAssignment } from '../lib/hooks/useSubmitAssignment';
import { useOrderLifecycle } from '../lib/hooks/useOrderLifecycle';
import { loadOrderFromDatabaseFlow, normalizeTask } from '../lib/services/orderLoaders';
import { getOrComputeAssignments, snapshotCandidates } from '../lib/services/recommendationCache';
import { useOrderDetails } from '../lib/hooks/useOrderDetails';
import { useDecompose } from '../lib/hooks/useDecompose';
import { useOrdersPanel } from '../lib/hooks/useOrdersPanel';
import { useMemberPopover } from '../lib/hooks/useMemberPopover';
import { isDevOverCapacity } from '../lib/utils/devCapacity';

// SSR 环境标记（统一在 lib/utils/storage.ts 内有 isBrowser，不在此重复定义）

// 使用模型中的 Task 类型

// 1. 定义统一的状态常量
// 从常量中导入 STATUS

// 2. 状态国际化映射与软编码映射改为从常量模块导入

// 文案改为从常量模块导入

//

// 颜色映射改为从常量模块导入

// 任务角色映射改为从常量模块导入

export default function TaskPlanner() {
  // 添加错误状态
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // 客户端检查
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleError = (error: ErrorEvent) => setError(error.message);
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
  
  // 调试信息（已移除日志）

  const { fetchOrdersSafe, fetchOrderDetailSafe, removeOrder, normalizeTaskStatus: normalizeTaskStatusFromHook } = useOrdersHelpers();
  const { fetchMembersSafe } = useTeamDataHelpers();
  const { buildAssignments, submitAssignments } = useSubmitAssignment();

  // 处理URL与本地恢复
  const { tryLoadOrdersFromLocalStorage: tryLoadOrdersFromLocalStorageHook } = useOrderLifecycle(router, isClient, setTasks, setDbOrderId, setOrders);
  useEffect(() => {
    if (!isClient) return;
    if (router.query.orderId) {
        loadOrderFromDatabase(router.query.orderId as string);
    } else {
      tryLoadOrdersFromLocalStorageHook();
    }
  }, [router.query.orderId, isClient, tryLoadOrdersFromLocalStorageHook]);

  // 从数据库加载订单数据的函数（精简）
  const loadOrderFromDatabase = async (orderId: string) => {
    try {
      const { tasks: loadedTasks, members, existingAssignments } = await loadOrderFromDatabaseFlow(orderId);
      if (loadedTasks.length > 0) {
        // 二次进入也进行一次任务归一，确保角色与首次一致
        const normalized = loadedTasks.map(t => normalizeTask(t as any));
        setTasks(normalized);
        setDbOrderId(orderId);
        if (members) setTeamData(members);
          if (Object.keys(existingAssignments).length > 0) {
            setSelectedMembers(existingAssignments);
          } else {
          const preset = getOrComputeAssignments(orderId, normalized as any, members || teamData, assignMode);
          if (Object.keys(preset).length > 0) {
            setSelectedMembers(preset);
            setShowAutoSelectButton(false);
      } else {
            setSelectedMembers({});
            setShowAutoSelectButton(true);
          }
        }
        // 记录“所有可选成员”候选快照，便于二次进入直接展示
        snapshotCandidates(orderId, normalized as any, members || teamData, true);
      }
    } catch {}
  };

  // —

  // 订单刷新逻辑已抽离到 useOrdersPanel.refreshOrders
  
  // 🔧 统一的同步自动选择函数 - 直接使用传入的数据，不依赖状态
  const executeImmediateAutoSelection = (
    tasksData: Task[],
    membersData: any[],
    mode: 'slow' | 'balanced' | 'fast',
    source: string
  ): { [taskIdx: number]: string } => {
    const allowSources = new Set([
      '用户手动触发',
      'API任务分解',
      'API成员加载完成',
      '订单数据加载1',
      '订单数据加载2',
      'localStorage恢复',
      '模式切换',
    ]);
    if (!allowSources.has(source)) return {};
    // 如果显示“自动选择”按钮，说明用户尚未允许覆盖；但避免出现“全无”的体验，允许兜底选择
    // 在这种情况下返回的结果不会自动覆盖 UI（由调用方决定是否 setSelectedMembers）
    return autoSelectService(tasksData, membersData, mode);
  };

  // 模式切换时按照当前模式自动重选（仅在已存在任务与成员、且未显示手动按钮时）
  useEffect(() => {
    if (tasks.length === 0 || teamData.length === 0) return;
    if (showAutoSelectButton) return;
    const autoSelected = executeImmediateAutoSelection(tasks, teamData, assignMode, '模式切换');
    if (Object.keys(autoSelected).length > 0) setSelectedMembers(autoSelected);
  }, [assignMode, tasks.length, teamData.length, showAutoSelectButton]);

  const { refreshOrders, onViewOrder, onDeleteClickOrder } = useOrdersPanel({
    router,
    ordersOpen,
    isDeletingOrder,
    setOrders,
    setDeleteOrderId,
    fetchOrdersSafe,
    fetchOrderDetailSafe,
  });

  // 成员弹窗交互：使用 hook 封装
  const { handleMemberClick } = useMemberPopover(setSelectedMember, setPopupPos, setPopupTaskIdx);

  const { decomposeGoal } = useDecompose();
  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (trimmed.length < 2) {
      setModalMsg(t.modalInputTip);
      setModalOpen(true);
      return;
    }
    setLoading(true);
    try {
      const data = await decomposeGoal(trimmed, assignMode, lang);
      const normalized = data.tasks.map(normalizeTaskStatus);
      setTasks(normalized);
      setAssignedTasks({});
      setDbOrderId(data.orderId);
      if (data.orderData) {
        const existingOrders = JSON.parse(getLocalStorage('orders') || '[]');
        setLocalStorage('orders', JSON.stringify([...existingOrders, data.orderData]));
      }
      if (data.members) {
        setTeamData(data.members);
        if (isFirstDecomposition) {
          setShowAutoSelectButton(true);
          setSelectedMembers({});
          setIsFirstDecomposition(false);
        } else {
          const autoSelected = executeImmediateAutoSelection(normalized, data.members, assignMode, 'API任务分解');
          if (Object.keys(autoSelected).length > 0) {
          setSelectedMembers(autoSelected);
          } else {
            const preset = getOrComputeAssignments(data.orderId, normalized as any, data.members, assignMode);
            if (Object.keys(preset).length > 0) setSelectedMembers(preset);
          }
        }
      }
      if (ordersOpen) setTimeout(() => { refreshOrders(); }, 500);
    } catch (e) {
      const msg = String(e).includes('500')
        ? 'AI处理失败，请尝试：\n• 提供更详细的项目描述\n• 使用具体的功能说明\n• 稍后重试'
        : '提交失败，请重试。如果问题持续，请稍后再试。';
      setModalMsg(msg);
      setModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const isDevDisabled = (dev: any, taskIdx: number) => isDevOverCapacity(dev, taskIdx, tasks, selectedMembers);

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setIsDeletingOrder(true);
      const { filteredOrders } = await removeOrder(orderId);
      const sorted = filteredOrders.sort((a: any, b: any) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
      setOrders(sorted);
      setDeleteOrderId(null);
    } catch (error) {
      setModalMsg(`删除失败: ${String(error)}`);
      setModalOpen(true);
    } finally {
      setTimeout(() => setIsDeletingOrder(false), 300);
    }
  };

  // 兼容老数据：tasks 读取/初始化时自动转换
  const normalizeTaskStatus = normalizeTaskStatusFromHook as unknown as (task: Task) => Task;

  // 计算预计完成时间
  const calculateEstimatedCompletionTime = () => computeETA(tasks, selectedMembers, teamData, assignMode);

  // 计算总金额
  const calculateTotalCost = () => computeCost(tasks, selectedMembers, teamData);

  // 拉取团队成员数据
  useEffect(() => {
    async function fetchMembers() {
      try {
        const members = await fetchMembersSafe();
        if (members && members.length > 0) {
          setTeamData(members);
          if (tasks.length > 0) {
            const autoSelected = executeImmediateAutoSelection(tasks, members, assignMode, 'API成员加载完成');
            if (Object.keys(autoSelected).length > 0) setSelectedMembers(autoSelected);
          }
        }
      } catch {}
    }
    fetchMembers();
  }, []);

  // 拉取订单详情时初始化（收敛到 hook）
  useOrderDetails({
    orderId,
    setTasks,
    setDbOrderId: (id) => setDbOrderId(id),
    setOrderStatus,
    setInput,
    setAssignMode: (m) => setAssignMode(m),
    setAssignedTasks,
    setTeamData,
    executeImmediateAutoSelection,
    setSelectedMembers,
    setShowAutoSelectButton,
    fetchOrderDetailSafe,
    fetchMembersSafe,
    normalizeTaskStatus,
  });

  // 处理重新分配单个任务的逻辑
  useEffect(() => {
    const { reassignTask } = router.query as { reassignTask?: string };
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
        
        // 任务重置完成
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
  
  
  let mainContent;
  // 使用 dbOrderId 或 orderId，优先使用 dbOrderId（新创建的订单）
  const currentOrderId = dbOrderId || orderId;
  
  if (currentOrderId && tasks.length > 0) {
    // 任务分配界面内容 - 有任务数据时显示
    mainContent = (
      <>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>{t.title}</h1>
          
          <AutoSelectButton
            visible={tasks.length > 0 && showAutoSelectButton}
            label={lang === 'zh' ? '自动选择成员' : 'Auto Select'}
              onClick={() => {
              const autoSelected = executeImmediateAutoSelection(tasks, teamData, assignMode, '用户手动触发');
                setSelectedMembers(autoSelected);
              setShowAutoSelectButton(false);
              setIsFirstDecomposition(false);
              }}
          />
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
              <AssignModeSelector assignMode={assignMode} setAssignMode={setAssignMode} t={t} />
            </div>
          </div>
          

          {tasks.map((task, i) => (
            <div key={i}>
              <TaskItem
                i={i}
                task={task}
                lang={lang}
                t={t}
                teamData={teamData}
                assignMode={assignMode}
                roleMap={roleMap}
                assignedTasks={assignedTasks}
                selectedMembers={selectedMembers}
                expanded={expandedTasks[i] || null}
                onToggle={(key) => setExpandedTasks(prev => ({ ...prev, [i]: prev[i] === key ? null : key }))}
                onMemberClick={handleMemberClick}
                smartMatchDevelopersForTask={smartMatchDevelopersForTask}
              />
                </div>
          ))}
          
          {/* 预计完成时间和总金额显示 */}
          {tasks.length > 0 && (() => {
            const completionInfo = calculateEstimatedCompletionTime();
            const costInfo = calculateTotalCost();
            return (
              <EstimatedSummary
                lang={lang}
                assignMode={assignMode}
                completionInfo={completionInfo}
                costInfo={costInfo}
                t={t}
                selectedMembersCount={Object.keys(selectedMembers).length}
              />
            );
          })()}
          

          
          {/* 确认分配按钮 */}
          {tasks.length > 0 && (
            <div className="mt-6 text-center" style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
              <button
                className="btn"
                onClick={async () => {
                  try {
                    const currentOrderIdFinal = (dbOrderId || orderId) as string | undefined;
                    const assignments = buildAssignments(tasks, selectedMembers);
                    if (!assignments.length) {
                      setModalMsg('请至少为一个任务选择成员');
                      setModalOpen(true);
                      return;
                    }
                    await submitAssignments(assignments, currentOrderIdFinal);
                    router.push({ pathname: '/result', query: { orderId: currentOrderIdFinal } });
                    } catch (error) {
                    setModalMsg(`分配失败: ${String(error)}`);
                    setModalOpen(true);
                  }
                }}
              >
                {t.confirm}
              </button>
              <button
                className="btn"
                data-variant="secondary"
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
          <PageHeader
            t={t}
            onHome={() => router.push('/')}
            onOpenOrders={() => setOrdersOpen(true)}
            lang={lang}
            onToggleLang={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          />

          {/* 所有弹窗组件保持不变 */}
          
          <OrdersModal
            open={ordersOpen}
            orders={orders}
            lang={lang}
            t={t}
            onClose={() => setOrdersOpen(false)}
            onView={async (orderId: string) => { setOrdersOpen(false); await onViewOrder(orderId); }}
            onDeleteClick={(orderId: string) => onDeleteClickOrder(orderId)}
          />

          {/* 删除确认弹窗 */}
          <DeleteConfirmModal
            open={!!deleteOrderId}
            t={t}
            onConfirm={() => deleteOrderId && handleDeleteOrder(deleteOrderId)}
            onClose={() => setDeleteOrderId(null)}
          />

          {/* 成员详情弹窗 */}
          <MemberPopover
            selectedMember={selectedMember}
            popupPos={popupPos}
            lang={lang}
            onConfirm={() => {
                  if (popupTaskIdx !== null) {
                    setSelectedMembers(prev => ({ ...prev, [popupTaskIdx]: selectedMember.id }));
                  }
                  setSelectedMember(null);
                  setPopupPos(null);
                  setPopupTaskIdx(null);
                }}
            onClose={() => {
                  setSelectedMember(null);
                  setPopupPos(null);
                  setPopupTaskIdx(null);
                }}
          />

          <MessageModal open={modalOpen} message={modalMsg} confirmText={t.confirm} onClose={() => setModalOpen(false)} />
          
          {mainContent}
        </div>
      </div>
    </div>
  );
}