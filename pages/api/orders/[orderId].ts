import { NextApiRequest, NextApiResponse } from 'next';
import { orders, saveAllData } from '../../../lib/dataStore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    try {
      const { orderId } = req.query;
      const { status } = req.body;

      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders[orderIndex] = { ...orders[orderIndex], status };
        saveAllData();
      }
      res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { orderId } = req.query;
      const { status } = req.body;

      console.log('=== PATCH 订单状态更新 ===');
      console.log('收到的 orderId:', orderId);
      console.log('收到的 status:', status);
      console.log('当前服务器端 orders 数量:', orders.length);
      console.log('当前服务器端 orders IDs:', orders.map(o => o.id));
      
      // 如果服务器端没有找到订单，尝试从localStorage重新加载
      let orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        console.log('服务器端未找到订单，尝试重新加载数据...');
        
        // 尝试从请求体中获取订单数据（如果客户端发送了的话）
        const { orderData } = req.body;
        if (orderData && orderData.id === orderId) {
          console.log('从请求体获取到订单数据，直接更新');
          orders.push(orderData);
          orderIndex = orders.length - 1;
        } else {
          console.log('❌ 订单不存在，orderId:', orderId);
          console.log('❌ 可用的订单IDs:', orders.map(o => o.id));
          res.status(404).json({ error: 'Order not found' });
          return;
        }
      }
      
      console.log('找到的订单索引:', orderIndex);
      console.log('更新前订单状态:', orders[orderIndex].status);
      orders[orderIndex] = { ...orders[orderIndex], status };
      console.log('更新后订单状态:', orders[orderIndex].status);
      saveAllData();
      res.status(200).json({ success: true, message: 'Order status updated successfully' });
    } catch (error) {
      console.error('Patch order status error:', error);
      res.status(500).json({ error: 'Failed to patch order status' });
    }
    return;
  } else if (req.method === 'DELETE') {
    try {
      const { orderId } = req.query;
      console.log('删除订单请求:', orderId);

      const orderIndex = orders.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.splice(orderIndex, 1);
        saveAllData();
        console.log('订单删除成功:', orderId);
        res.status(200).json({ success: true, message: 'Order deleted successfully' });
      } else {
        console.log('订单不存在:', orderId);
        res.status(404).json({ error: 'Order not found' });
      }
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 