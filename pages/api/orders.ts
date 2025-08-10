import { NextApiRequest, NextApiResponse } from 'next';
import { orderService, taskService, teamMemberService } from '../../lib/dbService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { orderId } = req.query;
      
      if (orderId) {
        // 获取特定订单
        const order = await orderService.getOrder(orderId as string);
        if (!order) {
          return res.status(404).json({ error: '订单不存在' });
        }
        
        // 获取订单的任务
        const tasks = await taskService.getTasksByOrderId(orderId as string);
        // 直接使用tasks表中的assigned_member_id字段
        const tasksWithMember = tasks.map((task: any) => ({
          ...task,
          assigned_member_id: task.assigned_member_id || null
        }));

        // 获取所有成员的最新数据
        const allMembers = await teamMemberService.getAll();
        
        res.status(200).json({
          order: {
            ...order,
            task_count: order.task_count || 0
          },
          tasks: tasksWithMember,
          members: allMembers,
          selectedMembers: {} // 不再需要selectedMembers，直接使用assigned_member_id
        });
      } else {
        // 获取所有订单
        const orders = await orderService.getAllOrders();
        res.status(200).json({ orders: orders.map((o: any) => ({ ...o, task_count: o.task_count || 0 })) });
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Get orders error:', error);
      res.status(500).json({ error: '获取订单失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 