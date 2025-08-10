import { useCallback, useEffect } from 'react';
import { loadOrdersFromLocalStorageSorted } from '../services/orderLoaders';

interface UseOrdersPanelArgs {
  router: any;
  ordersOpen: boolean;
  isDeletingOrder: boolean;
  setOrders: (orders: any[]) => void;
  setDeleteOrderId: (id: string | null) => void;
  fetchOrdersSafe: () => Promise<any[]>;
  fetchOrderDetailSafe: (orderId: string) => Promise<any>;
}

export function useOrdersPanel({
  router,
  ordersOpen,
  isDeletingOrder,
  setOrders,
  setDeleteOrderId,
  fetchOrdersSafe,
  fetchOrderDetailSafe,
}: UseOrdersPanelArgs) {
  const refreshOrders = useCallback(async () => {
    try {
      const data = await fetchOrdersSafe();
      if (Array.isArray(data) && data.length > 0) {
        const sorted = [...data].sort((a: any, b: any) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
        setOrders(sorted);
        return;
      }
      const local = loadOrdersFromLocalStorageSorted();
      setOrders(local);
    } catch {
      const local = loadOrdersFromLocalStorageSorted();
      setOrders(local);
    }
  }, [fetchOrdersSafe, setOrders]);

  useEffect(() => {
    if (ordersOpen && !isDeletingOrder) {
      refreshOrders();
    }
  }, [ordersOpen, isDeletingOrder, refreshOrders]);

  const onViewOrder = useCallback(async (orderId: string) => {
    const data = await fetchOrderDetailSafe(orderId);
    const status = data?.order?.status;
    const tasks = data?.tasks || [];
    const allUnassigned = tasks.length > 0 && tasks.every((t: any) => !t.assigned_member_id);
    if (!status || status === '未开始' || status === 'Not Started' || allUnassigned) {
      router.push({ pathname: '/task-planner', query: { orderId } });
    } else {
      router.push({ pathname: '/result', query: { orderId } });
    }
  }, [fetchOrderDetailSafe, router]);

  const onDeleteClickOrder = useCallback((orderId: string) => {
    setDeleteOrderId(orderId);
  }, [setDeleteOrderId]);

  return { refreshOrders, onViewOrder, onDeleteClickOrder };
}


