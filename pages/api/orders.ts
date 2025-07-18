import { NextApiRequest, NextApiResponse } from 'next';
import { orderService, taskService } from '../../lib/dbService';

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
        const tasksWithMember = (tasks as any[]).map((task: any) => ({
          ...task,
          assigned_member_id: task.assigned_member_id || null
        }));
        res.status(200).json({
          order: {
            ...order,
            task_count: order.task_count || 0
          },
          tasks: tasksWithMember,
          selectedMembers: {} // 不再需要selectedMembers，直接使用assigned_member_id
        });
      } else {
        // 获取所有订单
        const orders = await orderService.getAllOrders() as any[];
        res.status(200).json({ orders: orders.map((o: any) => ({ ...o, task_count: o.task_count || 0 })) });
      }
    } catch (error) {
      console.error('Get orders error:', error);
      res.status(500).json({ error: '获取订单失败', details: String(error) });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { orderId } = req.query;
      
      if (!orderId) {
        return res.status(400).json({ error: '缺少订单ID' });
      }
      
      // 删除订单（会级联删除相关任务和聊天记录）
      await orderService.deleteOrder(orderId as string);
      
      res.status(200).json({ message: '订单删除成功' });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: '删除订单失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 