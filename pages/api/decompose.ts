import { NextApiRequest, NextApiResponse } from "next";
import { getTasksFromAI } from "@/lib/openai";
import { orderService, taskService, teamMemberService } from "../../lib/dbService";
import { initDatabase } from "../../lib/database";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { goal, assignMode, lang = 'zh' } = req.body;

  if (!goal) {
    return res.status(400).json({ error: "请输入目标" });
  }

  // 调试环境变量
  console.log("环境变量检查:");
  console.log("DEEPSEEK_API_KEY 存在:", !!process.env.DEEPSEEK_API_KEY);
  console.log("DEEPSEEK_API_KEY 长度:", process.env.DEEPSEEK_API_KEY?.length || 0);

  try {
    // 首先初始化数据库（如果不存在）
    try {
      await initDatabase();
    } catch (dbError) {
      console.error('Database initialization error:', dbError);
      // 如果数据库初始化失败，返回错误
      return res.status(500).json({ 
        error: "数据库初始化失败，请检查MySQL连接配置", 
        details: String(dbError) 
      });
    }

    // 生成任务
    const tasks = await getTasksFromAI(goal);
    
    // 获取所有团队成员
    const members = await teamMemberService.getAll();
    
    // 创建订单（带任务数量）
    const orderId = Date.now().toString();
    await orderService.createOrder(orderId, goal, assignMode, tasks.length, lang);
    
    // 保存任务到数据库，并补充id字段
    const tasksWithId = [];
    for (const [index, task] of tasks.entries()) {
      const taskId = task.id || `${orderId}_${index}`;
      await taskService.createTask({
        id: taskId,
        orderId: orderId,
        titleZh: task.title_zh || task.title || '',
        titleEn: task.title_en || task.title || '',
        roleZh: task.role_zh || task.role || '',
        roleEn: task.role_en || task.role || '',
        estimatedHours: task.estimated_hours || 0
      });
      tasksWithId.push({ ...task, id: taskId });
    }
    
    // 返回任务数据和订单ID和成员
    res.status(200).json({ 
      tasks: tasksWithId, 
      orderId,
      members,
      message: "任务已保存到数据库" 
    });
  } catch (error) {
    console.error('Decompose API error:', error);
    res.status(500).json({ 
      error: "任务分解失败", 
      details: String(error) 
    });
  }
} 