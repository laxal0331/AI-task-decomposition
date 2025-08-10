import { NextApiRequest, NextApiResponse } from 'next';
import { taskService, teamMemberService, orderService } from '../../lib/dbService';
import { roleMap } from '../../lib/teamData';

// 定义类型
interface TeamMember {
  id: string;
  available_hours: string | number[];
  roles: string | string[];
}

interface Task {
  id: string;
  assigned_member_id: string | null;
  role_zh: string;
  estimated_hours: number;
}

interface Assignment {
  taskId: string;
  memberId: string | null;
}

interface Candidate {
  member: TeamMember;
  idx: number;
  availableHours: number[];
}

// 工具函数：解析成员的 available_hours 字段（JSON字符串）
function getAvailableHours(member: TeamMember): number[] {
  try {
    if (typeof member.available_hours === 'string') {
      return JSON.parse(member.available_hours);
    }
    return member.available_hours as number[];
  } catch {
    return [];
  }
}

// 工具函数：更新成员的 available_hours 字段
function setAvailableHours(member: TeamMember, newAvailableHours: number[]): string {
  return JSON.stringify(newAvailableHours);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { assignments, orderId } = req.body;
      if (assignments && Array.isArray(assignments)) {
        // 前端传了 assignments，直接写入数据库
        for (const { taskId, memberId } of assignments) {
          await taskService.assignTaskToMember(taskId, memberId);
        }
        // 分配成功后，更新订单状态为"进行中"
        if (orderId) {
          await orderService.updateOrderStatus(orderId, '进行中');
        }
        return res.status(200).json({ message: '分配完成', assignments });
      }
      // 获取所有未分配的任务
      const allTasks: Task[] = await taskService.getTasksByOrderId(orderId) as Task[];
      const unassignedTasks = allTasks.filter((task: Task) => !task.assigned_member_id);

      // 获取所有成员
      const allMembers: TeamMember[] = await teamMemberService.getAll() as TeamMember[];
      const autoAssignments: Assignment[] = [];

      for (const task of unassignedTasks) {
        // 查找满足角色且有足够可用工时的成员
        let candidate: Candidate | null = null;
        
        // 使用角色映射，与前端保持一致
        const taskRole = roleMap[task.role_zh] || task.role_zh;
        
        for (const member of allMembers) {
          // 角色匹配 - 使用与前端相同的逻辑
          let roles: string[] = [];
          try {
            roles = typeof member.roles === 'string' ? JSON.parse(member.roles) : member.roles;
          } catch { roles = []; }
          
          // 1. 精确匹配
          if (!roles || !roles.includes(taskRole)) {
            // 2. 全栈工程师可以匹配任何角色
            if (!roles || !roles.includes('全栈工程师')) {
              // 3. 相关角色的交叉匹配
              const roleCompatibility = {
                '前端工程师': ['UI设计师', 'UX设计师', '全栈工程师'],
                '后端工程师': ['数据库工程师', 'DevOps工程师', '全栈工程师'],
                'UI设计师': ['前端工程师', 'UX设计师'],
                'UX设计师': ['前端工程师', 'UI设计师', '产品经理'],
                '数据库工程师': ['后端工程师', 'DevOps工程师'],
                'DevOps工程师': ['后端工程师', '数据库工程师'],
                '测试工程师': ['前端工程师', '后端工程师', '全栈工程师'],
                '产品经理': ['UX设计师', 'UI设计师'],
                '杂项专员': [], // 杂项专员只能精确匹配或全栈
                '项目经理': ['产品经理', 'UX设计师', 'UI设计师']
              };
              
              // 检查是否有兼容角色
              const compatibleRoles = roleCompatibility[taskRole] || [];
              if (!roles.some(role => compatibleRoles.includes(role))) {
                continue; // 没有匹配的角色
              }
            }
          }

          // 工时匹配
          const availableHours: number[] = getAvailableHours(member);
          // 这里假设 available_hours 是数组，每个元素代表某天的可用工时，取第一个大于等于任务工时的天
          const idx = availableHours.findIndex((h: number) => h >= task.estimated_hours);
          if (idx === -1) continue;

          candidate = { member, idx, availableHours };
          break; // 找到第一个合适的就分配
        }

        if (candidate) {
          // 分配任务
          await taskService.assignTaskToMember(task.id, candidate.member.id);
          // 扣减成员可用工时
          candidate.availableHours[candidate.idx] -= task.estimated_hours;
          const newAvailableHours = setAvailableHours(candidate.member, candidate.availableHours);
          // 更新成员 available_hours
          await teamMemberService.updateMemberHours(candidate.member.id, newAvailableHours);
          autoAssignments.push({ taskId: task.id, memberId: candidate.member.id });
        } else {
          autoAssignments.push({ taskId: task.id, memberId: null }); // 无合适成员
        }
      }

      res.status(200).json({ message: '分配完成', assignments: autoAssignments });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('自动分配任务失败', error);
      res.status(500).json({ error: '自动分配任务失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 