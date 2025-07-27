import { NextApiRequest, NextApiResponse } from 'next';
import { orders, tasks, saveAllData, debugData } from '../../lib/dataStore';

// 直接访问全局内存存储
const globalMemoryStore: { [key: string]: any } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { orderId } = req.query;
      if (orderId) {
        console.log('查询订单详情:', orderId);
        console.log('当前订单数量:', orders.length);
        console.log('当前任务数量:', tasks.length);
        
        // 调试数据
        debugData();
        
        // 尝试从全局内存重新加载数据
        if (orders.length === 0) {
          console.log('服务器端orders为空，尝试重新加载...');
          // 这里可以添加重新加载逻辑
        }
        
        const order = orders.find(o => o.id === orderId);
        if (!order) {
          console.log('订单不存在:', orderId);
          console.log('现有订单IDs:', orders.map(o => o.id));
          return res.status(404).json({ error: '订单不存在' });
        }
        
        // 查找该订单的任务
        const orderTasks = tasks.filter(task => task.order_id === orderId);
        
        // 从 members API 获取成员数据
        const membersRes = await fetch(`${req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3001'}/api/members`);
        const membersData = await membersRes.json();
        
        res.status(200).json({
          order: order,
          tasks: orderTasks,
          members: membersData.members || [],
          selectedMembers: {}
        });
      } else {
        console.log('所有订单数量:', orders.length);
        
        res.status(200).json({ 
          orders: orders.map((o: any) => ({ ...o, task_count: o.tasks?.length || 0 })) 
        });
      }
    } catch (error) {
      console.error('获取订单失败:', error);
      res.status(500).json({ error: '获取订单失败', details: String(error) });
    }
  } else if (req.method === 'POST') {
    // 接收客户端数据同步
    try {
      const { clientOrders, clientTasks } = req.body;
      if (clientOrders && clientTasks) {
        console.log('接收到客户端数据同步:');
        console.log('- 订单数量:', clientOrders.length);
        console.log('- 任务数量:', clientTasks.length);
        
        // 更新服务器端数据
        orders.length = 0;
        orders.push(...clientOrders);
        
        tasks.length = 0;
        tasks.push(...clientTasks);
        
        // 强制更新全局内存存储
        globalMemoryStore['orders'] = clientOrders;
        globalMemoryStore['tasks'] = clientTasks;
        
        saveAllData();
        console.log('服务器端数据已更新');
        
        res.status(200).json({ message: '数据同步成功' });
      } else {
        res.status(400).json({ error: '缺少数据' });
      }
    } catch (error) {
      console.error('数据同步失败:', error);
      res.status(500).json({ error: '数据同步失败' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { orderId } = req.query;
      if (!orderId) {
        return res.status(400).json({ error: '缺少订单ID' });
      }
      
      // 从数组中删除订单
      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        saveAllData();
      }
      res.status(200).json({ message: '订单删除成功' });
    } catch (error) {
      console.error('删除订单失败:', error);
      res.status(500).json({ error: '删除订单失败', details: String(error) });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 