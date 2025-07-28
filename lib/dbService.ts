import pool from './database';

interface Order {
  id: string;
  goal: string;
  assign_mode: string;
  task_count: number;
  status: string;
  created_at: string;
  [key: string]: unknown;
}

interface Task {
  id: string;
  order_id: string;
  title_zh: string;
  title_en: string;
  role_zh: string;
  role_en: string;
  estimated_hours: number;
  status: string;
  assigned_member_id: string | null;
  [key: string]: unknown;
}

interface TeamMember {
  id: string;
  name: string;
  name_zh: string;
  name_en: string;
  roles: string[];
  hourly_rate: number;
  speed_factor: number;
  available_hours: number[];
  skills: string[];
  experience_score: number;
  [key: string]: unknown;
}

interface ChatMessage {
  id: string;
  order_id: string;
  task_id: string;
  role: string;
  message: string;
  created_at: string;
  [key: string]: unknown;
}

// 订单相关操作
export const orderService = {
  // 创建订单
  async createOrder(orderId: string, goal: string, assignMode: string, taskCount: number = 0, lang: string = 'zh') {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO orders (id, goal, assign_mode, task_count, status, lang) VALUES (?, ?, ?, ?, ?, ?)',
        [orderId, goal, assignMode, taskCount, '待分配', lang]
      );
    } finally {
      connection.release();
    }
  },

  // 获取订单
  async getOrder(orderId: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM orders WHERE id = ?',
        [orderId]
      );
      return (rows as Order[])[0];
    } finally {
      connection.release();
    }
  },

  // 更新订单状态
  async updateOrderStatus(orderId: string, status: string) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, orderId]
      );
    } finally {
      connection.release();
    }
  },

  // 获取所有订单
  async getAllOrders() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute('SELECT * FROM orders ORDER BY created_at DESC');
      return rows;
    } finally {
      connection.release();
    }
  },

  // 删除订单
  async deleteOrder(orderId: string) {
    const connection = await pool.getConnection();
    try {
      // 由于设置了 CASCADE，删除订单会自动删除相关的任务和聊天记录
      await connection.execute(
        'DELETE FROM orders WHERE id = ?',
        [orderId]
      );
    } finally {
      connection.release();
    }
  },

  // 新增：更新订单的任务数量
  async updateOrderTaskCount(orderId: string, taskCount: number) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE orders SET task_count = ? WHERE id = ?',
        [taskCount, orderId]
      );
    } finally {
      connection.release();
    }
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
    const connection = await pool.getConnection();
    try {
      // 验证所有字段都有有效值
      const params = [
        task.id || '',
        task.orderId || '',
        task.titleZh || '',
        task.titleEn || '',
        task.roleZh || '',
        task.roleEn || '',
        task.estimatedHours || 0
      ];
      
      // 检查是否有 undefined 值
      if (params.some(param => param === undefined)) {
        throw new Error('Task data contains undefined values');
      }
      
      await connection.execute(
        `INSERT INTO tasks (id, order_id, title_zh, title_en, role_zh, role_en, estimated_hours) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        params
      );
      // 新增：插入任务后，更新订单的task_count
      const [rows] = await connection.execute(
        'SELECT COUNT(*) as count FROM tasks WHERE order_id = ?',
        [task.orderId]
      );
      const count = (rows as any)[0].count;
      await orderService.updateOrderTaskCount(task.orderId, count);
    } finally {
      connection.release();
    }
  },

  // 获取订单的所有任务
  async getTasksByOrderId(orderId: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tasks WHERE order_id = ? ORDER BY created_at ASC',
        [orderId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  // 更新任务状态
  async updateTaskStatus(taskId: string, status: string) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE tasks SET status = ? WHERE id = ?',
        [status, taskId]
      );
    } finally {
      connection.release();
    }
  },

  // 分配任务给成员
  async assignTaskToMember(taskId: string, memberId: string) {
    const connection = await pool.getConnection();
    try {
      // 只更新tasks表的assigned_member_id字段，不操作task_assignments表
      await connection.execute(
        'UPDATE tasks SET assigned_member_id = ? WHERE id = ?',
        [memberId, taskId]
      );
    } finally {
      connection.release();
    }
  },

  // 获取订单下所有任务的分配成员
  async getTaskAssignmentsByOrderId(orderId: string) {
    const connection = await pool.getConnection();
    try {
      // 查询所有任务及其分配成员
      const [rows] = await connection.execute(
        `SELECT t.id as taskId, t.title_zh, t.title_en, t.role_zh, t.role_en, t.estimated_hours, t.status, ta.member_id
         FROM tasks t
         LEFT JOIN task_assignments ta ON t.id = ta.task_id
         WHERE t.order_id = ?
         ORDER BY t.created_at ASC`,
        [orderId]
      );
      return rows;
    } finally {
      connection.release();
    }
  },

  // 获取所有任务
  async getAllTasks() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM tasks ORDER BY created_at ASC'
      );
      return rows;
    } finally {
      connection.release();
    }
  }
};

// 聊天消息相关操作
export const chatService = {
  // 发送消息
  async sendMessage(orderId: string, taskId: string, role: string, message: string) {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO chat_messages (order_id, task_id, role, message) VALUES (?, ?, ?, ?)',
        [orderId, taskId, role, message]
      );
    } finally {
      connection.release();
    }
  },

  // 获取聊天记录
  async getChatMessages(orderId: string, taskId: string) {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM chat_messages WHERE order_id = ? AND task_id = ? ORDER BY created_at ASC',
        [orderId, taskId]
      );
      return rows;
    } finally {
      connection.release();
    }
  }
};

// 数据迁移服务（从 localStorage 迁移到 MySQL）
export const migrationService = {
  // 迁移现有数据
  async migrateFromLocalStorage() {
    if (typeof window === 'undefined') return; // 只在客户端执行
    
    try {
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      for (const order of orders) {
        // 创建订单
        await orderService.createOrder(order.id, order.goal || '', order.assignMode || 'balanced');
        
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
      }
      
      console.log('Data migration completed');
    } catch (error) {
      console.error('Migration error:', error);
    }
  }
};

// 团队成员相关服务
export const teamMemberService = {
  // 批量插入成员
  async bulkInsert(members: any[]) {
    const connection = await pool.getConnection();
    try {
      const values = members.map(m => {
        const roles = Array.isArray(m.roles) ? m.roles : [m.roles];
        const skills = Array.isArray(m.skills) ? m.skills : [m.skills];
        const availableHours = Array.isArray(m.available_hours) ? m.available_hours : [m.available_hours];
        
        return [
          m.id,
          m.name,
          m.name_zh || m.name,
          m.name_en || m.name,
          JSON.stringify(roles),
          JSON.stringify(skills),
          JSON.stringify(availableHours),
          m.experience_score,
          m.hourly_rate,
          m.speed_factor
        ];
      });
      await connection.query(
        'INSERT IGNORE INTO team_members (id, name, name_zh, name_en, roles, skills, available_hours, experience_score, hourly_rate, speed_factor) VALUES ?',[values]
      );
    } finally {
      connection.release();
    }
  },
  // 查询所有成员
  async getAll() {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.query('SELECT * FROM team_members');
      return (rows as any[]).map((row: any) => {
        try {
          let availableHours: number[] = [];
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
    } finally {
      connection.release();
    }
  }
}; 