import { NextApiRequest, NextApiResponse } from 'next';
import { chatMessages } from '../../lib/dataStore';

type ChatMessage = {
  id: number;
  order_id: string;
  task_id: string;
  role: string;
  message: string;
  created_at: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { orderId, taskId, role, message } = req.body;
      if (!orderId || !taskId || !role || !message) {
        return res.status(400).json({ error: '缺少必要参数' });
      }
      const newMessage: ChatMessage = {
        id: chatMessages.length + 1,
        order_id: orderId,
        task_id: taskId,
        role,
        message,
        created_at: new Date().toISOString()
      };
      chatMessages.push(newMessage);
      res.status(200).json({ message: '消息发送成功' });
    } catch (error) {
      res.status(500).json({ error: '发送消息失败', details: String(error) });
    }
  } else if (req.method === 'GET') {
    try {
      const { orderId, taskId } = req.query;
      if (!orderId || !taskId) {
        return res.status(400).json({ error: '缺少必要参数' });
      }
      const messages = chatMessages.filter(m => m.order_id === orderId && m.task_id === taskId);
      res.status(200).json({ messages });
    } catch (error) {
      res.status(500).json({ error: '获取消息失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 