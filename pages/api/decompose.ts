import { NextApiRequest, NextApiResponse } from "next";
import { getTasksFromAI } from "@/lib/openai";
import { orderService, taskService, teamMemberService } from "../../lib/dbService";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { goal, assignMode, lang = 'zh' } = req.body;

  if (!goal) {
    return res.status(400).json({ error: "请输入目标" });
  }

  // 调试环境变量
  console.log("环境变量检查:");
  console.log("DEEPSEEK_API_KEY 存在:", !!process.env.DEEPSEEK_API_KEY);
  console.log("OPENAI_API_KEY 存在:", !!process.env.OPENAI_API_KEY);
  console.log("SUPABASE_URL 存在:", !!process.env.SUPABASE_URL);
  console.log("NEXT_PUBLIC_SUPABASE_URL 存在:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("SUPABASE_ANON_KEY 存在:", !!process.env.SUPABASE_ANON_KEY);
  console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY 存在:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // 检查是否有API密钥
  if (!process.env.DEEPSEEK_API_KEY && !process.env.OPENAI_API_KEY) {
    console.error("缺少API密钥配置");
    return res.status(500).json({ 
      error: "缺少API密钥配置", 
      details: "请配置DEEPSEEK_API_KEY或OPENAI_API_KEY环境变量" 
    });
  }

  try {
    console.log("开始AI任务分解，目标:", goal);
    
    // 生成任务
    const tasks = await getTasksFromAI(goal, lang);
    console.log("AI任务分解完成，任务数量:", tasks.length);
    
    // 获取所有团队成员
    const members = await teamMemberService.getAll();
    console.log("获取团队成员完成，成员数量:", members.length);
    
    // 创建订单（带任务数量）
    const orderId = Date.now().toString();
    await orderService.createOrder(orderId, goal, assignMode, tasks.length, lang);
    console.log("创建订单完成，订单ID:", orderId);
    
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
    console.log("保存任务到数据库完成");
    
    // 返回任务数据和订单ID和成员
    res.status(200).json({ 
      tasks: tasksWithId, 
      orderId,
      members,
      message: "任务已保存到数据库" 
    });
  } catch (error) {
    console.error('Decompose API error:', error);
    
    // 更详细的错误信息
    let errorMessage = "任务分解失败";
    let errorDetails = String(error);
    
    if (error instanceof Error) {
      if (error.message.includes("超时")) {
        errorMessage = "AI服务响应超时";
        errorDetails = "请稍后重试，或检查网络连接";
      } else if (error.message.includes("API Key")) {
        errorMessage = "API密钥配置错误";
        errorDetails = "请检查环境变量配置";
      } else if (error.message.includes("Supabase")) {
        errorMessage = "数据库连接错误";
        errorDetails = "请检查Supabase配置";
      }
    }
    
    // 添加更多调试信息
    console.error('错误详情:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    
    res.status(500).json({ 
      error: errorMessage, 
      details: errorDetails,
      debug: {
        message: error instanceof Error ? error.message : String(error),
        name: error instanceof Error ? error.name : undefined
      }
    });
  }
} 