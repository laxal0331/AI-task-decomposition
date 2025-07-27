import { NextApiRequest, NextApiResponse } from 'next';
import { tasks, saveAllData } from '../../lib/dataStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // 从localStorage读取旧数据
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      let totalTasks = 0;

      // 迁移所有订单和任务
      for (const order of orders) {
        totalTasks += order.tasks.length;
        
        // 迁移任务
        for (const task of order.tasks) {
          const taskIndex = tasks.findIndex(t => t.id === task.id);
          if (taskIndex !== -1) {
            tasks[taskIndex] = { ...tasks[taskIndex], status: task.status };
          }
          
          if (order.selectedMembers && order.selectedMembers[task._idx]) {
            const taskIndex2 = tasks.findIndex(t => t.id === task.id);
            if (taskIndex2 !== -1) {
              tasks[taskIndex2] = { ...tasks[taskIndex2], assigned_member_id: order.selectedMembers[task._idx] };
            }
          }
        }
      }

      res.status(200).json({ 
        message: '数据迁移完成', 
        ordersCount: orders.length, 
        tasksCount: totalTasks 
      });
    } catch (error) {
      console.error('Migration error:', error);
      res.status(500).json({ error: '数据迁移失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 