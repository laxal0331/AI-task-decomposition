import { NextApiRequest, NextApiResponse } from 'next';
import { chatService } from '../../lib/dbService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { orderId, taskId, role, message } = req.body;
      
      if (!orderId || !taskId || !role || !message) {
        return res.status(400).json({ error: '缺少必要参数' });
      }
      
      // 发送消息
      await chatService.sendMessage(orderId, taskId, role, message);
      
      res.status(200).json({ message: '消息发送成功' });
    } catch (error) {
      console.error('Send message error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      res.status(500).json({ 
        error: '发送消息失败', 
        details: error.message || String(error),
        code: error.code,
        hint: error.hint
      });
    }
  } else if (req.method === 'GET') {
    try {
      const { orderId, taskId } = req.query;
      
      if (!orderId || !taskId) {
        return res.status(400).json({ error: '缺少必要参数' });
      }
      
      // 获取聊天记录
      const messages = await chatService.getChatMessages(
        orderId as string, 
        taskId as string
      );
      
      res.status(200).json({ messages });
    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({ error: '获取消息失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 