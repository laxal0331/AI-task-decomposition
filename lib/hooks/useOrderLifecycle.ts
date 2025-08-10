import { useEffect, useCallback } from 'react';
import { getLocalStorage } from '../utils/storage';
import { STATUS } from '../constants/status';

export function useOrderLifecycle(
  router: any,
  isClient: boolean,
  setTasks: (t: any[]) => void,
  setDbOrderId: (id: string | null) => void,
  setOrders: (o: any[]) => void
) {
  const tryLoadOrdersFromLocalStorage = useCallback(async () => {
    const savedOrders = JSON.parse(getLocalStorage('orders') || '[]');
    if (Array.isArray(savedOrders) && savedOrders.length > 0) {
      const sortedOrders = savedOrders.sort((a: any, b: any) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
      setOrders(sortedOrders);
      if (sortedOrders.length > 0 && (!router.query.orderId)) {
        const latest = sortedOrders[0];
        if (latest?.tasks?.length > 0) {
          setTasks(latest.tasks);
          setDbOrderId(latest.id);
        }
      }
    }
  }, [router.query.orderId, setOrders, setTasks, setDbOrderId]);

  useEffect(() => {
    const run = async () => {
      if (router.query.orderId && isClient) return;
      if (isClient && !router.query.orderId) await tryLoadOrdersFromLocalStorage();
    };
    run();
  }, [router.query.orderId, isClient, tryLoadOrdersFromLocalStorage]);

  return { tryLoadOrdersFromLocalStorage };
}


