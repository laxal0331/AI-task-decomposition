import { NextApiRequest, NextApiResponse } from 'next';
import { orderService, taskService, chatService } from '../../lib/dbService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 从 localStorage 读取数据
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    let migratedCount = 0;

    for (const order of orders) {
      try {
        // 创建订单
        const taskCount = order.tasks ? order.tasks.length : 0;
        await orderService.createOrder(order.id, order.goal || '', order.assignMode || 'balanced', taskCount);
        
        // 创建任务
        if (order.tasks) {
          for (const task of order.tasks) {
            await taskService.createTask({
              id: task.id,
              orderId: order.id,
              titleZh: task.title_zh || task.title || '',
              titleEn: task.title_en || task.title || '',
              roleZh: task.role_zh || task.role || '',
              roleEn: task.role_en || task.role || '',
              estimatedHours: task.estimated_hours || 0
            });
            
            // 更新任务状态
            if (task.status) {
              await taskService.updateTaskStatus(task.id, task.status);
            }
            
            // 分配成员
            if (order.selectedMembers && order.selectedMembers[task._idx]) {
              await taskService.assignTaskToMember(task.id, order.selectedMembers[task._idx]);
            }
          }
        }
        
        migratedCount++;
      } catch (error) {
        console.error(`Failed to migrate order ${order.id}:`, error);
      }
    }

    // 迁移聊天消息
    let messageCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chat_')) {
        try {
          const messages = JSON.parse(localStorage.getItem(key) || '[]');
          const [orderId, taskId] = key.replace('chat_', '').split('_');
          
          for (const msg of messages) {
            await chatService.sendMessage(orderId, taskId, msg.role, msg.text);
            messageCount++;
          }
        } catch (error) {
          console.error(`Failed to migrate chat messages for key ${key}:`, error);
        }
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `迁移完成！成功迁移 ${migratedCount} 个订单和 ${messageCount} 条消息` 
    });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ 
      error: '迁移失败', 
      details: String(error) 
    });
  }
} 