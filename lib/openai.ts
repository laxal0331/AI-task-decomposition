export async function getTasksFromAI(goal: string) {
  // 检查API密钥
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error("错误：DEEPSEEK_API_KEY 环境变量未设置");
    throw new Error("API密钥未配置，请检查环境变量设置");
  }

  try {
    console.log("开始调用DeepSeek API，目标：", goal);
    
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `你是一个项目管理专家，请将用户的项目目标拆解成开发任务列表。输出格式要求：JSON 数组，每个对象包含 "title_zh"（任务名中文）、"title_en"（任务名英文）、"role_zh"（执行角色中文）、"role_en"（执行角色英文）、"estimated_hours"（预计工时，单位小时）。所有内容都要中英文双语输出。`,
          },
          {
            role: "user",
            content: goal,
          },
        ],
        temperature: 0,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("DeepSeek API 请求失败:", res.status, errorText);
      throw new Error(`API请求失败: ${res.status} - ${errorText}`);
    }

    const json = await res.json();
    console.log("DeepSeek 原始响应：", JSON.stringify(json));

    if (!json.choices || !json.choices[0] || !json.choices[0].message) {
      console.error("DeepSeek API 响应格式错误:", json);
      throw new Error("API响应格式错误");
    }

    const reply = json.choices[0].message.content;
    console.log("AI回复内容：", reply);
    
    const cleaned = reply.replace(/```json|```/g, "").trim();
    console.log("清理后的内容：", cleaned);
    
    let tasks = JSON.parse(cleaned);
    console.log("解析后的任务：", tasks);
    
    // 自动拆分可拆分大任务为多个子环节
    const SPLIT_HOURS = 20; // 超过20小时的任务自动拆分
    const splittableRoles = ['前端工程师', '后端工程师', '测试工程师', '数据库工程师', '全栈工程师', 'DevOps工程师'];
    let newTasks = [];
    let splitIdx = 1;
    for (let t of tasks) {
      if (splittableRoles.includes(t.role_zh) && t.estimated_hours > SPLIT_HOURS) {
        let remain = t.estimated_hours;
        let part = 1;
        while (remain > 0) {
          const thisHours = Math.min(SPLIT_HOURS, remain);
          newTasks.push({
            ...t,
            title_zh: `${t.title_zh}-${part}`,
            title_en: `${t.title_en} - Part ${part}`,
            estimated_hours: thisHours,
            splittable: false // 拆分后的子任务不可再拆分
          });
          remain -= thisHours;
          part++;
        }
      } else {
        newTasks.push({ ...t, splittable: false }); // 其它任务默认不可再拆分
      }
    }
    
    console.log("最终任务列表：", newTasks);
    return newTasks;
  } catch (err) {
    console.error("AI任务拆解失败:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    throw new Error(`AI任务拆解失败: ${errorMessage}`);
  }
} 