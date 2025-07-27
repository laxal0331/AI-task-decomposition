import { NextApiRequest, NextApiResponse } from "next";
import { getTasksFromAI } from "@/lib/openai";
import { orders, tasks, teamMembers, saveAllData, debugData } from "../../lib/dataStore";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { goal, assignMode, lang = 'zh' } = req.body;

  if (!goal) {
    return res.status(400).json({ error: "请输入目标" });
  }

  try {
    console.log('=== 开始任务分解 ===');
    console.log('目标:', goal);
    console.log('分配模式:', assignMode);
    
    // 生成任务
    const aiTasks = await getTasksFromAI(goal);
    console.log('AI生成的任务数量:', aiTasks.length);
    
    console.log('团队成员数量:', teamMembers.length);
    
    // 创建订单（带任务数量）
    const orderId = Date.now().toString();
    console.log('创建的订单ID:', orderId);
    
    // 只返回AI生成的任务，让客户端自己处理数据保存
    const tasksWithId = [];
    for (const [index, task] of aiTasks.entries()) {
      const taskId = task.id || `${orderId}_${index}`;
      
      const newTask = {
        id: taskId,
        order_id: orderId,
        title_zh: task.title_zh || task.title || '',
        title_en: task.title_en || task.title || '',
        role_zh: task.role_zh || task.role || '',
        role_en: task.role_en || task.role || '',
        estimated_hours: task.estimated_hours || 0,
        status: 'PENDING',
        assigned_member_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      tasksWithId.push(newTask);
    }
    
    console.log('AI生成任务数量:', tasksWithId.length);
    console.log('=== 任务分解完成 ===\n');
    
    // 只返回AI任务和订单ID，让客户端处理数据保存
    res.status(200).json({ 
      tasks: tasksWithId, 
      orderId,
      members: teamMembers,
      // 创建订单对象供客户端保存
      orderData: {
        id: orderId,
        goal,
        assign_mode: assignMode,
        status: '未开始',
        task_count: aiTasks.length,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      message: "任务分解完成" 
    });
  } catch (error) {
    console.error('任务分解失败:', error);
    res.status(500).json({ 
      error: "任务分解失败", 
      details: String(error) 
    });
  }
} 