import { NextApiRequest, NextApiResponse } from 'next';
import { orderService } from '../../../lib/dbService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orderId } = req.query;

  if (req.method === 'DELETE') {
    try {
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