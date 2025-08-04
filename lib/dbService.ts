import { supabase } from './supabase';

// 订单相关操作
export const orderService = {
  // 创建订单
  async createOrder(orderId: string, goal: string, assignMode: string, taskCount: number = 0, lang: string = 'zh') {
    const { error } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        goal,
        assign_mode: assignMode,
        task_count: taskCount,
        status: '待分配'
      });
    
    if (error) throw error;
  },

  // 获取订单
  async getOrder(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    
    if (error) throw error;
    return data;
  },

  // 更新订单状态
  async updateOrderStatus(orderId: string, status: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);
    
    if (error) throw error;
  },

  // 获取所有订单
  async getAllOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 删除订单
  async deleteOrder(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);
    
    if (error) throw error;
  },

  // 更新订单的任务数量
  async updateOrderTaskCount(orderId: string, taskCount: number) {
    const { error } = await supabase
      .from('orders')
      .update({ task_count: taskCount })
      .eq('id', orderId);
    
    if (error) throw error;
  }
};

// 任务相关操作
export const taskService = {
  // 创建任务
  async createTask(task: {
    id: string;
    orderId: string;
    titleZh: string;
    titleEn: string;
    roleZh: string;
    roleEn: string;
    estimatedHours: number;
  }) {
    const { error } = await supabase
      .from('tasks')
      .insert({
        id: task.id,
        order_id: task.orderId,
        title_zh: task.titleZh,
        title_en: task.titleEn,
        role_zh: task.roleZh,
        role_en: task.roleEn,
        estimated_hours: task.estimatedHours,
        status: 'PENDING'
      });
    
    if (error) throw error;
  },

  // 根据订单ID获取任务
  async getTasksByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) throw error;
    return data;
  },

  // 更新任务状态
  async updateTaskStatus(taskId: string, status: string) {
    const { error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId);
    
    if (error) throw error;
  },

  // 分配任务给成员
  async assignTaskToMember(taskId: string, memberId: string) {
    const { error } = await supabase
      .from('tasks')
      .update({ assigned_member_id: memberId })
      .eq('id', taskId);
    
    if (error) throw error;
  },

  // 获取订单的任务分配
  async getTaskAssignmentsByOrderId(orderId: string) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('order_id', orderId);
    
    if (error) throw error;
    return data;
  },

  // 获取所有任务
  async getAllTasks() {
    const { data, error } = await supabase
      .from('tasks')
      .select('*');
    
    if (error) throw error;
    return data;
  }
};

// 聊天消息相关操作
export const chatService = {
  // 发送消息
  async sendMessage(orderId: string, taskId: string, role: string, message: string) {
    console.log('chatService.sendMessage 参数:', { orderId, taskId, role, message });
    
    try {
      // 注意：不要传入 id 字段，让数据库自动生成
      const insertData = {
        order_id: orderId,
        task_id: taskId,
        role,
        message
      };
      
      console.log('准备插入的数据:', insertData);
      
      const { data, error } = await supabase
        .from('chat_messages')
        .insert(insertData);
      
      console.log('Supabase 插入结果:', { data, error });
      
      if (error) {
        console.error('Supabase 插入错误:', error);
        console.error('错误详情:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }
      
      console.log('✅ 消息插入成功');
      return data;
    } catch (err) {
      console.error('❌ sendMessage 捕获错误:', err);
      throw err;
    }
  },

  // 获取聊天消息
  async getChatMessages(orderId: string, taskId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('order_id', orderId)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
  }
};

// 团队成员相关服务
export const teamMemberService = {
  // 批量插入成员
  async bulkInsert(members: any[]) {
    const { error } = await supabase
      .from('team_members')
      .upsert(members.map(m => ({
        id: m.id,
        name: m.name,
        name_zh: m.name_zh || m.name,
        name_en: m.name_en || m.name,
        roles: JSON.stringify(Array.isArray(m.roles) ? m.roles : [m.roles]),
        skills: JSON.stringify(Array.isArray(m.skills) ? m.skills : [m.skills]),
        available_hours: JSON.stringify(Array.isArray(m.available_hours) ? m.available_hours : [m.available_hours]),
        experience_score: m.experience_score,
        hourly_rate: m.hourly_rate,
        speed_factor: m.speed_factor
      })));
    
    if (error) throw error;
  },

  // 查询所有成员
  async getAll() {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('id');
    
    if (error) throw error;
    
    return data.map(row => {
      try {
        let availableHours = [];
        try {
          // 尝试解析为JSON数组
          const parsed = JSON.parse(row.available_hours || '[]');
          availableHours = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          // 如果解析失败，尝试解析为字符串格式
          if (typeof row.available_hours === 'string' && row.available_hours.includes('/')) {
            availableHours = row.available_hours.split('/').map((h: string) => parseInt(h) || 0);
          } else {
            availableHours = [40, 35, 30, 25]; // 默认值
          }
        }
        
        return {
          ...row,
          roles: JSON.parse(row.roles || '[]'),
          skills: JSON.parse(row.skills || '[]'),
          available_hours: availableHours
        };
      } catch (parseError) {
        console.error('解析成员数据失败:', parseError);
        return {
          ...row,
          roles: [],
          skills: [],
          available_hours: [40, 35, 30, 25]
        };
      }
    });
  },

  // 更新成员可用工时
  async updateMemberHours(memberId: string, availableHours: string) {
    const { error } = await supabase
      .from('team_members')
      .update({ available_hours: availableHours })
      .eq('id', memberId);
    
    if (error) throw error;
  }
}; 