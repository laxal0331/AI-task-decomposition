import { NextApiRequest, NextApiResponse } from 'next';
import { taskService } from '../../../lib/dbService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { taskId } = req.query;

  if (req.method === 'PATCH') {
    try {
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: '缺少状态参数' });
      }

      await taskService.updateTaskStatus(taskId as string, status);
      
      res.status(200).json({ message: '任务状态更新成功' });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') console.error('Update task status error:', error);
      res.status(500).json({ error: '更新任务状态失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 