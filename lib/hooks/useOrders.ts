import { useCallback } from 'react';
import { getOrders, getOrderById, deleteOrder } from '../api/orders';
import { getLocalStorage, setLocalStorage } from '../utils/storage';
import { STATUS } from '../constants/status';

export function useOrdersHelpers() {
  const fetchOrdersSafe = useCallback(async () => {
    try {
      const data = await getOrders();
      return data.orders || [];
    } catch (e) {
      const localOrders = JSON.parse(getLocalStorage('orders') || '[]');
      return localOrders;
    }
  }, []);

  const fetchOrderDetailSafe = useCallback(async (orderId: string) => {
    try {
      const data = await getOrderById(orderId);
      return data;
    } catch (e) {
      return null;
    }
  }, []);

  const removeOrder = useCallback(async (orderId: string) => {
    const savedOrders = JSON.parse(getLocalStorage('orders') || '[]');
    const savedTasks = JSON.parse(getLocalStorage('tasks') || '[]');
    const filteredOrders = savedOrders.filter((o: any) => o.id !== orderId);
    const filteredTasks = savedTasks.filter((t: any) => t.order_id !== orderId);
    setLocalStorage('orders', JSON.stringify(filteredOrders));
    setLocalStorage('tasks', JSON.stringify(filteredTasks));
    try { await deleteOrder(orderId); } catch {}
    return { filteredOrders, filteredTasks };
  }, []);

  const normalizeTaskStatus = useCallback((task: any) => ({
    ...task,
    status: task.status || STATUS.NOT_STARTED,
  }), []);

  return { fetchOrdersSafe, fetchOrderDetailSafe, removeOrder, normalizeTaskStatus };
}


