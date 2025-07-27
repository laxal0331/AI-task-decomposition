import { NextApiRequest, NextApiResponse } from 'next';
import { tasks, teamMembers, orders, saveAllData } from '../../lib/dataStore';

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
      console.log('=== 分配任务开始 ===');
      console.log('请求参数:', { assignments, orderId });
      
      if (assignments && Array.isArray(assignments)) {
        // 前端传了 assignments，直接写入数据库
        console.log('前端直接分配:', assignments);
        for (const { taskId, memberId } of assignments) {
          const taskIndex = tasks.findIndex(task => task.id === taskId);
          if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], assigned_member_id: memberId };
          }
        }
        saveAllData();
        // 分配成功后，更新订单状态为"进行中"
        if (orderId) {
          const orderIndex = orders.findIndex(order => order.id === orderId);
          if (orderIndex !== -1) {
            orders[orderIndex] = { ...orders[orderIndex], status: '进行中' };
          }
        }
        saveAllData();
        return res.status(200).json({ message: '分配完成', assignments });
      }
      
      // 获取所有未分配的任务
      console.log('开始自动分配，订单ID:', orderId);
      const allTasks: any[] = tasks.filter(task => task.orderId === orderId);
      console.log('所有任务:', allTasks);
      
      const unassignedTasks = allTasks.filter((task: any) => !task.assigned_member_id);
      console.log('未分配任务:', unassignedTasks);

      // 获取所有成员
      const allMembers: any[] = teamMembers;
      console.log('所有成员数量:', allMembers.length);
      console.log('成员示例:', allMembers.slice(0, 2));
      
      let autoAssignments: { taskId: string, memberId: string | null }[] = [];

      for (const task of unassignedTasks) {
        console.log(`\n--- 处理任务: ${task.title_zh || task.title} ---`);
        console.log('任务角色:', task.role_zh, '预计工时:', task.estimated_hours);
        
        // 查找满足角色且有足够可用工时的成员
        let candidate: { member: any, availableHours: number[] } | null = null;
        
        for (const member of allMembers) {
          // 角色匹配（放宽为包含关系）
          let roles: string[] = [];
          try {
            roles = typeof member.roles === 'string' ? JSON.parse(member.roles) : member.roles;
          } catch { roles = []; }
          
          console.log(`检查成员 ${member.name}: 角色=${roles}, 任务角色=${task.role_zh}`);
          
          // 改进角色匹配逻辑
          const roleMatch = roles && roles.some(r => {
            // 直接匹配
            if (r === task.role_zh) return true;
            // 包含匹配
            if (r.includes(task.role_zh) || task.role_zh.includes(r)) return true;
            // 关键词匹配
            const roleKeywords = ['前端', '后端', '全栈', '移动端', 'UI', 'UX', '测试', '数据库', 'DevOps', '运维', '安全', '算法', '数据', '架构', '技术', '产品', '项目', '业务', '内容', '市场', '客服', '财务', '人事', '行政', '杂项'];
            const taskKeywords = roleKeywords.filter(keyword => task.role_zh.includes(keyword));
            const memberKeywords = roleKeywords.filter(keyword => r.includes(keyword));
            return taskKeywords.some(tk => memberKeywords.includes(tk));
          });
          
          if (!roleMatch) {
            console.log('  角色不匹配，跳过');
            continue;
          }

          // 工时匹配（总可用工时）
          let availableHours: number[] = getAvailableHours(member);
          const totalAvailable = availableHours.reduce((a, b) => a + b, 0);
          console.log(`  总可用工时: ${totalAvailable}, 任务需要: ${task.estimated_hours}`);
          
          if (totalAvailable < task.estimated_hours) {
            console.log('  工时不足，跳过');
            continue;
          }

          console.log('  找到合适成员:', member.name);
          candidate = { member, availableHours };
          break; // 找到第一个合适的就分配
        }

        if (candidate) {
          console.log('分配任务给:', candidate.member.name);
          // 分配任务
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], assigned_member_id: candidate.member.id };
          }
          // 扣减成员可用工时（优先从最大可用天扣）
          let remain = task.estimated_hours;
          let hoursArr = candidate.availableHours;
          for (let i = 0; i < hoursArr.length && remain > 0; i++) {
            if (hoursArr[i] > 0) {
              let use = Math.min(hoursArr[i], remain);
              hoursArr[i] -= use;
              remain -= use;
            }
          }
          // 更新成员 available_hours
          const memberIndex = teamMembers.findIndex(m => m.id === candidate.member.id);
          if (memberIndex !== -1) {
            teamMembers[memberIndex] = { ...teamMembers[memberIndex], available_hours: hoursArr };
          }
          autoAssignments.push({ taskId: task.id, memberId: candidate.member.id });
        } else {
          console.log('没有找到合适成员');
          autoAssignments.push({ taskId: task.id, memberId: null }); // 无合适成员
        }
      }

      console.log('最终分配结果:', autoAssignments);
      console.log('=== 分配任务结束 ===\n');

      res.status(200).json({ message: '分配完成', assignments: autoAssignments });
    } catch (error) {
      console.error('自动分配任务失败', error);
      res.status(500).json({ error: '自动分配任务失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 