import { NextApiRequest, NextApiResponse } from 'next';
import { taskService, memberService } from '../../lib/dbService';

// 工具函数：解析成员的 available_hours 字段（JSON字符串）
function getAvailableHours(member: any): number[] {
  try {
    if (typeof member.available_hours === 'string') {
      return JSON.parse(member.available_hours);
    }
    return member.available_hours;
  } catch {
    return [];
  }
}

// 工具函数：更新成员的 available_hours 字段
function setAvailableHours(member: any, newAvailableHours: number[]): string {
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
        return res.status(200).json({ message: '分配完成', assignments });
      }
      // 获取所有未分配的任务
      const allTasks: any[] = await taskService.getTasksByOrderId(orderId) as any[];
      const unassignedTasks = allTasks.filter((task: any) => !task.assigned_member_id);

      // 获取所有成员
      const allMembers: any[] = await memberService.getAllMembers() as any[];
      let autoAssignments: { taskId: string, memberId: string | null }[] = [];

      for (const task of unassignedTasks) {
        // 查找满足角色且有足够可用工时的成员
        let candidate: { member: any, idx: number, availableHours: number[] } | null = null;
        for (const member of allMembers) {
          // 角色匹配
          let roles: string[] = [];
          try {
            roles = typeof member.roles === 'string' ? JSON.parse(member.roles) : member.roles;
          } catch { roles = []; }
          if (!roles || !roles.includes(task.role_zh)) continue;

          // 工时匹配
          let availableHours: number[] = getAvailableHours(member);
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
          const connection = await require('../../lib/database').default.getConnection();
          await connection.query('UPDATE members SET available_hours = ? WHERE id = ?', [newAvailableHours, candidate.member.id]);
          connection.release();
          autoAssignments.push({ taskId: task.id, memberId: candidate.member.id });
        } else {
          autoAssignments.push({ taskId: task.id, memberId: null }); // 无合适成员
        }
      }

      res.status(200).json({ message: '分配完成', assignments: autoAssignments });
    } catch (error) {
      console.error('自动分配任务失败', error);
      res.status(500).json({ error: '自动分配任务失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 