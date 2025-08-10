import { useEffect } from 'react';
import { getLocalStorage } from '../utils/storage';
import { normalizeTask } from '../services/orderLoaders';

type Mode = 'slow' | 'balanced' | 'fast';

interface UseOrderDetailsOptions {
  orderId: string | string[] | undefined;
  setTasks: (tasks: any[]) => void;
  setDbOrderId: (id: string) => void;
  setOrderStatus: (status: string | null) => void;
  setInput: (goal: string) => void;
  setAssignMode: (mode: Mode) => void;
  setAssignedTasks: (v: any) => void;
  setTeamData: (members: any[]) => void;
  executeImmediateAutoSelection: (tasks: any[], members: any[], mode: Mode, source: string) => { [taskIdx: number]: string };
  setSelectedMembers: (v: any) => void;
  setShowAutoSelectButton: (v: boolean) => void;
  fetchOrderDetailSafe: (orderId: string) => Promise<any>;
  fetchMembersSafe: () => Promise<any[]>;
  normalizeTaskStatus: (task: any) => any; // kept for backward compatibility, but roles are normalized via normalizeTask
}

export function useOrderDetails(opts: UseOrderDetailsOptions) {
  const {
    orderId,
    setTasks,
    setDbOrderId,
    setOrderStatus,
    setInput,
    setAssignMode,
    setAssignedTasks,
    setTeamData,
    executeImmediateAutoSelection,
    setSelectedMembers,
    setShowAutoSelectButton,
    fetchOrderDetailSafe,
    fetchMembersSafe,
    normalizeTaskStatus,
  } = opts;

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      const savedOrders = JSON.parse(getLocalStorage('orders') || '[]');
      const savedTasks = JSON.parse(getLocalStorage('tasks') || '[]');
      const orderIdStr = String(orderId);
      const targetOrder = savedOrders.find((order: any) => order.id === orderIdStr);
      const targetTasks = savedTasks.filter((task: any) => task.order_id === orderIdStr);

      if (targetOrder && targetTasks.length > 0) {
        // Always normalize roles/fields when restoring from localStorage
        setTasks(targetTasks.map(normalizeTask));
        setDbOrderId(orderIdStr);
        setOrderStatus(targetOrder.status || '未开始');
        setInput(targetOrder.goal || '');
        setAssignMode(targetOrder.assign_mode || 'slow');
        setAssignedTasks({});
        try {
          const members = await fetchMembersSafe();
          if (members && members.length > 0) {
            setTeamData(members);
            const normalizedTasks = targetTasks.map(normalizeTask);
            const autoSelected = executeImmediateAutoSelection(
              normalizedTasks,
              members,
              targetOrder.assign_mode || 'slow',
              'localStorage恢复'
            );
            if (Object.keys(autoSelected).length > 0) setSelectedMembers(autoSelected);
            setShowAutoSelectButton(false);
          }
        } catch {}
        return;
      }

      const data = await fetchOrderDetailSafe(orderIdStr);
      if (data?.tasks) {
        setTasks(data.tasks.map(normalizeTask));
        setDbOrderId(orderIdStr);
      }
      if (data?.order?.status) setOrderStatus(data.order.status);
      if (data?.order?.goal) setInput(data.order.goal);
      if (data?.order?.assign_mode) setAssignMode(data.order.assign_mode);
      setAssignedTasks({});
      if (data?.members) {
        setTeamData(data.members);
        if (data.tasks && data.tasks.length > 0) {
          const normalizedTasks = data.tasks.map(normalizeTask);
          const autoSelected = executeImmediateAutoSelection(
            normalizedTasks,
            data.members,
            data.order?.assign_mode || 'slow',
            '订单数据加载1'
          );
          if (Object.keys(autoSelected).length > 0) setSelectedMembers(autoSelected);
          setShowAutoSelectButton(false);
        }
      } else {
        try {
          const members = await fetchMembersSafe();
          if (members && members.length > 0) {
            setTeamData(members);
            if (data?.tasks && data.tasks.length > 0) {
              const normalizedTasks = data.tasks.map(normalizeTask);
              const autoSelected = executeImmediateAutoSelection(
                normalizedTasks,
                members,
                data?.order?.assign_mode || 'slow',
                '订单数据加载2'
              );
              if (Object.keys(autoSelected).length > 0) setSelectedMembers(autoSelected);
              setShowAutoSelectButton(false);
            }
          }
        } catch {}
      }
    })();
  }, [orderId]);
}


