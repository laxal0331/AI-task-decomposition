import { useCallback } from 'react';
import type { Task } from '../models/task';
import { STATUS } from '../constants/status';
import { decompose } from '../api/decompose';

type Lang = 'zh' | 'en';
type Mode = 'slow' | 'balanced' | 'fast';

export interface DecomposeResult {
  tasks: Task[];
  orderId: string;
  orderData?: any;
  members?: any[];
}

export function useDecompose() {
  const decomposeGoal = useCallback(async (goal: string, assignMode: Mode, lang: Lang): Promise<DecomposeResult> => {
    const data = await decompose(goal, assignMode, lang);
    if (!data || !Array.isArray(data.tasks)) {
      throw new Error('AI返回数据不完整');
    }
    const tasks: Task[] = data.tasks.map((task: any) => ({
      ...task,
      title: task.title_zh || task.title || '',
      role: task.role_zh || task.role || '',
      status: task.status || STATUS.NOT_STARTED,
      id: task.id,
    }));
    return {
      tasks,
      orderId: data.orderId,
      orderData: data.orderData,
      members: data.members,
    };
  }, []);

  return { decomposeGoal };
}


