import type { Task } from '../models/task';
import { STATUS } from '../constants/status';
import { getLocalStorage } from '../utils/storage';
import { getOrderById } from '../api/orders';

export function normalizeTask(task: any): Task {
  const roleZh = task.role_zh || task.role || '';
  // 后端兜底：把“前端开发/后端开发/UI/UX/系统架构/项目经理”等别名在数据库读取时也规范一次
  const aliasMap: Record<string, string> = {
    '前端开发工程师': '前端工程师',
    '后端开发工程师': '后端工程师',
    'UI/UX设计师': 'UI设计师',
    '系统架构师': '后端工程师',
    '架构师': '后端工程师',
    '项目经理': '产品经理',
  };
  const normalizedRole = aliasMap[roleZh] || roleZh;
  return {
    ...task,
    title: task.title_zh || task.title || '',
    role: normalizedRole,
    status: task.status || STATUS.NOT_STARTED,
    id: task.id,
  } as Task;
}

export async function loadOrderFromDatabaseFlow(orderId: string): Promise<{
  tasks: Task[];
  members?: any[];
  existingAssignments: { [taskIdx: number]: string };
  order?: any;
}> {
  const data = await getOrderById(orderId);
  const tasks: Task[] = (data.tasks || []).map(normalizeTask);
  const members: any[] | undefined = data.members;
  const existingAssignments: { [taskIdx: number]: string } = {};
  tasks.forEach((t: any, idx: number) => {
    if (t.assigned_member_id) existingAssignments[idx] = t.assigned_member_id;
  });
  return { tasks, members, existingAssignments, order: data.order };
}

export function loadOrdersFromLocalStorageSorted(): any[] {
  const savedOrders = JSON.parse(getLocalStorage('orders') || '[]');
  if (!Array.isArray(savedOrders)) return [];
  return savedOrders.sort((a: any, b: any) => (parseInt(b.id) || 0) - (parseInt(a.id) || 0));
}

// (deduped duplicate declarations below)


